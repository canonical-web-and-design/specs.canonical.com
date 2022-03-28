# from sqlalchemy import null
import json
from datetime import datetime
import flask
from webapp.sso import init_sso


# import requests
import os

from canonicalwebteam.flask_base.app import FlaskBase
from webapp.spreasheet import get_sheet

DEPLOYMENT_ID = os.getenv(
    "DEPLOYMENT_ID",
    "AKfycbw5ph73HX2plnYE1Q03K7M8BQhlrp12Dck27bukPWCbXzBdRgP1N456fPiipR9J2H7q",
)
SPECS_API = f"https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec"

SPREADSHEET_ID = "1jFj4z19cXZaPZcZk8nPTPmeO0zBbja5Bg23eXiZr9Pw"
sheet = get_sheet()


app = FlaskBase(
    __name__,
    "webteam.canonical.com",
    template_folder="../templates",
    static_folder="../static",
)

init_sso(app)


def get_value_row(row):
    if row:
        if "userEnteredValue" in row:
            if "stringValue" in row["userEnteredValue"]:
                return row["userEnteredValue"]["stringValue"]
            if "numberValue" in row["userEnteredValue"]:
                return row["userEnteredValue"]["numberValue"]

    return ""


def get_date_value_row(row):
    if row:
        if "formattedValue" in row:
            return datetime.strptime(
                row["formattedValue"], "%m/%d/%Y %H:%M:%S"
            ).strftime("%d %b %Y")

    return ""


def index_in_list(a_list, index):
    return index < len(a_list)


def is_spec(row):
    """Check that file name exists."""

    return "userEnteredValue" in row[1]


@app.route("/")
def index():
    SHEET = "Specs"
    RANGE = "A2:M1000"
    res = sheet.get(
        spreadsheetId=SPREADSHEET_ID,
        ranges=[f"{SHEET}!{RANGE}"],
        includeGridData=True,
    ).execute()

    specs = []
    teams = []
    for row in res["sheets"][0]["data"][0]["rowData"]:
        if "values" in row and is_spec(row["values"]):
            spec = {
                "folderName": get_value_row(
                    row["values"][0]
                    if index_in_list(row["values"], 0)
                    else None
                ),
                "fileName": get_value_row(
                    row["values"][1]
                    if index_in_list(row["values"], 1)
                    else None
                ),
                "fileID": get_value_row(
                    row["values"][2]
                    if index_in_list(row["values"], 2)
                    else None
                ),
                "fileURL": get_value_row(
                    row["values"][3]
                    if index_in_list(row["values"], 3)
                    else None
                ),
                "index": get_value_row(
                    row["values"][4]
                    if index_in_list(row["values"], 4)
                    else None
                ),
                "title": get_value_row(
                    row["values"][5]
                    if index_in_list(row["values"], 5)
                    else None
                ),
                "status": get_value_row(
                    row["values"][6]
                    if index_in_list(row["values"], 6)
                    else None
                ),
                "authors": get_value_row(
                    row["values"][7]
                    if index_in_list(row["values"], 7)
                    else None
                ),
                "type": get_value_row(
                    row["values"][8]
                    if index_in_list(row["values"], 8)
                    else None
                ),
                "created": get_date_value_row(
                    row["values"][9]
                    if index_in_list(row["values"], 9)
                    else None
                ),
                "lastUpdated": get_date_value_row(
                    row["values"][10]
                    if index_in_list(row["values"], 10)
                    else None
                ),
                "numberOfComments": get_value_row(
                    row["values"][11]
                    if index_in_list(row["values"], 11)
                    else None
                ),
                "openComments": get_value_row(
                    row["values"][12]
                    if index_in_list(row["values"], 12)
                    else None
                ),
            }

            specs.append(spec)

            if spec["folderName"] and spec["folderName"] not in teams:
                teams.append(spec["folderName"])

    query = flask.request.args.get("q", "").strip()

    filtered_specs = []

    if query:
        for x in specs:
            for key, value in x.items():
                if query in str(value):
                    filtered_specs.append(x)
                    break

        specs = filtered_specs

    return flask.render_template(
        "index.html", specs=specs, teams=teams, query=query
    )

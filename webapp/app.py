import os
from datetime import datetime

import flask
from canonicalwebteam.flask_base.app import FlaskBase
from webapp.authors import parse_authors, unify_authors

from webapp.spreadsheet import get_sheet
from webapp.sso import init_sso

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


def get_value_row(row, type):
    if row:
        if type == datetime:
            if "formattedValue" in row:
                return datetime.strptime(
                    row["formattedValue"], "%m/%d/%Y %H:%M:%S"
                ).strftime("%d %b %Y")
        elif "userEnteredValue" in row:
            if "stringValue" in row["userEnteredValue"]:
                return type(row["userEnteredValue"]["stringValue"])
            if "numberValue" in row["userEnteredValue"]:
                return type(row["userEnteredValue"]["numberValue"])

    return ""


def index_in_list(a_list, index):
    return index < len(a_list)


def is_spec(row):
    """Check that file name exists."""

    return "userEnteredValue" in row[1]


def _generate_specs():
    SHEET = "Specs"
    RANGE = "A2:M1000"
    COLUMNS = [
        ("folderName", str),
        ("fileName", str),
        ("fileID", str),
        ("fileURL", str),
        ("index", str),
        ("title", str),
        ("status", str),
        ("authors", str),
        ("type", str),
        ("created", datetime),
        ("lastUpdated", datetime),
        ("numberOfComments", int),
        ("openComments", int),
    ]
    res = sheet.get(
        spreadsheetId=SPREADSHEET_ID,
        ranges=[f"{SHEET}!{RANGE}"],
        includeGridData=True,
    ).execute()
    for row in res["sheets"][0]["data"][0]["rowData"]:
        if "values" in row and is_spec(row["values"]):
            spec = {}
            for column_index in range(len(COLUMNS)):
                (column, type) = COLUMNS[column_index]
                spec[column] = get_value_row(
                    row["values"][column_index]
                    if index_in_list(row["values"], column_index)
                    else None,
                    type,
                )
            yield spec


@app.route("/")
def index():
    specs = []
    teams = set()
    for spec in _generate_specs():
        spec["authors"] = parse_authors(spec["authors"])
        if spec["folderName"]:
            teams.add(spec["folderName"])
        specs.append(spec)
    specs = unify_authors(specs)
    teams = sorted(teams)

    return flask.render_template("index.html", specs=specs, teams=teams)


@app.route("/spec/<spec_name>")
def spec(spec_name):
    for spec in _generate_specs():
        if spec_name == spec["index"]:
            return flask.redirect(spec["fileURL"])
    else:
        flask.abort(404)

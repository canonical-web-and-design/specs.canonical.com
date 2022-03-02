# from sqlalchemy import null
import json
import flask

# import requests
import os

from canonicalwebteam.flask_base.app import FlaskBase

DEPLOYMENT_ID = os.getenv(
    "DEPLOYMENT_ID",
    "AKfycbw5ph73HX2plnYE1Q03K7M8BQhlrp12Dck27bukPWCbXzBdRgP1N456fPiipR9J2H7q",
)
SPECS_API = f"https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec"

app = FlaskBase(
    __name__,
    "webteam.canonical.com",
    template_folder="../templates",
    static_folder="../static",
)


@app.route("/")
def index():
    # response = requests.get(SPECS_API)
    # data = response.json()

    # Open local file and read json
    with open("webapp/specs.json") as f:
        response = f.read()
        data = json.loads(response)

    return flask.render_template("index.html", specs=data["specs"])

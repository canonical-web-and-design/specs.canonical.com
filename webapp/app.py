import flask
from canonicalwebteam.flask_base.app import FlaskBase

app = FlaskBase(
    __name__,
    "webteam.canonical.com",
    template_folder="../templates",
    static_folder="../static",
)


@app.route("/")
def index():
    return flask.render_template("index.html")

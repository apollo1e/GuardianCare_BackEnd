# TODO: add a timeout on transcriptions to avoid blocking the server
# TODO: use whisper.cpp to transcribe the audio, find out how to serve multiple clients at once

from flask import Flask
from flask_cors import CORS
from blueprints.m5stick import m5stick_bp
from blueprints.mobile import mobile_bp
from config import *

app = Flask(__name__)
CORS(app)

app.register_blueprint(m5stick_bp, url_prefix="/m5stick")
app.register_blueprint(mobile_bp, url_prefix="/mobile")

if __name__ == '__main__':
    print(app.url_map)
    app.run(host=FLASK_HOST, port=FLASK_PORT,
            threaded=FLASK_THREADED, debug=FLASK_DEBUG)
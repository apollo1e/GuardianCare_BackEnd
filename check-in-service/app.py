# TODO: add a timeout on transcriptions to avoid blocking the server
# TODO: use whisper.cpp to transcribe the audio, find out how to serve multiple clients at once

from flask import Flask, request, Response
from flask_cors import CORS
import whisper
import os
from utils import *

app = Flask(__name__)
CORS(app)

global asr_model

@app.route('/stream', methods=['POST'])
def stream():
    data = request.get_data()
    print(f"Got {len(data)} I2S bytes")
    
    raw_file_path = './data/i2s.raw'
    with open(raw_file_path, 'ab') as f:
        f.write(data)
    
    return 'OK'

@app.route('/end_stream', methods=['POST'])
def end_stream():
    print("End of transmission")
    
    try:
        raw_file_path = './data/i2s.raw'
        with open(raw_file_path, 'rb') as f:
            raw_data = f.read()
        wav_file_path = convert_raw_to_wav(raw_data)
        os.remove(raw_file_path)
            
        print("Transcribing audio...")
        result = asr_model.transcribe(wav_file_path, language="en", fp16=False)
        transcription = result["text"]
        print("Transcription:")
        print(transcription)
        
        print("Processing transcription...")
        json_response = process_transcription(transcription)
        print("Response:")
        print(json_response)
            
        return 'OK'
        
    except Exception as e:
        print(f'Error: {str(e)}')
        return Response(f'Error: {str(e)}', status=500)

if __name__ == '__main__':
    print("Loading model...")
    asr_model = whisper.load_model("large")
    print("Model loaded!")
    app.run(host=FLASK_HOST, port=FLASK_PORT,
            threaded=FLASK_THREADED, debug=FLASK_DEBUG)

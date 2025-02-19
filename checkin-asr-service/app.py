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
    
    with open('./data/i2s.raw', 'ab') as f:
        f.write(data)
    
    return 'OK'

@app.route('/end_stream', methods=['POST'])
def end_stream():
    print("End of transmission")
    
    try:
        with open('./data/i2s.raw', 'rb') as f:
            raw_data = f.read()
        convert_raw_to_wav(raw_data)
        os.remove('./data/i2s.raw')
            
        print("Transcribing audio...")
        large_result = asr_model.transcribe("./data/audio.wav", language="en", fp16=False)
        print("Transcription:")
        print(large_result["text"])
            
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

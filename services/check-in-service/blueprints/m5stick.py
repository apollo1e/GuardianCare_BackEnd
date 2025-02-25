import os
import whisper
from flask import Blueprint, request, Response
from utils import convert_raw_to_wav, process_transcription

m5stick_bp = Blueprint('m5stick', __name__)

print("Loading model...")
asr_model = whisper.load_model("large")
print("Model loaded!")

@m5stick_bp.route('/audio/stream', methods=['POST'])
def stream():
    data = request.get_data()
    print(f"Got {len(data)} I2S bytes")
    
    raw_file_path = './data/i2s.raw'
    with open(raw_file_path, 'ab') as f:
        f.write(data)
    
    return 'OK'

@m5stick_bp.route('/audio/stop', methods=['POST'])
def end_stream():
    print("End of transmission")
    
    try:
        raw_file_path = './data/i2s.raw'
        with open(raw_file_path, 'rb') as f:
            raw_data = f.read()
        wav_file_path = convert_raw_to_wav(raw_data, gain = 7)
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

from pathlib import Path
import numpy as np
import wave
from config import *

""" Functions """
def convert_raw_to_wav(raw_data, wav_file_path="./data/audio.wav", sample_rate=M5STICK_MIC_SAMPLE_RATE, gain=M5STICK_MIC_GAIN):
    # Convert raw data to numpy array
    audio_data = np.frombuffer(raw_data, dtype=np.int16)
    
    # Apply gain
    audio_data = np.clip(audio_data * gain, -32768, 32767).astype(np.int16)
    
    with wave.open(wav_file_path, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)  # Sample rate
        wav_file.writeframes(audio_data.tobytes())
        
    return wav_file_path 
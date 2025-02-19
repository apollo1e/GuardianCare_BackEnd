import numpy as np
import wave
import json
from llama_cpp import Llama
from config import *

""" Functions """
def convert_raw_to_wav(raw_data, wav_file_path="./data/audio.wav", sample_rate=M5STICK_MIC_SAMPLE_RATE, target_sample_rate=16000, gain=M5STICK_MIC_GAIN):
    audio_data = np.frombuffer(raw_data, dtype=np.int16)
    # audio_data = librosa.resample(audio_data, orig_sr=sample_rate, target_sr=target_sample_rate)
    audio_data = np.clip(audio_data * gain, -32768, 32767).astype(np.int16)
    
    with wave.open(wav_file_path, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)  # Sample rate
        wav_file.writeframes(audio_data.tobytes())
        
    return wav_file_path

def process_transcription(transcription="I had a good with my friends today.", prompt_file_path="prompt.md"):
    try:
        with open(prompt_file_path, "r", encoding="utf-8") as f:
            system_prompt = f.read()
    except Exception as e:
        print(f"Error reading {prompt_file_path}: {e}")
        return {"error": "Failed to read prompt file"}

    # Construct full prompt
    user_prompt = f"nUser's transcription:\n\"{transcription}\""
    prompt = f"""[INST] <<SYS>>
    {system_prompt}
    <</SYS>>
    {user_prompt} [/INST]"""

    # Model parameters
    max_tokens = 100

    try:
        # Run llama.cpp with the prompt
        model = Llama(model_path=LLM_MODEL_PATH, n_ctx=2048)

        # result = subprocess.run(
        #     [LLM_BIN_PATH, "-m", LLM_MODEL_PATH, "--prompt", prompt, "--n", "256"],
        #     capture_output=True,
        #     text=True
        # )

        output = model(prompt, max_tokens=max_tokens)
        result = output["choices"][0]["text"].strip()
        
        print("LLM output:")
        print(result)
        
        return json.loads(result)  # Convert to dictionary

    except Exception as e:
        print("error")
        print(e)
        return {"error": "Failed to process LLM output"}
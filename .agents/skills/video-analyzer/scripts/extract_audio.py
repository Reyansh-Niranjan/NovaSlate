#!/usr/bin/env python3
"""
extract_audio.py — Extracts audio track, performs waveform RMS energy analysis, and detects silence.
Part of the Antigravity Video Analyzer Skill.
"""

import sys
import os
import json
import subprocess
import wave
import numpy as np

def analyze_audio(video_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    wav_path = os.path.join(out_dir, "audio.wav")
    
    # Extract audio to 16kHz mono WAV
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vn",
        "-ar", "16000",
        "-ac", "1",
        wav_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    if not os.path.exists(wav_path):
        return {"has_audio": False}
        
    with wave.open(wav_path, "rb") as wf:
        sr = wf.getframerate()
        nframes = wf.getnframes()
        raw = wf.readframes(nframes)
        audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
        
    duration = len(audio) / sr
    rms = float(np.sqrt(np.mean(audio**2)))
    peak = float(np.max(np.abs(audio)))
    
    # Silence detection (RMS < 0.01)
    chunk_dur = 0.5
    chunk_len = int(sr * chunk_dur)
    silence_segments = []
    for i in range(0, len(audio), chunk_len):
        chunk = audio[i:i+chunk_len]
        chunk_rms = np.sqrt(np.mean(chunk**2)) if len(chunk) > 0 else 0
        t_sec = i / sr
        if chunk_rms < 0.01:
            silence_segments.append(round(t_sec, 2))
            
    summary = {
        "wav_path": wav_path,
        "duration_seconds": round(duration, 2),
        "overall_rms": round(rms, 4),
        "peak_amplitude": round(peak, 4),
        "silent_timestamps_sec": silence_segments[:10]
    }
    
    with open(os.path.join(out_dir, "audio_summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
        
    return summary

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: extract_audio.py <video_path> <out_dir>"}))
        sys.exit(1)
        
    res = analyze_audio(sys.argv[1], sys.argv[2])
    print(json.dumps(res, indent=2))

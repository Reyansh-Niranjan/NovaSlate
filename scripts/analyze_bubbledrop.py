import os
import sys
import json
import numpy as np
import librosa
import soundfile as sf

AUDIO_SRC = r"C:\Users\Reyansh\Desktop\motiongraphics\public\bubbles-drop.mp3"
OUT_JSON = r"D:\NovaSlate\scripts\bubbledrop_analysis.json"

print(f"Loading {AUDIO_SRC}...")
y, sr = librosa.load(AUDIO_SRC, sr=44100)
duration = librosa.get_duration(y=y, sr=sr)
print(f"Loaded: duration = {duration:.3f}s, sr = {sr}")

# Tempo & Beats
tempo_arr, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
tempo = float(np.atleast_1d(tempo_arr)[0])
beat_times = librosa.frames_to_time(beat_frames, sr=sr)
print(f"Estimated Tempo: {tempo:.2f} BPM, Total beats: {len(beat_times)}")

# RMS Energy at 30 fps
fps = 30
hop_length = int(sr / fps)
rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop_length)[0]
times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)

# Normalize RMS robustly
p5 = np.percentile(rms, 5)
p98 = np.percentile(rms, 98)
rms_norm = np.clip((rms - p5) / max(p98 - p5, 1e-6), 0.0, 1.0)

# Spectral Onset Strength
onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length)
onset_norm = np.clip(onset_env / max(np.percentile(onset_env, 99), 1e-6), 0.0, 1.0)
onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, hop_length=hop_length)
onset_times = librosa.frames_to_time(onsets, sr=sr, hop_length=hop_length)

# Find high-energy drops / peaks
high_energy_indices = np.where(rms_norm > 0.7)[0]
print(f"High energy frames count: {len(high_energy_indices)}")

# Spectral centroid (brightness)
spec_cent = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop_length)[0]
spec_cent_norm = np.clip(spec_cent / max(np.percentile(spec_cent, 98), 1e-6), 0.0, 1.0)

# Identify bar lines (at 4/4 meter, 1 bar = 4 beats = 4 * (60 / tempo) seconds)
seconds_per_beat = 60.0 / tempo
seconds_per_bar = 4.0 * seconds_per_beat
frames_per_beat_30 = seconds_per_beat * fps
frames_per_bar_30 = seconds_per_bar * fps
print(f"Seconds per beat: {seconds_per_beat:.3f}s (~{frames_per_beat_30:.1f} frames at 30fps)")
print(f"Seconds per bar: {seconds_per_bar:.3f}s (~{frames_per_bar_30:.1f} frames at 30fps)")

# Analyze energy in 4-bar or 8-bar chunks
chunk_duration = seconds_per_bar * 4  # ~7.5 seconds per 4 bars
n_chunks = int(duration // chunk_duration)
chunks_summary = []
for i in range(n_chunks):
    t_start = i * chunk_duration
    t_end = t_start + chunk_duration
    mask = (times >= t_start) & (times < t_end)
    avg_rms = float(np.mean(rms_norm[mask])) if np.any(mask) else 0.0
    peak_rms = float(np.max(rms_norm[mask])) if np.any(mask) else 0.0
    avg_bright = float(np.mean(spec_cent_norm[mask])) if np.any(mask) else 0.0
    chunks_summary.append({
        "chunk": i,
        "time_start": round(t_start, 2),
        "time_end": round(t_end, 2),
        "avg_energy": round(avg_rms, 3),
        "peak_energy": round(peak_rms, 3),
        "brightness": round(avg_bright, 3)
    })

data = {
    "track": "CosmoMonkey - BubbleDrop",
    "source_file": AUDIO_SRC,
    "sample_rate": sr,
    "duration_seconds": round(duration, 3),
    "tempo_bpm": round(tempo, 2),
    "seconds_per_beat": round(seconds_per_beat, 4),
    "seconds_per_bar": round(seconds_per_bar, 4),
    "frames_per_beat_30fps": round(frames_per_beat_30, 2),
    "frames_per_bar_30fps": round(frames_per_bar_30, 2),
    "chunks_summary": chunks_summary,
    "beat_times_seconds": [round(float(t), 3) for t in beat_times[:160]],
    "onset_times_seconds": [round(float(t), 3) for t in onset_times[:250]],
    "rms_energy_30fps": [round(float(v), 4) for v in rms_norm[:2250]],
    "spectral_onset_30fps": [round(float(v), 4) for v in onset_norm[:2250]],
    "spectral_brightness_30fps": [round(float(v), 4) for v in spec_cent_norm[:2250]]
}

with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(f"Analysis saved to {OUT_JSON}")

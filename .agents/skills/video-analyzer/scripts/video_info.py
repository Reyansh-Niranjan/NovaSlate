#!/usr/bin/env python3
"""
video_info.py — Probes video metadata, stream info, orientation, and analysis tier.
Part of the Antigravity Video Analyzer Skill.
"""

import sys
import json
import subprocess
import shutil

def probe_video(video_path):
    ffprobe_cmd = [
        "ffprobe",
        "-v", "error",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        video_path
    ]
    
    res = subprocess.run(ffprobe_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    data = json.loads(res.stdout)
    
    format_info = data.get("format", {})
    streams = data.get("streams", [])
    
    video_stream = None
    audio_stream = None
    
    for s in streams:
        codec_type = s.get("codec_type")
        disposition = s.get("disposition", {})
        # Skip attached pics / covers
        if disposition.get("attached_pic") == 1:
            continue
        if codec_type == "video" and video_stream is None:
            video_stream = s
        elif codec_type == "audio" and audio_stream is None:
            audio_stream = s
            
    if not video_stream:
        raise ValueError("No video stream found in file")
        
    duration = float(format_info.get("duration", video_stream.get("duration", 0)))
    width = int(video_stream.get("width", 0))
    height = int(video_stream.get("height", 0))
    
    # Calculate FPS
    r_frame_rate = video_stream.get("r_frame_rate", "30/1")
    if "/" in r_frame_rate:
        num, den = map(float, r_frame_rate.split("/"))
        fps = num / den if den != 0 else 30.0
    else:
        fps = float(r_frame_rate)
        
    orientation = "portrait" if height > width else "landscape"
    grid_layout = "3x5" if orientation == "portrait" else "4x4"
    
    # Analysis tier
    if duration < 60:
        tier = "short"
        fps_rate = 2.0
    elif duration < 180:
        tier = "medium"
        fps_rate = 1.0
    elif duration < 600:
        tier = "long"
        fps_rate = 0.2
    else:
        tier = "extended"
        fps_rate = 0.05
        
    info = {
        "path": video_path,
        "duration_seconds": round(duration, 2),
        "width": width,
        "height": height,
        "native_fps": round(fps, 2),
        "orientation": orientation,
        "grid_layout": grid_layout,
        "has_audio": audio_stream is not None,
        "video_codec": video_stream.get("codec_name"),
        "audio_codec": audio_stream.get("codec_name") if audio_stream else None,
        "tier": tier,
        "recommended_sample_fps": fps_rate
    }
    
    return info

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: video_info.py <video_path>"}))
        sys.exit(1)
        
    try:
        result = probe_video(sys.argv[1])
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

#!/usr/bin/env python3
"""
extract_frames.py — Extracts sampled frames, montage grid contact sheets, and scene cut keyframes.
Part of the Antigravity Video Analyzer Skill.
"""

import sys
import os
import json
import subprocess

def extract(video_path, out_dir, sample_fps=2.0, max_frames=60, grid_layout="4x4"):
    os.makedirs(out_dir, exist_ok=True)
    frames_dir = os.path.join(out_dir, "raw_frames")
    key_dir = os.path.join(out_dir, "key_frames")
    os.makedirs(frames_dir, exist_ok=True)
    os.makedirs(key_dir, exist_ok=True)
    
    # 1. Extract sampled frames
    frame_pattern = os.path.join(frames_dir, "frame_%04d.jpg")
    cmd_frames = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", f"fps={sample_fps}",
        "-q:v", "2",
        frame_pattern
    ]
    subprocess.run(cmd_frames, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    frame_files = sorted([f for f in os.listdir(frames_dir) if f.endswith(".jpg")])
    total_frames = len(frame_files)
    
    # 2. Extract scene keyframes (visual transitions)
    key_pattern = os.path.join(key_dir, "scene_%03d.jpg")
    cmd_scenes = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", "select='gt(scene,0.25)',showinfo",
        "-vsync", "vfr",
        "-q:v", "2",
        key_pattern
    ]
    subprocess.run(cmd_scenes, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    key_files = sorted([f for f in os.listdir(key_dir) if f.endswith(".jpg")])
    
    # 3. Generate montage contact sheet grid (tile filter in ffmpeg)
    # Parse grid layout (e.g. 4x4 -> 16 tiles)
    cols, rows = map(int, grid_layout.split("x"))
    tiles_per_grid = cols * rows
    
    grid_files = []
    # Generate grids using ffmpeg tile
    grid_pattern = os.path.join(out_dir, "montage_grid_%02d.jpg")
    cmd_grid = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", f"fps={sample_fps},scale=480:-1,tile={grid_layout}",
        "-q:v", "2",
        grid_pattern
    ]
    subprocess.run(cmd_grid, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    grid_files = sorted([os.path.join(out_dir, f) for f in os.listdir(out_dir) if f.startswith("montage_grid_") and f.endswith(".jpg")])
        
    metadata = {
        "video": video_path,
        "sample_fps": sample_fps,
        "total_sampled_frames": total_frames,
        "scene_cut_count": len(key_files),
        "scene_keyframes": [os.path.join(key_dir, k) for k in key_files],
        "montage_grids": grid_files,
        "raw_frames_dir": frames_dir
    }
    
    with open(os.path.join(out_dir, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
        
    return metadata

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: extract_frames.py <video_path> <out_dir> [fps] [max_frames] [grid]"}))
        sys.exit(1)
        
    video = sys.argv[1]
    out = sys.argv[2]
    fps = float(sys.argv[3]) if len(sys.argv) > 3 else 2.0
    max_f = int(sys.argv[4]) if len(sys.argv) > 4 else 60
    grid = sys.argv[5] if len(sys.argv) > 5 else "4x4"
    
    res = extract(video, out, fps, max_f, grid)
    print(json.dumps(res, indent=2))

---
name: video-analyzer
description: Analyzes and interprets video files (.mp4, .mov, .webm, .mkv) by extracting frames, detecting scene cuts, generating montage contact sheets, and analyzing audio envelopes. Produces structured visual pacing reports, animation timing audits, and timeline breakdowns. Use when the user wants to analyze, review, critique, or inspect a video, asks to "analyze this video", "critique my video", "review the animation", or verify rendered video output.
---

# Video Analyzer Skill for Antigravity

This skill enables Antigravity to "watch", inspect, critique, and interpret video files programmatically.

## Architecture

1. **Probe**: Inspect resolution, codec, duration, native fps, and orientation.
2. **Frame Sampling**: Extract keyframes at adaptive sample rates (e.g., 2 fps or custom fps).
3. **Scene Cut Detection**: Use FFmpeg scene scoring (`gt(scene, 0.25)`) to pinpoint cuts and scene transitions.
4. **Montage Grid Sheet**: Generate tile grids (`montage_grid_01.jpg`) summarizing the entire video in a single high-resolution image that Antigravity inspects via `view_file`.
5. **Audio Envelope**: Extract waveform energy and silence markers.
6. **Visual Review**: Read the extracted keyframes and montage sheet using `view_file` to evaluate motion design, typography readability, visual hierarchy, camera pacing, and audio synchronization.

## Scripts

Located in `scripts/`:
- `python scripts/video_info.py <video_path>`
- `python scripts/extract_frames.py <video_path> <out_dir> [fps] [max_frames] [grid]`
- `python scripts/extract_audio.py <video_path> <out_dir>`

## Review Protocol

When critiquing a video (e.g. a Remotion motion graphic):
1. **Scene Transitions**: Check if cuts are abrupt or whether spatial continuity/whip zooms/parallax exist.
2. **Animation Curves**: Inspect if motion uses natural spring physics or feels like a "basic fade up".
3. **Typography**: Verify font hierarchy, contrast ratio, and reading speed across frames.
4. **Data-Density**: Ensure UI components, terminals, and charts present rich, real data rather than static filler.
5. **Audio Synchronization**: Correlate keyframe scene changes against the musical beat markers.

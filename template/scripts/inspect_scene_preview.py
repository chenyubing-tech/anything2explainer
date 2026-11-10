"""Inspect an actual rendered demo: every decoded frame, boundaries, streams and a contact sheet.

Technical evidence only. It cannot judge taste, semantic correctness or listening quality.
Run from the template directory: python scripts/inspect_scene_preview.py renders/MixedSolar.mp4
"""
import json
import math
import os
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageStat

root = Path(__file__).resolve().parents[1]
story = json.loads((root / 'src/previews/story.json').read_text(encoding='utf-8'))
video = Path(sys.argv[1]).resolve()
bin_dir = root / 'node_modules' / '@remotion' / 'compositor-win32-x64-msvc'
ff = os.environ.get('FFMPEG', str(bin_dir / 'ffmpeg.exe') if os.name == 'nt' else 'ffmpeg')
probe = os.environ.get('FFPROBE', str(bin_dir / 'ffprobe.exe') if os.name == 'nt' else 'ffprobe')
out = root / 'stills' / video.stem
out.mkdir(parents=True, exist_ok=True)
info = json.loads(subprocess.check_output([probe, '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,nb_frames,r_frame_rate', '-of', 'json', str(video)]))
stream = next(s for s in info['streams'] if s['codec_type'] == 'video')
width, height = stream['width'], stream['height']
num, den = map(int, stream['r_frame_rate'].split('/'))
fps = num / den
edges = {frame for b in story['boundaries'] for frame in [b['at'] - 10, b['at'] - 9, b['at'] - 1, b['at'], b['at'] + 8, b['at'] + 9]}
sheet = Image.new('RGB', (1920, math.ceil(math.ceil(story['totalFrames'] / 15) / 4) * 294), '#101821')
draw = ImageDraw.Draw(sheet)
decoded = out / 'decoded'
decoded.mkdir(exist_ok=True)
for previous in decoded.glob('frame_*.jpg'):
    previous.unlink()
subprocess.run([ff, '-v', 'error', '-y', '-i', str(video), '-q:v', '3', '-start_number', '0', str(decoded / 'frame_%04d.jpg')], check=True)
files = sorted(decoded.glob('frame_*.jpg'))
count, brightness = len(files), []
for index, file in enumerate(files):
    im = Image.open(file).convert('RGB')
    brightness.append(round(ImageStat.Stat(im.convert('L').resize((160, 90))).mean[0], 3))
    if index in edges or index == 0 or index == story['totalFrames'] - 1:
        im.save(out / f'frame_{index:04d}.png')
    if index % 15 == 0:
        i = index // 15
        x, y = i % 4 * 480, i // 4 * 294
        sheet.paste(im.resize((480, 270)), (x, y))
        draw.text((x + 8, y + 272), f'{index / fps:.2f}s / frame {index}', fill='white')
sheet.save(out / 'sheet.jpg')
report = {'file': str(video), 'videoFrames': count, 'fps': fps, 'videoSeconds': count / fps,
          'containerSeconds': float(info['format']['duration']), 'audioPresent': any(s['codec_type'] == 'audio' for s in info['streams']),
          'minimumFrameMean': min(brightness), 'nearBlackFrames': [i for i, v in enumerate(brightness) if v < 5],
          'boundaries': [{'at': b['at'], 'transitionStart': b['at'] - b['duration'] // 2, 'transitionEndExclusive': b['at'] + b['duration'] - b['duration'] // 2} for b in story['boundaries']],
          'scope': 'Technical decoding and frame evidence only; not a taste or listening verdict.'}
(out / 'inspection.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
assert count == story['totalFrames'], f"Expected {story['totalFrames']} video frames, decoded {count}"
assert fps == story['fps'], f'Unexpected fps {fps}'
assert report['audioPresent'], 'No audio stream'
assert not report['nearBlackFrames'], 'Near-black frames found; inspect them'
print(json.dumps(report, indent=2))

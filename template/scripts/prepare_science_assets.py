"""Download actual NASA source videos, then make short HD excerpts and a still.

Run explicitly when refreshing demo assets. Raw downloads stay in ignored audio/.
No upscaling or frame interpolation; saved metadata comes from actual output files.
"""
import concurrent.futures
import hashlib
import json
import os
import subprocess
import urllib.request
from pathlib import Path

root = Path(__file__).resolve().parents[1]
assets = root / 'public/assets/scene-demo'
raw = root / 'audio/nasa-sources'
raw.mkdir(parents=True, exist_ok=True)
bin_dir = root / 'node_modules/@remotion/compositor-win32-x64-msvc'
ff = os.environ.get('FFMPEG', str(bin_dir / 'ffmpeg.exe'))
probe = os.environ.get('FFPROBE', str(bin_dir / 'ffprobe.exe'))
sources = [
    ('solar-clip', 'GSFC_20170403_Trio_m12563_SolarFlares', 12),
    ('solar-alt', 'GSFC_20160426_SDO_m12224_SolarFlare', 10),
    ('volcano-clip', 'GSFC_20141113_Volcanoes_m10183_Degassing', 2),
    ('volcano-alt', 'GSFC_20141113_Volcanoes_m10183_Degassing_Clouds', 2),
]

def prepare(item):
    name, nasa_id, start = item
    url = f'https://images-assets.nasa.gov/video/{nasa_id}/{nasa_id}~large.mp4'
    original = raw / f'{name}-large.mp4'
    if not original.exists():
        temporary = original.with_suffix('.download')
        urllib.request.urlretrieve(url, temporary)
        temporary.replace(original)
    output = assets / f'{name}.mp4'
    subprocess.run([ff, '-v', 'error', '-y', '-ss', str(start), '-i', str(original), '-t', '6', '-an', '-c:v', 'libx264', '-crf', '19', '-pix_fmt', 'yuv420p', str(output)], check=True)
    metadata = json.loads(subprocess.check_output([probe, '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate', '-of', 'json', str(output)]))
    stream = next(s for s in metadata['streams'] if s['codec_type'] == 'video')
    if stream['width'] < 1280 or stream['height'] < 720:
        raise ValueError(f'{name}: HD source required, got {stream}')
    num, den = map(int, stream['r_frame_rate'].split('/'))
    row = {'kind': 'video', 'src': f'assets/scene-demo/{name}.mp4', 'sourceDurationSeconds': float(metadata['format']['duration']), 'sourceFps': num / den, 'width': stream['width'], 'height': stream['height'], 'sha256': hashlib.sha256(output.read_bytes()).hexdigest()}
    provenance = {'id': name, 'file': output.name, 'url': url, 'sourcePage': f'https://images.nasa.gov/details/{nasa_id}', 'credit': 'NASA / Goddard Space Flight Center', 'sourceSha256': hashlib.sha256(original.read_bytes()).hexdigest(), 'sha256': row['sha256'], 'edit': {'sourceStartSeconds': start, 'durationSeconds': 6, 'audio': 'removed', 'videoEncoding': 'H.264 CRF19; native size and fps retained'}, 'usage': 'Actual NASA media; not H3 output'}
    print(f"READY {name}: {stream['width']}x{stream['height']}, {row['sourceFps']}fps", flush=True)
    return row, provenance

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(prepare, sources))
    manifest = [r[0] for r in results]
    provenance = [r[1] for r in results]
    for topic in ['solar', 'volcano']:
        still = assets / f'{topic}.jpg'
        subprocess.run([ff, '-v', 'error', '-y', '-i', str(assets / f'{topic}-clip.mp4'), '-frames:v', '1', '-q:v', '2', str(still)], check=True)
        manifest.append({'kind': 'image', 'src': f'assets/scene-demo/{topic}.jpg'})
        provenance.append({'id': f'{topic}-still', 'file': still.name, 'derivedFrom': f'{topic}-clip.mp4', 'edit': 'First decoded frame, native resolution', 'sha256': hashlib.sha256(still.read_bytes()).hexdigest()})
    (root / 'src/previews/assets.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    (assets / 'sources.json').write_text(json.dumps(provenance, indent=2) + '\n', encoding='utf-8')

"""Validate narration windows, then mix at the caption frame times without speeding up."""
import json
import os
import subprocess
import wave
from pathlib import Path

root = Path(__file__).resolve().parents[1]
story = json.loads((root / 'src/previews/story.json').read_text(encoding='utf-8'))
voice = json.loads((root / 'audio/scene-preview/voice.json').read_text(encoding='utf-8-sig'))
ff = os.environ.get('FFMPEG', str(root / 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'))
for topic in ['solar', 'volcano']:
    lines = [v for v in voice if v['topic'] == topic]
    for i, line in enumerate(lines):
        assert line['text'] == story['captions'][topic][i]['text'], 'Narration text changed; regenerate speech first.'
        line['at'] = story['captions'][topic][i]['at']
    inputs, filters = [], []
    for i, line in enumerate(lines):
        with wave.open(line['file']) as wav:
            duration = wav.getnframes() / wav.getframerate()
        end_frame = lines[i + 1]['at'] if i + 1 < len(lines) else story['totalFrames']
        window = (end_frame - line['at']) / story['fps']
        assert duration <= window, f'{topic} sentence {i} needs {duration:.3f}s; window {window:.3f}s. Shorten copy or retime, never silently overlap.'
        line['durationSeconds'] = duration
        inputs += ['-i', line['file']]
        delay = round(line['at'] / story['fps'] * 1000)
        filters.append(f'[{i}:a]aresample=48000,adelay={delay}:all=1[a{i}]')
    filters.append(''.join(f'[a{i}]' for i in range(len(lines))) + f'amix=inputs={len(lines)}:normalize=0,apad,atrim=duration={story["totalFrames"] / story["fps"]}[out]')
    subprocess.run([ff, '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filters), '-map', '[out]', '-ac', '2', '-ar', '48000', str(root / f'public/assets/scene-demo/{topic}-narration.wav')], check=True)
    print(topic, [(v['at'], round(v['durationSeconds'], 3)) for v in lines])
(root / 'qc/narration-evidence.json').write_text(json.dumps([{k: v for k, v in line.items() if k != 'file'} for line in voice], ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

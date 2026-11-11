"""Exercise real workflow CLIs in isolated projects; no network or TTS service calls."""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent


class WorkflowToolsTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='a2e-workflow-')
        self.root = Path(self.temp.name)
        for folder in ['scripts', 'script', 'src/common', 'src/shots/G1']:
            (self.root / folder).mkdir(parents=True, exist_ok=True)
        (self.root / 'src/config.ts').write_text("export const VIDEO = {slug: 'fixture', lang: 'zh'};", encoding='utf-8')
        self.env = {**os.environ, 'PYTHONUTF8': '0', 'PYTHONIOENCODING': 'cp936'}
        self.timeline = {'total_frames': 180, 'chapters': [{'n': 1, 'from': 1}],
                         'sentences': [{'id': 'S01', 'from': 1, 'to': 90, 'text': '海水的运动',
                                        'subs': [{'from': 1}, {'from': 46}]}]}
        self.write_timeline()

    def tearDown(self):
        self.temp.cleanup()

    def write(self, name, content):
        (self.root / name).write_text(content, encoding='utf-8')

    def write_timeline(self):
        self.write('script/timeline.json', json.dumps(self.timeline, ensure_ascii=False))

    def run_tool(self, name, *args):
        shutil.copy2(SCRIPTS / name, self.root / 'scripts' / name)
        return subprocess.run([sys.executable, str(self.root / 'scripts' / name), *args],
                              cwd=self.root, env=self.env, capture_output=True, text=True, encoding='utf-8')

    def test_tts_outputs_utf8_under_cp936_default(self):
        shutil.copy2(SCRIPTS / 'tts_build.py', self.root / 'scripts/tts_build.py')
        self.write('script/narration.txt', '# CHAPTER 1 引力与海洋\n引力改变海水运动|海水为什么涨落\n')
        # Simulate the Windows legacy default on every host. The synthetic tone only exercises
        # assembly/timing/file output; it is not evidence of voice quality or an external TTS call.
        self.write('run_local.py', '''import asyncio,builtins,contextlib,importlib.util,io,json,pathlib,wave
import numpy as np
root=pathlib.Path(__file__).resolve().parent
native_open=builtins.open
def locale_open(file,mode='r',*args,**kwargs):
    if 'b' not in mode and not args and 'encoding' not in kwargs: kwargs['encoding']='cp936'
    return native_open(file,mode,*args,**kwargs)
builtins.open=locale_open
spec=importlib.util.spec_from_file_location('tts',root/'scripts/tts_build.py')
tts=importlib.util.module_from_spec(spec);spec.loader.exec_module(tts)
async def fixture(chunks,sep=''):
    duration=4.0
    x=(.2*np.sin(np.arange(int(tts.SR*duration))*2*np.pi*440/tts.SR)).astype(np.float32)
    return x,[i*duration/len(chunks) for i in range(len(chunks))],duration
tts.synth_sentence=fixture
with contextlib.redirect_stdout(io.StringIO()): asyncio.run(tts.main(str(root/'script/narration.txt')))
for name in ['script/timeline.json','script/timeline.md','src/common/subs.ts','src/common/timeline.ts']:
    assert '引力' in (root/name).read_text(encoding='utf-8'),name
tl=json.loads((root/'script/timeline.json').read_text(encoding='utf-8'))
assert tl['sentences'][0]['subs'][1]['from']-tl['sentences'][0]['subs'][0]['from']==60
with wave.open(str(root/'public/assets/fixture/audio.wav'),'rb') as wav:
    assert wav.getnchannels()==2 and wav.getframerate()==48000
    assert wav.getnframes()==tl['total_frames']*1600
print('PASS local audio assembly, subtitle times and UTF-8 artifacts')
''')
        result = subprocess.run([sys.executable, 'run_local.py'], cwd=self.root, env=self.env,
                                capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_storyboard_valid_tokens_offsets_and_large_ids(self):
        self.timeline['chapters'].append({'n': 12, 'from': 150})
        self.timeline['sentences'].append({'id': 'S100', 'from': 151, 'to': 180, 'subs': [{'from': 151}]})
        self.write_timeline()
        self.write('script/storyboard_src.md', '海洋 {S01.c2-1} {C12} {S100.to} {TOTAL}')
        result = self.run_tool('render_storyboard.py')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual((self.root / '分镜表.md').read_text(encoding='utf-8'), '海洋 45 150 180 180')

    def test_storyboard_rejects_invalid_tokens_without_overwriting(self):
        for token in ['{S01.c0}', '{S01.c3}', '{S01.star}', '{S99.from}', '{C9}', '{TOTAL.from}', '{C1.to}']:
            with self.subTest(token=token):
                self.write('分镜表.md', 'previous verified storyboard')
                self.write('script/storyboard_src.md', token)
                result = self.run_tool('render_storyboard.py')
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual((self.root / '分镜表.md').read_text(encoding='utf-8'), 'previous verified storyboard')

    def test_timing_rejects_invalid_ranges_without_overwriting(self):
        initial = 'export const CURRENT_RANGES: Record<string, ShotRange> = {\n  SC01: {from: 1, to: 30},\n};\n'
        for rows in ['| SC01 | 90–1 |', '| SC01 | 0–30 |', '| SC01 | 1–30 |\n| SC01 | 31–60 |']:
            with self.subTest(rows=rows):
                self.write('src/timing.ts', initial)
                self.write('storyboard.md', rows)
                result = self.run_tool('sync_shot_timing.py', '--storyboard', 'storyboard.md')
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual((self.root / 'src/timing.ts').read_text(encoding='utf-8'), initial)

    def test_timing_updates_valid_ranges_and_preserves_surrounding_source(self):
        self.write('src/timing.ts', '// before\nexport const CURRENT_RANGES: Record<string, ShotRange> = {\n};\n// after\n')
        self.write('storyboard.md', '| SC02 | 31–60 |\n| SC01 | 1–30 |')
        result = self.run_tool('sync_shot_timing.py', '--storyboard', 'storyboard.md')
        self.assertEqual(result.returncode, 0, result.stderr)
        text = (self.root / 'src/timing.ts').read_text(encoding='utf-8')
        self.assertTrue(text.startswith('// before\n') and text.endswith('// after\n'))
        self.assertIn('SC01: {from: 1, to: 30}', text)
        self.assertIn('SC02: {from: 31, to: 60}', text)

    def static_fixture(self, declaration="{id: 'SC01', from: 1, to: 30}"):
        self.write('分镜表.md', '## G1（第一组）\n| SC01 | 1–30 | 海洋 |\n')
        self.write('src/shots/G1/index.ts', f'export const SHOTS_G1 = [{declaration}];')

    def test_static_check_rejects_absent_shot(self):
        self.static_fixture('')
        result = self.run_tool('selfcheck.py')
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn('缺失镜头 SC01', result.stdout)

    def test_static_check_marks_dynamic_ranges_incomplete(self):
        self.static_fixture("{id: 'SC01', ...rangeFor('SC01')}")
        result = self.run_tool('selfcheck.py')
        self.assertEqual(result.returncode, 2, result.stdout + result.stderr)
        self.assertIn('INCOMPLETE SC01', result.stdout)

    def test_static_check_valid_scope_does_not_require_other_groups(self):
        self.static_fixture()
        with (self.root / '分镜表.md').open('a', encoding='utf-8') as f:
            f.write('## G2（第二组）\n| SC02 | 31–60 | 其他组 |\n')
        result = self.run_tool('selfcheck.py', 'G1')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('PASS:', result.stdout)
        self.write('分镜表.md', '## G1（第一组）\n尚无区间\n## G2（第二组）\n| SC02 | 31–60 | 其他组 |\n')
        result = self.run_tool('selfcheck.py', 'G1')
        self.assertEqual(result.returncode, 2, result.stdout + result.stderr)

    def test_static_check_returns_failure_for_range_mismatch(self):
        self.static_fixture("{id: 'SC01', from: 1, to: 40}")
        result = self.run_tool('selfcheck.py')
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)

    def test_motion_check_rejects_missing_frames(self):
        self.static_fixture()
        (self.root / 'frames').mkdir()
        result = self.run_tool('motion_check.py', '--frames', 'frames')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('INCOMPLETE', result.stderr)

    def test_motion_check_complete_short_clip(self):
        from PIL import Image
        self.static_fixture()
        (self.root / 'frames').mkdir()
        first = self.root / 'frames/f_0001.jpg'
        Image.new('RGB', (320, 180), '#8090a0').save(first)
        for i in range(2, 31):
            shutil.copy2(first, self.root / f'frames/f_{i:04d}.jpg')
        result = self.run_tool('motion_check.py', '--frames', 'frames')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('shots not checked: 0', result.stdout)

    def test_sheet_reads_utf8_timeline_and_escapes_text(self):
        from PIL import Image
        self.timeline['sentences'][0]['text'] = '海洋<script>'
        self.write_timeline()
        (self.root / 'frames').mkdir()
        Image.new('RGB', (32, 18), 'white').save(self.root / 'frames/f_0001.jpg')
        result = self.run_tool('sheet.py', 'frames', 'sheet.html')
        self.assertEqual(result.returncode, 0, result.stderr)
        text = (self.root / 'sheet.html').read_text(encoding='utf-8')
        self.assertIn('海洋&lt;script&gt;', text)


if __name__ == '__main__':
    unittest.main(verbosity=2)

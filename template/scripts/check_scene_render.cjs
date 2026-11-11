// Real browser/decoder regression. Requires an existing Chrome; never downloads a browser.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ?? (process.platform === 'win32'
  ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '');
if(!browser || !fs.existsSync(browser)) throw new Error('Set REMOTION_BROWSER_EXECUTABLE to an installed Chrome executable');
const ffmpeg = process.env.FFMPEG ?? (process.platform === 'win32'
  ? path.join(root, 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe') : 'ffmpeg');
const cli = path.join(path.dirname(require.resolve('@remotion/cli/package.json')), 'remotion-cli.js');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'a2e-render-'));
const evidence = path.join(root, 'qc/scene-render-runtime-evidence.json');
const run = (bin, args) => execFileSync(bin, args, {cwd:temp, maxBuffer:64 * 1024 * 1024, timeout:180000});
const ff = args => run(ffmpeg, ['-v','error','-y', ...args]);
const hash = data => createHash('sha256').update(data).digest('hex');
const report = {status:'NOT_RUN', scope:'Technical fixture only: real image/video/code, source trim, 2x playback, 18-frame boundaries, frozen extensions, local graphic clocks and repeatability. No audio or taste verdict.',
  createdAt:new Date().toISOString(), sourceHashes:{}};
try {
  fs.mkdirSync(path.join(temp, 'src/common'), {recursive:true});
  fs.mkdirSync(path.join(temp, 'public'));
  // Reuse the installed pinned dependencies, isolate all source and generated media.
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(temp, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  fs.copyFileSync(path.join(root, 'package.json'), path.join(temp, 'package.json'));
  for(const name of ['SceneTrack.tsx','sceneTimeline.ts','sceneTypes.ts']) {
    const data = fs.readFileSync(path.join(root, 'src/common', name));
    report.sourceHashes[name] = hash(data);
    fs.writeFileSync(path.join(temp, 'src/common', name), data);
  }
  fs.copyFileSync(path.join(root, 'src/theme.ts'), path.join(temp, 'src/theme.ts'));
  fs.copyFileSync(path.join(__dirname, 'fixtures/scene_render_fixture.tsx'), path.join(temp, 'src/audit.tsx'));
  const python = process.env.PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');
  run(python, ['-X','utf8','-c', `from pathlib import Path
from PIL import Image
p=Path('public/source-frames');p.mkdir()
Image.new('RGB',(128,72),(20,40,100)).save('public/image.png')
for i in range(90): Image.new('RGB',(128,72),(40+2*i,100,60)).save(p/f'f{i:03d}.png')
`]);
  ff(['-framerate','30','-i','public/source-frames/f%03d.png','-c:v','libx264','-crf','0','-pix_fmt','yuv444p','public/source.mp4']);
  console.log('Rendering 90 technical frames in an isolated project...');
  run(process.execPath, [cli,'bundle','src/audit.tsx','--out-dir','build_audit','--log=error']);
  const options = [`--browser-executable=${browser}`, `--gl=${process.env.REMOTION_GL ?? 'swangle'}`, '--log=error'];
  run(process.execPath, [cli,'render','build_audit','AuditSmoke','frames','--sequence','--image-format=png','--concurrency=1', ...options]);
  const files = fs.readdirSync(path.join(temp,'frames')).filter(f => f.endsWith('.png')).sort();
  assert.equal(files.length, 90);
  run(process.execPath, [cli,'still','build_audit','AuditSmoke','repeat.png','--frame=38', ...options]);
  const verified = JSON.parse(run(python, ['-X','utf8',path.join(__dirname,'fixtures/verify_scene_render.py'),temp]).toString('utf8'));
  Object.assign(report, verified, {status:'PASS', sourceVideoSha256:hash(fs.readFileSync(path.join(temp,'public/source.mp4')))});
} catch(error) {
  Object.assign(report, {status:'FAIL', error:error.message});
  if(error.stderr) console.error(error.stderr.toString());
  process.exitCode = 1;
} finally {
  fs.mkdirSync(path.dirname(evidence), {recursive:true});
  fs.writeFileSync(evidence, JSON.stringify(report,null,2) + '\n');
  // fs.rm does not traverse the dependency symlink/junction.
  fs.rmSync(temp, {recursive:true, force:true});
}
console.log(JSON.stringify(report,null,2));

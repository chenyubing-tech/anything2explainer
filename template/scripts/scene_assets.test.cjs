const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const fixtures = require('../src/previews/assets.json');
const clip = fixtures[0];

function check(manifest) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'a2e-assets-'));
  try {
    const file = path.join(folder, 'assets.json');
    fs.writeFileSync(file, JSON.stringify(manifest));
    const result = spawnSync(process.execPath, [path.join(__dirname, 'check_scene_assets.cjs'), file], {encoding:'utf8'});
    if(result.error) throw result.error;
    return result;
  } finally {
    fs.rmSync(folder, {recursive:true, force:true});
  }
}

function fails(manifest, reason) {
  const result = check(manifest);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, reason);
  assert.doesNotMatch(result.stdout, /PASS /);
}

test('actual video and image fixtures pass including uppercase SHA256', () => {
  const result = check([{...clip, sha256:clip.sha256.toUpperCase()}, fixtures[4]]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal((result.stdout.match(/PASS /g) || []).length, 2);
});

test('missing or invalid video timing never passes as verified media', () => {
  for(const field of ['sourceFps','sourceDurationSeconds']) {
    for(const value of [undefined, null, 0, -1, '30']) {
      fails([{...clip, [field]:value}], new RegExp(field));
    }
  }
});

test('invalid manifest structure and unknown media kinds fail clearly', () => {
  for(const manifest of [null, {}, [null], [{...clip, kind:'audio'}], [{...clip, kind:undefined}]]) {
    fails(manifest, /Manifest must be an array|Asset must be an object|kind must be/);
  }
});

test('empty optional metadata cannot silently bypass declared checks', () => {
  for(const metadata of [{width:0}, {height:'1080'}, {sha256:''}]) {
    fails([{...clip, ...metadata}], /positive integer|64 hexadecimal/);
  }
});

test('actual media mismatches fail instead of trusting manifest claims', () => {
  for(const [metadata, reason] of [
    [{sourceFps:24}, /fps changed/],
    [{sourceDurationSeconds:60}, /shorter than declared/],
    [{width:1280}, /dimensions changed/],
    [{sha256:'0'.repeat(64)}, /hash changed/],
  ]) fails([{...clip, ...metadata}], reason);
});

test('missing files and paths outside public are rejected', () => {
  fails([{...clip, src:'../package.json'}], /Path must stay/);
  fails([{...clip, src:'assets/not-a-real-asset.mp4'}], /File missing/);
  fails([{...clip, src:''}], /nonempty public-relative/);
});

test('code-only films explicitly skip external media verification', () => {
  const result = check([]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /SKIP: no external visual assets declared/);
  assert.doesNotMatch(result.stdout, /PASS /);
});

test('longer audio cannot disguise a short video stream', () => {
  const root = path.resolve(__dirname, '..');
  const publicDir = path.join(root, 'public');
  const folder = fs.mkdtempSync(path.join(publicDir, 'a2e-duration-'));
  const ffmpeg = process.env.FFMPEG ?? (process.platform === 'win32'
    ? path.join(root, 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe') : 'ffmpeg');
  const encode = args => {
    const result = spawnSync(ffmpeg, ['-v','error','-y', ...args], {encoding:'utf8'});
    if(result.error) throw result.error;
    assert.equal(result.status, 0, result.stderr);
  };
  try {
    const short = path.join(folder, 'short.mp4');
    const silence = path.join(folder, 'silence.raw');
    const muxed = path.join(folder, 'muxed.mp4');
    fs.writeFileSync(silence, Buffer.alloc(48000 * 2 * 2));
    encode(['-i', path.join(publicDir, clip.src), '-an','-t','0.4','-vf','scale=64:64','-c:v','libx264',short]);
    encode(['-i',short,'-f','s16le','-ar','48000','-ac','1','-i',silence,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac',muxed]);
    const asset = {kind:'video', src:path.relative(publicDir, muxed), sourceFps:30, sourceDurationSeconds:1.5};
    fails([asset], /shorter than declared/);
    const valid = check([{...asset, sourceDurationSeconds:0.4}]);
    assert.equal(valid.status, 0, valid.stderr);
    assert.match(valid.stdout, /0.400000s video/);
  } finally {
    fs.rmSync(folder, {recursive:true, force:true});
  }
});

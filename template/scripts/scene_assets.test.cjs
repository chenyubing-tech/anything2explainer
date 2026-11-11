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

const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.resolve(__dirname, '../src/common/sceneTimeline.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}});
const mod = new Module(filename, module);
mod._compile(compiled.outputText, filename);
const {compileSceneTimeline: compile, boundaryProgress: progress, clampFrame, motionAt, revealClip} = mod.exports;
const scene = (id, start, duration) => ({id, start, duration, layers: [{id: `${id}-g`, kind: 'graphic', role: 'subject', order: 0, Comp: () => null}]});
const scenes = [scene('a',0,60),scene('b',60,60),scene('c',120,60)];
const boundary = (durationFrames, preset='dissolve') => ({fromScene:'a',toScene:'b',durationFrames,preset});

test('18 means exactly 18 frames, synchronized endpoints and unchanged total duration', () => {
  const p = compile(scenes,[boundary(undefined)],180,30);
  const b=p.boundaries[0];
  assert.deepEqual([b.start,b.end,b.durationFrames],[51,69,18]);
  assert.equal(progress(51,b),0); assert.equal(progress(68,b),1);
  assert.equal(p.scenes[0].renderEnd,69); assert.equal(p.scenes[1].renderStart,51);
  assert.equal(p.totalFrames,180);
});
test('odd, zero, one frame and cut boundaries', () => {
  for(const d of [0,1,3,17]) {
    const b=compile(scenes,[boundary(d)],180,30).boundaries[0];
    assert.equal(b.end-b.start,d);
    if(d>1) {assert.equal(progress(b.start,b),0);assert.equal(progress(b.end-1,b),1);}
    else {assert.equal(progress(59,b),0);assert.equal(progress(60,b),1);}
  }
  assert.equal(compile(scenes,[boundary(18,'cut')],180,30).boundaries[0].durationFrames,0);
});
test('pre-roll and post-roll freeze at nominal ends rather than consume source frames', () => {
  assert.equal(clampFrame(51-60,60),0);
  assert.equal(clampFrame(60-60,60),0);
  assert.equal(clampFrame(68,60),59);
});
test('reject gaps, nominal overlaps, duplicate ids and incorrect coverage', () => {
  for(const invalid of [[scene('a',0,60),scene('b',61,119)],[scene('a',0,90),scene('b',60,120)],[scene('a',0,60),scene('a',60,120)]])
    assert.throws(()=>compile(invalid,[],180,30));
  assert.throws(()=>compile(scenes,[],181,30));
});
test('reject duplicate, non-adjacent, reversed and colliding transitions', () => {
  assert.throws(()=>compile(scenes,[boundary(18),boundary(18)],180,30));
  assert.throws(()=>compile(scenes,[{...boundary(18),toScene:'c'}],180,30));
  assert.throws(()=>compile(scenes,[{...boundary(18),fromScene:'b',toScene:'a'}],180,30));
  assert.throws(()=>compile(scenes,[boundary(100),{fromScene:'b',toScene:'c',durationFrames:100,preset:'reveal'}],180,30));
});
test('15/24/60 fps sources use seconds and composition fps, including playback rate', () => {
  for(const sourceFps of [15,24,60]) {
    const s=scene('video',0,90);
    s.layers=[{id:'v',kind:'video',role:'subject',order:0,src:'clip.mp4',sourceFps,sourceInSeconds:1,sourceDurationSeconds:7,playbackRate:2}];
    assert.equal(compile([s],[],90,30).totalFrames,90);
    s.layers[0].sourceDurationSeconds=6;
    assert.throws(()=>compile([s],[],90,30),/too short/);
    s.layers[0].sourceInSeconds=-1;
    assert.throws(()=>compile([s],[],90,30));
  }
});
test('motion keys interpolate channels independently and retain deterministic endpoints', () => {
  const keys=[{frame:0,scale:1,x:0},{frame:10,x:100},{frame:20,scale:2}];
  assert.equal(motionAt(10,keys).scale,1.5);
  assert.equal(motionAt(10,keys).x,100);
  assert.deepEqual(motionAt(10,keys),motionAt(10,keys));
  assert.equal(motionAt(-3,keys).scale,1); assert.equal(motionAt(99,keys).scale,2);
});
test('validate missing source and motion/beat bounds; reveal supports four directions', () => {
  const s=scene('a',0,30);s.layers=[{id:'i',kind:'image',src:'',role:'subject',order:0}];
  assert.throws(()=>compile([s],[],30,30),/missing source/);
  s.layers[0].src='image.jpg';s.camera=[{frame:30,scale:1}];assert.throws(()=>compile([s],[],30,30));
  s.camera=[];s.layers[0].contentMotion=[{frame:30,scale:1.1}];assert.throws(()=>compile([s],[],30,30));
  s.layers[0].contentMotion=[];
  s.camera=[];s.beats=[{at:25,duration:10,subject:'x',action:'move'}];assert.throws(()=>compile([s],[],30,30));
  for(const direction of ['left','right','up','down']) assert.match(revealClip(.5,direction),/50.00000%/);
});

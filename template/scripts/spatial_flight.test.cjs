const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
const filename=path.resolve(__dirname,'../src/previews/volcanoFlight.ts');
const mod=new Module(filename,module);mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));
mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
const {conduit,flightPose,tracerPosition}=mod.exports;

test('camera stays finite, faces a valid target and never jumps between flight phases',()=>{
  let previous=flightPose(0).position;
  for(let f=0;f<204;f++){
    const pose=flightPose(f);
    for(const n of [...pose.position.toArray(),...pose.target.toArray(),pose.fov])assert.ok(Number.isFinite(n));
    assert.ok(pose.position.distanceTo(pose.target)>.02);
    assert.ok(pose.position.distanceTo(previous)<2,`camera jump at ${f}`);
    assert.ok(pose.fov>=42&&pose.fov<=64);
    previous=pose.position;
  }
});
test('interior flight really moves through the three-dimensional conduit',()=>{
  const sampled=Array.from({length:1001},(_,i)=>conduit.getPointAt(i/1000));
  for(let f=58;f<146;f+=3){
    const {position}=flightPose(f);
    const nearest=Math.min(...sampled.map(p=>p.distanceTo(position)));
    assert.ok(nearest<.015,`camera outside conduit centerline at ${f}`);
  }
  assert.ok(flightPose(145).position.distanceTo(flightPose(58).position)>5);
});
test('frame evaluation is deterministic and gas exits above the mouth',()=>{
  for(const f of [0,28,58,100,146,168,203])assert.deepEqual(flightPose(f),flightPose(f));
  assert.ok(tracerPosition(168,.15).y>conduit.getPointAt(1).y);
  assert.equal(flightPose(28).volume,1);
});

const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
const story=require('../src/previews/story.json');
const filename=path.join(root,'src/previews/processTimeline.ts');
const mod=new Module(filename,module);mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));
mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,filename);
const {processState,connector,layout}=mod.exports;

test('process result begins only when transfer reaches its destination',()=>{
 const [a,b,c]=story.stageFrames;
 assert.equal(processState(a).stage,0);
 assert.equal(processState(b-1).transfer,0);
 assert.equal(processState(b).stage,1);
 assert.ok(processState(c-1).transfer<1);
 assert.equal(processState(c-1).result,0);
 assert.equal(processState(c).stage,2);
 assert.equal(processState(c).transfer,1);
 assert.equal(processState(c+36).result,1);
});
test('connector ends on the panel border and begins on the annotation',()=>{
 assert.equal(connector.fromX,layout.focus.x+layout.focus.width+2);
 assert.equal(connector.toX,layout.panel.x);
 assert.ok(connector.fromX<layout.media.x+layout.media.width);
 assert.ok(connector.toX>layout.media.x+layout.media.width);
});
test('captions and causal beats fit the registered scene plan',()=>{
 for(const topic of ['solar','volcano']){
  const captions=story.captions[topic];
  assert.equal(captions[0].at,0);
  assert.match(captions[0].text,/[？?]$/);
  captions.forEach((c,i)=>{assert.ok(c.at<story.totalFrames);if(i)assert.ok(c.at>captions[i-1].at);});
 }
 assert.ok(story.stageFrames[2]+36 < story.scenes.mixed-story.scenes.mechanism);
});

// Verify actual files and duration using Remotion's bundled ffprobe, before rendering scenes.
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname,'..');
const manifestPath = path.resolve(root,process.argv[2] ?? 'src/previews/assets.json');
const assets = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const probe = process.env.FFPROBE ?? (process.platform==='win32' ? path.join(root,'node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe') : 'ffprobe');
let failed = false;
for(const asset of assets) {
  try {
    const file=path.resolve(root,'public',asset.src);
    if(!file.startsWith(path.join(root,'public')+path.sep)) throw new Error('Path must stay in public/');
    if(!fs.existsSync(file)) throw new Error('File missing');
    if(asset.sha256 && createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==asset.sha256) throw new Error('File hash changed');
    const data=JSON.parse(execFileSync(probe,['-v','error','-show_entries','format=duration:stream=codec_type,width,height,r_frame_rate','-of','json',file],{encoding:'utf8'}));
    const video=data.streams.find(s=>s.codec_type==='video');
    if(!video?.width || !video?.height) throw new Error('No decodable visual stream');
    if((asset.width && video.width!==asset.width)||(asset.height && video.height!==asset.height)) throw new Error('Source dimensions changed');
    if(asset.kind==='video') {
      const rate=video.r_frame_rate.split('/').map(Number);
      const fps=rate[0]/rate[1];
      if(Math.abs(fps-asset.sourceFps)>.01) throw new Error(`Source fps changed: ${fps}`);
      if(Number(data.format.duration)+.001 < asset.sourceDurationSeconds) throw new Error('Source shorter than declared metadata');
    }
    console.log(`PASS ${asset.src}: ${video.width}x${video.height}, ${data.format.duration ?? 'image'}s`);
  } catch(e) {failed=true;console.error(`FAIL ${asset.src}: ${e.message}`);}
}
process.exitCode=failed?1:0;

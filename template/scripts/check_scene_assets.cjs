// Verify actual files and duration using Remotion's bundled ffprobe, before rendering scenes.
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname,'..');
const manifestPath = path.resolve(root,process.argv[2] ?? 'src/previews/assets.json');
const probe = process.env.FFPROBE ?? (process.platform==='win32' ? path.join(root,'node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe') : 'ffprobe');
const positiveNumber = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
let assets;
try {
  assets = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  if(!Array.isArray(assets)) throw new Error('Manifest must be an array');
} catch(e) {
  console.error(`FAIL manifest: ${e.message}`);
  process.exit(1);
}
if(assets.length === 0) console.log('SKIP: no external visual assets declared; media files were not checked');
let failed = false;
for(const [index, asset] of assets.entries()) {
  try {
    if(!asset || typeof asset !== 'object' || Array.isArray(asset)) throw new Error('Asset must be an object');
    if(!['image','video'].includes(asset.kind)) throw new Error('kind must be image or video');
    if(typeof asset.src !== 'string' || !asset.src.trim()) throw new Error('src must be a nonempty public-relative path');
    for(const key of ['width','height']) {
      if(asset[key] !== undefined && (!Number.isInteger(asset[key]) || asset[key] <= 0)) throw new Error(`${key} must be a positive integer`);
    }
    if(asset.sha256 !== undefined && (typeof asset.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(asset.sha256))) throw new Error('sha256 must contain 64 hexadecimal characters');
    if(asset.kind === 'video') {
      for(const key of ['sourceFps','sourceDurationSeconds']) {
        if(!positiveNumber(asset[key])) throw new Error(`${key} must be a positive finite number`);
      }
    }
    const file=path.resolve(root,'public',asset.src);
    if(!file.startsWith(path.join(root,'public')+path.sep)) throw new Error('Path must stay in public/');
    if(!fs.existsSync(file)) throw new Error('File missing');
    if(asset.sha256 && createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==asset.sha256.toLowerCase()) throw new Error('File hash changed');
    const data=JSON.parse(execFileSync(probe,['-v','error','-show_entries','format=duration:stream=codec_type,width,height,r_frame_rate,duration','-of','json',file],{encoding:'utf8'}));
    const video=data.streams.find(s=>s.codec_type==='video');
    if(!video?.width || !video?.height) throw new Error('No decodable visual stream');
    if((asset.width && video.width!==asset.width)||(asset.height && video.height!==asset.height)) throw new Error('Source dimensions changed');
    if(asset.kind==='video') {
      const rate=String(video.r_frame_rate).split('/').map(Number);
      const fps=rate[0]/rate[1];
      if(!positiveNumber(fps)) throw new Error('No valid source fps from ffprobe');
      if(Math.abs(fps-asset.sourceFps)>.01) throw new Error(`Source fps changed: ${fps}`);
      // Container duration may come from a longer audio track. Never use it as visual coverage.
      const duration=Number(video.duration);
      if(!positiveNumber(duration)) throw new Error('No valid video stream duration from ffprobe; verify or normalize the source before use');
      if(duration+.001 < asset.sourceDurationSeconds) throw new Error('Source shorter than declared metadata');
    }
    console.log(`PASS ${asset.src}: ${video.width}x${video.height}, ${asset.kind === 'video' ? `${video.duration}s video` : 'image'}`);
  } catch(e) {failed=true;console.error(`FAIL asset[${index}] ${asset?.src ?? ''}: ${e.message}`);}
}
process.exitCode=failed?1:0;

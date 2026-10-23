import {bundle} from '@remotion/bundler';
import {openBrowser,getCompositions,renderStill,renderMedia} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import net from 'node:net';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [mode='video',id='Main',destination=path.join(root,'renders/video.mp4'),range]=process.argv.slice(2);
execFileSync(process.execPath,[path.join(root,'scripts/build-audio.mjs')],{stdio:'inherit'});
// Use a free port per renderer to avoid reusing another running Remotion server.
const port=await new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
const chrome=process.env.CHROME_PATH|| (process.platform==='darwin'&&fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined);
const browser=await openBrowser('chrome',{browserExecutable:chrome,logLevel:'error'});
try{
 const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public')});
 const common={serveUrl,puppeteerInstance:browser,port,logLevel:'error'};
 const compositions=await getCompositions(serveUrl,{puppeteerInstance:browser,port});
 if(mode==='list'){console.log(JSON.stringify(compositions.map(c=>({id:c.id,width:c.width,height:c.height,fps:c.fps,durationInFrames:c.durationInFrames}))));}
 else {
 const composition=compositions.find(c=>c.id===id);if(!composition)throw Error('Unknown composition '+id);
 fs.mkdirSync(mode==='stills'?path.resolve(destination):path.dirname(path.resolve(destination)),{recursive:true});
 if(mode==='stills'){for(const frame of range.split(',').map(Number)){await renderStill({...common,composition,output:path.join(destination,`frame-${String(frame).padStart(6,'0')}.png`),frame});console.log('Frame '+frame);}}
 else if(mode==='still')await renderStill({...common,composition,output:destination,frame:Number(range||0)});
 else if(mode==='video')await renderMedia({...common,composition,outputLocation:destination,codec:'h264',audioCodec:'aac',crf:18,concurrency:Number(process.env.REMOTION_CONCURRENCY||4),...(range?{frameRange:range.split('-').map(Number)}:{}),onProgress:p=>{if(p.renderedFrames%120===0)console.log(JSON.stringify({progress:Math.round(p.progress*100),frames:p.renderedFrames}));}});
 else throw Error('Usage: render.mjs list|still|video [composition] [output] [frame|start-end]');
 }
}finally{await browser.close({silent:true});}

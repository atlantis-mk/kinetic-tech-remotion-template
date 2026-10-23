// Deterministic DSP. No speech, source-film audio, downloaded samples or music.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {content:c,video,timeline}=JSON.parse(execFileSync(process.execPath,[path.join(root,'scripts/content.cjs'),'describe'],{encoding:'utf8'}));
const presets=JSON.parse(fs.readFileSync(path.join(root,'src/cue-presets.json')));
if(!c.audio.sfx.enabled){console.log(JSON.stringify({enabled:false}));process.exit(0);}
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const dest=path.join(root,'public/audio/sfx.wav'),cache=path.join(root,'.audio-cache.json');
const key=sha(JSON.stringify([c.scenes.map(s=>[s.kind,s.duration]),c.video.fps,presets])+fs.readFileSync(fileURLToPath(import.meta.url)));
if(fs.existsSync(cache)&&fs.existsSync(dest)){const m=JSON.parse(fs.readFileSync(cache));if(m.key===key&&m.sha256===sha(fs.readFileSync(dest))){console.log(JSON.stringify({cached:true}));process.exit(0);}}
const sr=48000,n=Math.round(video.duration*sr),left=new Float32Array(n),right=new Float32Array(n);
let seed=20261023;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
let count=0;
for(let s=0;s<c.scenes.length;s++)for(const cue of presets[c.scenes[s].kind]||[]){
 const duration=Math.max(.015,cue.duration*c.scenes[s].duration),len=Math.round(duration*sr),start=Math.round((timeline[s].from/video.fps+cue.at*c.scenes[s].duration)*sr);
 let lp=0,phase=0;count++;
 for(let j=0;j<len&&j+start<n;j++){
  const t=j/sr,p=j/Math.max(1,len-1),noise=random()*2-1;lp+=.17*(noise-lp);
  const k=cue.kind,fast=['tick','tap','latch'].includes(k),hit=['impact','burst'].includes(k),air=['whoosh','flyby','page','scan','servo','scratch','bed','charge'].includes(k);
  const f=hit?110*Math.exp(-t*8):cue.pitch*(k==='tap'?Math.exp(-t*3):k==='charge'?.3+2*p:1+.2*p);
  phase+=2*Math.PI*f/sr;
  let env=fast?Math.exp(-t*(k==='tick'?55:25)):hit?Math.exp(-t*7):air?Math.sin(Math.PI*p)**.8:Math.exp(-t*7);
  env*=Math.min(1,t/.004,(duration-t)/.015);
  const tone=Math.sin(phase)+.2*Math.sin(phase*1.51);
  let x=(air?.68*lp+.12*tone:hit?.7*tone+.4*lp:fast?.6*tone+.35*(noise-lp):.65*tone+.1*lp)*env*cue.gain;
  if(k==='bed')x*=.25;
  const pan=cue.panStart+(cue.panEnd-cue.panStart)*p,angle=(Math.max(-1,Math.min(1,pan))+1)*Math.PI/4;
  left[start+j]+=x*Math.cos(angle);right[start+j]+=x*Math.sin(angle);
 }
}
// Short stereo reflections, soft saturation and peak-safe normalization.
for(const [delay,gain] of [[.043,.16],[.113,.10],[.251,.04]]){const d=Math.round(delay*sr);for(let i=n-1;i>=d;i--){left[i]+=right[i-d]*gain;right[i]+=left[i-d]*gain;}}
let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));const gain=Math.min(2,.78/Math.max(.001,peak));
const wav=Buffer.alloc(44+n*4);wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(sr,24);wav.writeUInt32LE(sr*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(n*4,40);
for(let i=0;i<n;i++){const fade=Math.min(1,(n-i)/(sr*.18));wav.writeInt16LE(Math.round(.92*Math.tanh(left[i]*gain/.92)*fade*32767),44+i*4);wav.writeInt16LE(Math.round(.92*Math.tanh(right[i]*gain/.92)*fade*32767),46+i*4);}
fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest+'.tmp',wav);fs.renameSync(dest+'.tmp',dest);fs.writeFileSync(cache,JSON.stringify({key,sha256:sha(wav)}));
console.log(JSON.stringify({events:count,duration:video.duration,sampleRate:sr,peakBeforeMaster:peak,sourceAudioUsed:false,output:dest}));

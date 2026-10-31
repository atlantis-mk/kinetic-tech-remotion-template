import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Quad, ease, fade, hash, mixQuad, path, progress, reveal} from '../math';
import {useData} from '../context';
import {WHITE, MONO, SANS, globeStyle, WorldSvg, Plane, Mono} from '../components/stage';

const finalLayer=(i:number):Quad=>[[1090-i*8,90+i*103],[1420-i*5,237+i*101],[1200-i*10,401+i*98],[880-i*8,255+i*101]];
const LayerFace:React.FC<{i:number;t:number}>=({i,t})=><svg width="800" height="600" viewBox="0 0 800 600">
  <defs><linearGradient id={'layer'+i} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#1b2153" stopOpacity=".92"/><stop offset=".5" stopColor="#111738" stopOpacity=".92"/><stop offset="1" stopColor="#303181" stopOpacity=".7"/></linearGradient><radialGradient id={'layerglow'+i}><stop stopColor="#6b63ed" stopOpacity=".4"/><stop offset="1" stopColor="#3b3287" stopOpacity="0"/></radialGradient></defs>
  <rect x="3" y="3" width="794" height="594" rx="12" fill={`url(#layer${i})`} stroke="#7172c8" strokeWidth="4"/>
  <ellipse cx="400" cy="300" rx="390" ry="280" fill={`url(#layerglow${i})`}/>
  {Array.from({length:7},(_,j)=><path key={j} d={`M${90+j*95} 65v470 M65 ${80+j*70}h670`} stroke="#6061a8" strokeWidth="1" opacity=".17"/>)}
  {Array.from({length:8},(_,j)=><rect key={j} x={90+j%4*160} y={145+Math.floor(j/4)*170} width="120" height="110" rx="9" fill="#7371e1" opacity={.1+hash(j+i*9)*.12}><title>模块</title></rect>)}
  <path d="M110 150 H350 V300 H660 M110 440 H490 V150" fill="none" stroke="#7470dc" strokeWidth="3" opacity=".3"/>
  <circle cx={230+Math.sin(t+i)*90} cy="300" r="70" fill="#7365fa" opacity=".1"/>
  <text x="38" y="560" fill="#c0c3ef" opacity=".3" fontFamily={MONO} fontSize="24">0{i+1} / SYSTEM CORE</text>
</svg>;

export const Architecture:React.FC<{t:number}>=({t})=>{
  const d=useData('architecture');
  const a=fade(t,22.35,22.7,24.9,25.12),exp=ease(progress(t,22.36,23.3)),p=progress(t,22.35,22.98);
  const start:Quad=[[960,360],[1160,450],[960,600],[760,480]];
  const titles=d.layers;
  const small=d.details;
  return <AbsoluteFill style={{opacity:a}}>
    <WorldSvg opacity={reveal(t,22.55,23.4)*.25}><ellipse cx="1080" cy="510" rx="870" ry="440" transform="rotate(-12 1080 510)" stroke="#3d4571" fill="none" strokeWidth="1.5"/></WorldSvg>
    {[4,3,2,1,0].map(i=><Plane key={i} q={mixQuad(start,finalLayer(i),exp)} w={800} h={600} opacity={.8+exp*.2}><LayerFace i={i} t={t}/></Plane>)}
    <div style={{position:'absolute',left:135,top:285,opacity:reveal(t,22.86,23.45),transform:`translateX(${(1-reveal(t,22.86,23.45))*-140}px)`}}>
      <Mono style={{display:'inline-block',background:'#7977ed',color:'#161b31',padding:'7px 14px',fontSize:19,boxShadow:'0 0 22px #7675ff55'}}>{d.eyebrow}</Mono>
      <div style={{fontFamily:SANS,fontSize:164,fontWeight:900,letterSpacing:-7,color:WHITE,lineHeight:1.16,textShadow:'0 0 17px #ffffff55'}}>{d.title}</div>
      <div style={{fontSize:54,fontWeight:900,color:'#b2b3ff',letterSpacing:1,textShadow:'0 0 12px #8984ff77'}}>{d.subtitle}</div>
      <Mono style={{marginTop:23,fontSize:22}}>{d.component}</Mono>
      <div style={{marginTop:48,width:715,background:'#091114',padding:'15px 18px',borderRadius:8,fontFamily:MONO,fontSize:22,color:'#64e7b6'}}>{d.command}<span style={{opacity:Math.sin(t*8)>0?1:.2}}>▌</span></div>
    </div>
    <WorldSvg>{titles.map((s,i)=>{const pr=reveal(t,23.35+i*.15,23.8+i*.15),y=120+i*105;return <g key={s} opacity={pr}><path d={`M${1305-i*9} ${y+20}l-28 32`} stroke="#c9cdec" strokeWidth="2"/><text x="1325" y={y+15} fill={WHITE} fontFamily={SANS} fontWeight="800" fontSize="31">0{i+1} {s}</text><text x="1325" y={y+48} fill="#7d8da3" fontFamily={MONO} fontSize="15">{small[i]}</text></g>;})}</WorldSvg>
    {p>0&&p<1&&<WorldSvg style={{...globeStyle,mixBlendMode:'screen'}}><defs><radialGradient id="burst"><stop stopColor="#eeedff" stopOpacity=".95"/><stop offset=".14" stopColor="#9c9cff" stopOpacity=".8"/><stop offset=".4" stopColor="#5456f4" stopOpacity=".32"/><stop offset="1" stopColor="#2227c8" stopOpacity="0"/></radialGradient><filter id="burst-blur"><feGaussianBlur stdDeviation="15"/></filter></defs><ellipse cx="960" cy="540" rx={180+p*650} ry={200+p*550} fill="url(#burst)" opacity={Math.sin(p*Math.PI)**1.5}/><ellipse cx="960" cy="540" rx={120+p*490} ry={38+p*155} fill="none" stroke="#aaa7ff" strokeWidth={22*(1-p)+2} opacity={Math.sin(p*Math.PI)} filter="url(#burst-blur)"/><ellipse cx="960" cy="540" rx={120+p*490} ry={38+p*155} fill="none" stroke="#e1dfff" strokeWidth="5" opacity={Math.sin(p*Math.PI)}/></WorldSvg>}
  </AbsoluteFill>;
};

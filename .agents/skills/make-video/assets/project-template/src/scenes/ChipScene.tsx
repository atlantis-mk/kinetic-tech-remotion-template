import React from 'react';
import {AbsoluteFill,Img,staticFile} from 'remotion';
import {Point, Quad, ease, fade, hash, path, progress, project, quadTrack, reveal, track} from '../math';
import {useData} from '../context';
import {WHITE, BLUE, GOLD, MONO, HEAVY, WorldSvg, Plane, Mono} from '../components/stage';

const chipQuads:Quad[]=[
  [[310,230],[1800,90],[2110,1060],[-470,1240]],
  [[528,342],[1467,210],[1737,864],[282,972]],
  [[540,375],[1410,225],[1610,810],[360,950]],
  [[579,375],[1428,207],[1623,774],[369,936]],
  [[363,453],[1062,294],[1101,855],[150,942]],
  [[258,339],[1056,258],[1108,887],[-10,927]],
  [[258,329],[1055,246],[1114,878],[-20,929]],
  [[528,342],[1467,210],[1737,864],[282,972]],
];
const chipTimes=[0,1.5,3.15,4.15,5.1,6.7,10.1,10.85];

const ActiveDie:React.FC<{t:number}>=({t})=>{
  const a=reveal(t,6.15,6.75);
  return <svg width="1200" height="900" style={{position:'absolute',inset:0}}>
    <defs>
      <linearGradient id="moving-reflection"><stop offset="0" stopColor="white" stopOpacity="0"/><stop offset=".43" stopColor="#c5d8f4" stopOpacity=".08"/><stop offset=".5" stopColor="white" stopOpacity=".26"/><stop offset=".65" stopColor="#c5d8f4" stopOpacity=".09"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient>
      <clipPath id="chip-clip"><rect x="9" y="10" width="1180" height="875" rx="21"/></clipPath>
      <clipPath id="die-clip"><rect x="185" y="175" width="398" height="512"/><rect x="619" y="175" width="398" height="512"/></clipPath>
    </defs>
    <g clipPath="url(#die-clip)" opacity={a}>
      <rect x="170" y="170" width="865" height="530" fill="#141b39" opacity=".62"/>
      {Array.from({length:22*16},(_,i)=>{
        const c=i%22,r=Math.floor(i/22);const v=hash(i+19);
        const lit=v>.73 || Math.sin(t*1.25+v*14+r*.4+c*.2)>.87;
        const opacity=lit ? .32+hash(i+4)*.52 : .09+hash(i+55)*.1;
        const x=188+c*38+(c>=11?18:0),y=177+r*32;
        return <rect key={i} x={x} y={y} width={34} height={28} fill={lit?'#7370ee':'#454f8b'} opacity={opacity}/>;
      })}
      {Array.from({length:25},(_,i)=>{const x=198+hash(i+77)*800,y=190+hash(i+140)*470;return <path key={i} d={`M${x} ${y}h${8+hash(i+63)*19}v${6+hash(i+10)*23}`} fill="none" stroke="#bbc2ff" strokeWidth="1.4" opacity={.25+.35*Math.sin(t*1.4+i)**2}/>;})}
      <rect x={track(t,[6.4,7.9,9.9],[190,900,1030],p=>p)} y="175" width="5" height="520" fill="#d7d9ff" opacity=".55"/>
    </g>
    <g clipPath="url(#chip-clip)">
      {[0,1].map(i=>{const p=(t-(i?5.85:.5))/1.25;return p<0||p>1.7?null:<rect key={i} x={-500+p*1300} y="-350" width="480" height="1700" fill="url(#moving-reflection)" transform="rotate(24 600 450)" opacity={i?.8:.62}/>;})}
    </g>
    <rect x="12" y="14" width="1174" height="870" rx="22" fill="none" stroke="#7f8790" strokeOpacity=".14" strokeWidth="2"/>
  </svg>;
};

const TimerRing:React.FC<{t:number}>=({t})=>{
  const a=fade(t,3.22,3.55,4.3,4.9);if(a<=0)return null;
  const p=progress(t,3.4,4.4),cx=1050,cy=690,rx=825,ry=525,rot=-.26;
  const pt=(angle:number,s=1):Point=>{const x=Math.cos(angle)*rx*s,y=Math.sin(angle)*ry*s;return[cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot)];};
  const curve=Array.from({length:181},(_,i)=>pt(-Math.PI/2+i/180*Math.PI*2));
  const arcCount=Math.max(2,Math.round(180*p));
  const arc=Array.from({length:arcCount},(_,i)=>pt(-Math.PI/2+i/(arcCount-1)*p*Math.PI*2));
  return <WorldSvg opacity={a}>
    <defs><filter id="ring-bloom" x="-30%" y="-50%" width="160%" height="200%"><feGaussianBlur stdDeviation="9"/></filter></defs>
    <path d={path(curve)} stroke="#6f6c62" strokeWidth="2" fill="none" opacity=".24"/>
    {Array.from({length:60},(_,i)=><path key={i} d={path([pt(-Math.PI/2+i/60*2*Math.PI,.96),pt(-Math.PI/2+i/60*2*Math.PI,i%5===0?.9:.93)])} stroke={i/60<p?GOLD:'#343a3d'} strokeWidth={i%5===0?3:1.5}/>) }
    <path d={path(arc)} fill="none" stroke={GOLD} strokeWidth="13" opacity=".65" filter="url(#ring-bloom)"/>
    <path d={path(arc)} fill="none" stroke={GOLD} strokeWidth="4"/>
    <g transform="translate(900 142) rotate(-9)"><text fontFamily={MONO} fontSize="18" fill={GOLD}>RENT / GPU HOUR</text><text y="35" fontFamily={MONO} fontSize="35" fontWeight="700" letterSpacing="6" fill={WHITE}>{String(Math.floor(p*60)).padStart(2,'0')}:00</text></g>
  </WorldSvg>;
};

const ChipAnnotations:React.FC<{q:Quad;t:number}>=({q,t})=>{
  const d=useData('chip');
  const a=fade(t,1.58,2.3,3.05,3.4);if(a<=0)return null;
  const labels=[{p:project(q,1200,900,420,400),x:150,y:366,...d.specs[0]},
    {p:project(q,1200,900,900,110),x:1430,y:257,...d.specs[1]},
    {p:project(q,1200,900,680,700),x:1430,y:785,...d.specs[2]}];
  return <WorldSvg opacity={a}>{labels.map((v,i)=>{
    const length=reveal(t,1.65+i*.16,2.35+i*.16),end:Point=[v.x+10,v.y-22];
    return <g key={i}><circle cx={v.p[0]} cy={v.p[1]} r="4" fill="#d0d5df"/><path d={path([v.p,[v.p[0]+(end[0]-v.p[0])*.35,end[1]],end])} fill="none" stroke="#6f7b8a" strokeWidth="1.6" pathLength="1" strokeDasharray="1" strokeDashoffset={1-length}/><text x={v.x} y={v.y} fill={WHITE} fontFamily={MONO} fontSize="25" fontWeight="700" opacity={length}>{v.title}</text><text x={v.x} y={v.y+25} fill="#818b98" fontFamily={MONO} fontSize="14" opacity={length}>{v.sub}</text></g>;
  })}</WorldSvg>;
};

const Price:React.FC<{t:number;type:'cost'|'revenue'}>=({t,type})=>{
  const d=useData('chip');
  const cost=type==='cost',p=reveal(t,cost?4.35:7.65,cost?5.05:8.7);if(p===0)return null;
  const col=cost?GOLD:BLUE,amount=cost?d.cost:d.revenue;
  const num=Math.round(amount*ease(p));
  return <div style={{position:'absolute',left:1155,top:cost?295:590,opacity:p,transform:`translateY(${(1-p)*70}px)`,color:col}}>
    <Mono style={{fontSize:18,color:cost?'#d7cfad':'#b1b2ed',letterSpacing:.5}}>{cost?d.costLabel:d.revenueLabel}</Mono>
    <div style={{display:'flex',alignItems:'baseline',height:cost?180:260,marginTop:4}}>
      <div style={{fontFamily:HEAVY,fontWeight:900,fontSize:cost?188:265,lineHeight:1,letterSpacing:-9,textShadow:cost?'0 0 22px #ffb83266':'0 0 9px #c8c7ff, 0 0 30px #8582ffcc, 0 0 72px #645aff99',filter:`blur(${(1-p)*8}px)`}}>{d.currency}{num}</div>
      <span style={{fontSize:32,marginLeft:23,color:'#bcc0d0',whiteSpace:'nowrap'}}>{d.unit}</span>
    </div>
    <div style={{display:'flex',gap:4,marginTop:cost?8:13}}>{Array.from({length:cost?8:12},(_,i)=><div key={i} style={{width:cost?17:18,height:cost?13:10,backgroundColor:col,opacity:.95-i*.035,boxShadow:`0 0 8px ${col}`}}/>)}</div>
  </div>;
};

export const ChipScene:React.FC<{t:number}>=({t})=>{
  const d=useData('chip');
  const q=quadTrack(t,chipTimes,chipQuads);
  const a=1-reveal(t,10.48,10.9);
  return <AbsoluteFill style={{opacity:a,filter:t>10.45?`blur(${progress(t,10.45,10.9)*7}px)`:'none'}}>
    <TimerRing t={t}/>
    <WorldSvg><path d={path([q[3],q[2],[q[2][0],q[2][1]+14],[q[3][0],q[3][1]+17]],true)} fill="#020305" stroke="#141922" strokeWidth="2"/></WorldSvg>
    <Plane q={q}><Img src={staticFile(d.surface)} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/><ActiveDie t={t}/></Plane>
    <ChipAnnotations q={q} t={t}/>
    <Price t={t} type="cost"/><Price t={t} type="revenue"/>
    <div style={{position:'absolute',left:128,top:112,opacity:fade(t,5.88,6.25,10.1,10.5),background:'#7976ee',padding:'8px 16px',fontFamily:MONO,fontSize:20,color:'#13162a',boxShadow:'0 0 18px #6968ff55'}}>{d.badge}</div>
  </AbsoluteFill>;
};

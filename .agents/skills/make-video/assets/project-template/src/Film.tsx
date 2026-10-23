import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Point, Quad, clamp, ease, fade, hash, lerp, matrix3d, mixQuad, path, progress, project, quadTrack, reveal, scaleQuad, smooth, track} from './math';
import {CostGraph} from './Extension';
import {useData} from './context';

const WHITE='var(--fg)', BLUE='var(--accent)', GOLD='var(--highlight)';
const MONO='"SFMono-Regular", Menlo, monospace';
const SANS='Arial, "PingFang SC", sans-serif';
const HEAVY='"Arial Black", Arial, "PingFang SC", sans-serif';
const globeStyle:React.CSSProperties={position:'absolute',inset:0,width:1920,height:1080};
const WorldSvg:React.FC<React.SVGProps<SVGSVGElement>>=props=><svg width={1920} height={1080} viewBox="0 0 1920 1080" style={globeStyle} {...props}/>;
const Plane:React.FC<{q:Quad;w?:number;h?:number;opacity?:number;children:React.ReactNode}>=({q,w=1200,h=900,opacity=1,children})=><div style={{position:'absolute',left:0,top:0,width:w,height:h,transformOrigin:'0 0',transform:matrix3d(q,w,h),opacity,backfaceVisibility:'hidden'}}>{children}</div>;
const Mono:React.FC<{children:React.ReactNode;style?:React.CSSProperties}>=({children,style})=><div style={{fontFamily:MONO,fontSize:20,letterSpacing:1.1,color:'#a1a8ae',...style}}>{children}</div>;

export const Background:React.FC<{t:number}>=({t})=><AbsoluteFill style={{backgroundColor:'#020709'}}>
  <WorldSvg>
    <defs><radialGradient id="environment"><stop offset="0" stopColor="#101723" stopOpacity=".18"/><stop offset="1" stopColor="#020709" stopOpacity="0"/></radialGradient></defs>
    <ellipse cx="1000" cy="560" rx="1000" ry="610" fill="url(#environment)"/>
    {Array.from({length:42},(_,i)=>{const x=hash(i+30)*1920+Math.sin(t*.14+i)*5,y=hash(i+90)*1080;const a=.05+hash(i+700)*.12;return <g key={i} opacity={a} stroke="#929fab" strokeWidth="1"><path d={`M${x-4} ${y}h8 M${x} ${y-4}v8`}/></g>;})}
  </WorldSvg>
</AbsoluteFill>;

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


const DataWall:React.FC<{t:number}>=({t})=>{
  const d=useData('percentage');
  const ref=useRef<HTMLCanvasElement>(null);
  const orangeIndices=new Set(Array.from({length:70*29},(_,i)=>i).sort((a,b)=>hash(a+12)-hash(b+12)).slice(0,Math.round(2030*(1-d.value/100))));
  useLayoutEffect(()=>{
    const ctx=ref.current?.getContext('2d');if(!ctx)return;
    ctx.clearRect(0,0,1500,840);
    const build=progress(t,12.85,14.45),paint=progress(t,14.98,16.3);
    for(let r=0;r<29;r++)for(let c=0;c<70;c++){
      const i=r*70+c,jitter=hash(r+170)*.15;
      const local=clamp((build*1.25-c/70-jitter)*16);
      if(local<=0)continue;
      const coloured=clamp((paint*1.2-c/70)*25);
      const orange=orangeIndices.has(i),l=.42+hash(i+37)*.58;
      const base=[245*l,252*l,255*l],colour=orange?[255,164,35]:[75,68,191];
      const rgb=base.map((v,k)=>Math.round(lerp(v,colour[k],coloured)));
      ctx.globalAlpha=local*(coloured? .6+hash(i)*.4: .45+hash(i)*.55);
      ctx.fillStyle=`rgb(${rgb.join(',')})`;
      ctx.fillRect(c*21.4+1.5,r*28.7+1.5,17.8,23.6);
      if(orange&&coloured>.95&&hash(i)>.5){ctx.globalAlpha=.15;ctx.fillStyle=getComputedStyle(ref.current!).getPropertyValue('--highlight').trim()||'#ffb832';ctx.fillRect(c*21.4-3,r*28.7-2,26,31);}
    }
    ctx.globalAlpha=1;
    if(paint>0&&paint<1){const x=paint*1.2*1500;ctx.fillStyle='#b1b2ff';ctx.shadowColor='#8582ff';ctx.shadowBlur=14;ctx.fillRect(x,0,6,840);ctx.shadowBlur=0;}
  },[t,d.value]);
  const q=quadTrack(t,[12.8,14.3,17.3,18.9],[ [[1120,270],[2380,340],[2380,790],[1120,850]],[[780,236],[2100,317],[2100,838],[780,905]],[[690,215],[2010,325],[2010,850],[690,935]],[[690,215],[2010,325],[2010,850],[690,935]] ]);
  return <Plane q={q} w={1500} h={840}><canvas ref={ref} width={1500} height={840} style={{display:'block'}}/></Plane>;
};

export const PercentScene:React.FC<{t:number}>=({t})=>{
  const d=useData('percentage');
  const a=fade(t,10.76,11.18,18.65,18.92);
  const move=reveal(t,12.65,13.55),font=lerp(390,258,move),x=lerp(510,110,move),y=lerp(280,284,move);
  const p=progress(t,14.95,16.45),num=t<14.95?'??':String(Math.round(d.value*ease(p))).padStart(2,'0');
  return <AbsoluteFill style={{opacity:a}}>
    <WorldSvg opacity={1-move}><g opacity=".1" stroke="#404b58" strokeWidth="2">{Array.from({length:24},(_,i)=><path key={i} d={`M870 ${230+i*25}h${380+hash(i)*380}`}/>)}</g></WorldSvg>
    <DataWall t={t}/>
    <div style={{position:'absolute',left:x,top:y,color:'#eeeafb',fontFamily:HEAVY,fontWeight:900,fontSize:font,lineHeight:1,letterSpacing:-12,textShadow:t>15?'0 0 9px #b0b2ff88, 0 0 27px #8582ff66':'0 0 20px #c6b9ff55',transform:`translateX(${t<11.3?Math.sin(t*140)*(1-reveal(t,10.95,11.3))*9:0}px)`}}>{num}<span style={{fontSize:font*.95}}>%</span></div>
    <Mono style={{position:'absolute',left:move>.5?115:845,top:move>.5?550:680,fontSize:move>.5?19:25,opacity:.8}}>{move>.5?d.label:d.teaser}</Mono>
    <div style={{position:'absolute',left:120,top:628,width:570,fontSize:48,fontWeight:900,WebkitTextStroke:'1px',color:WHITE,opacity:reveal(t,16.48,17.15),textShadow:'0 0 12px #ffffff55'}}>{d.conclusion}</div>
    <div style={{position:'absolute',left:704,top:148,display:'flex',gap:40,fontFamily:MONO,fontSize:27,opacity:reveal(t,16.3,16.9)}}><span style={{color:'#b0adff'}}>■ {d.legend[0]}</span><span style={{color:GOLD}}>■ {d.legend[1]}</span></div>
  </AbsoluteFill>;
};

const CubeFace:React.FC<{locked?:boolean;dark?:boolean;id:string}>=({locked=false,dark=false,id})=>{const d=useData('system');return <svg width="600" height="600" viewBox="0 0 600 600">
  <defs><linearGradient id={id+'-bg'} x1="0" y1="0" x2="1" y2="1"><stop stopColor={dark?'#060a12':'#111923'}/><stop offset=".6" stopColor="#0b111a"/><stop offset="1" stopColor="#030609"/></linearGradient><linearGradient id={id+'-shine'}><stop stopColor="white" stopOpacity="0"/><stop offset=".5" stopColor="white" stopOpacity=".17"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient><filter id={id+'-bloom'}><feGaussianBlur stdDeviation="9"/></filter></defs>
  <rect x="2" y="2" width="596" height="596" fill={`url(#${id}-bg)`} stroke="#7373a5" strokeWidth="4"/>
  {Array.from({length:30},(_,i)=><path key={i} d={`M32 ${75+i*14}h536`} stroke="#b2bbcd" strokeWidth="1" opacity=".055"/>)}
  <text x="40" y="49" fill="#dde2ef" fontSize="24" fontWeight="700" fontFamily={MONO}>{locked?d.brand:d.systemLabel}</text>
  <text x="40" y="73" fill="#8992a4" fontSize="10" fontFamily={MONO}>PRODUCTION INFRASTRUCTURE · INTERNAL</text>
  {Array.from({length:7},(_,i)=><g key={i}><rect x={40+i*77} y="520" width="58" height="28" rx="3" fill="#02060a" stroke="#303849" strokeWidth="1"/><circle cx={52+i*77} cy="571" r="3" fill={i%2?BLUE:'#333d4e'}/></g>)}
  {locked&&<g transform="translate(60 90) scale(.8)"><g opacity=".3" filter={`url(#${id}-bloom)`}><path d="M232 265 V192 A68 68 0 0 1 368 192 V265" fill="none" stroke="white" strokeWidth="18"/><rect x="204" y="254" width="192" height="166" rx="20" fill="white"/></g><path d="M232 265 V192 A68 68 0 0 1 368 192 V265" fill="none" stroke="#f9f9ef" strokeWidth="18"/><rect x="204" y="254" width="192" height="166" rx="20" fill="#fafaf3"/><path d="M300 315v52" stroke="#b6b7ba" strokeWidth="8"/><circle cx="300" cy="312" r="13" fill="#b6b7ba"/></g>}
</svg>;};

const Cube:React.FC<{t:number}>=({t})=>{
  const assembly=reveal(t,19.83,21.1),edge=reveal(t,21.3,22.25),q1:Quad=[[965,240],[710,385],[680,730],[965,630]],q2:Quad=[[965,240],[1210,390],[1240,730],[965,630]],q3:Quad=[[680,730],[965,630],[1240,730],[960,815]];
  const shift=(q:Quad,x:number,y:number):Quad=>q.map(([a,b])=>[a+x*(1-assembly),b+y*(1-assembly)]) as Quad;
  const spin=Math.sin((t-20)*.8)*8;
  const faces=[shift(q3,80,220),shift(q2,260,25),shift(q1,-240,50)];
  const alpha=reveal(t,19.85,20.35)*(1-reveal(t,22.35,22.7));
  return <AbsoluteFill style={{opacity:alpha,transform:`translateY(${spin}px)`}}>
    {faces.map((q,i)=><Plane key={i} q={q} w={600} h={600}><CubeFace locked={i===2} dark={i===0} id={'cube'+i}/><div style={{position:'absolute',inset:0,background:`linear-gradient(${120+i*30}deg, transparent 20%, rgba(240,246,255,${.08+edge*.22}) 47%, transparent 65%)`,transform:`translateX(${(Math.sin(t*1.3)*30)}px)`}}/></Plane>)}
    <WorldSvg opacity={edge*.75}>{faces.map((q,i)=><path key={i} d={path(q,true)} fill="none" stroke="#a0a0ee" strokeWidth="2"/>)}</WorldSvg>
  </AbsoluteFill>;
};

export const DateScene:React.FC<{t:number}>=({t})=>{
  const d=useData('system');
  const a=fade(t,18.82,19.08,22.4,22.75),up=reveal(t,19.65,20.22),font=lerp(175,80,up);
  const p=progress(t,18.93,19.62),value=p>=1?d.date:[Math.floor(lerp(90,Number(d.date.slice(0,2)),p)),Math.floor(lerp(98,Number(d.date.slice(3)),p))].map(n=>String(n).padStart(2,'0')).join('.');
  return <AbsoluteFill style={{opacity:a}}>
    <div style={{position:'absolute',top:lerp(400,75,up),left:0,width:1920,display:'flex',justifyContent:'center',gap:10,transform:`scale(${1+Math.sin(p*Math.PI)*.03})`}}>
      {value.split('').map((ch,i)=><div key={i} style={{background:ch==='.'?'transparent':'linear-gradient(135deg,#1d2529,#0a1014)',width:ch==='.'?font*.22:font*.68,height:font*1.18,fontFamily:HEAVY,fontSize:font,lineHeight:1.12,textAlign:'center',color:WHITE,textShadow:'0 0 18px #ffffff55',borderRadius:4,boxShadow:ch==='.'?'none':'0 0 20px #777b8811'}}>{ch}</div>)}
    </div>
    <Mono style={{position:'absolute',top:345,opacity:(1-up)*reveal(t,19.2,19.5),width:'100%',textAlign:'center'}}>{d.yearLabel}</Mono>
    <Cube t={t}/>
  </AbsoluteFill>;
};

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

const Network:React.FC<{t:number}>=({t})=>{
  const d=useData('chapters');
  const c:Point=[350,580],angles=[-2.7,-1.8,-.8,.1,1,2];
  const names=d.nodes;
  const orbit=reveal(t,29.3,30.3);
  return <svg width="700" height="800" style={{position:'absolute',inset:0}}>
    <defs><radialGradient id="network-node"><stop stopColor="#7e7cff"/><stop offset=".3" stopColor="#6665ff" stopOpacity=".8"/><stop offset="1" stopColor="#4444ff" stopOpacity="0"/></radialGradient></defs>
    {angles.map((a,i)=>{const p=reveal(t,27.95+i*.14,28.7+i*.14),x=c[0]+Math.cos(a)*225,y=c[1]+Math.sin(a)*132;return <g key={i} opacity={p}><path d={`M350 580 L${lerp(350,x,p)} ${lerp(580,y,p)}`} stroke="#4a5479" strokeWidth="1.7"/><circle cx={x} cy={y} r="4" fill="#f3f2f8"/><text x={x} y={y-17} fill="#9099b3" fontSize="17" textAnchor="middle" fontFamily={SANS}>{names[i]}</text></g>;})}
    <ellipse cx="350" cy="605" rx="228" ry="76" fill="none" stroke="#6b72a5" strokeWidth="1.7" opacity={orbit*.8} pathLength="1" strokeDasharray="1" strokeDashoffset={1-orbit}/>
    <circle cx="350" cy="580" r="80" fill="url(#network-node)" opacity={reveal(t,27.75,28.2)}/><circle cx="350" cy="580" r="28" fill="#7774fa" opacity={reveal(t,27.8,28.3)}/><text x="350" y="587" textAnchor="middle" fill="#292961" fontSize="18" fontFamily={MONO} opacity={reveal(t,27.9,28.3)}>{d.center}</text>
  </svg>;
};

const ChapterCard:React.FC<{n:number;t:number}>=({n,t})=>{
  const d=useData('chapters');
  const active=n===1?reveal(t,26.8,27.5):reveal(t,31.15,31.9);
  const card=d.cards[n-1],line1=card.title;
  const p1=reveal(t,27.35,28.25),p2=reveal(t,29,29.85);
  return <div style={{position:'relative',width:700,height:800,overflow:'hidden',borderRadius:22,background:'linear-gradient(135deg,#0a0f19,#080d17)',border:`${n===1?3:2}px solid ${n===1?`rgba(120,115,255,${.12+active*.82})`:t>31.1?`rgba(255,184,50,${.18+active*.72})`:'#202630'}`,boxShadow:n===1?`inset 0 0 80px #171a3a22, 0 0 ${active*12}px #7772ff22`:'none'}}>
    <svg width="700" height="800" style={{position:'absolute',inset:0}}><text x="44" y="185" fontFamily={HEAVY} fontSize="169" fontWeight="900" fill="#080d17" stroke={n===1?'#6469cb':t>31.1?'#c0923b':'#323b4b'} strokeWidth="2">0{n}</text></svg>
    <Mono style={{position:'absolute',left:246,top:75,fontSize:17,color:n===1?'#9096aa':'#46505c'}}>PART 0{n} · {card.eyebrow}</Mono>
    {n===1&&<>
      <div style={{position:'absolute',left:45,top:245,width:640,fontSize:61,fontWeight:900,WebkitTextStroke:'1px',color:WHITE,lineHeight:1.45,textShadow:'0 0 13px #ffffff44',clipPath:`inset(0 ${(1-p1)*100}% 0 0)`}}>{line1}</div>
      <div style={{position:'absolute',left:45,top:335,width:635,fontSize:48,fontWeight:900,WebkitTextStroke:'.6px',color:WHITE,lineHeight:1.45,clipPath:`inset(0 ${(1-p2)*100}% 0 0)`}}>{card.line}<span style={{color:'#a4a0ff'}}>{card.emphasis}</span></div>
      <Network t={t}/>
    </>}
    {n===2&&<>
      <div style={{position:'absolute',left:45,top:245,width:640,fontSize:61,fontWeight:900,WebkitTextStroke:'1px',color:WHITE,lineHeight:1.45,textShadow:'0 0 13px #ffffff44',clipPath:`inset(0 ${(1-reveal(t,31.8,32.65))*100}% 0 0)`}}>{card.title}</div>
      <div style={{position:'absolute',left:45,top:335,width:635,fontSize:48,fontWeight:900,WebkitTextStroke:'.6px',color:WHITE,lineHeight:1.45,clipPath:`inset(0 ${(1-reveal(t,32.9,33.7))*100}% 0 0)`}}>{card.line}<span style={{color:'#a4a0ff'}}>{card.emphasis}</span></div>
      <CostGraph t={t}/>
    </>}
    <div style={{position:'absolute',left:-200+progress(t,25.8+n*.2,26.6+n*.2)*1200,top:0,width:160,height:850,background:'linear-gradient(90deg,transparent,rgba(204,216,255,.06),transparent)',transform:'rotate(-15deg)',opacity:t<27?1:0}}/>
    {n===2&&t>30.85&&t<32&&<div style={{position:'absolute',left:-200+progress(t,30.9,31.75)*1200,top:0,width:190,height:850,background:'linear-gradient(90deg,transparent,rgba(204,216,255,.09),transparent)',transform:'rotate(-15deg)'}}/>}
  </div>;
};

export const Chapters:React.FC<{t:number}>=({t})=>{
  const a=reveal(t,25,25.6)*(1-reveal(t,34.85,35.13)),focus=reveal(t,26.85,27.65),second=reveal(t,30.85,31.75);
  const initial1:Quad=[[237,171],[930,150],[936,843],[231,834]],final1:Quad=[[363,120],[1194,67],[1200,924],[351,889]];
  const initial2:Quad=[[984,135],[1698,150],[1700,825],[984,843]],final2:Quad=[[1260,86],[2040,80],[2040,924],[1260,900]];
  const shifted1:Quad=[[-180,60],[638,54],[635,943],[-180,943]],shifted2:Quad=[[699,54],[1551,117],[1563,891],[699,933]];
  return <AbsoluteFill style={{opacity:a}}>
    <Plane q={mixQuad(mixQuad(initial2,final2,focus),shifted2,second)} w={700} h={800} opacity={lerp(1-focus*.52,1,second)}><ChapterCard n={2} t={t}/></Plane>
    <Plane q={mixQuad(mixQuad(initial1,final1,focus),shifted1,second)} w={700} h={800} opacity={1-second*.55}><ChapterCard n={1} t={t}/></Plane>
  </AbsoluteFill>;
};

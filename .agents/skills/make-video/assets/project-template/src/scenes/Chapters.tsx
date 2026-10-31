import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Point, Quad, lerp, mixQuad, path, progress, reveal} from '../math';
import {useData} from '../context';
import {WHITE, GOLD, MONO, SANS, HEAVY, Plane, Mono} from '../components/stage';

export const CostGraph:React.FC<{t:number}>=({t})=>{
  const d=useData('chapters');
  const a=reveal(t,31.85,32.45),p=progress(t,33.45,34.72);
  const points:Point[]=[[74,455],[172,455],[172,510],[287,510],[287,560],[402,560],[402,610],[515,610],[515,650],[570,650]];
  const lengths=points.slice(1).map((v,i)=>Math.hypot(v[0]-points[i][0],v[1]-points[i][1]));
  let distance=p*lengths.reduce((sum,v)=>sum+v,0),tip:Point=points[points.length-1];
  for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]){const u=distance/lengths[i];tip=[lerp(points[i][0],points[i+1][0],u),lerp(points[i][1],points[i+1][1],u)];break;}distance-=lengths[i];}
  return <svg width="700" height="800" style={{position:'absolute',inset:0,opacity:a}}>
    <defs><filter id="cost-line-glow"><feGaussianBlur stdDeviation="5"/></filter></defs>
    <text x="74" y="425" fontFamily={MONO} fontSize="18" fill="#8a95aa">{d.graphLabel}</text>
    <path d="M74 447 V710 H625" fill="none" stroke="#536073" strokeWidth="1.7"/>
    {Array.from({length:5},(_,i)=><g key={i} opacity={reveal(t,32.4+i*.1,32.9+i*.1)}><circle cx={170+i*104} cy="709" r="15" fill="#101723" stroke="#728099" strokeWidth="1.4"/><text x={170+i*104} y="715" textAnchor="middle" fontSize="13" fill="#a9b0c1" fontFamily={MONO}>0{i+1}</text></g>)}
    <path d={path(points)} fill="none" stroke={GOLD} strokeWidth="11" filter="url(#cost-line-glow)" opacity=".5" pathLength="1" strokeDasharray="1" strokeDashoffset={1-p}/>
    <path d={path(points)} fill="none" stroke={t>34.65?'#b5adff':GOLD} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset={1-p}/>
    <circle cx={tip[0]} cy={tip[1]} r="4" fill={GOLD}/>
  </svg>;
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

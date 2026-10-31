import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Point, fade, hash, path, reveal, track} from '../math';
import {useData} from '../context';
import {GOLD, MONO, SANS, Svg} from '../components/stage';

const NeuralField:React.FC<{t:number}>=({t})=>{
  const a=fade(t,38.8,39.8,40.7,41);
  const points=Array.from({length:29},(_,i):Point=>[730+hash(i+335)*920,710+hash(i+506)*260]);
  return <Svg opacity={a*.85}>
    {points.map((v,i)=><g key={i}>{points.slice(i+1).map((b,j)=>Math.hypot(v[0]-b[0],v[1]-b[1])<215?<path key={j} d={path([v,b])} stroke="#777daa" strokeWidth="1" opacity=".45"/>:null)}<circle cx={v[0]+Math.sin(t*.4+i)*3} cy={v[1]} r={i%4?3:5} fill="#b6b4ff"/></g>)}
    <text x="1560" y="710" fill="#8c8eb0" fontFamily={MONO} fontSize="17">MODEL · NEURAL NETWORK</text>
  </Svg>;
};

export const ThesisScene:React.FC<{t:number}>=({t})=>{
  const d=useData('thesis');
  const a=fade(t,35.55,36,40.72,41.04),cx=960,cy=410,r=265;
  const point=(theta:number,rr:number):Point=>[cx+Math.cos(theta)*rr,cy+Math.sin(theta)*rr];
  const arc=Array.from({length:65},(_,i)=>point((-164+i/64*148)*Math.PI/180,r));
  const angle=track(t,[35.8,36.5,37.55,38.25,38.9,40.8],[-Math.PI/2,-Math.PI/2,-.5,-1.84,-Math.PI/2,-Math.PI/2]);
  const tip=point(angle,205),line1=reveal(t,36.05,37.85),line2=reveal(t,38.82,40.23),strike=reveal(t,40.38,40.72);
  return <AbsoluteFill style={{opacity:a}}>
    <NeuralField t={t}/>
    <Svg>
      <defs><linearGradient id="gauge-spectrum"><stop stopColor="#7773ff"/><stop offset=".55" stopColor="#d2b16c"/><stop offset="1" stopColor="#ef6549"/></linearGradient><filter id="needle-glow"><feGaussianBlur stdDeviation="5"/></filter></defs>
      <path d={path(arc)} fill="none" stroke="url(#gauge-spectrum)" strokeWidth="9"/>
      {Array.from({length:27},(_,i)=>{const theta=(-164+i/26*148)*Math.PI/180;return <path key={i} d={path([point(theta,r-14),point(theta,r-(i%5===0?43:30))])} fill="none" stroke="#78808b" strokeWidth={i%5?1.8:3} opacity=".7"/>;})}
      <text x="624" y="332" fill="#aaa4ff" fontFamily={SANS} fontSize="24">{d.low}</text><text x="1240" y="332" fill="#e67458" fontFamily={SANS} fontSize="24">{d.high}</text>
      <path d={path([[cx,cy],tip])} stroke="white" strokeWidth="10" filter="url(#needle-glow)" opacity=".6"/><path d={path([[cx,cy],tip])} stroke="#fcfff8" strokeWidth="6"/><circle cx={cx} cy={cy} r="13" fill="#fafdf7"/>
    </Svg>
    <div style={{position:'absolute',top:458,left:0,width:1920,textAlign:'center'}}><div style={{display:'inline-block',fontSize:116,fontWeight:900,WebkitTextStroke:'1px',letterSpacing:-3,lineHeight:1.35,textShadow:'0 0 18px #ffffff55',clipPath:`inset(0 ${(1-line1)*100}% 0 0)`}}>{d.prefix}<span style={{color:GOLD,textShadow:'0 0 24px #ffb83266'}}>{d.highlight}</span></div></div>
    <div style={{position:'absolute',top:640,left:0,width:1920,textAlign:'center',fontSize:44,color:'#a0a6aa',opacity:reveal(t,38.02,38.7)}}>{d.bridge}</div>
    <div style={{position:'absolute',top:745,left:320,width:1410,fontSize:128,fontWeight:900,WebkitTextStroke:'1px',letterSpacing:-4,lineHeight:1.35,textShadow:'0 0 15px #ffffff44',clipPath:`inset(0 ${(1-line2)*100}% 0 0)`}}><span style={{color:'#a19aff'}}>{d.negative}</span>{d.statement}</div>
    <Svg><path d={`M822 836 H${822+strike*840}`} stroke="#ee616c" strokeWidth="9" opacity={strike}/></Svg>
  </AbsoluteFill>;
};

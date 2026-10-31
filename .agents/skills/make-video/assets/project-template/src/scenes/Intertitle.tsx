import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Quad, fade, path, track} from '../math';
import {useData} from '../context';
import {WHITE, MONO, SANS, Svg, Plane} from '../components/stage';

export const Intertitle:React.FC<{t:number}>=({t})=>{
  const d=useData('intertitle');
  const a=fade(t,40.9,41.18,42.6,42.96),scale=track(t,[40.9,41.5,42.9],[1.07,1,1]);
  return <AbsoluteFill style={{opacity:a,transform:`scale(${scale})`}}>
    {[4,3,2,1,0].map(i=>{
      const q:Quad=[[900-i*25,275+i*108],[1215-i*10,245+i*107],[1175-i*13,515+i*106],[790-i*22,555+i*105]];
      return <Plane key={i} q={q} w={800} h={600} opacity={.12+i*.025}><svg width="800" height="600"><rect x="3" y="3" width="794" height="594" rx="10" fill="#1e2052" stroke="#7370bd" strokeWidth="3"/>{Array.from({length:6},(_,j)=><rect key={j} x={90+j%3*200} y={110+Math.floor(j/3)*220} width="150" height="150" rx="12" fill="#4d49a9" opacity=".27"/>)}</svg></Plane>;
    })}
    <div style={{position:'absolute',top:303,left:0,width:1920,textAlign:'center',fontFamily:MONO,fontSize:19,letterSpacing:2,color:'#9aa1b4'}}>{d.eyebrow}</div>
    <div style={{position:'absolute',top:350,left:0,width:1920,textAlign:'center',fontFamily:SANS,fontSize:224,fontWeight:900,letterSpacing:-7,color:WHITE,textShadow:'0 0 22px #ffffff66'}}>{d.title}</div>
    <div style={{position:'absolute',top:620,left:0,width:1920,textAlign:'center',fontSize:49,fontWeight:900,color:'#b1b2ff',textShadow:'0 0 17px #9993ff88'}}>{d.subtitle}</div>
    <Svg><path d="M579 611 H1342" stroke="#5d5fa7" strokeWidth="2"/></Svg>
    {t<41.2&&<div style={{position:'absolute',top:350,left:10,width:1920,textAlign:'center',fontFamily:SANS,fontSize:224,fontWeight:900,letterSpacing:-7,color:'#b2ffce',mixBlendMode:'screen',opacity:.4}}>{d.title}</div>}
  </AbsoluteFill>;
};

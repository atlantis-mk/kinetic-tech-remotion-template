import React from 'react';
import {AbsoluteFill} from 'remotion';
import {hash} from '../math';
import {WorldSvg} from './stage';

export const Background:React.FC<{t:number}>=({t})=><AbsoluteFill style={{backgroundColor:'#020709'}}>
  <WorldSvg>
    <defs><radialGradient id="environment"><stop offset="0" stopColor="#101723" stopOpacity=".18"/><stop offset="1" stopColor="#020709" stopOpacity="0"/></radialGradient></defs>
    <ellipse cx="1000" cy="560" rx="1000" ry="610" fill="url(#environment)"/>
    {Array.from({length:42},(_,i)=>{const x=hash(i+30)*1920+Math.sin(t*.14+i)*5,y=hash(i+90)*1080;const a=.05+hash(i+700)*.12;return <g key={i} opacity={a} stroke="#929fab" strokeWidth="1"><path d={`M${x-4} ${y}h8 M${x} ${y-4}v8`}/></g>;})}
  </WorldSvg>
</AbsoluteFill>;

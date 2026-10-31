import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Quad, fade, lerp, path, progress, reveal} from '../math';
import {useData} from '../context';
import {WHITE, BLUE, MONO, HEAVY, WorldSvg, Plane, Mono} from '../components/stage';

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

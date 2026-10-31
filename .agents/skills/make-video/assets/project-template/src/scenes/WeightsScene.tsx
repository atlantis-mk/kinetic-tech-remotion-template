import React from 'react';
import {AbsoluteFill,Img,staticFile} from 'remotion';
import {Quad, clamp, fade, mixQuad, path, progress, reveal, scaleQuad} from '../math';
import {useData} from '../context';
import {WHITE, GOLD, MONO, SANS, HEAVY, Svg, Plane} from '../components/stage';

const stackQuad=(i:number):Quad=>{
  const base:Quad=[[1090,-90],[1680,310],[1775,800],[1055,884]];
  return scaleQuad(base,1-i*.02,[1100,500],[-28*i,5.8*i]);
};
const Tokenizer:React.FC<{t:number}>=({t})=>{
  const d=useData('weights');
  const split=reveal(t,58.65,59.25),p=reveal(t,57.8,58.4);
  return <div style={{position:'absolute',left:115,top:690,width:645,height:249,border:'2px solid #273447',borderRadius:12,background:'linear-gradient(135deg,#0b121b,#070d15)',padding:'24px 26px',opacity:p,boxSizing:'border-box',transform:`translateY(${(1-p)*35}px)`}}>
    <div style={{fontSize:25,fontWeight:800,color:WHITE}}>{d.tokenizerLabel} <span style={{fontFamily:MONO,fontSize:17,color:'#7b899e'}}>TOKENIZER</span></div>
    <div style={{position:'absolute',top:83,left:26,fontSize:45,fontWeight:800,color:WHITE,opacity:1-split}}>{d.input}</div>
    <div style={{position:'absolute',top:80,left:26,display:'flex',gap:10,opacity:split}}>{d.tokens.map((s,i)=><div key={s}><div style={{background:i%2?'#725932':'#444c87',border:'1px solid #8991c1',borderRadius:5,padding:'5px 9px',fontSize:43,fontWeight:900,color:'#f3f2ee',lineHeight:1.15}}>{s}</div><div style={{marginTop:12,textAlign:'center',fontSize:18,color:i%2?GOLD:'#a7a5e8',fontFamily:MONO}}>{d.tokenIds[i]}</div></div>)}</div>
  </div>;
};

const CodeExample:React.FC<{t:number}>=({t})=>{
  const d=useData('weights');
  const p=reveal(t,58.75,59.55),code=d.code;
  return <div style={{position:'absolute',left:1135,top:700,width:665,height:239,border:'2px solid #273447',borderRadius:12,background:'linear-gradient(135deg,#0b121b,#070d15)',padding:'24px 26px',opacity:p,boxSizing:'border-box',transform:`translateY(${(1-p)*35}px)`}}>
    <div style={{fontSize:25,fontWeight:800,color:WHITE}}>{d.exampleLabel} <span style={{fontFamily:MONO,fontSize:17,color:'#7b899e'}}>EXAMPLE</span></div>
    <pre style={{fontFamily:MONO,fontSize:23,lineHeight:1.75,color:'#b3afff',margin:'22px 0 0'}}>{code.slice(0,Math.round(progress(t,59,60.6)*code.length))}<span style={{opacity:Math.sin(t*8)>0?1:0}}>▌</span></pre>
  </div>;
};

export const WeightsScene:React.FC<{t:number}>=({t})=>{
  const d=useData('weights');
  const a=reveal(t,50.84,51.25),spread=reveal(t,51.7,53.05);
  const flat:Quad=[[210,60],[1710,60],[1710,1070],[210,1070]];
  const structure=reveal(t,57.55,58.45),word=reveal(t,53.05,53.75);
  return <AbsoluteFill style={{opacity:a}}>
    {Array.from({length:29},(_,j)=>28-j).map(i=>{
      const q=mixQuad(flat,stackQuad(i),spread),opacity=i===0?1:spread*(.55+(1-i/29)*.4);
      const bright=clamp(1-Math.abs((t-54.8)*16-i)/3)*fade(t,54.65,54.9,55.6,55.9);
      return <Plane key={i} q={q} w={1024} h={1000} opacity={opacity}><div style={{position:'absolute',inset:0,background:'#080e19',opacity:.96}}/><Img src={staticFile(d.surface)} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/><svg width="1024" height="1000" style={{position:'absolute',inset:0}}><rect x="2" y="2" width="1020" height="996" fill="none" stroke={bright>.2?'#a8a1ff':'#494971'} strokeWidth={bright>.2?5:1.7}/><rect x="2" y="2" width="1020" height="996" fill="#c2bbff" opacity={bright*.14}/></svg></Plane>;
    })}
    <div style={{position:'absolute',left:120,top:178,opacity:word}}>
      <div style={{fontFamily:MONO,fontSize:19,color:'#a8a3ec',letterSpacing:1}}>{d.eyebrow}</div>
      <div style={{fontSize:136,fontWeight:900,WebkitTextStroke:'1px',lineHeight:1.25,color:WHITE,textShadow:'0 0 20px #ffffff33',clipPath:`inset(0 ${(1-word)*100}% 0 0)`}}>{d.amount}<span style={{color:'#a19cff',fontFamily:HEAVY}}>{d.unit}</span></div>
      <div style={{fontSize:32,fontWeight:600,color:'#c4c9d1'}}>{d.subtitle}</div>
    </div>
    <div style={{position:'absolute',left:1120,top:815,fontSize:31,fontWeight:900,color:WHITE,opacity:fade(t,55.4,55.9,56.6,57),textShadow:'0 0 12px #ffffff66'}}>{d.annotation}</div>
    <Svg opacity={structure}>
      <defs><mask id="structure-caption-clear"><rect width="1920" height="1080" fill="white"/><rect x="100" y="150" width="550" height="300" fill="black"/></mask></defs>
      <g mask="url(#structure-caption-clear)">
      <path d="M290 391 L1040 60 L1660 322 L1790 884 L850 990 L240 935 Z" fill="none" stroke="#757b9a" strokeWidth="1.7" strokeDasharray="9 7"/>
      <path d="M240 935 L1000 605 L1790 884 M1040 60 L1000 605 L850 990" fill="none" stroke="#6c7396" strokeWidth="1.5" strokeDasharray="9 7"/>
      <path d="M1420 158 L1390 220 L1480 286" fill="none" stroke="#a5acc2" strokeWidth="1.6"/>
      <text x="1378" y="139" fill={WHITE} fontFamily={SANS} fontWeight="900" fontSize="34">{d.structureLabel}</text>
      <text x="1378" y="167" fill="#8a93a9" fontFamily={MONO} fontSize="16">ARCHITECTURE</text>
      </g>
    </Svg>
    <Tokenizer t={t}/><CodeExample t={t}/>
  </AbsoluteFill>;
};

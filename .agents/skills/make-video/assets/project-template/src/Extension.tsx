import React from 'react';
import {useData} from './context';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Point, Quad, clamp, ease, fade, hash, lerp, matrix3d, mixQuad, path, progress, quadTrack, reveal, scaleQuad, track} from './math';

const WHITE='var(--fg)', BLUE='var(--accent)', GOLD='var(--highlight)';
const MONO='"SFMono-Regular", Menlo, monospace';
const SANS='Arial, "PingFang SC", sans-serif';
const HEAVY='"Arial Black", Arial, "PingFang SC", sans-serif';
const Plane:React.FC<{q:Quad;w:number;h:number;opacity?:number;children:React.ReactNode}>=({q,w,h,opacity=1,children})=><div style={{position:'absolute',left:0,top:0,width:w,height:h,transformOrigin:'0 0',transform:matrix3d(q,w,h),opacity,backfaceVisibility:'hidden'}}>{children}</div>;
const Svg:React.FC<React.SVGProps<SVGSVGElement>>=p=><svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}} {...p}/>;

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


const HeadlineCard:React.FC<{title:string;main?:boolean;t:number}>=({title,main=false,t})=>{
  const d=useData('headlines');
  const accent=main?reveal(t,49.35,49.75):0;
  return <div style={{width:1240,height:365,background:main?'linear-gradient(140deg,#0c121a,#090f17)':'#080d15',border:`${main?2:1}px solid ${main?'#303b4b':'#242e40'}`,borderRadius:main?19:10,position:'relative',overflow:main?'visible':'hidden',boxShadow:main?'0 16px 80px #0008':'none'}}>
    <div style={{position:'absolute',left:-2,top:42,bottom:40,width:7,background:'#7671f7',boxShadow:'0 0 13px #7771ff66'}}/>
    <div style={{position:'absolute',left:55,top:43,fontFamily:MONO,fontSize:22,color:'#9aabc1'}}>{d.label}</div>
    <div style={{position:'absolute',left:55,right:55,top:94,height:1,background:'#2a3545'}}/>
    <div style={{position:'absolute',left:55,top:114,fontSize:126,fontWeight:900,WebkitTextStroke:main?'2px':'1px',letterSpacing:-3,whiteSpace:'nowrap',color:WHITE,textShadow:main?'0 0 4px #ffffff88, 0 0 18px #ffffff66':'none'}}>{main?<><span>{d.prefix}</span><span style={{backgroundColor:`rgba(123,117,255,${accent*.9})`,boxShadow:accent>.5?'0 0 20px #7c75ff44':'none',color:accent>.5?'#e1dfff':WHITE}}>{d.keyword}</span>{d.suffix}</>:title}</div>
    <div style={{position:'absolute',left:55,top:297,width:600,height:7,background:'#2e3b4a',opacity:.7}}/><div style={{position:'absolute',left:55,top:316,width:440,height:6,background:'#263442',opacity:.6}}/>
    {main&&<div style={{position:'absolute',left:1285,top:95,fontSize:154,fontWeight:900,color:GOLD,textShadow:'0 0 18px #ffb83266',opacity:reveal(t,50.05,50.55)}}>?</div>}
  </div>;
};

const headlineFlyCards=Array.from({length:32},(_,i)=>({x:(i%4-1.5)*900+hash(i+12)*260,y:(Math.floor(i/4)%4-1.5)*410,z:800+Math.floor(i/4)*650+hash(i+13)*200,index:i}));
export const HeadlinesScene:React.FC<{t:number}>=({t})=>{
  const d=useData('headlines');
  const a=fade(t,42.73,43.05,50.78,51.1),flyAlpha=1-reveal(t,45.15,46.0),wallAlpha=reveal(t,45.4,46.6);
  const camera=(t-42.73)*770;
  const mainQ=quadTrack(t,[42.73,44,45.65,48.8,50.8],[ [[1030,500],[1335,475],[1348,560],[1020,595]],[[900,425],[1765,415],[1765,680],[900,685]],[[295,340],[1630,340],[1635,750],[295,750]],[[295,340],[1630,340],[1635,750],[295,750]],[[245,350],[1590,350],[1590,760],[245,760]] ]);
  return <AbsoluteFill style={{opacity:a}}>
    {flyAlpha>0&&headlineFlyCards.flatMap((card,i)=>[.045,0].map((offset,sample)=>{
      const z=card.z-camera+offset*770;if(z<130||z>6600)return null;
      const s=1300/z,x=960+card.x*s,y=540+card.y*s,w=710*s,h=215*s,skew=card.x>0?95*s:-95*s;
      const q:Quad=[[x-w/2,y-h/2-skew],[x+w/2,y-h/2+skew],[x+w/2,y+h/2+skew],[x-w/2,y+h/2-skew]];
      const alpha=clamp((z-130)/350)*clamp((6600-z)/1600)*flyAlpha*(sample?.85:.24);
      return <Plane key={'fly'+i+'-'+sample} q={q} w={1240} h={365} opacity={alpha}><div style={{filter:`blur(${z<1500?6:3}px)`}}><HeadlineCard title={d.headlines[card.index%d.headlines.length]} t={t}/></div></Plane>;
    }))}
    {wallAlpha>0&&Array.from({length:7*6},(_,i)=>{
      const col=i%7,row=Math.floor(i/7),x=-150+col*355+hash(i+14)*50,y=35+row*182+hash(i+72)*30;
      const q:Quad=[[x,y],[x+345,y-6],[x+345,y+112],[x,y+118]];
      return <Plane key={'wall'+i} q={q} w={1240} h={365} opacity={wallAlpha*(.18+hash(i+92)*.14)}><HeadlineCard title={d.headlines[i%d.headlines.length]} t={t}/></Plane>;
    })}
    <Plane q={mainQ} w={1240} h={365} opacity={reveal(t,43.5,45.25)}><HeadlineCard title={d.prefix+d.keyword+d.suffix} main t={t}/></Plane>
  </AbsoluteFill>;
};

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

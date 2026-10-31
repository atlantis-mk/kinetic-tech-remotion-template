import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Quad, clamp, fade, hash, quadTrack, reveal} from '../math';
import {useData} from '../context';
import {WHITE, GOLD, MONO, Plane} from '../components/stage';

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

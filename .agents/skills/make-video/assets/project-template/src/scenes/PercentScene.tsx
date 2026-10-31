import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, ease, fade, hash, lerp, path, progress, quadTrack, reveal} from '../math';
import {useData} from '../context';
import {WHITE, GOLD, MONO, HEAVY, WorldSvg, Plane, Mono} from '../components/stage';

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

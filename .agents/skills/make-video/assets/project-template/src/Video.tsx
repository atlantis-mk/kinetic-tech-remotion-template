import React from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {content,timeline,origin,Content,Scene} from './content';
import {SceneContext} from './context';
import {Background,ChipScene,PercentScene,DateScene,Architecture,Chapters} from './Film';
import {ThesisScene,Intertitle,HeadlinesScene,WeightsScene} from './Extension';
export const themeStyle=(c:Content)=>({'--fg':c.theme.foreground,'--accent':c.theme.accent,'--highlight':c.theme.highlight,color:c.theme.foreground,backgroundColor:c.theme.background,fontFamily:'Arial, "PingFang SC", "Noto Sans CJK SC", sans-serif'} as React.CSSProperties);
const Media:React.FC<{scene:Extract<Scene,{kind:'media'}>;p:number}>=({scene,p})=><>
 <div style={{position:'absolute',inset:'90px 120px 200px',transform:`scale(${1+p*.035})`,border:'1px solid #677593',borderRadius:24,overflow:'hidden'}}>
 {scene.data.type==='image'?<Img src={staticFile(scene.data.file)} style={{width:'100%',height:'100%',objectFit:scene.data.fit}}/>:<OffthreadVideo src={staticFile(scene.data.file)} muted style={{width:'100%',height:'100%',objectFit:scene.data.fit}}/>}</div>
 <div style={{position:'absolute',left:120,bottom:110,fontSize:60,fontWeight:900}}>{scene.title}</div><div style={{position:'absolute',left:120,top:45,fontSize:22,color:'var(--accent)'}}>{scene.data.eyebrow}</div>
</>;
export const SceneStage:React.FC<{scene:Scene;p:number}>=({scene,p})=>{
 const [a,b]=origin[scene.kind],t=a+Math.min(.9999,Math.max(0,p))*(b-a);
 const components={chip:ChipScene,percentage:PercentScene,system:DateScene,architecture:Architecture,chapters:Chapters,thesis:ThesisScene,intertitle:Intertitle,headlines:HeadlinesScene,weights:WeightsScene};
 const Component=scene.kind==='media'?null:components[scene.kind];
 return <SceneContext.Provider value={scene}><AbsoluteFill style={{width:1920,height:1080,overflow:'hidden'}}><Background t={t}/>{Component?<Component t={t}/>:scene.kind==='media'?<Media scene={scene} p={p}/>:null}<AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,.23) 100%)'}}/><AbsoluteFill style={{backgroundImage:`url(${staticFile('grain.png')})`,opacity:.035,mixBlendMode:'screen'}}/></AbsoluteFill></SceneContext.Provider>;
};
const SceneFrame:React.FC<{scene:Scene;frames:number;portrait:boolean}>=({scene,frames,portrait})=>{
 const frame=useCurrentFrame(),{width,height}=useVideoConfig(),p=frame/Math.max(1,frames-1),scale=width/1920;
 return <AbsoluteFill>{portrait&&<>
  <div style={{position:'absolute',left:76,right:76,top:150,fontSize:24,letterSpacing:4,color:'var(--accent)'}}>{content.brand}</div>
  <div style={{position:'absolute',left:76,right:76,top:250,fontWeight:900,fontSize:scene.title.length>16?68:92,lineHeight:1.22}}>{scene.title}</div>
  <div style={{position:'absolute',left:76,right:76,top:515,fontSize:34,lineHeight:1.6,color:'#aab4c7'}}>{scene.summary}</div>
 </>}
 <div style={{position:'absolute',left:0,top:portrait?740:0,width:1920,height:1080,transformOrigin:'0 0',transform:`scale(${scale})`}}><SceneStage scene={scene} p={p}/></div>
 {portrait&&<><div style={{position:'absolute',left:76,right:76,top:1415,height:2,background:'#353b50'}}/><div style={{position:'absolute',left:76,right:76,top:1470,fontSize:25,color:'#8692a8',letterSpacing:3}}>SYSTEM NOTES / {scene.kind.toUpperCase()}</div><div style={{position:'absolute',left:76,right:76,top:1550,fontSize:40,lineHeight:1.5}}>{scene.summary}</div></>}
 <div style={{position:'absolute',left:portrait?76:90,right:portrait?76:90,bottom:portrait?85:24,height:2,background:'#303547'}}><div style={{width:`${p*100}%`,height:'100%',background:'var(--accent)'}}/></div>
 </AbsoluteFill>;
};
export const Video:React.FC=()=>{
 const frame=useCurrentFrame(),{width,height,fps}=useVideoConfig(),tl=timeline(content),sub=content.subtitles.find(s=>s.start<=frame/fps&&frame/fps<s.end);
 const voice=content.audio.voiceover;
 return <AbsoluteFill style={{...themeStyle(content),overflow:'hidden'}}>
 {content.scenes.map((s,i)=><Sequence key={s.id} from={tl[i].from} durationInFrames={tl[i].frames}><SceneFrame scene={s} frames={tl[i].frames} portrait={height>width}/></Sequence>)}
 {content.audio.sfx.enabled&&content.audio.sfx.volume>0&&<Audio src={staticFile('audio/sfx.wav')} volume={content.audio.sfx.volume}/>}
 {voice&&voice.volume>0&&<Sequence from={Math.round(voice.start*fps)}><Audio src={staticFile(voice.file)} volume={voice.volume}/></Sequence>}
 {content.audio.cues.map((c,i)=><Sequence key={i} from={Math.round(c.at*fps)} durationInFrames={Math.round(c.duration*fps)}><Audio src={staticFile(c.file)} volume={c.volume}/></Sequence>)}
 {sub&&<div style={{position:'absolute',bottom:height>width?140:60,left:60,right:60,textAlign:'center',fontSize:height>width?40:42,fontWeight:600,textShadow:'0 2px 9px #000'}}>{sub.text}</div>}
 </AbsoluteFill>;
};

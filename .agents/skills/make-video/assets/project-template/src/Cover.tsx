import React from 'react';
import {AbsoluteFill,useVideoConfig} from 'remotion';
import {content} from './content';
import {SceneStage,themeStyle} from './Video';
export const Cover:React.FC=()=>{
 const {width,height}=useVideoConfig(),portrait=height>width,wide=width/height>1.6;
 const scene=content.scenes.find(s=>s.id===content.cover.sceneId)!;
 const x=wide?800:portrait?60:180,y=wide?205:portrait?730:460,stageWidth=wide?1120:portrait?width-120:1240,scale=stageWidth/1920;
 const titleSize=Math.min(wide?122:portrait?112:100,(wide?740:width-140)/Math.max(...content.cover.title.split('\n').map(s=>s.length)));
 return <AbsoluteFill style={{...themeStyle(content),overflow:'hidden'}}>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 70% 58%,#24234366,transparent 65%)'}}/>
  <div style={{position:'absolute',left:70,top:65,fontSize:24,letterSpacing:3,color:'var(--accent)'}}>{content.cover.eyebrow}</div>
  <div style={{position:'absolute',left:70,top:wide?230:155,width:wide?740:width-140,fontSize:titleSize,fontWeight:900,whiteSpace:'pre-line',lineHeight:1.2,letterSpacing:-4,zIndex:2}}>{content.cover.title}</div>
  <div style={{position:'absolute',left:70,top:wide?610:portrait?510:405,width:wide?650:width-140,fontSize:wide?35:34,lineHeight:1.5,color:'#b0b7ca',zIndex:2}}>{content.cover.subtitle}</div>
  <div style={{position:'absolute',left:x,top:y,width:1920,height:1080,transformOrigin:'0 0',transform:`scale(${scale})`}}><SceneStage scene={scene} p={content.cover.progress}/></div>
  <div style={{position:'absolute',bottom:65,left:70,right:70,height:2,background:'#303b52'}}/>
  <div style={{position:'absolute',bottom:30,left:70,fontSize:19,letterSpacing:2,color:'#8794aa'}}>{content.brand}</div>
 </AbsoluteFill>;
};

import React from 'react';
import {Img,OffthreadVideo,staticFile} from 'remotion';
import type {Scene} from '../content';

export const MediaScene:React.FC<{scene:Extract<Scene,{kind:'media'}>;p:number}>=({scene,p})=><>
 <div style={{position:'absolute',inset:'90px 120px 200px',transform:`scale(${1+p*.035})`,border:'1px solid #677593',borderRadius:24,overflow:'hidden'}}>
 {scene.data.type==='image'?<Img src={staticFile(scene.data.file)} style={{width:'100%',height:'100%',objectFit:scene.data.fit}}/>:<OffthreadVideo src={staticFile(scene.data.file)} muted style={{width:'100%',height:'100%',objectFit:scene.data.fit}}/>}</div>
 <div style={{position:'absolute',left:120,bottom:110,fontSize:60,fontWeight:900}}>{scene.title}</div><div style={{position:'absolute',left:120,top:45,fontSize:22,color:'var(--accent)'}}>{scene.data.eyebrow}</div>
</>;

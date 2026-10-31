import React from 'react';
import {Quad, matrix3d} from '../math';

export const WHITE='var(--fg)', BLUE='var(--accent)', GOLD='var(--highlight)';
export const MONO='"SFMono-Regular", Menlo, monospace';
export const SANS='Arial, "PingFang SC", sans-serif';
export const HEAVY='"Arial Black", Arial, "PingFang SC", sans-serif';
export const globeStyle:React.CSSProperties={position:'absolute',inset:0,width:1920,height:1080};
export const WorldSvg:React.FC<React.SVGProps<SVGSVGElement>>=props=><svg width={1920} height={1080} viewBox="0 0 1920 1080" style={globeStyle} {...props}/>;
export const Svg:React.FC<React.SVGProps<SVGSVGElement>>=p=><svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}} {...p}/>;
export const Plane:React.FC<{q:Quad;w?:number;h?:number;opacity?:number;children:React.ReactNode}>=({q,w=1200,h=900,opacity=1,children})=><div style={{position:'absolute',left:0,top:0,width:w,height:h,transformOrigin:'0 0',transform:matrix3d(q,w,h),opacity,backfaceVisibility:'hidden'}}>{children}</div>;
export const Mono:React.FC<{children:React.ReactNode;style?:React.CSSProperties}>=({children,style})=><div style={{fontFamily:MONO,fontSize:20,letterSpacing:1.1,color:'#a1a8ae',...style}}>{children}</div>;

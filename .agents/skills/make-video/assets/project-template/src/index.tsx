import React from 'react';
import {Composition,Still,registerRoot} from 'remotion';
import {content,dimensions,timeline} from './content';
import {Video} from './Video';
import {Cover} from './Cover';
const frames=timeline(content).reduce((a,s)=>a+s.frames,0);
const Root:React.FC=()=> <>
 <Composition id="Main" component={Video} {...dimensions(content)} fps={content.video.fps} durationInFrames={frames}/>
 <Still id="Cover4x3" component={Cover} width={1600} height={1200}/>
 <Still id="Cover3x4" component={Cover} width={1200} height={1600}/>
 <Still id="Cover16x9" component={Cover} width={1920} height={1080}/>
</>;
registerRoot(Root);

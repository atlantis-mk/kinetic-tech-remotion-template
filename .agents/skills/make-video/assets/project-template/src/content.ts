import {z} from 'zod';
import defaults from '../content.json';
const short=z.string().trim().min(1).max(28);
const line=z.string().trim().min(1).max(64);
const file=z.string().min(1).refine(s=>!s.startsWith('/')&&!s.includes('\\')&&!s.split('/').some(p=>p==='..'||p==='.'||!p)&&!s.includes(':'),'Use a local public/ relative path');
const finite=z.number().finite();
const spec=z.object({title:short,sub:line}).strict();
const card=z.object({eyebrow:short,title:z.string().min(1).max(12),line:z.string().min(1).max(12),emphasis:z.string().min(1).max(6)}).strict();
const data={
 chip:z.object({specs:z.array(spec).length(3),cost:finite.min(0).max(999),revenue:finite.min(0).max(999),currency:z.string().max(3),unit:short,costLabel:line,revenueLabel:line,badge:short,surface:file}).strict(),
 percentage:z.object({value:finite.min(0).max(100),label:short,teaser:short,conclusion:z.string().min(1).max(14),legend:z.array(short).length(2)}).strict(),
 system:z.object({date:z.string().regex(/^\d{2}\.\d{2}$/),yearLabel:short,brand:short,systemLabel:short}).strict(),
 architecture:z.object({title:z.string().min(1).max(10),subtitle:z.string().min(1).max(16),eyebrow:short,component:line,command:line,layers:z.array(short).length(5),details:z.array(line).length(5)}).strict(),
 chapters:z.object({cards:z.array(card).length(2),nodes:z.array(short).length(6),center:z.string().min(1).max(3),graphLabel:short}).strict(),
 thesis:z.object({low:short,high:short,prefix:z.string().min(1).max(6),highlight:z.string().min(1).max(6),bridge:short,negative:z.string().min(1).max(5),statement:z.string().min(1).max(9)}).strict(),
 intertitle:z.object({title:z.string().min(1).max(10),subtitle:z.string().min(1).max(20),eyebrow:line}).strict(),
 headlines:z.object({headlines:z.array(z.string().min(1).max(16)).min(1).max(32),label:short,prefix:z.string().max(8),keyword:z.string().min(1).max(5),suffix:z.string().max(3)}).strict(),
 weights:z.object({eyebrow:short,amount:z.string().min(1).max(5),unit:z.string().max(5),subtitle:short,annotation:short,structureLabel:short,tokenizerLabel:short,exampleLabel:short,input:short,tokens:z.array(z.string().min(1).max(5)).length(4),tokenIds:z.array(z.number().int().min(0)).length(4),code:z.string().min(1).max(160),surface:file}).strict(),
 media:z.object({file,type:z.enum(['image','video']),fit:z.enum(['contain','cover']),eyebrow:short}).strict(),
};
const base={id:z.string().regex(/^[a-z0-9-]+$/),duration:finite.min(1).max(120),title:short,summary:line};
const variant=<K extends keyof typeof data>(kind:K)=>z.object({...base,kind:z.literal(kind),data:data[kind]}).strict();
const SceneSchema=z.discriminatedUnion('kind',[variant('chip'),variant('percentage'),variant('system'),variant('architecture'),variant('chapters'),variant('thesis'),variant('intertitle'),variant('headlines'),variant('weights'),variant('media')]);
export const ContentSchema=z.object({
 schemaVersion:z.literal('1.0'),video:z.object({aspect:z.enum(['16:9','9:16']),fps:z.number().int().min(24).max(60)}).strict(),
 theme:z.object({foreground:z.string().regex(/^#[\da-fA-F]{6}$/),accent:z.string().regex(/^#[\da-fA-F]{6}$/),highlight:z.string().regex(/^#[\da-fA-F]{6}$/),background:z.string().regex(/^#[\da-fA-F]{6}$/)}).strict(),
 brand:line,scenes:z.array(SceneSchema).min(1).max(40),
 subtitles:z.array(z.object({start:finite.min(0),end:finite.positive(),text:line}).strict()),
 audio:z.object({sfx:z.object({enabled:z.boolean(),volume:finite.min(0).max(2)}).strict(),voiceover:z.object({file,start:finite.min(0),volume:finite.min(0).max(2)}).strict().nullable(),cues:z.array(z.object({file,at:finite.min(0),duration:finite.positive(),volume:finite.min(0).max(2)}).strict())}).strict(),
 cover:z.object({title:z.string().min(1).max(24).refine(s=>s.split('\n').length<=2,'Cover title supports at most two lines'),subtitle:line,eyebrow:line,sceneId:z.string(),progress:finite.min(.05).max(.95)}).strict()
}).strict().superRefine((c,ctx)=>{
 const total=timeline(c).reduce((a,s)=>a+s.frames,0)/c.video.fps;
 const issue=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});
 const ids=c.scenes.map(s=>s.id);if(new Set(ids).size!==ids.length)issue('Scene ids must be unique');
 if(!ids.includes(c.cover.sceneId))issue('cover.sceneId is missing');
 if(total>600)issue('Maximum duration is 600 seconds');
 let end=0;for(const s of c.subtitles){if(s.start<end||s.start>=s.end||s.end>total)issue('Subtitles must be ordered, non-overlapping and within the video');end=s.end;}
 for(const s of c.scenes)if(Math.abs(s.duration*c.video.fps-Math.round(s.duration*c.video.fps))>0.00001)issue('Scene durations must be whole frames at the chosen fps');
 for(const cue of c.audio.cues)if(cue.at+cue.duration>total+.001)issue('Audio cue extends beyond the video');
 if(c.audio.voiceover&&c.audio.voiceover.start>=total)issue('Voiceover starts outside the video');
});
export type Content=z.infer<typeof ContentSchema>;
export type Scene=z.infer<typeof SceneSchema>;
export function timeline(c:{video:{fps:number};scenes:{duration:number}[]}) {let from=0;return c.scenes.map(s=>{const frames=Math.round(s.duration*c.video.fps);const item={from,frames};from+=frames;return item;});}
export const content=ContentSchema.parse(defaults);
export const dimensions=(c:Content)=>c.video.aspect==='16:9'?{width:1920,height:1080}:{width:1080,height:1920};
export const origin:Record<Scene['kind'],[number,number]>={chip:[0,10.9],percentage:[10.76,18.94],system:[18.82,22.7],architecture:[22.35,25.12],chapters:[25,35.13],thesis:[35.55,41.04],intertitle:[40.9,42.96],headlines:[42.73,51.1],weights:[50.84,60.6],media:[0,1]};

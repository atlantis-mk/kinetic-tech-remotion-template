// The CLI compiles the same schema imported by the React composition.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
const source=esbuild.buildSync({entryPoints:[path.join(root,'src/content.ts')],bundle:true,platform:'node',format:'cjs',write:false,packages:'external'}).outputFiles[0].text;
const mod=new Module(path.join(root,'schema.cjs'),module);mod.filename=path.join(root,'schema.cjs');mod.paths=Module._nodeModulePaths(root);mod._compile(source,mod.filename);
const {ContentSchema,dimensions,timeline}=mod.exports;
const filename=path.resolve(process.argv[3]||path.join(root,'content.json'));
try {
 const c=ContentSchema.parse(JSON.parse(fs.readFileSync(filename,'utf8')));
 const tl=timeline(c);const frames=tl.reduce((a,s)=>a+s.frames,0);
 if(process.argv[2]==='describe')console.log(JSON.stringify({content:c,video:{...dimensions(c),fps:c.video.fps,frames,duration:frames/c.video.fps},timeline:tl}));
 else if(process.argv[2]==='export'){fs.writeFileSync(filename,JSON.stringify(c,null,2)+'\n');console.log('Exported '+filename);}
 else if(process.argv[2]==='validate')console.log(JSON.stringify({ok:true,frames,duration:frames/c.video.fps,scenes:c.scenes.length}));
 else throw Error('Usage: content.cjs validate|describe|export [content.json]');
} catch(error){console.error(String(error));process.exitCode=5;}

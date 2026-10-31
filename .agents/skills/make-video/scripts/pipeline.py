#!/usr/bin/env python3
"""单期工具 env/init/validate/check/preview/render/verify，以及可选 inspect。技术检查不代替视听验收。

0 成功；2 用法错误；3 环境缺失；5 输入不合法；7 执行失败。inspect 完整性失败也是 5。最后一行输出 JSON。
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from pipeline_lib import inside, read_json, write_json, now, probe, fingerprint, sha256, outputs, verify_file

ROOT = Path(__file__).resolve().parents[4]
SOURCE = Path('.agents/skills/make-video/assets/project-template')
COVERS = {(1600,1200):'Cover4x3',(1200,1600):'Cover3x4',(1920,1080):'Cover16x9'}
IGNORED = shutil.ignore_patterns('node_modules','.git','renders','out','.cache','.remotion','.audio-cache.json','__pycache__','.DS_Store','sfx.wav','*.tmp')


def run(command, project, log):
    log.parent.mkdir(parents=True, exist_ok=True)
    with log.open('a', encoding='utf-8') as stream:
        stream.write('\n'+json.dumps([str(x) for x in command], ensure_ascii=False)+'\n');stream.flush()
        p = subprocess.run([str(x) for x in command], cwd=project, stdout=stream, stderr=subprocess.STDOUT)
    if p.returncode:
        raise RuntimeError('命令失败，查看日志：'+str(log))


def init(root, install=False):
    source = root/SOURCE
    project = root/'work/project'
    if not source.is_dir():
        raise ValueError('工程基准不存在')
    project.mkdir(parents=True, exist_ok=True)
    if not list(project.iterdir()):
        shutil.copytree(source,project,ignore=IGNORED,dirs_exist_ok=True)
    elif not (project/'package.json').is_file():
        raise ValueError('work/project 已有非工程文件，不能覆盖')
    for name in ('input/audio','input/images','input/videos','input/text','preview','delivery'):
        (root/'work'/name).mkdir(parents=True,exist_ok=True)
    if not (root/'work/task.json').exists():
        write_json(root/'work/task.json',read_json(root/'.agents/skills/make-video/assets/task-template.json'))
    if install:
        run(['npm','ci','--no-audit','--no-fund'],project,root/'work/preview/install.log')
        run(['node','scripts/build-audio.mjs'],project,root/'work/preview/init.log')
    return {'project':str(project),'next_action':'按制作要求修改 work/project/content.json 和 work/task.json；未安装依赖时运行 init --install'}


def describe(project):
    p=subprocess.run(['node','scripts/content.cjs','describe'],cwd=project,capture_output=True,text=True)
    if p.returncode:
        raise ValueError('参数校验失败：'+p.stderr[-3000:])
    return json.loads(p.stdout)


def validate(root, technical=False):
    if not (root/'work/task.json').is_file():
        raise ValueError('开始制作时先运行 init')
    task=read_json(root/'work/task.json');project=root/'work/project';log=root/'work/preview/check.log'
    d=describe(project);c=d['content'];video=d['video'];public=project/'public';errors=[]
    outputs(task,video)
    def media(file,stream_type=None):
        path=inside(public,file)
        if not path.is_file():
            raise ValueError('素材缺失：'+file)
        if stream_type:
            meta=probe(path)
            if not any(s['codec_type']==stream_type for s in meta['streams']):
                raise ValueError('素材缺少 '+stream_type+' 流：'+file)
            return meta
        return None
    for s in c['scenes']:
        data=s['data']
        if s['kind'] in ('chip','weights'):
            media(data['surface'])
        if s['kind']=='media':
            meta=media(data['file'],'video' if data['type']=='video' else None)
            if meta and float(meta['format']['duration'])+.05<s['duration']:
                errors.append('视频素材短于该场景；请调整场景时长或显式修改循环逻辑')
    voice=c['audio']['voiceover']
    if voice:
        meta=media(voice['file'],'audio')
        if float(meta['format']['duration'])+voice['start']>video['duration']+.1:
            errors.append('配音尾部超出视频，请按语义调整时间轴')
    for cue in c['audio']['cues']:
        meta=media(cue['file'],'audio')
        if float(meta['format']['duration'])+.05<cue['duration']:
            errors.append('音效素材短于声明的 duration')
    if errors:raise ValueError('；'.join(errors))
    run(['node','scripts/build-audio.mjs'],project,log)
    if technical:
        run(['npm','run','typecheck'],project,log)
        p=subprocess.run(['node','scripts/render.mjs','list'],cwd=project,capture_output=True,text=True)
        with log.open('a',encoding='utf-8') as stream:stream.write(p.stdout+p.stderr)
        if p.returncode:raise RuntimeError('合成加载失败：'+str(log))
        compositions=json.loads(p.stdout.strip().splitlines()[-1])
        main=next((x for x in compositions if x['id']=='Main'),None)
        if not main or (main['width'],main['height'],main['fps'],main['durationInFrames'])!=(video['width'],video['height'],video['fps'],video['frames']):
            raise ValueError('实际合成与 content.json 不一致')
        for wh,id in COVERS.items():
            found=next((x for x in compositions if x['id']==id),None)
            if not found or (found['width'],found['height'])!=wh:raise ValueError('封面合成尺寸不符')
    write_json(root/'work/preview/check-report.json',{'ok':True,'checked_at':now(),'scope':'project' if technical else 'parameters','input_fingerprint':fingerprint(project,task,video),'video':video,'visual_review':'not_run','audio_review':'not_run'})
    return task,project,c,video,d['timeline']


def render_call(project,mode,id,destination,log,range=None):
    command=['node','scripts/render.mjs',mode,id,destination]
    if range is not None:command.append(range)
    run(command,project,log)


def preview(root,frames):
    task,project,c,v,tl=validate(root,technical=True);target=root/'work/preview'
    selected={0,v['frames']-1}
    for s in tl:
        selected.update((s['from'],s['from']+s['frames']//2,s['from']+s['frames']-1))
    render_call(project,'stills','Main',target,target/'render.log',','.join(map(str,sorted(selected))))
    if frames:
        a,b=map(int,frames.split('-'))
        if not 0<=a<=b<v['frames']:raise ValueError('预览帧范围超出视频')
        temp=target/'.rendering-clip.mp4'
        try:
            render_call(project,'video','Main',temp,target/'render.log',frames)
            clip=dict(v,frames=b-a+1,duration=(b-a+1)/v['fps'])
            issues=verify_file(temp,dict(type='video'),clip,c)
            if issues:raise RuntimeError('；'.join(issues))
            temp.replace(target/'clip.mp4')
        finally:temp.unlink(missing_ok=True)
    return {'preview':str(target),'keyframes':len(selected),'clip':bool(frames),'visual_review':'not_run','audio_review':'not_run'}


def render(root,only):
    task,project,c,v,tl=validate(root,technical=True);current=fingerprint(project,task,v)
    mp=root/'work/preview/render-manifest.json';old=read_json(mp) if mp.exists() else {}
    records=old.get('outputs',{}) if old.get('input_fingerprint')==current else {}
    for item in outputs(task,v):
        if only!='all' and (item['type']=='video')!=(only=='video'):continue
        dest=inside(root,item['path']);dest.parent.mkdir(parents=True,exist_ok=True);temp=dest.with_name('.rendering-'+dest.name)
        id='Main' if item['type']=='video' else COVERS[(item['width'],item['height'])]
        try:
            render_call(project,'video' if item['type']=='video' else 'still',id,temp,root/'work/preview/render.log')
            errors=verify_file(temp,item,v,c)
            if fingerprint(project,task,v)!=current:errors.append('渲染期间输入发生变化')
            if errors:raise RuntimeError(item['path']+'：'+'；'.join(errors))
            temp.replace(dest)
            records[item['path']]={'sha256':sha256(dest),'composition':id,'frame_range':[0,v['frames']-1] if item['type']=='video' else [0,0],'width':item['width'],'height':item['height'],'rendered_at':now()}
            write_json(mp,{'input_fingerprint':current,'outputs':records})
        finally:temp.unlink(missing_ok=True)
    return {'outputs':list(records),'visual_review':'not_run','audio_review':'not_run'}


def verify(root):
    task,project,c,v,tl=validate(root);mp=root/'work/preview/render-manifest.json'
    if not mp.is_file():raise ValueError('没有交付渲染记录')
    manifest=read_json(mp);errors=[];files=[]
    if manifest.get('input_fingerprint')!=fingerprint(project,task,v):errors.append('输入或工程已变化，旧产物失效')
    for item in outputs(task,v):
        path=inside(root,item['path']);issues=verify_file(path,item,v,c);record=manifest.get('outputs',{}).get(item['path'])
        if not record or not path.is_file() or sha256(path)!=record.get('sha256'):issues.append('缺少本轮记录或文件被改动')
        files.append(dict(path=item['path'],ok=not issues,errors=issues));errors.extend(issues)
    report=dict(ok=not errors,checked_at=now(),scope='delivery_technical',files=files,errors=errors,visual_review='not_run',audio_review='not_run')
    write_json(root/'work/preview/delivery-check.json',report)
    if errors:raise RuntimeError('；'.join(errors))
    return report


def _quoted_kinds(text, pattern, error):
    match=re.search(pattern, text, re.S)
    if not match:
        raise ValueError(error)
    kinds=re.findall(r'''["']([A-Za-z0-9_-]+)["']''', match.group(1))
    if not kinds or len(kinds)!=len(set(kinds)):
        raise ValueError(error)
    return kinds


def _mapping_keys(text):
    match=re.search(r'export const SCENE_COMPONENTS = \{(.*?)\} as const', text, re.S)
    if not match:
        raise ValueError('registry missing SCENE_COMPONENTS')
    keys=re.findall(r'(?m)^\s*([A-Za-z0-9_-]+)\s*:', match.group(1))
    if not keys or len(keys)!=len(set(keys)):
        raise ValueError('registry missing SCENE_COMPONENTS')
    return keys


def _kind_diff(expected, actual):
    missing=','.join(sorted(set(expected)-set(actual)))
    extra=','.join(sorted(set(actual)-set(expected)))
    return 'missing '+missing+' extra '+extra


def _reference(root, item):
    if 'reference' not in item:
        raise ValueError('reference not found: '+str(item.get('id')))
    ref=item.get('reference')
    if ref is None:
        notes=item.get('notes')
        if not isinstance(notes, str) or not notes.strip():
            raise ValueError('reference null requires notes: '+str(item.get('id')))
        return
    if not isinstance(ref, str) or not ref:
        raise ValueError('reference not found: '+str(item.get('id')))
    try:
        path=inside(root, ref)
    except ValueError:
        raise ValueError('reference not found: '+ref)
    if not path.is_file():
        raise ValueError('reference not found: '+ref)


def inspect(root):
    """校验 catalog、registry 与 Zod kind 一致，并解析 reference/source。失败为输入不合法（退出码 5）。"""
    catalog_path=root/SOURCE/'src/component-catalog.json'
    registry_path=root/SOURCE/'src/registry/index.ts'
    schema_path=root/SOURCE/'src/content.ts'
    if not catalog_path.is_file():
        raise ValueError('catalog missing')
    if not registry_path.is_file():
        raise ValueError('registry missing')
    if not schema_path.is_file():
        raise ValueError('schema missing')
    try:
        catalog=read_json(catalog_path)
    except json.JSONDecodeError:
        raise ValueError('catalog invalid')
    if catalog.get('schemaVersion')!='2.0':
        raise ValueError('catalog schemaVersion must be 2.0')
    registry=registry_path.read_text(encoding='utf-8')
    schema=schema_path.read_text(encoding='utf-8')
    if 'Unknown scene kind:' not in registry:
        raise ValueError('registry missing Unknown scene kind')
    known=_quoted_kinds(registry, r'export const KNOWN_KINDS = \[(.*?)\] as const', 'registry missing KNOWN_KINDS')
    mapped=_mapping_keys(registry)
    zod=re.findall(r'''variant\(['"]([A-Za-z0-9_-]+)['"]\)''', schema)
    if set(known)!=set(mapped) or len(mapped)!=len(set(mapped)):
        raise ValueError('registry kind mismatch: '+_kind_diff(known, mapped))
    if set(known)!=set(zod) or len(zod)!=len(set(zod)):
        raise ValueError('zod kind mismatch: '+_kind_diff(known, zod))
    scenes=catalog.get('scenes')
    components=catalog.get('components')
    if not isinstance(scenes, list) or not scenes:
        raise ValueError('catalog scenes missing')
    if not isinstance(components, list) or not components:
        raise ValueError('catalog components missing')
    scene_kinds=[]
    for item in scenes:
        kind=item.get('kind') if isinstance(item, dict) else None
        if not isinstance(kind, str) or not kind:
            raise ValueError('catalog kind mismatch: empty kind')
        scene_kinds.append(kind)
    if len(scene_kinds)!=len(set(scene_kinds)):
        dup=','.join(sorted({k for k in scene_kinds if scene_kinds.count(k)>1}))
        raise ValueError('duplicate catalog kind: '+dup)
    if set(scene_kinds)!=set(known):
        raise ValueError('catalog kind mismatch: '+_kind_diff(known, scene_kinds))
    for item in list(components)+list(scenes):
        if not isinstance(item, dict) or not item.get('id'):
            raise ValueError('catalog id missing')
        _reference(root, item)
        source=item.get('source')
        try:
            path=inside(root/SOURCE, source)
        except ValueError:
            raise ValueError('source not found: '+str(source))
        if not path.is_file():
            raise ValueError('source not found: '+str(source))
    return {'schemaVersion':'2.0','kinds':known,'scenes':len(scenes),'components':len(components)}


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__,allow_abbrev=False);parser.add_argument('--root',type=Path,default=ROOT)
    cmds=parser.add_subparsers(dest='command',required=True)
    for cmd in ('env','validate','check','verify'):cmds.add_parser(cmd)
    p=cmds.add_parser('init');p.add_argument('--install',action='store_true')
    p=cmds.add_parser('preview');p.add_argument('--frames')
    p=cmds.add_parser('render');p.add_argument('--only',choices=('all','video','covers'),default='all')
    cmds.add_parser('inspect')
    args=parser.parse_args(argv);root=args.root.resolve()
    try:
        if args.command=='env':
            missing=[x for x in ('node','npm','python3','ffmpeg','ffprobe') if not shutil.which(x)]
            if missing:print(json.dumps(dict(ok=False,missing=missing)));return 3
            result=dict(api_key_required=False,browser='CHROME_PATH or Remotion headless shell; tested by check')
        elif args.command=='init':result=init(root,args.install)
        elif args.command in ('validate','check'):validate(root,args.command=='check');result={'report':str(root/'work/preview/check-report.json')}
        elif args.command=='preview':result=preview(root,args.frames)
        elif args.command=='render':result=render(root,args.only)
        elif args.command=='inspect':result=inspect(root)
        else:result=verify(root)
        print(json.dumps({'ok':True,**result},ensure_ascii=False));return 0
    except (OSError,ValueError,KeyError,TypeError,RuntimeError,subprocess.SubprocessError) as error:
        report=dict(ok=False,command=args.command,error=str(error),checked_at=now())
        if (root/'work/task.json').is_file():
            write_json(root/'work/preview/last-command.json',report)
            if args.command in ('check','validate','verify'):write_json(root/('work/preview/delivery-check.json' if args.command=='verify' else 'work/preview/check-report.json'),report)
        print(json.dumps(report,ensure_ascii=False));return 5 if isinstance(error,(ValueError,KeyError,TypeError)) else 7


if __name__=='__main__':sys.exit(main())

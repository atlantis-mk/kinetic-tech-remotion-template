#!/usr/bin/env python3
"""Real browser smoke renders, isolated in ignored tests/artifacts/. No template-root work/.

python3 tests/smoke_pipeline.py [--full]
--full also renders the complete default 60s example. Otherwise default is a 2s clip.
"""
import copy
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.agents/skills/make-video/scripts'))
import pipeline as pipe
from pipeline_lib import read_json,write_json,probe,verify_file


def command(argv,cwd):
    subprocess.run([str(a) for a in argv],cwd=cwd,check=True)


def setup(name, resume=False):
    root=ROOT/'tests/artifacts'/name
    if root.exists():
        if resume:return root
        raise ValueError('为保留先前结果，请先改名或移走 '+str(root))
    shutil.copytree(ROOT/'.agents',root/'.agents',ignore=pipe.IGNORED)
    pipe.init(root,install=True)
    return root


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--full',action='store_true');parser.add_argument('--resume',action='store_true');args=parser.parse_args()
    root=setup('landscape',args.resume);project=root/'work/project'
    # Full default content and every scene's middle and boundaries.
    if args.resume and (root/'work/preview/render-manifest.json').is_file():
        if args.full:pipe.verify(root)
    else:
        pipe.preview(root,'0-59')
        pipe.render(root,'all' if args.full else 'covers')
        if args.full:pipe.verify(root)
    # Portrait, changed topic/numbers, repeated/reordered scenes, media inputs, custom audio and captions.
    portrait=setup('portrait',args.resume);pp=portrait/'work/project';c=read_json(pp/'content.json')
    original={s['kind']:s for s in c['scenes']}
    chip=original['chip'];chip.update(id='new-chip',duration=2,title='边缘设备如何工作',summary='从传感器输入，到设备本地完成计算。');chip['data'].update(cost=12,revenue=64,badge='EDGE / DEMO')
    percentage=original['percentage'];percentage.update(duration=2,title='减少云端往返');percentage['data'].update(value=72,conclusion='就地处理输入数据')
    # Use own reference SVG and a deterministic test video. Input files copied to public/.
    (pp/'public/media').mkdir(exist_ok=True)
    shutil.copyfile(pp/'public/chip-surface.svg',pp/'public/media/board.svg')
    command(['ffmpeg','-y','-v','error','-f','lavfi','-i','testsrc2=size=640x360:rate=30','-t','2','-c:v','libx264','-pix_fmt','yuv420p',pp/'public/media/test.mp4'],pp)
    command(['ffmpeg','-y','-v','error','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','0.8','-c:a','pcm_s16le',pp/'public/media/test.wav'],pp)
    media=lambda id,file,type:dict(id=id,kind='media',duration=2,title='边缘计算演示',summary='验证真实媒体的加载、缩放与时序。',data=dict(file=file,type=type,fit='contain',eyebrow='MEDIA INPUT'))
    c['scenes']=[percentage,chip,media('image','media/board.svg','image'),media('video','media/test.mp4','video')]
    c['video']['aspect']='9:16';c['brand']='EDGE / ADAPTED DEMO';c['cover'].update(sceneId='new-chip',title='让计算\n靠近现场',subtitle='边缘设备与本地处理',progress=.8)
    c['audio']['voiceover']=dict(file='media/test.wav',start=0,volume=.1)
    c['audio']['cues']=[dict(file='media/test.wav',at=4,duration=.8,volume=.08)]
    c['subtitles']=[dict(start=0,end=2,text='72% 为布局演示数据')]
    write_json(pp/'content.json',c)
    pipe.render(portrait,'all');pipe.verify(portrait)
    # Actually render a fully silent branch, not merely a false boolean in schema.
    portrait_content=copy.deepcopy(c)
    c['audio']=dict(sfx=dict(enabled=False,volume=0),voiceover=None,cues=[])
    c['scenes']=c['scenes'][:1];c['cover']['sceneId']=c['scenes'][0]['id']
    write_json(pp/'content.json',c)
    pipe.validate(portrait,technical=True)
    silence=portrait/'work/preview/silent.mp4'
    pipe.render_call(pp,'video','Main',silence,portrait/'work/preview/render.log')
    assert not any(s['codec_type']=='audio' for s in probe(silence)['streams']), 'Silent video unexpectedly has audio'
    # Restore the tested portrait delivery config so its manifest remains verifiable.
    write_json(portrait/'work/preview/silent-config.json',c)
    write_json(pp/'content.json',portrait_content)
    pipe.verify(portrait)
    report=dict(default_full_video=args.full,landscape='passed',portrait_changed_topic='passed',media_inputs='passed',external_audio_input='test tone passed; speech alignment not implemented',silent_branch='passed',covers='three full-size layouts passed',visual_review='not_run',audio_listening_review='not_run')
    write_json(ROOT/'tests/artifacts/smoke-report.json',report)
    print(json.dumps(report,ensure_ascii=False))


if __name__=='__main__':main()

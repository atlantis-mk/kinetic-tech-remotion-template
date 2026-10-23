"""Regression checks in isolated temporary roots; no root work/ or rendering side effects."""
import copy
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
SCRIPTS=ROOT/'.agents/skills/make-video/scripts'
sys.path.insert(0,str(SCRIPTS))
import pipeline as pipe
from pipeline_lib import fingerprint, inside, outputs, read_json, write_json
SOURCE=ROOT/pipe.SOURCE


class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(prefix='kinetic template 测试 ')
        self.root=Path(self.tmp.name)
        shutil.copytree(ROOT/'.agents',self.root/'.agents',ignore=pipe.IGNORED)
        pipe.init(self.root)
        self.project=self.root/'work/project'
        # Reuse the explicitly installed dependencies; npm ci is tested by smoke_pipeline.
        if (SOURCE/'node_modules').is_dir():
            (self.project/'node_modules').symlink_to(SOURCE/'node_modules',target_is_directory=True)

    def tearDown(self):self.tmp.cleanup()

    def schema(self,content):
        write_json(self.project/'content.json',content)
        return subprocess.run(['node','scripts/content.cjs','validate'],cwd=self.project,capture_output=True,text=True)

    def test_init_preserves_edits_and_state(self):
        (self.project/'sentinel.txt').write_text('edited')
        task=read_json(self.root/'work/task.json');task['stage']='preview';write_json(self.root/'work/task.json',task)
        pipe.init(self.root)
        self.assertEqual((self.project/'sentinel.txt').read_text(),'edited')
        self.assertEqual(read_json(self.root/'work/task.json')['stage'],'preview')

    def test_env_does_not_initialize_root(self):
        isolated=self.root/'unused';isolated.mkdir()
        self.assertEqual(pipe.main(['--root',str(isolated),'env']),0)
        self.assertFalse((isolated/'work').exists())

    def test_real_schema_and_temporal_checks(self):
        c=read_json(SOURCE/'content.json')
        self.assertEqual(self.schema(c).returncode,0)
        for mutate in [lambda x:x['scenes'][0].update(duration=0),
                       lambda x:x['scenes'][1].update(id=x['scenes'][0]['id']),
                       lambda x:x['scenes'][0]['data'].update(surface='../secret.png'),
                       lambda x:x['cover'].update(sceneId='missing'),
                       lambda x:x.update(subtitles=[dict(start=0,end=5,text='a'),dict(start=4,end=6,text='b')]),
                       lambda x:x['audio'].update(cues=[dict(file='x.wav',at=59,duration=5,volume=1)])]:
            bad=copy.deepcopy(c);mutate(bad)
            with self.subTest(bad=bad):self.assertNotEqual(self.schema(bad).returncode,0)

    def test_missing_voice_is_explicit(self):
        c=read_json(self.project/'content.json');c['audio']['voiceover']=dict(file='audio/missing.wav',start=0,volume=1)
        write_json(self.project/'content.json',c)
        with self.assertRaisesRegex(ValueError,'素材缺失'):pipe.validate(self.root)

    def test_fingerprint_covers_media_and_sources(self):
        d=pipe.describe(self.project);task=read_json(self.root/'work/task.json');v=d['video']
        old=fingerprint(self.project,task,v)
        (self.project/'public/extra.svg').write_text('<svg/>')
        self.assertNotEqual(old,fingerprint(self.project,task,v))
        with self.assertRaises(ValueError):inside(self.project,'../escape')

    def test_stale_and_tampered_delivery_rejected(self):
        d=pipe.describe(self.project);task=read_json(self.root/'work/task.json');v=d['video']
        task['deliverables']=[dict(type='cover',path='work/delivery/cover.png',width=1600,height=1200)]
        write_json(self.root/'work/task.json',task)
        dest=self.root/'work/delivery/cover.png';dest.write_bytes(b'old output')
        from pipeline_lib import sha256
        write_json(self.root/'work/preview/render-manifest.json',dict(input_fingerprint=fingerprint(self.project,task,v),outputs={'work/delivery/cover.png':dict(sha256=sha256(dest))}))
        with patch.object(pipe,'validate',return_value=(task,self.project,d['content'],v,d['timeline'])),patch.object(pipe,'verify_file',return_value=[]):
            self.assertTrue(pipe.verify(self.root)['ok'])
            (self.project/'public/grain.png').write_bytes(b'changed')
            with self.assertRaisesRegex(RuntimeError,'旧产物失效'):pipe.verify(self.root)
            dest.write_bytes(b'tampered')
            with self.assertRaisesRegex(RuntimeError,'文件被改动'):pipe.verify(self.root)

    def test_audio_is_deterministic_and_timeline_driven(self):
        import wave
        from pipeline_lib import sha256
        c=read_json(self.project/'content.json')
        c['scenes']=c['scenes'][:2]
        for item in c['scenes']:item['duration']=2
        c['cover']['sceneId']=c['scenes'][0]['id']
        write_json(self.project/'content.json',c)
        def build():
            subprocess.run(['node','scripts/build-audio.mjs'],cwd=self.project,check=True,capture_output=True)
            return sha256(self.project/'public/audio/sfx.wav')
        first=build();self.assertEqual(first,build())
        with wave.open(str(self.project/'public/audio/sfx.wav')) as stream:
            self.assertEqual(stream.getnframes()/stream.getframerate(),4)
            self.assertEqual(stream.getnchannels(),2)
        c['scenes'].reverse();write_json(self.project/'content.json',c)
        self.assertNotEqual(first,build())

    def test_failed_render_preserves_previous_output(self):
        d=pipe.describe(self.project);task=read_json(self.root/'work/task.json');v=d['video']
        task['deliverables']=[dict(type='cover',path='work/delivery/cover.png',width=1600,height=1200)]
        dest=self.root/'work/delivery/cover.png';dest.write_bytes(b'previous valid file')
        def fail(*args):
            args[3].write_bytes(b'incomplete');raise RuntimeError('simulated failure')
        with patch.object(pipe,'validate',return_value=(task,self.project,d['content'],v,d['timeline'])),patch.object(pipe,'render_call',side_effect=fail):
            with self.assertRaises(RuntimeError):pipe.render(self.root,'covers')
        self.assertEqual(dest.read_bytes(),b'previous valid file')
        self.assertFalse(dest.with_name('.rendering-cover.png').exists())
        self.assertFalse((self.root/'work/preview/render-manifest.json').exists())


if __name__=='__main__':unittest.main()

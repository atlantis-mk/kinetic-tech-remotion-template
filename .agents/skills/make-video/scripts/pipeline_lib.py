"""Deterministic filesystem/media checks. Does not judge visual or listening quality."""
import hashlib
import json
import struct
import subprocess
from datetime import datetime
from pathlib import Path


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def write_json(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + '.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temp.replace(path)


def now():
    return datetime.now().astimezone().isoformat(timespec='seconds')


def inside(base, relative):
    if not isinstance(relative, str) or not relative or Path(relative).is_absolute():
        raise ValueError('需要非空相对路径')
    path = (Path(base) / relative).resolve()
    if not path.is_relative_to(Path(base).resolve()):
        raise ValueError('路径超出允许目录：' + relative)
    return path


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def probe(path):
    result = subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)], capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def outputs(task, video):
    items = task.get('deliverables') or [
        dict(path='work/delivery/video.mp4', type='video', width=video['width'], height=video['height']),
        dict(path='work/delivery/cover-4x3.png', type='cover', width=1600, height=1200),
        dict(path='work/delivery/cover-3x4.png', type='cover', width=1200, height=1600),
        dict(path='work/delivery/cover-16x9.png', type='cover', width=1920, height=1080)]
    seen = set()
    for item in items:
        path = Path(item['path'])
        if path.is_absolute() or path.parent.as_posix() != 'work/delivery' or item['path'] in seen:
            raise ValueError('交付项须为 work/delivery/ 内不重复的直接文件')
        seen.add(item['path'])
        if item['type'] not in ('video', 'cover'):
            raise ValueError('交付类型仅支持 video / cover')
        if path.suffix != ('.mp4' if item['type'] == 'video' else '.png'):
            raise ValueError('交付扩展名与类型不符')
        wh = (item['width'], item['height'])
        if item['type'] == 'cover' and wh not in ((1600, 1200), (1200, 1600), (1920, 1080)):
            raise ValueError('封面仅支持内置三种尺寸')
        if item['type'] == 'video' and wh != (video['width'], video['height']):
            raise ValueError('交付视频尺寸与 content.json 不一致')
    return items


def fingerprint(project, task, video):
    h = hashlib.sha256()
    for name in ('src', 'public', 'scripts', 'content.json', 'package.json', 'package-lock.json', 'tsconfig.json'):
        path = project / name
        files = sorted(p for p in path.rglob('*') if p.is_file()) if path.is_dir() else [path]
        for file in files:
            if file.is_file():
                h.update(file.relative_to(project).as_posix().encode())
                h.update(sha256(file).encode())
    h.update(json.dumps(outputs(task, video), sort_keys=True).encode())
    return h.hexdigest()


def expected_audio(content):
    a = content['audio']
    return (a['sfx']['enabled'] and a['sfx']['volume'] > 0) or (a['voiceover'] and a['voiceover']['volume'] > 0) or any(c['volume'] > 0 for c in a['cues'])


def verify_file(path, item, video, content):
    errors = []
    if not path.is_file():
        return ['文件不存在']
    if item['type'] == 'cover':
        with open(path, 'rb') as stream:
            head = stream.read(24)
        if len(head) < 24 or head[:8] != b'\x89PNG\r\n\x1a\n':
            return ['不是有效 PNG']
        if struct.unpack('>II', head[16:24]) != (item['width'], item['height']):
            errors.append('封面尺寸不符')
    else:
        meta = probe(path)
        vs = next((s for s in meta['streams'] if s['codec_type'] == 'video'), None)
        audio = next((s for s in meta['streams'] if s['codec_type'] == 'audio'), None)
        if not vs:
            return ['缺少视频流']
        if (vs['width'], vs['height']) != (video['width'], video['height']):
            errors.append('视频尺寸不符')
        num, den = map(int, vs['avg_frame_rate'].split('/'))
        if abs(num / den - video['fps']) > .001:
            errors.append('帧率不符')
        if abs(float(vs.get('duration', meta['format']['duration'])) - video['duration']) > 1/video['fps']+.01:
            errors.append('时长不符')
        if expected_audio(content) and not audio:
            errors.append('预期音轨缺失')
        if audio and abs(float(audio.get('duration', meta['format']['duration'])) - video['duration']) > .1:
            errors.append('音视频时长差超过 0.1 秒')
    decoded = subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(path), '-f', 'null', '-'], capture_output=True, text=True)
    if decoded.returncode:
        errors.append('完整解码失败：' + decoded.stderr[-400:])
    return errors

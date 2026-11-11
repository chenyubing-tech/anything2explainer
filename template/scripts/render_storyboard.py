#!/usr/bin/env python3
"""把 script/storyboard_src.md 中的时间令牌替换成 script/timeline.json 里的帧号，输出 项目根/分镜表.md。
令牌：{S12.from} {S12.to} {S12.c3}（第 3 个字幕块起始帧）{C2}（第 2 章起始帧）{TOTAL}；均可带 ±整数：{S12.from-8}"""
import json, re, sys, os

# Keep CLI diagnostics readable when Windows redirects output with a legacy code page.
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, 'reconfigure'):
        _stream.reconfigure(encoding='utf-8')
here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # 项目根
tl = json.load(open(f'{here}/script/timeline.json', encoding='utf-8'))
S = {s['id']: s for s in tl['sentences']}
C = {c['n']: c['from'] for c in tl['chapters']}
def sub(m):
    key, field, off = m.group(1), m.group(2), int(m.group(3) or 0)
    if key == 'TOTAL':
        if field is not None: raise SystemExit(f'bad token {m.group(0)}')
        v = tl['total_frames']
    elif key.startswith('C'):
        if field is not None: raise SystemExit(f'bad token {m.group(0)}')
        v = C[int(key[1:])]
    else:
        s = S[key]
        if field == 'from': v = s['from']
        elif field == 'to': v = s['to']
        elif field and field.startswith('c'):
            index = int(field[1:])
            if index < 1 or index > len(s['subs']):
                raise SystemExit(f'字幕块不存在: {m.group(0)}')
            v = s['subs'][index - 1]['from']
        else: raise SystemExit(f'bad token {m.group(0)}')
    return str(v + off)
src = open(f'{here}/script/storyboard_src.md', encoding='utf-8').read()
try:
    out = re.sub(r'\{(S\d+|C\d+|TOTAL)(?:\.(from|to|c\d+))?([+-]\d+)?\}', sub, src)
except (KeyError, IndexError) as error:
    raise SystemExit(f'时间令牌引用不存在: {error}')
left = re.findall(r'\{(?:S\d+|C\d+|TOTAL)[^}]*\}', out)
if left:
    raise SystemExit(f'时间令牌未解析，未写入分镜表: {left[:5]}')
open(f'{here}/分镜表.md', 'w', encoding='utf-8').write(out)
print('written 分镜表.md; all timing tokens resolved')

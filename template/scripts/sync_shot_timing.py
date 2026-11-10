#!/usr/bin/env python3
"""同步分镜表中的镜头区间到 timing.ts。

分镜表由 tts_build.py 生成后，镜头区间可能因为旁白时长变化而改变。
镜头源码继续使用基准帧，CURRENT_RANGES 负责把 Sequence 的本地帧映射回基准时间轴。
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


ROW_RE = re.compile(
    r"^\|\s*(SC\d+)\b.*?\|\s*(\d+)\s*[–—-]\s*(\d+)\s*\|"
)
START_MARKER = "export const CURRENT_RANGES: Record<string, ShotRange> = {"


def read_ranges(storyboard: Path) -> dict[str, tuple[int, int]]:
    ranges: dict[str, tuple[int, int]] = {}
    for line in storyboard.read_text(encoding="utf-8").splitlines():
        match = ROW_RE.match(line)
        if match:
            shot, start, end = match.groups()
            ranges[shot] = (int(start), int(end))
    if not ranges:
        raise SystemExit(f"未在分镜表中找到镜头区间: {storyboard}")
    return ranges


def replace_current_ranges(source: str, ranges: dict[str, tuple[int, int]]) -> str:
    start = source.find(START_MARKER)
    if start < 0:
        raise SystemExit("timing.ts 中缺少 CURRENT_RANGES 区块")
    end = source.find("\n};", start)
    if end < 0:
        raise SystemExit("timing.ts 中 CURRENT_RANGES 区块没有正确闭合")
    end += len("\n};")

    lines = [
        "// 由分镜表同步的当前区间；初始值与基准时间轴相同。",
        "export const CURRENT_RANGES: Record<string, ShotRange> = {",
    ]
    for shot in sorted(ranges, key=lambda value: int(value[2:])):
        start_frame, end_frame = ranges[shot]
        lines.append(f"  {shot}: {{from: {start_frame}, to: {end_frame}}},")
    lines.append("};")
    block = "\n".join(lines)
    return source[:start] + block + source[end:]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--storyboard", required=True, type=Path, help="生成后的分镜表 Markdown")
    parser.add_argument(
        "--timing",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "src" / "timing.ts",
        help="要更新的 timing.ts，默认更新 template/src/timing.ts",
    )
    args = parser.parse_args()

    ranges = read_ranges(args.storyboard)
    timing = args.timing
    source = timing.read_text(encoding="utf-8")
    timing.write_text(replace_current_ranges(source, ranges), encoding="utf-8", newline="\n")
    print(f"已同步 {len(ranges)} 个镜头到 {timing}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
build_scry2uuid.py
──────────────────
AllIdentifiers.json(.gz)  ➜  {"<scryfallId>": "<uuid>", …}

사용법:
    python3 scry2uuid.py /path/AllIdentifiers.json.gz  output/scry2uuid.json
"""

import gzip
import ijson
import json
import sys
from pathlib import Path
from typing import TextIO, Iterator


def open_json(path: Path) -> TextIO:
    """gzip 여부와 상관없이 텍스트 스트림으로 열기."""
    return gzip.open(path, "rt", encoding="utf-8") if path.suffix == ".gz" else open(path, "r", encoding="utf-8")


def iter_records(stream: TextIO) -> Iterator[tuple[str, dict]]:
    """
    AllIdentifiers 구조:
      {
        "meta": {...},
        "data": {
          "<uuid>": { "identifiers": { "scryfallId": "…" }, ... },
          ...
        }
      }
    → (uuid, card_obj) 스트리밍 추출
    """
    yield from ijson.kvitems(stream, "data")


def build_map(src: Path, dst: Path) -> None:
    first = True
    with open_json(src) as f, open(dst, "w", encoding="utf-8") as out:
        out.write("{\n")
        for uuid, card in iter_records(f):
            scry = card.get("identifiers", {}).get("scryfallId")
            if not scry:
                continue
            if not first:
                out.write(",\n")
            first = False
            # scryfallId는 대·소문자 혼재 → 소문자로 정규화
            out.write(json.dumps(scry.lower()))
            out.write(":")
            out.write(json.dumps(uuid))
        out.write("\n}\n")

    size = dst.stat().st_size / 1024**2
    print(f"✔ 완료: {dst}  ({size:,.1f} MB)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("Usage: scry2uuid.py <AllIdentifiers.json[.gz]> <output.json>")
    src, dst = map(Path, sys.argv[1:])
    build_map(src, dst)

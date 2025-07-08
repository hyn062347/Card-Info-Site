#!/usr/bin/env python3
"""
build_ck_retail.py
──────────────────
AllPrices.json(.gz)  ➜  { uuid: {normal, foil}, … }

사용법:
    python3 ck_retail.py AllPrices.json.gz output/ck_retail.json
        # --csv 플래그를 주면 CSV 로 저장
"""

import argparse
import gzip
import ijson
import json
from pathlib import Path
from typing import Iterator, Tuple, AnyStr, Dict
from decimal import Decimal


def open_json(path: Path):
    "gzip 여부와 상관없이 텍스트 스트림 반환"
    return gzip.open(path, "rt", encoding="utf-8") if path.suffix == ".gz" else open(path, "r", encoding="utf-8")


def kv_iter(stream):
    """
    'data' 블록 아래 (uuid, price_obj) 스트리밍
    """
    yield from ijson.kvitems(stream, "data")


def latest_price(history: dict | None):
    if not history:
        return None
    for date in sorted(history.keys(), reverse=True):
        price = history[date]
        if price is not None:
            # Decimal → float (또는 str로도 가능)
            return float(price) if isinstance(price, Decimal) else price
    return None


def build_map(src: Path) -> Dict[str, dict]:
    result: Dict[str, dict] = {}
    with open_json(src) as f:
        for uuid, obj in kv_iter(f):
            ck_retail = (
                obj.get("paper", {})
                   .get("cardkingdom", {})
                   .get("retail", {})
            )

            # normal / foil 가장 최근가
            normal = latest_price(ck_retail.get("normal"))
            foil   = latest_price(ck_retail.get("foil"))

            # 둘 다 None이면 굳이 넣지 않음
            if normal is not None or foil is not None:
                result[uuid] = {"normal": normal, "foil": foil}

    return result


def main():
    p = argparse.ArgumentParser()
    p.add_argument("src", type=Path, help="AllPrices.json[.gz]")
    p.add_argument("dst", type=Path, help="출력 파일 (.json or .csv)")
    p.add_argument("--csv", action="store_true", help="CSV 형식으로 저장")
    args = p.parse_args()

    price_map = build_map(args.src)

    args.dst.parent.mkdir(parents=True, exist_ok=True)

    if args.csv or args.dst.suffix == ".csv":
        import csv
        with open(args.dst, "w", newline="", encoding="utf-8") as out:
            w = csv.writer(out)
            w.writerow(["uuid", "normal", "foil"])
            for uuid, data in price_map.items():
                w.writerow([uuid, data.get("normal"), data.get("foil")])
    else:
        with open(args.dst, "w", encoding="utf-8") as out:
            json.dump(price_map, out, separators=(",", ":"))

    size_mb = args.dst.stat().st_size / 1024**2
    print(f"✓ 완료: {args.dst}  ({size_mb:,.2f} MB)")


if __name__ == "__main__":
    main()
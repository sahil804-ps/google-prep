"""Check that every video in js/data/videos.js, problems.js and bonus.js exists and allows embedding.

Run: python tools/check_videos.py            (concept videos only)
     python tools/check_videos.py --all      (also every problem video)
"""
import concurrent.futures
import pathlib
import re
import sys
import urllib.error
import urllib.request

DATA = pathlib.Path(__file__).resolve().parent.parent / "js" / "data"


def ids_from(path, pattern):
    return re.findall(pattern, path.read_text(encoding="utf-8"))


def embeddable(vid):
    url = f"https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v={vid}"
    try:
        urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=20)
        return vid, "ok"
    except urllib.error.HTTPError as e:
        return vid, f"HTTP {e.code}"
    except Exception as e:  # noqa: BLE001 - report any network failure
        return vid, str(e)


def main():
    ids = ids_from(DATA / "videos.js", r"v\('([\w-]{11})'")
    if "--all" in sys.argv:
        for f in ("problems.js", "bonus.js"):
            ids += ids_from(DATA / f, r'"video": "([\w-]{11})"')
    ids = sorted(set(ids))
    with concurrent.futures.ThreadPoolExecutor(8) as pool:
        results = list(pool.map(embeddable, ids))
    bad = [r for r in results if r[1] != "ok"]
    print(f"checked {len(ids)} videos, {len(bad)} problems")
    for vid, why in bad:
        print("  ", vid, why)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()

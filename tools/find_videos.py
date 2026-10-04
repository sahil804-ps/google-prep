"""Print the top YouTube results for each curriculum query, to hand-pick concept videos.

Run: python tools/find_videos.py > videos.txt
"""
import json
import re
import sys
import urllib.parse
import urllib.request

QUERIES = {
    "Arrays & Hashing": "hash map hash table data structure explained",
    "Two Pointers": "two pointers technique explained leetcode",
    "Sliding Window": "sliding window technique explained",
    "Stack": "stack data structure monotonic stack explained",
    "Binary Search": "binary search algorithm explained",
    "Linked List": "linked list data structure explained",
    "Trees": "binary tree traversal dfs bfs explained",
    "Tries": "trie data structure explained",
    "Heap / Priority Queue": "heap priority queue data structure explained",
    "Backtracking": "backtracking algorithm explained",
    "Graphs": "graph algorithms bfs dfs explained",
    "Advanced Graphs": "dijkstra algorithm explained",
    "1-D Dynamic Programming": "dynamic programming for beginners",
    "2-D Dynamic Programming": "2d dynamic programming explained grid lcs",
    "Greedy": "greedy algorithms explained",
    "Intervals": "merge intervals pattern explained",
    "Math & Geometry": "matrix rotation spiral leetcode explained",
    "Bit Manipulation": "bit manipulation explained",
    "b1": "big o notation explained",
    "b2": "recursion explained for beginners",
    "b3": "merge sort quick sort explained",
    "b4": "prefix sum explained",
    "b5": "python for coding interviews",
    "sdl1": "system design interview framework",
    "sdl2": "horizontal vs vertical scaling",
    "sdl3": "load balancer explained system design",
    "sdl4": "caching system design explained",
    "sdl5": "sql vs nosql explained",
    "sdl6": "database sharding explained",
    "sdl7": "message queue explained system design",
    "sdl8": "cap theorem explained",
    "sdl9": "rest vs grpc vs graphql",
    "sdl10": "sli slo sla explained",
    "sdl11": "distributed test execution infrastructure",
    "tdl1": "testing pyramid explained",
    "tdl2": "unit testing best practices",
    "tdl3": "mocks stubs fakes test doubles explained",
    "tdl4": "equivalence partitioning boundary value analysis",
    "tdl5": "integration testing vs end to end testing",
    "tdl6": "flaky tests explained",
    "tdl7": "continuous integration explained",
    "tdl8": "canary deployment feature flags explained",
    "tdl9": "load testing vs stress testing",
    "tdl10": "api testing explained",
    "tdl11": "how to test machine learning models",
}


def search(q):
    url = "https://www.youtube.com/results?hl=en&gl=IN&search_query=" + urllib.parse.quote(q)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "en"})
    html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
    m = re.search(r"var ytInitialData = (\{.*?\});</script>", html)
    if not m:
        return []
    out = []

    def walk(node):
        if isinstance(node, dict):
            vr = node.get("videoRenderer")
            if vr and "videoId" in vr:
                title = "".join(r.get("text", "") for r in vr.get("title", {}).get("runs", []))
                chan = "".join(r.get("text", "") for r in vr.get("ownerText", {}).get("runs", []))
                length = vr.get("lengthText", {}).get("simpleText", "")
                views = vr.get("viewCountText", {}).get("simpleText", "")
                out.append((vr["videoId"], title, chan, length, views))
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(json.loads(m.group(1)))
    return out[:5]


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    for key, q in QUERIES.items():
        print(f"== {key} :: {q}")
        for r in search(q):
            print("   ", " | ".join(r))

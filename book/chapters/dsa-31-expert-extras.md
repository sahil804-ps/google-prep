# Expert Extras: Beyond NeetCode 150

> **In this chapter:**
> - Learn advanced tools that sometimes appear in strong interview loops
> - Know when to use each tool, with working Python code and its complexity
> - Cover monotonic deque, union-find, topological sort variants, Fenwick and segment trees, KMP and Rabin-Karp, bitmask DP, Dijkstra variants and 0-1 BFS, LRU cache, reservoir sampling and randomised algorithms
>
> **Time:** ~90 minutes (study over several days)  |  **Level:** Expert

## How to use this chapter

The NeetCode 150 list covers most interview patterns. This chapter is the "extra 10%". Study it only **after** you are comfortable with the core patterns (around week 11 of the plan). Do not try to memorise every line. For each tool, learn three things:

1. **The signal:** which words in a problem should make you think of it.
2. **The core idea** in one sentence.
3. **The complexity**, so you can explain why it beats the simple approach.

Then type each code block from memory two or three times over the next weeks.

## 1. Monotonic deque

**When to use:** "maximum (or minimum) in every window of size k", or DP where you need the best value from the last k positions.

**Idea:** a **deque** (double-ended queue, from `collections`) lets you add and remove at both ends in O(1). Keep indices in the deque so their values are **decreasing**. The front is always the maximum of the current window. Think of a queue at a bus stop where a tall person arriving makes all shorter people in front of them leave, because they can never be "the tallest" again while the tall person is there.

```python
from collections import deque

def max_sliding_window(nums, k):
    dq, out = deque(), []          # dq holds indices; values decreasing
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()               # smaller values can never be max again
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()           # front index left the window
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out

print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))
# Output: [3, 3, 5, 5, 6, 7]
```

**Complexity:** O(n) time, because each index is pushed and popped at most once. O(k) space. A heap would give O(n log n).

## 2. Union-find (disjoint set union)

**When to use:** "connected components", "are these two in the same group?", "redundant connection", "number of provinces", accounts merging, and Kruskal's minimum spanning tree.

**Idea:** every element points to a **parent**. Following parents leads to the group's **root**, which names the group. Two improvements make it very fast:

- **Path compression:** during `find`, point every visited node directly at the root, so later finds are short.
- **Union by rank:** attach the shorter tree under the taller one, so trees stay flat. **Rank** is an upper bound on tree height.

Think of company teams: each employee knows a manager, and following managers leads to the department head. Path compression is like everyone saving the head's phone number after asking once.

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))   # each node is its own root
        self.rank = [0] * n
        self.count = n                 # number of separate groups

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False               # already connected (cycle edge)
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra            # make ra the taller tree
        self.parent[rb] = ra           # union by rank
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        self.count -= 1
        return True

uf = UnionFind(5)
uf.union(0, 1); uf.union(3, 4)
print(uf.count, uf.find(0) == uf.find(1))   # Output: 3 True
```

**Complexity:** with both improvements, each operation is amortised O(α(n)), where α is the inverse Ackermann function. It grows so slowly that it is at most 4 or 5 for any realistic n, so you can call it "nearly constant". Space O(n).

## 3. Topological sort variants

A **topological order** lists the nodes of a **directed acyclic graph** (DAG: arrows, no cycles) so that every arrow goes from earlier to later. Think of getting ready in the morning: socks before shoes, shirt before tie.

**When to use:** "prerequisites", "build order", "course schedule", "alien dictionary", "can all tasks finish?"

### Kahn's algorithm (BFS)

Repeatedly take a node with **in-degree** 0 (no remaining arrows coming in).

```python
from collections import deque

def topo_sort(n, edges):               # edge (a, b): a before b
    graph = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in edges:
        graph[a].append(b)
        indeg[b] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in graph[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else []   # [] means a cycle exists

print(topo_sort(4, [(0, 1), (0, 2), (1, 3), (2, 3)]))  # [0, 1, 2, 3]
```

### Variants to know

- **Cycle detection:** if the order has fewer than n nodes, there is a cycle.
- **Lexicographically smallest order:** replace the deque with a min-heap (`heapq`), so you always pick the smallest available node. Time becomes O(V log V + E).
- **Minimum number of rounds** ("parallel courses", fewest semesters): process the queue **level by level**; the number of levels is the answer.
- **DFS with three colours:** white (unvisited), grey (on the current path), black (done). Meeting a grey node means a cycle. The reverse of the finishing order is a topological order.

```python
def has_cycle(n, edges):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
    state = [0] * n                    # 0 white, 1 grey, 2 black
    def dfs(u):
        state[u] = 1
        for v in graph[u]:
            if state[v] == 1 or (state[v] == 0 and dfs(v)):
                return True            # back edge to grey node = cycle
        state[u] = 2
        return False
    return any(state[i] == 0 and dfs(i) for i in range(n))

print(has_cycle(3, [(0, 1), (1, 2), (2, 0)]))   # Output: True
```

**Complexity:** O(V + E) time and space for both, where V is the number of nodes and E the number of edges.

## 4. Fenwick tree (binary indexed tree)

**When to use:** prefix sums **with updates**. For example, "range sum query - mutable", "count of smaller numbers after self", counting inversions.

**Idea:** a plain prefix-sum array answers range sums in O(1) but needs O(n) to update. A **Fenwick tree** stores partial sums so that both updates and prefix queries take O(log n). Each index is responsible for a block whose size is its lowest set bit, found with `i & -i`.

Think of a cricket scoreboard where you keep totals for overs 1-8, 9-12, 13-14 and so on. To get the total up to over 14, you add only a few blocks instead of every ball.

```python
class Fenwick:
    def __init__(self, n):
        self.tree = [0] * (n + 1)      # 1-based inside

    def update(self, i, delta):        # add delta at index i (0-based)
        i += 1
        while i < len(self.tree):
            self.tree[i] += delta
            i += i & -i                # move to next responsible block

    def prefix(self, i):               # sum of nums[0..i]
        i += 1
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & -i                # drop the lowest set bit
        return total

    def range_sum(self, l, r):         # sum of nums[l..r]
        return self.prefix(r) - self.prefix(l - 1)

fw = Fenwick(5)
for i, x in enumerate([2, 1, 5, 3, 4]):
    fw.update(i, x)
print(fw.range_sum(1, 3))              # Output: 9 (1 + 5 + 3)
```

**Complexity:** O(log n) per update and query; O(n log n) to build this way; O(n) space.

## 5. Segment tree

**When to use:** range queries with updates where the operation is not just a sum: range minimum, range maximum, GCD, or "count of something in a range". It is more flexible than a Fenwick tree.

**Idea:** a binary tree where each leaf holds one array element and each internal node holds the answer (for example, the sum) for the range covered by its children. The root covers the whole array. A query for any range combines O(log n) nodes. An update changes one leaf and the O(log n) nodes above it.

Picture a cricket tournament bracket. Each match node stores the winner of its sub-bracket. If one team's score changes, you update only the path from that team to the final.

The compact **bottom-up** version stores the tree in an array of size 2n. Leaves are at positions n to 2n-1, and node i has children 2i and 2i+1.

```python
class SegmentTree:
    def __init__(self, nums):
        self.n = len(nums)
        self.tree = [0] * self.n + list(nums)      # leaves at n..2n-1
        for i in range(self.n - 1, 0, -1):
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def update(self, i, val):                      # set nums[i] = val
        i += self.n
        self.tree[i] = val
        while i > 1:
            i //= 2
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def query(self, l, r):                         # sum of nums[l..r]
        res, l, r = 0, l + self.n, r + self.n + 1
        while l < r:
            if l & 1:
                res += self.tree[l]; l += 1
            if r & 1:
                r -= 1; res += self.tree[r]
            l //= 2; r //= 2
        return res

st = SegmentTree([2, 1, 5, 3, 4])
st.update(2, 10)
print(st.query(1, 3))                              # Output: 14 (1 + 10 + 3)
```

To make a range-minimum tree, replace `+` with `min` and start `res` at `float('inf')`. **Complexity:** O(n) build, O(log n) per query and update, O(n) space. Range *updates* (add 5 to every element in a range) need an advanced trick called **lazy propagation**; know the name and the idea (delay updates to children until needed).

## 6. String matching: KMP and Rabin-Karp

**When to use:** "find a pattern in a text" (`strStr`), "repeated substring pattern", "shortest palindrome", "longest duplicate substring". Python's `text.find(p)` works in practice, but interviewers may ask how to guarantee linear time.

### KMP

**KMP** (Knuth-Morris-Pratt) never moves backwards in the text. It precomputes the **LPS array** (longest proper prefix that is also a suffix) for the pattern. On a mismatch, LPS tells you how much of the pattern still matches, so you skip ahead instead of restarting.

```python
def build_lps(p):
    lps, length = [0] * len(p), 0
    for i in range(1, len(p)):
        while length and p[i] != p[length]:
            length = lps[length - 1]   # fall back to shorter border
        if p[i] == p[length]:
            length += 1
        lps[i] = length
    return lps

def kmp_search(text, p):
    if not p:
        return 0
    lps, j = build_lps(p), 0
    for i, ch in enumerate(text):
        while j and ch != p[j]:
            j = lps[j - 1]
        if ch == p[j]:
            j += 1
        if j == len(p):
            return i - len(p) + 1      # start index of first match
    return -1

print(build_lps("ababaca"))                  # [0, 0, 1, 2, 3, 0, 1]
print(kmp_search("abxabcabcaby", "abcaby"))  # Output: 6
```

**Complexity:** O(n + m) time for text length n and pattern length m; O(m) space.

### Rabin-Karp (rolling hash)

**Idea:** compute a numeric **hash** of the pattern and of each window of the text. A **rolling hash** updates the window hash in O(1) when the window slides by one character: remove the leftmost character's contribution, multiply, add the new character. Only when hashes match do you compare the actual strings, because different strings can share a hash (a **collision**).

```python
def rabin_karp(text, p):
    n, m = len(text), len(p)
    if m == 0:
        return 0
    if m > n:
        return -1
    base, mod = 256, 1_000_000_007
    high = pow(base, m - 1, mod)       # weight of the leftmost char
    hp = ht = 0
    for i in range(m):
        hp = (hp * base + ord(p[i])) % mod
        ht = (ht * base + ord(text[i])) % mod
    for i in range(n - m + 1):
        if hp == ht and text[i:i + m] == p:   # verify on hash match
            return i
        if i < n - m:                         # roll the window
            ht = ((ht - ord(text[i]) * high) * base + ord(text[i + m])) % mod
    return -1

print(rabin_karp("abxabcabcaby", "abcaby"))   # Output: 6
```

**Complexity:** O(n + m) expected; O(n · m) worst case if many collisions. Rolling hashes shine when comparing many substrings, for example binary search on length plus hashing for "longest duplicate substring".

## 7. Bitmask DP

**When to use:** n is small (around 20 or less) and the state is "which items have been used or visited". Examples: travelling salesman, "shortest path visiting all nodes", assigning tasks to workers, "partition into k equal-sum subsets".

**Idea:** represent a set of items as the bits of an integer, called a **mask**. Bit i is 1 if item i is in the set. `mask | (1 << i)` adds item i; `(mask >> i) & 1` checks it. Then do DP over masks.

Think of a delivery partner with a checklist of up to 15 addresses. Each tick pattern on the checklist is one mask.

```python
def tsp(dist):
    """Shortest tour starting and ending at city 0, visiting all cities."""
    n, INF = len(dist), float('inf')
    dp = [[INF] * n for _ in range(1 << n)]   # dp[mask][u]: at u, visited mask
    dp[1][0] = 0
    for mask in range(1 << n):
        for u in range(n):
            if dp[mask][u] == INF:
                continue
            for v in range(n):
                if (mask >> v) & 1:
                    continue                  # v already visited
                nxt = mask | (1 << v)
                dp[nxt][v] = min(dp[nxt][v], dp[mask][u] + dist[u][v])
    full = (1 << n) - 1
    return min(dp[full][u] + dist[u][0] for u in range(n))

d = [[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]
print(tsp(d))   # Output: 80
```

**Complexity:** O(2^n · n²) time and O(2^n · n) space. That is fine for n up to about 15-20 and impossible beyond, which is exactly the constraint signal from chapter dsa-03.

## 8. Dijkstra variants and 0-1 BFS

**When to use Dijkstra:** shortest path from one source in a graph with **non-negative** edge weights. Signals: "minimum cost", "minimum time", "network delay", weighted grid.

**Idea:** always expand the closest unfinished node, using a min-heap. Think of Google Maps style routing: from your location, you keep extending the cheapest known route first.

```python
import heapq

def dijkstra(n, edges, src):
    graph = [[] for _ in range(n)]
    for u, v, w in edges:
        graph[u].append((v, w))
    dist = [float('inf')] * n
    dist[src] = 0
    heap = [(0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue                       # stale entry, skip
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(heap, (dist[v], v))
    return dist

print(dijkstra(3, [(0, 1, 4), (0, 2, 1), (2, 1, 2)], 0))  # [0, 3, 1]
```

**Complexity:** O((V + E) log V) time, O(V + E) space.

### Variants to recognise

- **Minimax path** ("path with minimum effort", "swim in rising water"): the cost of a path is its **largest** edge. Replace `d + w` with `max(d, w)`. Dijkstra still works.
- **State expansion:** when the cost depends on extra information (stops used, keys collected, fuel left), make the node a tuple like `(city, stops)` and run Dijkstra or BFS on the bigger state graph. "Cheapest flights within k stops" is often solved with Bellman-Ford limited to k+1 rounds or BFS by levels.
- **Negative edges:** Dijkstra is wrong. Use Bellman-Ford (O(V · E)).
- **All edges weight 1:** plain BFS is enough.

### 0-1 BFS

**When to use:** edge weights are only 0 or 1. Examples: "minimum obstacles to remove in a grid", "minimum cost to make a valid path in a grid".

**Idea:** use a deque. A 0-weight edge does not increase distance, so push that neighbour to the **front**; a 1-weight edge goes to the **back**. The deque stays sorted by distance without a heap.

```python
from collections import deque

def zero_one_bfs(n, graph, src):       # graph[u] = [(v, w)], w in {0, 1}
    dist = [float('inf')] * n
    dist[src] = 0
    dq = deque([src])
    while dq:
        u = dq.popleft()
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                if w == 0:
                    dq.appendleft(v)
                else:
                    dq.append(v)
    return dist

g = [[(1, 1), (2, 0)], [], [(1, 0)]]
print(zero_one_bfs(3, g, 0))           # Output: [0, 0, 0]
```

**Complexity:** O(V + E) time, which beats Dijkstra's log factor.

## 9. LRU cache design

**When to use:** "Design an LRU cache with O(1) get and put". It is a very common design-plus-code question. **LRU** means Least Recently Used: when the cache is full, remove the item that was used longest ago. Think of a small shelf at a kirana shop: items customers asked for recently stay on the shelf; the item nobody asked for in the longest time goes back to the godown.

### Version A: OrderedDict

`collections.OrderedDict` remembers insertion order and can move a key to the end in O(1).

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.data = OrderedDict()          # oldest first, newest last

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)         # mark as recently used
        return self.data[key]

    def put(self, key, value):
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) > self.cap:
            self.data.popitem(last=False)  # evict least recently used
```

Some interviewers accept this; many then say "Now do it without OrderedDict." Be ready.

### Version B: dict plus doubly linked list

A **doubly linked list** has nodes with both `prev` and `next` pointers, so you can remove any node in O(1) if you hold a reference to it. The dict maps key to node. Two **sentinel** (dummy) nodes, `head` and `tail`, remove special cases for empty lists.

```python
class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRU:
    def __init__(self, capacity):
        self.cap, self.map = capacity, {}
        self.head, self.tail = Node(), Node()   # sentinels
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_front(self, node):                 # front = most recent
        node.prev, node.next = self.head, self.head.next
        self.head.next.prev = node
        self.head.next = node
```

```python
    # (continuation of class LRU)
    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add_front(node)
        return node.val

    def put(self, key, value):
        if key in self.map:
            self._remove(self.map[key])
        node = Node(key, value)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev               # least recently used
            self._remove(lru)
            del self.map[lru.key]              # why Node stores key
```

**Complexity:** O(1) for `get` and `put`; O(capacity) space. Test it with capacity 1, updating an existing key, and getting a key just before eviction.

## 10. Reservoir sampling

**When to use:** "pick a random element (or k elements) from a stream" or "from a linked list of unknown length", with each element equally likely, using O(k) memory.

**Idea:** keep the first k items. For item number i (0-based, i ≥ k), pick a random integer j from 0 to i. If j < k, replace slot j with the new item. Each item ends up kept with probability k / (number of items seen).

Think of choosing one lucky customer from a queue whose length you do not know, while only remembering one name at a time.

```python
import random

def reservoir_sample(stream, k):
    res = []
    for i, x in enumerate(stream):
        if i < k:
            res.append(x)
        else:
            j = random.randint(0, i)   # inclusive on both ends
            if j < k:
                res[j] = x             # replace with probability k/(i+1)
    return res

print(len(reservoir_sample(range(1000), 5)))   # Output: 5
```

**Complexity:** O(n) time for n items, O(k) space.

## 11. Randomised algorithm basics

A **randomised algorithm** uses random choices to get good **expected** performance, protecting against bad inputs. Two words to know:

- **Las Vegas algorithm:** always correct; only the running time is random (example: quickselect).
- **Monte Carlo algorithm:** fixed running time, but may be wrong with a small probability (example: some primality tests).

### Quickselect

**When to use:** "k-th largest / smallest element" in expected O(n), faster than sorting.

```python
import random

def quickselect(nums, k):              # k-th smallest, k is 1-based
    pivot = random.choice(nums)        # random pivot avoids bad cases
    lows = [x for x in nums if x < pivot]
    highs = [x for x in nums if x > pivot]
    equal = len(nums) - len(lows) - len(highs)
    if k <= len(lows):
        return quickselect(lows, k)
    if k <= len(lows) + equal:
        return pivot
    return quickselect(highs, k - len(lows) - equal)

print(quickselect([3, 2, 1, 5, 6, 4], 2))   # Output: 2
```

**Complexity:** expected O(n) time, worst case O(n²) (very unlikely with random pivots). This simple version uses O(n) extra space; an in-place partition version uses O(1) extra.

### Fisher-Yates shuffle

**When to use:** "shuffle an array" so every order is equally likely.

```python
def shuffle(a):
    for i in range(len(a) - 1, 0, -1):
        j = random.randint(0, i)       # pick from the unshuffled part
        a[i], a[j] = a[j], a[i]
    return a
```

O(n) time, O(1) extra space. A common wrong version picks `j` from the whole array every time, which makes some orders more likely than others. Python's `random.shuffle` implements a correct shuffle.

## Summary table

| Tool | Signal | Time |
|---|---|---|
| Monotonic deque | Max/min of every window | O(n) |
| Union-find | Dynamic connectivity, groups | ~O(1) amortised per op |
| Topological sort | Prerequisites, build order | O(V + E) |
| Fenwick tree | Prefix sums with updates | O(log n) per op |
| Segment tree | Range min/max/sum with updates | O(log n) per op |
| KMP | Guaranteed linear pattern search | O(n + m) |
| Rabin-Karp | Many substring comparisons | O(n + m) expected |
| Bitmask DP | n ≤ ~20, subsets of items as state | O(2^n · n²) typical |
| Dijkstra | Weighted shortest path, weights ≥ 0 | O((V + E) log V) |
| 0-1 BFS | Weights only 0 or 1 | O(V + E) |
| LRU cache | O(1) get/put with eviction | O(1) per op |
| Reservoir sampling | Random pick from a stream | O(n), O(k) space |
| Quickselect | k-th element | Expected O(n) |

## Tester's corner

- Random algorithms are hard to test: fix the seed (`random.seed(42)`) for repeatable unit tests, and use statistical tests (run many trials, check frequencies) for fairness.
- The wrong Fisher-Yates version is a great example of a bug that passes every functional test but fails a distribution test.
- LRU caches need state-sequence tests: a series of `put` and `get` calls with a check after each step, including capacity 1 and updates of existing keys.
- Union-find, Fenwick and segment trees are perfect for differential testing against a brute force on random inputs.
- Rabin-Karp shows why you must verify after a hash match: collisions are rare but real. The same idea applies to checksums in test data validation.
- Topological sort appears in real test infrastructure: ordering test setup steps, and build systems that run tasks in dependency order (the Bazel documentation describes builds as a graph of dependencies).

## Key takeaways

- Study these tools only after the core patterns; learn the signal, the idea and the complexity for each.
- Monotonic deque gives O(n) window max/min; union-find with path compression and union by rank is nearly O(1) per operation.
- Kahn's algorithm gives a topological order and detects cycles; use a heap for the smallest order and levels for minimum rounds.
- Fenwick trees handle prefix sums with updates; segment trees handle general range queries, both in O(log n).
- KMP guarantees O(n + m) matching; Rabin-Karp uses a rolling hash and must verify on matches.
- Bitmask DP fits n up to about 20; Dijkstra needs non-negative weights; 0-1 BFS handles 0/1 weights in O(V + E).
- Know LRU cache both with OrderedDict and with dict plus a doubly linked list; know reservoir sampling and quickselect.

## Quiz

1. Which tool gives the maximum of every window of size k in O(n)? A) Heap B) Monotonic deque C) Fenwick tree D) Trie
2. What two optimisations make union-find nearly constant time per operation?
3. True or false: Dijkstra's algorithm works correctly with negative edge weights.
4. Kahn's algorithm returns fewer than n nodes. What does that mean?
5. Which structure supports both point updates and range minimum queries in O(log n)? A) Prefix sum array B) Segment tree C) Hash map D) Stack
6. Why must Rabin-Karp compare the actual strings when hashes match?
7. A problem has n = 16 cities and asks for the shortest route visiting all. Which technique fits?
8. In 0-1 BFS, where do you push a neighbour reached by a 0-weight edge?
9. Your LRU cache uses a doubly linked list. Why does each node store its key as well as its value?
10. You need to test a shuffle function. What would you do to check it is fair?

## Answer key

1. **B** - A monotonic deque keeps candidates in decreasing order, so each index is added and removed once.
2. **Path compression and union by rank** - Together they give amortised O(α(n)) per operation.
3. **False** - Dijkstra assumes non-negative weights; use Bellman-Ford when negative edges exist.
4. **A cycle exists** - Nodes in a cycle never reach in-degree 0, so they are never added to the order.
5. **B** - A segment tree answers range queries and handles point updates in O(log n).
6. **Collisions** - Different strings can have the same hash, so a hash match must be verified.
7. **Bitmask DP** - With n around 16, O(2^n · n²) is feasible and the state is the set of visited cities.
8. **The front** - A 0-weight edge does not increase distance, so it goes to the front to keep the deque in distance order.
9. **To delete from the dict on eviction** - When removing the tail node, you need its key to delete the dict entry in O(1).
10. **Statistical test** - Run many shuffles of a small array, count how often each order appears, and check the counts are roughly equal.

## Flashcards

- **Q:** What does a monotonic deque store for sliding window maximum? — **A:** Indices whose values are in decreasing order; the front is the window max.
- **Q:** What is path compression? — **A:** During find, pointing each visited node directly at the root.
- **Q:** What is union by rank? — **A:** Attaching the shorter tree under the taller one to keep trees flat.
- **Q:** How does Kahn's algorithm detect a cycle? — **A:** The output order has fewer than n nodes.
- **Q:** What does `i & -i` give in a Fenwick tree? — **A:** The lowest set bit of i, which is the size of the block index i covers.
- **Q:** What is the LPS array in KMP? — **A:** For each prefix, the length of the longest proper prefix that is also a suffix.
- **Q:** What is a rolling hash? — **A:** A hash updated in O(1) as a window slides by one character.
- **Q:** When is bitmask DP feasible? — **A:** When n is small, about 20 or less, and the state is a subset of items.
- **Q:** What is the time complexity of Dijkstra with a heap? — **A:** O((V + E) log V).
- **Q:** When do you use 0-1 BFS? — **A:** When every edge weight is 0 or 1; it runs in O(V + E).
- **Q:** How does reservoir sampling decide to keep item i (0-based, i ≥ k)? — **A:** Pick j in 0..i at random; if j < k, replace slot j.
- **Q:** What is the difference between Las Vegas and Monte Carlo algorithms? — **A:** Las Vegas is always correct with random time; Monte Carlo has fixed time but may be wrong with small probability.

## Problem hints

### Min Cost to Connect All Points (Medium)
**Restate:** Given points on a 2-D plane, connect all of them with the minimum total cost, where the cost of an edge is the Manhattan distance `|x1 - x2| + |y1 - y2|`.
**Hint 1:** This is a minimum spanning tree (MST). Use Prim or Kruskal.
**Hint 2:** Every pair of points can be connected, so the graph is dense (about n^2 / 2 edges). Prim with a simple array (no heap) runs in O(n^2) and never builds the edge list.
**Hint 3:** (array-based Prim)
- Keep `dist[i]` = cheapest known cost to connect point i to the tree; start with `dist[0] = 0`, others infinity.
- Repeat n times: pick the unvisited point with the smallest `dist`.
- Add that `dist` to the total and mark the point visited.
- Update `dist[j]` for every unvisited j with the Manhattan distance to the new point, if smaller.
**Complexity:** O(n^2) time, O(n) space. (Kruskal: O(n^2 log n) time, O(n^2) space for edges.)
**Edge cases to test:** one point gives 0; two points gives their distance; points on a straight line; duplicate points (cost 0 edge); negative coordinates like `[[-1000000, 0], [1000000, 0]]`.

### Network Delay Time (Medium)
**Restate:** Given directed weighted edges (travel times) and a starting node k, return the time for a signal to reach all n nodes, or -1 if some node cannot be reached.
**Hint 1:** Single-source shortest path with non-negative weights means Dijkstra.
**Hint 2:** The answer is the LARGEST of the shortest distances, because the signal reaches all nodes only when the slowest one gets it.
**Hint 3:**
- Build an adjacency list `u -> (v, w)`.
- Min-heap starts with `(0, k)`.
- Pop the smallest; skip if already finalised; otherwise record its distance.
- Push `(d + w, v)` for each neighbour not yet finalised.
- If fewer than n nodes are finalised, return -1; else return the max distance.
**Complexity:** O(E log V) time, O(V + E) space.
**Edge cases to test:** `n = 1` gives 0; a node with no incoming edge gives -1; two paths to a node where the longer-hop path is cheaper; edges pointing away from k only (directed, so reverse edges do not count); parallel edges with different weights.

### Cheapest Flights Within K Stops (Medium)
**Restate:** Given flights with prices, find the cheapest price from `src` to `dst` using at most k stops (so at most k + 1 flights), or -1 if none.
**Hint 1:** Bellman-Ford limited to k + 1 rounds, or BFS level by level.
**Hint 2:** Plain Dijkstra can fail, because the cheapest path to a middle city might use too many stops. Each Bellman-Ford round adds at most one flight, so k + 1 rounds respect the limit.
**Hint 3:**
- `prices[src] = 0`, all others infinity.
- Repeat k + 1 times: copy `prices` to `temp`.
- For every flight `(u, v, p)`: if `prices[u]` is finite, set `temp[v] = min(temp[v], prices[u] + p)`.
- Set `prices = temp`.
- Return `prices[dst]` or -1 if still infinity.
**Complexity:** O(k * E) time, O(n) space.
**Edge cases to test:** `k = 0` (only direct flights); a cheap 2-stop path vs a costly 1-stop path with `k = 1` (must pick the costly one); `src == dst` gives 0; no route gives -1; a cycle in the flights.

### Reconstruct Itinerary (Hard)
**Restate:** Given airline tickets `[from, to]`, use every ticket exactly once starting from "JFK", and return the itinerary that is smallest in alphabetical (lexical) order.
**Hint 1:** This is an Eulerian path (use every edge once). Use Hierholzer's algorithm with DFS.
**Hint 2:** Greedy "always take the smallest next airport" can get stuck in a dead end. Hierholzer fixes this: add an airport to the answer only AFTER all its outgoing tickets are used, then reverse the answer at the end. Dead ends naturally end up at the back.
**Hint 3:**
- Build `from -> list of destinations`, sorted (or use a min-heap per airport).
- DFS from "JFK": while the airport has unused tickets, take the smallest one, remove it, DFS into it.
- After the loop, append the airport to `route`.
- Return `route` reversed.
**Complexity:** O(E log E) time for sorting, O(E) space.
**Edge cases to test:** one ticket `[["JFK","ATL"]]`; the dead-end case `[["JFK","KUL"],["JFK","NRT"],["NRT","JFK"]]` gives `JFK, NRT, JFK, KUL`; duplicate tickets (same from and to twice); a cycle back to JFK; check the output length is tickets + 1.

### Swim In Rising Water (Hard)
**Restate:** In an n x n grid of heights, at time t you can swim through any cell with height <= t. Return the least time to go from the top-left to the bottom-right.
**Hint 1:** Dijkstra on a grid, or binary search on t plus BFS.
**Hint 2:** The "cost" of a path is the MAXIMUM height on it, not the sum. Dijkstra still works if the priority of a cell is `max(current cost, cell height)`.
**Hint 3:**
- Min-heap starts with `(grid[0][0], 0, 0)`; keep a visited set.
- Pop the cell with the smallest cost; if it is the target, return the cost.
- Skip it if visited; mark visited.
- For each in-bounds neighbour, push `(max(cost, grid[nr][nc]), nr, nc)`.
**Complexity:** O(n^2 log n) time, O(n^2) space.
**Edge cases to test:** `[[0]]` gives 0; a 2x2 grid `[[0,2],[1,3]]` gives 3 (the target height itself counts); a high start cell; a spiral-shaped low path; the target being the highest cell.

### Alien Dictionary (Hard)
**Restate:** Given words sorted in an unknown alien alphabet, return a valid order of the letters, or "" if the order is impossible.
**Hint 1:** Build a directed graph of letters, then topological sort.
**Hint 2:** Compare only ADJACENT words. The first position where they differ gives one edge `a -> b`. Letters after that position tell you nothing. If a longer word comes before its own prefix (like "abc" before "ab"), the input is invalid.
**Hint 3:**
- Add every letter from every word as a node (even letters with no edges).
- For each adjacent pair, find the first different letter and add an edge.
- If no difference and the first word is longer, return "".
- Run topological sort (Kahn or DFS).
- If the order does not include all letters, there is a cycle: return "".
**Complexity:** O(C) time where C is the total number of characters; O(1) extra space for letters (at most 26 nodes, 26^2 edges).
**Edge cases to test:** one word `["z"]` gives "z"; `["abc", "ab"]` gives ""; a cycle `["z", "x", "z"]` gives ""; `["wrt","wrf","er","ett","rftt"]` gives "wertf"; duplicate adjacent words.

## More quiz

1. Which algorithm fits "minimum total wire to connect every house"?
   - A. Dijkstra
   - B. Minimum spanning tree (Prim or Kruskal)
   - C. Topological sort
   - D. BFS
2. In Swim In Rising Water, what is the cost of a path?
   - A. Sum of heights
   - B. Number of cells
   - C. Maximum height on the path
   - D. Minimum height on the path
3. Why is plain Dijkstra risky for Cheapest Flights Within K Stops?
   - A. Prices can be negative
   - B. The cheapest path to a middle city may use too many stops, and Dijkstra keeps only that one
   - C. Dijkstra cannot use a heap
   - D. The graph is undirected
4. In Alien Dictionary, which pair of words is INVALID input?
   - A. `["ab", "abc"]`
   - B. `["abc", "ab"]`
   - C. `["a", "b"]`
   - D. `["ba", "bc"]`
5. In Reconstruct Itinerary, when do you add an airport to the route?
   - A. When you first visit it
   - B. After all of its outgoing tickets are used
   - C. Only if it is "JFK"
   - D. When the heap is empty

## Answer key

1. **B** - Connecting all nodes with minimum total edge weight is exactly a minimum spanning tree.
2. **C** - You must wait until the water covers the highest cell on your path, so the cost is the maximum.
3. **B** - Dijkstra keeps only the cheapest way to each city, but that way may already use all your stops. Bellman-Ford with k + 1 rounds tracks the stop limit.
4. **B** - A word must come after its own prefix. "abc" before "ab" breaks every possible alphabet.
5. **B** - This is post-order adding (Hierholzer). It makes dead ends go to the end of the reversed route.

## Flashcards

- **Q:** Why is array-based Prim good for Min Cost to Connect All Points? — **A:** The graph is complete, so O(n^2) Prim beats building and sorting all n^2 edges.
- **Q:** What is the Manhattan distance between (1, 2) and (4, 6)? — **A:** |1 - 4| + |2 - 6| = 3 + 4 = 7.
- **Q:** What is the final answer in Network Delay Time? — **A:** The maximum shortest distance, or -1 if any node is unreachable.
- **Q:** How many Bellman-Ford rounds for at most k stops? — **A:** k + 1 rounds, because k stops means k + 1 flights.
- **Q:** What is Hierholzer's algorithm used for? — **A:** Finding a path that uses every edge exactly once (Eulerian path).
- **Q:** What heap priority does Swim In Rising Water use? — **A:** max(cost so far, height of the next cell).
- **Q:** Which words do you compare in Alien Dictionary? — **A:** Only adjacent words, at their first different letter.
- **Q:** How do you detect an impossible alien order? — **A:** A prefix problem (longer word first) or a cycle in the letter graph.
- **Q:** Which nodes must Alien Dictionary include even with no edges? — **A:** Every letter that appears in any word.
- **Q:** A good tester input for Reconstruct Itinerary? — **A:** A dead-end case where picking the smallest airport first gets stuck, like JFK->KUL, JFK->NRT, NRT->JFK.

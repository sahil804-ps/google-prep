## Problem hints

### Number of Islands (Medium)
**Restate:** Given a grid of "1" (land) and "0" (water), count how many separate islands there are, where land connects up, down, left and right.
**Hint 1:** Grid DFS or BFS. Each island is one connected group of cells.
**Hint 2:** Every time you find an unvisited "1", you have found a new island. Flood-fill it (mark all its cells visited) so you never count it again.
**Hint 3:**
- Loop over every cell.
- If the cell is "1" and not visited, add 1 to the count.
- Run DFS/BFS from it and mark every connected "1" as visited (for example, set it to "0").
- Diagonal cells do NOT connect.
**Complexity:** O(R * C) time, O(R * C) space in the worst case (recursion or queue).
**Edge cases to test:** all water gives 0; all land gives 1; a checkerboard like `[["1","0"],["0","1"]]` gives 2 (diagonals do not join); a single cell `[["1"]]`; one long snake-shaped island in a big grid (tests recursion depth).

### Clone Graph (Medium)
**Restate:** Given one node of a connected undirected graph, return a deep copy of the whole graph.
**Hint 1:** DFS or BFS plus a hash map from old node to new node.
**Hint 2:** The map does two jobs: it is the "visited" set, and it lets you reuse a copy that already exists, so cycles do not cause infinite loops.
**Hint 3:**
- If the input node is null, return null.
- `clone(node)`: if `node` is in the map, return its copy.
- Otherwise create a copy with the same value, store it in the map FIRST.
- Then for each neighbour, append `clone(neighbour)` to the copy's neighbour list.
**Complexity:** O(V + E) time, O(V) space.
**Edge cases to test:** null input; a single node with no neighbours; two nodes pointing to each other (a cycle); a 4-node square `1-2-3-4-1`; check that the copy shares NO objects with the original.

### Max Area of Island (Medium)
**Restate:** In a grid of 1s and 0s, return the size (number of cells) of the biggest island, or 0 if there is none.
**Hint 1:** Same flood fill as Number of Islands.
**Hint 2:** Make the DFS return the number of cells it filled: `1 + dfs(up) + dfs(down) + dfs(left) + dfs(right)`.
**Hint 3:**
- Loop over every cell.
- If it is 1, call DFS, which marks cells and returns the area.
- Keep the maximum area seen.
- Return 0 for out-of-bounds, water, or visited cells.
**Complexity:** O(R * C) time and space.
**Edge cases to test:** all zeros gives 0; all ones gives R*C; one cell `[[1]]` gives 1; two islands of different sizes; diagonal-only touching cells (they are separate islands).

### Pacific Atlantic Water Flow (Medium)
**Restate:** Water flows from a cell to a neighbour with equal or lower height. Return all cells from which water can reach both the Pacific (top and left edges) and the Atlantic (bottom and right edges).
**Hint 1:** Reverse the direction. Start from the oceans and walk "uphill".
**Hint 2:** Do one search from all Pacific border cells and one from all Atlantic border cells. A cell is an answer if both searches reach it. Running a search from every cell instead would be too slow.
**Hint 3:**
- Make two visited sets: `pac` and `atl`.
- DFS/BFS from every top-row and left-column cell into `pac`.
- DFS/BFS from every bottom-row and right-column cell into `atl`.
- Move to a neighbour only if its height is `>=` the current height.
- Return cells that are in both sets.
**Complexity:** O(R * C) time and space.
**Edge cases to test:** a 1x1 grid (the cell touches both oceans); a single row `[[1,2,3]]` (every cell touches both); a flat grid of all equal heights (every cell is an answer); a strict "valley" in the middle; a grid where heights increase only toward one corner.

### Surrounded Regions (Medium)
**Restate:** In a board of "X" and "O", change every "O" region that is fully surrounded by "X" into "X". Regions touching the border stay.
**Hint 1:** Again, think in reverse: find the "O" cells that are SAFE.
**Hint 2:** Only "O" cells connected to the border survive. Mark them first from the border, then flip everything else.
**Hint 3:**
- DFS/BFS from every "O" on the border, marking connected "O" cells as a temporary letter like "T".
- Scan the whole board.
- Change remaining "O" to "X" (they are surrounded).
- Change "T" back to "O".
**Complexity:** O(R * C) time and space.
**Edge cases to test:** an empty board or 1x1 board; all "O" (nothing flips); an "O" in the middle surrounded by "X" (flips); an "O" region that touches the border only through a long path (stays); a board with 1 or 2 rows (every cell is on the border).

### Rotting Oranges (Medium)
**Restate:** Each minute, a rotten orange (2) rots its fresh neighbours (1). Return the minutes until no fresh orange is left, or -1 if that is impossible.
**Hint 1:** Multi-source BFS. All rotten oranges start in the queue together.
**Hint 2:** Each BFS "level" is one minute. Count the fresh oranges first, so at the end you know if some were never reached.
**Hint 3:**
- Push all 2s into the queue; count all 1s.
- If fresh count is 0, return 0.
- Process the queue level by level; for each fresh neighbour, make it 2, decrease fresh, push it.
- Add 1 minute after each level that rotted at least one orange.
- Return minutes if fresh is 0, else -1.
**Complexity:** O(R * C) time and space.
**Edge cases to test:** no oranges at all `[[0]]` gives 0; only fresh `[[1]]` gives -1; only rotten `[[2]]` gives 0; a fresh orange walled off by 0s gives -1; two rotten oranges at opposite ends (tests that they spread at the same time).

### Walls And Gates (Medium)
**Restate:** In a grid with walls (-1), gates (0) and empty rooms (a very large number, INF), fill each room with its distance to the nearest gate, leaving unreachable rooms as INF.
**Hint 1:** Multi-source BFS from all gates at once.
**Hint 2:** Because BFS from all gates spreads one step at a time, the first time a room is reached is from its nearest gate. You never need to update it again.
**Hint 3:**
- Push every gate into the queue.
- Pop a cell; for each neighbour that is an INF room, set it to current distance + 1 and push it.
- Skip walls, gates and rooms already filled.
- Change the grid in place.
**Complexity:** O(R * C) time and space.
**Edge cases to test:** no gates (all rooms stay INF); no rooms; a room completely surrounded by walls (stays INF); two gates with a room exactly in the middle; an empty grid `[]`.

### Course Schedule (Medium)
**Restate:** Given n courses and pairs `[a, b]` meaning "take b before a", say whether you can finish all courses.
**Hint 1:** Model it as a directed graph. The question is "is there a cycle?".
**Hint 2:** You can use topological sort (Kahn: process nodes with indegree 0) or DFS with three colours: unvisited, visiting (on the current path), done. Meeting a "visiting" node means a cycle.
**Hint 3:** (DFS version; Kahn's algorithm also works)
- Build an adjacency list `b -> a`.
- `state[node]`: 0 = new, 1 = visiting, 2 = done.
- DFS: if state is 1 return False (cycle); if 2 return True.
- Set state 1, DFS all neighbours, then set state 2.
- Run DFS from every node; if any returns False, answer False.
**Complexity:** O(V + E) time and space.
**Edge cases to test:** no prerequisites (True); a self-loop `[[0,0]]` (False); a 2-cycle `[[1,0],[0,1]]` (False); a disconnected graph with a cycle only in one part (False); a long chain 0 -> 1 -> ... -> n-1 (True).

### Course Schedule II (Medium)
**Restate:** Same as Course Schedule, but return one valid order to take all the courses, or an empty list if it is impossible.
**Hint 1:** Topological sort.
**Hint 2:** With Kahn's algorithm, the order in which nodes leave the queue is a valid order. With DFS, add a node to the list when it is DONE, then reverse the list at the end.
**Hint 3:**
- Build `b -> a` edges and indegrees.
- Start a queue with all indegree-0 courses.
- Pop, append to the order, decrease neighbours' indegree, push new zeros.
- If the order has n courses, return it; else return `[]`.
**Complexity:** O(V + E) time and space.
**Edge cases to test:** `n = 1`, no prerequisites gives `[0]`; a cycle gives `[]`; many valid orders (your test must check "is the order valid", not one exact list); duplicate prerequisite pairs; isolated courses with no edges must still appear.

### Redundant Connection (Medium)
**Restate:** A tree with n nodes got one extra edge. Return the edge that can be removed so it becomes a tree again (if several, return the last one in the input).
**Hint 1:** Union-Find.
**Hint 2:** Add edges one by one. The first edge whose two ends already have the same root closes a cycle. Because you scan in input order, that edge is the last edge of the cycle in the input, which is what the problem wants.
**Hint 3:**
- Make `parent[i] = i` for nodes 1..n.
- For each edge `(a, b)`: find both roots.
- If roots are equal, return this edge.
- Otherwise union them.
**Complexity:** O(n * α(n)) time, which is nearly O(n); O(n) space.
**Edge cases to test:** smallest case `[[1,2],[1,3],[2,3]]` gives `[2,3]`; a long cycle where the extra edge is in the middle of the input; nodes labelled from 1 (off-by-one bugs if the array has size n); a cycle not involving node 1.

### Number of Connected Components In An Undirected Graph (Medium)
**Restate:** Given n nodes and a list of undirected edges, return how many connected groups there are.
**Hint 1:** Union-Find, or DFS from every unvisited node.
**Hint 2:** With Union-Find, start with n groups. Every successful union (two different roots) reduces the count by 1.
**Hint 3:**
- `count = n`, `parent[i] = i`.
- For each edge, find both roots.
- If they differ, union them and do `count -= 1`.
- Return `count`.
**Complexity:** O(E * α(n)) time, O(n) space.
**Edge cases to test:** no edges gives n; `n = 1` gives 1; all nodes in one chain gives 1; a duplicate edge `[[0,1],[0,1]]` must not reduce the count twice; an edge list that contains a cycle.

### Graph Valid Tree (Medium)
**Restate:** Given n nodes and undirected edges, say whether they form a valid tree (connected and with no cycle).
**Hint 1:** Union-Find or DFS.
**Hint 2:** A tree with n nodes has exactly n - 1 edges. If the edge count is not n - 1, return False immediately. If it is n - 1 and there is no cycle, the graph is also connected.
**Hint 3:**
- If `len(edges) != n - 1`, return False.
- Union every edge; if two ends already share a root, return False (cycle).
- Otherwise return True.
**Complexity:** O(n * α(n)) time, O(n) space.
**Edge cases to test:** `n = 1`, no edges (True); `n = 2`, no edges (False, not connected); a triangle `n = 3, [[0,1],[1,2],[2,0]]` (False); n - 1 edges but with a cycle plus an isolated node, like `n = 4, [[0,1],[1,2],[2,0]]` (False); a star shape (True).

### Word Ladder (Hard)
**Restate:** Change `beginWord` into `endWord` one letter at a time, where every middle word must be in the word list. Return the number of words in the shortest such chain, or 0 if impossible.
**Hint 1:** BFS on an implicit graph. Each word is a node; words differing by one letter are neighbours.
**Hint 2:** Do not compare every pair of words. Use patterns: "hot" belongs to buckets "*ot", "h*t", "ho*". Words in the same bucket are neighbours.
**Hint 3:**
- If `endWord` is not in the list, return 0.
- Build a map from pattern to words.
- BFS from `beginWord` with level = 1.
- For each word, for each of its patterns, visit unvisited words in that bucket.
- Return the level when you pop `endWord`.
**Complexity:** O(N * L^2) time where N is the number of words and L the word length (building L patterns of length L for each word); O(N * L^2) space for the buckets.
**Edge cases to test:** `endWord` missing from the list gives 0; `beginWord` one letter away from `endWord` gives 2; no path gives 0; `beginWord` is not in the list (that is allowed); a list with many words sharing patterns (performance).

## More quiz

1. Which pattern fits "find all cells that can reach BOTH the top edge and the bottom edge"?
   - A. One DFS from every cell
   - B. Two reverse searches, one from each edge, then intersect
   - C. Binary search on heights
   - D. Sort the cells
2. A graph has n nodes and exactly n - 1 edges, and it has no cycle. What else must be true?
   - A. It has two components
   - B. It is connected, so it is a tree
   - C. It is a directed graph
   - D. Nothing else can be said
3. In Clone Graph, why do you store the new copy in the map BEFORE cloning the neighbours?
   - A. To save memory
   - B. So a cycle that comes back to this node finds the copy and stops
   - C. To keep neighbours sorted
   - D. It does not matter
4. In DFS cycle detection for a directed graph, what does reaching a node in the "visiting" state mean?
   - A. The node is a leaf
   - B. There is a cycle
   - C. The graph is disconnected
   - D. The node is done
5. In Word Ladder, why are patterns like "h*t" useful?
   - A. They sort the words
   - B. They find one-letter neighbours without comparing every pair of words
   - C. They remove duplicates
   - D. They make DFS possible

## Answer key

1. **B** - Searching backwards from each edge visits each cell a small number of times. One search per cell would be O((R*C)^2).
2. **B** - An acyclic graph with n nodes and n - 1 edges is always connected. That is why Graph Valid Tree can check the edge count first.
3. **B** - If a neighbour leads back to the current node, the map already has its copy, so the recursion stops instead of looping forever.
4. **B** - The node is still on the current path, so you came back to it through a loop.
5. **B** - Words that share a pattern differ in exactly one position, so buckets give neighbours directly.

## Flashcards

- **Q:** What is a "reverse search" trick in grid problems? — **A:** Start from the target (border, ocean, gate) and search outward, instead of searching from every cell.
- **Q:** How do you find safe "O" cells in Surrounded Regions? — **A:** Flood-fill from every border "O"; anything not reached is surrounded.
- **Q:** What does each BFS level mean in Rotting Oranges? — **A:** One minute of time.
- **Q:** When does Rotting Oranges return -1? — **A:** When some fresh orange is still left after the BFS ends.
- **Q:** What are the three DFS states for directed cycle detection? — **A:** New, visiting (on current path), done.
- **Q:** How do you get a topological order from DFS? — **A:** Add each node when it finishes, then reverse the list.
- **Q:** Quick check for Graph Valid Tree? — **A:** Edge count must be exactly n - 1, then make sure there is no cycle.
- **Q:** In Number of Connected Components, when does the count go down? — **A:** Only when a union joins two different roots.
- **Q:** Why is Word Ladder BFS and not DFS? — **A:** It asks for the shortest chain, and edges have no weight.
- **Q:** What is a good tester input for Course Schedule II? — **A:** A graph with many valid orders; check the output is A valid order, not one fixed list.

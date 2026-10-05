## Problem hints

### Maximum Subarray (Medium)
**Restate:** Find the contiguous subarray (at least one number) with the largest sum and return that sum.
**Hint 1:** Kadane's algorithm: a greedy single pass.
**Hint 2:** If the running sum so far is negative, it can only hurt what comes next. Drop it and start fresh at the current number.
**Hint 3:**
- Start `cur = best = nums[0]`.
- For each next x: `cur = max(x, cur + x)`.
- `best = max(best, cur)`.
- Return `best`.
- (Follow-up: divide and conquer also works in O(n log n).)
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** `[-2,1,-3,4,-1,2,1,-5,4]` gives 6; all negative `[-3, -1, -2]` gives -1; one element `[-5]`; `[5, 4, -1, 7, 8]` gives 23 (the whole array); zeros `[0, 0]` gives 0.

### Jump Game (Medium)
**Restate:** Each number is the maximum jump length from that position. Say whether you can reach the last index starting from index 0.
**Hint 1:** Greedy. Track the farthest index you can reach so far.
**Hint 2:** If you ever stand on an index beyond the farthest reachable index, you are stuck. (The lesson shows the "move the goal backwards" version; this is the forward version.)
**Hint 3:**
- `reach = 0`.
- For each index i: if `i > reach`, return False.
- `reach = max(reach, i + nums[i])`.
- If `reach >= last index`, return True.
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** `[0]` gives True (already at the end); `[2, 3, 1, 1, 4]` gives True; `[3, 2, 1, 0, 4]` gives False; `[2, 0, 0]` gives True; `[0, 1]` gives False.

### Jump Game II (Medium)
**Restate:** Same jumps as Jump Game (the end is always reachable). Return the minimum number of jumps to reach the last index.
**Hint 1:** Greedy that works like BFS by levels.
**Hint 2:** All indexes reachable with j jumps form a window. The next window ends at the farthest point any index in the current window can reach. Each window is one jump.
**Hint 3:**
- `jumps = 0`, `curEnd = 0`, `farthest = 0`.
- Loop i from 0 to n - 2 (do not jump from the last index).
- `farthest = max(farthest, i + nums[i])`.
- When `i == curEnd`: `jumps += 1`, `curEnd = farthest`.
- Return `jumps`.
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** `[0]` gives 0; `[2, 3, 1, 1, 4]` gives 2; `[1, 2]` gives 1; `[1, 1, 1, 1]` gives 3; a big first jump `[10, 1, 1]` gives 1.

### Gas Station (Medium)
**Restate:** Gas stations are in a circle. Station i gives `gas[i]` and driving to the next costs `cost[i]`. Return the start index that lets you go all the way round, or -1 (the answer is unique if it exists).
**Hint 1:** Greedy single pass with a running tank.
**Hint 2:** If the tank goes negative after station i, then NO station from your current start up to i can be the answer. So jump the start to i + 1. If total gas >= total cost, the last start you pick works.
**Hint 3:**
- If `sum(gas) < sum(cost)`, return -1.
- `tank = 0`, `start = 0`.
- For each i: `tank += gas[i] - cost[i]`.
- If `tank < 0`: `start = i + 1`, `tank = 0`.
- Return `start`.
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** `gas = [1,2,3,4,5], cost = [3,4,5,1,2]` gives 3; `gas = [2,3,4], cost = [3,4,3]` gives -1; one station `[5], [4]` gives 0; total gas exactly equal to total cost; the answer is the last index.

### Hand of Straights (Medium)
**Restate:** Say whether the cards can be split into groups of size `groupSize`, where each group is consecutive numbers.
**Hint 1:** Count cards with a hash map, then build groups from the smallest card up.
**Hint 2:** The smallest remaining card MUST start a group (nothing smaller can include it). So greedily build `x, x+1, ..., x+groupSize-1` from it.
**Hint 3:**
- If `len(hand) % groupSize != 0`, return False.
- Count every card.
- Go through distinct cards in sorted order (or use a min-heap).
- For a card x with count c > 0, every card from x to x + groupSize - 1 must have count >= c; subtract c from each.
- If any count is too small, return False; else True.
**Complexity:** O(n log n) time for sorting, O(n) space.
**Edge cases to test:** `[1,2,3,6,2,3,4,7,8], 3` gives True; `[1,2,3,4,5], 4` gives False; `groupSize = 1` always True; duplicates `[1,1,2,2,3,3], 3` gives True; a gap `[1,2,4], 3` gives False.

### Merge Triplets to Form Target Triplet (Medium)
**Restate:** Merging two triplets takes the max of each position. Say whether you can reach the target triplet by merging some of the given triplets.
**Hint 1:** Greedy filter.
**Hint 2:** Any triplet with a value bigger than the target in ANY position is poison: using it would overshoot forever, because max never decreases. Throw those away. Then the merge of all remaining triplets is the best you can do.
**Hint 3:**
- Keep three flags, one for each position, all False.
- For each triplet: skip it if any value is greater than the target value in that position.
- Otherwise, for each position where the value equals the target, set that flag True.
- Return True if all three flags are True.
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** `[[2,5,3],[1,8,4],[1,7,5]], [2,7,5]` gives True; `[[3,4,5],[4,5,6]], [3,2,5]` gives False; one triplet equal to the target gives True; each position matched by a different triplet; a triplet that matches two positions but overshoots the third (must be skipped).

### Partition Labels (Medium)
**Restate:** Split the string into as many parts as possible so that each letter appears in only one part, and return the part sizes.
**Hint 1:** Greedy with the last index of each letter.
**Hint 2:** Once a part contains a letter, it must stretch to that letter's last position. Keep extending the end; when your index reaches the end, close the part.
**Hint 3:**
- Store `last[ch]` = last index of each letter.
- `start = end = 0`.
- For each i: `end = max(end, last[s[i]])`.
- If `i == end`: record `end - start + 1`, set `start = i + 1`.
**Complexity:** O(n) time, O(1) space (26 letters).
**Edge cases to test:** `"ababcbacadefegdehijhklij"` gives `[9, 7, 8]`; `"eccbbbbdec"` gives `[10]`; one letter `"a"` gives `[1]`; all different `"abc"` gives `[1, 1, 1]`; all the same `"aaaa"` gives `[4]`.

### Valid Parenthesis String (Medium)
**Restate:** The string has "(", ")" and "*", where "*" can be "(", ")" or empty. Say whether it can be a valid balanced string.
**Hint 1:** Greedy with a range of possible open-bracket counts.
**Hint 2:** Track `lo` and `hi`: the smallest and largest number of open brackets possible so far. "(" raises both; ")" lowers both; "*" lowers `lo` and raises `hi`. Never let `lo` go below 0.
**Hint 3:**
- `lo = hi = 0`.
- For each character, update lo and hi as above.
- If `hi < 0`, return False (too many ")").
- `lo = max(lo, 0)`.
- At the end, return `lo == 0`.
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** `"()"` gives True; `"(*)"` gives True; `"(*))"` gives True; `")("` gives False; `"(((*)"` gives False; `"*"` gives True.

## More quiz

1. In Gas Station, the tank goes negative after station 4 when you started at station 1. What do you do?
   - A. Try starting at station 2
   - B. Start again from station 5
   - C. Return -1
   - D. Go back to station 0
2. Which pattern fits "each letter must appear in only one part; make as many parts as possible"?
   - A. Binary search
   - B. Greedy with the last index of each letter
   - C. 2-D DP
   - D. Union-Find
3. In Merge Triplets, a triplet is `[3, 1, 9]` and the target is `[3, 5, 7]`. What do you do with it?
   - A. Use it, because it matches position 0
   - B. Skip it, because 9 > 7 would overshoot
   - C. Use only its first value
   - D. Return False
4. In Valid Parenthesis String, what do `lo` and `hi` mean?
   - A. The first and last index
   - B. The smallest and largest possible number of open brackets so far
   - C. Number of stars and brackets
   - D. Left and right pointers
5. In Jump Game II, when do you add one jump?
   - A. At every index
   - B. When i reaches the end of the current window
   - C. When nums[i] is 0
   - D. Only at the last index

## Answer key

1. **B** - Any start between 1 and 4 also fails, because it would arrive at station 4 with even less gas. So the next possible start is 5.
2. **B** - A part must reach the last appearance of every letter inside it, so you extend the end greedily and cut as soon as you can.
3. **B** - Merging takes the max, so 9 would stay in position 2 forever and you could never reach 7.
4. **B** - Stars make the count uncertain, so you keep the full range of possible open counts.
5. **B** - Each window is all positions reachable with the same number of jumps, like one BFS level.

## Flashcards

- **Q:** Kadane's rule in one line? — **A:** `cur = max(x, cur + x)`; drop the past if it is negative.
- **Q:** Jump Game forward check? — **A:** If index i is greater than the farthest reach so far, return False.
- **Q:** Jump Game II is like which graph algorithm? — **A:** BFS by levels, where each level is one jump.
- **Q:** Quick -1 check in Gas Station? — **A:** If total gas is less than total cost.
- **Q:** First check in Hand of Straights? — **A:** The number of cards must be divisible by groupSize.
- **Q:** Why does the smallest card start a group in Hand of Straights? — **A:** No smaller card exists to put it in the middle of a group.
- **Q:** Which triplets do you throw away in Merge Triplets? — **A:** Any triplet with a value bigger than the target in any position.
- **Q:** When do you close a part in Partition Labels? — **A:** When the current index equals the farthest last index seen in this part.
- **Q:** End condition in Valid Parenthesis String? — **A:** Return True if `lo == 0`.
- **Q:** How do you test that a greedy rule is correct? — **A:** Try small hand-made counter-examples; one failure means you need another approach such as DP.

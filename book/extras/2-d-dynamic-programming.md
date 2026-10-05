## Problem hints

### Unique Paths (Medium)
**Restate:** A robot starts at the top-left of an m x n grid and can move only right or down. Count the different paths to the bottom-right corner.
**Hint 1:** 2-D grid DP.
**Hint 2:** You reach a cell only from the cell above or the cell on the left, so the path counts add. The whole first row and first column have exactly 1 path.
**State:** `dp[r][c]` = number of paths from the start to cell (r, c).
**Transition:** `dp[r][c] = dp[r - 1][c] + dp[r][c - 1]`, with the first row and first column equal to 1.
**Hint 3:**
- Keep one row of length n filled with 1.
- For each next row, for c from 1 to n - 1: `row[c] += row[c - 1]`.
- After m - 1 rows, return `row[n - 1]`.
- (Maths shortcut: the answer is C(m + n - 2, m - 1).)
**Complexity:** O(m * n) time, O(n) space.
**Edge cases to test:** `1 x 1` gives 1; `1 x 5` gives 1; `3 x 2` gives 3; `3 x 7` gives 28; `m = n = 100` (big numbers, fine in Python).

### Longest Common Subsequence (Medium)
**Restate:** Return the length of the longest sequence of characters that appears in both strings in the same order (not necessarily next to each other).
**Hint 1:** 2-D DP over prefixes of both strings.
**Hint 2:** Look at the last characters. If they match, they extend the LCS of both shorter prefixes. If not, drop one character from either string and take the better result.
**State:** `dp[i][j]` = LCS length of `a[:i]` and `b[:j]`.
**Transition:** If `a[i - 1] == b[j - 1]`: `dp[i][j] = dp[i - 1][j - 1] + 1`; else `dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])`.
**Hint 3:**
- Make a (len(a) + 1) x (len(b) + 1) table of zeros.
- Fill it row by row with the transition.
- Return `dp[len(a)][len(b)]`.
- To save space, keep only the previous row.
**Complexity:** O(m * n) time, O(min(m, n)) space with two rows.
**Edge cases to test:** `"abcde", "ace"` gives 3; `"abc", "def"` gives 0; identical strings give their length; one empty string gives 0; `"abc", "cba"` gives 1.

### Best Time to Buy And Sell Stock With Cooldown (Medium)
**Restate:** Given daily prices, make as many buy-then-sell trades as you like, but after you sell you must rest for one day before buying again. Return the maximum profit.
**Hint 1:** DP with states (a small state machine), one set of states per day.
**Hint 2:** Each day you are in one of three states: holding a stock, just sold today, or resting (no stock and free to buy).
**State:** `hold`, `sold`, `rest` = best profit at the end of day i in each state.
**Transition:** `hold = max(hold, rest - price)`; `sold = hold_prev + price`; `rest = max(rest, sold_prev)`.
**Hint 3:**
- Start: `hold = -infinity` (or `-prices[0]` after day 0), `sold = 0`, `rest = 0`.
- For each price, compute all three new values from the OLD values.
- Buying uses `rest`, not `sold`, which enforces the cooldown.
- Return `max(sold, rest)`.
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** `[1, 2, 3, 0, 2]` gives 3; one day `[1]` gives 0; falling prices `[5, 4, 3]` gives 0; `[1, 2, 4]` gives 3 (one trade); `[1, 4, 2, 7]` gives 6 (cooldown stops trading on both rises).

### Coin Change II (Medium)
**Restate:** Given coin values (unlimited supply) and an amount, count the number of different combinations that make the amount (order does not matter).
**Hint 1:** Unbounded knapsack, counting version.
**Hint 2:** The 2-D idea is "ways using the first i coin types". It shrinks to 1-D if coins are the outer loop and amounts the inner loop (low to high).
**State:** `dp[i][a]` = ways to make amount a using only the first i coin types.
**Transition:** `dp[i][a] = dp[i - 1][a] + dp[i][a - coin_i]` (skip this coin type, or use one more of it).
**Hint 3:**
- `dp = [1] + [0] * amount` (one way to make 0).
- For each coin, for a from coin to amount: `dp[a] += dp[a - coin]`.
- Return `dp[amount]`.
- Do not swap the loops; that counts orderings instead of combinations.
**Complexity:** O(number of coins * amount) time, O(amount) space.
**Edge cases to test:** `amount = 5, [1, 2, 5]` gives 4; `amount = 3, [2]` gives 0; `amount = 0` gives 1; `amount = 10, [10]` gives 1; a coin bigger than the amount.

### Target Sum (Medium)
**Restate:** Put a + or - sign in front of each number so the total equals target. Count how many sign choices work.
**Hint 1:** DP over (index, running sum), or turn it into a subset-sum count.
**Hint 2:** Let P be the sum of numbers with +. Then `P - (total - P) = target`, so `P = (total + target) / 2`. Now count subsets that sum to P. If `total + target` is odd or `|target| > total`, the answer is 0.
**State:** `dp[i][s]` = number of ways to reach sum s using the first i numbers (with signs).
**Transition:** `dp[i][s] = dp[i - 1][s - nums[i - 1]] + dp[i - 1][s + nums[i - 1]]`.
**Hint 3:** (subset-sum version)
- If `abs(target) > total` or `(total + target)` is odd, return 0.
- `P = (total + target) // 2`, `dp = [1] + [0] * P`.
- For each number x, for s from P DOWN to x: `dp[s] += dp[s - x]`.
- Return `dp[P]`.
**Complexity:** O(n * total) time, O(total) space.
**Edge cases to test:** `[1,1,1,1,1], 3` gives 5; `[1], 1` gives 1; `[1], 2` gives 0; zeros `[0, 0, 1], 1` gives 4 (each 0 can be + or -); a negative target `[1, 2], -1` gives 1.

### Interleaving String (Medium)
**Restate:** Say whether s3 can be built by mixing all characters of s1 and s2 while keeping each string's own order.
**Hint 1:** 2-D DP over how many characters you used from s1 and from s2.
**Hint 2:** If you used i characters of s1 and j of s2, the next character of s3 is `s3[i + j]`. It must come from s1 or s2. First check `len(s1) + len(s2) == len(s3)`.
**State:** `dp[i][j]` = True if `s3[:i + j]` can be made from `s1[:i]` and `s2[:j]`.
**Transition:** `dp[i][j] = (dp[i - 1][j] and s1[i - 1] == s3[i + j - 1]) or (dp[i][j - 1] and s2[j - 1] == s3[i + j - 1])`, with `dp[0][0] = True`.
**Hint 3:**
- If the lengths do not add up, return False.
- Fill the first row and column (using only s2, or only s1).
- Fill the rest with the transition.
- Return `dp[len(s1)][len(s2)]`.
**Complexity:** O(m * n) time, O(n) space with one row.
**Edge cases to test:** all three empty gives True; `"aabcc","dbbca","aadbbcbcac"` gives True; `"aabcc","dbbca","aadbbbaccc"` gives False; length mismatch `"a","b","a"` gives False; repeated letters where greedy choice fails, like `"aa","ab","aaba"` (True).

### Edit Distance (Medium)
**Restate:** Return the minimum number of single-character inserts, deletes or replaces needed to turn word1 into word2.
**Hint 1:** 2-D DP over prefixes, like LCS.
**Hint 2:** If the last characters match, no cost. Otherwise try all three operations and take the cheapest: delete (move up), insert (move left), replace (move diagonally).
**State:** `dp[i][j]` = edits to turn `word1[:i]` into `word2[:j]`.
**Transition:** If equal: `dp[i][j] = dp[i - 1][j - 1]`; else `dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])`. Base: `dp[i][0] = i`, `dp[0][j] = j`.
**Hint 3:**
- Build a (m + 1) x (n + 1) table.
- Fill the base row and column.
- Fill the rest with the transition.
- Return `dp[m][n]`.
**Complexity:** O(m * n) time, O(n) space with two rows.
**Edge cases to test:** `"horse", "ros"` gives 3; `"intention", "execution"` gives 5; `"", "abc"` gives 3; equal strings give 0; `"a", "b"` gives 1.

### Longest Increasing Path In a Matrix (Hard)
**Restate:** Return the length of the longest path in a grid where each step goes to a neighbour (up, down, left, right) with a strictly larger value.
**Hint 1:** DFS with memoisation (top-down DP).
**Hint 2:** Because values must strictly increase, a path can never come back to a cell. So there are no cycles and you do NOT need a visited set. Each cell's answer is fixed and can be cached.
**State:** `memo[r][c]` = length of the longest increasing path that starts at (r, c).
**Transition:** `memo[r][c] = 1 + max(memo[nr][nc])` over neighbours with a larger value (or 1 if none).
**Hint 3:**
- Make a memo grid of zeros.
- `dfs(r, c)`: if memo is set, return it.
- Try 4 neighbours; recurse only into larger values.
- Store and return `1 + best`.
- Answer = max of `dfs(r, c)` over all cells.
**Complexity:** O(R * C) time and space.
**Edge cases to test:** `[[1]]` gives 1; all equal values give 1; `[[9,9,4],[6,6,8],[2,1,1]]` gives 4; a snake-shaped increasing path; a single row `[[1, 2, 3]]` gives 3.

### Distinct Subsequences (Hard)
**Restate:** Count how many different ways you can delete characters from s to get exactly t.
**Hint 1:** 2-D DP over positions in s and t.
**Hint 2:** When `s[i] == t[j]`, you can either use this character of s for t[j], or skip it. When they differ, you must skip it. An empty t can always be made in exactly one way.
**State:** `dp[i][j]` = number of ways `s[i:]` can form `t[j:]`.
**Transition:** If `s[i] == t[j]`: `dp[i][j] = dp[i + 1][j + 1] + dp[i + 1][j]`; else `dp[i][j] = dp[i + 1][j]`. Base: `dp[i][len(t)] = 1`, `dp[len(s)][j] = 0` for `j < len(t)`.
**Hint 3:**
- Build a (len(s) + 1) x (len(t) + 1) table.
- Set the base cases.
- Fill from the bottom-right toward the top-left.
- Return `dp[0][0]`.
**Complexity:** O(m * n) time, O(n) space with one row.
**Edge cases to test:** `"rabbbit", "rabbit"` gives 3; `"babgbag", "bag"` gives 5; t longer than s gives 0; t empty gives 1; `"aaa", "a"` gives 3.

### Burst Balloons (Hard)
**Restate:** Bursting balloon i earns `left * nums[i] * right`, where left and right are its current neighbours (1 past the ends). Return the maximum coins from bursting all balloons.
**Hint 1:** Interval DP.
**Hint 2:** Think about the LAST balloon to burst in a range, not the first. When k is last in the open range (l, r), its neighbours are fixed: `nums[l]` and `nums[r]`. The left and right parts become independent.
**State:** `dp[l][r]` = max coins from bursting all balloons strictly between l and r (after padding nums with 1 at both ends).
**Transition:** `dp[l][r] = max(nums[l] * nums[k] * nums[r] + dp[l][k] + dp[k][r])` for `l < k < r`.
**Hint 3:**
- Pad: `nums = [1] + nums + [1]`.
- Loop over range length from 2 up to `len(nums) - 1`.
- For each (l, r), try every k in between with the transition.
- Return `dp[0][len(nums) - 1]`.
**Complexity:** O(n^3) time, O(n^2) space.
**Edge cases to test:** `[3, 1, 5, 8]` gives 167; `[1, 5]` gives 10; one balloon `[7]` gives 7; balloons with 0 value `[0, 5]`; all ones `[1, 1, 1]` gives 3.

### Regular Expression Matching (Hard)
**Restate:** Say whether the whole string s matches pattern p, where `.` matches any one character and `*` means "zero or more of the character before it".
**Hint 1:** 2-D DP (or recursion with memo) over positions in s and p.
**Hint 2:** Look one character ahead in the pattern. If `p[j + 1]` is `*`, you have two choices: use zero copies (skip `p[j]` and `*`), or if the current characters match, use one copy and stay on the same pattern position.
**State:** `dp[i][j]` = True if `s[i:]` matches `p[j:]`.
**Transition:** Let `first = i < len(s) and p[j] in (s[i], '.')`. If `j + 1 < len(p)` and `p[j + 1] == '*'`: `dp[i][j] = dp[i][j + 2] or (first and dp[i + 1][j])`. Else: `dp[i][j] = first and dp[i + 1][j + 1]`.
**Hint 3:**
- Base: `dp[len(s)][len(p)] = True`.
- Fill from the end backwards (i from len(s) down to 0, j from len(p) - 1 down to 0).
- Note i goes up to len(s): an empty rest of s can still match patterns like `a*`.
- Return `dp[0][0]`.
**Complexity:** O(m * n) time and space.
**Edge cases to test:** `"aa", "a"` gives False; `"aa", "a*"` gives True; `"ab", ".*"` gives True; `"aab", "c*a*b"` gives True; `"mississippi", "mis*is*p*."` gives False; `"", "a*b*"` gives True.

## More quiz

1. In Burst Balloons, why do we choose the LAST balloon to burst in a range?
   - A. It is the biggest balloon
   - B. Its neighbours are then fixed (the range ends), so the two sides become independent
   - C. It makes the code shorter
   - D. The first balloon cannot be chosen
2. Which pattern fits "count ways to turn s into t by deleting characters"?
   - A. Sliding window
   - B. 2-D DP over positions in s and t
   - C. Greedy
   - D. Heap
3. Target Sum has `nums = [1, 2, 3]` and target 7. What is the answer?
   - A. 1
   - B. 3
   - C. 0
   - D. 2
4. In the stock cooldown problem, what enforces the one-day rest after selling?
   - A. You buy from the `rest` state, not from the `sold` state
   - B. You sort the prices
   - C. You skip every second day
   - D. You sell only on even days
5. In Longest Increasing Path In a Matrix, why is no visited set needed?
   - A. The grid is small
   - B. Strictly increasing steps can never return to a cell, so there are no cycles
   - C. Memo is the visited set
   - D. DFS never repeats

## Answer key

1. **B** - When k is the last balloon in (l, r), it is next to `nums[l]` and `nums[r]` when it bursts. This splits the problem into two smaller ranges.
2. **B** - Each state is "where am I in s and in t", and each step decides to use or skip the current character of s.
3. **C** - The total is 6, which is less than 7, so no sign choice can reach 7.
4. **A** - After a sale you move to `sold`; you must move to `rest` for a day before buying again.
5. **B** - Values strictly grow along a path, so a path is a chain with no loops. Memo only saves time; it is not needed for correctness.

## Flashcards

- **Q:** What are the first row and column in Unique Paths? — **A:** All 1, because there is only one straight path to each of them.
- **Q:** What are the three states in stock with cooldown? — **A:** Hold, sold (today), rest (free to buy).
- **Q:** Coin Change II: which loop must be outside? — **A:** The coins loop, so combinations are not counted in different orders.
- **Q:** How does Target Sum become subset sum? — **A:** Count subsets with sum P = (total + target) / 2.
- **Q:** First check in Interleaving String? — **A:** len(s1) + len(s2) must equal len(s3).
- **Q:** Edit Distance base case `dp[i][0]`? — **A:** i, because you delete all i characters.
- **Q:** Distinct Subsequences base case for an empty t? — **A:** 1 way (delete everything).
- **Q:** What padding does Burst Balloons use? — **A:** Add a 1 at both ends of the array.
- **Q:** In regex matching, what are the two choices for `x*`? — **A:** Use zero copies (skip two pattern characters) or use one copy and stay on the same pattern position.
- **Q:** A tester input that breaks a naive regex matcher? — **A:** An empty s with pattern `a*b*`, which must return True.

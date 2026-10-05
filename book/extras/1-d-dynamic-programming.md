## Problem hints

### Climbing Stairs (Easy)
**Restate:** You climb a staircase of n steps, taking 1 or 2 steps at a time. Count the different ways to reach the top.
**Hint 1:** 1-D DP. It is the Fibonacci pattern.
**Hint 2:** Your last move to step i was either a 1-step from i - 1 or a 2-step from i - 2. So the ways add up.
**State:** `dp[i]` = number of ways to reach step i.
**Transition:** `dp[i] = dp[i - 1] + dp[i - 2]`, with `dp[1] = 1`, `dp[2] = 2`.
**Hint 3:**
- Handle `n <= 2` directly (return n).
- Keep two variables for the last two values.
- Loop from 3 to n, computing the new value as their sum.
- Shift the two variables forward.
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** `n = 1` gives 1; `n = 2` gives 2; `n = 3` gives 3; `n = 5` gives 8; `n = 45` (largest usual input, checks you do not use slow plain recursion).

### Min Cost Climbing Stairs (Easy)
**Restate:** Each step has a cost you pay when you stand on it. You may start at step 0 or 1 and climb 1 or 2 steps at a time. Return the minimum cost to reach the top (just past the last step).
**Hint 1:** 1-D DP, like Climbing Stairs, but with `min` instead of `+`.
**Hint 2:** The "top" is position n, one past the last index. Starting at step 0 or 1 is free.
**State:** `dp[i]` = minimum cost to arrive at position i (before paying cost[i]).
**Transition:** `dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])`, with `dp[0] = dp[1] = 0`. Answer is `dp[n]`.
**Hint 3:**
- Set `dp[0] = dp[1] = 0`.
- Loop i from 2 to n using the transition.
- Return `dp[n]`.
- You can keep only two variables.
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** `[10, 15, 20]` gives 15; `[1,100,1,1,1,100,1,1,100,1]` gives 6; two steps `[5, 3]` gives 3; all zeros gives 0; all equal costs.

### House Robber (Medium)
**Restate:** Houses in a row hold money. You cannot rob two neighbouring houses. Return the maximum money you can rob.
**Hint 1:** 1-D DP with a "take or skip" choice.
**Hint 2:** At house i, either skip it (keep the best up to i - 1) or rob it (its money plus the best up to i - 2).
**State:** `dp[i]` = best money from houses 0..i.
**Transition:** `dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])`.
**Hint 3:**
- Keep `prev2` (best up to i - 2) and `prev1` (best up to i - 1), both 0 at the start.
- For each house, `cur = max(prev1, prev2 + money)`.
- Shift: `prev2 = prev1`, `prev1 = cur`.
- Return `prev1`.
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** one house `[5]` gives 5; `[2, 1, 1, 2]` gives 4 (rob the first and last, skipping two in the middle); `[2, 7, 9, 3, 1]` gives 12; all zeros; two houses `[1, 2]` gives 2.

### House Robber II (Medium)
**Restate:** Same as House Robber, but the houses are in a circle, so the first and last houses are neighbours.
**Hint 1:** Reuse House Robber twice.
**Hint 2:** You cannot rob both the first and the last house. So the answer is the better of: rob houses 0..n-2, or rob houses 1..n-1.
**State:** Same as House Robber, on each of the two ranges.
**Transition:** `dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])` inside each range.
**Hint 3:**
- If there is only one house, return its value.
- Run House Robber on `nums[:-1]`.
- Run House Robber on `nums[1:]`.
- Return the larger result.
**Complexity:** O(n) time, O(1) space (if you pass index ranges instead of slices).
**Edge cases to test:** `[5]` gives 5 (both slices would be empty without the special case); `[2, 3, 2]` gives 3; `[1, 2, 3, 1]` gives 4; `[1, 2]` gives 2; `[200, 3, 140, 20, 10]` gives 340.

### Longest Palindromic Substring (Medium)
**Restate:** Return the longest substring of s that reads the same forwards and backwards.
**Hint 1:** You can use a 2-D DP table, but "expand around the centre" is simpler and uses O(1) space.
**Hint 2:** Every palindrome has a centre: one character (odd length) or the gap between two characters (even length). There are only 2n - 1 centres.
**State:** (DP version) `dp[i][j]` = True if `s[i..j]` is a palindrome.
**Transition:** `dp[i][j] = (s[i] == s[j]) and (j - i < 2 or dp[i + 1][j - 1])`.
**Hint 3:** (expand-around-centre version)
- For each index i, expand from `(i, i)` and from `(i, i + 1)`.
- While both ends are in bounds and the characters match, move left down and right up.
- After expanding, the palindrome is `s[left + 1 : right]`.
- Keep the longest one.
**Complexity:** O(n^2) time, O(1) extra space.
**Edge cases to test:** one character `"a"`; `"babad"` gives `"bab"` or `"aba"` (accept either); `"cbbd"` gives `"bb"` (even length); the whole string is a palindrome `"racecar"`; all different letters `"abcd"` gives one letter.

### Palindromic Substrings (Medium)
**Restate:** Count how many substrings of s are palindromes (the same substring at different positions counts separately).
**Hint 1:** Same expand-around-centre idea.
**Hint 2:** Each successful expansion step finds exactly one new palindrome. So count every step where the two ends match.
**State:** (DP version) `dp[i][j]` = True if `s[i..j]` is a palindrome; the answer is the number of True cells.
**Transition:** `dp[i][j] = (s[i] == s[j]) and (j - i < 2 or dp[i + 1][j - 1])`.
**Hint 3:**
- For each centre (2n - 1 of them, odd and even), expand outward.
- Add 1 to the count every time the ends match.
- Stop when they do not match or go out of bounds.
- Return the count.
**Complexity:** O(n^2) time, O(1) extra space.
**Edge cases to test:** `"a"` gives 1; `"abc"` gives 3; `"aaa"` gives 6; `"abba"` gives 6; a long string of one letter (worst case speed).

### Decode Ways (Medium)
**Restate:** Letters map to numbers (A = 1 ... Z = 26). Given a digit string, count how many ways it can be decoded back into letters.
**Hint 1:** 1-D DP over prefixes, very similar to Climbing Stairs.
**Hint 2:** The last letter uses either 1 digit (valid if it is not "0") or 2 digits (valid if they form 10 to 26). "0" can never stand alone.
**State:** `dp[i]` = number of ways to decode the first i characters.
**Transition:** `dp[i] = (dp[i - 1] if s[i - 1] != '0') + (dp[i - 2] if 10 <= int(s[i - 2 : i]) <= 26)`, with `dp[0] = 1`.
**Hint 3:**
- Set `dp[0] = 1` (empty prefix has one way).
- For i from 1 to n, add the one-digit case.
- For i from 2 to n, add the two-digit case.
- Return `dp[n]`; you can keep only two variables.
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** `"12"` gives 2; `"226"` gives 3; `"06"` gives 0 (leading zero); `"10"` gives 1; `"100"` gives 0; `"27"` gives 1 (27 is not a letter).

### Coin Change (Medium)
**Restate:** Given coin values (unlimited supply) and an amount, return the fewest coins that make the amount, or -1 if it is impossible.
**Hint 1:** 1-D DP over amounts (unbounded knapsack, minimum version).
**Hint 2:** Greedy (always take the biggest coin) is WRONG here. For coins `[1, 3, 4]` and amount 6, greedy gives 4+1+1 (3 coins), but 3+3 is 2 coins.
**State:** `dp[a]` = fewest coins to make amount a.
**Transition:** `dp[a] = min(dp[a - c] + 1)` for every coin `c <= a`, with `dp[0] = 0`.
**Hint 3:**
- Make `dp` of size amount + 1 filled with infinity; `dp[0] = 0`.
- For a from 1 to amount, for each coin, apply the transition.
- At the end, return `dp[amount]`, or -1 if it is still infinity.
**Complexity:** O(amount * number of coins) time, O(amount) space.
**Edge cases to test:** amount 0 gives 0; `[2], 3` gives -1; `[1], 0` gives 0; `[1, 3, 4], 6` gives 2 (beats greedy); a coin larger than the amount `[5], 3` gives -1.

### Maximum Product Subarray (Medium)
**Restate:** Find the contiguous subarray with the largest product and return that product.
**Hint 1:** Like Kadane's algorithm, but track TWO values.
**Hint 2:** A negative number turns the smallest (most negative) product into the largest. So keep both the max and the min product of a subarray ending here.
**State:** `hi[i]`, `lo[i]` = largest and smallest product of a subarray ending at i.
**Transition:** `hi[i] = max(x, x * hi[i - 1], x * lo[i - 1])`, `lo[i] = min(x, x * hi[i - 1], x * lo[i - 1])`, where `x = nums[i]`.
**Hint 3:**
- Start `hi = lo = best = nums[0]`.
- For each next x, compute new `hi` and `lo` from the OLD values (use temporaries).
- Update `best = max(best, hi)`.
- Return `best`.
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** `[2, 3, -2, 4]` gives 6; `[-2, 0, -1]` gives 0; `[-2, 3, -4]` gives 24 (two negatives); a single negative `[-3]` gives -3; zeros splitting the array `[0, 2, 0, 3]`.

### Word Break (Medium)
**Restate:** Given a string and a dictionary of words, say whether the string can be split into a sequence of dictionary words (words can be reused).
**Hint 1:** 1-D DP over prefixes, with the dictionary in a set.
**Hint 2:** A prefix of length i is breakable if some shorter breakable prefix of length j is followed by a dictionary word `s[j:i]`.
**State:** `dp[i]` = True if `s[:i]` can be split into words.
**Transition:** `dp[i] = any(dp[j] and s[j:i] in words for j < i)`, with `dp[0] = True`.
**Hint 3:**
- Put the words in a set; note the max word length.
- `dp[0] = True`.
- For each i from 1 to n, check j from i - 1 down to i - maxLen.
- Stop early once `dp[i]` becomes True.
- Return `dp[n]`.
**Complexity:** O(n * L) checks where L is the max word length (each slice costs O(L), so O(n * L^2) in total); O(n) space.
**Edge cases to test:** `"leetcode", ["leet","code"]` gives True; `"applepenapple", ["apple","pen"]` gives True (reuse); `"catsandog", ["cats","dog","sand","and","cat"]` gives False; a single word equal to s; `"aaaaaaab", ["a","aa","aaa"]` gives False (slow for naive recursion).

### Longest Increasing Subsequence (Medium)
**Restate:** Return the length of the longest strictly increasing subsequence (elements do not need to be next to each other).
**Hint 1:** The basic DP is O(n^2). A faster O(n log n) method uses binary search.
**Hint 2:** Keep a list `tails`, where `tails[k]` is the smallest possible last value of an increasing subsequence of length k + 1. This list is always sorted, so you can binary search it.
**State:** (O(n^2) version) `dp[i]` = length of the LIS that ends at index i.
**Transition:** `dp[i] = 1 + max(dp[j] for j < i if nums[j] < nums[i])`, or 1 if no such j.
**Hint 3:** (O(n log n) version)
- Start with empty `tails`.
- For each x, find the first position in `tails` with value `>= x` (bisect_left).
- If there is none, append x; otherwise replace that value with x.
- The answer is `len(tails)`. (Note: `tails` itself is not always a real subsequence.)
**Complexity:** O(n log n) time, O(n) space.
**Edge cases to test:** `[10,9,2,5,3,7,101,18]` gives 4; `[0,1,0,3,2,3]` gives 4; `[7,7,7,7]` gives 1 (strictly increasing); one element gives 1; already sorted `[1,2,3,4]` gives 4.

### Partition Equal Subset Sum (Medium)
**Restate:** Say whether the list can be split into two groups with equal sums.
**Hint 1:** 0/1 knapsack (subset sum).
**Hint 2:** If the total is odd, the answer is False. Otherwise, you only need ONE subset that sums to `total / 2`; the rest automatically forms the other half.
**State:** `dp[s]` = True if some subset of the numbers seen so far sums to s.
**Transition:** For each number x, for s from target DOWN to x: `dp[s] = dp[s] or dp[s - x]`.
**Hint 3:**
- If the total is odd, return False.
- `target = total // 2`, `dp[0] = True`.
- For each number, update `dp` from high s to low s (so each number is used once).
- Return `dp[target]`.
**Complexity:** O(n * target) time, O(target) space.
**Edge cases to test:** `[1, 5, 11, 5]` gives True; `[1, 2, 3, 5]` gives False; odd total `[1, 2]` gives False; one element `[2]` gives False; `[1, 1]` gives True.

## More quiz

1. In Decode Ways, why is `dp[0] = 1`?
   - A. Because "0" is a valid letter
   - B. The empty prefix has exactly one way to decode (do nothing), and it lets the two-digit case add correctly
   - C. It is a random starting value
   - D. Because A = 1
2. In Partition Equal Subset Sum, why do you loop s from high to low?
   - A. It is faster
   - B. So each number is used at most once in this round
   - C. To sort the numbers
   - D. To allow reusing numbers
3. Which pattern fits "fewest coins to make an amount"?
   - A. Greedy, biggest coin first
   - B. Unbounded knapsack DP with min
   - C. Two pointers
   - D. Backtracking that returns all answers
4. In Maximum Product Subarray, why keep the minimum product too?
   - A. To handle zeros only
   - B. A negative number can turn the minimum into the new maximum
   - C. To save memory
   - D. The minimum is the answer
5. How many centres does a string of length n have for expand-around-centre?
   - A. n
   - B. n / 2
   - C. 2n - 1
   - D. n^2

## Answer key

1. **B** - The empty start gives the base for both one-digit and two-digit steps. For "12", `dp[2] = dp[1] + dp[0] = 1 + 1 = 2`.
2. **B** - Going downward reads `dp[s - x]` values from before this number was added. Going upward would let one number count many times.
3. **B** - Greedy fails for coins like `[1, 3, 4]` and amount 6. DP tries every coin for every amount.
4. **B** - Multiplying the most negative product by a negative number gives the biggest positive product.
5. **C** - There are n single-character centres and n - 1 gaps between characters.

## Flashcards

- **Q:** Climbing Stairs is the same pattern as which famous sequence? — **A:** Fibonacci.
- **Q:** Where is the "top" in Min Cost Climbing Stairs? — **A:** Position n, one past the last step.
- **Q:** How does House Robber II break the circle? — **A:** Take the best of robbing houses 0..n-2 and houses 1..n-1.
- **Q:** What makes a two-digit chunk valid in Decode Ways? — **A:** Its value is between 10 and 26.
- **Q:** What does `tails[k]` mean in the O(n log n) LIS? — **A:** The smallest last value of any increasing subsequence of length k + 1.
- **Q:** Quick rejection in Partition Equal Subset Sum? — **A:** If the total sum is odd, return False.
- **Q:** What is the Word Break base case? — **A:** `dp[0] = True`, the empty prefix is always breakable.
- **Q:** How do you count palindromic substrings fast? — **A:** Expand around every centre and add 1 for each matching step.
- **Q:** What does Coin Change return when the amount is impossible? — **A:** -1 (the dp value stayed infinity).
- **Q:** A good tester input for Maximum Product Subarray? — **A:** `[-2, 3, -4]`, which needs two negatives to give 24.

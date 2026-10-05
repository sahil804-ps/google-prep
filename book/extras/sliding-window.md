## Problem hints

Try each problem on your own first. Open one hint at a time. Only go to the next hint when you are stuck for 10 or more minutes.

### Best Time to Buy And Sell Stock (Easy)

**Restate:** Given daily stock prices, choose one day to buy and a later day to sell to get the maximum profit, or return 0 if no profit is possible.

**Hint 1:** Walk the prices once from left to right. Think of the buy day as the left edge and today as the right edge of a window.

**Hint 2:** For each day, the best buy so far is simply the lowest price seen before today. So you only need to remember one number: the minimum price so far.

**Hint 3:**
- Set `min_price = prices[0]`, `best = 0`.
- For each later price `p`:
- Update `best = max(best, p - min_price)`.
- Update `min_price = min(min_price, p)`.
- Return `best`.

**Complexity:** O(n) time, O(1) space.

**Edge cases to test:**
- `[5]` (one day, answer 0)
- `[7, 6, 4, 3, 1]` (always falling, answer 0)
- `[1, 2]` (answer 1)
- `[7, 1, 5, 3, 6, 4]` (answer 5, buy at 1 and sell at 6)
- `[2, 4, 1]` (the minimum comes after the best sell day; answer 2, not 0)

### Longest Substring Without Repeating Characters (Medium)

**Restate:** Return the length of the longest contiguous part of a string in which no character appears twice.

**Hint 1:** Variable-size sliding window. Grow the right edge; shrink the left edge when the window becomes invalid.

**Hint 2:** Store the last index where each character was seen. When `s[r]` was seen inside the current window, jump `l` straight to one past that old index, instead of removing characters one by one.

**Hint 3:**
- Set `l = 0`, `best = 0`, `last = {}`.
- For each `r` and character `ch`:
- If `ch` is in `last` and `last[ch] >= l`, set `l = last[ch] + 1`.
- Set `last[ch] = r`.
- Update `best = max(best, r - l + 1)`.

**Complexity:** O(n) time, O(min(n, alphabet size)) space.

**Edge cases to test:**
- `""` (answer 0)
- `" "` (a single space, answer 1)
- `"bbbbb"` (answer 1)
- `"abba"` (answer 2; catches the bug where `l` moves backwards if you forget `last[ch] >= l`)
- `"pwwkew"` (answer 3, `"wke"`)

### Longest Repeating Character Replacement (Medium)

**Restate:** You may change up to `k` characters of an uppercase string; return the length of the longest substring that can be made of one repeated letter.

**Hint 1:** Variable window with a count of each letter inside the window.

**Hint 2:** A window is fine when `window_length - count_of_most_common_letter <= k`, because you replace all the other letters. A known trick: you never need to decrease `max_freq` when shrinking, because the answer only grows when a bigger `max_freq` appears.

**Hint 3:**
- Keep `count` (dict), `l = 0`, `max_freq = 0`, `best = 0`.
- For each `r`: add `s[r]` to `count`; `max_freq = max(max_freq, count[s[r]])`.
- While `(r - l + 1) - max_freq > k`: remove `s[l]` from `count`, `l += 1`.
- Update `best = max(best, r - l + 1)`.

**Complexity:** O(n) time, O(26) = O(1) space.

**Edge cases to test:**
- `s = "A", k = 0` (answer 1)
- `s = "ABAB", k = 2` (answer 4)
- `s = "AABABBA", k = 1` (answer 4)
- `s = "ABCD", k = 0` (answer 1)
- `s = "AAAA", k = 10` (k bigger than the string; answer 4, not 14)

### Permutation In String (Medium)

**Restate:** Return True if some contiguous part of `s2` is a rearrangement (permutation) of `s1`.

**Hint 1:** Fixed-size sliding window. The window size is `len(s1)`.

**Hint 2:** A window is a permutation of `s1` when its letter counts equal the counts of `s1`. Slide the window by adding one letter on the right and removing one on the left, and compare two 26-length count arrays (or track how many of the 26 letters currently match).

**Hint 3:**
- If `len(s1) > len(s2)`, return False.
- Build counts for `s1` and for the first `len(s1)` letters of `s2`.
- If they are equal, return True.
- Slide: add `s2[r]`, remove `s2[r - len(s1)]`, compare again.
- If no window matches, return False.

**Complexity:** O(26 * n) = O(n) time with array comparison (O(n) with a "matches" counter), O(1) space.

**Edge cases to test:**
- `s1 = "ab", s2 = "eidbaooo"` (True)
- `s1 = "ab", s2 = "eidboaoo"` (False)
- `s1 = "abc", s2 = "ab"` (s1 longer, False)
- `s1 = "a", s2 = "a"` (True)
- `s1 = "aab", s2 = "abbb"` (same letters but wrong counts in every window, False)

### Minimum Window Substring (Hard)

**Restate:** Return the shortest contiguous part of `s` that contains every character of `t` (including repeats), or `""` if none exists.

**Hint 1:** Variable sliding window: expand right until the window is valid, then shrink left as much as possible while it stays valid.

**Hint 2:** Keep `need` = counts of `t`, and a number `have` = how many distinct characters currently meet their required count. The window is valid when `have == len(need)`. This check is O(1), so you do not compare whole dicts each step.

**Hint 3:**
- Build `need` from `t`; set `window = {}`, `have = 0`, `l = 0`.
- For each `r`: add `s[r]` to `window`; if it is in `need` and `window[s[r]] == need[s[r]]`, do `have += 1`.
- While `have == len(need)`: record the window if it is the shortest so far.
- Then remove `s[l]`; if it is in `need` and `window[s[l]] < need[s[l]]`, do `have -= 1`; `l += 1`.
- Return the best window, or `""`.

**Complexity:** O(len(s) + len(t)) time, O(alphabet) space.

**Edge cases to test:**
- `s = "a", t = "a"` (answer `"a"`)
- `s = "a", t = "aa"` (answer `""`, not enough copies)
- `s = "ADOBECODEBANC", t = "ABC"` (answer `"BANC"`)
- `s = "ab", t = "b"` (answer `"b"`)
- `s = "aA", t = "a"` (case sensitive, answer `"a"`)

### Sliding Window Maximum (Hard)

**Restate:** For every window of size `k` that slides over the array, return the maximum value inside the window.

**Hint 1:** Use a deque (double-ended queue) that holds indexes.

**Hint 2:** Keep the deque in decreasing order of values (a monotonic deque). A smaller value that sits before a bigger new value can never be a maximum again, so pop it from the back. The front is always the current maximum; pop it from the front when it falls out of the window.

**Hint 3:**
- For each index `r`:
- While the deque is not empty and `nums[deque[-1]] <= nums[r]`, pop from the back.
- Append `r`.
- If `deque[0] <= r - k`, pop from the front (it left the window).
- If `r >= k - 1`, append `nums[deque[0]]` to the result.

**Complexity:** O(n) time (each index enters and leaves the deque once), O(k) space.

**Edge cases to test:**
- `nums = [1], k = 1` (answer `[1]`)
- `nums = [1, -1], k = 1` (answer `[1, -1]`)
- `nums = [9, 8, 7, 6], k = 2` (decreasing, answer `[9, 8, 7]`)
- `nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3` (answer `[3, 3, 5, 5, 6, 7]`)
- `k` equal to the array length (one answer, the global maximum)

## More quiz

1. In Sliding Window Maximum, what does the deque store, and in what order?
   - A. Values, in increasing order
   - B. Indexes, with their values in decreasing order from front to back
   - C. All k values of the window, unsorted
   - D. Only the maximum

2. In Minimum Window Substring, what does the variable `have` count?
   - A. The window length
   - B. The total number of characters in t
   - C. The number of distinct characters whose required count is fully met in the window
   - D. The number of times the window moved

3. Which pattern fits "find all start indexes of anagrams of p in s"?
   - A. Fixed-size sliding window with letter counts
   - B. Binary search
   - C. Monotonic stack
   - D. Two heaps

4. For Best Time to Buy and Sell Stock, prices `[3, 8, 1, 4]`. What is the answer?
   - A. 3
   - B. 5
   - C. 7
   - D. 0

5. In Longest Substring Without Repeating Characters, why must you check `last[ch] >= l` before moving `l`?
   - A. To avoid an index error
   - B. To make the code faster
   - C. An old position outside the window would move `l` backwards, as in `"abba"`
   - D. It is not needed

## Answer key

1. **B** - The deque holds indexes so you can tell when the front has left the window. Values are kept decreasing, so the front is always the maximum.
2. **C** - `have` goes up by one when a character reaches its needed count and goes down when it drops below. The window is valid when `have` equals the number of distinct characters in t.
3. **A** - This is "Find All Anagrams in a String". The window size is `len(p)`, and you compare letter counts as the window slides, exactly like Permutation in String.
4. **B** - Buy at 3 and sell at 8 for a profit of 5. Buying at 1 later only allows selling at 4 for a profit of 3.
5. **C** - In `"abba"`, at the last `"a"` the left edge is already at index 2. The old `"a"` at index 0 is outside the window, so jumping to index 1 would wrongly move `l` backwards.

## Flashcards

- **Q:** Best Time to Buy and Sell Stock: what single value do you track besides the best profit? — **A:** The minimum price seen so far.
- **Q:** Longest Substring Without Repeating: what map speeds up the shrink step? — **A:** A dict of character -> last index seen, so `l` can jump directly.
- **Q:** Character Replacement validity rule? — **A:** `window_length - max_freq <= k`.
- **Q:** Why is it fine to never decrease max_freq in Character Replacement? — **A:** The best answer only grows when a larger max_freq appears, so a stale max_freq never produces a wrong larger answer.
- **Q:** Permutation in String: window size? — **A:** Fixed at `len(s1)`.
- **Q:** Minimum Window Substring: when do you shrink the left edge? — **A:** While the window is valid (`have == len(need)`), recording the shortest window each time.
- **Q:** Sliding Window Maximum: when do you pop from the front of the deque? — **A:** When the front index is `<= r - k`, meaning it has left the window.
- **Q:** Sliding Window Maximum: why pop smaller values from the back? — **A:** A smaller value before a bigger newer value can never be a window maximum again.
- **Q:** Minimum Window Substring test that checks repeat counts? — **A:** `s = "a", t = "aa"` must return `""`.

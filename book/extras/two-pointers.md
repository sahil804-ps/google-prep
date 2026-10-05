## Problem hints

Try each problem on your own first. Open one hint at a time. Only go to the next hint when you are stuck for 10 or more minutes.

### Valid Palindrome (Easy)

**Restate:** Return True if a string reads the same forwards and backwards after you ignore case and remove every character that is not a letter or a digit.

**Hint 1:** Use two pointers, one at the start and one at the end, moving towards each other.

**Hint 2:** You do not need to build a cleaned copy. Just skip non-alphanumeric characters with the pointers and compare the lowercase forms.

**Hint 3:**
- Set `l = 0` and `r = len(s) - 1`.
- While `l < r`: move `l` right while `s[l]` is not alphanumeric (and `l < r`).
- Move `r` left while `s[r]` is not alphanumeric (and `l < r`).
- If `s[l].lower() != s[r].lower()`, return False.
- Move both pointers inward; after the loop return True.

**Complexity:** O(n) time, O(1) space.

**Edge cases to test:**
- `""` (empty string, True)
- `" "` (only a space, True after cleaning)
- `".,"` (only punctuation, True)
- `"0P"` (digit and letter, False; a common bug if you lowercase digits wrongly or skip digits)
- `"A man, a plan, a canal: Panama"` (True)

### Two Sum II Input Array Is Sorted (Medium)

**Restate:** Given a sorted list and a target, return the 1-based positions of the two numbers that add up to the target, using only O(1) extra space.

**Hint 1:** The list is sorted. That is the signal for two pointers at opposite ends instead of a hash map.

**Hint 2:** If the sum is too small, the only way to grow it is to move the left pointer right. If the sum is too big, move the right pointer left. You never skip the real answer.

**Hint 3:**
- Set `l = 0`, `r = n - 1`.
- Compute `total = numbers[l] + numbers[r]`.
- If `total == target`, return `[l + 1, r + 1]`.
- If `total < target`, do `l += 1`; else do `r -= 1`.
- Repeat while `l < r`.

**Complexity:** O(n) time, O(1) space.

**Edge cases to test:**
- `[2, 7, 11, 15], target = 9` (answer `[1, 2]`, note 1-based)
- `[-1, 0], target = -1` (negatives)
- `[1, 1, 3], target = 2` (duplicate values)
- `[1, 2, 3, 4, 9], target = 13` (answer is the last two elements, `[4, 5]`)
- Two-element list

### 3Sum (Medium)

**Restate:** Find all unique groups of three numbers in the list that add up to zero (no repeated triplets in the output).

**Hint 1:** Sort the list first. Then fix one number and solve "Two Sum II" on the rest with two pointers.

**Hint 2:** The hard part is avoiding duplicate triplets. After sorting, equal values sit next to each other, so you skip a fixed number if it equals the one before it, and after finding a triplet you move `l` past all equal values.

**Hint 3:**
- Sort `nums`.
- For each index `i`: if `i > 0` and `nums[i] == nums[i - 1]`, skip. (You can also stop when `nums[i] > 0`.)
- Set `l = i + 1`, `r = n - 1`; compare `nums[i] + nums[l] + nums[r]` with 0.
- Too small: `l += 1`. Too big: `r -= 1`.
- Equal: save the triplet, move `l` right, and keep moving `l` while `nums[l] == nums[l - 1]` and `l < r`.

**Complexity:** O(n^2) time, O(1) extra space besides the output (sorting may use O(n) depending on the language).

**Edge cases to test:**
- `[0, 0, 0]` (answer `[[0, 0, 0]]`)
- `[0, 0, 0, 0]` (still only one triplet)
- `[0, 1, 1]` (no answer, `[]`)
- `[-1, 0, 1, 2, -1, -4]` (answer `[[-1, -1, 2], [-1, 0, 1]]`)
- `[-2, 0, 0, 2, 2]` (duplicates on the right side)

### Container With Most Water (Medium)

**Restate:** Given heights of vertical lines, pick two lines that, with the x-axis, hold the most water, and return that area.

**Hint 1:** Start with the widest container: one pointer at each end.

**Hint 2:** Area = `min(height[l], height[r]) * (r - l)`. Moving the taller line inward can never help, because the width shrinks and the shorter line still limits the height. So always move the shorter line.

**Hint 3:**
- Set `l = 0`, `r = n - 1`, `best = 0`.
- Compute the area and update `best`.
- If `height[l] < height[r]`, do `l += 1`; else do `r -= 1`.
- Repeat while `l < r`.
- Return `best`.

**Complexity:** O(n) time, O(1) space.

**Edge cases to test:**
- `[1, 1]` (answer 1)
- `[1, 8, 6, 2, 5, 4, 8, 3, 7]` (answer 49)
- `[4, 3, 2, 1, 4]` (best uses both ends, answer 16)
- `[0, 0, 0]` (answer 0)
- `[1, 2, 1]` (answer 2, uses the two outer lines)

### Trapping Rain Water (Hard)

**Restate:** Given bar heights, compute how many units of rain water get trapped between the bars.

**Hint 1:** Water above bar `i` = `min(max height on its left, max height on its right) - height[i]`, if that is positive.

**Hint 2:** You can avoid the two prefix-max arrays. Keep two pointers and two running maxima. Whichever side has the smaller running max is the side whose water you can safely compute now, because the other side is guaranteed to be at least as tall.

**Hint 3:**
- Set `l = 0`, `r = n - 1`, `left_max = height[l]`, `right_max = height[r]`, `water = 0`.
- While `l < r`: if `left_max < right_max`, move `l` right, update `left_max = max(left_max, height[l])`, add `left_max - height[l]`.
- Else move `r` left, update `right_max = max(right_max, height[r])`, add `right_max - height[r]`.
- Return `water`.

**Complexity:** O(n) time, O(1) space (the prefix/suffix array method is O(n) space and also accepted).

**Edge cases to test:**
- `[]` or a single bar (answer 0)
- `[1, 2, 3, 4]` (always rising, answer 0)
- `[4, 3, 2, 1]` (always falling, answer 0)
- `[2, 0, 2]` (answer 2)
- `[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]` (answer 6)

## More quiz

1. In 3Sum, why do you sort the array first?
   - A. Sorting is required for any Python list
   - B. So you can use two pointers for the remaining pair and skip duplicates easily
   - C. To reduce the time to O(n)
   - D. To find the median

2. In Trapping Rain Water with two pointers, when `left_max < right_max`, why is it safe to compute water at the left pointer?
   - A. Because the left side is always taller
   - B. Because the water at the left pointer is limited by left_max, since the right side has a bar at least as tall
   - C. Because right_max is wrong
   - D. It is not safe; you need both arrays

3. Which pattern fits "check if a string is a palindrome after removing at most one character"?
   - A. Hash map counting
   - B. Two pointers from both ends; on the first mismatch, try skipping the left char or the right char
   - C. Binary search
   - D. Heap

4. What does Two Sum II return for `numbers = [1, 3, 4, 5], target = 8`?
   - A. `[1, 4]`
   - B. `[2, 4]`
   - C. `[3, 4]`
   - D. `[2, 3]`

5. Container With Most Water: heights `[1, 2, 4, 3]`. What is the maximum area?
   - A. 3
   - B. 4
   - C. 6
   - D. 8

## Answer key

1. **B** - Sorting lets you fix one number and move two pointers inward based on whether the sum is too small or too large. Equal values become neighbours, so skipping duplicates is a simple comparison with the previous value.
2. **B** - The right side already has a bar of height right_max, which is taller than left_max. So the water at the left pointer cannot be more than left_max minus its height, and it cannot be less either.
3. **B** - This is "Valid Palindrome II". Move inward until the first mismatch, then check if `s[l+1..r]` or `s[l..r-1]` is a palindrome.
4. **B** - The values at 1-based positions are 1, 3, 4, 5. The pair 3 + 5 = 8 sits at positions 2 and 4, so the answer is `[2, 4]`.
5. **B** - Index 1 (height 2) and index 3 (height 3) give `min(2, 3) * 2 = 4`. Every other pair gives 3 or less, for example index 2 and 3 give `min(4, 3) * 1 = 3`.

## Flashcards

- **Q:** What signal in a pair-sum problem tells you to use two pointers instead of a hash map? — **A:** The array is sorted, or you are allowed to sort it.
- **Q:** Two Sum II: the sum is bigger than the target. Which pointer moves? — **A:** The right pointer moves left, to make the sum smaller.
- **Q:** How do you skip duplicate fixed values in 3Sum? — **A:** If `i > 0` and `nums[i] == nums[i - 1]`, continue to the next i.
- **Q:** 3Sum: early stop condition after sorting? — **A:** If `nums[i] > 0`, no triplet starting here can sum to zero, so stop.
- **Q:** Container With Most Water area formula? — **A:** `min(height[l], height[r]) * (r - l)`.
- **Q:** Trapping Rain Water: water above bar i? — **A:** `min(max_left, max_right) - height[i]`, or 0 if that is negative.
- **Q:** Why does a strictly increasing height list trap no water? — **A:** Every bar has no taller bar on its left, so the left max equals its own height.
- **Q:** Space of the prefix-max solution vs the two-pointer solution for Trapping Rain Water? — **A:** Prefix-max uses O(n) for two arrays; two pointers uses O(1).
- **Q:** Valid Palindrome test that catches "letters only" bugs? — **A:** `"0P"`, which must return False because digits count as characters.

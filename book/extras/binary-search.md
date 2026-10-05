## Problem hints

Try each problem on your own first. Open one hint at a time. Only go to the next hint when you are stuck for 10 or more minutes.

### Binary Search (Easy)

**Restate:** Given a sorted list of distinct numbers and a target, return the index of the target, or -1 if it is not there, in O(log n) time.

**Hint 1:** Keep a search range `[lo, hi]` and look at the middle element each time.

**Hint 2:** If the middle is smaller than the target, the target can only be on the right, so throw away the left half including the middle. If it is bigger, throw away the right half. Use `while lo <= hi` when both ends are inclusive.

**Hint 3:**
- Set `lo = 0`, `hi = n - 1`.
- While `lo <= hi`: `mid = (lo + hi) // 2`.
- If `nums[mid] == target`, return `mid`.
- If `nums[mid] < target`, set `lo = mid + 1`; else set `hi = mid - 1`.
- Return -1.

**Complexity:** O(log n) time, O(1) space.

**Edge cases to test:**
- `nums = [5], target = 5` (answer 0)
- `nums = [5], target = 3` (answer -1)
- Target at the first index and target at the last index
- Target smaller than every element and bigger than every element
- `nums = [-1, 0, 3, 5, 9, 12], target = 2` (missing value in the middle, answer -1)

### Search a 2D Matrix (Medium)

**Restate:** Each row of the matrix is sorted and each row's first number is bigger than the previous row's last number; return True if the target is in the matrix, in O(log(m * n)) time.

**Hint 1:** The whole matrix behaves like one long sorted list.

**Hint 2:** Do binary search over indexes `0` to `m * n - 1`. Turn index `i` into a cell with `row = i // n` and `col = i % n`, where `n` is the number of columns.

**Hint 3:**
- Set `lo = 0`, `hi = m * n - 1`.
- While `lo <= hi`: `mid = (lo + hi) // 2`.
- Read `value = matrix[mid // n][mid % n]`.
- Compare with the target and move `lo` or `hi` as in normal binary search.
- Return False if the loop ends.

**Complexity:** O(log(m * n)) time, O(1) space.

**Edge cases to test:**
- `[[1]]` with target 1 and target 2
- A single row: `[[1, 3, 5, 7]]`
- A single column: `[[1], [3], [5]]`
- Target equal to the last element of a row (row boundary)
- Target smaller than `matrix[0][0]` or bigger than the last element

### Koko Eating Bananas (Medium)

**Restate:** Koko eats from one pile per hour at speed `k` bananas per hour (she finishes a pile and waits if it has fewer than k); return the smallest `k` that lets her finish all piles within `h` hours.

**Hint 1:** Binary search on the answer (the speed), not on the array.

**Hint 2:** If speed `k` works, every faster speed also works. So the "works" check is monotonic. The speed range is 1 to `max(piles)`, and hours needed at speed k is the sum of `ceil(pile / k)`.

**Hint 3:**
- Set `lo = 1`, `hi = max(piles)`.
- While `lo < hi`: `mid = (lo + hi) // 2`.
- Compute `hours = sum(ceil(p / mid) for p in piles)` (use `(p + mid - 1) // mid` to stay in integers).
- If `hours <= h`, set `hi = mid` (it works, try slower); else set `lo = mid + 1`.
- Return `lo`.

**Complexity:** O(n log M) time, where M = max pile; O(1) space.

**Edge cases to test:**
- `piles = [3, 6, 7, 11], h = 8` (answer 4)
- `piles = [30, 11, 23, 4, 20], h = 5` (h equals number of piles, answer 30 = max pile)
- `piles = [30, 11, 23, 4, 20], h = 6` (answer 23)
- `piles = [1], h = 1` (answer 1)
- `piles = [1000000000], h = 2` (very large pile; answer 500000000)

### Find Minimum In Rotated Sorted Array (Medium)

**Restate:** A sorted list of distinct numbers was rotated at an unknown point (for example `[3, 4, 5, 1, 2]`); return the smallest number in O(log n) time.

**Hint 1:** Binary search, comparing the middle with the right end.

**Hint 2:** If `nums[mid] > nums[hi]`, the drop (the minimum) is to the right of mid. Otherwise the minimum is at mid or to its left. Comparing with `hi` avoids the special case of "no rotation".

**Hint 3:**
- Set `lo = 0`, `hi = n - 1`.
- While `lo < hi`: `mid = (lo + hi) // 2`.
- If `nums[mid] > nums[hi]`, set `lo = mid + 1`.
- Else set `hi = mid`.
- Return `nums[lo]`.

**Complexity:** O(log n) time, O(1) space.

**Edge cases to test:**
- `[1]` (answer 1)
- `[1, 2, 3, 4]` (not rotated, answer 1)
- `[2, 1]` (answer 1)
- `[4, 5, 6, 7, 0, 1, 2]` (answer 0)
- `[2, 3, 4, 5, 1]` (minimum at the last index)

### Search In Rotated Sorted Array (Medium)

**Restate:** Given a rotated sorted list of distinct numbers and a target, return the index of the target or -1, in O(log n) time.

**Hint 1:** Binary search. At every step, at least one half (left of mid or right of mid) is fully sorted.

**Hint 2:** Find which half is sorted by comparing `nums[lo]` with `nums[mid]`. Then check if the target lies inside that sorted half's range. If yes, search there; if no, search the other half.

**Hint 3:**
- While `lo <= hi`: `mid = (lo + hi) // 2`; if `nums[mid] == target`, return `mid`.
- If `nums[lo] <= nums[mid]` (left half sorted):
- If `nums[lo] <= target < nums[mid]`, set `hi = mid - 1`; else `lo = mid + 1`.
- Else (right half sorted): if `nums[mid] < target <= nums[hi]`, set `lo = mid + 1`; else `hi = mid - 1`.
- Return -1.

**Complexity:** O(log n) time, O(1) space.

**Edge cases to test:**
- `nums = [1], target = 0` (answer -1)
- `nums = [3, 1], target = 1` (answer 1; tests the `<=` in `nums[lo] <= nums[mid]`)
- `nums = [4, 5, 6, 7, 0, 1, 2], target = 0` (answer 4)
- `nums = [4, 5, 6, 7, 0, 1, 2], target = 3` (answer -1)
- An array that is not rotated at all

### Time Based Key Value Store (Medium)

**Restate:** Design a store with `set(key, value, timestamp)` and `get(key, timestamp)`, where `get` returns the value set at the largest timestamp less than or equal to the given one, or `""`.

**Hint 1:** Use a dict from key to a list of `(timestamp, value)` pairs.

**Hint 2:** The problem says timestamps for `set` arrive in increasing order, so each list is already sorted. `get` becomes "binary search for the last timestamp <= t".

**Hint 3:**
- `set`: append `(timestamp, value)` to `store[key]`.
- `get`: if the key is missing, return `""`.
- Binary search the list: if `list[mid].timestamp <= t`, remember its value and go right; else go left.
- Return the remembered value, or `""` if none was found.

**Complexity:** `set` O(1), `get` O(log n) where n = number of entries for that key; O(total entries) space.

**Edge cases to test:**
- `get` for a key that was never set (answer `""`)
- `get` with a timestamp smaller than the first `set` for that key (answer `""`)
- `get` with exactly a stored timestamp
- `get` with a timestamp between two stored timestamps (returns the older value)
- `get` with a timestamp larger than all stored ones (returns the newest value)

### Median of Two Sorted Arrays (Hard)

**Restate:** Given two sorted lists, return the median of all their numbers combined, in O(log(min(m, n))) time.

**Hint 1:** Do not merge. Binary search on how many elements to take from the **smaller** list into the "left half".

**Hint 2:** If you take `i` elements from A, you must take `j = (m + n + 1) // 2 - i` from B so the left half has the right size. The split is correct when `A[i-1] <= B[j]` and `B[j-1] <= A[i]` (treat out-of-range as minus or plus infinity).

**Hint 3:**
- Make A the smaller list. Search `i` in the range `[0, m]`.
- For each `i`, compute `j`, and the four border values `Aleft, Aright, Bleft, Bright`.
- If `Aleft > Bright`, move `i` left; if `Bleft > Aright`, move `i` right.
- When correct: if the total is odd, the median is `max(Aleft, Bleft)`.
- If even, it is `(max(Aleft, Bleft) + min(Aright, Bright)) / 2`.

**Complexity:** O(log(min(m, n))) time, O(1) space.

**Edge cases to test:**
- `[1, 3]` and `[2]` (answer 2.0)
- `[1, 2]` and `[3, 4]` (answer 2.5)
- `[]` and `[1]` (one list empty, answer 1.0)
- `[1, 1]` and `[1, 1]` (all equal, answer 1.0)
- `[1, 2, 3]` and `[100, 200]` (all of A is smaller than B, answer 3.0)

## More quiz

1. In Search a 2D Matrix with n columns, which cell does flat index `i` map to?
   - A. `(i % n, i // n)`
   - B. `(i // n, i % n)`
   - C. `(i // m, i % m)`
   - D. `(i, i)`

2. In Find Minimum in Rotated Sorted Array, why compare `nums[mid]` with `nums[hi]` and not `nums[lo]`?
   - A. It is faster
   - B. It handles the non-rotated case cleanly: when `nums[mid] <= nums[hi]`, the minimum is at mid or left of it
   - C. `nums[lo]` can be out of range
   - D. There is no reason

3. Which pattern fits "find the smallest ship capacity to deliver all packages within D days"?
   - A. Sliding window
   - B. Binary search on the answer (capacity) with a "can ship in D days" check
   - C. Heap
   - D. Monotonic stack

4. In Koko Eating Bananas, piles `[4, 9]` and speed 3. How many hours does she need?
   - A. 4
   - B. 5
   - C. 13
   - D. 3

5. In Median of Two Sorted Arrays, why do you binary search on the smaller array?
   - A. The smaller array is always sorted
   - B. It keeps `j` in a valid range and gives O(log(min(m, n))) time
   - C. The larger array may be empty
   - D. It avoids using infinity

## Answer key

1. **B** - Each row holds n cells, so the row is `i // n` and the column is `i % n`.
2. **B** - Comparing with the right end tells you directly which side holds the drop. If the middle is bigger than the right end, the drop is on the right; otherwise it is at mid or to the left, including the non-rotated case.
3. **B** - This is "Capacity To Ship Packages Within D Days". If a capacity works, any bigger capacity also works, so the check is monotonic. Search capacities from `max(weights)` to `sum(weights)`.
4. **B** - `ceil(4 / 3) = 2` and `ceil(9 / 3) = 3`, so 2 + 3 = 5 hours.
5. **B** - With i chosen from the smaller array, `j = half - i` never becomes negative or larger than the other array. It also makes the search range as small as possible.

## Flashcards

- **Q:** Why write `mid = lo + (hi - lo) // 2` in languages like Java? — **A:** To avoid integer overflow when `lo + hi` is bigger than the max int; in Python it is not needed.
- **Q:** Search a 2D Matrix: total search range? — **A:** Indexes 0 to `m * n - 1`, treating the matrix as one sorted list.
- **Q:** Koko Eating Bananas: search range for the speed? — **A:** From 1 to `max(piles)`.
- **Q:** Integer formula for ceil(p / k)? — **A:** `(p + k - 1) // k`.
- **Q:** Rotated array minimum: what does `nums[mid] > nums[hi]` tell you? — **A:** The minimum is strictly to the right of mid, so set `lo = mid + 1`.
- **Q:** Search in Rotated Sorted Array: how do you know the left half is sorted? — **A:** `nums[lo] <= nums[mid]`.
- **Q:** Time Based Key Value Store: why no sorting step? — **A:** The problem guarantees that `set` timestamps are strictly increasing, so each list is already sorted.
- **Q:** Time Based Key Value Store: what does `get` binary search for? — **A:** The last entry with timestamp less than or equal to the query.
- **Q:** Median of Two Sorted Arrays: when is a partition correct? — **A:** When `Aleft <= Bright` and `Bleft <= Aright`.
- **Q:** Median of Two Sorted Arrays: median when the total length is odd? — **A:** `max(Aleft, Bleft)`, the largest value of the left half.

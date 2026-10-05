## Problem hints

### Happy Number (Easy)
**Restate:** Replace a number by the sum of the squares of its digits again and again. Say whether it eventually reaches 1 (a "happy" number) instead of looping forever.
**Hint 1:** This is cycle detection. Use a hash set, or Floyd's slow and fast pointers.
**Hint 2:** The sequence either reaches 1 or enters a loop that never contains 1. Numbers quickly become small (for example, any 3-digit number goes to at most 243), so a loop is guaranteed if 1 is never reached.
**Hint 3:**
- Write a helper that returns the sum of squared digits (use `% 10` and `// 10`).
- Keep a set of seen numbers.
- Loop: if n is 1, return True; if n is in the set, return False.
- Add n to the set and replace n with the helper result.
- (Floyd version: move slow one step and fast two steps until they meet; happy if they meet at 1.)
**Complexity:** O(log n) time per step and a small number of steps; O(log n) space for the set (O(1) with Floyd).
**Edge cases to test:** `1` gives True; `19` gives True (1 + 81 = 82, 68, 100, 1); `2` gives False; `7` gives True; a large number like `2147483647`.

### Plus One (Easy)
**Restate:** A big number is stored as a list of digits (most significant first). Add 1 to it and return the new digit list.
**Hint 1:** Simulate school addition from the right end.
**Hint 2:** A 9 becomes 0 and passes a carry left. Any other digit just increases by 1 and you can stop immediately. Only an all-9s number grows by one digit.
**Hint 3:**
- Loop i from the last index down to 0.
- If `digits[i] < 9`: add 1 and return the list.
- Else set `digits[i] = 0` and continue.
- If the loop ends, return `[1] + digits`.
**Complexity:** O(n) time, O(1) extra space (O(n) only when a new digit is added).
**Edge cases to test:** `[1, 2, 3]` gives `[1, 2, 4]`; `[9]` gives `[1, 0]`; `[9, 9, 9]` gives `[1, 0, 0, 0]`; `[0]` gives `[1]`; `[1, 9, 9]` gives `[2, 0, 0]`.

### Rotate Image (Medium)
**Restate:** Rotate an n x n matrix 90 degrees clockwise, in place (no second matrix).
**Hint 1:** The lesson shows "transpose, then reverse each row". Another way is to rotate ring by ring.
**Hint 2:** In the ring version, each group of 4 cells moves in a circle: top-left goes to top-right, top-right to bottom-right, bottom-right to bottom-left, bottom-left to top-left. Save one value in a temp variable and shift the other three.
**Hint 3:** (ring version)
- Use `left = 0`, `right = n - 1`; loop while `left < right` (one ring per loop).
- For each offset i from 0 to `right - left - 1`, do a 4-way swap of the cells at that offset on the four sides.
- Then move inward: `left += 1`, `right -= 1`.
**Complexity:** O(n^2) time, O(1) extra space.
**Edge cases to test:** 1x1 `[[5]]` stays the same; 2x2 `[[1,2],[3,4]]` gives `[[3,1],[4,2]]`; 3x3 `[[1,2,3],[4,5,6],[7,8,9]]` gives `[[7,4,1],[8,5,2],[9,6,3]]`; 4x4 (two rings); a matrix with negative numbers or repeated values.

### Spiral Matrix (Medium)
**Restate:** Return all elements of an m x n matrix in spiral order: right along the top, down the right side, left along the bottom, up the left side, and repeat inward.
**Hint 1:** Simulation with four boundaries: top, bottom, left, right.
**Hint 2:** After walking each side, move that boundary inward. The tricky part is non-square matrices: check the boundaries again before walking the bottom row and the left column, or you will repeat elements.
**Hint 3:**
- `top, bottom, left, right = 0, m - 1, 0, n - 1`.
- While `top <= bottom` and `left <= right`: walk the top row left to right, then `top += 1`.
- Walk the right column top to bottom, then `right -= 1`.
- If `top <= bottom`: walk the bottom row right to left, then `bottom -= 1`.
- If `left <= right`: walk the left column bottom to top, then `left += 1`.
**Complexity:** O(m * n) time, O(1) extra space (besides the output).
**Edge cases to test:** 1x1 `[[1]]`; single row `[[1, 2, 3]]`; single column `[[1], [2], [3]]`; 3x4 `[[1,2,3,4],[5,6,7,8],[9,10,11,12]]` gives `[1,2,3,4,8,12,11,10,9,5,6,7]`; check the output length equals m * n (no repeats, no missing).

### Set Matrix Zeroes (Medium)
**Restate:** If a cell is 0, set its whole row and column to 0, in place.
**Hint 1:** The lesson uses row and column marker sets (O(m + n) space). The follow-up asks for O(1) extra space.
**Hint 2:** Use the first row and the first column of the matrix itself as the marker arrays. Because they get overwritten, first remember (in two booleans) whether the first row and first column had a zero originally.
**Hint 3:** (O(1) space version)
- Record `firstRowZero` and `firstColZero`.
- For every other cell (r >= 1, c >= 1) that is 0: set `matrix[r][0] = 0` and `matrix[0][c] = 0`.
- For every other cell: if `matrix[r][0] == 0` or `matrix[0][c] == 0`, set it to 0.
- Finally, zero the first row if `firstRowZero`, and the first column if `firstColZero`.
**Complexity:** O(m * n) time, O(1) extra space.
**Edge cases to test:** no zeros (no change); a zero in the top-left corner `[[0,1],[1,1]]`; a zero only in the first row; a single row `[[1, 0, 3]]`; all zeros.

### Pow(x, n) (Medium)
**Restate:** Compute x raised to the power n, where n can be negative, without using the built-in power function.
**Hint 1:** Fast power (exponentiation by squaring). See the lesson for the core idea.
**Hint 2:** For a negative n, compute `1 / x^(-n)`. Use the iterative bit version to avoid deep recursion: look at the bits of n; whenever a bit is 1, multiply the result by the current power of x, and square x each step.
**Hint 3:**
- If n < 0: `x = 1 / x`, `n = -n`.
- `result = 1`.
- While n > 0: if `n & 1`, `result *= x`; then `x *= x`, `n >>= 1`.
- Return `result`.
**Complexity:** O(log n) time, O(1) space.
**Edge cases to test:** `n = 0` gives 1 (even for x = 0 in this problem); `2.0, -2` gives 0.25; `2.0, 10` gives 1024.0; `x = 1.0, n = -2147483648` (in Java/C++ the negation overflows; Python is fine); `x = -2.0, n = 3` gives -8.0 (sign).

### Multiply Strings (Medium)
**Restate:** Multiply two non-negative integers given as strings and return the product as a string, without converting the whole strings to numbers.
**Hint 1:** Simulate school (long) multiplication with an array of digits.
**Hint 2:** The product of `num1[i]` and `num2[j]` lands at positions `i + j` and `i + j + 1` of a result array of length `m + n`. Add into position `i + j + 1`, then push the carry into `i + j`.
**Hint 3:**
- Make `res = [0] * (m + n)`.
- Loop i from the right of num1, j from the right of num2.
- `total = d1 * d2 + res[i + j + 1]`; set `res[i + j + 1] = total % 10`; add `total // 10` to `res[i + j]`.
- Skip leading zeros, join to a string.
- If everything is zero, return "0".
**Complexity:** O(m * n) time, O(m + n) space.
**Edge cases to test:** `"0" x "12345"` gives `"0"` (not `"00000"`); `"2" x "3"` gives `"6"`; `"123" x "456"` gives `"56088"`; `"99" x "99"` gives `"9801"`; very long inputs (100+ digits).

### Detect Squares (Medium)
**Restate:** Design a class that stores points (duplicates allowed) and, for a query point, counts how many axis-aligned squares with positive area can be formed using the query point plus three stored points.
**Hint 1:** Hash map from point to count.
**Hint 2:** Pick each stored point as the DIAGONAL corner of the square. It must satisfy `|px - x| == |py - y|` and not be 0. Then the other two corners are fixed: `(x, py)` and `(px, y)`. Multiply their counts.
**Hint 3:**
- `add(point)`: increase `count[(x, y)]` (also keep a list of distinct points).
- `count(query)`: loop over every stored distinct point (px, py).
- Skip it if `abs(px - x) != abs(py - y)` or `px == x`.
- Add `count[(px, py)] * count[(x, py)] * count[(px, y)]` to the answer.
**Complexity:** `add` is O(1); `count` is O(number of distinct points) time; O(n) space.
**Edge cases to test:** a query with no stored points gives 0; the same point added twice doubles the result; a query point equal to a stored point (area 0, must not count); points forming a rectangle that is not a square (gives 0); squares in all four directions from the query point.

## More quiz

1. In Multiply Strings, where does the product of `num1[i]` and `num2[j]` go first?
   - A. Position `i * j`
   - B. Position `i + j + 1` of the result array
   - C. Position 0
   - D. Position `m + n`
2. Which pattern fits Happy Number?
   - A. Binary search
   - B. Cycle detection (hash set or slow and fast pointers)
   - C. Sorting
   - D. Dynamic programming
3. In Spiral Matrix on a single-row matrix `[[1, 2, 3]]`, which check stops you from printing 2 and 1 again?
   - A. `left <= right` before the left column
   - B. `top <= bottom` before walking the bottom row
   - C. `m == n`
   - D. No check is needed
4. In the O(1) space Set Matrix Zeroes, why do you save two booleans first?
   - A. To count the zeros
   - B. The first row and column are used as markers and get overwritten
   - C. To sort the matrix
   - D. They are not needed
5. In Detect Squares, which stored point do you loop over?
   - A. The point directly above the query
   - B. The diagonal corner of the square
   - C. The centre of the square
   - D. Every pair of points

## Answer key

1. **B** - Positions are counted from the left, so digit i and digit j together affect `i + j + 1`, and the carry goes to `i + j`.
2. **B** - The sequence either reaches 1 or repeats a number, so detecting a repeat answers the question.
3. **B** - After the top row is walked, `top` becomes 1, which is greater than `bottom` (0). The check stops the bottom row from being printed again.
4. **B** - Once you write markers into the first row and column, you can no longer tell whether they had an original zero.
5. **B** - The diagonal corner fixes the side length and the other two corners, so one loop is enough.

## Flashcards

- **Q:** How do you get the digits of a number without strings? — **A:** Use `n % 10` for the last digit and `n // 10` to remove it.
- **Q:** What is the next number after 19 in Happy Number? — **A:** 1^2 + 9^2 = 82.
- **Q:** When does Plus One make the list longer? — **A:** Only when every digit is 9.
- **Q:** What is the ring-by-ring way to rotate a matrix? — **A:** Do a 4-way swap of matching cells on the four sides, then move one ring inward.
- **Q:** What are the four boundaries in Spiral Matrix? — **A:** top, bottom, left, right; move each inward after walking that side.
- **Q:** How does Set Matrix Zeroes reach O(1) space? — **A:** It uses the first row and first column as marker arrays.
- **Q:** How does Pow(x, n) handle a negative n? — **A:** Use 1 / x as the base and -n as the power.
- **Q:** What is the length of the result array in Multiply Strings? — **A:** len(num1) + len(num2).
- **Q:** What must Multiply Strings return for "0" times anything? — **A:** "0", with no extra leading zeros.
- **Q:** Why is a query point equal to a stored point not a square in Detect Squares? — **A:** The side length would be 0, and the problem needs positive area.

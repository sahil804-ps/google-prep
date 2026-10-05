## Problem hints

### Subsets (Medium)
**Restate:** Given a list of unique numbers, return every possible subset (the power set), including the empty one.
**Hint 1:** Use backtracking. Think of each number as a light switch: ON (take it) or OFF (skip it).
**Hint 2:** Every node in the recursion tree is already a valid answer, not only the leaves. So you save the current path at the start of every call.
**Hint 3:**
- Keep a `path` list and a `start` index.
- On entering a call, save a copy of `path`.
- Loop `i` from `start` to the end: add `nums[i]`, recurse with `i + 1`, then remove it.
- Moving forward only (`i + 1`) stops you from making `[2, 1]` after `[1, 2]`.
**Complexity:** O(n * 2^n) time (2^n subsets, each copied in O(n)), O(n) extra space for recursion.
**Edge cases to test:** `[]` gives `[[]]`; `[0]` gives `[[], [0]]`; `[1, 2, 3]` gives 8 subsets; negative numbers `[-1, 5]`; check the output has no duplicate subsets.

### Combination Sum (Medium)
**Restate:** Given unique positive numbers and a target, return all combinations that add up to the target, where each number can be used many times.
**Hint 1:** Backtracking with a running total.
**Hint 2:** To allow reuse but avoid duplicate orderings, the next call starts at the same index `i`, not `i + 1`.
**Hint 3:**
- Recurse with `(start, total)`.
- If `total == target`, save a copy of the path.
- If `total > target`, stop (prune).
- Loop `i` from `start`: add `candidates[i]`, recurse with `(i, total + candidates[i])`, then pop.
- Optional: sort first, and `break` the loop as soon as a number is too big.
**Complexity:** Exponential, roughly O(2^(target / min)) time; O(target / min) recursion depth.
**Edge cases to test:** `[2], 1` gives `[]`; `[1], 3` gives `[[1,1,1]]`; `[2,3,6,7], 7` gives `[[2,2,3],[7]]`; target equal to one candidate; a large candidate bigger than the target.

### Permutations (Medium)
**Restate:** Given a list of unique numbers, return every possible ordering of them.
**Hint 1:** Backtracking with a `used` array (or set).
**Hint 2:** Unlike subsets, order matters, so every level loops over ALL numbers and skips only the ones already used in this path.
**Hint 3:**
- If `len(path) == len(nums)`, save a copy and return.
- Loop over every index `i`.
- Skip `i` if `used[i]` is true.
- Mark used, append, recurse, then unmark and pop.
**Complexity:** O(n * n!) time, O(n) extra space.
**Edge cases to test:** `[1]` gives `[[1]]`; `[0, 1]` gives 2 orders; `[1, 2, 3]` gives 6; negative numbers `[-1, 0, 1]`; check every output has length n.

### Subsets II (Medium)
**Restate:** Same as Subsets, but the input can have repeated numbers, and the output must not contain duplicate subsets.
**Hint 1:** Sort the list first, then use the normal subsets backtracking.
**Hint 2:** At one level of the tree, take only the first copy of each value. Skip `nums[i]` when `i > start` and `nums[i] == nums[i - 1]`.
**Hint 3:**
- Sort `nums`.
- Save a copy of `path` on entering each call.
- Loop `i` from `start`; skip duplicates using the rule above.
- Append, recurse with `i + 1`, pop.
**Complexity:** O(n * 2^n) time, O(n) extra space.
**Edge cases to test:** `[0]`; `[2, 2]` gives `[[], [2], [2,2]]`; `[1, 2, 2]` gives 6 subsets; all equal `[5,5,5]` gives 4 subsets; unsorted input `[4, 4, 1, 4]`.

### Combination Sum II (Medium)
**Restate:** Given numbers that may repeat and a target, return all unique combinations that sum to the target, where each number (each position) is used at most once.
**Hint 1:** It mixes Combination Sum (target + prune) with Subsets II (sort + skip duplicates).
**Hint 2:** Each element is used once, so recurse with `i + 1`. Skip `candidates[i] == candidates[i - 1]` when `i > start` to avoid duplicate combinations.
**Hint 3:**
- Sort the list.
- If `total == target`, save; if `total > target`, return.
- Loop `i` from `start`, skip duplicates at this level.
- If `candidates[i]` makes the total too big, `break` (the list is sorted).
- Append, recurse with `(i + 1, total + candidates[i])`, pop.
**Complexity:** O(2^n) time in the worst case, O(n) extra space.
**Edge cases to test:** `[10,1,2,7,6,1,5], 8` gives `[[1,1,6],[1,2,5],[1,7],[2,6]]`; `[1,1,1], 2` gives `[[1,1]]` only once; `[2], 1` gives `[]`; target equal to the sum of all numbers.

### Word Search (Medium)
**Restate:** Given a grid of letters and a word, say whether the word can be formed by walking through neighbouring cells (up, down, left, right) without using a cell twice.
**Hint 1:** DFS from every cell, with backtracking on a "visited" mark.
**Hint 2:** Mark a cell as used while it is on the current path, and unmark it when you come back. A cell can be used again in a different path.
**Hint 3:**
- For each cell, start `dfs(r, c, i = 0)`.
- Fail if out of bounds, already used, or letter does not match `word[i]`.
- Succeed if `i == len(word) - 1` after a match (or `i == len(word)` at entry).
- Mark the cell, try 4 neighbours with `i + 1`, then unmark.
- Pruning idea: if the grid does not have enough of some letter, return False early.
**Complexity:** O(R * C * 4^L) time where L is the word length (really 3^L after the first step); O(L) recursion space.
**Edge cases to test:** 1x1 grid `[["a"]]`, word `"a"`; word longer than R*C; word that needs to reuse a cell, like `"ABA"` in `[["A","B"]]` (should be False); word going around a corner; same letter many times `[["a","a"],["a","a"]]` with `"aaaaa"` (False).

### Palindrome Partitioning (Medium)
**Restate:** Split a string into pieces so that every piece is a palindrome, and return all such splits.
**Hint 1:** Backtracking where each choice is "where does the next piece end?".
**Hint 2:** From position `start`, try every end `j`. Only recurse if `s[start..j]` is a palindrome.
**Hint 3:**
- If `start == len(s)`, save a copy of the path.
- Loop `j` from `start` to `len(s) - 1`.
- If `s[start:j+1]` is a palindrome, append it and recurse with `j + 1`, then pop.
- Optional speed-up: precompute a 2-D table `isPal[i][j]`.
**Complexity:** O(n * 2^n) time, O(n) recursion space (plus O(n^2) if you precompute the table).
**Edge cases to test:** `"a"` gives `[["a"]]`; `"aab"` gives `[["a","a","b"],["aa","b"]]`; `"aaa"` gives 4 splits; `"abc"` gives only single letters; empty string (if allowed) gives `[[]]`.

### Letter Combinations of a Phone Number (Medium)
**Restate:** Given a string of digits 2-9, return all letter strings they could spell on an old phone keypad.
**Hint 1:** Backtracking with a digit-to-letters map (2 = "abc", ..., 7 = "pqrs", 9 = "wxyz").
**Hint 2:** The depth of the tree equals the number of digits. At depth `i`, you try every letter of `digits[i]`.
**Hint 3:**
- If `digits` is empty, return `[]` (not `[""]`).
- Recurse with index `i` and the current string.
- If `i == len(digits)`, save the string.
- For each letter of `map[digits[i]]`, recurse with `i + 1`.
**Complexity:** O(4^n * n) time, O(n) recursion space.
**Edge cases to test:** `""` gives `[]`; `"2"` gives `["a","b","c"]`; `"23"` gives 9 strings; `"79"` gives 16 strings (both keys have 4 letters); repeated digit `"22"`.

### N Queens (Hard)
**Restate:** Place n queens on an n x n chessboard so that no two attack each other, and return all such boards.
**Hint 1:** Backtracking, one row at a time. Each row gets exactly one queen.
**Hint 2:** Keep three sets: used columns, used "r - c" diagonals, and used "r + c" anti-diagonals. A cell is safe only if it is in none of them. This makes the check O(1).
**Hint 3:**
- Recurse on `row`.
- If `row == n`, convert the board to strings and save.
- For each `col`, skip if `col`, `row - col` or `row + col` is already used.
- Place the queen, add to all three sets, recurse with `row + 1`.
- Remove the queen and remove from the three sets.
**Complexity:** About O(n!) time, O(n) extra space (plus the board).
**Edge cases to test:** `n = 1` gives 1 board; `n = 2` and `n = 3` give 0 boards; `n = 4` gives 2 boards; `n = 8` gives 92 boards.

## More quiz

1. In Subsets, where do you save the current path?
   - A. Only when `path` has length n
   - B. At the start of every recursive call
   - C. Only when the loop ends
   - D. Only at the root
2. Which pattern fits "split a string so every piece is in a dictionary, return all splits"?
   - A. Sliding window
   - B. Backtracking that tries every end position for the next piece
   - C. Binary search
   - D. Heap
3. In N Queens, which value is the same for every cell on one "\" diagonal (top-left to bottom-right)?
   - A. `row + col`
   - B. `row * col`
   - C. `row - col`
   - D. `col`
4. What should Letter Combinations return for the input `""`?
   - A. `[""]`
   - B. `[]`
   - C. `None`
   - D. An error
5. In Combination Sum II, which detail makes each element usable only once?
   - A. Sorting the list
   - B. Recursing with `i + 1`
   - C. Using a set for the result
   - D. Pruning when the total is too big

## Answer key

1. **B** - Every node in the subsets tree is a valid subset, so you save a copy each time you enter a call.
2. **B** - You need all splits, so you try each possible next piece and backtrack. This is the same shape as Palindrome Partitioning.
3. **C** - Moving down-right adds 1 to both row and col, so `row - col` stays the same. `row + col` is constant on the other diagonal.
4. **B** - There are no digits, so there are no combinations. Returning `[""]` is a common bug.
5. **B** - Passing `i + 1` moves past the current position. Sorting and skipping only remove duplicate combinations.

## Flashcards

- **Q:** What three parts does every backtracking step have? — **A:** Choose (add to path), explore (recurse), un-choose (undo the change).
- **Q:** Subsets vs permutations: what changes in the loop? — **A:** Subsets loop from `start` forward; permutations loop over all indexes and skip used ones.
- **Q:** Reuse allowed vs not allowed: which index goes to the next call? — **A:** Reuse allowed: `i`. Not allowed: `i + 1`.
- **Q:** What is the rule to skip duplicates after sorting? — **A:** Skip `nums[i]` when `i > start` and `nums[i] == nums[i - 1]`.
- **Q:** How does N Queens check a cell in O(1)? — **A:** Three sets: columns, `row - col` diagonals, `row + col` anti-diagonals.
- **Q:** Why must Word Search unmark a cell after exploring? — **A:** The cell may be needed by a different path that starts elsewhere or turns differently.
- **Q:** How many permutations does `[1, 2, 3, 4]` have? — **A:** 4! = 24.
- **Q:** How many subsets does a list of 5 unique numbers have? — **A:** 2^5 = 32, including the empty subset.
- **Q:** How many valid boards are there for 4 Queens? — **A:** 2.
- **Q:** What is a good tester-style input for Combination Sum II? — **A:** Repeated values like `[1, 1, 1]` with target 2, to check the answer `[1, 1]` appears only once.

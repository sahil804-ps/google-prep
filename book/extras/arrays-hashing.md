## Problem hints

Try each problem on your own first. Open one hint at a time. Only go to the next hint when you are stuck for 10 or more minutes.

### Contains Duplicate (Easy)

**Restate:** Given a list of numbers, return True if any number appears two or more times.

**Hint 1:** You need to answer "have I seen this number before?" very fast. Which Python structure answers that in O(1)?

**Hint 2:** A set remembers every number you have already passed. The first time a number is already in the set, you have found a duplicate and can stop early.

**Hint 3:**
- Create an empty set.
- Walk through the numbers one by one.
- If the number is already in the set, return True.
- Otherwise add it to the set.
- After the loop, return False.

**Complexity:** O(n) time, O(n) space. (Sorting first gives O(n log n) time and O(1) extra space, a valid trade-off to mention.)

**Edge cases to test:**
- `[1]` (one item, answer False)
- `[1, 1]` (smallest duplicate, answer True)
- `[1, 2, 3, 4]` (all unique, answer False)
- `[-1, 0, -1]` (negative numbers)
- A very large list where the duplicate is the last element

### Valid Anagram (Easy)

**Restate:** Given two strings `s` and `t`, return True if `t` uses exactly the same letters as `s`, the same number of times, in any order.

**Hint 1:** This is a counting problem. Think "frequency count" with a dict or a fixed array of 26.

**Hint 2:** Two strings are anagrams exactly when every letter has the same count in both. If the lengths differ, you can return False at once.

**Hint 3:**
- If `len(s) != len(t)`, return False.
- Count each letter of `s` (add 1).
- For each letter of `t`, subtract 1 from its count.
- If any count goes below zero, return False.
- Otherwise return True.

**Complexity:** O(n) time, O(1) space for 26 lowercase letters (O(k) for k distinct characters in general).

**Edge cases to test:**
- `s = "a", t = "a"` (single letter, True)
- `s = "ab", t = "a"` (different lengths, False)
- `s = "aacc", t = "ccac"` (same letters, wrong counts, False)
- `s = "rat", t = "car"` (same length, different letters, False)
- Unicode input such as `"é"` (follow-up question: a dict works, a 26-array does not)

### Two Sum (Easy)

**Restate:** Given a list of numbers and a target, return the two indexes whose values add up to the target (exactly one answer exists, and you cannot use the same element twice).

**Hint 1:** For each number `x`, the partner you need is `target - x`. Use a hash map to find the partner fast.

**Hint 2:** Store `value -> index` for numbers you have already seen. Check for the partner **before** you store the current number, so you never pair a number with itself.

**Hint 3:**
- Create an empty dict `seen`.
- For each index `i` and value `x`:
- Compute `need = target - x`.
- If `need` is in `seen`, return `[seen[need], i]`.
- Otherwise save `seen[x] = i`.

**Complexity:** O(n) time, O(n) space.

**Edge cases to test:**
- `nums = [3, 3], target = 6` (two equal values)
- `nums = [3, 2, 4], target = 6` (must not return `[0, 0]`)
- `nums = [-3, 4, 3, 90], target = 0` (negative numbers)
- `nums = [0, 4, 3, 0], target = 0` (zeros)
- Answer pair at the very end of a long list

### Group Anagrams (Medium)

**Restate:** Given a list of words, put the words that are anagrams of each other into the same group.

**Hint 1:** Use a hash map where the key is a "signature" that is the same for all anagrams.

**Hint 2:** Two good signatures: the sorted word (`"eat"` becomes `"aet"`), or a tuple of 26 letter counts. The count tuple avoids the sort, so it is faster for long words.

**Hint 3:**
- Create a dict that maps signature -> list of words.
- For each word, build its signature.
- Append the word to the list for that signature.
- Return all the lists (the dict values).

**Complexity:** O(n * k log k) with sorted keys, or O(n * k) with count keys, where n = number of words and k = max word length. O(n * k) space.

**Edge cases to test:**
- `[""]` (one empty string, answer `[[""]]`)
- `["a"]` (one word)
- `["ab", "ba", "abc"]` (similar but different lengths)
- `["aab", "abb"]` (same letters, different counts, must be separate groups)
- All words identical, such as `["x", "x", "x"]`

### Top K Frequent Elements (Medium)

**Restate:** Given a list of numbers and `k`, return the `k` numbers that appear most often.

**Hint 1:** First count frequencies with a hash map. Then you need the top k by count.

**Hint 2:** A frequency can never be more than n. So make "buckets": a list of n + 1 lists, where `bucket[f]` holds every number that appears exactly f times. Reading buckets from high to low gives the answer in O(n). (A heap of size k, O(n log k), is also fine.)

**Hint 3:**
- Count each number with a dict.
- Create `buckets = [[] for _ in range(n + 1)]`.
- For each number and count, append the number to `buckets[count]`.
- Walk the buckets from index n down to 1, collecting numbers.
- Stop as soon as you have k numbers.

**Complexity:** O(n) time and O(n) space with bucket sort.

**Edge cases to test:**
- `nums = [1], k = 1`
- `nums = [1, 1, 1, 2, 2, 3], k = 2` (answer `[1, 2]`)
- `nums = [4, 4, -1, -1, -1], k = 1` (negative numbers)
- `k` equal to the number of distinct values (return all of them)
- All numbers with the same frequency (any k of them is valid; ask the interviewer)

### Product of Array Except Self (Medium)

**Restate:** Given a list of numbers, return a new list where each position holds the product of all the other numbers, without using division.

**Hint 1:** Think "prefix and suffix". Every answer is (product of everything to the left) times (product of everything to the right).

**Hint 2:** You can fill the answer array with left products in one pass from the start, then multiply in the right products in a second pass from the end, using a single running variable. That gives O(1) extra space (the output array does not count).

**Hint 3:**
- Create `res` of length n filled with 1.
- Pass 1, left to right: keep `left = 1`; set `res[i] = left`, then `left *= nums[i]`.
- Pass 2, right to left: keep `right = 1`; set `res[i] *= right`, then `right *= nums[i]`.
- Return `res`.

**Complexity:** O(n) time, O(1) extra space (besides the output).

**Edge cases to test:**
- `[1, 2]` (smallest valid input, answer `[2, 1]`)
- `[1, 2, 3, 4]` (answer `[24, 12, 8, 6]`)
- `[0, 4, 5]` (one zero: only the zero position is non-zero)
- `[0, 4, 0]` (two zeros: every answer is 0)
- `[-1, 1, 0, -3, 3]` (negatives with a zero)

### Valid Sudoku (Medium)

**Restate:** Given a partly filled 9x9 Sudoku board, check that no row, no column and no 3x3 box contains the same digit twice (empty cells are `"."`; you do not need to solve it).

**Hint 1:** Use hash sets to remember which digits you have already seen in each row, each column and each box.

**Hint 2:** The box number for cell `(r, c)` is `(r // 3, c // 3)`. With that key, one pass over the 81 cells checks all three rules at the same time.

**Hint 3:**
- Create 9 sets for rows, 9 for columns, and 9 for boxes (a dict keyed by `(r // 3, c // 3)` works well).
- Loop over every cell; skip `"."`.
- If the digit is already in its row set, column set or box set, return False.
- Otherwise add the digit to all three sets.
- After the loop, return True.

**Complexity:** O(81) = O(1) time and space for a fixed 9x9 board (O(n^2) for an n x n board).

**Edge cases to test:**
- A completely empty board (all `"."`, answer True)
- Duplicate in a row only
- Duplicate in a column only
- Duplicate inside one 3x3 box but in different rows and columns
- A valid-looking board that is not solvable (still True; the task only checks the rules)

### Encode and Decode Strings (Medium)

**Restate:** Design two functions: one turns a list of strings into a single string, and the other turns that single string back into the exact same list.

**Hint 1:** Any separator character could also appear inside a word. You need a format that tells the decoder where each word ends without guessing.

**Hint 2:** Put the length in front of every word with a marker: `"4#neet4#code"`. The decoder reads digits until `#`, then takes exactly that many characters. Because it jumps by length, a `#` inside a word is harmless.

**Hint 3:**
- Encode: for each word, append `str(len(word)) + "#" + word`.
- Decode: set `i = 0`.
- Move `j` forward from `i` until `s[j] == "#"`; the length is `int(s[i:j])`.
- The word is `s[j + 1 : j + 1 + length]`; add it to the result.
- Set `i = j + 1 + length` and repeat until the end.

**Complexity:** O(total characters) time and space for both functions.

**Edge cases to test:**
- `[]` (empty list)
- `[""]` (one empty string; must not decode to `[]`)
- `["", ""]` (two empty strings)
- `["a#b", "4#x"]` (words containing `#` and digits)
- A word with 10 or more characters (length has two digits)

### Longest Consecutive Sequence (Medium)

**Restate:** Given an unsorted list of numbers, return the length of the longest run of consecutive integers (like 1, 2, 3, 4), in O(n) time.

**Hint 1:** Sorting gives O(n log n). To reach O(n), put all numbers in a set so you can ask "is x + 1 here?" in O(1).

**Hint 2:** Only start counting from a number that begins a run, which means `x - 1` is NOT in the set. Then each number is visited at most twice in total, so the whole thing stays O(n).

**Hint 3:**
- Put all numbers into a set.
- For each number `x` in the set:
- If `x - 1` is in the set, skip it (it is not a start).
- Otherwise count up: while `x + length` is in the set, increase `length`.
- Keep the best length seen.

**Complexity:** O(n) time, O(n) space.

**Edge cases to test:**
- `[]` (answer 0)
- `[7]` (answer 1)
- `[1, 2, 0, 1]` (duplicates, answer 3)
- `[100, 4, 200, 1, 3, 2]` (answer 4)
- `[-2, -1, 0, 1]` (run crosses zero, answer 4)

## More quiz

1. In Longest Consecutive Sequence, why do you only start counting when `x - 1` is not in the set?
   - A. To handle negative numbers
   - B. So that each run is counted only once, which keeps the total time O(n)
   - C. Because sets are unordered
   - D. To save memory

2. In Encode and Decode Strings, why is `",".join(words)` a bad encoding?
   - A. It is too slow
   - B. It uses too much memory
   - C. A word may itself contain a comma, so the decoder cannot tell where words end
   - D. Python strings cannot hold commas

3. Which pattern fits "Product of Array Except Self" without division?
   - A. Hash map lookup
   - B. Prefix products and suffix products
   - C. Sliding window
   - D. Binary search

4. In Top K Frequent Elements with bucket sort, how many buckets do you need for a list of n numbers?
   - A. k
   - B. 26
   - C. n + 1 (frequencies go from 0 to n)
   - D. log n

5. In Valid Sudoku, which key gives the 3x3 box for cell (r, c)?
   - A. `(r % 3, c % 3)`
   - B. `r * 9 + c`
   - C. `(r // 3, c // 3)`
   - D. `r + c`

## Answer key

1. **B** - Only the smallest number of a run starts the inner count, so every number is touched a constant number of times. Without this check the same run is recounted from every member, which can become O(n^2).
2. **C** - A separator character can appear inside the data. A length prefix like `"3#abc"` tells the decoder exactly how many characters to read, so any character is safe.
3. **B** - Each answer is the product of everything to the left times everything to the right. Two passes with running products give O(n) time and O(1) extra space.
4. **C** - A number can appear between 1 and n times, so you index buckets by frequency from 0 to n. That is n + 1 buckets.
5. **C** - Integer division by 3 maps rows 0-2 to 0, rows 3-5 to 1, rows 6-8 to 2, and the same for columns. The pair names one of the 9 boxes.

## Flashcards

- **Q:** What is the brute force for Contains Duplicate, and why is it slow? — **A:** Compare every pair with two loops; it is O(n^2) because each number is compared with every other number.
- **Q:** In Two Sum, why check for the partner before storing the current number? — **A:** So a number is never paired with itself, for example `[3, 2, 4]` with target 6 must not return `[0, 0]`.
- **Q:** Two signature choices for Group Anagrams? — **A:** The sorted word (O(k log k) per word) or a tuple of 26 letter counts (O(k) per word).
- **Q:** Why must the count signature be a tuple and not a list? — **A:** Dict keys must be hashable, and a list is mutable, so it is not hashable.
- **Q:** Time of bucket-sort Top K Frequent? — **A:** O(n), because frequencies are bounded by n and you read each bucket once.
- **Q:** Product of Array Except Self: answer at index i in one formula? — **A:** (product of nums[0..i-1]) times (product of nums[i+1..n-1]).
- **Q:** What does the length-prefix format look like for `["hi", ""]`? — **A:** `"2#hi0#"`.
- **Q:** How many sets does a one-pass Valid Sudoku need? — **A:** 27: nine for rows, nine for columns and nine for 3x3 boxes.
- **Q:** What test input breaks a Valid Anagram solution that only compares sets of letters? — **A:** `"aacc"` and `"ccac"`: same letters, different counts.
- **Q:** Longest Consecutive Sequence: how do you know x starts a run? — **A:** When x - 1 is not in the set.

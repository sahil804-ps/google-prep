## Problem hints

Try each problem on your own first. Open one hint at a time. Only go to the next hint when you are stuck for 10 or more minutes.

### Valid Parentheses (Easy)

**Restate:** Given a string of only `()[]{}`, return True if every bracket is closed by the same type of bracket in the correct order.

**Hint 1:** Use a stack. The most recent unclosed opening bracket must be the first one to close.

**Hint 2:** Keep a small dict that maps each closing bracket to its opening partner: `{")": "(", "]": "[", "}": "{"}`. On a closing bracket, the top of the stack must be its partner.

**Hint 3:**
- Create an empty stack.
- For an opening bracket, push it.
- For a closing bracket: if the stack is empty or the top is not its partner, return False; else pop.
- After the loop, return True only if the stack is empty.

**Complexity:** O(n) time, O(n) space.

**Edge cases to test:**
- `"]"` (closing with an empty stack, False)
- `"(("` (left-over openers, False)
- `"([)]"` (crossed pairs, False)
- `"{[]}"` (nested, True)
- `"()[]{}"` (in sequence, True)

### Min Stack (Medium)

**Restate:** Design a stack that supports `push`, `pop`, `top` and `getMin` (the smallest value in the stack), all in O(1) time.

**Hint 1:** Use a second stack (or store pairs) to remember the minimum.

**Hint 2:** When you push `x`, also push `min(x, current_min)` on a "min stack". Both stacks always have the same height, so popping both keeps the minimum correct after any pop.

**Hint 3:**
- `push(x)`: push `x` on the main stack; push `min(x, min_stack[-1])` (or `x` if empty) on the min stack.
- `pop()`: pop from both stacks.
- `top()`: return `stack[-1]`.
- `getMin()`: return `min_stack[-1]`.

**Complexity:** O(1) time for every operation, O(n) space.

**Edge cases to test:**
- push 0, push 1, push 0, getMin, pop, getMin (duplicates of the min; answers 0 then 0)
- push -2, push 0, push -3, getMin, pop, top, getMin (answers -3, 0, -2)
- One element: push 5, getMin, top (both 5)
- Negative and very large values (for example -2^31 and 2^31 - 1)
- Strictly decreasing pushes followed by pops one at a time

### Evaluate Reverse Polish Notation (Medium)

**Restate:** Evaluate an arithmetic expression written in postfix order (operators come after their two numbers), where division truncates toward zero.

**Hint 1:** Use a stack of numbers.

**Hint 2:** When you see an operator, pop two numbers. The first pop is the **right** operand and the second pop is the **left** operand. Order matters for `-` and `/`. In Python, use `int(a / b)` for truncation toward zero, because `//` rounds toward negative infinity.

**Hint 3:**
- For each token: if it is a number, push `int(token)`.
- If it is an operator: `b = pop()`, `a = pop()`.
- Compute `a op b` (with `int(a / b)` for division) and push the result.
- At the end, return the only value left on the stack.

**Complexity:** O(n) time, O(n) space.

**Edge cases to test:**
- `["42"]` (single number)
- `["4", "13", "5", "/", "+"]` (answer 6)
- `["6", "-132", "/"]` (negative division, answer 0, not -1)
- `["3", "4", "-"]` (operand order, answer -1)
- `["-3", "2", "*"]` (negative number token; do not treat `"-3"` as an operator)

### Generate Parentheses (Medium)

**Restate:** Given `n`, return every string of `n` pairs of parentheses that is well formed.

**Hint 1:** This is backtracking (build the string one character at a time and undo choices). A stack or list holds the current partial string.

**Hint 2:** You may add `"("` while `open_count < n`. You may add `")"` only while `close_count < open_count`. Following these two rules, every finished string of length `2n` is valid, so you never need to check validity at the end.

**Hint 3:**
- Write a helper `build(open_count, close_count)`.
- If both counts equal `n`, save the current string and return.
- If `open_count < n`: add `"("`, recurse, then remove it.
- If `close_count < open_count`: add `")"`, recurse, then remove it.

**Complexity:** The number of results is the n-th Catalan number, about `4^n / (n * sqrt(n))`; time is that times n for building strings. Space O(n) for the recursion, plus the output.

**Edge cases to test:**
- `n = 1` (answer `["()"]`)
- `n = 2` (answer `["(())", "()()"]`)
- `n = 3` (5 strings)
- `n = 4` (14 strings; a quick count check)
- Check that no result contains `")("` at the start or is unbalanced

### Daily Temperatures (Medium)

**Restate:** For each day, return how many days you must wait for a warmer temperature, or 0 if it never gets warmer.

**Hint 1:** Monotonic stack of indexes.

**Hint 2:** Keep the stack in decreasing temperature order. When today is warmer than the day on top, today is that day's answer, so pop it and record the gap. One pass is enough.

**Hint 3:**
- Create `res = [0] * n` and an empty stack.
- For each index `i`:
- While the stack is not empty and `temps[i] > temps[stack[-1]]`: pop `j`, set `res[j] = i - j`.
- Push `i`.
- Return `res`.

**Complexity:** O(n) time, O(n) space.

**Edge cases to test:**
- `[30]` (answer `[0]`)
- `[30, 40, 50, 60]` (answer `[1, 1, 1, 0]`)
- `[60, 50, 40]` (answer `[0, 0, 0]`)
- `[70, 70, 71]` (equal is not warmer, answer `[2, 1, 0]`)
- `[73, 74, 75, 71, 69, 72, 76, 73]` (answer `[1, 1, 4, 2, 1, 1, 0, 0]`)

### Car Fleet (Medium)

**Restate:** Cars drive toward the same target on a one-lane road; a faster car that catches a slower one must slow down and they move together as a fleet. Return how many fleets reach the target.

**Hint 1:** Sort the cars by position, closest to the target first. Then use a stack of arrival times.

**Hint 2:** Each car's arrival time alone is `(target - position) / speed`. Going from the front car backwards, a car whose time is less than or equal to the fleet ahead of it catches up and joins that fleet. A car with a bigger time starts a new fleet.

**Hint 3:**
- Pair each position with its speed and sort by position in descending order.
- For each car, compute `time = (target - pos) / speed`.
- If the stack is empty or `time > stack[-1]`, push `time` (new fleet).
- Otherwise do nothing (it joins the fleet ahead).
- Return the stack size.

**Complexity:** O(n log n) time for sorting, O(n) space.

**Edge cases to test:**
- One car (answer 1)
- `target = 10, position = [6, 8], speed = [4, 2]` (both arrive at time 1; they meet exactly at the target, answer 1)
- `target = 100, position = [0, 2, 4], speed = [4, 2, 1]` (answer 1)
- `target = 10, position = [3], speed = [3]` (answer 1)
- `target = 12, position = [10, 8, 0, 5, 3], speed = [2, 4, 1, 1, 3]` (answer 3)

### Largest Rectangle In Histogram (Hard)

**Restate:** Given bar heights of width 1, return the area of the largest rectangle that fits inside the histogram.

**Hint 1:** Monotonic increasing stack. Store pairs of `(start_index, height)`.

**Hint 2:** When a shorter bar arrives, every taller bar on the stack cannot extend further right, so pop it and compute its area: `height * (i - start)`. The new shorter bar can extend left to the start index of the last bar you popped, so push it with that start.

**Hint 3:**
- For each index `i` and height `h`: set `start = i`.
- While the stack top height is greater than `h`: pop `(idx, height)`, update `best = max(best, height * (i - idx))`, set `start = idx`.
- Push `(start, h)`.
- After the loop, for each remaining `(idx, height)`, update `best` with `height * (n - idx)`.

**Complexity:** O(n) time, O(n) space.

**Edge cases to test:**
- `[5]` (answer 5)
- `[2, 1, 5, 6, 2, 3]` (answer 10)
- `[2, 4]` (answer 4)
- `[1, 1, 1, 1]` (equal heights, answer 4)
- `[0, 0]` and strictly increasing `[1, 2, 3, 4, 5]` (answers 0 and 9; the second tests the after-loop cleanup)

## More quiz

1. In Evaluate Reverse Polish Notation, why should you avoid `a // b` in Python for division?
   - A. It is slower
   - B. It rounds toward negative infinity, but the problem wants truncation toward zero
   - C. It returns a float
   - D. It fails for positive numbers

2. In Car Fleet, why do you process cars from the closest to the target first?
   - A. Closer cars are always faster
   - B. A car can only be blocked by cars ahead of it, so the cars ahead must be known first
   - C. To make sorting stable
   - D. Because the stack must be in increasing order of position

3. Which pattern fits "for each element, find the previous smaller element"?
   - A. Monotonic stack
   - B. Hash set
   - C. Binary search on answer
   - D. Trie

4. In Generate Parentheses, when may you add a closing bracket?
   - A. Any time
   - B. Only when the open count equals n
   - C. Only when the close count is less than the open count
   - D. Only at the end

5. Largest Rectangle in Histogram with heights `[3, 1, 3]`. What is the answer?
   - A. 1
   - B. 3
   - C. 6
   - D. 9

## Answer key

1. **B** - For example `-7 // 2` is `-4` in Python, but truncation toward zero gives `-3`. Use `int(a / b)`.
2. **B** - The cars ahead decide whether a car gets blocked. Starting from the front lets you compare each car only with the fleet directly ahead of it.
3. **A** - A monotonic increasing stack keeps candidates; pop while the top is not smaller, and the remaining top is the previous smaller element.
4. **C** - A closing bracket is only safe when there is an unmatched opening bracket, which means `close < open`.
5. **B** - Each tall bar alone gives 3. The full width of 3 bars has height 1, giving 3. No rectangle beats 3.

## Flashcards

- **Q:** Valid Parentheses: what two checks happen at the end or on a close bracket? — **A:** On a close, the stack must be non-empty with the matching opener on top; at the end, the stack must be empty.
- **Q:** Min Stack: what is pushed onto the min stack with each value? — **A:** `min(x, current_min)`, so both stacks stay the same height.
- **Q:** RPN: which pop is the right operand? — **A:** The first pop is the right operand; the second pop is the left operand.
- **Q:** RPN test case for truncation? — **A:** `["6", "-132", "/"]` must give 0, not -1.
- **Q:** How many valid strings does Generate Parentheses return for n = 3? — **A:** 5 (the 3rd Catalan number).
- **Q:** Daily Temperatures: what does the stack hold? — **A:** Indexes of days still waiting for a warmer day, with temperatures in decreasing order.
- **Q:** Car Fleet: formula for a car's arrival time? — **A:** `(target - position) / speed`.
- **Q:** Car Fleet: when does a car start a new fleet? — **A:** When its arrival time is strictly greater than the fleet time on top of the stack.
- **Q:** Largest Rectangle: area of a popped bar at index i? — **A:** `height * (i - start_index)`.
- **Q:** Largest Rectangle: why process the stack after the loop? — **A:** Bars still on the stack extend to the end, so their area is `height * (n - start_index)`.

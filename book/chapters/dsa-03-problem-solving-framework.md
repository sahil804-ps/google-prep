# A Problem-Solving Framework

> **In this chapter:**
> - Follow a nine-step framework for any coding problem
> - Use input constraints to guess the target time complexity
> - Practise in a way that builds real skill: the 15-20 minute rule, re-coding from memory, spaced repetition and a mistakes log
> - Recognise common patterns from signals in the problem statement
>
> **Time:** ~45 minutes  |  **Level:** Beginner

## Why you need a framework

When you see a new problem in an interview, your brain may freeze. A framework is a fixed checklist that tells you what to do next, even when you feel stuck. Pilots use checklists before take-off, not because they forget how to fly, but because stress makes people skip steps.

As a tester, you already think in steps: understand the requirement, design the cases, execute, report. Solving a coding problem is very similar. You will use the same framework in every practice session, so in the real interview it runs automatically.

## The nine steps

| Step | Name | Rough time in a 45-minute round |
|---|---|---|
| 1 | Understand with examples | 2-3 min |
| 2 | Ask clarifying questions | 2-3 min |
| 3 | Brute force first | 2-3 min |
| 4 | Find the pattern and optimise the idea | 5-8 min |
| 5 | Plan in comments | 2-3 min |
| 6 | Code | 10-15 min |
| 7 | Test with cases | 5-7 min |
| 8 | Analyse complexity | 1-2 min |
| 9 | Optimise further or discuss follow-ups | remaining time |

We will walk through each step using one running example:

> **Problem:** Given a list of integers `nums` and an integer `k`, return the length of the longest contiguous subarray whose sum is at most `k`. All numbers are positive.

### Step 1: Understand with examples

Read the problem twice. Then restate it in your own words, aloud. Then make your own small example and solve it **by hand**.

"So I need the longest block of neighbours, without gaps, whose total is at most k."

Example: `nums = [2, 1, 3, 1, 1]`, `k = 4`.
- `[2, 1]` sums to 3, length 2.
- `[3, 1]` sums to 4, length 2.
- `[1, 1]` at the end sums to 2, length 2.
- `[3, 1, 1]` sums to 5, too big.
- `[1, 3]` sums to 4, length 2.

So the answer is 2. Solving by hand does two things: it confirms you understand, and it often shows you the pattern.

### Step 2: Ask clarifying questions

A clarifying question removes doubt about the input or output. Good questions sound like test design:

- "Can the list be empty? What should I return then?" (Say 0.)
- "Are all numbers positive, or can they be zero or negative?" (This changes the pattern completely.)
- "Can k be zero or negative?"
- "How large can the list be?" (This tells you the target complexity; see later.)
- "Do you want the length or the subarray itself?"

Do not ask 15 questions. Ask the 3-5 that change your solution.

### Step 3: Brute force first

The **brute force** is the simplest correct solution, even if slow. Say it aloud before optimising:

"The simple way: try every start index, extend to every end index, keep a running sum, and track the best length. That is O(n²) time and O(1) space."

Why say it? It proves you can solve the problem at all. It gives a fallback. And it gives you something to improve. Do not always code it; usually you just describe it and ask, "Should I code this, or look for a faster approach?"

```python
def longest_brute(nums, k):
    best = 0
    for start in range(len(nums)):
        total = 0
        for end in range(start, len(nums)):
            total += nums[end]
            if total > k:
                break              # positives: sum only grows
            best = max(best, end - start + 1)
    return best

print(longest_brute([2, 1, 3, 1, 1], 4))   # Output: 2
```

### Step 4: Find the pattern

Now look for repeated work in the brute force. Ask yourself:

- What work am I repeating? (Here: we re-add the same numbers for every start.)
- Is there a known pattern that fits? (Contiguous subarray + all positive numbers = **sliding window**.)
- Would sorting, a hash map, two pointers, a heap, or binary search help?

Because all numbers are positive, when the window sum is too big, moving the left edge right always makes it smaller. That is the signal for a sliding window. Explain this reason aloud. The interviewer wants the "why", not just the name.

### Step 5: Plan in comments

Before writing real code, write the plan as short comments. This is like writing test steps before automating them.

```python
def longest_at_most_k(nums, k):
    # left = start of window, total = window sum, best = answer
    # for each right index:
    #     add nums[right] to total
    #     while total > k: remove nums[left], move left forward
    #     update best with window length
    # return best
    pass
```

Ask: "Does this plan look good before I code it?" The interviewer can correct you early, which saves time.

### Step 6: Code

Now turn each comment into code. Use clear names. Keep talking, but more quietly: "Now I shrink the window while it is too big."

```python
def longest_at_most_k(nums, k):
    left, total, best = 0, 0, 0
    for right, num in enumerate(nums):
        total += num                     # grow window to the right
        while total > k and left <= right:
            total -= nums[left]          # shrink from the left
            left += 1
        best = max(best, right - left + 1)
    return best

print(longest_at_most_k([2, 1, 3, 1, 1], 4))  # Output: 2
```

### Step 7: Test with cases

Never say "I think it works" without testing. First, **dry run** the given example line by line, saying variable values aloud. Then test edge cases:

- Empty list: `[]` -> loop does not run -> returns 0. Correct.
- Single element bigger than k: `[5], k=4` -> total 5, shrink, left=1, length 0. Correct.
- Everything fits: `[1, 1, 1], k=10` -> 3. Correct.

Chapter dsa-30 goes deep on this step. It is your strongest step as a test engineer.

### Step 8: Analyse complexity

State time and space, and explain why:

"Time is O(n). Each element enters the window once and leaves at most once, so the inner while loop runs at most n times in total. Space is O(1), just a few variables."

### Step 9: Optimise or discuss follow-ups

If time remains, discuss improvements or follow-ups the interviewer raises:

- "What if numbers can be negative?" Then the window trick breaks, because shrinking no longer always reduces the sum. You would need prefix sums with a different technique.
- "What if the data is a stream?" Then you keep only the window state.

Even if you do not code it, talking about trade-offs shows depth.

## Reading constraints to guess the target complexity

The **constraints** are the limits on input size, like `1 <= n <= 10^5`. They are a huge clue. A rough rule: a normal computer does around 10^7 to 10^8 simple operations per second. Interview judges often allow about one second. So the input size tells you which complexity will pass.

| Input size n | Target complexity | Typical patterns |
|---|---|---|
| n <= 10-12 | O(n!) or O(2^n · n) | Backtracking, permutations |
| n <= 20-25 | O(2^n) | Subsets, bitmask DP |
| n <= 500 | O(n³) | 3 nested loops, some interval DP |
| n <= 5,000 | O(n²) | 2-D DP, nested loops |
| n <= 10^5 to 10^6 | O(n log n) or O(n) | Sorting, heap, binary search, two pointers, sliding window, hash map |
| n up to 10^9 or more | O(log n) or O(1) | Binary search on the answer, math |

These are rough guides, not laws. In a Google interview, constraints are often not given. Then **ask**: "How big can the input be?" If the interviewer says "very large", aim for O(n) or O(n log n).

Think of it like planning a trip. If you have to travel 5 km, you can walk. If you have to travel 500 km, you need a train. The distance (input size) decides the vehicle (algorithm).

## How to practise

Solving many problems is not enough. **How** you practise matters more than how many.

### The 15-20 minute rule

Set a timer when you start a problem.

- If you have a clear approach within 15-20 minutes, continue and code it.
- If you are stuck for 15-20 minutes with **no new idea**, stop. Look at a hint, or the approach only.

Why? Struggling for a while builds skill. Struggling for two hours mostly builds frustration. The goal is to learn the pattern, then practise using it.

### Write your approach before code

Before you type any code, write 3-5 lines in plain English: the idea, the data structure, and the complexity. If you cannot write the approach, you are not ready to code. This also trains you to explain aloud in interviews.

### Watch only the approach in videos

When you use a solution video (NeetCode and others), watch only until the idea is clear. Then **pause** and write the code yourself. Watching someone else type the code feels like learning, but it is like watching a cooking show: you will not be able to cook the dish later.

### Re-code from memory

After you understand a solution, close everything and write it again from a blank file. If you get stuck, note exactly where, look once, and start again from blank. This is the single most effective practice habit.

### Spaced repetition: days 1, 3, 7, 14, 30

Review each problem on a schedule:

| Day | Task |
|---|---|
| 1 | Solve or learn it, then re-code from memory |
| 3 | Re-code from blank, no hints |
| 7 | Re-code with a 20-minute timer |
| 14 | Explain the approach aloud in 2 minutes |
| 30 | Re-code once more |

If you fail a review, reset the schedule for that problem to day 1. A simple spreadsheet works well: problem, pattern, date, next review date, status.

### Keep a mistakes log

A **mistakes log** is a list of every error you make while practising, with the root cause. It is your personal bug tracker.

| Date | Problem | Mistake | Root cause | Fix rule |
|---|---|---|---|---|
| Oct 7 | Two Sum | Returned values, not indices | Did not re-read output format | Re-read output before coding |
| Oct 9 | Valid Palindrome | Crashed on empty string | Skipped edge cases | Always test empty input |
| Oct 12 | Binary Search | Infinite loop | Used `left = mid` | Move pointer past mid |

Read the log every Sunday before your weekly test. After a few weeks you will see your top 3 repeat mistakes. Fixing those gives the biggest improvement.

## Pattern recognition cheat sheet

A **pattern** is a reusable way of solving a family of problems. The signal is a phrase or feature in the problem that points to a pattern. This table is your quick map. Each pattern gets its own chapter in this volume.

| Signal in the problem | Likely pattern |
|---|---|
| "Find if a pair or value exists", fast lookup, counting | Hash map / hash set |
| Sorted array, find pair or triple with a target sum | Two pointers |
| Contiguous subarray or substring, "longest" / "shortest" / "at most k" | Sliding window |
| Sum of a range, many range-sum queries, subarray sum equals k | Prefix sums (+ hash map) |
| Sorted input, or "minimum value that works" / "maximum that works" | Binary search (on index or on the answer) |
| Matching brackets, "next greater element", undo | Stack / monotonic stack |
| "Top k", "k-th largest", merge k sorted lists, running median | Heap (priority queue) |
| Linked list cycle, middle of list | Fast and slow pointers |
| Tree traversal, depth, path sums | DFS (recursion) on trees |
| Level by level, shortest path in an unweighted graph or grid | BFS with a queue |
| Islands in a grid, connected groups | DFS / BFS or union-find |
| Tasks with prerequisites, build order | Topological sort |
| Shortest path with weights | Dijkstra |
| "All combinations", "all permutations", "all subsets" | Backtracking |
| "Number of ways", "min cost", "max profit" with choices that overlap | Dynamic programming |
| Prefix of words, autocomplete | Trie |
| Overlapping time ranges, meeting rooms | Sort intervals + sweep / heap |
| Choose the locally best option and it is provably safe | Greedy |
| Max/min in every window of size k | Monotonic deque |

Use the table as a starting point, not a final answer. Many problems combine two patterns, for example "sort + two pointers" or "BFS + hash set".

## The framework as a script

Here is a compact script you can memorise. Say these lines in practice until they feel natural:

1. "Let me restate the problem to make sure I understand."
2. "Let me try a small example by hand."
3. "A few questions: can the input be empty? Can there be duplicates or negatives? How large can it be?"
4. "The brute force is ..., which is O(...). Let me look for something better."
5. "I notice ..., which suggests a ... pattern, because ..."
6. "Here is my plan in comments. Does this look good?"
7. "Now I will code it." (Code, while narrating key decisions.)
8. "Let me trace through my example, and then test edge cases."
9. "Time is O(...) because ..., space is O(...) because ..."
10. "If we had more time, I would ... / A follow-up could be ..."

## Tester's corner

- Steps 1-2 are requirement analysis. Clarifying questions are the same as questions you ask a product owner about a vague user story.
- The brute force is like a baseline test: simple, known to be correct, used to compare a faster version.
- Planning in comments is like writing test steps before automation. It catches logic errors cheaply.
- Step 7 (testing) is where you can stand out. Use equivalence classes and boundary values, just as you do at work.
- The mistakes log is a root cause analysis habit. Track repeat defects and fix the process, not just the instance.
- Constraint reading is like reading non-functional requirements: the load target decides the architecture.

## Key takeaways

- Use nine steps: understand, clarify, brute force, find the pattern, plan, code, test, analyse, optimise.
- Always state a brute force first, then explain why a better pattern applies.
- Input size predicts target complexity: around 10^5 means O(n log n) or O(n).
- Follow the 15-20 minute rule: when stuck with no new idea, take a hint and learn the pattern.
- Write the approach in English before code, watch only the approach in videos, and re-code from memory.
- Review problems on days 1, 3, 7, 14 and 30, and keep a mistakes log with root causes.
- Use signal-to-pattern mapping as a starting point; many problems combine patterns.

## Quiz

1. What is the first step of the framework? A) Code B) Analyse complexity C) Understand with examples D) Optimise
2. Why should you state a brute force solution first?
3. The input size is up to 10^5. Which target complexity is most reasonable? A) O(2^n) B) O(n³) C) O(n²) D) O(n log n)
4. True or false: if you are stuck for 15-20 minutes with no new idea, you should keep trying for at least two more hours.
5. What should you write before writing any code?
6. The problem says "longest substring with at most k distinct characters". Which pattern is most likely?
7. True or false: watching a full video of someone coding the solution is the best way to learn it.
8. You keep getting off-by-one errors in binary search. What would you do about it in your practice system?
9. Which signal points to a heap? A) "Matching brackets" B) "Top k most frequent" C) "All subsets" D) "Islands in a grid"
10. The interviewer gives no constraints. What would you do?

## Answer key

1. **C** - Understand the problem by restating it and working a small example by hand.
2. **Baseline and safety** - It proves you can solve it, gives a fallback, and shows the repeated work you can optimise.
3. **D** - With 10^5 elements, O(n²) is about 10^10 operations, too slow; O(n log n) or O(n) fits.
4. **False** - Use the 15-20 minute rule: take a hint, learn the pattern, and re-code from memory later.
5. **The approach in plain English** - 3-5 lines with the idea, data structure and complexity, then a plan in comments.
6. **Sliding window** - "Longest substring" with an "at most k" condition is a classic sliding window signal, usually with a hash map of counts.
7. **False** - Watch only until the idea is clear, then write the code yourself; watching typing gives false confidence.
8. **Log it and add a rule** - Add it to the mistakes log with the root cause and a fix rule, review it weekly, and add binary search problems to the review schedule.
9. **B** - "Top k" problems usually use a heap.
10. **Ask about input size** - Ask how large the input can be; if "very large", aim for O(n) or O(n log n).

## Flashcards

- **Q:** What are the nine steps of the framework? — **A:** Understand, clarify, brute force, find pattern, plan in comments, code, test, analyse complexity, optimise.
- **Q:** Why work an example by hand first? — **A:** It confirms understanding and often reveals the pattern.
- **Q:** What target complexity fits n up to 10^5? — **A:** O(n log n) or O(n).
- **Q:** What target complexity fits n up to about 20? — **A:** O(2^n), such as subsets or bitmask DP.
- **Q:** What is the 15-20 minute rule? — **A:** If stuck that long with no new idea, take a hint or look at the approach only.
- **Q:** What is the most effective practice habit? — **A:** Re-coding a solution from memory on a blank file.
- **Q:** What is the spaced repetition schedule? — **A:** Review on days 1, 3, 7, 14 and 30; reset to day 1 if you fail.
- **Q:** What goes in a mistakes log? — **A:** Date, problem, mistake, root cause, and a fix rule.
- **Q:** What signal suggests sliding window? — **A:** A contiguous subarray or substring with "longest", "shortest" or "at most k".
- **Q:** What signal suggests topological sort? — **A:** Tasks with prerequisites or a build order.
- **Q:** What signal suggests backtracking? — **A:** "Generate all combinations, permutations or subsets."

# Testing Your Own Code: The QA Superpower

> **In this chapter:**
> - Dry-run your code by hand, line by line, like a debugger
> - Choose strong test cases using categories and boundary thinking
> - Write quick asserts and small pytest tests for an interview solution
> - Talk about testing aloud the way Google interviewers expect from a test engineer
> - Apply all of this to two complete worked examples
>
> **Time:** ~45 minutes  |  **Level:** Intermediate

## Why this is your superpower

Many candidates finish their code, say "I think this works", and stop. Testing your own solution is one of the things coding interviewers evaluate (see chapter dsa-01). For a test-focused role, it matters even more: the interviewer wants to see that you **think like a tester even about your own code**.

You do this every day at work. You look at a login form and immediately think: empty password, very long password, SQL characters, Unicode names, two clicks on submit. This chapter shows you how to bring the same instinct into a 45-minute coding round, where you usually **cannot run the code**.

Think of a railway signal engineer. Before a new track opens, they walk it, check each signal, and run a test train. They do not wait for passengers to find the problems. You will "walk your code" the same way.

## Part 1: Dry-running code

A **dry run** means executing the code in your head (or on paper), line by line, tracking every variable. You are the computer.

### How to dry run

1. Pick a **small** input: 3-5 elements. Large inputs waste time.
2. Make a small table with one column per variable that changes.
3. Go line by line. Update the table each time a variable changes.
4. At the end, compare the result with the answer you worked out by hand earlier.

Example: this function should return the maximum profit from buying a stock on one day and selling on a later day.

```python
def max_profit(prices):
    min_price = float('inf')
    best = 0
    for p in prices:
        min_price = min(min_price, p)     # cheapest buy so far
        best = max(best, p - min_price)   # best sell today
    return best

print(max_profit([7, 1, 5, 3, 6]))   # Output: 5 (buy at 1, sell at 6)
```

Dry run with `[7, 1, 5, 3]`:

| p | min_price | p - min_price | best |
|---|---|---|---|
| start | inf | - | 0 |
| 7 | 7 | 0 | 0 |
| 1 | 1 | 0 | 0 |
| 5 | 1 | 4 | 4 |
| 3 | 1 | 2 | 4 |

Result 4 (buy at 1, sell at 5). Correct.

### Tips for an effective dry run

- **Say values aloud.** "p is 5, min_price stays 1, so profit is 4, best becomes 4." The interviewer can follow and will often help if you slip.
- **Trace what the code does, not what you meant.** The most common failure is reading your intention instead of the actual line. Point at each line in the editor as you go.
- **Watch the boundaries:** the first iteration, the last iteration, and the moment a loop or `while` exits.
- **Check every return path.** If a function has three `return` statements, make sure some test reaches each one.

## Part 2: Choosing test cases

Do not test randomly. Use **categories**, exactly like equivalence partitioning at work. An **equivalence class** is a group of inputs that the code should treat the same way, so one test from each group is enough.

### The test case checklist

| Category | Examples | What it catches |
|---|---|---|
| Normal / given example | The example from the problem | Basic logic |
| Empty input | `[]`, `""`, `None` root | Crashes on `nums[0]`, wrong default |
| Single element | `[5]`, `"a"`, one node | Loops that assume two items |
| Two elements | `[1, 2]`, `[2, 1]` | Pointer and swap bugs |
| Duplicates | `[2, 2, 2]`, `"aaa"` | Wrong `<` vs `<=`, set misuse |
| Negatives and zero | `[-3, 0, 4]` | Assumptions like "values are positive"; falsy 0 bugs |
| Sorted / reverse sorted | `[1, 2, 3]`, `[3, 2, 1]` | Worst cases, monotonic logic |
| All the same answer | No valid answer, every item valid | Missing "not found" return |
| Max size / large values | n = 10^5, values near limits | Too slow (O(n²)), deep recursion |
| Special characters / Unicode | `"A man, a plan"`, `"é"`, emoji | Case and character class handling |

You will not test all categories in every interview. Pick the 4-6 that are most **risky** for this specific problem, and say why.

### Boundary thinking

Bugs live at **boundaries**: the edges between one behaviour and another. This is boundary value analysis, which you already know from testing.

In code, boundaries are:

- **Index edges:** index 0, index `len - 1`, and the off-by-one at `len`.
- **Loop exits:** what happens when `left == right` in a `while left < right` loop?
- **Thresholds in the problem:** "at most k" means test sums equal to k, k - 1 and k + 1.
- **Size edges:** 0, 1, 2 items.

Example: in binary search, a classic boundary question is whether the condition is `left < right` or `left <= right`. Test with a one-element list where the target exists and where it does not. That tiny test exposes most binary search bugs.

## Part 3: Writing quick tests

In many Google interviews you cannot run code. But writing tests still matters: it shows you know **what** to check. If the environment allows running code, even better.

### Quick asserts

`assert` checks that a condition is true. If not, Python raises `AssertionError`. Writing a few asserts after your function is fast and clear.

```python
def reverse_words(s):
    return " ".join(reversed(s.split()))

assert reverse_words("the sky is blue") == "blue is sky the"
assert reverse_words("  hello   world ") == "world hello"   # extra spaces
assert reverse_words("") == ""                              # empty
assert reverse_words("one") == "one"                        # single word
print("all passed")
```

Note how each assert has a short comment naming its category. This tells the interviewer that the tests are deliberate.

### A small pytest file

If you are asked "How would you test this properly?", show a parametrised pytest. You know pytest from work, so this is a chance to be confident.

```python
import pytest
from solution import reverse_words   # your function

@pytest.mark.parametrize("s, expected", [
    ("the sky is blue", "blue is sky the"),  # normal
    ("  hello   world ", "world hello"),     # extra spaces
    ("", ""),                                # empty
    ("one", "one"),                          # single word
    ("a b", "b a"),                          # two words
])
def test_reverse_words(s, expected):
    assert reverse_words(s) == expected
```

### Testing against a brute force

A powerful idea: compare your fast solution with a slow, obviously correct brute force on many random inputs. This is called **randomised differential testing**. You do not usually have time to write it in a 45-minute round, but **mentioning** it shows real testing maturity.

```python
import random

def brute_max_profit(prices):
    best = 0
    for i in range(len(prices)):
        for j in range(i + 1, len(prices)):
            best = max(best, prices[j] - prices[i])
    return best

for _ in range(1000):
    prices = [random.randint(0, 20) for _ in range(random.randint(0, 8))]
    assert max_profit(prices) == brute_max_profit(prices), prices
print("1000 random tests passed")
```

Small random sizes (0-8) give many edge cases, including empty lists, quickly.

## Part 4: Debugging by hand

When your dry run gives a wrong answer, do not panic and do not rewrite everything. Debug like you would triage a failing test:

1. **Reproduce:** find the smallest input that fails. Shrink `[3, 1, 4, 1, 5]` to `[1, 1]` if that still fails.
2. **Locate:** trace that tiny input and find the first line where a variable gets a value you did not expect.
3. **Explain the cause** aloud: "The loop starts at 1, so the first element is never compared."
4. **Fix the minimum:** change only what is needed.
5. **Re-test:** rerun the failing case and one case that passed before (a mini regression test).

Saying "Let me find the smallest failing input" is a strong signal to an interviewer. It shows a calm, systematic process.

## Part 5: Talking about tests aloud

How you **say** it matters, because the interviewer writes feedback from what they hear. Useful phrases:

- "Before I say I am done, let me trace through the example."
- "Now let me test some edge cases. The risky ones here are an empty list, all duplicates, and negative numbers."
- "For the empty case, the loop does not run, so I return 0, which matches what we agreed."
- "I found a bug: for a single element, the right pointer starts out of range. Let me fix that."
- "If I had a test environment, I would also compare this against the brute force on random inputs."
- "For performance, I would test with n = 10^5 to confirm it runs in time."

### What test-engineering interviewers expect

For SWE-Test, Test Engineer or SDET style roles, interviewers commonly look for more than "it works on the example". Show that you can:

- **Enumerate test categories** systematically, not randomly.
- **Prioritise** by risk: "The highest risk is duplicates, because of the `<=` comparison."
- **Separate** functional tests from performance and robustness tests.
- **Think about invalid input**: "Should I validate that `k` is non-negative, or can I assume valid input?" Ask, and do what the interviewer prefers.
- **Discuss how you would automate** tests: parametrised unit tests, property-based tests, a brute-force oracle.

An **oracle** is the source of truth that tells you the expected output. A brute-force solution is a great oracle. A **property** is a rule that must always hold, such as "the output of a sort is in non-decreasing order and has the same elements as the input". Mentioning these terms naturally shows depth.

## Worked example 1: Valid Palindrome

> **Problem:** Given a string `s`, return `True` if it is a palindrome after converting to lowercase and removing all non-alphanumeric characters. Example: `"A man, a plan, a canal: Panama"` returns `True`.

### The solution

```python
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if not s[left].isalnum():       # skip non-letters/digits
            left += 1
        elif not s[right].isalnum():
            right -= 1
        elif s[left].lower() != s[right].lower():
            return False                # mismatch found
        else:
            left += 1
            right -= 1
    return True

print(is_palindrome("A man, a plan, a canal: Panama"))  # True
```

### Dry run with `"a,b A"`

| left | right | s[left] | s[right] | action |
|---|---|---|---|---|
| 0 | 4 | a | A | match, move both |
| 1 | 3 | , | (space) | skip left |
| 2 | 3 | b | (space) | skip right |
| 2 | 2 | - | - | loop ends (left == right) |

Returns `True`. "abA" is not a palindrome, but after ignoring case "aba" is. Correct.

### Test plan said aloud

"The risky areas are: empty and single-character strings, strings with only punctuation, case differences, digits, and Unicode."

```python
assert is_palindrome("") is True            # empty: loop never runs
assert is_palindrome("a") is True           # single char
assert is_palindrome(".,!") is True         # only punctuation -> empty -> True
assert is_palindrome("ab") is False         # two chars, mismatch
assert is_palindrome("0P") is False         # digit vs letter (classic trap)
assert is_palindrome("Aa") is True          # case-insensitive
assert is_palindrome("race a car") is False # given negative example
```

### Unicode discussion

Python's `str.isalnum()` and `str.lower()` work on Unicode, so `"Été"` is treated as letters. Is that what the problem wants? Ask: "Should I treat only ASCII letters and digits as alphanumeric, or any Unicode letter?" Also note that some characters change length when lowercased or have different forms (for example, an accented letter can be one code point or a letter plus a combining accent). A full solution might normalise the string first with `unicodedata.normalize`. You do not need to code this; raising it shows you think about real-world input, like a tester.

### Complexity

Time O(n): each pointer moves at most n steps. Space O(1): no copy of the string.

## Worked example 2: Merge Intervals

> **Problem:** Given a list of intervals `[start, end]`, merge all overlapping intervals and return the result. Example: `[[1,3],[2,6],[8,10]]` returns `[[1,6],[8,10]]`.

### The solution

```python
def merge(intervals):
    if not intervals:
        return []
    intervals = sorted(intervals, key=lambda x: x[0])  # sort by start
    merged = [list(intervals[0])]
    for start, end in intervals[1:]:
        last = merged[-1]
        if start <= last[1]:              # overlaps (or touches)
            last[1] = max(last[1], end)   # extend the last interval
        else:
            merged.append([start, end])
    return merged

print(merge([[1, 3], [2, 6], [8, 10]]))   # [[1, 6], [8, 10]]
```

### Dry run with `[[8,10],[1,3],[2,6]]` (unsorted on purpose)

After sorting: `[[1,3],[2,6],[8,10]]`. `merged = [[1,3]]`.

| current | last | overlap? | merged after |
|---|---|---|---|
| [2,6] | [1,3] | 2 <= 3 yes | [[1,6]] |
| [8,10] | [1,6] | 8 <= 6 no | [[1,6],[8,10]] |

Correct.

### Test plan said aloud

"The interesting boundaries are touching intervals, intervals fully inside others, unsorted input, and empty input."

```python
assert merge([]) == []                                   # empty
assert merge([[1, 4]]) == [[1, 4]]                       # single
assert merge([[1, 4], [4, 5]]) == [[1, 5]]               # touching: boundary
assert merge([[1, 10], [2, 3]]) == [[1, 10]]             # fully contained
assert merge([[5, 6], [1, 2]]) == [[1, 2], [5, 6]]       # unsorted, no overlap
assert merge([[1, 2], [1, 2]]) == [[1, 2]]               # duplicates
assert merge([[-5, -1], [-2, 0]]) == [[-5, 0]]           # negatives
```

The "fully contained" test is important. A common bug is writing `last[1] = end` instead of `last[1] = max(last[1], end)`. With `[[1,10],[2,3]]`, that bug gives `[[1,3]]`. This one test catches it, which is why you choose tests by risk.

The "touching" case `[1,4],[4,5]` depends on the rules. Ask: "Do intervals that only touch count as overlapping?" Here we assume yes (`<=`). If not, change to `<`.

### Questions a tester would raise

- Does the function modify the caller's list? We used `sorted(...)` and `list(...)` copies, so the input is not changed. Mention this: side effects are a real source of bugs.
- What if an interval has `start > end`? Invalid input: ask whether to validate.
- Large input: sorting is O(n log n), so 10^5 intervals is fine.

### Complexity

Time O(n log n) for the sort, plus O(n) for the merge pass. Space O(n) for the output and the sorted copy.

## Tester's corner

- Everything in this chapter is your daily QA skill set: equivalence classes, boundary values, regression, minimal repro, root cause. You are applying it to your own code instead of someone else's.
- A brute-force solution is a test oracle; comparing fast and slow solutions on random inputs is differential testing.
- Properties such as "output is sorted and has the same elements" lead to property-based testing (for example, with the Hypothesis library in Python).
- Side effects on inputs (mutating the caller's list) are a classic defect; check for them like you check for test pollution.
- Ask about invalid input instead of assuming. It is the coding version of clarifying requirements with a product owner.
- Prioritise tests by risk and say why. Interviewers notice the reasoning, not just the list.

## Key takeaways

- Never stop at "I think it works": dry run the example, then test risky edge cases.
- Dry run with a tiny input, a variable table, and values spoken aloud; trace what the code does, not what you meant.
- Use test categories: empty, single, two, duplicates, negatives/zero, sorted/reverse, no answer, max size, Unicode.
- Bugs live at boundaries: index edges, loop exits, thresholds like "at most k", and sizes 0, 1, 2.
- Write quick asserts with category comments; offer pytest parametrisation and brute-force comparison as the "proper" test plan.
- Debug by shrinking to the smallest failing input, finding the first wrong value, fixing minimally, then re-testing.
- For test roles, show systematic, risk-based thinking and mention oracles, properties and automation.

## Quiz

1. What is a dry run? A) Running code with no input B) Executing code by hand line by line, tracking variables C) Running only the tests D) Deleting unused code
2. Why should you use a small input for a dry run?
3. True or false: testing the given example is usually enough in an interview.
4. Which test would catch the bug `last[1] = end` in merge intervals? A) `[]` B) `[[1, 4]]` C) `[[1, 10], [2, 3]]` D) `[[5, 6], [1, 2]]`
5. Name three boundary areas in code where bugs often hide.
6. What is a test oracle, and what is a good oracle in a coding interview?
7. Your dry run gives a wrong answer on `[3, 1, 4, 1, 5]`. What would you do first?
8. True or false: `is_palindrome("0P")` should return `False`.
9. Which phrase best shows testing maturity? A) "It works." B) "I'll trust it." C) "The risky cases are empty input and duplicates; let me trace them." D) "Can you run it for me?"
10. The problem does not say whether input can be invalid. What would you do?

## Answer key

1. **B** - A dry run executes the code in your head or on paper, tracking every variable.
2. **Speed and clarity** - Small inputs (3-5 elements) are fast to trace and still expose most logic bugs.
3. **False** - The example covers only the normal case; you must also test risky edge cases.
4. **C** - With a contained interval, the buggy line shrinks the end from 10 to 3; the correct `max` keeps 10.
5. **Index edges, loop exits, and thresholds** - Also size edges like 0, 1 and 2 elements.
6. **Source of expected output** - An oracle tells you the correct answer; a slow but simple brute-force solution is a great oracle.
7. **Shrink the input** - Find the smallest failing input, then trace it to the first wrong variable value.
8. **True** - '0' and 'p' are different characters even after lowercasing, so it is not a palindrome.
9. **C** - It names risky categories and commits to checking them, which is systematic, risk-based testing.
10. **Ask the interviewer** - Ask whether to validate or assume valid input, then follow their answer and mention it in your tests.

## Flashcards

- **Q:** What is a dry run? — **A:** Executing code by hand, line by line, tracking variable values in a table.
- **Q:** What size input is best for a dry run? — **A:** Small: 3-5 elements.
- **Q:** What are the core edge-case categories? — **A:** Empty, single, two elements, duplicates, negatives/zero, sorted/reverse, no answer, max size, Unicode.
- **Q:** Where do bugs usually hide? — **A:** At boundaries: index edges, loop exits, thresholds, and sizes 0, 1, 2.
- **Q:** What is a test oracle? — **A:** The source of truth for expected output, such as a brute-force solution.
- **Q:** What is randomised differential testing? — **A:** Comparing a fast solution with a brute force on many random inputs.
- **Q:** What is the first step when a dry run fails? — **A:** Shrink to the smallest failing input.
- **Q:** What is a property in property-based testing? — **A:** A rule that must always hold, like "sorted output has the same elements in order".
- **Q:** What bug does the "fully contained interval" test catch? — **A:** Overwriting the end with `end` instead of `max(last_end, end)`.
- **Q:** What should you do when input validity is unclear? — **A:** Ask the interviewer whether to validate or assume valid input.
- **Q:** Why add comments to each assert? — **A:** To show each test targets a deliberate category or risk.

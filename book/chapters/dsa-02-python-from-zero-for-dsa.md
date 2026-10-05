# Python From Zero for DSA

> **In this chapter:**
> - Learn the Python basics that DSA problems need, and nothing extra
> - Use lists, tuples, dictionaries and sets with confidence
> - Write loops, functions and small classes like `ListNode` and `TreeNode`
> - Understand `None`, truthiness, scope and list comprehensions
> - Recognise and fix the most common Python errors in interviews
>
> **Time:** ~60 minutes  |  **Level:** Zero

## Why only "DSA Python"

Python is a big language. You do not need all of it for interviews. You need a small toolbox, and you need to use it without thinking, like a cook who knows exactly where the salt and the knife are.

You already write Python for test automation, so some of this will feel easy. Read it anyway. Interview Python is different from framework Python: no libraries like `pytest` fixtures or Selenium, just plain data structures and logic. Small gaps here cause big bugs under pressure.

The web app has a separate lesson, "Python toolkit for interviews", that covers `collections`, `heapq` and other power tools. This chapter is the foundation under that lesson.

Every example below is tiny. Type them into a Python shell (`python` in your terminal) and see the output yourself.

## Variables

A **variable** is a name that points to a value. Think of it as a label stuck on a box. The label is the name; the box holds the value.

```python
age = 30            # name 'age' points to the value 30
name = "Sahil"      # a string
age = age + 1       # now 'age' points to 31
print(age, name)    # Output: 31 Sahil
```

You do not declare a type. Python figures it out from the value. You can also assign many variables at once:

```python
a, b = 1, 2         # a = 1, b = 2
a, b = b, a         # swap in one line
print(a, b)         # Output: 2 1
```

The swap trick is used a lot in DSA, for example when reversing an array with two pointers.

## The basic types: int, float, str, bool

### int and float

An **int** is a whole number. A **float** is a number with a decimal point.

```python
x = 7
y = 2
print(x + y)    # 9
print(x - y)    # 5
print(x * y)    # 14
print(x / y)    # 3.5  (true division always gives a float)
print(x // y)   # 3    (floor division: rounds down)
print(x % y)    # 1    (remainder, called "modulo")
print(x ** y)   # 49   (power)
```

Two things matter a lot for DSA:

- Use `//` for integer division, for example the middle index in binary search: `mid = (left + right) // 2`.
- `%` gives the remainder. `n % 2 == 0` checks if `n` is even.

Python ints have no size limit, so you do not get overflow like in Java or C++. For "infinity", use `float('inf')` and `float('-inf')`:

```python
best = float('inf')       # bigger than any number
best = min(best, 42)
print(best)               # Output: 42
```

### str

A **str** (string) is text. Use single or double quotes.

```python
s = "hello"
print(len(s))         # 5  (length)
print(s[0])           # 'h' (first character, index starts at 0)
print(s[-1])          # 'o' (negative index counts from the end)
print(s.upper())      # 'HELLO'
print("ell" in s)     # True
```

Strings are **immutable**. That means you cannot change a character in place.

```python
s = "cat"
# s[0] = "b"          # TypeError: 'str' object does not support item assignment
s = "b" + s[1:]       # build a new string instead
print(s)              # Output: bat
```

To build a long string piece by piece, collect pieces in a list and join them at the end. Adding strings in a loop creates a new string every time, which is slow.

```python
parts = []
for ch in "abc":
    parts.append(ch.upper())
print("".join(parts))   # Output: ABC
```

Useful string tools: `s.split()`, `" ".join(words)`, `s.isdigit()`, `s.isalpha()`, `s.isalnum()`, `s.lower()`, `ord('a')` gives 97 and `chr(97)` gives `'a'`.

```python
# Map a lowercase letter to 0..25, common in anagram problems
print(ord('c') - ord('a'))   # Output: 2
```

### bool

A **bool** is `True` or `False`. Comparisons give bools. Combine them with `and`, `or`, `not`.

```python
print(3 > 2)                # True
print(3 == 3 and 2 != 2)    # False
print(not False)            # True
print(1 < 5 < 10)           # True (Python allows chained comparisons)
```

## Lists

A **list** is an ordered collection that can grow and shrink. It is Python's version of an array. Think of a train: coaches in order, numbered from 0, and you can add coaches at the end.

```python
nums = [5, 3, 8]
nums.append(1)          # add to the end -> [5, 3, 8, 1]
print(nums[0])          # 5
print(nums[-1])         # 1
nums[1] = 10            # lists ARE mutable -> [5, 10, 8, 1]
last = nums.pop()       # remove and return last -> 1
print(nums, last)       # [5, 10, 8] 1
print(len(nums))        # 3
```

Common list operations and their cost (Big-O, where n is the list length):

| Operation | Example | Cost |
|---|---|---|
| Read or write by index | `nums[i]` | O(1) |
| Add to end | `nums.append(x)` | O(1) on average |
| Remove from end | `nums.pop()` | O(1) |
| Remove from front | `nums.pop(0)` | O(n) - slow! |
| Insert at front | `nums.insert(0, x)` | O(n) - slow! |
| Search for a value | `x in nums` | O(n) |
| Sort | `nums.sort()` | O(n log n) |

Because `pop()` from the end is fast, a list works well as a **stack** (last in, first out). For a **queue** (first in, first out), use `collections.deque`, which is covered in the toolkit lesson.

### Sorting

```python
nums = [4, 1, 3]
nums.sort()                     # sorts in place -> [1, 3, 4]
print(sorted([4, 1, 3]))        # returns a NEW sorted list -> [1, 3, 4]
print(sorted([4, 1, 3], reverse=True))   # [4, 3, 1]

pairs = [(1, 'b'), (0, 'z'), (1, 'a')]
pairs.sort(key=lambda p: p[1])  # sort by the second item
print(pairs)                    # [(1, 'a'), (1, 'b'), (0, 'z')]
```

A **lambda** is a tiny function without a name. `lambda p: p[1]` means "given p, return p[1]".

### 2-D lists (grids)

Many problems use grids: matrices, game boards, maps of islands.

```python
rows, cols = 2, 3
grid = [[0] * cols for _ in range(rows)]   # correct way
grid[0][1] = 5
print(grid)          # [[0, 5, 0], [0, 0, 0]]
```

Warning: `[[0] * cols] * rows` looks right but is wrong. It makes every row the **same** list, so changing one row changes all of them. This is a classic interview bug.

```python
bad = [[0] * 3] * 2
bad[0][0] = 9
print(bad)           # [[9, 0, 0], [9, 0, 0]]  <- both rows changed!
```

## Slicing

**Slicing** takes a part of a list or string. The format is `seq[start:stop:step]`. The `stop` index is **not** included.

```python
nums = [10, 20, 30, 40, 50]
print(nums[1:3])     # [20, 30]   (index 1 and 2, not 3)
print(nums[:2])      # [10, 20]   (from the start)
print(nums[3:])      # [40, 50]   (to the end)
print(nums[::-1])    # [50, 40, 30, 20, 10]  (reversed)
print(nums[::2])     # [10, 30, 50]  (every second item)
print("racecar" == "racecar"[::-1])   # True: palindrome check
```

Important: a slice creates a **copy**. Copying k items costs O(k) time and memory. If you slice inside a loop or a recursive function, your solution can become slower than you think. In interviews, prefer passing indexes (`left`, `right`) instead of slicing, when it matters.

## Tuples

A **tuple** is like a list, but it cannot change after creation (it is immutable). Use round brackets.

```python
point = (3, 4)
x, y = point          # "unpacking"
print(x, y)           # 3 4
# point[0] = 5        # TypeError: tuples cannot be changed
```

Why use tuples in DSA?

- They can be **dictionary keys** and **set members**, because they are immutable. Lists cannot.
- They are perfect for pairs like `(row, col)` or `(distance, node)`.

```python
visited = set()
visited.add((0, 1))   # grid cell (row 0, col 1)
print((0, 1) in visited)   # True
```

## Dictionaries

A **dictionary** (`dict`) stores **key -> value** pairs. Think of a phone contacts list: you look up a name (key) and get a number (value), and you do not need to scan every contact.

```python
ages = {"amit": 25, "priya": 30}
ages["ravi"] = 28              # add a new key
ages["amit"] = 26              # update a value
print(ages["priya"])           # 30
print("ravi" in ages)          # True  (checks KEYS, O(1) on average)
print(ages.get("zara", 0))     # 0     (default if key is missing)
del ages["ravi"]               # remove a key
```

Looking up, adding and removing a key are **O(1) on average**. This is why dicts appear in so many optimal solutions. The "Prefix sums and how hash maps work" lesson in the web app explains why it is fast.

### Looping over a dict

```python
ages = {"amit": 25, "priya": 30}
for name in ages:                # loops over keys
    print(name)
for name, age in ages.items():   # keys and values together
    print(name, age)
print(list(ages.values()))       # [25, 30]
```

### Counting with a dict

Counting things is one of the most common DSA tasks.

```python
word = "banana"
count = {}
for ch in word:
    count[ch] = count.get(ch, 0) + 1
print(count)        # {'b': 1, 'a': 3, 'n': 2}
```

`collections.Counter(word)` does the same in one line. It is covered in the toolkit lesson, but know the manual way too, because an interviewer may ask you to explain it.

Warning: reading a missing key with square brackets raises an error.

```python
d = {}
# print(d["x"])     # KeyError: 'x'
print(d.get("x"))   # None, no error
```

## Sets

A **set** is a collection of **unique** values with no order. Think of the list of people who have entered a stadium: you only care whether a person is in or not, and nobody is counted twice.

```python
seen = set()             # empty set (note: {} is an empty DICT)
seen.add(3)
seen.add(3)              # duplicate ignored
seen.add(5)
print(seen)              # {3, 5}
print(3 in seen)         # True, O(1) on average
seen.remove(3)           # error if missing; use discard() to be safe
print(len(seen))         # 1
```

Set operations:

```python
a = {1, 2, 3}
b = {2, 3, 4}
print(a | b)    # {1, 2, 3, 4}  union
print(a & b)    # {2, 3}        intersection
print(a - b)    # {1}           difference
print(len(set([1, 1, 2])) < 3)   # True: the list had a duplicate
```

**Rule of thumb:** if you are writing `if x in some_list` inside a loop, ask yourself whether `some_list` should be a set. That one change often turns O(n²) into O(n).

## Loops

### for loops

A `for` loop goes through each item of a sequence.

```python
for fruit in ["apple", "mango"]:
    print(fruit)

for i in range(3):           # 0, 1, 2
    print(i)

for i in range(2, 10, 3):    # start 2, stop before 10, step 3 -> 2, 5, 8
    print(i)

for i in range(5, 0, -1):    # counting down: 5, 4, 3, 2, 1
    print(i)
```

When you need both the index and the value, use `enumerate`:

```python
for i, val in enumerate(["a", "b"]):
    print(i, val)       # 0 a, then 1 b
```

To walk two lists together, use `zip`:

```python
for x, y in zip([1, 2], ["one", "two"]):
    print(x, y)         # 1 one, then 2 two
```

### while loops

A `while` loop runs as long as a condition is true. You use it when you do not know the number of steps in advance, for example in two pointers and binary search.

```python
left, right = 0, 4
while left < right:
    print(left, right)   # 0 4, then 1 3
    left += 1
    right -= 1
```

Always make sure something inside the loop moves towards the stop condition. Otherwise you get an **infinite loop**, which looks like your code "hanging".

### break and continue

```python
for n in [1, 2, 3, 4]:
    if n == 2:
        continue        # skip the rest of this round
    if n == 4:
        break           # leave the loop completely
    print(n)            # prints 1, then 3
```

## Functions

A **function** is a named block of code that takes inputs (parameters) and can give back a result with `return`. In interviews you almost always write your solution as a function.

```python
def add(a, b):
    """Return the sum of a and b."""
    return a + b

print(add(2, 3))     # Output: 5
```

### return

`return` ends the function immediately and sends a value back. If a function has no `return`, it returns `None`.

```python
def find_index(nums, target):
    for i, n in enumerate(nums):
        if n == target:
            return i         # stops here as soon as found
    return -1                # only reached if not found

print(find_index([4, 5, 6], 5))   # 1
print(find_index([4, 5, 6], 9))   # -1
```

You can return several values as a tuple:

```python
def min_max(nums):
    return min(nums), max(nums)

lo, hi = min_max([3, 9, 1])
print(lo, hi)        # 1 9
```

### Default parameters

```python
def greet(name, greeting="Hello"):
    return greeting + ", " + name

print(greet("Sahil"))            # Hello, Sahil
print(greet("Sahil", "Hi"))      # Hi, Sahil
```

Warning: never use a mutable default like `def f(x, seen=[])`. The same list is shared between all calls. Use `seen=None` and create the list inside.

### Functions inside functions

In interviews, it is common to write a helper function inside the main one, especially for recursion (DFS on trees and graphs). The inner function can read variables of the outer function.

```python
def count_paths(n):
    memo = {}
    def helper(k):                  # inner function can see 'memo'
        if k <= 1:
            return 1
        if k not in memo:
            memo[k] = helper(k - 1) + helper(k - 2)
        return memo[k]
    return helper(n)

print(count_paths(5))   # Output: 8
```

## Scope

**Scope** means "where a name can be seen". A variable created inside a function is **local**: it exists only inside that function.

```python
def f():
    temp = 10       # local to f
    return temp

f()
# print(temp)       # NameError: name 'temp' is not defined
```

The tricky case: an inner function can **read** an outer variable, and can **change the contents** of an outer list or dict. But it cannot **reassign** an outer variable unless you write `nonlocal`.

```python
def longest():
    best = 0
    def update(val):
        nonlocal best          # without this line: UnboundLocalError
        best = max(best, val)
    for v in [3, 7, 2]:
        update(v)
    return best

print(longest())   # Output: 7
```

This pattern appears in tree problems like "diameter of a binary tree", where a helper updates a running best answer. An alternative is to store the answer in a list, `best = [0]`, and update `best[0]`, which needs no `nonlocal`.

## None and truthiness

### None

`None` means "no value". It is like an empty seat on a train: the seat exists, but nobody is sitting there. In DSA, `None` marks the end of a linked list or a missing child in a tree.

```python
node = None
if node is None:          # use 'is' to compare with None
    print("empty")
```

Always use `is None` or `is not None`, not `== None`.

### Truthiness

In an `if` or `while`, Python treats some values as false. These are called **falsy** values:

- `False`, `None`, `0`, `0.0`
- empty containers: `""`, `[]`, `{}`, `set()`, `()`

Everything else is **truthy**.

```python
nums = []
if not nums:
    print("list is empty")      # this prints

stack = [1, 2]
while stack:                    # runs while the stack is not empty
    print(stack.pop())          # 2, then 1
```

A trap: `if node:` is False when `node` is `None`, but `if val:` is also False when `val` is `0`. If 0 is a valid value (for example, a tree node with value 0, or index 0), use `is not None`.

```python
idx = 0
if idx:                 # wrong check: 0 is falsy
    print("found")      # does NOT print, but index 0 was valid
if idx is not None:     # correct
    print("found")      # prints
```

## Classes for ListNode and TreeNode

A **class** is a blueprint for creating objects. Each object has its own data (attributes). For DSA, you only need classes for simple node types. Think of a class as a form template (like a railway reservation form), and each object as one filled form.

### ListNode (linked list)

A linked list is a chain of nodes. Each node holds a value and a pointer to the next node.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val       # the data in this node
        self.next = next     # the next node, or None at the end

# Build 1 -> 2 -> 3
head = ListNode(1, ListNode(2, ListNode(3)))

cur = head
while cur:                   # stop when cur becomes None
    print(cur.val)           # 1, 2, 3
    cur = cur.next
```

`__init__` is the special method that runs when you create an object. `self` means "this object".

### TreeNode (binary tree)

A binary tree node has a value and up to two children: `left` and `right`.

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

#      1
#     / \
#    2   3
root = TreeNode(1, TreeNode(2), TreeNode(3))

def tree_sum(node):
    if node is None:          # base case: empty tree
        return 0
    return node.val + tree_sum(node.left) + tree_sum(node.right)

print(tree_sum(root))         # Output: 6
```

On sites like LeetCode, these classes are given to you. In a Google interview you may need to write them yourself, so practise typing them from memory.

### A class with methods

Some problems ask you to design a class, such as "MinStack" or "LRU Cache".

```python
class Counter:
    def __init__(self):
        self.count = 0
    def increment(self):
        self.count += 1
        return self.count

c = Counter()
c.increment()
print(c.increment())    # Output: 2
```

## List comprehensions

A **list comprehension** builds a list in one line. It is short and fast, and interviewers like it when it stays readable.

```python
squares = [x * x for x in range(5)]          # [0, 1, 4, 9, 16]
evens = [x for x in range(10) if x % 2 == 0] # [0, 2, 4, 6, 8]
words = ["Hi", "Bye"]
lengths = [len(w) for w in words]            # [2, 3]
```

The same idea works for sets and dicts:

```python
unique_lens = {len(w) for w in ["a", "bb", "cc"]}   # {1, 2}
index_of = {ch: i for i, ch in enumerate("abc")}    # {'a': 0, 'b': 1, 'c': 2}
```

Do not cram complex logic into one line. If a comprehension needs two `if` conditions and nested loops, write a normal loop. Clear code earns more points than clever code.

## Useful built-in functions

| Function | Example | Result |
|---|---|---|
| `len` | `len([1, 2])` | 2 |
| `min`, `max` | `max([3, 8])` | 8 |
| `sum` | `sum([1, 2, 3])` | 6 |
| `abs` | `abs(-4)` | 4 |
| `sorted` | `sorted("cab")` | `['a', 'b', 'c']` |
| `reversed` | `list(reversed([1, 2]))` | `[2, 1]` |
| `any`, `all` | `any([False, True])` | True |
| `range` | `list(range(3))` | `[0, 1, 2]` |
| `divmod` | `divmod(7, 2)` | `(3, 1)` |

## Common errors and how to fix them

Under interview pressure, everyone makes small mistakes. Knowing the common ones helps you spot them during your dry run.

| Error | Typical cause | Fix |
|---|---|---|
| `IndexError: list index out of range` | Reading `nums[i]` when `i == len(nums)`, or reading `nums[0]` on an empty list | Check loop bounds; handle empty input first |
| `KeyError` | Reading `d[key]` when the key is missing | Use `d.get(key, default)` or check `key in d` |
| `TypeError: 'NoneType' object ...` | Calling `.val` or `.next` on `None` | Check `if node is not None` before using it |
| `UnboundLocalError` | Reassigning an outer variable inside an inner function | Use `nonlocal` |
| `RecursionError` | Missing or wrong base case; or very deep recursion | Fix the base case; use an iterative version for deep inputs |
| Infinite loop | `while` condition never becomes false | Make sure pointers move every round |
| Wrong answer from grid | `[[0] * c] * r` shares rows | Use `[[0] * c for _ in range(r)]` |
| Off-by-one | `range(n)` vs `range(n + 1)`, `<` vs `<=` | Trace with a 1- or 2-element example |

A note on recursion depth: Python's default recursion limit is about 1000 calls. For a very deep tree or a long linked list, recursive code may crash. You can mention this in the interview and offer an iterative version with your own stack. Saying this shows maturity.

One more silent bug: modifying a list while looping over it.

```python
nums = [1, 2, 2, 3]
# for n in nums:
#     if n == 2: nums.remove(n)   # skips items, gives wrong result
nums = [n for n in nums if n != 2]  # safe: build a new list
print(nums)                          # Output: [1, 3]
```

## Putting it together: a small full solution

Here is a complete interview-style function using many ideas from this chapter: a dict, a loop, `enumerate`, a clear return, and a small test.

```python
def first_unique_char(s):
    """Return the index of the first non-repeating character, or -1."""
    count = {}
    for ch in s:                       # pass 1: count characters
        count[ch] = count.get(ch, 0) + 1
    for i, ch in enumerate(s):         # pass 2: find first with count 1
        if count[ch] == 1:
            return i
    return -1

assert first_unique_char("leetcode") == 0
assert first_unique_char("loveleetcode") == 2
assert first_unique_char("aabb") == -1
assert first_unique_char("") == -1     # edge case: empty string
print("all tests passed")
```

Time is O(n) because we walk the string twice. Space is O(1) if the alphabet is fixed (at most 26 lowercase letters), or O(k) for k distinct characters in general.

## Tester's corner

- Python's falsy values are a source of real bugs. As a tester, always ask: "What if the value is 0 or an empty string?" when you see `if x:`.
- The shared-row grid bug (`[[0]*c]*r`) is a good example of aliasing: two names point to the same object. You have probably seen similar bugs with shared test fixtures.
- `assert` statements are a fast way to test a function in an interview. You already use asserts in pytest; the same habit works here.
- Mutable default arguments behave like shared state between tests. Avoid them for the same reason you avoid test order dependencies.
- When an error occurs in your head during a dry run, name it precisely ("this line raises KeyError when the key is new"). That is how you would write a good bug report.
- Recursion limits are a scale boundary. Mentioning them is like noting a load limit in a performance test.

## Key takeaways

- Use `//` for integer division, `%` for remainder, and `float('inf')` for infinity.
- Lists are fast at the end (`append`, `pop`) and slow at the front; strings and tuples are immutable.
- Dicts and sets give O(1) average lookups; use them to replace slow `in list` checks.
- Slices copy data and cost O(k); pass indexes when it matters.
- Use `is None` checks; remember that 0 and empty containers are falsy.
- Write `ListNode` and `TreeNode` from memory; use inner functions and `nonlocal` for recursive helpers.
- Know the common errors (IndexError, KeyError, NoneType, off-by-one, shared grid rows) and look for them in your dry run.

## Quiz

1. What does `7 // 2` return in Python? A) 3.5 B) 3 C) 4 D) 1
2. True or false: you can change a character in a Python string with `s[0] = "x"`.
3. Which operation is slow (O(n)) on a Python list? A) `nums.append(x)` B) `nums.pop()` C) `nums.pop(0)` D) `nums[5]`
4. What is wrong with `grid = [[0] * 3] * 3`?
5. What does `nums[::-1]` do?
6. Why can a tuple be a dictionary key but a list cannot?
7. What does `d.get("x", 0)` return if `"x"` is not in `d`?
8. Your inner helper function does `best = max(best, val)` and crashes with UnboundLocalError. What would you do?
9. True or false: `if idx:` is a safe way to check that an index was found.
10. Which of these values is truthy? A) `[]` B) `0` C) `"0"` D) `None`

## Answer key

1. **B** - `//` is floor division, so 7 divided by 2 rounds down to 3.
2. **False** - Strings are immutable; you must build a new string.
3. **C** - Removing from the front shifts every other element, which is O(n).
4. **Shared rows** - All three rows are the same list object, so changing one cell changes that column in every row. Use a list comprehension.
5. **Reverses the sequence** - A slice with step -1 returns a reversed copy.
6. **Immutability** - Dict keys must be hashable, which requires the value not to change; tuples are immutable, lists are not.
7. **0** - `get` returns the default value instead of raising KeyError.
8. **Add `nonlocal best`** - This tells Python that `best` belongs to the outer function. Or store it in a one-element list.
9. **False** - Index 0 is falsy, so a found index of 0 would look like "not found". Use `is not None` or compare with -1.
10. **C** - `"0"` is a non-empty string, so it is truthy. The others are falsy.

## Flashcards

- **Q:** What is the difference between `/` and `//`? — **A:** `/` gives a float result; `//` gives floor (rounded-down) division.
- **Q:** How do you represent infinity in Python? — **A:** `float('inf')` and `float('-inf')`.
- **Q:** Which list operations are O(1)? — **A:** Index access, `append`, and `pop()` from the end.
- **Q:** How do you create a 2-D grid correctly? — **A:** `[[0] * cols for _ in range(rows)]`.
- **Q:** What does a slice cost? — **A:** O(k) time and space, because it copies k elements.
- **Q:** What is the average cost of a dict or set lookup? — **A:** O(1).
- **Q:** How do you count items with a plain dict? — **A:** `count[x] = count.get(x, 0) + 1`.
- **Q:** What are Python's falsy values? — **A:** False, None, 0, 0.0, and empty containers like "", [], {}, set(), ().
- **Q:** How should you compare with None? — **A:** Use `is None` or `is not None`.
- **Q:** What does `nonlocal` do? — **A:** Lets an inner function reassign a variable from the enclosing function.
- **Q:** What fields does a TreeNode have? — **A:** `val`, `left`, and `right`.
- **Q:** What is Python's default recursion limit roughly? — **A:** About 1000 calls; use an iterative approach for very deep inputs.

## Problem hints

Try each problem on your own first. Open one hint at a time. Only go to the next hint when you are stuck for 10 or more minutes.

### Kth Largest Element In a Stream (Easy)

**Restate:** Design a class that receives numbers one at a time and, after each `add`, returns the k-th largest number seen so far.

**Hint 1:** Keep a min-heap that holds only the k largest numbers.

**Hint 2:** The top of that min-heap (the smallest of the top k) is exactly the k-th largest. When the heap grows past k, pop the top, because that number can never be the k-th largest again.

**Hint 3:**
- In the constructor, push all starting numbers, then pop until the size is k.
- In `add(val)`: push `val`.
- If the size is more than k, pop once.
- Return `heap[0]`.

**Complexity:** O(log k) per `add`, O(n log k) to build (or O(n) with `heapify` plus pops); O(k) space.

**Edge cases to test:**
- Starting list empty with k = 1, then `add(-3)` (answer -3)
- Starting list shorter than k (the problem promises the k-th exists after the add)
- `k = 3, nums = [4, 5, 8, 2]`, then `add(3)` gives 4, `add(5)` gives 5, `add(10)` gives 5
- Adding many equal values
- Adding a value smaller than the current k-th largest (answer does not change)

### Last Stone Weight (Easy)

**Restate:** Repeatedly smash the two heaviest stones; if they differ, the smaller weight is subtracted from the larger and that stone stays; return the last stone's weight or 0.

**Hint 1:** You keep needing the two biggest values, so use a max-heap.

**Hint 2:** Python's `heapq` is a min-heap. Store negative weights to turn it into a max-heap, and flip the sign when you pop.

**Hint 3:**
- Turn every weight `w` into `-w` and `heapify`.
- While more than one stone: pop the biggest `y` and the next biggest `x`.
- If `y != x`, push `-(y - x)`.
- Return the remaining weight, or 0 if the heap is empty.

**Complexity:** O(n log n) time, O(n) space.

**Edge cases to test:**
- `[1]` (answer 1)
- `[2, 2]` (both destroyed, answer 0)
- `[2, 7, 4, 1, 8, 1]` (answer 1)
- `[10, 4, 2, 10]` (answer 2)
- All stones equal and an even count (answer 0)

### K Closest Points to Origin (Medium)

**Restate:** Given points on a 2D plane, return the k points closest to `(0, 0)`, in any order.

**Hint 1:** "K smallest by distance" means a heap. Compare squared distances; you never need the square root.

**Hint 2:** Keep a max-heap of size k (push `(-distance, x, y)`). When it grows past k, pop the farthest. At the end it holds the k closest. (Heapifying all points and popping k times is also fine.)

**Hint 3:**
- For each point, compute `d = x * x + y * y`.
- Push `(-d, x, y)` into the heap.
- If the size is more than k, pop (removes the farthest so far).
- Return the points left in the heap.

**Complexity:** O(n log k) time, O(k) space. (Quickselect gives O(n) average.)

**Edge cases to test:**
- `points = [[1, 3], [-2, 2]], k = 1` (answer `[[-2, 2]]`)
- `k` equal to the number of points (return all)
- Points with equal distance like `[1, 0]` and `[0, 1]` (either is valid; ask the interviewer)
- The point `[0, 0]` itself (distance 0)
- Large coordinates like `[10000, -10000]` (squared value is 2 * 10^8, fine in Python)

### Kth Largest Element In An Array (Medium)

**Restate:** Return the k-th largest number in an unsorted array (counting duplicates, so it is the k-th position in sorted descending order).

**Hint 1:** A min-heap of size k, as in the stream problem. Ask if sorting is allowed: sorting is O(n log n).

**Hint 2:** The interview follow-up is quickselect: partition the array around a pivot like quicksort, but recurse only into the side that contains the target index `n - k`. Average O(n), worst O(n^2); a random pivot makes the worst case very unlikely.

**Hint 3:**
- Heap way: push each number; if the size is more than k, pop; return `heap[0]`.
- Quickselect way: target index `t = n - k` in ascending order.
- Partition around a pivot so smaller values are on the left.
- If the pivot lands at `t`, return it; if it lands left of `t`, search the right part; else search the left part.

**Complexity:** Heap: O(n log k) time, O(k) space. Quickselect: O(n) average time, O(1) extra space for the in-place version.

**Edge cases to test:**
- `[1], k = 1` (answer 1)
- `[3, 2, 1, 5, 6, 4], k = 2` (answer 5)
- `[3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4` (duplicates count, answer 4)
- All values equal, like `[7, 7, 7], k = 2` (answer 7; a naive quickselect can become very slow here)
- Already sorted input (worst case for a quickselect that always picks the last element as pivot)

### Task Scheduler (Medium)

**Restate:** Given tasks (letters) and a cooldown `n`, where the same task must wait at least `n` time units before running again, return the minimum time units needed (idle slots allowed).

**Hint 1:** Greedy: always run the task with the most remaining copies. That needs a max-heap of counts, plus a queue for tasks that are cooling down.

**Hint 2:** Each time unit, pop the biggest count, run it once, and if copies remain, put it into a queue with the time when it becomes available (`time + n`). When the front of the queue is ready, push it back into the heap. There is also a math formula: `max(len(tasks), (max_freq - 1) * (n + 1) + count_of_tasks_with_max_freq)`.

**Hint 3:**
- Count tasks; push `-count` for each into a heap. `time = 0`, `queue = deque()`.
- While the heap or the queue is not empty: `time += 1`.
- If the heap is not empty: pop, add 1 to the negative count (one copy done); if still non-zero, append `(count, time + n)` to the queue.
- If the queue front's ready time equals `time`, pop it from the queue and push its count back into the heap.
- Return `time`.

**Complexity:** O(total tasks * log 26) = O(total tasks) time, O(26) = O(1) space. The formula is O(total tasks).

**Edge cases to test:**
- `tasks = ["A", "A", "A", "B", "B", "B"], n = 2` (answer 8)
- Same tasks with `n = 0` (no cooldown, answer 6)
- `tasks = ["A", "A", "A", "B", "B", "B"], n = 50` (answer 104, mostly idle)
- `tasks = ["A", "B", "C", "D"], n = 3` (no idle needed, answer 4)
- `tasks = ["A", "A", "A", "B", "C", "D", "E", "F"], n = 2` (many different tasks fill the gaps, answer 8)

### Design Twitter (Medium)

**Restate:** Design a simple Twitter with `postTweet(userId, tweetId)`, `follow`, `unfollow`, and `getNewsFeed(userId)` that returns the 10 most recent tweet ids from the user and the people they follow.

**Hint 1:** Store each user's tweets as a list of `(time, tweetId)` and each user's followees as a set. For the feed, merge several lists with a heap.

**Hint 2:** Use a global counter as the timestamp. Every user's list is already in time order, so the newest tweet is at the end. Push the newest tweet of each followee (and the user) into a max-heap, then pop up to 10 times; after each pop, push the next older tweet from the same user. This is the "merge k sorted lists" idea.

**Hint 3:**
- `postTweet`: append `(time, tweetId)` to `tweets[userId]`; increase `time`.
- `follow` / `unfollow`: add to or discard from `following[followerId]` (ignore a user following themselves, or always include the user in the feed).
- `getNewsFeed`: for the user and each followee with tweets, push `(-time, tweetId, user, index)` of their last tweet.
- Pop up to 10 times; after each pop, if that user has an older tweet (`index - 1 >= 0`), push it.
- Return the popped tweet ids in order.

**Complexity:** `postTweet`, `follow`, `unfollow` O(1). `getNewsFeed` O(f + 10 log f), where f is the number of followees. Space O(users + tweets + follow edges).

**Edge cases to test:**
- Feed for a user with no tweets and no followees (answer `[]`)
- A user with more than 10 tweets (only the 10 newest, newest first)
- Unfollow, then check that the old followee's tweets are gone from the feed
- Unfollow someone you never followed (no crash)
- A user follows themselves (their tweets must not appear twice)

### Find Median From Data Stream (Hard)

**Restate:** Design a class with `addNum(num)` and `findMedian()`, where the median is the middle value of all numbers added so far (or the average of the two middle values).

**Hint 1:** Two heaps: a max-heap for the smaller half and a min-heap for the larger half.

**Hint 2:** Keep two rules after every add: every number in the small half is less than or equal to every number in the large half, and the small half has the same size or one more. Then the median is always at the tops of the heaps.

**Hint 3:**
- `addNum`: push into the small max-heap (as a negative number).
- Move the biggest of the small half into the large min-heap (this fixes the order rule).
- If the large half is now bigger than the small half, move its smallest back.
- `findMedian`: if the small half is bigger, return its top; else return the average of both tops.

**Complexity:** `addNum` O(log n), `findMedian` O(1); O(n) space.

**Edge cases to test:**
- Add 1, then `findMedian` (answer 1.0)
- Add 1 and 2, then `findMedian` (answer 1.5)
- Add 1, 2, 3 (answer 2.0)
- Numbers added in decreasing order like 5, 4, 3, 2, 1 (answer 3.0)
- Negative numbers and duplicates, like -1, -1, -2 (answer -1.0)

## More quiz

1. In Task Scheduler, tasks `["A", "A", "B"]` with `n = 2`. What is the minimum time?
   - A. 3
   - B. 4
   - C. 5
   - D. 6

2. In K Closest Points to Origin, why can you skip the square root?
   - A. Python has no square root
   - B. Squaring keeps the order of non-negative distances the same, so comparisons give the same result
   - C. The square root is always an integer
   - D. It changes the answer, but only slightly

3. Which pattern fits "merge the newest tweets from many users' timelines"?
   - A. Sliding window
   - B. Heap that holds the current newest item from each list (merge k sorted lists)
   - C. Trie
   - D. Binary search on the answer

4. What is the average time of quickselect for Kth Largest Element in an Array?
   - A. O(log n)
   - B. O(n)
   - C. O(n log n)
   - D. O(n^2)

5. In Find Median from Data Stream, after adding 5, 15 and 1, what are the heap tops (small max-heap, large min-heap)?
   - A. small top 5, large top 15
   - B. small top 1, large top 5
   - C. small top 15, large top 1
   - D. small top 5, large top 1

## Answer key

1. **B** - A has 2 copies and must wait 2 units between them: A, B, idle, A. That is 4 units. The formula gives `(2 - 1) * (2 + 1) + 1 = 4`.
2. **B** - For non-negative numbers, `a < b` exactly when `a^2 < b^2`. Skipping the root also avoids floating-point rounding problems.
3. **B** - Each user's tweets are already in time order. A heap of the newest unread tweet from each list gives the next newest tweet overall in O(log k).
4. **B** - Each partition step on average throws away about half of the remaining part, so the total work is about n + n/2 + n/4 + ... = O(n). The worst case is O(n^2).
5. **A** - The small half holds {1, 5} with top 5, and the large half holds {15} with top 15. The small half has one more item, so the median is 5.

## Flashcards

- **Q:** Kth Largest in a Stream: which heap and what size? — **A:** A min-heap holding at most k numbers; its top is the answer.
- **Q:** Last Stone Weight: how do you get a max-heap from `heapq`? — **A:** Push negative weights and flip the sign when you pop.
- **Q:** K Closest Points: what distance value do you compare? — **A:** The squared distance `x * x + y * y`.
- **Q:** K Closest Points: heap type for O(n log k)? — **A:** A max-heap of size k by distance, so the farthest point is popped when the size goes over k.
- **Q:** Kth Largest in an Array: target index for quickselect in ascending order? — **A:** `n - k`.
- **Q:** Task Scheduler formula? — **A:** `max(len(tasks), (max_freq - 1) * (n + 1) + count_with_max_freq)`.
- **Q:** Task Scheduler: why put cooling tasks in a queue? — **A:** They cannot run until `time + n`, so they wait outside the heap until they are ready.
- **Q:** Design Twitter: why use a global counter as the timestamp? — **A:** It gives a strict order between all tweets from all users, so the heap can compare them.
- **Q:** Find Median: which half may hold one extra number? — **A:** The small half (max-heap), so with an odd count the median is its top.
- **Q:** Find Median: time of addNum and findMedian? — **A:** O(log n) for addNum and O(1) for findMedian.

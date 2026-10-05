## Problem hints

### Meeting Rooms (Easy)
**Restate:** Given meeting time intervals, say whether one person can attend all of them (no two meetings overlap).
**Hint 1:** Sort the intervals by start time.
**Hint 2:** After sorting, you only need to compare each meeting with the one just before it. If a meeting starts before the previous one ends, there is a clash.
**Hint 3:**
- Sort by start.
- For i from 1 to n - 1: if `start[i] < end[i - 1]`, return False.
- Return True.
- Meetings that only touch (one ends at 10, next starts at 10) do NOT clash.
**Complexity:** O(n log n) time, O(1) extra space (or O(n) depending on the sort).
**Edge cases to test:** empty list gives True; one meeting gives True; `[[0,30],[5,10],[15,20]]` gives False; touching `[[5,10],[10,15]]` gives True; unsorted input `[[7,10],[2,4]]` gives True.

### Insert Interval (Medium)
**Restate:** Given a sorted list of non-overlapping intervals and one new interval, insert it and merge where needed so the list stays sorted and non-overlapping.
**Hint 1:** One linear pass in three phases; no sorting needed.
**Hint 2:** Intervals fully to the left of the new one are copied, intervals that overlap get merged into it, and intervals fully to the right are copied after it.
**Hint 3:**
- Copy every interval whose end is less than the new start.
- While intervals start at or before the new end, merge: new start = min, new end = max.
- Append the merged new interval.
- Copy all remaining intervals.
**Complexity:** O(n) time, O(n) space for the output.
**Edge cases to test:** empty list with `[5,7]` gives `[[5,7]]`; new interval before all others; new interval after all others; `[[1,3],[6,9]]` with `[2,5]` gives `[[1,5],[6,9]]`; new interval covering everything, like `[[1,2],[3,4]]` with `[0,10]`; touching `[[1,5]]` with `[5,7]` gives `[[1,7]]`.

### Merge Intervals (Medium)
**Restate:** Given intervals in any order, merge all overlapping ones and return the result.
**Hint 1:** Sort by start, then scan once.
**Hint 2:** After sorting, an interval overlaps the last merged one if its start is `<=` the last end. Then just extend the last end.
**Hint 3:**
- Sort by start.
- Put the first interval in the output.
- For each next interval: if `start <= out[-1].end`, set `out[-1].end = max(out[-1].end, end)`.
- Otherwise append it as a new interval.
**Complexity:** O(n log n) time, O(n) space.
**Edge cases to test:** one interval; `[[1,3],[2,6],[8,10],[15,18]]` gives `[[1,6],[8,10],[15,18]]`; touching `[[1,4],[4,5]]` gives `[[1,5]]`; nested `[[1,4],[2,3]]` gives `[[1,4]]`; unsorted `[[4,5],[1,4]]` gives `[[1,5]]`.

### Non Overlapping Intervals (Medium)
**Restate:** Return the minimum number of intervals to remove so that the rest do not overlap.
**Hint 1:** Greedy, sorted by END time (this is the activity selection problem).
**Hint 2:** Keeping the interval that ends earliest leaves the most room for the rest. So count how many you can KEEP; the answer is n minus that.
**Hint 3:**
- Sort by end.
- `prevEnd = -infinity`, `kept = 0`.
- For each interval: if `start >= prevEnd`, keep it (`kept += 1`, `prevEnd = end`).
- Return `n - kept`.
**Complexity:** O(n log n) time, O(1) extra space.
**Edge cases to test:** `[[1,2],[2,3],[3,4],[1,3]]` gives 1; `[[1,2],[1,2],[1,2]]` gives 2; touching `[[1,2],[2,3]]` gives 0; one interval gives 0; one long interval covering many short ones, like `[[1,100],[1,2],[3,4]]`, gives 1.

### Meeting Rooms II (Medium)
**Restate:** Given meeting intervals, return the minimum number of rooms needed so that all meetings can happen.
**Hint 1:** A min-heap of end times works (see the lesson). Another clean way: two sorted arrays and two pointers.
**Hint 2:** Sort all start times and all end times separately. Walk through starts; each start needs a room, unless some meeting has already ended by then, which frees one. The answer is the peak number of rooms in use.
**Hint 3:** (two-pointer version)
- `starts = sorted(starts)`, `ends = sorted(ends)`.
- `rooms = best = 0`, `e = 0`.
- For each start s: if `s >= ends[e]`, a room is freed (`e += 1`); else `rooms += 1`.
- `best = max(best, rooms)` (or simply return `rooms` at the end, since it never goes down).
**Complexity:** O(n log n) time, O(n) space.
**Edge cases to test:** empty list gives 0; `[[0,30],[5,10],[15,20]]` gives 2; `[[7,10],[2,4]]` gives 1; touching `[[1,5],[5,10]]` gives 1; all meetings at the same time `[[1,5],[1,5],[1,5]]` gives 3.

### Minimum Interval to Include Each Query (Hard)
**Restate:** For each query point q, return the size (right - left + 1) of the smallest interval that contains q, or -1 if none does.
**Hint 1:** Offline processing: sort both intervals and queries, then use a min-heap.
**Hint 2:** Process queries from small to large. Add every interval that has started (left <= q) to a heap keyed by size. Pop intervals from the top whose right end is less than q; they can never help again because later queries are even bigger.
**Hint 3:**
- Sort intervals by left; sort queries but remember their original index.
- For each query q in sorted order: push `(size, right)` for every interval with `left <= q`.
- Pop from the heap while the top has `right < q`.
- The answer for q is the top's size, or -1 if the heap is empty.
- Write answers back in the original query order.
**Complexity:** O(n log n + q log q) time, O(n + q) space.
**Edge cases to test:** `[[1,4],[2,4],[3,6],[4,4]]` with queries `[2,3,4,5]` gives `[3,3,1,4]`; a query outside every interval gives -1; duplicate queries `[3, 3]`; a point interval `[5,5]` with query 5 gives 1; queries given in unsorted order (answers must match the input order).

## More quiz

1. Which sort order fits "remove the fewest intervals so the rest do not overlap"?
   - A. By start
   - B. By end
   - C. By length
   - D. By input order
2. In Meeting Rooms, do `[1, 5]` and `[5, 8]` clash?
   - A. Yes
   - B. No, one ends exactly when the other starts
   - C. Only if they are in different rooms
   - D. It depends on the order
3. Why does Insert Interval not need sorting?
   - A. The new interval is always first
   - B. The input list is already sorted and non-overlapping
   - C. Sorting is done by Python automatically
   - D. It does need sorting
4. In Minimum Interval to Include Each Query, why is it safe to pop an interval whose right end is less than q?
   - A. It is the biggest interval
   - B. Queries are processed in increasing order, so no later query can be inside it
   - C. The heap is full
   - D. It is not safe
5. Which pattern fits "the maximum number of people in a building at the same time, given entry and exit times"?
   - A. Binary search
   - B. Sort starts and ends and sweep (same as Meeting Rooms II)
   - C. Backtracking
   - D. Trie

## Answer key

1. **B** - Keeping the interval that finishes first leaves the most space for the others.
2. **B** - The usual rule is that touching intervals do not overlap. Always confirm this with the interviewer, because it changes the `<` vs `<=` check.
3. **B** - Because the list is sorted, one left-to-right pass can find the left part, the overlapping part and the right part.
4. **B** - Queries only get bigger, so an interval that already ended before q will also have ended before every later query.
5. **B** - Peak people at once is the same as peak rooms in use. A sweep over sorted start and end times finds it.

## Flashcards

- **Q:** When do two intervals overlap after sorting by start? — **A:** When the next start is less than (or, by problem rules, equal to) the previous end.
- **Q:** What are the three phases of Insert Interval? — **A:** Copy the left part, merge the overlapping part, copy the right part.
- **Q:** In Merge Intervals, why use max for the new end? — **A:** The next interval may be completely inside the current one.
- **Q:** Non Overlapping Intervals answer formula? — **A:** n minus the number of intervals you can keep when sorted by end.
- **Q:** Two ways to solve Meeting Rooms II? — **A:** A min-heap of end times, or two sorted arrays (starts and ends) with two pointers.
- **Q:** What is the size of interval [3, 6] in Minimum Interval to Include Each Query? — **A:** 6 - 3 + 1 = 4.
- **Q:** What does "offline processing" mean for queries? — **A:** Sort the queries first and answer them in sorted order, then put answers back in original order.
- **Q:** What key does the heap use in Minimum Interval to Include Each Query? — **A:** The interval size, with the right end stored to remove old intervals.
- **Q:** Most important tester question for any interval problem? — **A:** Do touching intervals like [1, 5] and [5, 8] count as overlapping?
- **Q:** Time complexity of most interval problems? — **A:** O(n log n), because sorting is the main cost.

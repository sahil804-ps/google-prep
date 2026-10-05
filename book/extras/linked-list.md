## Problem hints

Try each problem on your own first. Open one hint at a time. Only go to the next hint when you are stuck for 10 or more minutes.

### Reverse Linked List (Easy)

**Restate:** Reverse a singly linked list and return the new head.

**Hint 1:** Walk the list once with three references: `prev`, `curr` and `nxt`.

**Hint 2:** At every node, save the next node first, then point the current node backwards to `prev`. If you change `curr.next` before saving it, you lose the rest of the list.

**Hint 3:**
- Set `prev = None`, `curr = head`.
- While `curr`: save `nxt = curr.next`.
- Set `curr.next = prev`.
- Move forward: `prev = curr`, `curr = nxt`.
- Return `prev`.

**Complexity:** O(n) time, O(1) space (the recursive version uses O(n) stack space).

**Edge cases to test:**
- Empty list `[]` (return None)
- One node `[1]`
- Two nodes `[1, 2]` (answer `[2, 1]`)
- `[1, 2, 3, 4, 5]`
- A list with duplicate values `[1, 1, 2]` (values do not matter, only links)

### Merge Two Sorted Lists (Easy)

**Restate:** Merge two sorted linked lists into one sorted linked list by relinking their nodes.

**Hint 1:** Use a dummy head node and a `tail` pointer.

**Hint 2:** Always attach the smaller of the two current nodes to `tail`. When one list runs out, attach the whole rest of the other list in one step.

**Hint 3:**
- Create `dummy` and set `tail = dummy`.
- While both lists have nodes: attach the smaller node to `tail.next`, move that list forward, move `tail` forward.
- Attach whichever list is not empty: `tail.next = a or b`.
- Return `dummy.next`.

**Complexity:** O(m + n) time, O(1) space.

**Edge cases to test:**
- Both empty (answer empty)
- One empty, one `[0]`
- `[1, 2, 4]` and `[1, 3, 4]` (equal values, answer `[1, 1, 2, 3, 4, 4]`)
- `[5]` and `[1, 2, 3]` (all of one list is smaller)
- Negative values `[-3, 0]` and `[-2]`

### Linked List Cycle (Easy)

**Restate:** Return True if following `next` pointers from the head ever reaches a node you have already visited.

**Hint 1:** Fast and slow pointers (Floyd's cycle detection), or a hash set of visited nodes.

**Hint 2:** The fast pointer moves 2 steps and the slow pointer moves 1 step. If there is a loop, the fast one gains one step per move and must catch the slow one. If there is no loop, fast reaches `None`.

**Hint 3:**
- Set `slow = fast = head`.
- While `fast` and `fast.next`: `slow = slow.next`, `fast = fast.next.next`.
- If `slow is fast`, return True.
- After the loop, return False.

**Complexity:** O(n) time, O(1) space.

**Edge cases to test:**
- Empty list
- One node with no cycle
- One node pointing to itself (True)
- Two nodes where the tail points to the head (True)
- A long list where the tail points to a middle node (True)

### Reorder List (Medium)

**Restate:** Rearrange the list `L0 -> L1 -> ... -> Ln` into `L0 -> Ln -> L1 -> Ln-1 -> ...` in place.

**Hint 1:** Break it into three smaller problems you already know: find the middle, reverse a list, merge two lists.

**Hint 2:** Find the middle with slow and fast pointers, cut the list there, reverse the second half, then weave the two halves together one node from each.

**Hint 3:**
- Find the middle with slow/fast pointers.
- Set `second = slow.next` and cut with `slow.next = None`.
- Reverse `second`.
- Merge alternately: take one node from the first half, then one from the reversed second half, until the second half is empty.

**Complexity:** O(n) time, O(1) space.

**Edge cases to test:**
- One node `[1]`
- Two nodes `[1, 2]` (unchanged)
- `[1, 2, 3, 4]` (answer `[1, 4, 2, 3]`)
- `[1, 2, 3, 4, 5]` (answer `[1, 5, 2, 4, 3]`)
- Check that the last node's `next` is None (no accidental cycle)

### Remove Nth Node From End of List (Medium)

**Restate:** Delete the n-th node counting from the end of the list and return the head.

**Hint 1:** Two pointers with a fixed gap, plus a dummy node before the head.

**Hint 2:** If `fast` is n steps ahead of `slow`, then when `fast` reaches the last node, `slow` sits just before the node to delete. The dummy node handles the case where the head itself is removed.

**Hint 3:**
- Create `dummy` with `dummy.next = head`; set `slow = fast = dummy`.
- Move `fast` forward n steps.
- Move both forward until `fast.next` is None.
- Remove with `slow.next = slow.next.next`.
- Return `dummy.next`.

**Complexity:** O(length) time in one pass, O(1) space.

**Edge cases to test:**
- `[1], n = 1` (answer empty)
- `[1, 2], n = 2` (remove the head, answer `[2]`)
- `[1, 2], n = 1` (remove the tail, answer `[1]`)
- `[1, 2, 3, 4, 5], n = 2` (answer `[1, 2, 3, 5]`)
- n equal to the list length on a long list

### Copy List With Random Pointer (Medium)

**Restate:** Each node has a `next` pointer and a `random` pointer (to any node or None); build a deep copy where all pointers point to the new nodes.

**Hint 1:** Use a hash map from each old node to its new copy.

**Hint 2:** Do two passes. In pass 1, create every copy node (values only) and store `old -> new`. In pass 2, set `new.next = map[old.next]` and `new.random = map[old.random]`. Map `None` to `None` so you do not need special checks.

**Hint 3:**
- Create `copy = {None: None}`.
- Pass 1: for each old node, `copy[old] = Node(old.val)`.
- Pass 2: for each old node, set `copy[old].next = copy[old.next]` and `copy[old].random = copy[old.random]`.
- Return `copy[head]`.

**Complexity:** O(n) time, O(n) space. (An interleaving trick gives O(1) extra space; mention it as a follow-up.)

**Edge cases to test:**
- Empty list
- One node whose random points to itself
- All random pointers are None
- Two nodes with random pointers crossing (1 -> 2, 2 -> 1)
- Check the copy shares no node with the original (identity check, not just values)

### Add Two Numbers (Medium)

**Restate:** Two numbers are stored as linked lists with digits in reverse order (ones digit first); return their sum as a linked list in the same format.

**Hint 1:** Do school addition digit by digit, with a carry. Use a dummy head for the result.

**Hint 2:** Keep looping while either list has nodes **or** the carry is not zero. That last condition creates the extra digit for cases like 5 + 5 = 10.

**Hint 3:**
- Set `carry = 0`, `dummy`, `tail = dummy`.
- While `l1` or `l2` or `carry`: take `v1`, `v2` (0 if the list ended).
- `total = v1 + v2 + carry`; `carry = total // 10`.
- Append a node with `total % 10`; move the pointers forward.
- Return `dummy.next`.

**Complexity:** O(max(m, n)) time, O(max(m, n)) space for the output.

**Edge cases to test:**
- `[0]` and `[0]` (answer `[0]`)
- `[5]` and `[5]` (answer `[0, 1]`, extra carry digit)
- `[9, 9, 9, 9]` and `[9, 9]` (different lengths with long carry, answer `[8, 9, 0, 0, 1]`)
- `[2, 4, 3]` and `[5, 6, 4]` (answer `[7, 0, 8]`)
- `[1]` and `[9, 9]` (answer `[0, 0, 1]`)

### Find The Duplicate Number (Medium)

**Restate:** An array of n + 1 integers holds values from 1 to n, with exactly one value repeated (possibly many times); find it without changing the array and with O(1) extra space.

**Hint 1:** This is a linked list problem in disguise. Treat each index as a node and `nums[i]` as its `next` pointer.

**Hint 2:** Because two indexes point to the same value, this "list" has a cycle, and the duplicate is the start of the cycle. Use Floyd's algorithm: first find a meeting point, then start a second pointer from the beginning; where they meet is the cycle start.

**Hint 3:**
- Set `slow = fast = 0`.
- Loop: `slow = nums[slow]`, `fast = nums[nums[fast]]`, until `slow == fast`.
- Set `slow2 = 0`.
- Loop: `slow = nums[slow]`, `slow2 = nums[slow2]`, until they are equal.
- Return that value.

**Complexity:** O(n) time, O(1) space.

**Edge cases to test:**
- `[1, 1]` (smallest case, answer 1)
- `[1, 3, 4, 2, 2]` (answer 2)
- `[3, 1, 3, 4, 2]` (answer 3)
- `[2, 2, 2, 2, 2]` (repeated many times, answer 2)
- Duplicate equal to n, for example `[1, 4, 4, 2, 3]` (answer 4)

### LRU Cache (Medium)

**Restate:** Design a cache with a fixed capacity where `get` and `put` run in O(1), and when it is full, `put` removes the least recently used key.

**Hint 1:** Combine a hash map with a doubly linked list.

**Hint 2:** The map gives `key -> node` in O(1). The doubly linked list keeps usage order: most recent near one end, least recent near the other. Dummy `head` and `tail` nodes remove all the "empty list" special cases. Every `get` or `put` moves the node to the "most recent" end.

**Hint 3:**
- Write two helpers: `remove(node)` and `add_to_front(node)`.
- `get(key)`: if missing, return -1; else remove the node, add it to the front, return its value.
- `put(key, value)`: if the key exists, remove its old node.
- Create a new node, add it to the front, store it in the map.
- If the size is over capacity, remove the node just before `tail` and delete its key from the map.

**Complexity:** O(1) time per operation, O(capacity) space.

**Edge cases to test:**
- Capacity 1: put(1,1), put(2,2), get(1) (answer -1)
- put(1,1), put(2,2), get(1), put(3,3), get(2) (2 was evicted, answer -1; 1 was kept because get made it recent)
- put on an existing key updates the value and makes it most recent
- put on an existing key when the cache is full must NOT evict anything
- get on a key that was never added (answer -1)

### Merge K Sorted Lists (Hard)

**Restate:** Merge k sorted linked lists into one sorted linked list.

**Hint 1:** Use a min-heap of the current head of each list, or merge the lists in pairs.

**Hint 2:** With a heap, the smallest of all k fronts is always on top. Pop it, attach it, and push that node's next. Push tuples `(val, index, node)`, because Python cannot compare two `ListNode` objects when values tie.

**Hint 3:**
- Push `(head.val, i, head)` for every non-empty list.
- Create `dummy` and `tail`.
- While the heap is not empty: pop the smallest, attach it to `tail`, move `tail`.
- If the popped node has a `next`, push `(next.val, i, next)`.
- Return `dummy.next`.

**Complexity:** O(N log k) time, where N = total nodes; O(k) space for the heap. (Pairwise merging is also O(N log k).)

**Edge cases to test:**
- `[]` (no lists)
- `[[]]` (one empty list)
- `[[], [1]]`
- `[[1, 4, 5], [1, 3, 4], [2, 6]]` (answer `[1, 1, 2, 3, 4, 4, 5, 6]`)
- Many lists with equal values (tests the tie-breaker)

### Reverse Nodes In K Group (Hard)

**Restate:** Reverse the nodes of the list k at a time; if fewer than k nodes remain at the end, leave them as they are.

**Hint 1:** Dummy node, plus a helper that finds the k-th node ahead.

**Hint 2:** Before reversing a group, check that k nodes exist. Then reverse exactly those k nodes and reconnect: the node before the group must point to the new group head, and the old group head (now the group tail) must point to the next group.

**Hint 3:**
- Create `dummy` before head; set `group_prev = dummy`.
- Find `kth`, the k-th node after `group_prev`; if it does not exist, stop.
- Save `group_next = kth.next`.
- Reverse the nodes from `group_prev.next` up to `kth`, with `prev` starting as `group_next`.
- Connect: `old_first = group_prev.next`; `group_prev.next = kth`; `group_prev = old_first`. Repeat.

**Complexity:** O(n) time, O(1) space.

**Edge cases to test:**
- `k = 1` (list unchanged)
- `[1, 2, 3, 4, 5], k = 2` (answer `[2, 1, 4, 3, 5]`)
- `[1, 2, 3, 4, 5], k = 3` (answer `[3, 2, 1, 4, 5]`)
- k equal to the list length (whole list reversed)
- `[1, 2, 3, 4, 5, 6], k = 3` (exact multiple, answer `[3, 2, 1, 6, 5, 4]`)

## More quiz

1. In LRU Cache, why is the linked list doubly linked and not singly linked?
   - A. To use less memory
   - B. To remove a node from the middle in O(1), you need its previous node, which a singly linked list does not give you
   - C. To make get faster than O(1)
   - D. Python requires it

2. Find the Duplicate Number is solved with Floyd's algorithm. What plays the role of the `next` pointer?
   - A. `i + 1`
   - B. `nums[i]`, the value at index i
   - C. `nums[i] - 1`
   - D. The sorted order

3. Which pattern fits "check if a linked list is a palindrome in O(1) space"?
   - A. Copy the values into a list
   - B. Find the middle with slow/fast, reverse the second half, compare the halves
   - C. Use a min-heap
   - D. Binary search

4. In Add Two Numbers, `[9, 9]` + `[1]` gives what list?
   - A. `[0, 0, 1]`
   - B. `[1, 0, 0]`
   - C. `[0, 1]`
   - D. `[10, 9]`

5. In Remove Nth Node From End, why start both pointers at a dummy node?
   - A. To make the loop shorter
   - B. So that removing the head works with the same code as removing any other node
   - C. To avoid recursion
   - D. Because n can be zero

## Answer key

1. **B** - To unlink a node in O(1), you set `prev.next = node.next` and `next.prev = node.prev`. Only a doubly linked node knows its previous node directly.
2. **B** - Index i "points to" index `nums[i]`. Two indexes point to the duplicate value, so the path enters a cycle whose start is the duplicate.
3. **B** - Reversing the second half in place lets you compare from both ends without extra memory. A good tester also restores the list afterwards if the caller expects it unchanged.
4. **A** - 99 + 1 = 100, which in reverse digit order is `[0, 0, 1]`. The loop must continue while a carry is left.
5. **B** - When n equals the list length, the node to remove is the head. With a dummy, `slow` stops at the dummy and `slow.next = slow.next.next` removes the head with no special case.

## Flashcards

- **Q:** Reverse Linked List: what must you save before changing `curr.next`? — **A:** The next node (`nxt = curr.next`), or the rest of the list is lost.
- **Q:** Merge Two Sorted Lists: how do you finish when one list runs out? — **A:** Attach the remaining list in one step: `tail.next = a or b`.
- **Q:** Reorder List: which three known sub-problems does it combine? — **A:** Find the middle, reverse the second half, merge the two halves alternately.
- **Q:** Remove Nth from End: how far ahead does `fast` start? — **A:** n steps ahead of `slow`, both starting from the dummy node.
- **Q:** Copy List with Random Pointer: why put `None: None` in the map? — **A:** So `copy[old.next]` and `copy[old.random]` work even when the pointer is None.
- **Q:** Add Two Numbers: loop condition? — **A:** While `l1` or `l2` or `carry` is non-zero.
- **Q:** Find the Duplicate Number: second phase of Floyd's algorithm? — **A:** Start a new pointer at 0; move it and the slow pointer one step at a time; they meet at the duplicate.
- **Q:** LRU Cache: which two data structures? — **A:** A hash map (key to node) and a doubly linked list (usage order) with dummy head and tail.
- **Q:** Merge K Sorted Lists: why add an index to the heap tuple? — **A:** On equal values, Python would compare ListNode objects and raise TypeError; the index breaks ties.
- **Q:** Reverse Nodes in k-Group: what happens to a last group with fewer than k nodes? — **A:** It is left in its original order.

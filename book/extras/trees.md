## Problem hints

Try each problem on your own first. Open one hint at a time. Only go to the next hint when you are stuck for 10 or more minutes.

### Invert Binary Tree (Easy)

**Restate:** Swap the left and right child of every node (make a mirror image of the tree) and return the root.

**Hint 1:** DFS recursion (or BFS with a queue). Every node needs the same small action.

**Hint 2:** At each node, swap its two children, then invert each child subtree. The base case is an empty node, which you return as it is.

**Hint 3:**
- If `root` is None, return None.
- Swap `root.left` and `root.right`.
- Invert `root.left` recursively.
- Invert `root.right` recursively.
- Return `root`.

**Complexity:** O(n) time, O(h) space for recursion, where h is the tree height.

**Edge cases to test:**
- Empty tree (return None)
- One node
- `[2, 1, 3]` (answer `[2, 3, 1]`)
- A left-skewed tree (becomes right-skewed)
- `[4, 2, 7, 1, 3, 6, 9]` (answer `[4, 7, 2, 9, 6, 3, 1]`)

### Maximum Depth of Binary Tree (Easy)

**Restate:** Return the number of nodes on the longest path from the root down to a leaf.

**Hint 1:** DFS that returns a value up to the parent.

**Hint 2:** The depth of a node is 1 plus the larger depth of its two children. An empty tree has depth 0.

**Hint 3:**
- If `root` is None, return 0.
- Get the depth of the left subtree.
- Get the depth of the right subtree.
- Return `1 + max(left, right)`.

**Complexity:** O(n) time, O(h) space. (BFS counting levels also works.)

**Edge cases to test:**
- Empty tree (answer 0)
- One node (answer 1)
- `[1, null, 2]` (answer 2)
- `[3, 9, 20, null, null, 15, 7]` (answer 3)
- A skewed tree of 10,000 nodes (recursion depth: Python's default limit is about 1000, so an iterative version may be needed)

### Diameter of Binary Tree (Easy)

**Restate:** Return the number of edges on the longest path between any two nodes (the path may skip the root).

**Hint 1:** DFS that returns height, while updating a global "best" answer.

**Hint 2:** The longest path through a node uses its left height plus its right height. Every node is a possible "top" of the path, so check this sum at every node, but return only `1 + max(left, right)` to the parent.

**Hint 3:**
- Keep `best = 0` outside the helper.
- Helper `height(node)`: if None, return 0.
- Compute `left = height(node.left)`, `right = height(node.right)`.
- Update `best = max(best, left + right)`.
- Return `1 + max(left, right)`. The answer is `best`.

**Complexity:** O(n) time, O(h) space.

**Edge cases to test:**
- One node (answer 0)
- `[1, 2]` (answer 1)
- `[1, 2, 3, 4, 5]` (answer 3)
- A tree where the longest path does not pass through the root (a deep left subtree with two long branches)
- A skewed tree of 5 nodes (answer 4)

### Balanced Binary Tree (Easy)

**Restate:** Return True if, for every node, the heights of its left and right subtrees differ by at most 1.

**Hint 1:** DFS that returns height, bottom-up.

**Hint 2:** Checking height separately at each node gives O(n^2). Instead, let the helper return the height, or a special value like -1 meaning "already unbalanced", so each node is visited once.

**Hint 3:**
- Helper `check(node)`: if None, return 0.
- Get `left = check(node.left)`; if -1, return -1.
- Get `right = check(node.right)`; if -1, return -1.
- If `abs(left - right) > 1`, return -1.
- Return `1 + max(left, right)`. The tree is balanced if the result is not -1.

**Complexity:** O(n) time, O(h) space.

**Edge cases to test:**
- Empty tree (True)
- `[3, 9, 20, null, null, 15, 7]` (True)
- `[1, 2, 2, 3, 3, null, null, 4, 4]` (False)
- A root with balanced height difference, but an unbalanced deeper node (False; tests that every node is checked)
- `[1, null, 2, null, 3]` (skewed, False)

### Same Tree (Easy)

**Restate:** Return True if two binary trees have the same shape and the same values in every position.

**Hint 1:** DFS on both trees at the same time.

**Hint 2:** Two trees are the same when both roots are None, or both exist with equal values and both pairs of children are the same.

**Hint 3:**
- If both nodes are None, return True.
- If only one is None, or the values differ, return False.
- Return `same(p.left, q.left) and same(p.right, q.right)`.

**Complexity:** O(n) time, O(h) space.

**Edge cases to test:**
- Both empty (True)
- One empty, one not (False)
- `[1, 2]` and `[1, null, 2]` (same values, different shape, False)
- `[1, 2, 1]` and `[1, 1, 2]` (False)
- Two identical large trees (True)

### Subtree of Another Tree (Easy)

**Restate:** Return True if `subRoot` appears inside `root` as a full subtree (a node plus all of its descendants).

**Hint 1:** Reuse "Same Tree" as a helper.

**Hint 2:** Visit every node in `root`. At each node, ask "is the tree starting here the same as `subRoot`?" If any answer is yes, return True.

**Hint 3:**
- If `subRoot` is None, return True.
- If `root` is None, return False.
- If `same(root, subRoot)`, return True.
- Return `isSubtree(root.left, subRoot) or isSubtree(root.right, subRoot)`.

**Complexity:** O(m * n) time in the worst case, O(h) space. (Serializing both trees and using string matching can reach O(m + n).)

**Edge cases to test:**
- `root = [3, 4, 5, 1, 2], subRoot = [4, 1, 2]` (True)
- `root = [3, 4, 5, 1, 2, null, null, null, null, 0], subRoot = [4, 1, 2]` (False, the node 2 has an extra child)
- `subRoot` equal to the whole `root` (True)
- `root = [1, 1], subRoot = [1]` (True, matches the leaf)
- Single node trees with different values (False)

### Lowest Common Ancestor of a Binary Search Tree (Medium)

**Restate:** In a binary search tree, return the lowest node that has both given nodes `p` and `q` in its subtree (a node counts as its own descendant).

**Hint 1:** Use the BST property: left values are smaller, right values are bigger.

**Hint 2:** Start at the root. If both `p` and `q` are smaller, the answer is on the left. If both are bigger, it is on the right. Otherwise, they split here (or one of them is this node), so this node is the answer.

**Hint 3:**
- Set `node = root`.
- While True: if `p.val < node.val` and `q.val < node.val`, go left.
- Else if `p.val > node.val` and `q.val > node.val`, go right.
- Else return `node`.

**Complexity:** O(h) time, O(1) space for the loop version.

**Edge cases to test:**
- `p` is the root (answer is the root)
- `p` is an ancestor of `q` (answer is `p`)
- `p` and `q` in different subtrees of the root (answer is the root)
- `p` and `q` both deep in the left subtree
- A two-node tree `[2, 1]` with `p = 2, q = 1` (answer 2)

### Binary Tree Level Order Traversal (Medium)

**Restate:** Return the node values level by level, from top to bottom and left to right within each level.

**Hint 1:** BFS with a queue (`collections.deque`).

**Hint 2:** At the start of each level, the queue holds exactly the nodes of that level. Record the queue length, pop exactly that many nodes, and push their children for the next level.

**Hint 3:**
- If `root` is None, return `[]`.
- Put `root` in the queue.
- While the queue is not empty: `size = len(queue)`; create `level = []`.
- Pop `size` nodes, add each value to `level`, push their non-null children.
- Append `level` to the result.

**Complexity:** O(n) time, O(w) space, where w is the maximum width of the tree (up to about n / 2).

**Edge cases to test:**
- Empty tree (answer `[]`)
- One node (answer `[[1]]`)
- `[3, 9, 20, null, null, 15, 7]` (answer `[[3], [9, 20], [15, 7]]`)
- A skewed tree (one value per level)
- A full tree with 7 nodes (levels of size 1, 2, 4)

### Binary Tree Right Side View (Medium)

**Restate:** Imagine you stand on the right side of the tree; return the values you can see, from top to bottom.

**Hint 1:** BFS level by level (or DFS that visits the right child first).

**Hint 2:** The visible node of each level is the last node of that level in left-to-right order. It is not always in the right subtree: if the right side is shorter, a left node can be visible.

**Hint 3:**
- Do level order BFS as usual.
- For each level, after popping all `size` nodes, append the value of the last node popped.
- Or with DFS (right child first): pass the depth; if `depth == len(result)`, this is the first node seen at that depth, so append it.

**Complexity:** O(n) time, O(w) space for BFS or O(h) for DFS.

**Edge cases to test:**
- Empty tree (answer `[]`)
- `[1, 2, 3, null, 5, null, 4]` (answer `[1, 3, 4]`)
- `[1, 2, 3, 4]` (left side deeper, answer `[1, 3, 4]`)
- Only left children `[1, 2, null, 3]` (answer `[1, 2, 3]`)
- One node

### Count Good Nodes In Binary Tree (Medium)

**Restate:** A node is "good" if no node on the path from the root to it has a bigger value; return how many good nodes the tree has.

**Hint 1:** DFS that passes information **down**: the maximum value seen on the path so far.

**Hint 2:** At each node, compare its value with the path maximum. If it is greater than or equal, it is good. Then pass `max(path_max, node.val)` to both children.

**Hint 3:**
- Helper `dfs(node, path_max)`: if None, return 0.
- `good = 1 if node.val >= path_max else 0`.
- `new_max = max(path_max, node.val)`.
- Return `good + dfs(node.left, new_max) + dfs(node.right, new_max)`.
- Start with `dfs(root, root.val)`.

**Complexity:** O(n) time, O(h) space.

**Edge cases to test:**
- One node (answer 1; the root is always good)
- `[3, 1, 4, 3, null, 1, 5]` (answer 4)
- `[3, 3, null, 4, 2]` (equal values count as good, answer 3)
- All values equal (every node is good)
- Negative values, for example `[-1, -2, 0]` (answer 2)

### Validate Binary Search Tree (Medium)

**Restate:** Return True if the tree is a valid BST: every node in a left subtree is strictly smaller than the node, and every node in a right subtree is strictly bigger.

**Hint 1:** DFS that passes allowed bounds `(low, high)` down to each node.

**Hint 2:** Going left, the current value becomes the new upper bound. Going right, it becomes the new lower bound. Each node must lie strictly between its bounds. (Another way: an in-order traversal must produce strictly increasing values.)

**Hint 3:**
- Helper `valid(node, low, high)`: if None, return True.
- If not `low < node.val < high`, return False.
- Return `valid(node.left, low, node.val) and valid(node.right, node.val, high)`.
- Start with `valid(root, -inf, inf)`.

**Complexity:** O(n) time, O(h) space.

**Edge cases to test:**
- `[2, 1, 3]` (True)
- `[5, 1, 4, null, null, 3, 6]` (False)
- `[5, 4, 6, null, null, 3, 7]` (False: 3 is in the right subtree of 5; only bounds catch this)
- `[2, 2, 2]` (duplicates, False because the rule is strict)
- `[2147483647]` (the max int value; do not use the max int as your starting bound)

### Kth Smallest Element In a Bst (Medium)

**Restate:** Return the k-th smallest value (1-based) in a binary search tree.

**Hint 1:** In-order traversal of a BST visits values in sorted order.

**Hint 2:** Do an iterative in-order traversal with a stack and stop as soon as you have visited k nodes. You do not need to collect all values.

**Hint 3:**
- Set `stack = []`, `node = root`, `count = 0`.
- While `node` or `stack`: go left as far as possible, pushing every node.
- Pop a node; `count += 1`; if `count == k`, return its value.
- Move to `node = popped.right`.

**Complexity:** O(h + k) time, O(h) space.

**Edge cases to test:**
- One node, k = 1
- `[3, 1, 4, null, 2], k = 1` (answer 1)
- `[5, 3, 6, 2, 4, null, null, 1], k = 3` (answer 3)
- k equal to the number of nodes (the largest value)
- A right-skewed tree (in-order equals the path order)

### Construct Binary Tree From Preorder And Inorder Traversal (Medium)

**Restate:** Given the pre-order and in-order traversal lists of a tree with unique values, rebuild the tree.

**Hint 1:** Recursion. Pre-order tells you the root; in-order tells you which values are on the left and which are on the right.

**Hint 2:** The first pre-order value is the root. Find it in the in-order list: everything left of it is the left subtree, everything right is the right subtree. Store `value -> index` of the in-order list in a dict so the lookup is O(1), and use index ranges instead of slicing.

**Hint 3:**
- Build `pos = {value: index}` from `inorder`; keep a pointer `pre_i = 0` into `preorder`.
- Helper `build(lo, hi)` builds the tree for `inorder[lo..hi]`; if `lo > hi`, return None.
- Root value = `preorder[pre_i]`; `pre_i += 1`; `mid = pos[root value]`.
- Build the left child with `build(lo, mid - 1)` **first**, then the right with `build(mid + 1, hi)`.
- Return the root.

**Complexity:** O(n) time with the dict and index ranges, O(n) space. (Slicing lists makes it O(n^2).)

**Edge cases to test:**
- One value `[-1]` and `[-1]`
- `preorder = [3, 9, 20, 15, 7], inorder = [9, 3, 15, 20, 7]`
- A left-skewed tree: `preorder = [3, 2, 1], inorder = [1, 2, 3]`
- A right-skewed tree: `preorder = [1, 2, 3], inorder = [1, 2, 3]`
- Verify by computing the pre-order and in-order of your result and comparing

### Binary Tree Maximum Path Sum (Hard)

**Restate:** A path is any chain of connected nodes (each node used at most once, not required to pass the root); return the largest possible sum of node values on a path.

**Hint 1:** DFS that returns a value up and updates a global best, like Diameter.

**Hint 2:** Each node returns to its parent the best "one-arm" sum going down: `node.val + max(left_gain, right_gain)`. Negative gains are dropped (use `max(gain, 0)`). The best path that turns at this node is `node.val + left_gain + right_gain`; compare that with the global best.

**Hint 3:**
- Keep `best = -inf`.
- Helper `gain(node)`: if None, return 0.
- `left = max(gain(node.left), 0)`, `right = max(gain(node.right), 0)`.
- Update `best = max(best, node.val + left + right)`.
- Return `node.val + max(left, right)`. The answer is `best`.

**Complexity:** O(n) time, O(h) space.

**Edge cases to test:**
- One node `[-3]` (answer -3, not 0; start `best` at minus infinity)
- `[1, 2, 3]` (answer 6)
- `[-10, 9, 20, null, null, 15, 7]` (answer 42)
- All negative `[-2, -1]` (answer -1)
- `[2, -1]` (answer 2; dropping the negative child)

### Serialize And Deserialize Binary Tree (Hard)

**Restate:** Design two functions: one turns a binary tree into a string, the other turns that string back into the exact same tree.

**Hint 1:** Pre-order DFS with a marker for empty children (for example `"N"`), separated by commas.

**Hint 2:** Writing the null markers makes the string unambiguous: the deserializer reads values in the same pre-order, and a `"N"` tells it "this child is empty, go back up". It works with a single pointer into the list of tokens.

**Hint 3:**
- Serialize: DFS; for None, write `"N"`; else write the value, then serialize left, then right; join with commas.
- Deserialize: split the string by commas; keep an index `i`.
- Helper `build()`: read token `i`, `i += 1`; if it is `"N"`, return None.
- Otherwise create the node, set `node.left = build()`, then `node.right = build()`, return it.

**Complexity:** O(n) time and O(n) space for both functions.

**Edge cases to test:**
- Empty tree (string like `"N"`, and it must come back as None)
- One node
- Negative and multi-digit values like `[-100, 25]` (do not parse digit by digit)
- A skewed tree of 1,000 nodes (recursion depth)
- Round trip check: `deserialize(serialize(t))` has the same structure as `t`

## More quiz

1. In Binary Tree Maximum Path Sum, why do you use `max(gain, 0)` for each child?
   - A. To avoid recursion errors
   - B. A negative branch only lowers the sum, so the path should skip it
   - C. To keep values positive for the heap
   - D. The problem says all values are positive

2. In Construct Binary Tree from Preorder and Inorder, why must you build the left subtree before the right one?
   - A. Python requires it
   - B. Pre-order lists the whole left subtree before the right subtree, so the pre-order pointer reaches left values first
   - C. In-order requires it
   - D. It does not matter

3. Which pattern fits "return the average value of the nodes on each level"?
   - A. BFS level order, summing each level
   - B. In-order DFS
   - C. Binary search
   - D. Two heaps

4. For Count Good Nodes, tree `[2, 1, 3]` (root 2, left 1, right 3). How many good nodes?
   - A. 1
   - B. 2
   - C. 3
   - D. 0

5. Why does Serialize and Deserialize write a marker for null children?
   - A. To make the string longer
   - B. Without markers, different trees can produce the same string, so the shape cannot be rebuilt
   - C. Null markers make it faster
   - D. JSON requires it

## Answer key

1. **B** - Adding a negative gain can only make the path worse. Taking 0 means "do not extend into that child".
2. **B** - Pre-order is root, then the full left subtree, then the full right subtree. A single shared pointer moves through the list in that exact order, so you must recurse left first.
3. **A** - This is "Average of Levels in Binary Tree". BFS gives each level as a group, so you add up the values and divide by the level size.
4. **B** - The root 2 is good. Node 1 is smaller than 2, so it is not good. Node 3 is at least 2, so it is good. That makes 2.
5. **B** - For example, the pre-order `[1, 2]` without markers could mean 2 is the left child or the right child. Markers fix the exact shape.

## Flashcards

- **Q:** Invert Binary Tree: action at each node? — **A:** Swap its left and right children, then invert both subtrees.
- **Q:** Diameter of Binary Tree: what does the helper return, and what does it update? — **A:** It returns height; it updates the best answer with `left_height + right_height`.
- **Q:** Balanced Binary Tree: how do you avoid O(n^2)? — **A:** Return height and -1 for "unbalanced" from one bottom-up DFS.
- **Q:** Subtree of Another Tree: which helper do you reuse? — **A:** Same Tree, called at every node of the main tree.
- **Q:** LCA in a BST: when is the current node the answer? — **A:** When p and q are not both smaller and not both bigger than it, meaning they split here or one equals it.
- **Q:** Level order BFS: how do you know where a level ends? — **A:** Record `len(queue)` at the start of the level and pop exactly that many nodes.
- **Q:** Validate BST: which test input catches the "only check children" bug? — **A:** `[5, 4, 6, null, null, 3, 7]`, where 3 is in the right subtree of 5.
- **Q:** Kth Smallest in a BST: which traversal, and when do you stop? — **A:** In-order traversal; stop when you have visited k nodes.
- **Q:** Max Path Sum: what do you return to the parent? — **A:** `node.val + max(left_gain, right_gain)`, a path with one arm only.
- **Q:** Max Path Sum test for initial value? — **A:** A single node `[-3]` must return -3, so `best` must start at minus infinity.

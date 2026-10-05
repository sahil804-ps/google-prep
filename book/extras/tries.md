## Problem hints

Try each problem on your own first. Open one hint at a time. Only go to the next hint when you are stuck for 10 or more minutes.

### Implement Trie Prefix Tree (Medium)

**Restate:** Build a Trie class with `insert(word)`, `search(word)` (is this exact word stored?) and `startsWith(prefix)` (is any stored word starting with this prefix?).

**Hint 1:** Each node holds a map of children (one per next letter) and a flag saying "a word ends here".

**Hint 2:** All three operations walk the same path from the root, one letter per step. The only difference: `search` needs the end flag on the last node, while `startsWith` only needs the path to exist. Write one shared "walk" helper.

**Hint 3:**
- Node: `children = {}`, `is_end = False`.
- `insert`: walk letter by letter, creating missing children; set `is_end = True` on the last node.
- `walk(s)`: follow letters; return None as soon as a letter is missing, else the last node.
- `search`: `node = walk(word)`; return `node is not None and node.is_end`.
- `startsWith`: return `walk(prefix) is not None`.

**Complexity:** O(L) time per operation, L = length of the word; O(total characters inserted) space.

**Edge cases to test:**
- `search("app")` after only `insert("apple")` (False) and `startsWith("app")` (True)
- `insert("app")` after `insert("apple")`, then `search("app")` (True)
- Insert the same word twice, then search it (True, no crash)
- `search` on an empty trie (False)
- A prefix longer than any stored word, like `startsWith("applesauce")` (False)

### Design Add And Search Words Data Structure (Medium)

**Restate:** Build a class with `addWord(word)` and `search(word)`, where the search pattern may contain `.` that matches any single letter.

**Hint 1:** A trie, plus DFS for the dots.

**Hint 2:** Normal letters follow one child, exactly like a trie. At a `.`, you do not know which letter it is, so try every child and return True if any branch succeeds. Pass the current index and current node into the DFS.

**Hint 3:**
- `addWord`: same as trie insert.
- `dfs(i, node)`: if `i == len(word)`, return `node.is_end`.
- If `word[i] == "."`: for each child, if `dfs(i + 1, child)` is True, return True; then return False.
- Else: if `word[i]` is not a child, return False; otherwise return `dfs(i + 1, node.children[word[i]])`.
- `search` returns `dfs(0, root)`.

**Complexity:** `addWord` O(L). `search` O(L) with no dots; worst case O(26^d * L) where d is the number of dots (bounded by the number of stored nodes). Space O(total characters).

**Edge cases to test:**
- `addWord("bad")`, then `search(".ad")` (True) and `search("b..")` (True)
- `search("...")` when only "bad" is stored (True) and `search("....")` (False, length matters)
- `search("ba")` after adding "bad" (False, no end flag)
- `search(".")` on an empty structure (False)
- A pattern that is all dots over many stored words (performance check)

### Word Search II (Hard)

**Restate:** Given a grid of letters and a list of words, return every word that can be traced in the grid by moving up, down, left or right, without using the same cell twice in one word.

**Hint 1:** Put all the words into a trie. Then run a DFS (backtracking) from every cell, walking the trie as you walk the grid.

**Hint 2:** Searching each word separately repeats a lot of work. With a trie, one DFS from a cell checks all words with that prefix at once, and stops immediately when the current path is not a prefix of any word. Store the full word at its end node so you can add it to the result directly, then clear it so it is not added twice.

**Hint 3:**
- Insert every word into a trie; at each end node store `node.word = word`.
- For each cell, call `dfs(r, c, root)`.
- In `dfs`: stop if out of bounds, already visited, or the letter is not a child of the current node.
- Move to the child; if `child.word` is set, add it to the result and set `child.word = None`.
- Mark the cell visited, DFS into the 4 neighbours, then unmark it (backtrack). Optional speed-up: remove trie nodes that have no children left.

**Complexity:** About O(rows * cols * 4 * 3^(L - 1)) in the worst case, where L is the longest word length; much faster in practice because of pruning. Space O(total characters of the words) for the trie.

**Edge cases to test:**
- A 1x1 grid `[["a"]]` with words `["a"]` (answer `["a"]`)
- Grid `[["a", "a"]]` with words `["aaa"]` (answer `[]`; a cell cannot be used twice)
- The same word appearing in two places in the grid (must be returned once)
- Words that share a prefix, like `["oath", "oat"]` (both found)
- Duplicate words in the input list (return each word once)

## More quiz

1. In Word Search II, why do you set `node.word = None` after finding a word?
   - A. To save memory
   - B. So the same word is not added to the result again when it is found by another path
   - C. Because the trie is read-only
   - D. To stop the DFS completely

2. In Add and Search Words, what does `search("b..")` need at the very end?
   - A. Only that the path exists
   - B. That the last node has `is_end = True`
   - C. That the node has no children
   - D. Nothing

3. Which pattern fits "replace each word in a sentence with its shortest root word from a dictionary"?
   - A. Trie: walk each word and stop at the first node with the end flag
   - B. Sliding window
   - C. Heap
   - D. Monotonic stack

4. You insert "car", "cart" and "care" into an empty trie. How many nodes are there, not counting the root?
   - A. 5
   - B. 6
   - C. 11
   - D. 4

5. Why is a trie better than a hash set for Word Search II?
   - A. A hash set cannot store strings
   - B. A trie can tell you during the DFS that no word starts with the current path, so you can stop early
   - C. A trie uses less memory in all cases
   - D. A hash set lookup is O(n)

## Answer key

1. **B** - A word can be traced in more than one place in the grid. Clearing the stored word after the first find makes the result unique without an extra set.
2. **B** - `search` is a full-word match, so the last node must be the end of a word. If only "badge" is stored, the path b-a-d exists, but "b.." must return False.
3. **A** - This is "Replace Words". For each word, walk the trie and return the first prefix that is marked as a word end.
4. **A** - The letters c, a, r are shared by all three words (3 nodes). "cart" adds one node for t, and "care" adds one node for e. That is 3 + 1 + 1 = 5.
5. **B** - With a set, you could only check full words or store every prefix separately. The trie gives prefix checks for free as you walk, which prunes dead paths.

## Flashcards

- **Q:** What two things does a trie node store? — **A:** A map of children (letter to node) and an end-of-word flag.
- **Q:** Difference between `search` and `startsWith`? — **A:** `search` needs the end flag on the last node; `startsWith` only needs the path to exist.
- **Q:** Time to insert a word of length L? — **A:** O(L), no matter how many words are stored.
- **Q:** Add and Search Words: what happens at a `.` character? — **A:** Try every child with DFS and return True if any branch matches.
- **Q:** Why does `search("....")` fail when only "bad" is stored? — **A:** The pattern has 4 characters, but the path ends after 3 letters.
- **Q:** Word Search II: why not run Word Search I for each word? — **A:** It repeats the grid DFS for every word; a trie shares one DFS across all words with the same prefix.
- **Q:** Word Search II: how is a cell marked as used? — **A:** Temporarily change it (for example to `"#"`) or add it to a visited set, then restore it after the DFS returns.
- **Q:** Word Search II: what test catches reuse of a cell? — **A:** Grid `[["a", "a"]]` with word `"aaa"` must return nothing.
- **Q:** Optional pruning in Word Search II? — **A:** Remove a trie node once it has no children and no word, so later DFS calls skip it.

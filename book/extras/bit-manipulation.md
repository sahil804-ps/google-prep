## Problem hints

### Single Number (Easy)
**Restate:** Every number in the list appears twice except one. Find that one, using O(1) extra space.
**Hint 1:** Use XOR (`^`).
**Hint 2:** XOR has three useful rules: `a ^ a = 0`, `a ^ 0 = a`, and the order does not matter. So when you XOR everything, all the pairs cancel out and only the single number is left.
**Hint 3:**
- Start `result = 0`.
- For each number: `result ^= number`.
- Return `result`.
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** one element `[1]` gives 1; `[2, 2, 1]` gives 1; `[4, 1, 2, 1, 2]` gives 4; negative numbers `[-1, -1, -2]` gives -2; the single number is 0, like `[0, 3, 3]`.

### Number of 1 Bits (Easy)
**Restate:** Given a non-negative integer, return how many 1 bits its binary form has (this count is also called the Hamming weight).
**Hint 1:** Check bits one by one with `& 1` and right shift, or use the `n & (n - 1)` trick from the lesson.
**Hint 2:** With the shift method, the last bit is `n & 1`. Shifting right by 1 (`n >>= 1`) moves the next bit into the last place. The trick method instead loops only once per 1 bit.
**Hint 3:** (shift version)
- `count = 0`.
- While n > 0: `count += n & 1`, then `n >>= 1`.
- Return `count`.
- In Java or C++, use an unsigned shift (`>>>` in Java), or a fixed 32-step loop, so negative inputs do not loop forever.
**Complexity:** O(32) = O(1) time, O(1) space.
**Edge cases to test:** `0` gives 0; `11` (1011) gives 3; `128` (10000000) gives 1; `2147483647` gives 31; `4294967293` (32-bit 1111...1101) gives 31.

### Counting Bits (Easy)
**Restate:** For every number i from 0 to n, return how many 1 bits i has, as a list.
**Hint 1:** DP that reuses answers for smaller numbers.
**Hint 2:** The lesson uses `ans[i >> 1] + (i & 1)`. Another formula: `i & (i - 1)` removes the lowest 1 bit of i, giving a smaller number with exactly one fewer 1 bit.
**Hint 3:** (lowest-bit version)
- `ans = [0] * (n + 1)`.
- For i from 1 to n: `ans[i] = ans[i & (i - 1)] + 1`.
- Return `ans`.
**Complexity:** O(n) time, O(n) space for the output (O(1) extra).
**Edge cases to test:** `n = 0` gives `[0]`; `n = 2` gives `[0, 1, 1]`; `n = 5` gives `[0, 1, 1, 2, 1, 2]`; `n = 8` (8 has one bit, 7 has three); large n like 100000 (speed).

### Reverse Bits (Easy)
**Restate:** Reverse the order of the 32 bits of an unsigned 32-bit integer and return the new number.
**Hint 1:** Build the answer bit by bit with shifts.
**Hint 2:** Always do exactly 32 steps, even if n becomes 0 early. Leading zeros of n become trailing zeros of the answer, and the answer's top bits must be filled correctly.
**Hint 3:**
- `result = 0`.
- Repeat 32 times: `result = (result << 1) | (n & 1)`, then `n >>= 1`.
- Return `result`.
**Complexity:** O(32) = O(1) time, O(1) space.
**Edge cases to test:** `0` gives 0; `1` gives 2147483648 (only the top bit set); `43261596` gives 964176192; all ones `4294967295` stays the same; `2147483648` gives 1.

### Missing Number (Easy)
**Restate:** The list has n distinct numbers from the range 0 to n, so exactly one number is missing. Find it.
**Hint 1:** XOR, or the sum formula.
**Hint 2:** XOR all indexes 0..n with all values. Every present number appears twice (once as index, once as value) and cancels. Only the missing number is left. (Sum method: `n * (n + 1) / 2 - sum(nums)`.)
**Hint 3:**
- Start `result = n` (the index that has no matching position).
- For each index i: `result ^= i ^ nums[i]`.
- Return `result`.
**Complexity:** O(n) time, O(1) space.
**Edge cases to test:** `[0]` gives 1; `[1]` gives 0; `[3, 0, 1]` gives 2; `[0, 1]` gives 2 (the last number is missing); `[9,6,4,2,3,5,7,0,1]` gives 8.

### Sum of Two Integers (Medium)
**Restate:** Add two integers without using `+` or `-`.
**Hint 1:** XOR adds bits without carry; AND finds where a carry happens. (See the lesson's worked example.)
**Hint 2:** Repeat: `sum = a ^ b`, `carry = (a & b) << 1`, until carry is 0. In Python, numbers have no fixed size, so you must keep everything inside 32 bits with a mask `0xFFFFFFFF`, and convert back to a negative number at the end if the top bit is set.
**Hint 3:**
- `mask = 0xFFFFFFFF`.
- While `b != 0`: `a, b = (a ^ b) & mask, ((a & b) << 1) & mask`.
- If `a <= 0x7FFFFFFF`, return `a`.
- Else return `~(a ^ mask)` (turns it back into a negative Python int).
**Complexity:** O(32) = O(1) time, O(1) space.
**Edge cases to test:** `1, 2` gives 3; `-1, 1` gives 0 (infinite loop without the mask in Python); `-2, -3` gives -5; `0, 0` gives 0; `-1000, 1000` gives 0.

### Reverse Integer (Medium)
**Restate:** Reverse the digits of a signed 32-bit integer. If the result does not fit in 32 bits, return 0.
**Hint 1:** Pop digits with `% 10` and push them with `* 10`.
**Hint 2:** Handle the sign separately (work on the absolute value in Python, because `%` with negative numbers behaves differently from C++ and Java). Check for overflow BEFORE pushing a digit, as if you could not store a 64-bit number.
**Hint 3:**
- `sign = -1 if x < 0 else 1`, `x = abs(x)`, `res = 0`.
- While x > 0: `digit = x % 10`, `x //= 10`.
- If `res > (2^31 - 1) // 10`, or it is equal and the digit is too big, return 0.
- `res = res * 10 + digit`.
- Return `sign * res` (check the negative limit -2^31 too).
**Complexity:** O(log x) time (number of digits), O(1) space.
**Edge cases to test:** `123` gives 321; `-123` gives -321; `120` gives 21 (trailing zero dropped); `0` gives 0; `1534236469` gives 0 (overflow); `-2147483648` gives 0.

## More quiz

1. What is `5 ^ 3` (XOR)?
   - A. 8
   - B. 6
   - C. 2
   - D. 15
2. Which pattern fits "every number appears three times except one; find it"?
   - A. Plain XOR of all numbers
   - B. Count each of the 32 bit positions modulo 3
   - C. Sorting with binary search only
   - D. A min-heap
3. Why must Reverse Bits always run exactly 32 steps?
   - A. To be slower
   - B. Leading zeros of the input become trailing zeros of the output and must be shifted in
   - C. Because n is always odd
   - D. It does not need to
4. In Missing Number, why does `result` start at n instead of 0?
   - A. To avoid a negative answer
   - B. Indexes go only up to n - 1, so n must be added once to complete the range 0..n
   - C. Because n is always missing
   - D. It is a random choice
5. In Python, what goes wrong in Sum of Two Integers without a mask when `a = -1, b = 1`?
   - A. It returns 2
   - B. The carry keeps moving left forever, because Python ints have no fixed size
   - C. It throws a type error
   - D. Nothing goes wrong

## Answer key

1. **B** - 5 is 101 and 3 is 011. XOR gives 110, which is 6.
2. **B** - Pairs cancel with XOR, but triples do not. Counting each bit position and taking `% 3` leaves only the single number's bits.
3. **B** - If you stop when n becomes 0, the output is shifted too little and the answer is wrong for inputs like 1.
4. **B** - The values cover 0..n minus one number, but indexes cover only 0..n-1. Adding n makes every present number appear exactly twice.
5. **B** - -1 has infinitely many 1 bits in Python, so the carry never reaches zero. The mask keeps everything inside 32 bits.

## Flashcards

- **Q:** What are the three key XOR rules? — **A:** `a ^ a = 0`, `a ^ 0 = a`, and order does not matter.
- **Q:** How do you read the last bit of n? — **A:** `n & 1`.
- **Q:** What does `n >> 1` do for a positive n? — **A:** Divides n by 2, dropping the last bit.
- **Q:** Counting Bits formula using the lowest set bit? — **A:** `ans[i] = ans[i & (i - 1)] + 1`.
- **Q:** One line to build reversed bits? — **A:** `result = (result << 1) | (n & 1)`, then `n >>= 1`, 32 times.
- **Q:** Sum formula for Missing Number? — **A:** `n * (n + 1) / 2 - sum(nums)`.
- **Q:** What is the 32-bit mask in hex? — **A:** `0xFFFFFFFF`.
- **Q:** How do you turn a masked 32-bit value back into a negative Python int? — **A:** If it is above `0x7FFFFFFF`, return `~(a ^ 0xFFFFFFFF)`.
- **Q:** Range of a signed 32-bit integer? — **A:** -2^31 to 2^31 - 1, that is -2147483648 to 2147483647.
- **Q:** Best tester inputs for Reverse Integer? — **A:** Trailing zeros (120), negative numbers, 0, and an overflow case like 1534236469.

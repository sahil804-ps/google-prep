# Test Case Design Techniques

> **In this chapter:**
> - Apply equivalence partitioning and boundary value analysis to cut infinite inputs down to a small, strong set
> - Build decision tables for combinations of rules and state transition models for workflows
> - Use pairwise testing to shrink huge configuration matrices
> - Use error guessing and exploratory testing to find what formal techniques miss
> - Work every technique on two running examples: a password validator and an ATM
>
> **Time:** ~50 minutes  |  **Level:** Intermediate

In a Google test-engineering interview, "How would you test X?" is the most common question type. The interviewer is not looking for a random list of 50 ideas. They want to see *systematic* thinking: how you choose a small number of tests that catch the most bugs. That is what test design techniques give you.

You have probably used some of these without naming them. In this chapter you will learn the names, the rules, and how to explain your choices out loud. General references: the Google Testing Blog ([testing.googleblog.com](https://testing.googleblog.com/)) and the ISTQB Foundation syllabus, which defines most of these techniques in standard terms.

## The running examples

**Example 1 – Password validator.** A sign-up form accepts a password if:
- length is 8 to 64 characters (inclusive);
- it has at least one uppercase letter, one lowercase letter, and one digit;
- it has no spaces.

**Example 2 – ATM.** A user inserts a card, enters a PIN (3 wrong attempts and the card is retained), chooses "withdraw", enters an amount (multiple of ₹100, from ₹100 to ₹10,000 per transaction, not more than balance), and takes cash.

## 1. Equivalence partitioning (EP)

**Idea:** Divide inputs into groups (partitions or "classes") where the system should behave the same way. Test one value from each group. If one value in a group works, the others probably do too.

**Analogy:** A railway ticket checker doesn't check every passenger's age one by one to learn the fare rules. They know there are groups: child (5–11, half fare), adult (12–59, full fare), senior (60+, concession). Testing one person from each group tells you if the rule works for that group.

### EP on password length

| Partition | Example value | Expected |
|---|---|---|
| Too short (0–7) | length 4 | Reject |
| Valid (8–64) | length 20 | Accept |
| Too long (65+) | length 100 | Reject |

### EP on character rules

Each rule creates a valid and an invalid partition:

| Rule | Valid partition | Invalid partition |
|---|---|---|
| Has uppercase | `Abcdefg1` | `abcdefg1` |
| Has lowercase | `Abcdefg1` | `ABCDEFG1` |
| Has digit | `Abcdefg1` | `Abcdefgh` |
| No spaces | `Abcdefg1` | `Abc defg1` |

**Rule for invalid partitions:** test them **one at a time**. If you test a password that is too short *and* has no digit, and it is rejected, you don't know which rule caught it. Maybe the digit check is broken and only the length check worked.

## 2. Boundary value analysis (BVA)

**Idea:** Bugs love edges. Developers write `<` when they mean `<=`. So test at and around each boundary.

The standard set for a range `[min, max]` is: **min−1, min, min+1, max−1, max, max+1**. (Some teams use the shorter "two-value" version: min−1, min, max, max+1.)

**Analogy:** A lift says "maximum 8 persons". The interesting tests are 7, 8 and 9 people – not 3.

### BVA on password length (8 to 64)

| Length | Expected |
|---|---|
| 7 | Reject |
| 8 | Accept |
| 9 | Accept |
| 63 | Accept |
| 64 | Accept |
| 65 | Reject |

Also test the extreme edges: length 0 (empty) and something very long (10,000 characters – does the server crash or time out?).

### BVA on ATM withdrawal (₹100 to ₹10,000, multiples of 100)

| Amount | Expected | Why |
|---|---|---|
| 0 | Reject | Below min |
| 100 | Accept | Min |
| 150 | Reject | Not a multiple of 100 |
| 200 | Accept | Min + one step |
| 9,900 | Accept | Max − one step |
| 10,000 | Accept | Max |
| 10,100 | Reject | Above max |
| balance exactly | Accept | Boundary on balance |
| balance + 100 | Reject | Just over balance |

Notice that the "step" is ₹100, not ₹1, because only multiples of 100 are valid. Good BVA uses the real step size.

### EP + BVA as code

```python
import pytest
from auth import is_valid_password

def pw(n):
    """Build a valid-looking password of exactly n characters."""
    return ("Aa1" + "x" * n)[:n]

@pytest.mark.parametrize("length, ok", [
    (7, False), (8, True), (9, True),       # lower boundary
    (63, True), (64, True), (65, False),    # upper boundary
])
def test_password_length_boundaries(length, ok):
    assert is_valid_password(pw(length)) is ok

@pytest.mark.parametrize("password", [
    "abcdefg1",    # no uppercase
    "ABCDEFG1",    # no lowercase
    "Abcdefgh",    # no digit
    "Abc defg1",   # contains a space
])
def test_password_missing_one_rule_is_rejected(password):
    assert is_valid_password(password) is False
# Output: 10 passed
```

## 3. Decision tables

**Idea:** When the output depends on a **combination** of conditions, list every combination in a table. Each column is a "rule" and becomes a test.

**Analogy:** A Swiggy delivery fee might depend on: Is the user a Swiggy One member? Is the order above ₹199? Is it raining (surge)? Three yes/no conditions give 2³ = 8 combinations. A decision table makes sure you don't miss one.

### Decision table for ATM withdrawal approval

Conditions: (C1) PIN correct, (C2) amount valid (multiple of 100, within ₹100–₹10,000), (C3) amount ≤ balance.

| | R1 | R2 | R3 | R4 | R5 |
|---|---|---|---|---|---|
| C1 PIN correct | N | Y | Y | Y | Y |
| C2 amount valid | – | N | N | Y | Y |
| C3 amount ≤ balance | – | Y | N | N | Y |
| **Action** | Ask PIN again | "Invalid amount" | "Invalid amount" | "Insufficient funds" | **Dispense cash** |

The dash (–) means "doesn't matter". If the PIN is wrong, the other conditions are never checked. This **collapses** the table from 8 columns to 5.

Two interesting questions came out of building the table:
- R3: amount invalid *and* above balance. Which error message wins? The table forces you to ask the product owner.
- Is there also a **daily** limit across transactions? The spec didn't say. Write it down as a question.

This is a key point for interviews: **decision tables find gaps in requirements**, not just bugs in code.

## 4. State transition testing

**Idea:** Some systems behave differently depending on their current **state** (what happened before). Draw the states and the events that move between them, then test each transition – including the invalid ones.

**Analogy:** An auto-rickshaw meter has states: *Available → Hired → Waiting → Hired → Trip ended*. Pressing "start" in "Available" begins a trip; pressing "start" in "Trip ended" should do nothing.

### ATM state model

| Current state | Event | Next state |
|---|---|---|
| Idle | Insert card | Awaiting PIN |
| Awaiting PIN | Correct PIN | Authenticated |
| Awaiting PIN | Wrong PIN (attempt 1 or 2) | Awaiting PIN |
| Awaiting PIN | Wrong PIN (attempt 3) | Card retained |
| Authenticated | Withdraw valid amount | Dispensing |
| Dispensing | Cash taken | Idle (card returned) |
| Any active state | Cancel | Idle (card returned) |
| Any active state | Timeout (no input) | Idle (card returned) |

### Choosing tests

- **All states covered:** visit every state at least once.
- **All transitions covered (0-switch):** every row of the table at least once.
- **Invalid transitions:** events that should be ignored or rejected, such as "withdraw" while in *Awaiting PIN*, or "insert card" while *Dispensing*.
- **Sequences (1-switch and more):** pairs of transitions, such as wrong PIN → correct PIN. Does the attempt counter reset after success? Does it reset with a new card session?

```python
from atm import Atm

def test_three_wrong_pins_retain_card():
    atm = Atm(correct_pin="4321")
    atm.insert_card()
    for _ in range(2):
        atm.enter_pin("0000")
        assert atm.state == "AWAITING_PIN"
    atm.enter_pin("0000")                    # third wrong attempt
    assert atm.state == "CARD_RETAINED"

def test_withdraw_before_pin_is_rejected():
    atm = Atm(correct_pin="4321")
    atm.insert_card()
    assert atm.withdraw(500) == "ERROR_NOT_AUTHENTICATED"
    assert atm.state == "AWAITING_PIN"       # state unchanged
```

(Yes, the first test has a small loop. This is a judgment call: a two-step loop is clearer than copy-pasting. Keep such loops tiny and obvious.)

## 5. Pairwise (all-pairs) testing

**Idea:** When there are many parameters, testing every combination explodes. Research and long industry experience show that most configuration bugs are triggered by one parameter or an interaction of **two** parameters. Pairwise testing picks a small set of tests that covers **every pair of values** at least once.

**Analogy:** At a wedding with 100 guests, you want every guest to meet every other guest at least once. You don't need a separate party for each pair; a clever seating plan across a few tables does it.

### Example: testing the ATM across configurations

| Parameter | Values |
|---|---|
| Card network | RuPay, Visa, Mastercard |
| Language | English, Hindi, Tamil |
| Account type | Savings, Current |
| Receipt | Yes, No |

All combinations: 3 × 3 × 2 × 2 = **36** tests. A pairwise set needs only about **9** tests, because the two largest parameters (3 × 3 = 9 pairs) set the minimum.

| # | Network | Language | Account | Receipt |
|---|---|---|---|---|
| 1 | RuPay | English | Savings | Yes |
| 2 | RuPay | Hindi | Current | No |
| 3 | RuPay | Tamil | Savings | No |
| 4 | Visa | English | Current | No |
| 5 | Visa | Hindi | Savings | Yes |
| 6 | Visa | Tamil | Current | Yes |
| 7 | Mastercard | English | Savings | No |
| 8 | Mastercard | Hindi | Current | Yes |
| 9 | Mastercard | Tamil | Savings | Yes |

Check any pair – say (Visa, Current) or (Tamil, No) – and you'll find it in at least one row. In practice, use a tool such as Microsoft's free **PICT** or the Python package **allpairspy** to generate the table.

```python
from itertools import combinations, product

params = {
    "network": ["RuPay", "Visa", "Mastercard"],
    "language": ["English", "Hindi", "Tamil"],
    "account": ["Savings", "Current"],
    "receipt": ["Yes", "No"],
}
all_combos = list(product(*params.values()))
print(len(all_combos))      # 36 full combinations

# Count how many distinct value-pairs must be covered
pairs = sum(len(params[a]) * len(params[b]) for a, b in combinations(params, 2))
print(pairs)                # 37 pairs; ~9 well-chosen rows cover them all
```

**Caution:** pairwise is a risk-based shortcut. If you know a specific 3-way combination is risky (for example, RuPay + Current + Tamil had a past bug), add it explicitly.

## 6. Error guessing

**Idea:** Use experience to guess where bugs hide. This is where your 5.5 years matter. Keep a personal checklist of "usual suspects".

Error-guessing ideas for the password validator:
- Unicode letters: is `É` an uppercase letter? What about Devanagari characters, which have no case?
- Emoji: is `😀` one character or two? Does a 64-"character" password with emoji pass in the browser but fail on the server?
- Leading/trailing spaces that the UI trims but the API does not.
- Copy-paste with a hidden newline at the end.
- SQL or script injection: `' OR 1=1 --`, `<script>`.
- Server-side validation exists, or only JavaScript in the browser? (Send the request directly with an API tool.)

Error-guessing ideas for the ATM:
- Power cut during dispensing: is the account debited without cash?
- Network drop after the bank approves but before the ATM gets the reply.
- Cash not taken within the timeout: is it retracted and the amount reversed?
- Two cards for the same account used at the same time at two ATMs.

## 7. Exploratory testing

**Idea:** Learning, test design and test execution happen at the same time. You explore the product, guided by curiosity and a goal, instead of following a script. The SWE book's "Larger Testing" chapter ([ch14](https://abseil.io/resources/swe-book/html/ch14.html)) lists exploratory testing and **bug bashes** as types of larger tests that find issues automated tests miss.

Exploratory testing is not random clicking. Good practice is **session-based**:

- **Charter:** a one-line mission. "Explore the ATM withdraw flow with network interruptions, to find money-loss risks."
- **Time box:** 60–90 minutes.
- **Notes:** what you tried, what you found, questions raised.
- **Debrief:** share findings; turn important ones into automated tests.

**Analogy:** A scripted test is following Google Maps turn by turn. Exploratory testing is walking through a new city's market with a goal ("find the best street food") and using your senses.

## Choosing the right technique

| Situation | Technique |
|---|---|
| Ranges of numbers, lengths, dates | EP + BVA |
| Several conditions combine to decide an outcome | Decision table |
| Behaviour depends on history (workflows, sessions) | State transition |
| Many configuration options | Pairwise |
| Known risky areas, past bugs | Error guessing |
| New feature, unclear spec, or "what did we miss?" | Exploratory |

In an interview, combine them: "I'd use EP and BVA for the amount, a decision table for approval rules, a state model for the session, pairwise for the device matrix, and a time-boxed exploratory session focused on money-loss risks."

## Interview phrases you can use

- "I'll split inputs into equivalence classes and test the boundaries of each – that's where off-by-one bugs live."
- "I test invalid partitions one at a time, so I know which rule rejected the input."
- "Building the decision table showed a gap: the spec doesn't say which error wins when two rules fail."
- "Pairwise cuts 36 combinations to about 9 while still covering every pair."
- "After the scripted tests, I'd run a time-boxed exploratory session with a clear charter."

## Tester's corner

- These techniques are your strongest weapon in "How would you test X?" questions. Name them out loud.
- Always use the real step size for boundaries (₹100 for the ATM, one character for a password).
- Decision tables and state models are excellent for finding *requirement* bugs before code exists.
- Turn every error-guessing idea that finds a bug into an automated regression test.
- Pairwise is great for browser/device matrices in your Playwright or Appium work.
- Keep a personal error-guessing checklist from past bugs (unicode, time zones, double-clicks, network drops). It grows with experience.

## Key takeaways

- Equivalence partitioning tests one value per group of inputs that should behave the same.
- Boundary value analysis tests at and around each edge: min−1, min, min+1, max−1, max, max+1.
- Test invalid partitions one at a time.
- Decision tables cover combinations of conditions and expose requirement gaps.
- State transition testing covers workflows, including invalid transitions and sequences.
- Pairwise testing covers every pair of parameter values with far fewer tests.
- Error guessing and exploratory testing use experience and curiosity to find what formal techniques miss.

## Quiz

1. A field accepts ages 18 to 60. Which set is standard boundary value analysis?
   A) 18, 40, 60
   B) 17, 18, 19, 59, 60, 61
   C) 0, 18, 60, 100
   D) 1, 2, 3
2. True or false: you should combine several invalid conditions in one test to save time.
3. What is the main purpose of equivalence partitioning?
4. Which technique is best for "fee depends on membership, order value and surge"?
   A) BVA  B) Decision table  C) Pairwise  D) Exploratory
5. In the ATM state model, what should happen if the user tries to withdraw while still in "Awaiting PIN"?
6. Four parameters have 3, 3, 2 and 2 values. How many full combinations are there, and roughly how many pairwise tests?
7. True or false: exploratory testing means clicking randomly without a goal.
8. Give two error-guessing ideas for a password field.
9. The ATM only dispenses multiples of ₹100. Why is 150 an important test value?
10. While building a decision table, you find the spec doesn't say which error to show when two rules fail. What do you do?

## Answer key

1. **B** - min−1, min, min+1, max−1, max, max+1.
2. **False** - If the test fails or passes, you don't know which condition caused it. Test invalid partitions one at a time.
3. To reduce a huge input space to a few representative values, one per group expected to behave the same.
4. **B** - A combination of conditions deciding an outcome is exactly what decision tables are for.
5. The withdrawal is rejected and the state stays "Awaiting PIN". This is an invalid transition test.
6. **36** full combinations; about **9** pairwise tests (3 × 3 for the two largest parameters).
7. **False** - Good exploratory testing has a charter, a time box, notes and a debrief.
8. Any two of: unicode or emoji characters, leading/trailing spaces, hidden newlines from copy-paste, injection strings, very long input, bypassing browser validation via the API.
9. It is inside the numeric range but in the invalid "not a multiple of 100" partition, so it checks the step rule.
10. Raise it with the product owner, record the decision, and add a test for it. Finding requirement gaps is a key benefit of decision tables.

## Flashcards

- **Q:** Equivalence partitioning? — **A:** Split inputs into groups that should behave the same and test one value from each.
- **Q:** Standard BVA values for range [min, max]? — **A:** min−1, min, min+1, max−1, max, max+1.
- **Q:** Why test invalid partitions one at a time? — **A:** So you know which rule rejected the input.
- **Q:** When do you use a decision table? — **A:** When an outcome depends on a combination of conditions.
- **Q:** What does a dash mean in a decision table? — **A:** The condition doesn't matter for that rule.
- **Q:** State transition testing? — **A:** Model states and events, then test valid transitions, invalid transitions and sequences.
- **Q:** Pairwise testing? — **A:** Choose tests so every pair of parameter values appears at least once.
- **Q:** Name two pairwise tools. — **A:** Microsoft PICT and the Python package allpairspy.
- **Q:** Error guessing? — **A:** Using experience of past bugs to target likely failure points.
- **Q:** Parts of a session-based exploratory test? — **A:** Charter, time box, notes and debrief.
- **Q:** What extra benefit do decision tables give? — **A:** They expose gaps and conflicts in requirements.

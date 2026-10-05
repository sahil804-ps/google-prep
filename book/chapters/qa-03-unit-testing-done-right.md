# Unit Testing Done Right

> **In this chapter:**
> - Write unit tests that check behaviour through public APIs, not implementation details
> - Structure every test with Arrange / Act / Assert and name it after the behaviour
> - Understand why Google prefers DAMP tests over DRY tests, and why tests should have no logic
> - Use pytest features (parametrize, fixtures, `pytest.raises`) cleanly
> - Spot brittle and unclear tests in a code review
>
> **Time:** ~45 minutes  |  **Level:** Beginner

This chapter follows Chapter 12, "Unit Testing", of *Software Engineering at Google* ([abseil.io/resources/swe-book/html/ch12.html](https://abseil.io/resources/swe-book/html/ch12.html)). All code here is Python with **pytest**, the most common Python test framework. In a Google SWE-Test interview you may be asked to write code and then *write tests for your own code*. This chapter makes sure those tests look professional.

## What is a unit test?

A **unit test** checks one small piece of code – usually a function or a class – in isolation. In Google's language (see the How Google Thinks About Testing chapter) it is *narrow in scope* and ideally *small in size*: one process, no network, no real database.

**Analogy:** A mobile phone factory tests each part before assembling the phone. The battery is tested alone. The camera is tested alone. If the battery test fails, you know exactly what is broken. That is what a unit test gives you: a precise signal.

Good unit tests have four properties:

1. **Fast** – milliseconds each, so you can run thousands on every change.
2. **Deterministic** – same code, same result, every time.
3. **Clear** – when one fails, you understand the problem without reading the code under test.
4. **Robust** – they don't break when someone refactors the code without changing behaviour.

The SWE book spends most of its unit testing chapter on the last two: **clarity** and **robustness**. Let's see why.

## The goal: unchanging tests

The SWE book says the ideal test is **unchanging**: once written, it should only need to change when the *behaviour* of the system changes. It lists the kinds of changes engineers make:

| Kind of change | Should existing tests change? |
|---|---|
| Pure refactoring (internal clean-up, same behaviour) | No |
| New feature | No – you *add* new tests |
| Bug fix | No – you add a test for the missing case |
| Behaviour change | Yes – this is the only case |

If your tests break during a pure refactoring, they are **brittle**. Brittle tests cost time and teach engineers to ignore failures.

**Analogy:** Imagine a building inspector who fails your flat because you moved the sofa. That inspector is checking the wrong thing. Tests should check that the house is safe (behaviour), not where the furniture is (implementation).

## Rule 1: Test through public APIs

Call the code the same way its real users do. Don't reach into private helpers or internal fields.

```python
# Code under test: a simple UPI wallet
class Wallet:
    def __init__(self):
        self._balance = 0          # private detail

    def add(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self._balance += amount

    def balance(self):
        return self._balance

# BAD: depends on a private field name
def test_add_bad():
    w = Wallet()
    w.add(100)
    assert w._balance == 100       # breaks if we rename _balance

# GOOD: uses the public API only
def test_add_increases_balance():
    w = Wallet()
    w.add(100)
    assert w.balance() == 100
```

If a developer later stores the balance in paise instead of rupees, the bad test breaks even though users see no difference. The good test keeps passing.

## Rule 2: Test state, not interactions

**State testing** checks the *result*: what does the system look like after the action? **Interaction testing** checks *how* the system did it: which methods were called, in what order.

The SWE book prefers state testing. Interaction checks (with mocks) often break when the implementation changes. The Test Doubles chapter explains when interaction tests are still the right choice.

## Rule 3: Test behaviours, not methods

A common mistake is writing exactly one test per method: `test_add`, `test_withdraw`. The SWE book recommends one test per **behaviour**. One method can have many behaviours; one behaviour can use several methods.

For `Wallet.add`, behaviours include:
- adding a positive amount increases the balance;
- adding zero raises an error;
- adding a negative amount raises an error;
- several adds accumulate.

Each behaviour gets its own small test. When one fails, the test name tells you exactly which behaviour is broken.

## Structure: Arrange / Act / Assert

Every test should have three clear parts. The SWE book uses the words **given / when / then**, which mean the same thing.

- **Arrange (given)** – set up the objects and data.
- **Act (when)** – do the one action you are testing.
- **Assert (then)** – check the result.

Assume `Wallet` also has a `withdraw(amount)` method that raises `ValueError("insufficient balance")` when the amount is too big.

```python
import pytest

def test_withdraw_more_than_balance_raises_error():
    # Arrange
    w = Wallet()
    w.add(100)
    # Act + Assert: withdrawing 150 must fail
    with pytest.raises(ValueError, match="insufficient"):
        w.withdraw(150)
    # And the balance must not change
    assert w.balance() == 100
```

Keep one "Act" per test. If you find yourself writing Act, Assert, Act, Assert, Act, Assert, split it into several tests.

## Naming: the name is the documentation

A good name tells you what broke, without opening the test. A common pattern is:

`test_<behaviour>_<condition>` or `test_<action>_<condition>_<expected result>`

| Bad name | Good name |
|---|---|
| `test_withdraw` | `test_withdraw_more_than_balance_raises_error` |
| `test_1` | `test_add_zero_amount_is_rejected` |
| `test_wallet_works` | `test_balance_starts_at_zero` |

When the CI report says `test_withdraw_more_than_balance_raises_error FAILED`, any engineer understands the problem in five seconds.

## DAMP, not DRY

In production code, engineers follow **DRY** – "Don't Repeat Yourself". In tests, the SWE book recommends **DAMP** – "Descriptive And Meaningful Phrases".

What this means: some repetition in tests is fine if it makes each test easy to read on its own. A reader should understand one test without jumping to five helper functions and a base class.

```python
# Too DRY: the reader must find make_user() and the magic numbers.
def test_discount_dry():
    assert price_for(make_user(3)) == 900

# DAMP: everything important is visible in the test.
def test_gold_member_gets_ten_percent_discount():
    user = User(name="Asha", tier="gold")
    price = price_for(user, cart_total=1000)
    assert price == 900
```

Helper functions are still fine for *boring* setup (creating a database connection). But anything that affects the result – like `tier="gold"` – should be visible in the test body.

## No logic in tests

The SWE book says tests should not contain logic: no loops, no `if` statements, no complex calculations. Why? Because logic in a test can have bugs, and nobody tests the tests.

```python
# BAD: the test repeats the code's logic, so it repeats any bug too.
def test_total_with_tax_bad():
    items = [100, 200]
    expected = sum(items) * 1.18      # same formula as the code
    assert total_with_tax(items) == expected

# GOOD: a plain, hand-calculated expected value.
def test_total_with_tax_adds_18_percent_gst():
    assert total_with_tax([100, 200]) == 354.0
```

If the developer had used 1.12 instead of 1.18 in both places, the bad test would still pass.

## Clear failure messages

When a test fails, the message should explain what went wrong. pytest helps a lot: its plain `assert` shows both sides of a comparison. For extra context, add a message.

```python
def test_order_status_after_delivery():
    order = deliver(create_order("ORD-1"))
    assert order.status == "DELIVERED", f"order {order.id} stuck in {order.status}"
# Failure output:
# AssertionError: order ORD-1 stuck in OUT_FOR_DELIVERY
# assert 'OUT_FOR_DELIVERY' == 'DELIVERED'
```

## Useful pytest features

### Parametrize: many cases, one test function

`pytest.mark.parametrize` runs the same test with a table of inputs. Each row is reported as a separate test. This is the one place where "repetition" is removed in a way that stays readable, because the table *is* the specification.

```python
import pytest
from shipping import shipping_fee

@pytest.mark.parametrize("cart_total, expected_fee", [
    (0, 40),      # empty cart still pays base fee
    (199, 40),    # just below free-shipping limit
    (200, 0),     # exactly at the limit: free
    (5000, 0),    # large cart: free
])
def test_shipping_fee(cart_total, expected_fee):
    assert shipping_fee(cart_total) == expected_fee
# Output: 4 tests, e.g. test_shipping_fee[199-40] PASSED
```

Notice that the rows are boundary values (see the Test Case Design Techniques chapter).

### Fixtures: reusable, explicit setup

A **fixture** is a function that prepares something a test needs. pytest passes it in by argument name.

```python
@pytest.fixture
def funded_wallet():
    w = Wallet()
    w.add(500)
    return w

def test_withdraw_reduces_balance(funded_wallet):
    funded_wallet.withdraw(200)
    assert funded_wallet.balance() == 300
```

Use fixtures for setup that many tests share. But keep the important values visible. Here the name `funded_wallet` and the obvious `500` make it clear.

`tmp_path` (a temporary folder) and `monkeypatch` (temporarily change environment variables or attributes) are built-in fixtures that keep tests isolated.

### Testing exceptions

Use `pytest.raises` as a context manager, and check the message with `match=` so you know the *right* error happened.

## Worked example: testing a ride fare calculator

Let's put everything together. Here is a small function, like one inside an auto-rickshaw booking app.

```python
# fare.py
def fare(km, night=False):
    """Base 30 rupees for first 2 km, then 15 per km. Night: +25%."""
    if km < 0:
        raise ValueError("distance cannot be negative")
    amount = 30 if km <= 2 else 30 + (km - 2) * 15
    if night:
        amount *= 1.25
    return round(amount, 2)
```

**Step 1 – list the behaviours** (not methods):
1. Short trips (up to 2 km) cost the base fare.
2. Longer trips add 15 per extra km.
3. Night trips cost 25% more.
4. Negative distance is rejected.
5. Zero distance costs the base fare (a design question – ask!).

**Step 2 – write tests, one behaviour each:**

```python
import pytest
from fare import fare

@pytest.mark.parametrize("km, expected", [(0, 30), (1.5, 30), (2, 30)])
def test_trip_up_to_two_km_costs_base_fare(km, expected):
    assert fare(km) == expected

def test_each_km_after_two_adds_fifteen_rupees():
    assert fare(5) == 75          # 30 + 3*15

def test_night_trip_adds_twenty_five_percent():
    assert fare(5, night=True) == 93.75

def test_negative_distance_is_rejected():
    with pytest.raises(ValueError, match="negative"):
        fare(-1)
# Output: 6 passed
```

**Step 3 – review against the rules:**
- Public API only? Yes, we only call `fare()`.
- No logic in tests? Yes – expected values are hand-calculated.
- Names describe behaviour? Yes.
- Boundary covered? 2 km is exactly on the boundary; you might add `2.01` too.
- What did we learn? The spec does not say what happens to a trip of 2.5 km: is it charged per started km or per exact km? **Writing tests found an ambiguity.** In an interview, say this out loud. It is exactly the thinking Google wants.

## Spotting bad tests in code review

As a test engineer you will review other people's tests. Look for:

- **Testing private methods or fields** → brittle.
- **Many assertions about different behaviours** in one test → unclear failures.
- **Loops or conditionals** in the test → hidden bugs.
- **Mystery values** (`make_user(3)`) → not DAMP.
- **Sleeps** (`time.sleep(2)`) → slow and flaky; use fakes or explicit waits.
- **Dependence on test order** or shared global state → flaky.
- **No assertion at all** → coverage without verification.

## Interview phrases you can use

- "I test behaviour through the public API, so the test survives refactoring."
- "Each test checks one behaviour, and the name says which one."
- "I prefer DAMP tests: a bit of repetition is fine if each test reads on its own."
- "I keep logic out of tests; expected values are hand-calculated."
- "While writing tests I noticed the spec doesn't say what happens at 2.5 km – I'd clarify that."

## Tester's corner

- When asked to write code in the interview, *always* finish by writing tests for it. List behaviours first, then code them.
- Use `parametrize` for boundary tables. It looks clean and shows you know test design.
- If a developer's test breaks on every refactor, suggest moving it to the public API. That is a real productivity win.
- Watch for `time.sleep` and real network calls in unit tests – they turn small tests into slow, flaky ones.
- Your UI automation background helps here: page objects are a way of "testing through a public API" of the page.
- Clear test names make CI dashboards readable for the whole team.

## Key takeaways

- A good unit test is fast, deterministic, clear and robust.
- Tests should change only when behaviour changes (unchanging tests).
- Test through public APIs, prefer state over interactions, and test behaviours rather than methods.
- Use Arrange / Act / Assert with one Act per test, and name tests after the behaviour.
- Prefer DAMP over DRY in tests, and keep logic out of them.
- pytest's `parametrize`, fixtures and `pytest.raises` make tests short and readable.
- Writing tests often reveals gaps in the specification.

## Quiz

1. When should an existing unit test need to change, according to the SWE book?
   A) After any refactoring
   B) Only when the system's behaviour changes
   C) Every sprint
   D) When code coverage drops
2. True or false: DAMP means "Don't Accept Mocks, Please".
3. Which test is most brittle?
   A) One that calls `wallet.balance()`
   B) One that checks `wallet._balance`
   C) One that uses `pytest.raises`
   D) One that uses a fixture
4. Why should tests avoid loops and `if` statements?
5. Which pytest feature runs one test function with a table of inputs?
   A) fixture  B) monkeypatch  C) parametrize  D) tmp_path
6. Name the three parts of a well-structured test.
7. True or false: one test per method is the recommended approach.
8. A test is named `test_1` and has 12 asserts about different features. What would you suggest in code review?
9. What is wrong with `expected = sum(items) * 1.18` inside a test of a tax function?
10. While testing a fare function, you see the spec does not say how partial kilometres are charged. What should you do?

## Answer key

1. **B** - Refactorings, new features and bug fixes should not require changes to existing tests; only real behaviour changes should.
2. **False** - DAMP means "Descriptive And Meaningful Phrases": readable tests even with some repetition.
3. **B** - It depends on a private field, so a harmless rename breaks the test.
4. Logic in tests can contain bugs, and nobody tests the tests. Plain hand-calculated values are safer and clearer.
5. **C** - `pytest.mark.parametrize` runs the test once per row.
6. **Arrange, Act, Assert** (also called given, when, then).
7. **False** - The SWE book recommends one test per behaviour. A method can have many behaviours.
8. Split it into several tests, one behaviour each, with names that describe the behaviour and condition.
9. It copies the code's formula, so if the formula is wrong in both places the test still passes. Use a hand-calculated value like 354.0.
10. Raise it with the product owner or developer, write down the decision, and add a test for the agreed behaviour.

## Flashcards

- **Q:** What is an unchanging test? — **A:** A test that only needs to change when the system's behaviour changes.
- **Q:** What is a brittle test? — **A:** A test that breaks on harmless changes like refactoring.
- **Q:** State testing vs interaction testing? — **A:** State checks the result; interaction checks which calls were made.
- **Q:** What does DAMP stand for? — **A:** Descriptive And Meaningful Phrases.
- **Q:** What are the three parts of a test? — **A:** Arrange, Act, Assert (given, when, then).
- **Q:** Good test naming pattern? — **A:** `test_<behaviour>_<condition>`, so the name says what broke.
- **Q:** Why no logic in tests? — **A:** Logic can hide bugs and nobody tests the tests.
- **Q:** What does `pytest.mark.parametrize` do? — **A:** Runs one test function once for each row of inputs.
- **Q:** What is a pytest fixture? — **A:** A function that prepares something a test needs, passed in by argument name.
- **Q:** Why use `match=` with `pytest.raises`? — **A:** To check the right error happened, not just any error of that type.

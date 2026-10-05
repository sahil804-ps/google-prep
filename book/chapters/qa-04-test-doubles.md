# Test Doubles: Fakes, Stubs, Mocks and Spies

> **In this chapter:**
> - Define dummy, stub, fake, spy and mock, with one Python example each
> - Use dependency injection to make code testable
> - Follow Google's public guidance: prefer real implementations, then fakes, then stubs and mocks
> - Use `unittest.mock` and pytest's `monkeypatch` correctly, and avoid over-mocking
> - Explain the trade-offs clearly in an interview
>
> **Time:** ~45 minutes  |  **Level:** Intermediate

This chapter is based on Chapter 13, "Test Doubles", of *Software Engineering at Google* ([abseil.io/resources/swe-book/html/ch13.html](https://abseil.io/resources/swe-book/html/ch13.html)). The names "dummy, stub, spy, mock, fake" come from Gerard Meszaros's book *xUnit Test Patterns* and are widely used across the industry.

## Why we need test doubles

Real code depends on other things: databases, payment gateways, SMS services, the clock, random numbers, other teams' servers. If a unit test uses the real versions, the test becomes slow, flaky, expensive, or even dangerous (imagine a test that really sends ₹1 to a real bank account).

A **test double** is an object that stands in for a real dependency during a test. The name comes from a "stunt double" in films: the actor's stand-in for the dangerous scenes.

**Analogy:** When a Bollywood hero has to jump from a moving train, a stunt double does it. The audience sees the scene; the real actor is safe. A test double does the risky or slow part so your test stays fast and safe.

## First, make code testable: dependency injection

You can only replace a dependency if the code lets you. **Dependency injection (DI)** means: give an object its dependencies from the outside, instead of letting it create them inside.

```python
# HARD TO TEST: the class creates its own gateway inside.
class CheckoutHard:
    def pay(self, amount):
        gateway = RealRazorpayGateway()     # always the real one!
        return gateway.charge(amount)

# EASY TO TEST: the gateway is passed in (injected).
class Checkout:
    def __init__(self, gateway):
        self.gateway = gateway

    def pay(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        return self.gateway.charge(amount)

# Production: Checkout(RealRazorpayGateway())
# Test:       Checkout(FakeGateway())
```

The SWE book calls the place where you can swap a dependency a **seam**. DI creates seams. In Python you can also pass functions (like `now=datetime.now`) as arguments – the same idea in a lighter form.

**Analogy:** A table fan with a fixed plug wired inside the wall can't be tested elsewhere. A fan with a normal plug can be plugged into a test socket. DI is giving your code a plug.

## The five kinds of test double

| Double | What it does | Checks calls? | Example |
|---|---|---|---|
| **Dummy** | Passed in but never used; fills a parameter | No | `None` or an empty object for a logger you don't care about |
| **Stub** | Returns fixed, pre-programmed answers | No | Exchange-rate service always returns 83.0 |
| **Fake** | A real, working but lightweight implementation | No | In-memory dictionary instead of a database |
| **Spy** | A stub that also records how it was called | Afterwards, by your asserts | Records every SMS "sent" |
| **Mock** | Pre-programmed with expectations about calls, and verifies them | Yes | "`charge` must be called once with 500" |

Many people (and the `unittest.mock` library) use "mock" for all of these. In an interview, define your terms – it shows precision.

### Dummy

```python
def test_checkout_rejects_zero_amount():
    checkout = Checkout(gateway=None)    # dummy: never used in this path
    with pytest.raises(ValueError):
        checkout.pay(0)
```

### Stub

A stub answers questions with canned data. It lets you put the system into a specific state.

```python
class StubRates:
    def usd_to_inr(self):
        return 83.0                      # fixed answer, always

def test_price_in_rupees_uses_current_rate():
    shop = Shop(rates=StubRates())
    assert shop.price_in_inr(usd=10) == 830.0
```

### Fake

A fake is a *working* implementation that takes a shortcut. The most common fake is an in-memory database.

```python
class FakeUserRepo:
    """Behaves like the real DB repo, but stores data in a dict."""
    def __init__(self):
        self._users = {}

    def save(self, user_id, name):
        self._users[user_id] = name

    def get(self, user_id):
        return self._users.get(user_id)

def test_signup_stores_user():
    repo = FakeUserRepo()
    signup(repo, user_id="u1", name="Asha")
    assert repo.get("u1") == "Asha"     # state check on the fake
```

### Spy

A spy records calls so you can check them afterwards.

```python
class SpySms:
    def __init__(self):
        self.sent = []                   # records every call

    def send(self, phone, text):
        self.sent.append((phone, text))

def test_order_confirmation_sends_one_sms():
    sms = SpySms()
    confirm_order("ORD-9", phone="9876543210", sms=sms)
    assert sms.sent == [("9876543210", "Order ORD-9 confirmed")]
```

### Mock (with unittest.mock)

Python's standard library has `unittest.mock`. A `Mock` object accepts any call, records it, and lets you assert on calls. You can also set return values (`return_value`) or make it raise (`side_effect`).

```python
from unittest.mock import Mock

def test_pay_charges_gateway_once_with_amount():
    gateway = Mock()
    gateway.charge.return_value = {"status": "success"}

    result = Checkout(gateway).pay(500)

    assert result["status"] == "success"
    gateway.charge.assert_called_once_with(500)   # interaction check

def test_pay_surfaces_gateway_timeout():
    gateway = Mock()
    gateway.charge.side_effect = TimeoutError("bank slow")
    with pytest.raises(TimeoutError):
        Checkout(gateway).pay(500)
```

`side_effect` is very useful for testing error handling: timeouts, connection errors, HTTP 500s – things that are hard to trigger with a real service.

**Tip:** Use `create_autospec(RealClass)` or `Mock(spec=RealClass)` so the mock rejects methods that don't exist on the real class. Without a spec, a typo like `gateway.chrage(...)` silently "works" on a plain Mock.

## Google's guidance: prefer realism

The SWE book's main message about doubles is: **prefer real implementations when you can.** It calls this preferring *realism over isolation*. A test that uses real code gives more confidence that the system actually works.

The book's order of preference, roughly:

1. **Real implementation** – if it is fast, deterministic and easy to build.
2. **Fake** – if the real one is slow or non-deterministic.
3. **Stub or mock** – when neither of the above is practical, or for a specific situation like forcing an error.

The SWE book says when deciding whether to use the real implementation, consider:

- **Execution time** – is the real one fast enough?
- **Determinism** – does it always give the same result?
- **Dependency construction** – is it easy to build, or does it need a huge tree of other objects?

## Why over-mocking hurts

The SWE book describes problems that come from overusing mocking frameworks.

### 1. Tests become brittle

Interaction tests check *how* code works. If someone refactors – say, calls `gateway.charge_with_retry()` instead of `gateway.charge()` – every mock-based test breaks, even though behaviour is the same.

### 2. Tests become unclear

When a test has 15 lines of `mock.return_value = ...`, the reader can't see what is being tested.

### 3. Tests can pass while the system is broken

A mock only knows what *you* told it. If the real payment gateway changed its response format last month, your mock still returns the old format, and your test still passes. The SWE book calls these mismatches a fidelity problem: the double does not behave like the real thing.

**Analogy:** Practising a viva exam with a friend who only asks the questions you prepared. You feel ready. The real examiner asks different questions. Over-mocked tests are that friend.

### When interaction testing IS the right choice

The SWE book says prefer state testing, but interaction testing is appropriate when:

- there is no state you can check (for example, "an email was sent" – the result lives outside your system);
- the interaction itself is the important behaviour, such as making sure a cache prevents a second expensive call, or that a payment is charged **exactly once**.

Even then, check only the interactions that matter. Don't assert every single call – that is called **over-specification**.

## Fakes deserve their own tests

A fake is code, and code can be wrong. The SWE book recommends that:

- fakes should be **tested**, ideally by running the same set of tests against both the fake and the real implementation (a *contract test*);
- fakes should be **owned by the team that owns the real implementation**, so they stay in sync.

```python
import pytest

# The same contract runs against both implementations.
@pytest.fixture(params=["fake", "real"])
def repo(request):
    if request.param == "fake":
        return FakeUserRepo()
    return RealUserRepo(test_database_url())   # slower; maybe medium size

def test_get_returns_what_was_saved(repo):
    repo.save("u1", "Asha")
    assert repo.get("u1") == "Asha"

def test_get_unknown_user_returns_none(repo):
    assert repo.get("nobody") is None
```

If the real repo ever starts raising an error for unknown users, the contract test fails for "real" but passes for "fake" – telling you the fake is now wrong.

## monkeypatch and patch: replacing things without DI

Sometimes you work with code you can't change, like a function that calls `time.time()` directly. pytest's `monkeypatch` and `unittest.mock.patch` replace an attribute for the duration of one test.

```python
import billing

def test_invoice_has_today_date(monkeypatch):
    monkeypatch.setattr(billing, "today", lambda: "2026-10-05")
    assert billing.make_invoice(100)["date"] == "2026-10-05"
# After the test, billing.today is restored automatically.
```

Important rule: patch the name **where it is used**, not where it is defined. If `billing.py` does `from datetime import date`, you patch `billing.date`, not `datetime.date`.

Patching is useful, but if you need it everywhere, it is a sign the code needs proper dependency injection.

## Worked example: a ride-booking notifier

Requirement: when a ride is booked, the system charges the user, saves the booking, and sends an SMS. If the charge fails, nothing is saved and no SMS is sent.

```python
class BookingService:
    def __init__(self, gateway, repo, sms):
        self.gateway, self.repo, self.sms = gateway, repo, sms

    def book(self, user_id, phone, fare):
        result = self.gateway.charge(fare)
        if result["status"] != "success":
            return "PAYMENT_FAILED"
        booking_id = self.repo.save_booking(user_id, fare)
        self.sms.send(phone, f"Ride {booking_id} confirmed")
        return booking_id
```

**Choosing doubles for each dependency:**

| Dependency | Choice | Why |
|---|---|---|
| Payment gateway | Stub (or `Mock` with `return_value`) | External, costs money; we need to force success and failure |
| Booking repository | Fake (in-memory) | We want to check state: was it saved? |
| SMS sender | Spy | The result lives outside our system; we must check the call |

```python
from unittest.mock import Mock

def test_failed_payment_saves_nothing_and_sends_no_sms():
    gateway = Mock()
    gateway.charge.return_value = {"status": "declined"}
    repo, sms = FakeBookingRepo(), SpySms()

    result = BookingService(gateway, repo, sms).book("u1", "98xxxxxx10", 120)

    assert result == "PAYMENT_FAILED"
    assert repo.all_bookings() == []     # state check on the fake
    assert sms.sent == []                # no SMS was sent
```

Notice we did **not** assert "`repo.save_booking` was never called" with a mock. We checked the *state* of the fake instead. If a developer later renames `save_booking`, this test still works.

## Interview phrases you can use

- "I'd use dependency injection so the gateway can be swapped for a test double."
- "Following the SWE book, I prefer the real implementation, then a fake, and only then stubs or mocks."
- "I'd use a mock with `side_effect` to force the timeout path, because that's hard to trigger with a real service."
- "Mocks only know what we tell them, so I'd back them with contract tests against the real service."
- "I'd check state on a fake rather than assert on every call – it's less brittle."

## Tester's corner

- In Selenium/Playwright work you already use doubles: stubbing network responses with `page.route()` is a stub at the browser level.
- Over-mocked tests are a common reason "all tests pass but production is broken". Ask: "When did we last check this mock against the real API?"
- Fakes are excellent shared infrastructure. Building a well-tested fake for a team's main dependency is high-leverage SDET work.
- Use mocks with `side_effect` to test error paths: timeouts, 500s, malformed JSON, rate limits.
- Always use `spec`/`autospec` so mocks fail on typos and removed methods.
- If every test needs `patch`, propose dependency injection in a code review.

## Key takeaways

- A test double stands in for a real dependency to keep tests fast, deterministic and safe.
- Dependency injection creates seams where doubles can be inserted.
- Dummy fills a slot; stub returns fixed answers; fake is a lightweight working version; spy records calls; mock verifies expected calls.
- The SWE book advises realism: prefer real implementations, then fakes, then stubs and mocks.
- Overusing mocks makes tests brittle, unclear and sometimes falsely green.
- Use interaction checks only when the interaction itself matters, and avoid over-specification.
- Fakes need their own contract tests and should be owned by the real implementation's team.

## Quiz

1. Which double is a lightweight but working implementation, like an in-memory database?
   A) Dummy  B) Stub  C) Fake  D) Spy
2. True or false: the SWE book recommends mocking every dependency of a class under test.
3. What is dependency injection, in one sentence?
4. Which `unittest.mock` attribute makes a mock raise an exception?
   A) return_value  B) side_effect  C) assert_called  D) spec
5. Name one problem caused by overusing mocks.
6. A test needs to check that an SMS was sent. Which double fits best?
   A) Dummy  B) Spy  C) Stub  D) None, use the real SMS service
7. True or false: a plain `Mock()` without a spec will catch a typo in a method name.
8. Your mock-based tests are all green, but production fails because the real API changed its response format. What would you add?
9. Where should you patch a function imported with `from datetime import date` inside `billing.py`?
10. What three factors does the SWE book suggest when deciding whether to use a real implementation?

## Answer key

1. **C** - A fake works for real but takes a shortcut, such as storing data in a dictionary.
2. **False** - The SWE book prefers real implementations when they are fast, deterministic and easy to construct.
3. Giving an object its dependencies from outside (usually through the constructor) instead of creating them inside, so they can be replaced in tests.
4. **B** - `side_effect` can be an exception to raise, or a function or list of values.
5. Any of: brittle tests that break on refactoring, unclear tests, or tests that pass while the real system is broken because the mock no longer matches reality.
6. **B** - A spy records the call so you can assert it happened, without sending a real SMS.
7. **False** - A plain Mock accepts any attribute. Use `spec` or `create_autospec` to catch typos.
8. Contract tests that run against the real API (or the provider's published schema) and against the double, so mismatches are detected.
9. Patch `billing.date` - the name where it is used, not where it is defined.
10. Execution time, determinism, and how easy the dependency is to construct.

## Flashcards

- **Q:** What is a test double? — **A:** An object that stands in for a real dependency during a test.
- **Q:** Dummy? — **A:** An object passed only to fill a parameter; it is never used.
- **Q:** Stub? — **A:** A double that returns fixed, pre-programmed answers.
- **Q:** Fake? — **A:** A lightweight working implementation, such as an in-memory database.
- **Q:** Spy? — **A:** A double that records how it was called so you can check later.
- **Q:** Mock? — **A:** A double that verifies expected interactions, such as "called once with 500".
- **Q:** What is a seam? — **A:** A place in code where a dependency can be swapped, often created by dependency injection.
- **Q:** SWE book order of preference? — **A:** Real implementation, then fake, then stub or mock.
- **Q:** What does `side_effect` do in `unittest.mock`? — **A:** Makes the mock raise an exception or return values from a function or list.
- **Q:** Why use `create_autospec`? — **A:** So the mock only allows methods that exist on the real class.
- **Q:** Who should own a fake? — **A:** The team that owns the real implementation, with contract tests to keep them in sync.

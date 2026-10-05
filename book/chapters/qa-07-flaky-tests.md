# Flaky Tests

> **In this chapter:**
> - Define a flaky test and explain why flakiness destroys trust, using public Google data
> - Recognise the common root causes: timing, order dependence, shared state, external services, time, randomness, resources
> - Detect flaky tests with reruns and pass-rate tracking, and run a fair quarantine process
> - Fix flakiness with concrete Python, Playwright and Selenium patterns
> - Tell your own qaforge-mcp flaky-detection story with confidence
>
> **Time:** ~50 minutes  |  **Level:** Intermediate

Flaky tests are one of the most likely topics in a Google SWE-Test interview, both as a discussion question and as a system design question ("Design a flaky test detector"). You also have real experience here: you built flaky test detection into **qaforge-mcp**. This chapter gives you the vocabulary, the public facts, and the fix patterns to turn that experience into a strong answer.

## What is a flaky test?

A **flaky test** is a test that both passes and fails on the **same code**. Nothing changed, but the result changed.

This is the definition John Micco uses in the Google Testing Blog post "Flaky Tests at Google and How We Mitigate Them" (May 2016, [link](https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html)): "a test that exhibits both a passing and a failing result with the same code."

**Analogy:** A flaky test is like a smoke alarm that sometimes rings when you're just making toast. After a few false alarms, the family stops reacting – and one day, when there is a real fire, nobody moves. That is exactly what happens to engineering teams.

## Why flakiness matters so much: public numbers

From Micco's 2016 post:

- Google saw a continual rate of about **1.5% of all test runs** reporting a flaky result.
- Almost **16% of tests** had some level of flakiness.
- About **84% of pass-to-fail transitions** observed in post-submit involved a flaky test.

The post explains the cost: if an average project has around 1,000 tests and 1.5% of results are flaky, about 15 tests will likely fail on any run, each needing investigation. And people start ignoring real failures, because "it's probably flaky".

From *Software Engineering at Google*, Chapter 11 ([ch11](https://abseil.io/resources/swe-book/html/ch11.html)):

- If each test has a 0.1% chance of failing wrongly and you run 10,000 tests a day, you investigate about 10 flakes per day.
- "As you approach 1% flakiness, the tests begin to lose value."
- Google's flaky rate "hovers around 0.15%" (the book's figure, published later than the blog post – use whichever source you cite, and say which).

### The maths of many tests

Small per-test flakiness becomes large at suite level. If each of `n` independent tests fails wrongly with probability `p`, the chance the whole suite passes is `(1 − p)^n`.

```python
# Chance a full suite is green when every test is slightly flaky.
def suite_pass_probability(p, n):
    return (1 - p) ** n

print(round(suite_pass_probability(0.001, 1000), 3))   # 0.368
print(round(suite_pass_probability(0.0001, 1000), 3))  # 0.905
# With 0.1% flakiness per test, a 1,000-test suite is fully green
# only about 37% of the time. Tiny flakiness becomes a big problem.
```

This is a great point to make in an interview. It shows you understand flakiness as a *scale* problem.

## Root causes

Micco's post lists root causes including concurrency, relying on non-deterministic or undefined behaviour, flaky third-party code, and infrastructure problems. A 2017 follow-up on the same blog, "Where do our flaky tests come from?" by Jeff Listfield ([link](https://testing.googleblog.com/2017/04/where-do-our-flaky-tests-come-from.html)), reported that "the larger the test (as measured by binary size, RAM use, or number of libraries built), the more likely it is to be flaky". Over one week, the post says 0.5% of small tests, 1.6% of medium tests and 14% of large tests were flaky. This is strong public evidence for the test pyramid.

Here is a practical list of causes you will meet:

| Cause | Example | Typical fix |
|---|---|---|
| **Timing / async** | Clicking a button before it's enabled; asserting before an API call finishes | Explicit or auto waits on a condition |
| **Order dependence** | Test B only passes if Test A ran first and created a user | Each test creates its own data |
| **Shared state** | Two parallel tests use the same account or the same file | Unique IDs, isolated resources |
| **External services** | Real payment sandbox is slow or down | Fakes, stubs, record/replay |
| **Time and time zones** | Test fails at midnight or on the 31st | Inject a fixed clock |
| **Randomness** | Random test data sometimes hits an edge case | Fixed seeds; log the seed |
| **Concurrency bugs** | Race condition in the product itself | Fix the product; this is a real bug! |
| **Resource limits** | CI machine is slower, low memory, port already in use | Dynamic ports, resource requests, timeouts based on conditions |
| **Unordered collections** | Asserting list order from a set or a DB query without ORDER BY | Compare as sets or sort first |
| **Test infrastructure** | Browser crashed, device disconnected | Retry at infra level, track infra failures separately |

**Important:** a flaky test is not always a "test problem". Sometimes the test is right and the **product** has a race condition. Micco's post warns that automatic quarantine "could easily mask a real race condition". Always investigate.

## Detection

You can't fix what you can't see. Detection has three layers.

### 1. Rerun failed tests

When a test fails, rerun it on the same code. If it passes on retry, the result is **flaky**, not pass. Micco's post mentions Google tools that can re-run only failing tests, and an option to mark a test as flaky so it "report[s] a failure only if it fails 3 times in a row" – and also notes the downside: it encourages people to ignore flakiness, and a real break in a 15-minute test may take 45 minutes to confirm.

### 2. Track pass rate per test over time

Store every result: test ID, commit, pass/fail, attempt number, duration, machine, error message. Then compute a **flakiness score** per test, for example "the share of commits where the test both passed and failed".

```python
from collections import defaultdict

def flaky_rate(results):
    """results: list of (test_id, commit, passed). Returns test -> flaky rate."""
    by_test = defaultdict(lambda: defaultdict(set))
    for test_id, commit, passed in results:
        by_test[test_id][commit].add(passed)
    rates = {}
    for test_id, commits in by_test.items():
        flaky = sum(1 for outcomes in commits.values() if outcomes == {True, False})
        rates[test_id] = flaky / len(commits)
    return rates

runs = [("t_login", "c1", True), ("t_login", "c1", False),
        ("t_login", "c2", True), ("t_cart", "c1", True), ("t_cart", "c2", True)]
print(flaky_rate(runs))   # {'t_login': 0.5, 't_cart': 0.0}
```

### 3. Proactive detection

- Run **new or changed tests many times** (say 50–100 runs) before they join the blocking suite. One commenter on Micco's post described a "reservoir" where new tests run in a loop for a week first.
- Run the suite in **random order** (`pytest-randomly`) and in **parallel** (`pytest-xdist`) to expose order dependence and shared state.
- Use `pytest-repeat` or `pytest --count=50` (with the plugin) to hammer a suspect test.

## Quarantine: a fair process

**Quarantine** means removing a flaky test from the blocking path (it no longer fails builds) while still running it and tracking it. Micco's post describes a Google tool that automatically quarantines tests when flakiness is too high and files a bug for developers.

A fair quarantine process:

1. **Threshold** – quarantine when the flaky rate is above an agreed limit over a window (example: more than 2% of the last 200 runs).
2. **File a bug automatically** – assigned to the test's owner, with recent failure logs and the flaky rate.
3. **Keep running it** – non-blocking, so you can see whether fixes work.
4. **Deadline** – if not fixed in N days, escalate or delete the test. A test quarantined forever gives zero value.
5. **Safety limit** – if a huge number of tests suddenly look flaky, it's probably infrastructure, not tests. Stop and alert a human.
6. **Un-quarantine** – when it passes reliably for a window (example: 500 consecutive passes), return it to the blocking suite.

**Analogy:** Quarantine is like a cricket team resting an out-of-form player. You don't drop them forever; you send them to the nets, track their practice, and bring them back when they're consistent.

## Fixing patterns, with code

### Pattern 1: Wait for a condition, never sleep

Fixed sleeps are both slow (when the app is fast) and flaky (when the app is slow).

**Playwright (Python)** has auto-waiting built into actions and web-first assertions:

```python
from playwright.sync_api import Page, expect

def test_payment_success_message(page: Page):
    page.goto("/checkout")
    page.get_by_role("button", name="Pay ₹499").click()   # waits until clickable
    # BAD:  time.sleep(5); assert "Success" in page.content()
    # GOOD: retries the check until it passes or the timeout ends
    expect(page.get_by_text("Payment successful")).to_be_visible(timeout=10_000)
```

**Selenium (Python)** needs explicit waits with `WebDriverWait`:

```python
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_payment_success_message(driver):
    driver.get("https://shop.test/checkout")
    wait = WebDriverWait(driver, 10)
    wait.until(EC.element_to_be_clickable((By.ID, "pay"))).click()
    msg = wait.until(EC.visibility_of_element_located((By.ID, "status")))
    assert msg.text == "Payment successful"
# Avoid mixing implicit and explicit waits: Selenium's docs warn it can
# cause unpredictable wait times.
```

For non-UI code, write a small polling helper:

```python
import time

def wait_until(condition, timeout=10.0, interval=0.2):
    """Poll condition() until it returns truthy or the timeout passes."""
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        result = condition()
        if result:
            return result
        time.sleep(interval)
    raise TimeoutError(f"condition not met in {timeout}s")

# Usage: wait_until(lambda: api.get_order("ORD-1")["status"] == "PAID")
```

### Pattern 2: Inject the clock

```python
from datetime import datetime

def is_offer_active(now=None):
    now = now or datetime.now()
    return now.hour < 22          # offer ends at 10 PM

def test_offer_active_at_9pm():
    assert is_offer_active(now=datetime(2026, 10, 5, 21, 0)) is True

def test_offer_inactive_at_11pm():
    assert is_offer_active(now=datetime(2026, 10, 5, 23, 0)) is False
# Without injection, this test would pass in the day and fail at night.
```

### Pattern 3: Fix the random seed, and log it

```python
import random

def test_shuffle_keeps_all_items():
    seed = 12345
    rng = random.Random(seed)          # local generator, fixed seed
    items = list(range(10))
    rng.shuffle(items)
    assert sorted(items) == list(range(10)), f"failed with seed={seed}"
```

For property-based testing with Hypothesis, failing examples are saved and replayed, and you can print the seed to reproduce in CI.

### Pattern 4: Isolate data

```python
import uuid
import pytest

@pytest.fixture
def fresh_user(api):
    email = f"qa+{uuid.uuid4().hex[:8]}@example.com"    # unique per test
    user = api.create_user(email=email)
    yield user
    api.delete_user(user.id)                           # clean up
```

### Pattern 5: Don't depend on order

```python
def test_search_returns_both_restaurants(api):
    names = [r["name"] for r in api.search("dosa")]
    # BAD:  assert names == ["Saravana Bhavan", "MTR"]   (order not guaranteed)
    assert set(names) == {"Saravana Bhavan", "MTR"}
```

Only assert order if the order is part of the requirement (for example "sorted by rating").

### Pattern 6: Replace unreliable external services

Use fakes, stubs or record/replay (see the Test Doubles and Integration and End-to-End Testing chapters) for third-party APIs. Keep a small number of separate, non-blocking tests that hit the real sandbox to detect real changes.

### Pattern 7: Retries – with care

Automatic retry (for example `pytest-rerunfailures`) unblocks developers, but it **hides** flakiness. Rules:
- Record "passed on retry" as **flaky**, not as pass.
- Feed that data into tracking and quarantine.
- Never let retries become the fix.

## Worked example: investigating a flaky checkout test

**Symptom:** `test_checkout_applies_coupon` fails about 1 in 20 runs in CI, never locally.

**Step 1 – Gather data.** Look at the last 200 runs. Failures happen only when tests run in parallel (`-n 8`), never in serial. Error: `expected total 900, got 1000`.

**Step 2 – Form hypotheses.** Parallel-only suggests shared state. Maybe two tests use the same test user, and one test removes the coupon from the shared cart.

**Step 3 – Reproduce.** Run `pytest -n 8 -p randomly --count=50 tests/checkout`. Failure appears 3 times in 50. Logs show `test_remove_coupon` and `test_checkout_applies_coupon` both use `qa_user_1`.

**Step 4 – Fix the root cause.** Replace the hard-coded user with the `fresh_user` fixture (Pattern 4). Each test gets its own cart.

**Step 5 – Verify.** Run 200 times in parallel: 200/200 pass.

**Step 6 – Prevent.** Add a lint rule or code review checklist item: "no hard-coded shared test accounts". Make random-order, parallel runs the default in CI.

**Step 7 – Share.** Write a short note for the team. One fix removed a whole class of flakiness.

## Your story: qaforge-mcp

You built **qaforge-mcp**, an MCP server with 12 QA tools, including **flaky test detection**. Use it as a STAR story (see the Googleyness and Behavioural Interviews chapter). Fill in your real details:

- **Situation:** "Our team's CI had [N] tests and engineers were rerunning builds [often]; nobody trusted red builds."
- **Task:** "I wanted a way to separate flaky failures from real ones automatically."
- **Action:** "I built a flaky-detection tool in qaforge-mcp. It [reads test history / reruns failures / computes a flaky score per test], [ranks the worst offenders], and [suggests likely causes like timing or shared data]."
- **Result:** "[Real numbers: flaky rate dropped from X to Y, CI reruns down by Z, time saved]. And I learned that [lesson]."

Only use numbers you can defend. If you don't have exact numbers, say "roughly" and explain how you measured.

## Interview phrases you can use

- "A flaky test passes and fails on the same code – it's a false alarm that teaches people to ignore real alarms."
- "Google's public data: about 1.5% of test runs flaky and about 16% of tests with some flakiness, from the 2016 Testing Blog post."
- "I'd detect with reruns plus pass-rate tracking, quarantine above a threshold with an auto-filed bug, and set a deadline."
- "Retries unblock people, but I'd record a pass-on-retry as flaky, not green."
- "Before blaming the test, I'd check whether the product has a race condition."

## Tester's corner

- Make "passed on retry" visible in dashboards. Hidden flakiness is the most dangerous kind.
- Random-order and parallel execution in CI expose order dependence and shared state early.
- Every `time.sleep` in a test is a future flaky test. Search for them in code review.
- Quarantine needs an owner and a deadline, or it becomes a graveyard.
- Separate infrastructure failures (browser crash, device offline) from test failures in your metrics.
- Your qaforge-mcp work is a strong interview story; prepare real numbers.

## Key takeaways

- A flaky test passes and fails on the same code; it erodes trust and wastes time.
- Public Google data: about 1.5% of test runs flaky, about 16% of tests with some flakiness, and about 84% of pass-to-fail transitions involving flaky tests (2016 Testing Blog).
- Small per-test flakiness becomes large at suite level: (1 − p)^n.
- Common causes: timing, order dependence, shared state, external services, time, randomness, concurrency, resources.
- Detect with reruns, per-test pass-rate tracking and proactive repeated runs.
- Quarantine fairly: threshold, auto-filed bug, keep running, deadline, safety limit.
- Fix root causes: condition waits, injected clocks, fixed seeds, isolated data, order-independent asserts, fakes.

## Quiz

1. What is the definition of a flaky test used in the 2016 Google Testing Blog post?
   A) A test that is slow
   B) A test that shows both passing and failing results with the same code
   C) A test with no assertions
   D) A test that only fails in production
2. True or false: a flaky test is always a problem with the test code, never the product.
3. If 1,000 independent tests each fail wrongly with probability 0.001, roughly what is the chance the whole suite is green?
   A) 99%  B) 90%  C) 37%  D) 1%
4. Name three common root causes of flaky tests.
5. Which is the best replacement for `time.sleep(5)` in a Playwright test?
   A) `time.sleep(10)`
   B) `expect(locator).to_be_visible()`
   C) Retry the whole test 3 times
   D) Delete the test
6. True or false: when a test passes on retry, it should be recorded as a normal pass.
7. A test fails only when the suite runs in parallel. What is the most likely cause, and what would you check?
8. What five things should a fair quarantine process include?
9. Why should you inject the clock into a function that checks if an offer is active before 10 PM?
10. According to the SWE book, at roughly what flakiness level do tests begin to lose value?
    A) 0.01%  B) 1%  C) 10%  D) 50%

## Answer key

1. **B** - Same code, different results.
2. **False** - Sometimes the test exposes a real race condition in the product. Always investigate before blaming the test.
3. **C** - (1 − 0.001)^1000 ≈ 0.368, so about 37%.
4. Any three of: timing/async waits, order dependence, shared state, external services, time or time zones, randomness, concurrency bugs, resource limits, unordered collections, infrastructure failures.
5. **B** - Web-first assertions retry until the condition is met or the timeout ends.
6. **False** - It should be recorded as flaky so it can be tracked and fixed.
7. Shared state, such as two tests using the same account, file or port. Check what data and resources the tests share, and reproduce with parallel, random-order repeated runs.
8. A threshold, an automatically filed bug for the owner, continued non-blocking runs, a deadline, and a safety limit for mass-flakiness events (plus a rule for un-quarantining).
9. Without it, the test result depends on the time of day the test runs. A fixed injected time makes it deterministic.
10. **B** - The SWE book says that as you approach 1% flakiness, tests begin to lose value.

## Flashcards

- **Q:** What is a flaky test? — **A:** A test that both passes and fails on the same code.
- **Q:** Google 2016 flaky stats? — **A:** About 1.5% of test runs flaky and about 16% of tests with some flakiness.
- **Q:** Share of pass-to-fail transitions involving flaky tests (2016 post)? — **A:** About 84%.
- **Q:** Formula for suite pass chance? — **A:** (1 − p)^n for n tests each with flaky probability p.
- **Q:** Best fix for timing flakiness? — **A:** Wait for a specific condition instead of sleeping a fixed time.
- **Q:** How to find order dependence? — **A:** Run tests in random order and in parallel, many times.
- **Q:** What is quarantine? — **A:** Removing a flaky test from the blocking path while still running and tracking it.
- **Q:** Danger of automatic retries? — **A:** They hide flakiness unless pass-on-retry is recorded as flaky.
- **Q:** How to make time-based tests deterministic? — **A:** Inject a fixed clock or time value.
- **Q:** How to handle random test data? — **A:** Use a fixed seed and log it so failures can be reproduced.
- **Q:** Flaky rate by test size in the 2017 Testing Blog post? — **A:** About 0.5% of small, 1.6% of medium and 14% of large tests were flaky in a week.
- **Q:** Playwright vs Selenium waiting? — **A:** Playwright auto-waits and has web-first assertions; Selenium needs explicit WebDriverWait conditions.

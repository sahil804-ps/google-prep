# Integration and End-to-End Testing

> **In this chapter:**
> - Explain why larger tests exist (fidelity) and what unit tests cannot catch
> - Describe the three parts of a large test: system under test, test data, verification
> - Use hermetic environments, record/replay and contract tests to make larger tests reliable
> - Summarise the "Just Say No to More End-to-End Tests" argument and its limits
> - Design a balanced set of larger tests for a real feature
>
> **Time:** ~50 minutes  |  **Level:** Intermediate

This chapter is based on Chapter 14, "Larger Testing", of *Software Engineering at Google* ([abseil.io/resources/swe-book/html/ch14.html](https://abseil.io/resources/swe-book/html/ch14.html)) and the Google Testing Blog post "Just Say No to More End-to-End Tests" by Mike Wacker, April 2015 ([testing.googleblog.com](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)). Your Selenium and Playwright experience lives mostly in this chapter, so you start with an advantage.

## Definitions first

- **Integration test** – checks that a small group of components work together correctly. Example: your order service plus its real database. The blog post describes it as testing "a small group of units, often two units".
- **End-to-end (E2E) test** – checks the whole system the way a user experiences it. Example: open the app, log in, place an order, see it in order history.
- **Larger tests** – the SWE book's umbrella term for tests that are not small unit tests: they may be slow, use real binaries, span machines, or be non-deterministic.

**Analogy:** Building a house. A unit test checks that each brick is solid. An integration test checks that the bricks and cement hold together in one wall. An E2E test is a family living in the house for a week.

## Why larger tests exist: fidelity

The SWE book says the main reason for larger tests is **fidelity**: how closely a test reflects the real behaviour of the system under test. Unit tests are very different from how code runs in production. They use doubles, small inputs and a single process.

The book lists common gaps that unit tests leave:

1. **Unfaithful doubles** – a mock or fake behaves differently from the real dependency (see the Test Doubles chapter).
2. **Configuration issues** – wrong flags, wrong database URL, missing permission, bad deployment file. The code is fine; the setup is wrong.
3. **Issues under load** – things that only break with many requests.
4. **Unanticipated behaviours, inputs and side effects** – real users and real data do things test authors never imagined.
5. **Emergent behaviours** – problems that only appear when the whole system runs together.

So the pyramid does not mean "avoid larger tests". It means "have a **few, high-value** ones that cover what small tests can't".

## Why not have only larger tests?

The SWE book also lists the costs. Larger tests tend to be:

- **Slow** – build everything, deploy it, then test.
- **Flaky** – networks, shared environments, timing.
- **Hard to debug** – the bug could be anywhere.
- **Hard to own** – who fixes a test that crosses five teams' services?

## "Just Say No to More End-to-End Tests" – the argument

The 2015 blog post tells a composite story about a team building an online document editor. They rely mainly on nightly E2E tests. In the week before the deadline, pass rates swing wildly: a sign-in bug breaks almost every test; a partner team deploys a bad build to the test environment; lab hardware fails; small bugs hide behind big bugs; tests are sometimes flaky. The team ships a week late.

The post's key insight: **a failing test does not directly help the user; a bug fix does.** So you must judge a testing strategy by how well it helps developers *fix* bugs, not only find them. The ideal feedback loop is:

- **Fast** – developers learn quickly if their change works.
- **Reliable** – failures are real, not flaky.
- **Isolates failures** – it points to the broken code.

Unit tests win on all three; E2E tests only win on "simulates a real user". Integration tests sit in between: they catch the "units don't fit together" bugs without the cost of full E2E. The post suggests a "good first guess" of **70% unit, 20% integration, 10% E2E**, and names the ice cream cone and hourglass anti-patterns (see the How Google Thinks About Testing chapter).

### The fair counter-point

The post's message is "no *more*", not "none". Real user journeys still need some E2E coverage, and the SWE book has a full chapter on doing larger tests well. In an interview, show balance: "I'd keep a small set of critical-journey E2E tests and push everything else down."

## The structure of a large test

The SWE book says every large test has three parts: a **system under test (SUT)**, **test data**, and **verification**.

### 1. The system under test (SUT)

The SWE book describes a range of SUT shapes, from small and stable to big and realistic:

| SUT shape | Fidelity | Stability and speed |
|---|---|---|
| Single process (everything in one binary) | Low | Highest |
| Single machine (several processes, local DB) | Medium | High |
| Multi-machine (like a real cloud deployment) | Higher | Lower; network flakiness |
| Shared environment (staging) | High | Low; others change it |
| Production | Highest | Risky |

The book favours **hermetic** SUTs where possible.

**Hermetic** means fully self-contained: the test starts every component it needs and talks to no outside system. Chapter 23 of the SWE book ([ch23](https://abseil.io/resources/swe-book/html/ch23.html)) says hermetic tests have two properties: greater **determinism** and **isolation** – problems in production don't affect the test, and the test doesn't affect production.

**Analogy:** A hermetic test is like a cooking competition where every contestant gets an identical sealed kitchen with the same ingredients. Nobody's dish fails because the gas supply in the building dropped.

The SWE book also recommends **reducing the size of the SUT at problem boundaries**: if your test only needs to check the frontend, replace the real backend with a fake at a clear interface. Find the smallest SUT that still answers your question.

### 2. Test data

The SWE book names several kinds of test data:

- **Seeded data** – data loaded into the SUT before the test starts (a user, a restaurant, a menu).
- **Test traffic** – the requests the test sends during execution.
- **Domain data** – reference data the system needs (city list, tax rates).
- **Realistic baseline** – data that looks like production in size and shape, sometimes sampled and anonymised.

Good practices:
- Each test **creates its own data** with unique IDs, so tests don't fight over the same user.
- **Clean up** after yourself, or use a fresh environment each run.
- Never use real customer personal data in tests without proper anonymisation and approval.

### 3. Verification

How does the test decide pass or fail? The SWE book lists:

- **Manual** – a human looks at the result (exploratory testing, bug bashes).
- **Assertions** – the test checks explicit expected values.
- **A/B comparison (differential)** – run the old and new versions with the same input and compare outputs. Any difference is reviewed. The book calls this **A/B diff regression testing**.

## Tool 1: Hermetic integration tests

The simplest step is to run a real dependency locally in a container for each test run. The Python library **testcontainers** starts a throwaway Docker container from inside a test.

```python
# Medium-size integration test: real PostgreSQL in a throwaway container.
import pytest
from testcontainers.postgres import PostgresContainer
from orders.repo import OrderRepo

@pytest.fixture(scope="module")
def repo():
    with PostgresContainer("postgres:16") as pg:      # starts, then removes
        r = OrderRepo(pg.get_connection_url())
        r.create_schema()
        yield r

def test_saved_order_can_be_read_back(repo):
    order_id = repo.save(user_id="u1", items=["dosa"], total=120)
    order = repo.get(order_id)
    assert order.total == 120 and order.items == ["dosa"]
# Checks the real SQL, schema and driver - things a fake can't check.
```

This catches real problems a fake misses: SQL typos, wrong column types, missing indexes, driver quirks. And it is still hermetic – the database exists only for this run.

## Tool 2: Record/replay

The SWE book describes **record/replay proxies**: in "record" mode, the test talks to the real backend and the proxy saves every request and response. In "replay" mode, the proxy serves the saved responses, so the test is fast and hermetic.

The book notes two important points:
- Because of non-determinism, the proxy needs a **matcher** to decide which saved response fits each request – so it behaves a bit like a stub.
- Recordings get **stale**. The SWE book's CI chapter notes that record/replay can make tests brittle; you need to refresh recordings regularly.

In Python, the **vcrpy** library does record/replay for HTTP calls.

```python
import vcr
from weather import get_temperature

# First run records real HTTP traffic into the cassette file.
# Later runs replay it: no network, same answer every time.
@vcr.use_cassette("cassettes/delhi_weather.yaml", record_mode="once")
def test_get_temperature_parses_api_response():
    temp = get_temperature("Delhi")
    assert isinstance(temp, float)
```

**Analogy:** Record/replay is like recording a cricket commentary once and replaying it for practice. It's perfect for practice – but if the rules of cricket change, your recording is out of date.

## Tool 3: Contract tests

In a microservice world, Service A (the **consumer**) calls Service B (the **provider**). If B changes its response, A breaks. Running a full E2E environment to catch this is slow. **Contract testing** is a cheaper way.

A **contract** is the agreed shape of requests and responses. There are two common styles:

- **Schema contract** – the provider publishes a schema (OpenAPI, JSON Schema, Protocol Buffers). Both sides test against it.
- **Consumer-driven contract** – each consumer writes down exactly what it needs; the provider runs those expectations in its own CI. **Pact** is a popular open-source tool for this.

```python
# Consumer-side contract check using JSON Schema.
from jsonschema import validate

ORDER_SCHEMA = {
    "type": "object",
    "required": ["order_id", "status", "total_paise"],
    "properties": {
        "order_id": {"type": "string"},
        "status": {"enum": ["PLACED", "PREPARING", "DELIVERED", "CANCELLED"]},
        "total_paise": {"type": "integer", "minimum": 0},
    },
}

def test_order_api_matches_contract(order_client):
    response = order_client.get("/orders/ORD-1").json()
    validate(instance=response, schema=ORDER_SCHEMA)   # raises if shape is wrong
```

Contract tests answer "do these two services still agree?" in seconds, without starting the whole world.

## Other kinds of larger tests (from the SWE book)

The SWE book's Larger Testing chapter lists many types. Know the names:

- **Functional testing of one or more interacting binaries**
- **Browser and device testing**
- **Performance, load and stress testing** (see the Performance, Load and Reliability Testing chapter)
- **Deployment configuration testing** – does the server even start with the production config?
- **Exploratory testing and bug bashes**
- **A/B diff regression testing**
- **User acceptance testing (UAT)**
- **Probers and canary analysis** – probers are functional tests that run assertions against production, usually read-only (see the Continuous Delivery and Release Safety chapter)
- **Disaster recovery and chaos engineering** (see the Performance, Load and Reliability Testing chapter)
- **User evaluation** – dogfooding, experiments, rater evaluation

## Making E2E tests less painful

When you do write E2E tests (for example with Playwright), apply these habits:

1. **Only critical journeys.** Login, search, add to cart, pay, view order. Not every button.
2. **Set up state through the API, not the UI.** Create the user and cart by API calls; use the UI only for the step you're testing.
3. **Stable selectors.** Use `data-testid` or accessible roles, not long CSS or XPath chains.
4. **Auto-waiting, never fixed sleeps** (see the Flaky Tests chapter).
5. **Rich failure output.** Screenshot, trace, network log and request IDs attached to every failure.
6. **Clear ownership.** Every E2E test has an owning team.

```python
# Playwright (Python): set up by API, test one journey through the UI.
from playwright.sync_api import Page, expect

def test_user_sees_placed_order_in_history(page: Page, api):
    user = api.create_user()                      # fast setup via API
    api.place_order(user, items=["masala dosa"])
    page.goto("/login")
    page.get_by_label("Email").fill(user.email)
    page.get_by_label("Password").fill(user.password)
    page.get_by_role("button", name="Log in").click()
    page.get_by_role("link", name="My orders").click()
    expect(page.get_by_text("masala dosa")).to_be_visible()   # auto-waits
```

## Worked example: testing "reorder" in a food delivery app

Feature: on the order history screen, a "Reorder" button puts all items from a past order back into the cart, at today's prices, skipping items no longer available.

**Step 1 – What can unit tests cover?** (most of the logic)
- Pricing: items use today's price, not the old price.
- Unavailable items are skipped and listed in a message.
- Empty result (all items unavailable) shows a clear message.

**Step 2 – What needs integration tests?**
- Reorder service + real database (testcontainers): reads the old order correctly, writes the new cart.
- Reorder service + menu service via **contract test**: the menu API's "available" field still has the shape we expect.
- Reorder service + **record/replay** of the pricing service's responses, refreshed weekly.

**Step 3 – What needs E2E tests?** (very few)
- One Playwright journey: log in, open history, tap Reorder, see cart with correct items and total.
- One mobile journey on a real low-end Android device.

**Step 4 – Other larger tests**
- **Deployment configuration test:** the new service starts with production flags in a sandbox.
- **Exploratory session** (charter: "reorder with restaurants closing mid-flow and items going out of stock").
- **Prober in production:** a read-only check that the reorder endpoint responds for a test account.

**Step 5 – Test data plan**
- Each test seeds its own user, restaurant and old order with unique IDs.
- No real customer data.

Count: maybe 15 unit tests, 4–5 integration tests, 2 E2E tests. That is a healthy pyramid.

## Interview phrases you can use

- "Larger tests exist for fidelity – they catch configuration, integration and real-world issues that unit tests can't."
- "I'd keep the SUT as small and hermetic as possible while still answering the question."
- "For service-to-service changes, I'd use contract tests instead of a full end-to-end environment."
- "The 'Just Say No' post argues that a test's value is in helping fix bugs – so fast, reliable, isolating feedback matters most."
- "I'd keep a handful of critical-journey E2E tests and set up their data through the API."

## Tester's corner

- Audit your current E2E suite: which tests are really checking API logic? Move them down to API or integration level.
- Push for hermetic test environments. Shared staging is the top cause of "it failed because someone else deployed".
- Record/replay is a quick win for flaky third-party dependencies – but schedule recording refreshes.
- Contract tests are an excellent SDET project: high leverage, cheap to run, and they prevent painful cross-team breakages.
- Treat test data as code: version it, generate it, isolate it.
- When an E2E test fails, the first question should be "could a smaller test have caught this?"

## Key takeaways

- Larger tests exist for fidelity: they catch unfaithful doubles, config issues, load issues and emergent behaviour.
- They are slower, flakier and harder to debug, so keep them few and high-value.
- A large test has three parts: SUT, test data and verification.
- Hermetic SUTs give determinism and isolation; shrink the SUT at clear boundaries.
- Record/replay and contract tests make service interactions testable without full environments.
- "Just Say No to More End-to-End Tests" judges tests by fast, reliable, failure-isolating feedback and suggests roughly 70/20/10.
- E2E tests should cover critical journeys, set up data by API, use stable selectors and never use fixed sleeps.

## Quiz

1. What does the SWE book say is the primary reason larger tests exist?
   A) Speed  B) Fidelity  C) Code coverage  D) Cost savings
2. True or false: a hermetic test can call the production payments API.
3. Name the three parts of a large test according to the SWE book.
4. What is the main risk of record/replay tests over time?
   A) They are too slow
   B) Recordings become stale and tests brittle
   C) They need production access
   D) They can't run in CI
5. Which tool is commonly used for consumer-driven contract testing?
   A) Pact  B) Locust  C) Bazel  D) vcrpy
6. According to the "Just Say No" post, what three properties make an ideal feedback loop?
7. True or false: the "Just Say No" post says teams should delete all their end-to-end tests.
8. Your E2E tests fail every week because another team deploys to shared staging. What would you propose?
9. What is A/B diff regression testing?
10. In a Playwright E2E test, why set up the user and cart through the API instead of the UI?

## Answer key

1. **B** - Fidelity: how closely the test reflects real system behaviour.
2. **False** - Hermetic tests have no external dependencies like production backends.
3. **System under test (SUT), test data, and verification.**
4. **B** - Saved responses drift from the real service, so recordings must be refreshed.
5. **A** - Pact is a popular open-source consumer-driven contract testing tool.
6. **Fast, reliable, and isolates failures.**
7. **False** - It argues against relying mainly on E2E tests and suggests a pyramid with a small share of E2E tests.
8. A hermetic environment per test run (for example containers), fakes or record/replay for partner services, and contract tests for cross-team interfaces.
9. Running the old and new versions with the same inputs and comparing outputs; differences are reviewed as possible regressions.
10. It is faster and less flaky, and it keeps the UI test focused on the one journey being tested.

## Flashcards

- **Q:** What is fidelity in testing? — **A:** How closely a test reflects the real behaviour of the system under test.
- **Q:** What does hermetic mean? — **A:** Fully self-contained, with no external dependencies like production backends.
- **Q:** Two properties of hermetic tests? — **A:** Greater determinism and isolation.
- **Q:** Three parts of a large test? — **A:** System under test, test data and verification.
- **Q:** What is record/replay? — **A:** Record real backend responses once, then replay them in tests for speed and stability.
- **Q:** What is a contract test? — **A:** A test that checks two services still agree on request and response shapes.
- **Q:** What is consumer-driven contract testing? — **A:** Consumers write their expectations and the provider runs them in its CI.
- **Q:** "Just Say No" ideal feedback loop? — **A:** Fast, reliable and isolates failures.
- **Q:** "Just Say No" first-guess split? — **A:** 70% unit, 20% integration, 10% end-to-end.
- **Q:** What is a prober? — **A:** A functional test that runs assertions against production, usually read-only.
- **Q:** What is A/B diff regression testing? — **A:** Comparing outputs of old and new versions on the same inputs.

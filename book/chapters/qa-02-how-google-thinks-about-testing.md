# How Google Thinks About Testing

> **In this chapter:**
> - Explain why Google made engineers own testing, using the public GWS story
> - Describe test *size* (resources) and test *scope* (how much code) and why they are different
> - Draw the test pyramid and name the "ice cream cone" and "hourglass" anti-patterns
> - Use the Beyoncé Rule and explain why code coverage is a weak goal
> - Answer "What does a test engineer do at Google?" in a clear, honest way
>
> **Time:** ~40 minutes  |  **Level:** Beginner

This chapter is based mainly on Chapter 11, "Testing Overview", of the free book *Software Engineering at Google* (Titus Winters, Tom Manshreck and Hyrum Wright, O'Reilly 2020): [abseil.io/resources/swe-book/html/ch11.html](https://abseil.io/resources/swe-book/html/ch11.html). When this chapter says "the SWE book", that is the source. Everything about Google here is what Google has published. Real team practices inside Google vary, and you should say so in an interview.

## The big idea: tests give you confidence to change code

Most people think the goal of testing is to "find bugs". Google frames it differently. The SWE book says the main value of tests is to let engineers **change code quickly and safely**. A codebase with a strong test suite is like a cricket team with a good wicketkeeper: the bowlers can bowl aggressively because someone reliable is behind the stumps to catch the edges.

If you can't change code without fear, you slow down. Every release becomes a risky event. Good tests turn releases into a boring, routine thing. Boring releases are the goal.

## The GWS story: why engineers own testing

The SWE book tells a public story about the **Google Web Server (GWS)**, the server that handles Google Search requests. In the early days, GWS had little automated testing. The book says that at one point, more than 80% of production pushes contained user-affecting bugs that had to be rolled back. Engineers were afraid to change anything.

The tech lead then made a rule: **all new code changes must include tests, and those tests run continuously.** Within a year, according to the book, the number of emergency pushes dropped by half, even though the team was making a record number of changes.

The lesson the book draws: you cannot rely on clever programmers alone to avoid bugs. Even if each person writes very few bugs, a large team writes many bugs in total. Automated tests catch them every time, at near-zero cost per run.

### What "engineers own testing" means

At Google, the person who writes a change is expected to write the tests for it. Testing is not a separate phase done later by a separate team. This is sometimes called "shift left": move testing earlier, closer to the code.

This does **not** mean test engineers are not needed. It means their job changes. Instead of writing every test by hand, a test engineer (SWE-Test, SETI or similar titles over the years) usually:

- builds test infrastructure, frameworks and tools that make testing easy for everyone;
- designs the test strategy for a product and finds the risky areas;
- writes the hard tests: large end-to-end, performance, reliability and fault-injection tests;
- measures quality and makes test health visible (flakiness, coverage, run time);
- teaches and reviews: helps developers write better tests.

**Analogy:** In a big restaurant, every cook tastes their own dish (engineers own testing). But there is also a head chef who designs the kitchen, sets standards, and builds tools so every cook can taste quickly and correctly (the test engineer).

### How the culture spread (public history)

The SWE book describes a volunteer group called the **Testing Grouplet** that spread testing culture after the GWS success. Three things it lists:

- **Orientation classes** that taught new engineers about testing.
- **Test Certified** – a levelled program (1 to 5) that gave teams a step-by-step path. Level 1 included setting up a continuous build, tracking coverage, classifying tests by size, and identifying flaky tests. The book says it helped more than 1,500 projects before being replaced in 2015 by an automated tool called Project Health (pH).
- **Testing on the Toilet (TotT)** – one-page testing tips posted in bathrooms. Many of these were later published on the Google Testing Blog.

You don't need to memorise this history. But mentioning "Testing on the Toilet" or "Test Certified" shows you have read the public material.

## Test size vs test scope

This is the most important idea in this chapter, and many candidates mix it up. Google separates two dimensions of a test.

### Test size: what resources the test uses

Size is about *where the test runs and what it is allowed to touch*. The SWE book defines:

| Size | Constraint (from the SWE book) | Typical example |
|---|---|---|
| **Small** | Runs in a **single process** (often a single thread). No network, no disk-backed database, no sleep. | A pure function test with pytest |
| **Medium** | Runs on a **single machine**. Can use multiple processes, threads and network calls to `localhost` only. | Your service plus a local database in a container |
| **Large** | No such restriction. Can span **multiple machines**, for example a remote cluster. | A full end-to-end test against a staging environment |

The book says these constraints can be *enforced* by the test infrastructure. The point of the constraints is speed and determinism. A small test cannot be slow or flaky because of the network, because it is not allowed to use the network.

**Analogy:** Think about practising cricket. A small test is shadow batting in your room: fast, repeatable, nothing can go wrong. A medium test is batting in the nets at your local ground: more realistic, still controlled. A large test is a real match at a stadium: most realistic, but weather, crowd and pitch can all change the result.

### Test scope: how much code is being validated

Scope is about *how much of your code the test is checking*.

- **Narrow scope** (unit test) – checks one class or function.
- **Medium scope** (integration test) – checks the interaction of a few components.
- **Large scope** (end-to-end or system test) – checks the whole system.

### Why the difference matters

Size and scope are usually related, but not always. Examples:

- A unit test (narrow scope) that talks to a real database server is a *medium-size* test. It is now slower and more flaky than it needs to be. The fix is often a fake database (see the Test Doubles chapter).
- An integration test (medium scope) that runs a few components in one process with fakes can be a *small-size* test. This is great: you check interactions but keep speed and determinism.

In an interview, if someone asks "what's the difference between a unit test and a small test?", say: **"Scope is how much code I check. Size is what resources the test needs. A unit test is narrow scope, but it is only small size if it stays in one process with no I/O."**

## The test pyramid

The SWE book gives a rough guideline for scope: about **80% unit tests, 15% integration tests, 5% end-to-end tests**. It draws this as a pyramid.

```text
          /\        5%  end-to-end (large scope)
         /  \
        /----\      15% integration (medium scope)
       /      \
      /--------\    80% unit (narrow scope)
```

A 2015 Google Testing Blog post by Mike Wacker, "Just Say No to More End-to-End Tests" ([link](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)), gives a similar "good first guess" of 70/20/10. Both sources stress that the exact numbers vary by team. The *shape* is what matters: many fast, narrow tests at the bottom, few slow, broad tests at the top.

### Why unit tests form the base

The SWE book says unit tests are fast, stable, and make failure diagnosis quick. When a unit test fails, you know exactly which function broke. When an end-to-end test fails, the bug could be anywhere: frontend, backend, network, test data, or a partner's server.

### The two anti-patterns

The SWE book names two bad shapes.

- **Ice cream cone** – many end-to-end tests, few integration tests, very few unit tests. The book says this often happens when a prototype is rushed to production. Suites become slow, unreliable and hard to work with. Many QA teams that only automate through the UI with Selenium end up here.
- **Hourglass** – many unit tests and many end-to-end tests, but few integration tests in the middle. The book says this often happens when tight coupling makes it hard to create components in isolation. Bugs that a medium test would catch quickly are only caught by slow end-to-end tests.

**Honest note for your interview:** Your past work may be mostly UI automation. That is fine. Show that you understand *why* the pyramid exists and how you would push tests down the pyramid. Example: "In my last project, 70% of our Selenium tests were really checking API logic. I moved those checks to API-level tests. Suite time dropped and flakiness went down."

## Larger tests still matter

The pyramid does not mean "never write end-to-end tests". The SWE book says larger tests act as **sanity checks** as the product develops, and they catch things unit tests cannot: configuration problems, integration problems and real-world behaviour. The Integration and End-to-End Testing chapter covers this.

## The Beyoncé Rule

The SWE book describes a principle Google calls the **Beyoncé Rule**: *"If you liked it, then you shoulda put a test on it."* (It is a joke on a Beyoncé song lyric.)

What it means: if you care about some behaviour, you must have a test for it. The book says this rule is often used by infrastructure teams who make changes across the whole codebase. If their change passes all your tests but still breaks your product, *you* are responsible for fixing it and adding the missing test – because you didn't protect what you cared about.

**Analogy:** If you park your bike outside a railway station without a lock and it is stolen, people will say: "If you liked it, you should have put a lock on it." Tests are the lock on behaviour you care about.

This rule matters a lot in a monorepo (one big shared repository), where other teams can change code that your product depends on. Your tests are the contract that tells them what not to break.

## Code coverage: useful, but not a goal

Code coverage measures which lines (or branches) ran during tests. The SWE book warns about two problems:

1. **Coverage shows code ran, not that it was checked.** A test with no assertions still gives coverage.
2. **It becomes a goal by itself.** The book gives the example of a team that sets an 80% bar. Engineers start treating 80% as a ceiling, not a floor, and stop at 80%.

The book suggests thinking about *which behaviours* are tested, rather than chasing a number. A useful idea from outside the book is **mutation testing**: a tool makes small changes ("mutants") to your code, like changing `<` to `<=`. If your tests still pass, they are not checking that logic.

```python
# Coverage can be 100% while the test checks nothing useful.
def apply_discount(price, percent):
    return price - price * percent / 100

def test_apply_discount_runs():
    apply_discount(1000, 10)   # 100% line coverage, but no assert!

def test_apply_discount_ten_percent():
    assert apply_discount(1000, 10) == 900   # actually checks behaviour
# Both tests give 100% line coverage. Only the second can catch a bug.
```

## Flakiness: why test trust is precious

A **flaky test** passes and fails on the same code. The SWE book gives a simple calculation: if each test has a 0.1% chance of failing wrongly and you run 10,000 tests a day, you investigate 10 false failures every day. The book says that as flakiness approaches 1%, tests begin to lose value, and that Google's flaky rate "hovers around 0.15%". The Flaky Tests chapter is all about this problem.

## Worked example: explain the pyramid in two minutes

Interviewers often ask: "How would you set up testing for a new service?" Here is a two-minute answer using this chapter's ideas, for a "food order tracking" service (like Swiggy's live order status).

> "First, I'd make engineers own tests: every change ships with tests, run in CI on every commit.
>
> At the base, I'd put many **small, narrow** unit tests. For example, the logic that turns raw GPS points into an estimated delivery time. These run in one process in milliseconds, so engineers run them constantly.
>
> In the middle, **medium** integration tests: the tracking service plus a real database in a local container, and a fake for the maps API. These check that queries, serialisation and caching work together.
>
> At the top, a **small number of large** end-to-end tests: place an order in the app on a staging environment, move a simulated rider, and check the status screen updates. Maybe five to ten critical journeys, not hundreds.
>
> I'd watch for the ice cream cone – if we find ourselves adding many UI tests, I'd ask if the check could move down to the API or unit level. I'd track flakiness and test run time from day one, and I wouldn't chase a coverage number; I'd ask 'which behaviours do users care about, and does each have a test?' – the Beyoncé Rule."

Notice the structure: ownership → pyramid layers with concrete examples → anti-patterns → metrics. Practise saying this out loud.

## Interview phrases you can use

- "At Google, as described in *Software Engineering at Google*, engineers own testing. The test engineer's role is to make testing easy and effective for everyone."
- "I separate test *size* – what resources a test uses – from test *scope* – how much code it validates."
- "I'd aim for a pyramid shape; the SWE book suggests roughly 80/15/5, but the shape matters more than the exact numbers."
- "If we care about it, we should put a test on it – the Beyoncé Rule."
- "Coverage tells me what code ran, not what was verified. I'd look at behaviours and maybe mutation testing."

## Tester's corner

- Your job in a Google-style team is less "write all the tests" and more "make the whole team test well". Show leverage: frameworks, tools, coaching.
- When you see many UI tests checking business logic, that is an ice cream cone. Propose moving checks down.
- Classify your existing tests by size. Medium tests pretending to be unit tests are a hidden source of slowness and flakiness.
- Use the Beyoncé Rule to argue for tests on critical behaviour, especially behaviour that other teams' changes could break.
- Never present a coverage number as proof of quality. Pair it with "which risks are covered".
- When talking about Google, quote public sources and say "as described in" – don't guess internal details.

## Key takeaways

- Google's main reason for testing is confidence to change code fast and safely.
- The public GWS story showed that engineer-owned, automated testing reduced emergency pushes sharply.
- Test size is about resources (small = one process, medium = one machine, large = many machines). Test scope is about how much code is validated.
- The test pyramid (roughly 80/15/5 in the SWE book, 70/20/10 in the 2015 blog post) favours many narrow tests and few broad ones.
- Avoid the ice cream cone and the hourglass.
- The Beyoncé Rule: if you care about a behaviour, put a test on it.
- Coverage is a weak goal on its own; flakiness destroys trust in tests.

## Quiz

1. According to the SWE book, what is the main constraint on a *small* test?
   A) It must finish in under one second
   B) It must run in a single process
   C) It must test only one function
   D) It must use mocks
2. True or false: test size and test scope always mean the same thing.
3. A medium-size test is allowed to:
   A) Call a staging server in another data centre
   B) Make network calls only to localhost
   C) Use no threads at all
   D) Run only in production
4. What rough mix of unit / integration / end-to-end tests does the SWE book suggest?
5. Which anti-pattern has many end-to-end tests and very few unit tests?
   A) Hourglass  B) Pyramid  C) Ice cream cone  D) Diamond
6. State the Beyoncé Rule in your own words.
7. True or false: if a test suite has 100% line coverage, every behaviour is verified.
8. In the GWS story, what policy did the tech lead introduce?
9. Your team's suite has 400 Selenium tests and 50 unit tests. Runs take 3 hours and fail randomly. What would you do?
10. A unit test that connects to a real PostgreSQL server on the same machine is what size?
    A) Small  B) Medium  C) Large  D) It has no size

## Answer key

1. **B** - The SWE book says small tests must run in a single process, often a single thread, to keep them fast and deterministic.
2. **False** - Size is about resources used; scope is about how much code is validated. A narrow-scope test can be medium size if it uses a real database.
3. **B** - Medium tests can use multiple processes and network calls, but only to localhost (one machine).
4. Roughly **80% unit, 15% integration, 5% end-to-end**. The shape matters more than the exact numbers.
5. **C** - The ice cream cone is the inverted pyramid: mostly end-to-end tests.
6. If you care about a behaviour, write a test for it. If someone else's change breaks an untested behaviour, it is your job to fix it and add the test.
7. **False** - Coverage shows the code ran. Tests without good assertions verify nothing.
8. All new code changes must include tests, and those tests run continuously.
9. Find which UI tests are really checking logic and move those checks down to API or unit level; keep a small set of critical end-to-end journeys; track flaky tests and quarantine or fix them; run fast tests on every commit and slow tests later.
10. **B** - It runs on one machine and uses another process (the database), so it is medium size, even though its scope is narrow.

## Flashcards

- **Q:** What does Google see as the main value of tests? — **A:** Confidence to change code quickly and safely.
- **Q:** Small test constraint? — **A:** Runs in a single process, often a single thread, with no network.
- **Q:** Medium test constraint? — **A:** Runs on one machine; can use multiple processes and localhost network calls.
- **Q:** Large test constraint? — **A:** No size restriction; can span multiple machines.
- **Q:** Test size vs test scope? — **A:** Size is resources used; scope is how much code is validated.
- **Q:** SWE book pyramid mix? — **A:** Roughly 80% unit, 15% integration, 5% end-to-end.
- **Q:** What is the ice cream cone? — **A:** An inverted pyramid with mostly end-to-end tests and few unit tests.
- **Q:** What is the hourglass? — **A:** Many unit and end-to-end tests but few integration tests in the middle.
- **Q:** What is the Beyoncé Rule? — **A:** "If you liked it, then you shoulda put a test on it."
- **Q:** Why is code coverage a weak goal? — **A:** It shows code ran, not that behaviour was checked, and teams treat the target as a ceiling.
- **Q:** What was Testing on the Toilet? — **A:** One-page testing tips posted in Google bathrooms to spread testing culture.

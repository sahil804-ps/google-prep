# CI and Test Infrastructure

> **In this chapter:**
> - Explain continuous integration, presubmit and post-submit, and what belongs in each
> - Describe how large CI systems select, cache and shard tests to stay fast
> - Explain culprit finding (bisection) and why fast rollback matters
> - Understand hermetic builds and the basics of Bazel
> - Sketch a test infrastructure design in an interview, using what Google has published about TAP
>
> **Time:** ~50 minutes  |  **Level:** Intermediate

This chapter is based on Chapter 23, "Continuous Integration", of *Software Engineering at Google* ([abseil.io/resources/swe-book/html/ch23.html](https://abseil.io/resources/swe-book/html/ch23.html)), with Bazel details from the official Bazel documentation ([bazel.build](https://bazel.build/)). Test infrastructure is where a test engineer has the most leverage. One good CI improvement saves time for every engineer, every day.

## What is continuous integration?

**Continuous integration (CI)** means every engineer's changes are merged into a shared codebase often – many times a day – and every change is automatically built and tested.

The SWE book describes CI as continuously assembling and testing the entire complex, fast-changing system, so problems are found as early as possible.

**Analogy:** Think about a group of friends writing one shared wedding speech. If each person writes alone for a month and you combine everything on the wedding day, it will be a mess – contradictions, repeated jokes, wrong names. If everyone adds a paragraph every day and someone reads the whole speech each time, problems are fixed immediately. CI is reading the whole speech after every paragraph.

### Core CI concepts (from the SWE book)

- **Fast feedback loops** – the sooner a problem is found, the cheaper it is to fix. The book shows cost rising as a bug moves from editing, to code review, to presubmit, to release, to production.
- **Accessible and actionable feedback** – a failure must be easy to understand and act on (good logs, clear messages, links).
- **Automation** – build, test and release steps run without human hands.
- **Continuous build** – the latest code is built and tested continuously.
- **Continuous testing** – tests run throughout the pipeline, not just at one stage.

## Presubmit vs post-submit

This is a core interview topic.

- **Presubmit** – tests run *before* a change is merged. They gate the merge: if they fail, the change can't go in. Like a pull-request check on GitHub.
- **Post-submit** – tests run *after* the change is merged. They can be larger and slower, and they catch what presubmit missed.

The SWE book's rule of thumb for presubmit: **"only fast, reliable ones."** You accept some loss of coverage at presubmit, which means some problems will be caught at post-submit, and you need good rollback for those. At post-submit, you can accept longer run times and some instability, as long as you have mechanisms to deal with it.

| | Presubmit | Post-submit |
|---|---|---|
| When | Before merge | After merge |
| Blocks the change? | Yes | No (but failures must be fixed fast) |
| Test types | Small, fast, reliable; affected tests only | All affected tests including large and slow ones |
| Goal | Keep broken code out | Catch what slipped through; find the culprit |

**Analogy:** Airport security. Presubmit is the quick scan at the entry gate – every passenger, fast, must be reliable. Post-submit is the detailed baggage screening in the back – slower, more thorough, and if it finds something, they come and find you.

The SWE book also mentions **release candidate testing** (testing the exact build that will be released, usually with larger tests) and **production testing** (probers and canaries, covered in the Continuous Delivery and Release Safety chapter).

### Why presubmit alone isn't enough

The SWE book explains: even if all presubmit tests pass, two changes can each pass alone but break when combined. Also, presubmit only runs a subset of tests. So post-submit always matters.

## TAP: what Google has published

The SWE book describes Google's global continuous build, called **TAP (Test Automation Platform)**. Facts stated in the book:

- TAP runs the majority of Google's automated tests and is the gateway for almost all changes, because Google uses a monorepo.
- Every day it handles more than **50,000 unique changes** and runs more than **four billion individual test cases** (figures as of the book's writing).
- At presubmit, TAP runs a fast subset of affected tests; after submission, it asynchronously runs all potentially affected tests, including larger ones.
- Google's build tools (called Forge and Blaze in the book) keep a near-real-time **global dependency graph**, so TAP can work out which tests are downstream of any change.
- Because there are more than one change per second, TAP can't run every test on every change. It **batches** related changes together.
- When a batch fails, TAP **splits the batch** and reruns tests on each change; developers also have culprit-finding tools to **binary search** through a batch.
- The book says there is a cultural norm against committing new work on top of known failing tests, a **Build Cop** role is responsible for fixing broken builds, and **rollback** is the Build Cop's most effective tool. TAP was upgraded to automatically roll back changes when it has high confidence they are the culprit.

Do not claim more than this about TAP in an interview. Say "as described in *Software Engineering at Google*".

## Technique 1: Test selection

Running every test on every change is too slow at scale. **Test selection** runs only the tests that could be affected by a change.

The most reliable way is a **dependency graph**: if file `pricing.py` changed, find every target that depends on it (directly or indirectly), and run only their tests. This is what the SWE book says TAP does with the global dependency graph.

```python
from collections import deque

def affected_tests(reverse_deps, changed, is_test):
    """reverse_deps: target -> list of targets that depend on it."""
    seen, queue = set(changed), deque(changed)
    while queue:                          # breadth-first search upward
        node = queue.popleft()
        for parent in reverse_deps.get(node, []):
            if parent not in seen:
                seen.add(parent)
                queue.append(parent)
    return sorted(t for t in seen if is_test(t))

rdeps = {"pricing": ["cart", "pricing_test"], "cart": ["checkout", "cart_test"],
         "checkout": ["checkout_test"], "search": ["search_test"]}
print(affected_tests(rdeps, ["pricing"], lambda t: t.endswith("_test")))
# ['cart_test', 'checkout_test', 'pricing_test']  - search_test is skipped
```

This is a nice small coding question in itself: it is breadth-first search on a graph.

Other selection ideas used across the industry:
- **Test impact analysis** using coverage data (which tests executed this file last time).
- **Predictive selection** using machine learning on history (which tests tend to fail for changes like this one). These are riskier, so they are usually backed by full post-submit runs.

## Technique 2: Caching

If neither the code nor the test changed, the test result can't change – so reuse the old result. This only works if builds and tests are **hermetic and deterministic** (see below).

A cache key is a hash of everything that affects the result: source files, dependencies, compiler and tool versions, flags, environment. Same key → reuse result.

**Analogy:** A teacher who already checked your maths homework doesn't check it again if you hand in exactly the same sheet. But if even one number changed, it must be checked again.

## Technique 3: Sharding

**Sharding** splits a big test suite across many machines that run in parallel. If 1,000 test minutes are spread over 50 machines, wall-clock time can drop to about 20 minutes (plus overhead).

Two common strategies:
- **Hash-based** – `shard = hash(test_id) % N`. Simple and stable, but shards may be unbalanced.
- **Duration-based** – use past run times to balance the load. Greedy: assign the longest test to the least-loaded shard.

```python
import heapq

def balance_shards(durations, n_shards):
    """Greedy: give each test (longest first) to the least-loaded shard."""
    heap = [(0.0, i, []) for i in range(n_shards)]   # (load, id, tests)
    for test, secs in sorted(durations.items(), key=lambda x: -x[1]):
        load, i, tests = heapq.heappop(heap)
        tests.append(test)
        heapq.heappush(heap, (load + secs, i, tests))
    return sorted((round(load, 1), tests) for load, _, tests in heap)

times = {"t_pay": 120, "t_search": 90, "t_cart": 60, "t_login": 30, "t_menu": 30}
print(balance_shards(times, 2))
# [(150.0, ['t_search', 't_cart']), (180.0, ['t_pay', 't_login', 't_menu'])]
```

Sharding only works well if tests are **independent** (no order dependence, no shared state) – another reason flakiness work (see the Flaky Tests chapter) matters. In pytest, the `pytest-xdist` plugin runs tests in parallel processes on one machine.

## Technique 4: Culprit finding (bisection)

Post-submit finds a failure. Between the last green run and this red run, there were 40 changes. Which one broke it?

**Bisection** is binary search over the change list: test the middle change; if it fails, the culprit is in the first half; if it passes, in the second half. 40 changes need at most about 6 test runs (log₂ 40 ≈ 5.3).

```python
def find_culprit(changes, is_broken):
    """changes: ordered list; changes[-1] is known broken, before it was green.
    is_broken(c): build + test at change c, True if failing."""
    lo, hi = 0, len(changes) - 1          # answer is in [lo, hi]
    while lo < hi:
        mid = (lo + hi) // 2
        if is_broken(changes[mid]):
            hi = mid                       # culprit is mid or earlier
        else:
            lo = mid + 1                   # culprit is after mid
    return changes[lo]

commits = [f"c{i}" for i in range(1, 41)]
print(find_culprit(commits, lambda c: int(c[1:]) >= 27))   # c27
```

Git has this built in: `git bisect start`, `git bisect bad`, `git bisect good <commit>`, and `git bisect run pytest tests/test_x.py` automates it.

**Warning:** bisection assumes the failure is deterministic. A flaky test makes bisection point at the wrong change. That is why the SWE book's CI chapter and the flaky-test post both stress fighting flakiness.

## Technique 5: Fast rollback

Once you know the culprit, the fastest fix is usually to **roll it back** (revert it), then fix it calmly. The SWE book says rolling back "is often the fastest and safest route to fix a build because it quickly restores the system to a known good state", and sums it up: tests give confidence to change; rollbacks give confidence to undo.

## Hermetic builds

A build is **hermetic** when its output depends only on declared inputs: source code, declared dependencies at fixed versions, and pinned tools. It does not depend on what happens to be installed on the machine, the network, or the time of day.

Why it matters:
- **Reproducibility** – anyone gets the same result; "works on my machine" disappears.
- **Caching** – if output depends only on inputs, you can safely reuse cached results.
- **Remote execution** – builds and tests can run on any machine in a fleet.

**Analogy:** A hermetic build is like a packaged meal kit with exact ingredients and a printed recipe. Any cook anywhere produces the same dish. A non-hermetic build is "use whatever is in your fridge".

## Bazel basics

**Bazel** is the open-source build and test tool released by Google; its documentation describes it as the open-source version of Google's internal tool **Blaze**. Key ideas from the Bazel docs:

- Code is organised into **packages**, each with a `BUILD` file.
- A `BUILD` file declares **targets** (libraries, binaries, tests) and their **explicit dependencies**.
- Targets are named with **labels** like `//shop/pricing:pricing_test`.
- Bazel builds a dependency graph, rebuilds only what changed, and caches results (locally or with a **remote cache**).
- `bazel test //...` runs all tests; Bazel only re-runs tests whose inputs changed and marks others as `(cached) PASSED`.
- Tests have a **`size`** attribute (`small`, `medium`, `large`, `enormous`) that sets a default timeout, and a **`shard_count`** attribute to split a test across shards.
- Flaky tests can be marked `flaky = True`, which makes Bazel retry them – useful, but remember the Flaky Tests chapter: retries hide problems.

```python
# BUILD file (Bazel's Starlark language uses Python-like syntax)
py_library(
    name = "pricing",
    srcs = ["pricing.py"],
)

py_test(
    name = "pricing_test",
    srcs = ["pricing_test.py"],
    deps = [":pricing"],          # explicit dependency
    size = "small",               # sets the default timeout
)

py_test(
    name = "checkout_integration_test",
    srcs = ["checkout_integration_test.py"],
    deps = [":pricing", "//shop/cart"],
    size = "medium",
    shard_count = 4,              # split across 4 shards
)
# Run: bazel test //shop/...   (unchanged tests show "(cached) PASSED")
```

You don't need to be a Bazel expert for the interview. Knowing *why* explicit dependencies enable test selection, caching and sharding is the important part.

## Worked example: "Our CI takes 90 minutes. Fix it."

This is a very common interview prompt in a test-engineering loop. Here is a structured answer.

**1. Measure first.** Where does the time go? Break the pipeline into stages: checkout, dependency install, build, unit tests, integration tests, E2E tests, reporting. Collect p50 and p95 per stage and per test over the last two weeks. Find the slowest 20 tests and the flakiest 20 tests.

**2. Split presubmit and post-submit.** Presubmit: build + small tests + affected medium tests, target under 10–15 minutes. Move E2E and slow suites to post-submit or nightly, with fast rollback.

**3. Run less.** Introduce test selection based on the dependency graph. A change to the search module shouldn't run payment E2E tests.

**4. Run in parallel.** Shard tests across machines using past durations. Make sure tests are independent first (random-order runs).

**5. Don't redo work.** Cache dependencies and build outputs; make the build hermetic (pinned versions, no network during build) so caching is safe.

**6. Make tests faster.** Replace sleeps with condition waits; set up E2E data via API; replace slow external calls with fakes or record/replay; push logic checks down the pyramid.

**7. Fix flakiness.** Quarantine above a threshold; flaky retries otherwise waste whole pipeline runs.

**8. Make failures actionable.** Clear failure summaries, links to logs, owner of each failing test. The SWE book's Google Takeout case study describes how adding links to logs directly in failure messages reduced the team's debugging involvement.

**9. Track and report.** Dashboard: pipeline p50/p95, flaky rate, cache hit rate, cost per run. Set a goal, for example "presubmit p95 under 15 minutes".

## Interview phrases you can use

- "Presubmit should run only fast, reliable tests – the SWE book's rule of thumb – and post-submit catches the rest, backed by fast rollback."
- "With an explicit dependency graph, I can run only affected tests and cache everything else."
- "I'd shard by historical duration, but first make sure tests are independent."
- "To find the culprit, I'd bisect over the change range – but only after ruling out flakiness, which breaks bisection."
- "As described in the SWE book, TAP batches changes and splits failing batches to find culprits."

## Tester's corner

- CI improvements are the highest-leverage work a test engineer can do. Measure the before and after.
- Treat the CI pipeline as a product: it has users (engineers), SLOs (feedback time), and bugs.
- Flaky tests break bisection, caching trust and sharding. Fix flakiness before scaling.
- Hermeticity is the foundation of caching, remote execution and reproducibility.
- Failure messages are a user interface. Put the cause and the log link in the message.
- In your interview, connect your own CI experience (Jenkins, GitHub Actions, GitLab CI) to these concepts.

## Key takeaways

- CI means integrating and testing changes continuously, so problems are found early.
- Presubmit runs fast, reliable tests before merge; post-submit runs everything affected, including larger tests.
- Test selection via dependency graphs, caching of unchanged results, and sharding across machines keep CI fast.
- Culprit finding uses bisection (binary search) over changes; flakiness breaks it.
- Fast rollback restores a known good state; tests give confidence to change, rollbacks give confidence to undo.
- Hermetic builds make results reproducible and cacheable.
- Bazel (the open-source version of Blaze) uses explicit dependencies, caching, test sizes and sharding.

## Quiz

1. What is the SWE book's rule of thumb for which tests to run at presubmit?
   A) All tests
   B) Only end-to-end tests
   C) Only fast, reliable ones
   D) Only tests written this week
2. True or false: if all presubmit tests pass, post-submit testing is unnecessary.
3. 64 changes landed between a green run and a red run. At most how many test runs does bisection need?
   A) 6  B) 16  C) 32  D) 64
4. Why does test selection need an accurate dependency graph?
5. Which of these makes caching test results safe?
   A) Running tests at night
   B) Hermetic, deterministic builds and tests
   C) More retries
   D) Bigger machines
6. What does Bazel's `shard_count` attribute do?
7. True or false: according to the SWE book, TAP runs every test on every single change.
8. Your CI pipeline takes 90 minutes. Give the first three things you would do.
9. Why can a flaky test break culprit finding?
10. What does the SWE book call the role responsible for fixing broken builds, and what is its most effective tool?

## Answer key

1. **C** - Only fast, reliable tests at presubmit; catch the rest at post-submit with good rollback.
2. **False** - Presubmit runs a subset, and two changes can pass alone but break together.
3. **A** - log₂ 64 = 6.
4. To know exactly which tests are downstream of a change, so you skip unaffected tests without missing affected ones.
5. **B** - If outputs depend only on declared inputs, the same inputs always give the same result, so reuse is safe.
6. It splits that test target into several shards that run in parallel.
7. **False** - The book says TAP can no longer run every test on every change and batches related changes.
8. Measure where the time goes (per stage and per test); split presubmit from post-submit; add test selection, sharding or caching for the biggest costs (and fix flaky tests).
9. Bisection assumes pass/fail is caused by the code. A flaky failure on a good change sends the search the wrong way.
10. The **Build Cop**; the most effective tool is the **rollback**.

## Flashcards

- **Q:** What is continuous integration? — **A:** Merging changes often and automatically building and testing every change.
- **Q:** Presubmit vs post-submit? — **A:** Presubmit runs before merge and gates it; post-submit runs after merge with larger tests.
- **Q:** SWE book presubmit rule of thumb? — **A:** Only fast, reliable tests.
- **Q:** What is TAP? — **A:** Google's Test Automation Platform, its global continuous build, as described in the SWE book.
- **Q:** What is test selection? — **A:** Running only tests affected by a change, usually using a dependency graph.
- **Q:** What is sharding? — **A:** Splitting a test suite across machines to run in parallel.
- **Q:** What is culprit finding? — **A:** Identifying which change broke a test, often by bisection.
- **Q:** What does `git bisect run` do? — **A:** Automatically binary-searches commits using a test command.
- **Q:** What is a hermetic build? — **A:** A build whose output depends only on declared, pinned inputs.
- **Q:** What is Bazel? — **A:** Google's open-source build and test tool, the open-source version of Blaze.
- **Q:** Why rollback first? — **A:** It quickly restores a known good state; fix forward calmly afterwards.

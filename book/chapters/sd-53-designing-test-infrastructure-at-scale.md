# Designing Test Infrastructure at Scale: CI, Distributed Test Execution, Flaky Tests, Analytics and Device Labs

> **In this chapter:**
> - Design a CI system with presubmit and postsubmit, end to end, the way you would in a Google SWE-Test interview
> - Build a distributed test execution service that shards tests by historical duration (with Python code)
> - Detect and quarantine flaky tests with clear, testable rules
> - Model test results for analytics, and design a device and browser lab
> - Explain how you would test the test infrastructure itself
>
> **Time:** ~80 minutes  |  **Level:** Expert

This is the system design round that matters most for a SWE-Test or Test Engineer role. The earlier lesson "Test infrastructure as a design topic" gave you the main boxes. This chapter turns that into a full 45-minute answer with requirements, estimates, APIs, data model, components, scaling, failure handling and testing.

You already know CI pipelines, flaky tests and device clouds from your SDET work. The new skill is to talk about them **at scale**, with numbers and trade-offs.

## What Google has said publicly

Use only public facts from *Software Engineering at Google* (Winters, Manshreck and Wright, O'Reilly, 2020), free at https://abseil.io/resources/swe-book. Say "according to the SWE at Google book" when you use them.

- **Test sizes** (Chapter 11, "Testing Overview", https://abseil.io/resources/swe-book/html/ch11.html): **small** tests run in a single process (often a single thread) and may not sleep, do I/O or use the network; **medium** tests run on a single machine and may only call `localhost`; **large** tests can span machines. Size is about resources, not lines of code. Some of these limits are enforced by test infrastructure.
- **Test scope mix** (Chapter 11): a rough guideline of about 80% unit, 15% integration and 5% end-to-end tests.
- **Flakiness** (Chapter 11): the book says that as you approach 1% flakiness, tests begin to lose value, and that Google's flaky rate hovers around 0.15%, which still means thousands of flakes every day.
- **Hermetic tests** (Chapters 11 and 23): a test should contain everything needed to set up, run and tear down its environment, with no shared databases or production backends.
- **Test doubles** (Chapter 13, https://abseil.io/resources/swe-book/html/ch13.html): fakes, stubs and mocks, with a preference for real implementations or fakes where possible.
- **Larger testing** (Chapter 14, https://abseil.io/resources/swe-book/html/ch14.html): types such as performance and load tests, probers and canary analysis, disaster recovery and chaos engineering, and A/B diff (regression) tests.
- **TAP** (Chapter 23, "Continuous Integration", https://abseil.io/resources/swe-book/html/ch23.html): the **Test Automation Platform** is Google's global continuous build. The book says TAP handles more than 50,000 unique changes and runs more than four billion individual test cases every day. Teams define a fast **presubmit** subset; the book says a change that passes presubmit has a very high likelihood (95%+) of passing the rest, and the average wait to submit is around 11 minutes. After submit, TAP runs all affected tests asynchronously (postsubmit). Because changes arrive faster than one per second, TAP **batches** changes, then splits failing batches and offers **culprit finding** tools; it can **automatically roll back** a change when it is highly confident it is the culprit. Each team has a **Build Cop** who keeps the build green. Tests mostly run on **Forge**, a distributed build-and-test system, and TAP uses the dependency graph from Forge and **Blaze** (open-sourced as Bazel) to run only affected tests.

Do not add internals beyond this. In the interview, design **your own** system and say "this is similar in spirit to what the SWE at Google book describes for TAP".

## Step 1: Requirements

Ask first. A good set of assumptions:

**Functional**
- Run tests for every proposed change (**presubmit**) and block submission if they fail.
- Run a larger set after submission (**postsubmit**), find which change broke a test, and notify the owner.
- Shard tests across many machines; retry infrastructure failures.
- Detect flaky tests and quarantine them.
- Store results, logs and artifacts; offer dashboards and APIs.
- Run browser and mobile tests on a device lab.

**Non-functional**
- **Fast feedback:** presubmit p95 under 15 minutes.
- **Correct signal:** infrastructure failures must never be reported as test failures.
- **Scale:** 5,000 changes per day, growing 2x per year.
- **Reproducible:** hermetic runs; anyone can re-run the exact same test.
- **Cost aware:** only run what a change can affect.
- **Available:** if CI is down, nobody can submit, so target 99.9% for the presubmit path.

## Step 2: Estimates

Assume a company with 3,000 engineers (not Google; these numbers are for practice).

- Changes per day: 5,000. Each change runs presubmit about 3 times (new revisions) = **15,000 presubmit runs per day**.
- Affected tests per run (after dependency analysis): about 2,000 on average.
- Test executions per day: 15,000 x 2,000 = **30 million**. Add postsubmit and nightly runs: about **40 million per day**.
- Rate: 40,000,000 / 86,400 = about **460 per second**; peak (office hours, 3x) about **1,400 per second**.
- Compute: average test 5 seconds -> 40M x 5 s = 200M CPU-seconds per day = about 55,600 CPU-hours per day -> about **2,300 cores busy on average**, around **7,000 at peak**.
- Result rows: 40M x 200 bytes = **8 GB per day**, about **3 TB per year**.
- Logs: 40M x 20 KB = **800 GB per day**. Keep passing logs 14 days, failing logs 1 year: tens of TB in object storage.

These numbers drive decisions: a single SQL table will struggle with 3 TB per year of high-rate inserts plus analytics, so use a wide-column or time-partitioned store for raw results and a columnar warehouse for analytics.

## Part A: The CI system (presubmit and postsubmit)

### High-level flow

```
 Developer uploads change
        |
        v
 [Code review tool] --webhook--> [CI Orchestrator] --> [Dependency analyzer (Bazel graph)]
                                       |                         |
                                       |   affected test targets |
                                       v                         v
                             [Test Execution Service] --> workers / device lab
                                       |
                                       v
                [Result Service] --> results DB + artifact store --> [Flaky Service]
                                       |
                                       v
                 status back to code review ("presubmit passed") + notifications
```

### Presubmit

1. A change is uploaded. The orchestrator creates a **run**.
2. The **dependency analyzer** finds every test target that depends on changed files (with a build graph like Bazel). This is called **test selection** or **affected-test analysis**.
3. Presubmit runs **small and medium** tests, plus a few chosen large tests. Large, slow, non-hermetic tests go to postsubmit.
4. Quarantined flaky tests still run but **cannot block** the change.
5. The result is posted to the code review. Submission is blocked until presubmit is green.

### Postsubmit

1. After submit, run **all affected tests**, including large ones.
2. At high change rates, **batch** several changes into one run to save compute.
3. If a batch fails, find the **culprit**: re-run the failing tests on each change, or **bisect** (binary search) between the last green and first red change.
4. Notify the change author and the team's build cop; offer or perform an **automatic rollback** if confidence is high.

```python
def find_culprit(changes, test_passes):
    """changes: ordered list, first is known good, last is known bad.
    test_passes(change) runs the failing test at that change."""
    lo, hi = 0, len(changes) - 1          # lo = good, hi = bad
    while hi - lo > 1:
        mid = (lo + hi) // 2
        if test_passes(changes[mid]):
            lo = mid
        else:
            hi = mid
    return changes[hi]                    # first bad change

history = ["c1", "c2", "c3", "c4", "c5", "c6"]
broken_from = "c4"
print(find_culprit(history, lambda c: c < broken_from))  # c4
```

Bisection needs about log2(N) runs: 64 changes need about 6 runs. With flaky tests, run each step 2-3 times, or the search can point to the wrong change.

### APIs

```
POST /v1/runs                     {change_id, revision, kind: PRESUBMIT|POSTSUBMIT, priority}
GET  /v1/runs/{run_id}            -> status, counts, links
GET  /v1/runs/{run_id}/tests?status=FAILED
POST /v1/runs/{run_id}/retry      {test_ids}         (author re-runs failures)
GET  /v1/changes/{change_id}/status   -> PENDING | PASSED | FAILED | INFRA_ERROR
GET  /v1/tests/{test_id}/history?limit=200
POST /v1/tests/{test_id}/quarantine {reason, bug_id}
```

All write APIs take an **idempotency key**, because webhooks are delivered at least once.

## Part B: Distributed test execution service

### Components

- **Scheduler:** turns a run into **shards** and puts them on a priority queue. Presubmit has higher priority than nightly runs.
- **Queue:** durable (for example Pub/Sub or Kafka), with per-team quotas so one team cannot take all workers.
- **Workers:** containers on a cluster manager (Kubernetes outside Google; Borg is Google's public example, see the papers chapter). Each worker pulls a shard, fetches build outputs from a **remote cache**, runs tests in a sandbox and uploads results.
- **Lease and heartbeat:** a worker leases a shard for, say, 2 minutes and renews it. If it stops renewing, the shard goes back to the queue.

### Sharding by historical duration

Splitting by test count is bad: one shard may get all the slow tests. Use the **median duration from history**, and pack shards using the **Longest Processing Time first (LPT)** rule: sort tests from slowest to fastest, and always give the next test to the currently lightest shard.

```python
import heapq

def shard_by_duration(durations, num_shards):
    """durations: {test_id: median_seconds}. Returns list of (total, tests)."""
    heap = [(0.0, i, []) for i in range(num_shards)]   # (total, id, tests)
    for test, secs in sorted(durations.items(), key=lambda x: -x[1]):
        total, i, tests = heapq.heappop(heap)          # lightest shard
        tests.append(test)
        heapq.heappush(heap, (total + secs, i, tests))
    return sorted((t, tests) for t, _, tests in heap)

hist = {"login": 40, "checkout": 90, "search": 30, "profile": 20, "cart": 60, "api": 10}
for total, tests in shard_by_duration(hist, 3):
    print(total, tests)
# 80.0 ['cart', 'profile']
# 80.0 ['login', 'search', 'api']
# 90.0 ['checkout']
```

Run time is the slowest shard (90 s here), so balance matters more than count. Extra rules:

- **New tests** have no history: use the average for their size (small, medium, large).
- **Choose the shard count** from a target: total time / target time per shard, capped by available workers and startup overhead (if starting a worker costs 30 s, 2-second shards are wasteful).
- **Straggler handling:** when 95% of shards are done, start a **backup copy** of the slowest remaining shard and take whichever finishes first (the same idea as MapReduce backup tasks).
- **Test ordering inside a shard:** run historically failing tests first, so authors get a failure signal sooner.

### Failure handling

| Failure | Detection | Action |
|---|---|---|
| Worker dies | Lease expires | Re-queue shard on another worker |
| Bad worker (disk full, broken network) | Many tests fail with infra error signatures on one host | Drain host, retry shards elsewhere, mark INFRA_ERROR not FAIL |
| Test hangs | Per-test timeout by size (for example small 60 s, large 15 min) | Kill, record TIMEOUT, collect thread dump |
| Queue backlog | Queue age metric | Autoscale workers; shed nightly work before presubmit |
| Remote cache down | Error rate | Fall back to building locally (slower but correct) |

The key rule: **separate infrastructure failures from test failures.** Report them with different statuses, and never blame a developer for an infra problem.

## Part C: Flaky test detection and quarantine

A **flaky test** passes and fails on the **same code and configuration**. Following the SWE at Google book, treat flakiness as a signal-quality problem: rerunning only trades CPU for engineering time and delays the fix.

### Signals

1. **Pass on retry:** fails, then passes on the same commit. Strongest signal.
2. **Mixed results on the same commit** across different runs.
3. **Flip rate** in postsubmit history: pass, fail, pass, fail with no relevant change.
4. **Deliberate reruns:** a nightly job re-runs suspicious tests 50-100 times to measure the rate.

### Scoring and rules

```python
def flaky_score(runs):
    """runs: list of (commit, passed). Score = share of commits with mixed results."""
    by_commit = {}
    for commit, passed in runs:
        by_commit.setdefault(commit, set()).add(passed)
    mixed = sum(1 for results in by_commit.values() if len(results) == 2)
    return mixed / len(by_commit)

def decide(score, flaky_events, threshold=0.02, min_events=3):
    return "QUARANTINE" if score >= threshold and flaky_events >= min_events else "OK"

runs = [("a", True), ("a", False), ("b", True), ("c", True), ("c", False), ("d", True)]
s = flaky_score(runs)
print(round(s, 2), decide(s, flaky_events=2))   # 0.5 OK  (not enough evidence yet)
print(decide(0.05, flaky_events=4))             # QUARANTINE
```

### Quarantine workflow

1. Test crosses the threshold -> mark **quarantined**. It still runs (to keep collecting data) but **does not block** presubmit. The SWE at Google book mentions teams using a tool to temporarily remove flaky tests from presubmit while they are fixed.
2. **File a bug automatically** to the owning team with evidence: failing logs, error signature, failure rate, first-seen date.
3. **Un-quarantine** after the fix, once the test passes, say, 200 runs in a row.
4. **Limit quarantine size per team** and age; a test quarantined for 90 days escalates to the team lead. Otherwise quarantine becomes a graveyard of hidden bugs.

### Root-cause helpers

Group failures by **error signature** (normalised stack trace or message hash). Correlate with worker host, time of day, test order and parallelism. Common causes you already know: timing waits, shared test data, order dependency, real race conditions in the product, and unstable external services (fix by making the test hermetic with fakes).

## Part D: Test result storage and analytics

### Data model

```
runs           (run_id PK, change_id, revision, kind, priority, status, created_at, finished_at)
shards         (run_id, shard_id, worker_id, status, started_at, finished_at)
test_results   (test_id, run_id, attempt, status, duration_ms, error_signature,
                worker_id, commit, created_at)          -- one row per attempt
tests          (test_id PK, target, owner_team, size, median_duration_ms,
                flaky_score, quarantined, quarantine_bug)
artifacts      (run_id, test_id, attempt, kind: LOG|SCREENSHOT|VIDEO|COVERAGE, uri)
```

Status values: PASSED, FAILED, FLAKY (passed on retry), TIMEOUT, SKIPPED, INFRA_ERROR.

### Storage choices

- **Hot path (results of current runs):** a wide-column store (for example Bigtable or Cassandra) with row key `test_id#reverse_timestamp`, so "last 200 results of this test" is one contiguous scan. A SQL database for runs and tests metadata, which are small.
- **Artifacts:** object storage (for example GCS or S3) with lifecycle rules: delete passing logs after 14 days, keep failing logs longer.
- **Analytics:** stream results into a columnar warehouse (for example BigQuery), partitioned by day, for questions like:
  - Slowest 100 tests by p95 duration.
  - Flakiest tests per team this week.
  - Percent of time the main branch is green.
  - Presubmit queue time and run time p50/p95.
  - Infra error rate per worker pool.
  - Cost per run, per team.

### Scaling

Write results in **batches** from workers through a result service (or a queue) rather than one database insert per test. Use **idempotent writes** keyed by `(run_id, test_id, attempt)` so retried uploads do not double count. Dashboards read from pre-aggregated tables updated every few minutes, not from raw rows.

## Part E: Device and browser lab

### Requirements

Run Selenium, Playwright, Appium and native mobile tests on many browser versions and real devices. Say 300 real phones, 2,000 emulator or browser slots, 50,000 device-test sessions per day.

### Components

```
 Test shard --lease(model=Pixel 8, os=14)--> [Device Manager] --> [Host machine] --USB--> [Phone]
                                                  |                     |
                                       inventory DB + health          agent: install, run, reset
 Browser shard --> [Browser grid: containers with Chrome/Firefox/Edge versions]
```

- **Device manager:** keeps an **inventory** (model, OS version, state: IDLE, LEASED, RESETTING, BROKEN) and gives **leases** by capability.
- **Host agent:** runs on machines with USB hubs; installs apps, runs tests, captures video and logs, and **resets** the device (uninstall apps, clear data, reboot when needed).
- **Browser grid:** short-lived containers, one per session, with pinned browser versions, so every session starts clean (hermetic).
- **Scheduling:** match by capability; queue by priority; avoid starving rare devices by reserving some for presubmit.

### Failure handling

- **Health checks** before each lease: battery, storage, network, ADB connection. Failing devices go to BROKEN and a ticket is filed for the lab team.
- If a device dies mid-test, record **INFRA_ERROR**, retry on another device of the same model.
- Track **flaky rate per device**: if one phone causes most failures, it is the device, not the test.
- Leases expire automatically so a crashed test cannot hold a device forever.

## Testing the test infrastructure itself

This is where you stand out. The CI system is a product, and its users are engineers. Test it like one:

1. **Canary repository:** a small repo with known tests - always pass, always fail, 10% flaky, hangs, crashes, uses too much memory. Run it every 10 minutes and assert each gets the right status. This is a **prober** for CI.
2. **Unit tests for the logic:** sharding (balance within 10% of ideal), culprit finding (with and without flakes), flaky scoring and quarantine rules, status mapping (infra vs test failure).
3. **Fault injection:** kill workers mid-shard, drop result uploads, slow the remote cache, fill a disk, expire leases. Assert no lost results, no duplicates and correct INFRA_ERROR statuses.
4. **Shadow mode for new algorithms:** run a new flaky detector or test selection in parallel without acting, and compare its decisions with the current one before switching.
5. **Test selection safety:** periodically run the **full** suite and check whether any failure was missed by affected-test analysis.
6. **Load tests:** replay a peak day of runs into a staging cluster to find scheduler and database bottlenecks.
7. **SLOs for CI:** presubmit p95 time, infra error rate under 0.5%, percent of runs with a correct status. Alert on burn rate, just like a production service.
8. **Canary releases of CI itself:** roll new worker images to 5% of the fleet first and compare infra error rates.

## Trade-offs to say out loud

- **Presubmit coverage vs speed:** more tests before submit means fewer broken builds but slower developers. The SWE at Google book describes running a fast subset in presubmit and the rest in postsubmit.
- **Retries vs hiding bugs:** retries unblock developers but can hide real race conditions. Always record FLAKY separately.
- **Batching vs blame:** batching saves compute but makes culprit finding harder.
- **Hermetic vs realistic:** hermetic tests are stable; live backends catch integration problems. Use both, at different stages.
- **More shards vs overhead:** faster wall time, but more startup cost and scheduling load.

## Tester's corner

- You have lived the pain points: flaky tests, slow pipelines, broken devices. Use **real stories** with numbers ("I cut suite time from 60 to 12 minutes by sharding on duration").
- Always split **infra failures** from **test failures**; it is the most common signal-quality bug in CI systems.
- Talk about **metrics**: feedback time, flaky rate, green rate, infra error rate, cost per run.
- Mention **test sizes** (small, medium, large) and hermeticity; they show you know Google's public vocabulary.
- Treat quarantine as **temporary** with owners, bugs and deadlines.
- Finish every design with "**how I would test this system**"; most candidates forget.

## Key takeaways

- Presubmit runs a fast, affected subset and blocks submit; postsubmit runs everything, batches changes and finds culprits by bisection.
- Shard by historical duration with the LPT rule; wall time equals the slowest shard.
- Workers use leases and heartbeats; dead workers' shards are re-queued, and infra errors are never reported as test failures.
- Flaky tests are detected by pass-on-retry and mixed results on the same commit, then quarantined with an auto-filed bug and release criteria.
- Store one row per attempt, use a row key like `test_id#reverse_timestamp`, artifacts in object storage, analytics in a columnar warehouse.
- A device lab needs inventory, capability-based leases, health checks and automatic reset.
- Test the test infrastructure with a canary repo, fault injection, shadow mode and its own SLOs.
- Quote only public facts from the SWE at Google book (test sizes, 0.15% flake rate, TAP presubmit and postsubmit).

## Quiz

1. According to the SWE at Google book, what defines a "medium" test? A) 100-1,000 lines of code  B) Runs on a single machine and may only use the network via localhost  C) Takes 1-5 minutes  D) Tests two classes
2. Tests have durations 50, 40, 30, 30, 20 seconds and you have 2 shards. Using the LPT rule, what is the wall time?
3. True or false: sharding tests by equal count is usually as good as sharding by duration.
4. A worker stops sending heartbeats in the middle of a shard. What should the system do?
5. Which is the strongest signal that a test is flaky? A) It is slow  B) It fails, then passes on retry on the same commit  C) It was recently added  D) It has many assertions
6. What does the SWE at Google book say about flakiness around 1%? A) It is ideal  B) Tests begin to lose value  C) It is impossible  D) It only matters for unit tests
7. Postsubmit found a failure in a batch of 32 changes. About how many bisection steps are needed to find the culprit, assuming no flakiness?
8. True or false: a quarantined test should stop running completely.
9. Many unrelated tests fail with "connection refused" on one worker host. What is the most likely cause and action?
10. How would you verify that your test infrastructure reports correct statuses all the time?

## Answer key

1. **B** - Medium tests may use multiple processes and blocking calls but must stay on one machine, calling only localhost.
2. **90 seconds** - Sorted: 50, 40, 30, 30, 20. 50 -> A, 40 -> B, 30 -> B (70), 30 -> A (80), 20 -> B (90). Shards are 80 and 90, so wall time is 90 s. (The best possible split of 170 s total is 80/90, so LPT is optimal here.)
3. **False** - Test durations vary a lot, so equal counts can give very unequal shards; wall time is set by the slowest shard.
4. **Re-queue the shard** - When the lease expires, put the shard back on the queue for another worker, and record the attempt as an infra issue, not a test failure.
5. **B** - Different results on the same code and config is the definition of flaky.
6. **B** - The book says that as you approach 1% flakiness, tests begin to lose value, and Google's rate hovers around 0.15%.
7. **About 5** - log2(32) = 5. With flaky tests, repeat each step to avoid blaming the wrong change.
8. **False** - It should keep running without blocking presubmit, so you collect data and know when it is fixed.
9. **A bad worker** - It is an infrastructure problem; drain the host, retry the affected shards elsewhere, and mark the results INFRA_ERROR.
10. **Canary repository** - Run a repo of known pass, fail, flaky, hang and crash tests on a schedule and alert if any status is wrong; add fault injection and SLOs.

## Flashcards

- **Q:** What is presubmit? — **A:** Tests that run on a proposed change before it is submitted, blocking submission if they fail.
- **Q:** What is postsubmit? — **A:** Tests run after a change lands, usually the full affected set, including large slow tests.
- **Q:** What is TAP, according to the SWE at Google book? — **A:** The Test Automation Platform, Google's global continuous build that runs tests for almost all changes.
- **Q:** What are Google's three test sizes? — **A:** Small (single process), medium (single machine, localhost only), large (can span machines).
- **Q:** What is the LPT sharding rule? — **A:** Sort tests slowest first and always add the next test to the currently lightest shard.
- **Q:** How do you find the change that broke a test in a batch? — **A:** Bisect between the last green and first red change, repeating runs if flakiness is possible.
- **Q:** Why separate INFRA_ERROR from FAILED? — **A:** So developers are never blamed for infrastructure problems and the signal stays trustworthy.
- **Q:** What happens to a quarantined test? — **A:** It keeps running but cannot block presubmit, and a bug is filed to its owner.
- **Q:** What row key fits test history queries? — **A:** `test_id#reverse_timestamp`, so recent results for one test are a single contiguous scan.
- **Q:** What does a device manager track? — **A:** Inventory, capabilities, state (idle, leased, resetting, broken) and leases with expiry.
- **Q:** What is a CI canary repository? — **A:** A repo of tests with known outcomes, run regularly to check the CI system reports correct statuses.
- **Q:** What flaky rate does the SWE at Google book report for Google? — **A:** It says Google's flaky rate hovers around 0.15%, which still means thousands of flakes every day.

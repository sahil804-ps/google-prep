# Performance, Load and Reliability Testing

> **In this chapter:**
> - Measure performance correctly with latency percentiles (p50, p95, p99), throughput and error rate
> - Tell load, stress, soak, spike and capacity tests apart, and know when to use each
> - Write a simple Locust load test in Python and read its results
> - Detect performance regressions in CI with baselines
> - Explain chaos engineering and disaster-recovery testing using public Google and industry sources
>
> **Time:** ~50 minutes  |  **Level:** Intermediate

Functional tests answer "does it work?". Performance and reliability tests answer "does it work **fast enough, for enough people, for long enough, and when things go wrong?**" At Google scale these questions matter as much as correctness. The SWE book's Larger Testing chapter ([ch14](https://abseil.io/resources/swe-book/html/ch14.html)) lists "performance, load and stress testing" and "disaster recovery and chaos engineering" as types of larger tests. The Google SRE book ([sre.google/sre-book](https://sre.google/sre-book/table-of-contents/)) covers the production side.

## The three core numbers

### 1. Latency

**Latency** is how long one request takes, from the moment it is sent until the response arrives. Measured in milliseconds (ms).

### 2. Throughput

**Throughput** is how many requests the system handles per unit of time, usually **requests per second (RPS)** or **queries per second (QPS)**.

### 3. Error rate

**Error rate** is the percentage of requests that fail (timeouts, HTTP 5xx, wrong answers). A system that answers fast by returning errors is not fast – it's broken.

**Analogy:** A Swiggy kitchen. Latency is how long one order takes to cook. Throughput is how many orders per hour the kitchen sends out. Error rate is how many orders are wrong or burnt. A kitchen can be great at one and terrible at another.

## Why averages lie: percentiles

Suppose 100 requests: 95 take 100 ms, 5 take 5,000 ms. The **average** is (95 × 100 + 5 × 5000) / 100 = **345 ms**. That number describes nobody: most users saw 100 ms, and some waited 5 seconds.

**Percentiles** tell the real story:

- **p50 (median)** – half of requests are faster than this. The "typical" experience.
- **p95** – 95% of requests are faster; 5% are slower.
- **p99** – 99% are faster; the slowest 1% are slower. This is the **tail latency**.

Why care about p99? If your page makes 50 backend calls, and each has a 1% chance of being slow, the chance at least one is slow is 1 − 0.99⁵⁰ ≈ **39.5%**. Tail latency becomes the *common* experience for complex pages. This effect is discussed in the well-known paper "The Tail at Scale" by Jeffrey Dean and Luiz André Barroso (Communications of the ACM, 2013).

```python
def percentile(values, p):
    """Nearest-rank percentile, p in (0, 100]."""
    ordered = sorted(values)
    rank = max(1, -(-len(ordered) * p // 100))     # ceil(n * p / 100)
    return ordered[int(rank) - 1]

latencies = [100] * 95 + [5000] * 5               # in ms
print(sum(latencies) / len(latencies))            # 345.0  (average misleads)
print(percentile(latencies, 50))                  # 100
print(percentile(latencies, 95))                  # 100
print(percentile(latencies, 99))                  # 5000  (the tail)
print(round(1 - 0.99 ** 50, 3))                   # 0.395 (fan-out effect)
```

**Rule:** always report latency as percentiles *together with* the throughput and error rate at which they were measured. "p99 = 200 ms" means nothing without "at 2,000 RPS with 0.1% errors".

## Types of performance tests

| Test type | Question it answers | Load shape | Typical duration |
|---|---|---|---|
| **Load test** | Does it meet targets at expected load? | Ramp to normal peak, hold | 15–60 min |
| **Stress test** | Where does it break, and how does it fail? | Keep increasing past the limit | Until failure |
| **Soak (endurance) test** | Does it stay healthy over a long time? | Normal load, held for hours | 4–24+ hours |
| **Spike test** | Can it survive a sudden jump? | Sudden huge jump, then drop | Minutes |
| **Capacity test** | How much load can one server or cluster handle within SLO? | Step up gradually | Varies |
| **Scalability test** | Does adding machines add capacity proportionally? | Repeat with 1, 2, 4... servers | Varies |

**Analogy using Indian Railways:**
- **Load test:** a normal weekday morning on the booking site.
- **Stress test:** keep adding users until the site falls over. Does it show a polite "try again" page, or does it corrupt bookings?
- **Soak test:** run normal traffic all day and night. Does memory slowly leak until the server crashes at 3 AM?
- **Spike test:** **Tatkal booking at 10:00 AM** – traffic jumps many times in seconds.

### What to look for in each

- **Load:** p95/p99 latency, error rate and resource use (CPU, memory) stay within targets.
- **Stress:** the breaking point; *graceful degradation* (shed load, return 429/503 quickly) rather than collapse; recovery after load drops.
- **Soak:** memory leaks, growing queues, file handles or database connections not released, logs filling the disk.
- **Spike:** autoscaling speed, queue behaviour, rate limiting, cold caches.

## Planning a performance test

1. **Define goals from SLOs.** Example: "p99 < 300 ms and error rate < 0.1% at 2,000 RPS."
2. **Model realistic traffic.** Mix of endpoints (70% search, 20% view, 10% book), think time between user actions, realistic data (not the same item every time – that only tests the cache).
3. **Use a production-like environment.** Same instance types, same configuration, realistic data volume. Results from a tiny test server don't scale linearly.
4. **Warm up.** Let caches fill and JIT compilers settle before measuring.
5. **Monitor the system under test**, not just the load tool: CPU, memory, GC pauses, DB connections, queue depth.
6. **Check the load generator** isn't the bottleneck (its CPU at 100% means your numbers are wrong).
7. **Run more than once.** Performance numbers are noisy; compare medians of several runs.

## Locust: a load test in Python

**Locust** is an open-source load testing tool where you write user behaviour in plain Python. (Other popular tools: **k6**, which uses JavaScript scripts, **JMeter** and **Gatling**.)

```python
# locustfile.py  - run: locust -f locustfile.py --host https://staging.shop.test
from locust import HttpUser, task, between

class Shopper(HttpUser):
    wait_time = between(1, 3)           # think time: 1-3 s between actions

    def on_start(self):
        self.client.post("/login", json={"user": "load_user", "pw": "secret"})

    @task(7)                            # weight 7: most common action
    def search(self):
        self.client.get("/search?q=dosa", name="/search")

    @task(2)
    def view_item(self):
        self.client.get("/item/42", name="/item/[id]")

    @task(1)
    def add_to_cart(self):
        with self.client.post("/cart", json={"item": 42},
                              catch_response=True) as resp:
            if resp.status_code != 200 or "cart_id" not in resp.text:
                resp.failure("cart add failed")   # counts as an error
```

Key points:
- **`@task(weight)`** sets the traffic mix (here 70/20/10).
- **`wait_time`** adds realistic think time.
- **`name=`** groups URLs with different IDs into one statistic.
- **`catch_response`** lets you mark a "200 OK with wrong body" as a failure – an important check many load tests miss.

Run headless in CI: `locust -f locustfile.py --headless -u 500 -r 50 --run-time 10m --host https://staging.shop.test --csv results`. Here `-u` is the number of simulated users and `-r` is how many users start per second. Locust reports per-endpoint request counts, failure counts, and percentiles (p50, p95, p99).

## Performance regression detection in CI

Big load tests are expensive, but small **performance checks** can run often:

- **Micro-benchmarks** for hot functions (`pytest-benchmark`).
- A **short load test** (2–5 minutes) on every merge to the main branch, against a fixed environment.
- **Compare with a baseline** (recent median of the same test), and fail or warn if worse by more than a threshold.

```python
def perf_regression(baseline_p95_runs, current_p95, tolerance=0.10):
    """Flag a regression if current p95 is >10% worse than baseline median."""
    runs = sorted(baseline_p95_runs)
    median = runs[len(runs) // 2]
    limit = median * (1 + tolerance)
    return current_p95 > limit, round(limit, 1)

print(perf_regression([210, 205, 220, 215, 208], 260))   # (True, 231.0)
print(perf_regression([210, 205, 220, 215, 208], 225))   # (False, 231.0)
```

Using the **median of several baseline runs** reduces false alarms from noise. For stricter analysis, use statistical tests across repeated runs.

## Reliability testing and chaos engineering

Performance is about speed under load. **Reliability** is about continuing to work when things go wrong: servers die, networks slow down, disks fill, a dependency fails.

### Fault injection

Deliberately cause failures in a controlled way:
- Kill a server process or container.
- Add network latency or packet loss between services.
- Make a dependency return errors or time out.
- Fill the disk; exhaust memory; expire a certificate in a test environment.

Then check: did retries, timeouts, circuit breakers and failover work? Did users see a graceful error instead of a crash? Did alerts fire?

```python
import random

class FlakyDependency:
    """Wraps a real client and injects faults for resilience tests."""
    def __init__(self, client, error_rate=0.2, seed=7):
        self.client, self.error_rate = client, error_rate
        self.rng = random.Random(seed)            # reproducible faults

    def get_price(self, item_id):
        if self.rng.random() < self.error_rate:
            raise TimeoutError("injected timeout")
        return self.client.get_price(item_id)

def test_cart_total_survives_price_timeouts(real_price_client):
    cart = Cart(prices=FlakyDependency(real_price_client, error_rate=0.3))
    total = cart.total(["dosa", "idli"])          # should retry, not crash
    assert total > 0
```

### Chaos engineering

**Chaos engineering** is the practice of running experiments on a system to build confidence that it can survive turbulent conditions. The public "Principles of Chaos Engineering" ([principlesofchaos.org](https://principlesofchaos.org/)) describe a method:

1. Define a **steady state** – a measurable sign of normal behaviour (orders per minute, p99 latency).
2. **Hypothesise** the steady state will continue during a failure.
3. **Introduce a real-world event** – a server crash, network latency, a region going down.
4. Try to **disprove** the hypothesis by watching the steady state.
5. **Minimise the blast radius** – start small, have a stop button.

Netflix publicly described **Chaos Monkey**, a tool that randomly terminates instances in production to make sure services tolerate instance failure.

### Disaster recovery testing at Google (public)

The SWE book's Larger Testing chapter has a section "Disaster Recovery and Chaos Engineering". It describes Google's **DiRT (Disaster Recovery Testing)** as an annual "war game" in which faults are injected into Google's infrastructure at very large scale, simulating events from datacenter fires to attacks – testing how both systems and people respond. The book contrasts this with chaos engineering, "made popular by Netflix", as more of a continuous background of injected faults, and says teams at Google run thousands of chaos tests each week using an internal system called Catzilla. It also warns that, like probers, such tests can change production state and cause user-visible effects if they perform writes. Stick to that level of detail in an interview.

**Analogy:** A fire drill in an office. You don't wait for a real fire to learn whether the exits work and whether people know where to go. You practise, on purpose, with a plan and safety limits.

## Worked example: preparing for a Tatkal-style spike

Scenario: a ticket booking service opens a special quota at exactly 10:00 AM. Normal traffic is 500 RPS; at 10:00 it jumps to 20,000 RPS for about 5 minutes. Seats are limited; overselling is unacceptable.

**1. Goals (from product and SLOs)**
- Search p99 < 500 ms at peak; booking p99 < 2 s.
- Error rate < 1% at peak; *zero* oversold seats; *zero* double charges.
- When overloaded, users get a fast "please retry" (HTTP 429/503) rather than a hang.

**2. Test suite**
- **Load test:** 2,000 RPS for 30 minutes (4× normal) – baseline health.
- **Spike test:** 500 → 20,000 RPS in 10 seconds, hold 5 minutes, drop. Check autoscaling, queue length and rate limiting.
- **Stress test:** keep increasing past 20,000 RPS. Find the breaking point; check graceful degradation and recovery.
- **Soak test:** normal load for 12 hours. Check memory, DB connections, logs.
- **Correctness under load:** after every run, check the database: sold seats ≤ available seats; each successful booking has exactly one payment. **A performance test without correctness checks is half a test.**

**3. Chaos experiments (in staging first)**
- Kill one booking server during the spike – do in-flight bookings complete or roll back cleanly?
- Add 500 ms latency to the payment gateway – do timeouts and retries cause double charges? (Idempotency keys should prevent this.)

**4. In CI**
- Short load test on every merge to main, compared with baseline p95.

**5. In production**
- Dashboards for p50/p95/p99 by endpoint, error rate, seats sold vs available, payment success.
- Rollback and rate-limit controls ready before 10:00.

## Interview phrases you can use

- "I'd report p50, p95 and p99 together with the throughput and error rate they were measured at – averages hide the tail."
- "With fan-out, tail latency becomes the common case: with 50 calls at 1% slow each, about 40% of pages hit a slow call."
- "Load tests check targets, stress tests find the breaking point and failure mode, soak tests find leaks, spike tests check sudden jumps."
- "I'd add correctness checks to every load test – no oversold seats, no double charges."
- "For reliability, I'd run chaos experiments with a defined steady state, a hypothesis and a small blast radius."

## Tester's corner

- Always check that the load generator is not the bottleneck before trusting results.
- Realistic data matters: hitting the same item every time only tests the cache.
- "200 OK" is not success. Validate response bodies under load.
- Soak tests find the bugs that page people at 3 AM – memory leaks and connection leaks.
- Pair every resilience test with alert checks: did the right people get notified?
- Performance baselines in CI turn performance from a once-a-year project into a daily habit.

## Key takeaways

- Measure latency, throughput and error rate together.
- Use percentiles (p50, p95, p99), not averages; tail latency grows with fan-out.
- Load, stress, soak, spike, capacity and scalability tests answer different questions.
- Plan from SLOs, model realistic traffic, use production-like environments, warm up, and monitor the SUT.
- Locust lets you write load tests in Python with weighted tasks and response validation.
- Detect regressions in CI by comparing with a baseline median.
- Chaos engineering and disaster-recovery testing build confidence that systems survive failures; limit the blast radius.

## Quiz

1. 95 requests take 100 ms and 5 take 5,000 ms. What is the p50?
   A) 100 ms  B) 345 ms  C) 2,550 ms  D) 5,000 ms
2. True or false: average latency is the best single number for user experience.
3. Which test finds memory leaks that appear after many hours?
   A) Spike  B) Soak  C) Smoke  D) Stress
4. What is the main question a stress test answers?
5. In Locust, what does `@task(7)` mean?
6. True or false: if your load generator's CPU is at 100%, the results may be wrong.
7. A page makes 50 backend calls; each has a 1% chance of being slow. Roughly what share of page loads see at least one slow call?
   A) 1%  B) 10%  C) About 40%  D) 99%
8. Your load test shows great latency, but you never checked the response body. What could be wrong?
9. Name the steps of a chaos engineering experiment.
10. Your p95 jumped from about 210 ms to 260 ms after a change. Your tolerance is 10%. What would you do?

## Answer key

1. **A** - Half the requests are at or below 100 ms, so the median is 100 ms.
2. **False** - Averages hide the slow tail. Use percentiles.
3. **B** - Soak (endurance) tests run normal load for a long time to find leaks.
4. Where the system breaks and *how* it fails - gracefully (fast errors, recovery) or badly (hangs, data corruption).
5. That task has weight 7, so it runs about 7 times as often as a task with weight 1.
6. **True** - The tool itself becomes the bottleneck and under-reports load or over-reports latency.
7. **C** - 1 − 0.99⁵⁰ ≈ 0.395.
8. The server may be returning fast errors or empty or wrong data with HTTP 200. Validate bodies and correctness.
9. Define a steady state, hypothesise it continues, inject a real-world failure, try to disprove the hypothesis by observing, and minimise the blast radius.
10. 260 is above the 231 ms limit (median 210 × 1.1), so flag it as a regression: rerun to confirm it's not noise, then find the causing change (bisect) and fix or justify it.

## Flashcards

- **Q:** Latency vs throughput? — **A:** Latency is time per request; throughput is requests handled per second.
- **Q:** What is p99? — **A:** The latency that 99% of requests are faster than; the tail.
- **Q:** Why not use averages? — **A:** A few very slow requests distort the average and hide the real experience.
- **Q:** Load test? — **A:** Checks the system meets targets at expected peak load.
- **Q:** Stress test? — **A:** Pushes past the limit to find the breaking point and failure mode.
- **Q:** Soak test? — **A:** Normal load for many hours to find leaks and slow degradation.
- **Q:** Spike test? — **A:** A sudden huge jump in load, like Tatkal booking at 10 AM.
- **Q:** What is Locust? — **A:** An open-source load testing tool where user behaviour is written in Python.
- **Q:** What is chaos engineering? — **A:** Running controlled failure experiments to build confidence the system survives turbulence.
- **Q:** What is DiRT at Google? — **A:** Disaster Recovery Testing, an annual large-scale fault-injection "war game" described in the SWE book.
- **Q:** What is blast radius? — **A:** How many users or systems an experiment or failure can affect; keep it small.

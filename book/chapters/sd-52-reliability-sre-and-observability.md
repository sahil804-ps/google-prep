# Reliability, SRE and Observability: SLOs, Alerts, Incidents and Safe Releases

> **In this chapter:**
> - Define SLIs, SLOs and SLAs, and calculate an error budget and burn rate by hand and in Python
> - Monitor the four golden signals and alert on symptoms, not causes
> - Use logs, metrics and traces together to debug
> - Run incidents, write blameless postmortems, and release safely with canaries and rollbacks
> - Protect systems with load shedding, graceful degradation and capacity planning
>
> **Time:** ~70 minutes  |  **Level:** Advanced

In the earlier lesson on reliability you met SLOs, error budgets, retries and circuit breakers. This chapter goes deeper and follows Google's two public SRE books:

- *Site Reliability Engineering: How Google Runs Production Systems* (O'Reilly, 2016), free at https://sre.google/sre-book/table-of-contents/
- *The Site Reliability Workbook* (O'Reilly, 2018), free at https://sre.google/workbook/table-of-contents/

**SRE** (Site Reliability Engineering) is, in the book's words, what happens when you ask a software engineer to design an operations team. SREs treat running production as a software problem.

Why should a test engineer care? Because testing does not stop at release. An SLO is like a test that runs on real users all the time. A canary is a test in production. A postmortem is a bug report for the whole system. Interviewers for SWE-Test roles like candidates who think about quality **after** deployment too.

## 1. SLIs, SLOs and SLAs

Source: SRE book, Chapter 4 "Service Level Objectives" (https://sre.google/sre-book/service-level-objectives/).

- **SLI (Service Level Indicator):** a number that measures one aspect of service from the user's point of view. Usually a ratio: good events divided by total events. Example: "proportion of search requests served successfully in under 300 ms".
- **SLO (Service Level Objective):** a target for an SLI over a time window. Example: "99.9% of requests succeed over 30 days".
- **SLA (Service Level Agreement):** a contract with users that says what happens (refunds, credits) if you miss a target. SLAs are business documents. They should be looser than your internal SLO, so you get a warning before you break a promise.

Analogy: for an Indian Railways train, the SLI is "percentage of trains arriving within 15 minutes of schedule". The SLO is "95% of trains on time this month". The SLA is "if the train is more than 3 hours late, you get a refund".

Good SLIs (from the book and Workbook Chapter 2 "Implementing SLOs", https://sre.google/workbook/implementing-slos/):

| Service type | Typical SLIs |
|---|---|
| User-facing request/response (API, website) | Availability, latency, quality |
| Data pipeline | Freshness, correctness, coverage |
| Storage | Durability, latency, availability |

Two important rules:

- **100% is the wrong target.** Users cannot tell 99.999% from 100% because their own phone network fails more often. Every extra "9" costs a lot of money and slows down releases (SRE book, Chapter 3 "Embracing Risk", https://sre.google/sre-book/embracing-risk/).
- Measure **percentiles**, not averages, for latency. An average of 100 ms can hide a p99 of 5 seconds.

## 2. Error budgets with a worked calculation

The **error budget** is the amount of unreliability you are allowed: `1 - SLO`. If your SLO is 99.9%, your budget is 0.1%.

The book's key idea: the error budget turns a fight ("developers want speed, ops wants stability") into a shared number. While budget remains, teams can release new features quickly. When the budget is spent, releases slow down or stop, and the team focuses on reliability.

**Worked example.** A payments API has an SLO of 99.9% successful requests over 30 days. It serves 200 million requests per month.

1. Budget fraction = 1 - 0.999 = 0.001.
2. Allowed failed requests = 200,000,000 x 0.001 = **200,000 failed requests**.
3. As time: 30 days x 24 h x 60 min = 43,200 minutes. 43,200 x 0.001 = **43.2 minutes** of full outage.
4. An incident on day 10 causes 120,000 failed requests. Budget used = 120,000 / 200,000 = **60%**. Only 40% is left for 20 more days, so the team should slow risky releases.

**Burn rate** is how fast you use budget compared to "exactly on schedule". Burn rate 1 means you will use 100% of the budget in exactly 30 days. Burn rate 10 means you will use it in 3 days.

```python
def error_budget(slo, total_requests, window_days=30):
    budget = 1 - slo
    return {
        "allowed_failures": round(total_requests * budget),
        "allowed_downtime_min": round(window_days * 24 * 60 * budget, 1),
    }

def burn_rate(error_ratio, slo):
    return error_ratio / (1 - slo)   # 1.0 = exactly on budget

print(error_budget(0.999, 200_000_000))
# {'allowed_failures': 200000, 'allowed_downtime_min': 43.2}
print(burn_rate(0.0144, 0.999))  # about 14.4 -> burns 2% of a 30-day budget per hour
print(burn_rate(0.0005, 0.999))  # about 0.5 -> healthy
```

Quick downtime table for a 30-day window: 99% = 7.2 hours; 99.9% = 43.2 minutes; 99.99% = about 4.3 minutes; 99.999% = about 26 seconds.

## 3. Monitoring: the four golden signals

Source: SRE book, Chapter 6 "Monitoring Distributed Systems" (https://sre.google/sre-book/monitoring-distributed-systems/).

The book says that if you can measure only four metrics of a user-facing system, measure these:

1. **Latency** - how long requests take. Track successful and failed requests separately. A fast error is still an error, and a slow error is even worse.
2. **Traffic** - how much demand: requests per second, or transactions per second.
3. **Errors** - the rate of failed requests: explicit (HTTP 500), implicit (HTTP 200 with wrong content), or by policy (slower than your promise).
4. **Saturation** - how "full" the service is: CPU, memory, disk, queue length, thread pool use. Many systems slow down before 100% use, so saturation predicts trouble.

Analogy: a Swiggy kitchen. Latency is how long each order takes. Traffic is orders per minute. Errors are wrong or cancelled orders. Saturation is how many burners are busy.

The book also describes two styles:

- **White-box monitoring**: metrics from inside the system (counters, queue sizes). Good for finding causes and predicting problems.
- **Black-box monitoring**: testing behaviour from outside, like a user would (probers). Good for detecting what users actually feel. A prober is basically an automated end-to-end test running against production.

## 4. Alerting on symptoms, not causes

The same chapter separates **symptoms** ("what is broken": users see errors) from **causes** ("why": a database is slow). Page a human on symptoms that hurt users. Use cause metrics to debug, not to wake people up.

Rules for good alerts, based on Chapter 6 and Chapter 10 "Practical Alerting" (https://sre.google/sre-book/practical-alerting/):

- Every page must be **urgent, actionable and real**. If the on-call engineer cannot do anything, it should not page.
- Noisy alerts cause **alert fatigue**: people start ignoring them. This is exactly like flaky tests making people ignore red builds. The SWE at Google book's CI chapter makes the same comparison ("CI is alerting", https://abseil.io/resources/swe-book/html/ch23.html).
- Use tickets or dashboards for slow, non-urgent issues.

**Alerting on SLOs with burn rates.** The Workbook, Chapter 5 "Alerting on SLOs" (https://sre.google/workbook/alerting-on-slos/), recommends multi-window, multi-burn-rate alerts. Its example starting values for a 30-day SLO:

| Budget consumed | Long window | Burn rate | Action |
|---|---|---|---|
| 2% | 1 hour | 14.4 | Page |
| 5% | 6 hours | 6 | Page |
| 10% | 3 days | 1 | Ticket |

Check the maths: 30 days = 720 hours. Burning at 14.4 for 1 hour uses 14.4 / 720 = 2% of the budget. The Workbook also adds a **short window** (for example 5 minutes for the 1-hour alert) so the alert stops quickly after the problem is fixed.

## 5. Logs, metrics and traces

These three are called the **pillars of observability**. **Observability** means you can understand what is happening inside a system from the data it produces, even for problems you did not predict.

| Signal | What it is | Best for | Cost |
|---|---|---|---|
| Metrics | Numbers over time (counters, gauges, histograms) | Dashboards, alerts, trends | Cheap, aggregated |
| Logs | Event records, ideally structured (JSON) | Details of one error | Expensive at volume |
| Traces | A request's path across services as spans | Finding which service is slow | Usually sampled |

A typical debugging flow: an **SLO alert fires** (metrics) -> the latency dashboard shows the checkout service is slow -> a **trace** of a slow request shows the inventory call takes 2 seconds -> **logs** for that trace ID show "connection pool exhausted". Put the same **trace ID** in logs and traces so you can jump between them. Google's Dapper paper (2010) is the classic public description of tracing; see the previous chapter.

Watch out for **high cardinality**: a metric label like `user_id` creates millions of time series and can overload the metrics system. Put per-user detail in logs or traces instead.

## 6. Incident response

Source: SRE book, Chapter 14 "Managing Incidents" (https://sre.google/sre-book/managing-incidents/), and Chapter 13 "Emergency Response" (https://sre.google/sre-book/emergency-response/).

An **incident** is an unplanned event that hurts users or risks hurting them. The book describes clear roles so people do not all fight the fire randomly:

- **Incident Commander (IC):** owns the overall incident, assigns roles, makes decisions.
- **Operations lead:** the only team that changes the system during the incident.
- **Communications lead:** sends regular updates to stakeholders.
- **Planning lead:** handles longer-term support, like filing bugs and arranging handoffs.

Other practices from the book: keep a **live incident document**, hand off clearly when people change shifts, and declare an incident **early** rather than late.

Priority during an incident: **mitigate first, find the root cause later**. Roll back the release, drain traffic from a bad region, or turn off a feature flag. Analogy: if a pipe bursts at home, you close the main valve first. You find out why the pipe burst afterwards.

## 7. Blameless postmortems

Source: SRE book, Chapter 15 "Postmortem Culture: Learning from Failure" (https://sre.google/sre-book/postmortem-culture/).

A **postmortem** is a written record of an incident: impact, timeline, root causes, what went well, what went badly, and **action items** with owners. **Blameless** means it focuses on systems and processes, not on punishing people. The book's reasoning: if people fear blame, they hide problems, and the same failure happens again.

A good postmortem asks "How did our system allow one person's mistake to reach production?" not "Who made the mistake?" For example: "An engineer pushed a bad config" becomes the action items "add config validation in presubmit" and "canary config changes".

For a test engineer, many postmortem action items are **missing tests**: a regression test, a config test, a load test or a failure-injection test.

## 8. Release engineering: canaries, progressive rollouts, rollbacks

Sources: SRE book, Chapter 8 "Release Engineering" (https://sre.google/sre-book/release-engineering/), and Workbook Chapter 16 "Canarying Releases" (https://sre.google/workbook/canarying-releases/).

Chapter 8 stresses **hermetic, reproducible builds** (the same inputs always give the same binary), self-service release tooling, and enforced policies like code review.

- **Canary:** deploy the new version to a small part of traffic (for example 1%) and compare its metrics with the old version (the control). The name comes from canaries that miners carried to detect gas.
- **Progressive rollout:** if the canary is healthy, increase step by step: 1% -> 10% -> 50% -> 100%, often zone by zone or region by region, with a waiting time between steps.
- **Automatic rollback:** if error rate or latency is worse than the control by more than a threshold, roll back without waiting for a human.
- **Feature flags:** ship code turned off, then turn it on gradually. Turning a flag off is often faster than a rollback.

```python
def canary_verdict(control_err, canary_err, canary_reqs, max_ratio=1.5, min_reqs=1000):
    if canary_reqs < min_reqs:
        return "WAIT"                     # not enough data to judge
    if canary_err > control_err * max_ratio and canary_err > 0.001:
        return "ROLLBACK"
    return "PROMOTE"

print(canary_verdict(0.002, 0.0021, 5000))  # PROMOTE
print(canary_verdict(0.002, 0.009, 5000))   # ROLLBACK
print(canary_verdict(0.002, 0.009, 200))    # WAIT
```

Testing tip: the canary analysis is code, so test it. Feed it known-good and known-bad metric sets and check the verdicts, including the "not enough data" case.

## 9. Load shedding and graceful degradation

Sources: SRE book, Chapter 21 "Handling Overload" (https://sre.google/sre-book/handling-overload/) and Chapter 22 "Addressing Cascading Failures" (https://sre.google/sre-book/addressing-cascading-failures/).

A **cascading failure** happens when one overloaded part fails, its load moves to others, and they also fail, like falling dominoes. Retries make it worse: every failed request comes back two or three times.

Defences described in these chapters:

- **Load shedding:** when overloaded, reject some requests early and cheaply (HTTP 503) so the rest succeed. Drop the least important traffic first (for example, background prefetch before user clicks).
- **Graceful degradation:** give a simpler but still useful answer. For example, show cached results, hide recommendations, or search fewer documents. Analogy: during Tatkal rush hour, IRCTC could hide extra features and keep only the booking flow running.
- **Retry budgets and backoff:** limit retries per request and per client, and use exponential backoff with jitter.
- **Deadlines:** pass a deadline with each request. If time is already over, do not start the work.
- **Per-client limits and criticality:** protect the service from one heavy client and serve important requests first.

These paths are rarely used, so they often have bugs. Test them on purpose with load tests that push beyond capacity.

## 10. Capacity planning

Sources: SRE book, Chapter 1 "Introduction" (https://sre.google/sre-book/introduction/) lists demand forecasting and capacity planning as SRE responsibilities; Chapter 18 "Software Engineering in SRE" (https://sre.google/sre-book/software-engineering-in-sre/) describes intent-based capacity planning.

Steps:

1. **Forecast demand** from history plus planned launches (marketing events, festivals like Diwali sales).
2. **Measure capacity per instance** with load tests: "one server handles 800 QPS at p99 under 200 ms".
3. **Add headroom and redundancy.** Chapter 18's capacity examples use "N + 2 redundancy". A common way to read this: N units carry the peak load, plus 2 spare, so you survive one unit down for planned maintenance and another failing unexpectedly.
4. **Re-check regularly**, because code changes can change per-instance capacity.

Worked example: peak forecast 40,000 QPS, one instance handles 800 QPS. 40,000 / 800 = 50 instances. Running each instance at 70% for headroom: 50 / 0.7 is about 72. Spread across 3 zones so losing one zone still leaves enough: each zone needs 72 / 2 = 36, so 108 instances in total.

## Tester's corner

- An SLO is a **continuous test on real traffic**. Help define SLIs that match what users feel, just like good acceptance criteria.
- Probers (black-box monitoring) are **end-to-end tests in production**. Your Playwright and API test skills transfer directly.
- Flaky tests and noisy alerts are the same disease: low signal quality. Fix or quarantine both.
- Test the **rarely used paths**: load shedding, degradation, rollback scripts and failover. They fail exactly when you need them.
- Treat canary analysis and alert rules as code: **unit test them** with known metric inputs.
- Many postmortem action items are missing tests. Track them until they are done.
- Measure your own test infrastructure with SLOs too (for example "95% of presubmit runs finish in under 15 minutes").

## Key takeaways

- SLI is the measurement, SLO the target, SLA the contract; 100% is the wrong target.
- Error budget = 1 - SLO; 99.9% over 30 days allows 43.2 minutes or 0.1% failed requests.
- Monitor latency, traffic, errors and saturation; page on user-facing symptoms.
- Multi-window burn-rate alerts (for example 14.4x over 1 hour) catch both fast and slow budget burns.
- Use metrics to detect, traces to locate, logs to explain; link them with trace IDs.
- Incidents need clear roles, mitigation first, and blameless postmortems with owned action items.
- Release with canaries, progressive rollouts, automatic rollback and feature flags.
- Prevent cascading failures with load shedding, graceful degradation, retry budgets and deadlines; plan capacity with headroom and N+2.

## Quiz

1. Which is an SLO? A) "Latency of each request"  B) "99.9% of requests succeed over 30 days"  C) "We refund 10% if uptime is below 99.5%"  D) "CPU is 70%"
2. Your SLO is 99.95% over 30 days. How many minutes of full downtime does your budget allow?
3. Which is NOT one of the four golden signals? A) Latency  B) Traffic  C) Code coverage  D) Saturation
4. True or false: you should page the on-call engineer whenever CPU goes above 80%, even if users are not affected.
5. A service has an error ratio of 0.72% with a 99.9% SLO. What is the burn rate?
6. During an incident, what should usually come first? A) Finding the root cause  B) Mitigating user impact (for example, rolling back)  C) Writing the postmortem  D) Blaming the change author
7. What does "blameless" mean in a postmortem?
8. A canary at 1% shows an error rate three times the control after enough requests. What should the release system do?
9. True or false: retrying failed requests aggressively always helps during overload.
10. Peak forecast is 30,000 QPS, one instance handles 600 QPS, and you want to run at 75% utilisation. How many instances do you need (before zone redundancy)?

## Answer key

1. **B** - It is a target on an indicator over a window. A is an SLI, C is an SLA, D is a resource metric.
2. **21.6 minutes** - 43,200 minutes x 0.0005 = 21.6 minutes.
3. **C** - The four golden signals are latency, traffic, errors and saturation.
4. **False** - High CPU is a cause, not a user-facing symptom. Page on symptoms; use CPU for dashboards or tickets.
5. **7.2** - Burn rate = 0.0072 / 0.001 = 7.2, so a 30-day budget would be used in about 4 days.
6. **B** - Stop the user pain first (rollback, drain, flag off); investigate root cause after.
7. **Focus on systems, not people** - The postmortem looks for process and system gaps that allowed the mistake, without punishing individuals, so people report problems honestly.
8. **Roll back automatically** - Stop the rollout and revert the canary, then investigate.
9. **False** - Aggressive retries multiply load and can cause cascading failures. Use retry budgets, backoff with jitter, and load shedding.
10. **67 instances** - 30,000 / 600 = 50 at full load; 50 / 0.75 = 66.7, so round up to 67.

## Flashcards

- **Q:** What is an SLI? — **A:** A measured ratio of good events to total events that reflects user experience.
- **Q:** Why should an SLA be looser than the SLO? — **A:** So you get a warning and time to react before breaking a contract.
- **Q:** What is the error budget for a 99.9% SLO? — **A:** 0.1% of requests, or 43.2 minutes per 30 days.
- **Q:** What does burn rate 1 mean? — **A:** You will use exactly the whole error budget by the end of the window.
- **Q:** What are the four golden signals? — **A:** Latency, traffic, errors and saturation.
- **Q:** What should you page on? — **A:** User-facing symptoms that are urgent and actionable, not internal causes.
- **Q:** What are the three pillars of observability? — **A:** Metrics, logs and traces.
- **Q:** Who is the only group that changes the system during an incident? — **A:** The operations lead's team.
- **Q:** What is a canary release? — **A:** Sending a small share of traffic to the new version and comparing it with the old version before rolling out further.
- **Q:** What is load shedding? — **A:** Rejecting some requests early and cheaply during overload so the rest can succeed.
- **Q:** What is graceful degradation? — **A:** Serving a simpler but still useful response instead of failing completely.
- **Q:** What does N+2 capacity mean? — **A:** Enough capacity to survive one planned outage and one unplanned failure at the same time.

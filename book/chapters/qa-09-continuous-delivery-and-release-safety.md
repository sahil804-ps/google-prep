# Continuous Delivery and Release Safety

> **In this chapter:**
> - Explain continuous delivery and why "faster is safer" with small, frequent releases
> - Use feature flags, release trains, canary releases and staged rollouts to limit risk
> - Connect testing to production monitoring: SLIs, SLOs, error budgets, probers
> - Design automatic rollback rules and "testing in production" safely
> - Plan a safe rollout for a risky feature in an interview
>
> **Time:** ~45 minutes  |  **Level:** Intermediate

This chapter is based on Chapter 24, "Continuous Delivery", of *Software Engineering at Google* ([abseil.io/resources/swe-book/html/ch24.html](https://abseil.io/resources/swe-book/html/ch24.html)), plus the free Google SRE books: *Site Reliability Engineering* ([sre.google/sre-book](https://sre.google/sre-book/table-of-contents/)) and *The Site Reliability Workbook* chapter "Canarying Releases" ([sre.google/workbook/canarying-releases](https://sre.google/workbook/canarying-releases/)).

Testing does not stop when code is merged. A modern test engineer cares about the whole path to users: how a change is released, how problems are detected in production, and how fast they can be undone.

## What is continuous delivery?

**Continuous delivery (CD)** means your code is always in a releasable state, and releasing is a routine, automated, low-risk event. **Continuous deployment** goes one step further: every change that passes the pipeline is deployed to production automatically.

The SWE book states a core idea of CD: **smaller batches of changes result in higher quality – "faster is safer".**

**Analogy:** Compare a once-a-year Diwali house cleaning with a quick daily tidy. The yearly clean is huge, tiring and you find surprises everywhere. The daily tidy is small, and if something is out of place you know exactly what changed yesterday. Small, frequent releases are the daily tidy.

Why faster is safer:
- Each release has **fewer changes**, so if something breaks, the cause is easy to find.
- Rollback undoes **less**.
- Engineers get **feedback from real users sooner**.
- Releases become boring routine, so teams get good at them.

## The SWE book's idioms of continuous delivery

The SWE book lists aspects that each deliver value on the way to full CD:

| Idiom | Meaning (from the book) |
|---|---|
| **Agility** | Release frequently and in small batches |
| **Automation** | Reduce or remove repetitive overhead of frequent releases |
| **Isolation** | Modular architecture to isolate changes and make troubleshooting easier |
| **Reliability** | Measure key health indicators like crashes or latency and keep improving them |
| **Data-driven decision making** | Use A/B testing on health metrics to ensure quality |
| **Phased rollout** | Roll out changes to a few users before shipping to everyone |

## Release trains

A **release train** leaves at fixed times, whether your feature is on it or not. The SWE book describes how Google Search moved from struggling to release once a week to releasing a new Search binary "every other day", by automating and setting deadlines.

The book draws two lessons:

1. **No binary is perfect.** You can't fix every bug before release. You need clear key metrics with thresholds to decide what blocks a release. The book gives a story where a bug affected users of a rare dialect on one Philippine island; after gathering data, leadership chose to delay the release and fix it – a reminder that "small" user groups still matter.
2. **Meet your release deadline.** If you miss the train, catch the next one. Because trains are frequent, missing one is not a disaster.

**Analogy:** Mumbai local trains. If you miss the 8:05, you don't beg the driver to wait – the 8:09 is coming. Frequent trains remove the panic.

## Feature flags (flag guarding)

A **feature flag** is a switch in configuration that turns a piece of code on or off at runtime, without a new deployment.

The SWE book says a key to reliable continuous releases is to **"flag guard" all changes**. Benefits:

- **Separate deploy from release.** Code can be deployed "dark" (off) and turned on later.
- **Turn off a bad feature instantly**, without a rollback.
- **Gradual exposure:** 1% of users, then 10%, then 100%.
- **Change-neutral releases.** The SWE book recommends that when all new features are flag guarded, the only thing tested during a binary rollout is the stability of the deployment itself.

The SWE book also warns that flag-guarded code is not a perfect safety net for truly sensitive features (the code is still shipped, and could be discovered).

### Percentage rollout with stable bucketing

A good percentage rollout gives the **same user the same answer** every time. Otherwise a user sees the new checkout, then the old one, then the new one. The usual trick is to hash the user ID.

```python
import hashlib

def in_rollout(user_id: str, feature: str, percent: int) -> bool:
    """Stable bucketing: same user + feature always gets the same bucket."""
    key = f"{feature}:{user_id}".encode()
    bucket = int(hashlib.sha256(key).hexdigest(), 16) % 100   # 0..99
    return bucket < percent

print(in_rollout("user_42", "new_checkout", 10))   # same result every call
users = [f"u{i}" for i in range(10_000)]
share = sum(in_rollout(u, "new_checkout", 10) for u in users) / len(users)
print(round(share, 2))                              # close to 0.10
```

### Testing flags

Flags create new test responsibilities:
- Test **both states** (on and off) of every flag in CI for critical paths.
- Test the **transition**: turning the flag on mid-session doesn't corrupt data.
- Test **default values**: what happens if the flag service is unreachable? (Usually: fail safe to "off".)
- Remove **old flags**. Each flag doubles possible states; stale flags are technical debt.

## Canary releases

A **canary release** sends a new version to a **small part** of production first (a few servers, or a small percentage of users), compares its health against the old version, and only continues if it looks good.

The name comes from coal miners, who took canary birds into mines: if dangerous gas was present, the bird showed signs first, warning the miners.

The SWE book's Larger Testing chapter ([ch14](https://abseil.io/resources/swe-book/html/ch14.html)) describes **canary analysis**: during a staged rollout, compare health metrics of the canary part against the baseline part of production, and run prober assertions against the canary. The SRE Workbook's "Canarying Releases" chapter covers this process in depth.

### Comparing canary and baseline

The key idea: compare the canary to a **baseline running at the same time**, not to last week. Time of day, traffic mix and outside events affect both equally.

```python
def canary_verdict(canary, baseline, max_ratio=1.2, min_requests=1000):
    """canary/baseline: dicts with 'requests' and 'errors' counts.
    Returns 'WAIT', 'PASS' or 'FAIL'."""
    if canary["requests"] < min_requests:
        return "WAIT"                        # not enough data yet
    c_rate = canary["errors"] / canary["requests"]
    b_rate = max(baseline["errors"] / baseline["requests"], 1e-6)
    return "FAIL" if c_rate / b_rate > max_ratio else "PASS"

print(canary_verdict({"requests": 5000, "errors": 15},
                     {"requests": 95000, "errors": 190}))   # 0.3% vs 0.2% -> FAIL
print(canary_verdict({"requests": 5000, "errors": 10},
                     {"requests": 95000, "errors": 190}))   # 0.2% vs 0.2% -> PASS
```

Real canary analysis looks at many metrics (errors, latency percentiles, CPU, memory, business metrics like checkout success) and uses statistical tests to avoid reacting to noise. This simple version shows the core idea.

## Staged (phased) rollout

A **staged rollout** increases exposure step by step, with checks at each step:

```text
1% (internal users / dogfood) -> 5% -> 25% -> 50% -> 100%
     wait + check metrics at every step; stop or roll back on failure
```

The SWE book's CD TL;DR says: **"Make reality your benchmark: use a staged rollout to address device diversity and the breadth of the userbase."** It explains that release qualification in a synthetic environment that isn't similar to production can lead to late surprises. Mobile apps are a good example: you cannot test every Android device in a lab, so a staged rollout through the app store is part of the test strategy.

## Monitoring is part of testing: SLIs, SLOs, error budgets

These terms come from the Google SRE book's chapter "Service Level Objectives" ([link](https://sre.google/sre-book/service-level-objectives/)).

- **SLI (Service Level Indicator)** – a measured number about the service. Example: the percentage of payment requests that succeed within 2 seconds.
- **SLO (Service Level Objective)** – a target for an SLI. Example: 99.9% of payment requests succeed within 2 seconds, measured over 30 days.
- **SLA (Service Level Agreement)** – a contract with customers that has consequences (refunds, penalties) if missed.
- **Error budget** – the allowed amount of failure: 100% − SLO. With a 99.9% SLO, 0.1% of requests may fail. The SRE book's "Embracing Risk" chapter ([link](https://sre.google/sre-book/embracing-risk/)) describes using the error budget to balance releasing new features against reliability.

```python
def error_budget_left(slo, total_requests, failed_requests):
    """Returns the fraction of the error budget still unused."""
    allowed_failures = (1 - slo) * total_requests
    return 1 - failed_requests / allowed_failures

# SLO 99.9%, 10 million requests this month, 6,000 failed.
print(round(error_budget_left(0.999, 10_000_000, 6_000), 2))   # 0.4 -> 40% left
```

When the error budget is nearly spent, teams typically slow down risky releases and focus on reliability. As a test engineer, the error budget is a great way to talk about **release risk in numbers**.

## Probers: tests that run in production

The SWE book describes **probers** as functional tests that run assertions against the production environment, usually doing well-known, deterministic, **read-only** actions so the assertions hold even as production data changes. It warns that a prober doing **write** actions changes production state and can cause failures or user-visible side effects.

Example probers:
- Every minute, search for a known restaurant and check it appears.
- Every five minutes, load the home page from three regions and check latency.
- Use a dedicated test account for any flow that must write (and clean up), and keep it clearly separated from real users.

## Automatic rollback

When a release is bad, the fastest safe action is to undo it. Define **rollback triggers** before the release, so nobody argues during an incident:

- Canary verdict = FAIL.
- Error rate above X% for Y minutes.
- p99 latency above the SLO for Y minutes.
- Crash rate on mobile above the previous version's.
- Business metric (orders per minute) drops below the expected range.

Make rollback **fast, tested and boring**. Practise it. A rollback procedure that is never tested will fail when you need it. Also remember: database schema changes must be **backward compatible** (expand, migrate, then contract), or rollback becomes impossible.

## Testing in production – safely

"Testing in production" sounds scary, but done carefully it is how you validate reality. Safe techniques:

- **Dark launch / shadow traffic** – send a copy of real requests to the new version, compare outputs, but return the old version's answer to users.
- **Dogfooding** – employees use the new version first.
- **Feature flags for internal users only.**
- **A/B experiments** – compare user behaviour and metrics between versions.
- **Probers and synthetic monitoring.**
- **Chaos and disaster-recovery tests** (see the Performance, Load and Reliability Testing chapter) with clear limits.

Rules: protect user data, limit blast radius, have a kill switch, and never leave test data mixed with real data.

## Worked example: rolling out a new UPI payment flow

Feature: a redesigned UPI payment screen with a new backend call to fetch the user's linked bank accounts.

**1. Before release**
- Unit, integration and contract tests in CI (see the Unit Testing, Test Doubles, Test Case Design and Integration chapters).
- Both flag states tested: `new_upi_flow = on/off`.
- Backend change is backward compatible; old app versions keep working.
- Rollback triggers agreed in writing with the team.

**2. Deploy dark**
- Release train ships the code with the flag **off** for everyone. The binary rollout is change-neutral.
- Probers check the old flow still works.

**3. Dogfood**
- Flag on for employees only. Collect bugs and feedback for a few days.

**4. Staged rollout with canary analysis**
- 1% of users (stable bucketing by user ID) → compare payment success rate, p95 latency and crash rate against the 99% baseline.
- Then 5%, 25%, 50%, 100%, waiting a set period at each step.

**5. Monitoring**
- SLI: payment success rate within 5 seconds. SLO: 99.9%.
- Dashboards split by app version, Android version, bank and network type, so a problem with one bank or old devices doesn't hide in the average.

**6. Automatic rollback**
- If the canary payment success rate is worse than baseline by more than the agreed threshold, the flag turns off automatically and the team is paged.

**7. Clean up**
- After 100% for two weeks with no issues, remove the flag and the old code path.

## Interview phrases you can use

- "The SWE book's core idea of CD is 'faster is safer' – smaller batches are easier to debug and roll back."
- "I'd flag guard the feature so deployment and release are separate, and I'd test both flag states."
- "I'd compare the canary against a baseline running at the same time, not against last week."
- "I'd agree rollback triggers before the release, so the decision is automatic during an incident."
- "Monitoring is part of the test strategy: SLIs, SLOs, probers and an error budget tell us if the release is healthy."

## Tester's corner

- Ask "how will we know it's broken in production?" in every test plan. If nobody knows, that is a gap.
- Every feature flag doubles the state space. Insist on testing both states and removing old flags.
- Rollback procedures need testing too. An untested rollback is a hope, not a plan.
- Slice production metrics by version, device, region and partner – averages hide problems.
- Probers should be read-only where possible; write probers need dedicated test accounts and cleanup.
- Backward-compatible data changes are what make rollback possible. Review migrations with that question in mind.

## Key takeaways

- Continuous delivery keeps code always releasable; the SWE book's core idea is "faster is safer".
- Release trains make releases predictable; missing one train is not a disaster.
- Flag guarding separates deployment from release and allows instant turn-off and gradual exposure.
- Canary releases compare a small slice of production against a concurrent baseline.
- Staged rollouts make reality the benchmark, especially for diverse devices.
- SLIs, SLOs and error budgets turn release risk into numbers; probers test production continuously.
- Automatic rollback triggers should be defined in advance and the rollback path must be tested.

## Quiz

1. What core idea of continuous delivery does the SWE book state?
   A) Release once a year
   B) Faster is safer: smaller batches give higher quality
   C) Testing is optional with feature flags
   D) Only release on Fridays
2. True or false: feature flags allow you to deploy code without releasing it to users.
3. Why should percentage rollouts use stable bucketing (for example, hashing the user ID)?
4. What should a canary be compared against?
   A) Last month's data
   B) A baseline running at the same time
   C) The developer's laptop
   D) Nothing
5. Your SLO is 99.9%. What is your error budget?
6. True or false: probers should usually perform write actions on real user accounts.
7. What does "change-neutral release" mean in the SWE book?
8. Your payments release shows a 0.3% error rate in the canary versus 0.2% in the baseline. Your threshold is 1.2× baseline. What happens?
9. Name three safe ways to "test in production".
10. Why do database schema changes need to be backward compatible?

## Answer key

1. **B** - Smaller, more frequent changes are easier to test, debug and roll back.
2. **True** - The code ships with the flag off and is turned on later.
3. So the same user always gets the same experience, instead of flipping between old and new versions.
4. **B** - A concurrent baseline experiences the same traffic and time-of-day effects.
5. **0.1%** of requests (or time) may fail within the SLO window.
6. **False** - The SWE book says probers usually do read-only actions; writes can change production state and cause user-visible side effects.
7. All new features are flag guarded (off), so the only change tested during the binary rollout is deployment stability.
8. 0.3 / 0.2 = 1.5, which is above 1.2, so the canary fails: stop the rollout and roll back (or turn off the flag).
9. Any three of: dark launch / shadow traffic, dogfooding, internal-only flags, A/B experiments, probers or synthetic monitoring, controlled chaos tests.
10. So the old version can still run against the new schema. Otherwise, rolling back the code would break.

## Flashcards

- **Q:** What is continuous delivery? — **A:** Keeping code always releasable so releasing is routine, automated and low-risk.
- **Q:** SWE book's core CD idea? — **A:** Faster is safer: smaller batches of changes give higher quality.
- **Q:** What is a release train? — **A:** Releases that leave at fixed times whether or not a feature is ready.
- **Q:** What is flag guarding? — **A:** Putting new features behind feature flags so they can be turned on or off without deploying.
- **Q:** What is a canary release? — **A:** Releasing to a small slice of production and comparing its health to a baseline.
- **Q:** What is a staged rollout? — **A:** Increasing exposure step by step (1%, 5%, 25%...) with checks at each step.
- **Q:** SLI vs SLO? — **A:** SLI is a measured indicator; SLO is the target for it.
- **Q:** What is an error budget? — **A:** The allowed failure, 100% minus the SLO.
- **Q:** What is a prober? — **A:** A test that runs assertions against production, usually read-only.
- **Q:** What is a dark launch? — **A:** Sending copies of real traffic to a new version without showing its results to users.
- **Q:** Why define rollback triggers in advance? — **A:** So rollback is automatic and nobody debates during an incident.

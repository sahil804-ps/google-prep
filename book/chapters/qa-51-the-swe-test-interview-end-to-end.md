# The SWE-Test Interview, End to End

> **In this chapter:**
> - Understand how a test-engineering interview loop is commonly described, and how it differs from a general SWE loop
> - Answer "How would you test X?" with a repeatable 10-step framework
> - Handle coding, test design, test infrastructure design and behavioural rounds with confidence
> - Follow a 30-day final preparation plan
> - Use a final checklist for the week and the day of the interview
>
> **Time:** ~50 minutes  |  **Level:** Intermediate

This is the chapter that ties the whole Test Engineering volume together. Everything you learned – the pyramid, unit tests, doubles, test design techniques, flaky tests, CI, release safety, performance, APIs, security, accessibility, ML testing and behavioural stories – now becomes an interview performance.

**An honest note first.** Google's interview process changes over time and differs by role, level, team and country. Job titles also change (you may see "Software Engineer, Test", "Software Engineer in Test", "Test Engineer", "SETI", or "Software Engineer, Engineering Productivity" in different years and places). What follows is based on Google's public hiring material and on what candidates and recruiters commonly describe in public. **Your recruiter is the only reliable source for your specific loop.** Ask them directly what rounds you will have and what each covers – recruiters expect this question.

## What Google publicly says about its interviews

From Google's careers site ([google.com/about/careers/applications/how-we-hire](https://www.google.com/about/careers/applications/how-we-hire/)) and its "How We Hire at Google" video:

- Interviews look at four attributes: **general cognitive ability, role-related knowledge, leadership and Googleyness** (see the Googleyness and Behavioural Interviews chapter).
- Google uses **structured interviews** with consistent questions and rubrics.
- Technical candidates are typically asked to solve problems and write code; the **Google Tech Dev Guide** ([techdevguide.withgoogle.com](https://techdevguide.withgoogle.com/)) has official practice material.
- Feedback goes to a **hiring committee**, which makes a recommendation; team matching may happen before or after.

## How a test-engineering loop commonly differs from a SWE loop

A general SWE loop at Google is usually described publicly as mostly **coding and algorithms rounds**, plus a **behavioural (Googleyness and leadership)** round, and for more senior levels a **system design** round.

A test-engineering loop, as commonly described, keeps the coding bar but adds testing depth. Typical round types:

| Round type | What it checks | Volume chapters to revise |
|---|---|---|
| **Coding (data structures and algorithms)** | Write correct, clean code for a problem; complexity; *then test your own code* | DSA volume; Unit Testing Done Right |
| **Test design** | "How would you test X?" – structured, risk-based, covers all levels and non-functional areas | Test Case Design Techniques; this chapter |
| **Test infrastructure / system design** | Design a test system: flaky detector, distributed test runner, device lab, results dashboard | CI and Test Infrastructure; Flaky Tests; System Design volume |
| **Testing knowledge / discussion** | Pyramid, doubles, flakiness, CI, release safety, domain areas | All the testing chapters |
| **Behavioural (Googleyness and leadership)** | STAR stories, collaboration, ambiguity, humility | Googleyness and Behavioural Interviews |

Two key differences to remember:

1. **In coding rounds, testing is expected, not optional.** After writing code, a test-engineering candidate who says "Now let me test this" and walks through edge cases stands out. Many SWE candidates forget.
2. **Design rounds are often about test systems.** Instead of "design Instagram", you may get "design a system that runs 100,000 tests per commit" or "design a flaky test detector". The design skills are the same (requirements, scale, components, data model, trade-offs); the domain is your home ground.

Again: details vary. Some loops have more coding; some have no separate design round. Prepare for all five types.

## The "How would you test X?" framework

This is the most important skill in this chapter. Interviewers are not looking for the longest list. They want **structure, prioritisation and clear thinking**. Here is a 10-step framework. It matches the checklist your study app uses for test design prompts.

**Analogy:** A good doctor doesn't randomly order 50 tests. They ask questions, form a picture, check the most dangerous possibilities first, then the common ones, and decide what to monitor afterwards. Do the same with software.

### Step 1: Clarify requirements and assumptions
Ask 3–6 questions before listing tests. Who are the users? What platforms? What are the inputs and outputs? What scale? What does "correct" mean? Then **state your assumptions out loud**: "I'll assume Android and iOS, Indian users, and up to 10,000 scans per second at peak."

### Step 2: Functional tests (happy path)
The main things it must do. Cover each core user journey once.

### Step 3: Edge and boundary cases
Empty, null, minimum, maximum, very large, unicode, special characters, time zones, leap years, first and last items. Use EP and BVA (Test Case Design Techniques chapter).

### Step 4: Negative and error cases
Invalid input, missing permissions, dependency failures, timeouts, network loss, concurrent actions, retries. What should the user see?

### Step 5: Non-functional
Performance (latency percentiles, load), reliability, security (authN/authZ, injection, data exposure), accessibility, localisation, compatibility, usability, privacy.

### Step 6: Test levels – and why
What is unit, what is integration, what is end-to-end? Follow the pyramid and justify it: "The parsing logic is pure, so it gets many unit tests; the camera integration needs a few device tests."

### Step 7: Automation and test data
What to automate vs explore manually. Where test data comes from. Which doubles (fakes, stubs) you'd use.

### Step 8: CI and flakiness
What runs at presubmit vs post-submit vs nightly. How you'd prevent and handle flaky tests.

### Step 9: Production monitoring and release safety
Feature flags, canary, staged rollout, SLIs and SLOs, probers, dashboards sliced by device and region, rollback triggers.

### Step 10: Prioritise
"If I only had one day, I'd test these five things first, because…" This step shows judgment. **Never skip it.**

### Timing in a 45-minute round

| Minutes | Activity |
|---|---|
| 0–5 | Clarify and state assumptions |
| 5–25 | Steps 2–5: functional, edge, negative, non-functional (organise by category, out loud) |
| 25–35 | Steps 6–8: levels, automation, CI, maybe write one or two tests in code |
| 35–40 | Step 9: production and release |
| 40–45 | Step 10: prioritise; invite questions |

Write category headings on the whiteboard or shared doc first, then fill them in. It shows structure even before you say a word.

## Worked example: "How would you test the QR code scanner in a UPI payments app?"

Here is a compressed but complete answer using the framework. In the interview, you'd speak this over about 40 minutes.

**Step 1 – Clarify**
- "Does it only scan UPI payment QR codes, or other QR codes too?" → Assume UPI payment codes; other codes show a friendly message.
- "Static merchant QR codes, dynamic QR codes with a fixed amount, or both?" → Both.
- "Which platforms and minimum OS versions?" → Android and iOS, budget phones included.
- "Can users scan from a gallery image?" → Yes.
- Assumption: scanning extracts a UPI payment link (a `upi://pay?...` URI with fields such as payee address `pa`, payee name `pn`, amount `am`), then opens the payment screen.

**Step 2 – Functional**
- Scan a valid static merchant QR → payment screen shows correct payee name and address; user enters amount.
- Scan a dynamic QR with amount → amount pre-filled and locked if required.
- Scan from gallery image → same result.
- Torch button works in the dark; camera permission flow on first use.

**Step 3 – Edge and boundary**
- Tiny QR, huge QR, QR at an angle, partly damaged QR (error correction), glare, low light, printed on curved surfaces (a cup), on a cracked phone screen.
- Multiple QR codes in one frame – which one is chosen?
- Payee name with unicode (Hindi, Tamil), very long names, special characters.
- Amount boundaries: `0`, `0.01`, maximum allowed per transaction, more than two decimals.

**Step 4 – Negative and error**
- Non-UPI QR (a website URL) → clear message, never auto-open the link.
- Malformed UPI URI (missing `pa`, invalid amount like `am=-50` or `am=abc`) → reject with a clear message.
- **Security:** a QR pointing to a lookalike payee name ("Amazon Pay" vs a scammer) – does the app show the verified merchant name prominently? A QR with an injection string in the name field – is it escaped?
- Camera permission denied, then granted later from settings; camera already used by another app; app goes to background during scan.
- No network after scanning → the payment screen handles it clearly without double-charging on retry (idempotency).

**Step 5 – Non-functional**
- Performance: time from camera open to successful decode (p50, p95) on a low-end device; memory and battery use with the camera on.
- Accessibility: TalkBack/VoiceOver announce "Scan QR code" and guide the user; the result screen is fully readable; torch and gallery buttons have labels.
- Privacy: camera frames are not stored or uploaded.
- Compatibility: device matrix from analytics (budget Xiaomi/Samsung/Realme, older Android, recent iPhones), reduced with pairwise.
- Localisation: messages in supported languages.

**Step 6 – Levels**
- **Unit (most tests):** the URI parser and validator – pure logic, many cases.
- **Integration:** decoder library + parser with a set of real QR images (a "golden set" of images, including damaged and angled ones); parser + payment screen with a fake payments backend.
- **E2E (few):** on real devices in a device lab: scan a printed QR, reach payment screen, complete a test payment in a sandbox.

```python
import pytest
from scanner.upi import parse_upi_uri, InvalidQr

@pytest.mark.parametrize("uri, payee, amount", [
    ("upi://pay?pa=shop@okbank&pn=Ravi%20Stores", "shop@okbank", None),
    ("upi://pay?pa=shop@okbank&pn=Ravi&am=150.00", "shop@okbank", "150.00"),
])
def test_valid_upi_uri_is_parsed(uri, payee, amount):
    result = parse_upi_uri(uri)
    assert result.payee == payee and result.amount == amount

@pytest.mark.parametrize("uri", [
    "https://example.com",                       # not UPI
    "upi://pay?pn=NoAddress",                    # missing pa
    "upi://pay?pa=shop@okbank&am=-50",           # negative amount
    "upi://pay?pa=shop@okbank&am=abc",           # not a number
])
def test_invalid_qr_is_rejected(uri):
    with pytest.raises(InvalidQr):
        parse_upi_uri(uri)
```

**Step 7 – Automation and data**
- Automate the parser, the golden image set and a few device journeys.
- Manual and exploratory sessions for real-world conditions: charter "scan QR codes in real shops in poor light and at odd angles".
- Test data: a versioned library of QR images (valid, damaged, malicious, non-UPI), generated plus photographed.

**Step 8 – CI**
- Presubmit: parser unit tests and golden image decode tests (fast, hermetic).
- Post-submit or nightly: device lab runs. Track flakiness; camera tests on real devices are flaky-prone, so separate infrastructure failures from test failures and quarantine with owners.

**Step 9 – Production**
- Ship behind a feature flag; staged rollout 1% → 100%.
- Monitor: scan success rate, time-to-decode, "invalid QR" rate, payment completion after scan – sliced by device model, OS version and app version.
- Rollback trigger: scan success drops by more than an agreed threshold compared with the baseline.

**Step 10 – Prioritise (top 5)**
1. Parser correctness and rejection of malformed or malicious codes (money and security risk).
2. Correct payee shown clearly (fraud risk).
3. Scan success on low-end devices in poor light (largest user impact).
4. No double payment on network retry.
5. Camera permission flows and accessibility.

Notice how the answer is organised by category, uses techniques by name, includes a bit of code, and ends with clear priorities.

## Handling the coding round as a test engineer

1. **Clarify** the problem and examples. Ask about input size and edge cases.
2. **Talk through an approach** and its time and space complexity before coding.
3. **Write clean code** with good names.
4. **Test your code out loud:** walk through one normal example line by line, then edge cases (empty input, one element, duplicates, negative numbers, very large input).
5. **Offer unit tests:** "If this were production code, I'd add these tests: …" and write two or three in pytest style if time allows.
6. **Discuss improvements:** better complexity, or how you'd handle a larger scale.

Step 4 and 5 are where you can shine compared with general SWE candidates.

## Handling the test infrastructure design round

Use the same structure as system design, with a testing focus:

1. **Requirements:** functional (run tests, report results, detect flakes) and non-functional (scale: tests per day, feedback time p95, cost, reliability).
2. **Estimates:** number of tests, average duration, machines needed. "100,000 tests × 30 seconds = 3 million machine-seconds. To finish in 10 minutes, I need about 5,000 parallel workers – so test selection and caching are essential."
3. **API and data model:** submit run, get status, test history; tables for runs, results, tests.
4. **High-level design:** scheduler, workers, artifact storage, results service, flakiness analyser, dashboard.
5. **Deep dive:** sharding strategy, retries and flaky classification, culprit finding, caching keys.
6. **Trade-offs and metrics:** speed vs cost vs coverage; signal quality (flaky rate), feedback time, cost per run.

Mention public ideas carefully: "As described in the SWE book, Google's TAP uses a dependency graph for test selection and batches changes with culprit finding."

## Common mistakes in test-engineering interviews

- Jumping into a long list without clarifying questions.
- Listing only UI tests (an ice cream cone answer).
- Forgetting non-functional areas: performance, security, accessibility.
- Never prioritising.
- Not testing your own code in the coding round.
- Claiming knowledge of Google internals you don't really have.
- Going silent. Think out loud – the interviewer grades your reasoning, not just the final answer.

## The 30-day final preparation plan

This plan assumes about 2–3 hours on weekdays and 5–6 hours on weekend days. Adjust to your life. The rule: **a little every day beats a lot once a week.**

### Week 1 (Days 1–7): Foundations and diagnosis
- **Daily:** 2 coding problems (easy/medium) from core patterns: arrays, hashing, two pointers, sliding window. After each, write 3–5 test cases.
- **Days 1–3:** Re-read the chapters on Google testing, unit testing and test doubles. Explain the test pyramid and test sizes aloud in 2 minutes.
- **Days 4–5:** Test Case Design Techniques chapter. Do the password and ATM exercises again from memory.
- **Day 6:** Write your 8 STAR stories in bullet form.
- **Day 7:** Mock test design question (timed 45 minutes). Note your weak steps in the framework.

### Week 2 (Days 8–14): Depth in testing topics
- **Daily:** 2 coding problems (stacks, queues, linked lists, binary search, trees).
- **Days 8–9:** Integration/E2E and Flaky Tests chapters. Practise "Design a flaky test detector".
- **Days 10–11:** CI and Test Infrastructure, and Continuous Delivery chapters. Practise "Our CI takes 90 minutes – fix it."
- **Day 12:** Performance chapter; write a small Locust script.
- **Day 13:** Practise 3 STAR stories aloud with a 2-minute timer.
- **Day 14:** Full mock: one coding + one test design round with a friend.

### Week 3 (Days 15–21): Breadth and design
- **Daily:** 2 coding problems (graphs: BFS/DFS, heaps, intervals, basic dynamic programming).
- **Days 15–16:** API, mobile, security and accessibility chapter. Do a 20-minute "how would you test" on a different app every day.
- **Day 17:** Testing ML and AI systems chapter. Prepare how you evaluated AI output in qaforge-mcp / AI-QA-Script.
- **Days 18–19:** Two test infrastructure design questions (distributed test runner, device lab).
- **Day 20:** Practise the remaining STAR stories aloud.
- **Day 21:** Full mock loop: coding, test design, design, behavioural (can be spread across the day).

### Week 4 (Days 22–30): Polish and rest
- **Daily:** 1–2 coding problems, mostly re-solving problems you got wrong before (spaced repetition).
- **Days 22–24:** Do 3 more timed test-design prompts from your study app, using the 10-step framework. Review the model answers *after* trying.
- **Days 25–26:** Final mocks. Focus on thinking aloud and prioritising.
- **Day 27:** Review flashcards and key takeaways from all Test Engineering chapters.
- **Day 28:** Prepare your questions for interviewers; review logistics.
- **Day 29:** Light review only. Re-read your STAR bullets. Sleep early.
- **Day 30:** Interview day (or rest day before it). No new topics.

**Track it:** keep a simple log – date, problems solved, mocks done, weak areas. Seeing progress keeps motivation up.

## Final checklist

### One week before
- [ ] I know which rounds I have (asked my recruiter).
- [ ] I can explain the test pyramid, test sizes vs scope, and the Beyoncé Rule in under 2 minutes each.
- [ ] I can define fake, stub, mock and spy with one example each.
- [ ] I can apply EP, BVA, decision tables, state transitions and pairwise on any input.
- [ ] I can explain flaky test causes, detection and quarantine, with public Google numbers.
- [ ] I can explain presubmit vs post-submit, test selection, sharding, caching and bisection.
- [ ] I can explain canary, feature flags, SLOs and error budgets.
- [ ] I can explain p50/p95/p99 and load vs stress vs soak vs spike.
- [ ] I know the API checklist, OWASP Top 10 basics and WCAG POUR.
- [ ] I can explain how to evaluate ML and LLM systems.
- [ ] I have 8 STAR stories ready and practised aloud.
- [ ] I have solved at least 60–80 coding problems across core patterns, and I always test my code.

### The day before
- [ ] Laptop charged; stable internet; quiet room; backup hotspot.
- [ ] Interview links, times (in IST!) and recruiter contact saved.
- [ ] Shared editor / whiteboard tool tested.
- [ ] Water, notebook and pen ready.
- [ ] 2–3 questions for each interviewer prepared.
- [ ] Sleep at least 7 hours.

### In every round
- [ ] Clarify before solving.
- [ ] Think out loud.
- [ ] Structure answers with headings or numbered steps.
- [ ] Test my own code.
- [ ] Mention non-functional areas.
- [ ] Prioritise at the end.
- [ ] Stay calm if stuck: say what you know, try a simpler version, ask for a hint politely.

## Interview phrases you can use

- "Before I list tests, can I ask a few clarifying questions?"
- "Let me organise this into functional, edge cases, negative cases, non-functional, and then levels and automation."
- "Now that the code works for the main example, let me test it with edge cases."
- "If I had only one day, these are the five things I'd test first, because they carry the most user and money risk."
- "I'm not sure about the internal details at Google, but based on the public SWE book, I'd expect…"

## Tester's corner

- Your test design answers are where your 5.5 years of experience give you an edge – use real examples from your work.
- Always show the pyramid in your answers: many unit tests, some integration, few E2E.
- Testing your own code in the coding round is the easiest way to stand out as a test-engineering candidate.
- For design rounds, connect to your real tools – qaforge-mcp's flaky detection is a natural lead-in to "design a flaky test detector".
- Practise in English out loud every day; clear and structured beats fancy words.
- Treat mocks seriously: time them, record them, and fix one weakness at a time.

## Key takeaways

- Google's process varies; ask your recruiter which rounds you will have.
- A test-engineering loop usually keeps the coding bar and adds test design, test infrastructure design and testing discussion, plus a behavioural round.
- Use the 10-step framework for "How would you test X?": clarify, functional, edge, negative, non-functional, levels, automation and data, CI and flakiness, production, prioritise.
- In coding rounds, always test your own code out loud and offer unit tests.
- In design rounds, apply system design structure to test systems and quote only public facts about Google.
- Follow a steady 30-day plan with daily coding, chapter reviews, STAR practice and weekly mocks.

## Quiz

1. Who is the most reliable source for which rounds you will have?
   A) Online forums  B) Your recruiter  C) A friend who interviewed in 2015  D) Guessing
2. What is the very first step of the "How would you test X?" framework?
3. True or false: in a test-engineering coding round, you should stop as soon as the code compiles.
4. Name the five round types commonly described for a test-engineering loop.
5. Why is the "Prioritise" step important?
6. In a 45-minute test design round, roughly how long should you spend clarifying at the start?
   A) 0 minutes  B) About 5 minutes  C) 20 minutes  D) The whole round
7. True or false: listing 40 UI tests is the strongest answer to "How would you test X?".
8. An interviewer asks how Google's internal test system works and you don't know. What do you say?
9. Give three non-functional areas you should mention for a mobile feature.
10. In the QR scanner example, why are most tests unit tests on the URI parser?

## Answer key

1. **B** - The process varies by role, level, team and country, so ask your recruiter.
2. **Clarify requirements and state assumptions.**
3. **False** - Walk through examples and edge cases, and offer unit tests. This is where test-engineering candidates stand out.
4. **Coding, test design, test infrastructure / system design, testing knowledge discussion, and behavioural.**
5. It shows judgment about risk. Time is always limited, and interviewers want to see what you'd test first and why.
6. **B** - About 5 minutes of clarifying questions and stated assumptions.
7. **False** - That is an ice cream cone answer. Show structure, the pyramid, non-functional areas and prioritisation.
8. Say honestly that you don't know the internal details, share what is public (for example, the SWE book's description of TAP), and explain how you would design it from first principles.
9. Any three of: performance, battery, memory, network conditions, accessibility, security, privacy, localisation, compatibility.
10. Parsing and validation are pure logic: fast, deterministic and full of edge cases, so unit tests give the most confidence per minute, following the pyramid.

## Flashcards

- **Q:** Most reliable source for your interview rounds? — **A:** Your recruiter.
- **Q:** First step for "How would you test X?" — **A:** Clarify requirements and state assumptions.
- **Q:** Last step for "How would you test X?" — **A:** Prioritise: what you would test first and why.
- **Q:** The 10 framework steps? — **A:** Clarify, functional, edge, negative, non-functional, levels, automation and data, CI and flakiness, production, prioritise.
- **Q:** Biggest coding-round differentiator for test engineers? — **A:** Testing your own code out loud and offering unit tests.
- **Q:** Typical test infrastructure design prompts? — **A:** Flaky test detector, distributed test runner, device lab, test results dashboard.
- **Q:** How to talk about Google internals? — **A:** Only quote public sources like the SWE book and say so.
- **Q:** Time split for the start of a test design round? — **A:** About 5 minutes clarifying and stating assumptions.
- **Q:** What is an ice cream cone answer? — **A:** An answer that lists mostly UI or end-to-end tests with no lower-level tests.
- **Q:** Rule for the 30-day plan? — **A:** A little every day beats a lot once a week; mock weekly and fix one weakness at a time.

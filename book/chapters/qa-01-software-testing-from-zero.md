# Software Testing from Zero

> **In this chapter:**
> - Understand why we test and what testing can and cannot prove
> - Tell verification from validation, and an error from a defect from a failure
> - Name the test levels, test types and box techniques, and know when to use each
> - Walk through the test lifecycle and know the difference between a test strategy, a test plan and a test case
> - Write bug reports that developers are happy to receive
>
> **Time:** ~40 minutes  |  **Level:** Zero

You have 5.5 years of testing experience, so much of this chapter will feel familiar. That is good. But in a Google interview you must explain these basics in clear, precise words. Many experienced testers know *how* to test but cannot explain *why* in one clean sentence. This chapter gives you that vocabulary. Treat it as the foundation for every other chapter in this volume.

## Why we test

Software is written by people, and people make mistakes. Testing is how we find those mistakes before users do.

Think about IRCTC railway booking. If the seat count is wrong by one, two people get the same berth. If payment succeeds but the ticket is not created, a user loses money. Each of these is a small mistake in code, but the cost to the user is large.

So testing has three main goals:

1. **Find defects early**, when they are cheap to fix. A bug found while writing code costs minutes. The same bug found in production can cost days, money and user trust.
2. **Give confidence to change code.** With a good test suite, an engineer can change code on Friday and still sleep well. This is the goal Google talks about most (see the How Google Thinks About Testing chapter).
3. **Give information for decisions.** Tests tell the team "is this release ready?" A tester is an information provider, not a gatekeeper.

### What testing cannot do

Testing shows the presence of bugs, not their absence. You can never test every input. A function that takes two 32-bit integers has about 18 quintillion input pairs. So testing is always about **risk**: you choose the tests that give the most confidence for the time you have.

Say this in an interview. It shows maturity: "Exhaustive testing is impossible, so I prioritise by risk."

## Verification vs validation

These two words sound alike but mean different things.

- **Verification** asks: *Are we building the product right?* Does the code match the specification? Reviews, unit tests and static analysis are verification.
- **Validation** asks: *Are we building the right product?* Does the product solve the user's real problem? User acceptance testing, usability studies and A/B experiments are validation.

**Analogy:** You order a masala dosa on Swiggy. Verification is checking that the restaurant made a masala dosa exactly as the menu describes. Validation is checking that a masala dosa is actually what you were hungry for. A product can pass verification and still fail validation: perfectly built, but nobody wants it.

## Error, defect, failure

These three words describe a chain.

| Term | Meaning | Example |
|---|---|---|
| **Error (mistake)** | A human action that is wrong | A developer types `<` instead of `<=` |
| **Defect (bug, fault)** | The wrong thing now sitting in the code | The `if age < 18` check in the code |
| **Failure** | The visible wrong behaviour when the defect runs | An 18-year-old user is blocked from signing up |

A defect does not always cause a failure. If no 18-year-old ever signs up, the defect stays hidden. This is why test data matters so much: a defect only shows itself when the right input reaches it.

You may also hear **incident** (a failure in production that affects users) and **root cause** (the original reason the defect exists).

## Test levels

A test level tells you *how much of the system* a test covers.

1. **Unit testing** – tests one small piece (a function or class) alone. Fast, cheap, precise.
2. **Integration testing** – tests how two or more pieces work together, for example your service plus its database.
3. **System testing** – tests the whole application as one product, usually in a test environment.
4. **Acceptance testing** – checks that the product meets the business need. Often done with or by the customer (UAT = user acceptance testing).

**Analogy:** Building a car. Unit testing checks one spark plug. Integration testing checks that the spark plug works with the engine. System testing drives the full car on a test track. Acceptance testing lets the customer drive it and say "yes, I will buy this".

Google uses slightly different words – *test size* and *test scope* – which you will learn in the How Google Thinks About Testing chapter.

## Test types

Test levels say *how much*; test types say *what quality* you are checking. You can do most types at most levels.

### Functional testing
Checks *what* the system does against requirements. "When I add an item to the cart, the cart count goes up by one."

### Regression testing
Checks that old features still work after a change. Most automated suites are regression suites. **Analogy:** after a plumber fixes your kitchen tap, you check the bathroom tap still works too.

### Smoke testing
A small, fast set of tests that checks the most important paths work at all. If smoke fails, the build is too broken to test further. Name comes from hardware: switch it on and see if it smokes.

### Sanity testing
A narrow, quick check after a small change or bug fix, to confirm that specific area behaves sensibly. Smoke is *broad and shallow*; sanity is *narrow and focused*. Many teams mix these words, so in an interview define them before you use them.

### Performance testing
Checks speed, scalability and stability under load: response time, throughput, resource use. Covered in the Performance, Load and Reliability Testing chapter.

### Security testing
Checks that the system protects data and resists attack: authentication, authorisation, input validation, data exposure. Covered in the Testing APIs, Mobile Apps, Security and Accessibility chapter.

### Usability testing
Checks that real users can complete tasks easily. Usually done with real people watching a user try the product.

### Accessibility testing
Checks that people with disabilities can use the product: screen readers, keyboard-only navigation, colour contrast, captions. The main standard is WCAG (Web Content Accessibility Guidelines). Covered in the Testing APIs, Mobile Apps, Security and Accessibility chapter.

### Compatibility testing
Checks the product works across browsers, devices, operating systems, screen sizes and network types. For an Indian audience this matters a lot: many users are on low-cost Android phones with slow networks.

## Black box, white box, grey box

These describe *how much you know about the inside* of the system when you design tests.

- **Black box** – you only see inputs and outputs. You design tests from requirements. Techniques: equivalence partitioning, boundary values, decision tables (see the Test Case Design Techniques chapter).
- **White box** – you can read the code. You design tests to cover branches, paths and conditions. Code coverage tools help here.
- **Grey box** – you know some internals (the database schema, the API contract, the architecture) and use that to design smarter black-box tests. Most SDET work is grey box. For example, you know the API caches results for 60 seconds, so you write a test that checks stale data after an update.

**Analogy:** A black-box tester of a ceiling fan only uses the regulator and watches the speed. A white-box tester opens the motor. A grey-box tester has read the wiring diagram but still tests through the regulator.

## The test lifecycle

Most teams follow a cycle like this. Names vary, so learn the ideas, not the exact labels.

1. **Requirement analysis** – read the requirements, ask questions, find what is testable and what is ambiguous. Testers find many bugs here, before any code exists.
2. **Test planning** – decide scope, approach, environments, tools, people, schedule and risks.
3. **Test design** – write test cases and prepare test data.
4. **Environment setup** – get the build, servers, test accounts and devices ready.
5. **Test execution** – run tests, log results, report defects.
6. **Defect tracking** – follow bugs through states: New → Triaged → In progress → Fixed → Verified → Closed (or Reopened).
7. **Test closure** – summarise results, coverage and remaining risks, and share lessons learned.

In modern teams that release daily, this cycle is not a big waterfall. It runs in small loops inside every feature and every pull request.

## Test strategy vs test plan vs test case

Interviewers like this question because people confuse the three.

| Document | Question it answers | Scope | Lifespan |
|---|---|---|---|
| **Test strategy** | *How do we test in general?* | Whole product or organisation | Long; changes rarely |
| **Test plan** | *How do we test this release or feature?* | One project, feature or release | Medium |
| **Test case** | *What exact steps and checks?* | One behaviour | Short; changes with the feature |

- A **test strategy** says things like: "We follow the test pyramid. Every change needs unit tests. End-to-end tests run nightly. We use Playwright for UI and pytest for APIs."
- A **test plan** for "UPI AutoPay" says: scope (create mandate, debit, cancel), out of scope (refunds), environments, risks (bank sandbox is unstable), entry and exit criteria, schedule.
- A **test case** says: "Given a user with an active mandate of ₹500, when the merchant debits ₹500 on the due date, then the debit succeeds and the user gets an SMS."

A good test case has: an ID, a title that states the behaviour, preconditions, steps, test data, expected result, and priority.

## Writing bug reports that developers love

A bug report is a product you deliver to a developer. If it is unclear, the bug waits. If it is clear, the bug gets fixed fast. Your aim: the developer should be able to reproduce the bug in under five minutes without talking to you.

### The parts of a great bug report

1. **Title** – one line that states the failure and where. Bad: "Payment broken". Good: "Checkout returns HTTP 500 when coupon code has a lowercase letter".
2. **Environment** – build number, URL, browser or device, OS, account type.
3. **Steps to reproduce** – numbered, minimal, exact. Remove any step that is not needed.
4. **Expected result** – what should happen, with a link to the requirement if possible.
5. **Actual result** – what did happen. Include exact error text.
6. **Evidence** – screenshot, video, HAR file, logs, request ID or trace ID.
7. **Frequency** – always, or 3 out of 10 times? This tells the developer if it might be a race condition.
8. **Severity and priority** – severity is the *impact* on the user; priority is *how soon* to fix. A typo in the company name on the home page is low severity but high priority.
9. **Notes** – what you already tried. "Works with uppercase coupon. Started in build 4.2.1, not in 4.2.0."

That last line is gold. When you narrow down *when* a bug started and *which inputs* trigger it, you have done half the debugging for the developer.

### Worked example: from a bad report to a great one

**Bad report:**

> Coupon not working. Please fix urgently.

**Great report:**

> **Title:** Checkout API returns 500 when coupon code contains lowercase letters
>
> **Environment:** staging, build 4.2.1, Chrome 129, test user `qa_user_17`
>
> **Steps:**
> 1. Add any item to cart.
> 2. Enter coupon `save10` (lowercase).
> 3. Click "Apply".
>
> **Expected:** Coupon applied, 10% discount shown (coupon codes are case-insensitive per PRD section 3.2).
>
> **Actual:** Red toast "Something went wrong". `POST /api/coupon` returns 500. Trace ID `abc123`.
>
> **Frequency:** 10/10.
>
> **Notes:** `SAVE10` works. Bug is not present in build 4.2.0. Probably related to the coupon lookup change in commit `f3e9`.

You can also add an automated test that reproduces the bug. A failing test is the clearest bug report of all.

```python
# A failing test is the best bug report: it reproduces the bug exactly.
from checkout import apply_coupon

def test_coupon_code_is_case_insensitive():
    # Arrange: a cart worth 1000 rupees
    cart_total = 1000
    # Act: apply the coupon in lowercase
    discounted = apply_coupon(cart_total, "save10")
    # Assert: same result as uppercase "SAVE10"
    assert discounted == 900
# Expected today: FAILS (raises an exception). After the fix: PASSES.
```

## Putting it together: a mini test plan

Imagine your manager says: "We are adding a 'split bill' feature to our payments app. Plan the testing." Here is how the ideas in this chapter fit together.

- **Verification:** unit tests for the split math (₹100 split three ways = 33.34 + 33.33 + 33.33); code review of rounding rules.
- **Validation:** a small user study – do users understand who owes what?
- **Levels:** unit (math), integration (split service + notification service), system (full app flow), acceptance (product manager sign-off).
- **Types:** functional, regression of the existing "pay" flow, smoke after every build, performance (a group of 50 people), security (can user A see user B's bills?), accessibility (screen reader reads amounts correctly), compatibility (low-end Android).
- **Box:** black-box tests from the spec, white-box coverage of rounding branches, grey-box checks on the database to make sure totals always add up.

This kind of structured answer is exactly what interviewers want when they ask "How would you test X?" The last chapter of this volume, "The SWE-Test Interview, End to End", turns it into a full framework.

## Interview phrases you can use

- "Testing cannot prove the absence of bugs, so I prioritise tests by risk and user impact."
- "Verification checks we built it right; validation checks we built the right thing."
- "I'd define smoke and sanity first, because teams use the words differently."
- "My goal in a bug report is that the developer can reproduce it in five minutes without asking me anything."
- "Severity is impact; priority is urgency. They are not always the same."

## Tester's corner

- In interviews, define your terms before you use them. Different companies use "sanity", "smoke" and "integration" differently.
- Every bug you find late is a question: "Which earlier test level should have caught this?" That question drives process improvement.
- Your value is not the number of bugs you file. It is the quality of the *information* you give the team.
- Grey-box thinking is your superpower as an SDET. Use what you know about APIs, databases and caches to design sharper tests.
- Narrowing down "which build" and "which input" before filing a bug saves developers hours.
- Requirement reviews are testing too. Asking "what happens if the user is offline?" before coding starts is the cheapest bug fix possible.

## Key takeaways

- We test to find defects early, to give confidence to change code, and to inform release decisions.
- Exhaustive testing is impossible, so testing is about managing risk.
- Verification = built right; validation = right thing built.
- An error (human mistake) creates a defect (in code), which may cause a failure (visible wrong behaviour).
- Test levels (unit, integration, system, acceptance) describe how much is tested; test types (functional, regression, performance, security, etc.) describe which quality is checked.
- A strategy is the long-term approach, a plan is for one release or feature, a case is one checked behaviour.
- A great bug report is minimal, reproducible, and includes evidence and the narrowed-down trigger.

## Quiz

1. Which question does *validation* answer?
   A) Did we follow the coding standard?
   B) Are we building the right product?
   C) Does the code compile?
   D) Is test coverage above 80%?
2. True or false: every defect in the code will eventually cause a failure.
3. A developer writes `<` instead of `<=`. What is this, in the error–defect–failure chain, at the moment they type it?
   A) Failure  B) Incident  C) Error  D) Root cause
4. Which test type checks that existing features still work after a change?
   A) Smoke  B) Regression  C) Usability  D) Acceptance
5. What is the main difference between smoke testing and sanity testing?
6. You know an API caches responses for 60 seconds, and you design a test around that. Which approach is this?
   A) Black box  B) White box  C) Grey box  D) Exploratory
7. Which document would say "Every change must include unit tests; end-to-end tests run nightly"?
   A) Test case  B) Test plan  C) Test strategy  D) Bug report
8. True or false: a bug can have low severity but high priority.
9. A developer says "I can't reproduce your bug". What would you do?
10. Which item in a bug report most helps a developer find the cause fast?
    A) The word "urgent" in the title
    B) The tester's opinion of the developer
    C) Narrowed-down trigger: which input and which build introduced it
    D) A long list of every step you took that day

## Answer key

1. **B** - Validation asks whether the product solves the user's real need. Verification asks whether it matches the specification.
2. **False** - A defect only causes a failure when the faulty code runs with the input that triggers it. Many defects stay hidden.
3. **C** - The human action is the error (mistake). The wrong code it leaves behind is the defect.
4. **B** - Regression testing re-checks old behaviour after a change.
5. **Smoke is broad and shallow** (do the main paths work at all?); **sanity is narrow and focused** (does this one fixed area behave sensibly?).
6. **C** - Grey box uses some knowledge of internals to design tests that still go through the external interface.
7. **C** - This is a general, long-lived approach, so it belongs in the test strategy.
8. **True** - Example: a typo in the company name on the home page. Little user impact, but it should be fixed quickly.
9. Share exact environment, build, account and data; attach a video, logs and trace ID; check frequency (maybe it is intermittent); offer to pair; and if possible write an automated test that reproduces it.
10. **C** - Knowing the exact trigger and the first bad build cuts the search space dramatically.

## Flashcards

- **Q:** What is verification? — **A:** Checking we built the product right, that is, it matches the specification.
- **Q:** What is validation? — **A:** Checking we built the right product, that is, it meets the user's real need.
- **Q:** Error vs defect vs failure? — **A:** Error is the human mistake, defect is the wrong code, failure is the visible wrong behaviour.
- **Q:** Smoke vs sanity testing? — **A:** Smoke is broad and shallow on a new build; sanity is narrow and focused after a small change.
- **Q:** What is grey-box testing? — **A:** Designing tests from the outside while using some knowledge of internals like schemas or caches.
- **Q:** Test strategy vs test plan? — **A:** Strategy is the long-term general approach; plan is for one release or feature.
- **Q:** Severity vs priority? — **A:** Severity is user impact; priority is how soon it must be fixed.
- **Q:** Why is exhaustive testing impossible? — **A:** The number of inputs and paths is too large, so we choose tests by risk.
- **Q:** What are the four classic test levels? — **A:** Unit, integration, system and acceptance.
- **Q:** What is the best bug report of all? — **A:** A small automated test that fails and reproduces the bug exactly.

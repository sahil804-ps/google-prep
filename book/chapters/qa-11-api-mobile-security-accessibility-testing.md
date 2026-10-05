# Testing APIs, Mobile Apps, Security and Accessibility

> **In this chapter:**
> - Test APIs thoroughly: status codes, schemas and contracts, authentication and authorisation, idempotency, rate limits, pagination and versioning
> - Plan mobile testing: device matrix, networks, offline mode, battery, permissions, interruptions and upgrades
> - Know the OWASP Top 10 basics and write simple security tests a QA engineer can own
> - Know WCAG basics and test accessibility with automated tools and manual checks
> - Combine all four on one worked example: a "send money" feature
>
> **Time:** ~55 minutes  |  **Level:** Intermediate

This chapter covers four specialised areas that appear in almost every "How would you test X?" question. You already do API and UI testing at work, so the goal here is to add structure and the key standards: the **OWASP Top 10** ([owasp.org/Top10](https://owasp.org/Top10/)), the **OWASP API Security Top 10** ([owasp.org/API-Security](https://owasp.org/API-Security/)), and **WCAG** from the W3C ([w3.org/WAI/standards-guidelines/wcag](https://www.w3.org/WAI/standards-guidelines/wcag/)). The Google Testing Blog ([testing.googleblog.com](https://testing.googleblog.com/)) has many posts on these topics too.

## Part 1: API testing

An **API (Application Programming Interface)** is how programs talk to each other. Most web and mobile apps talk to their backend through HTTP APIs (REST, gRPC or GraphQL). API tests are faster and more stable than UI tests, and they check the real business logic – so they sit lower in the pyramid than E2E tests.

**Analogy:** An API is a restaurant's order window. The menu (the contract) says what you can ask for and what you'll get. API testing checks that the window gives the right dish, refuses invalid orders politely, only serves people who've paid, and doesn't collapse at lunch rush.

### The API test checklist

**1. Status codes** – the right code for each situation:

| Code | Meaning | Test example |
|---|---|---|
| 200 / 201 | OK / Created | Valid request |
| 400 | Bad request | Missing required field, wrong type |
| 401 | Not authenticated | No token, expired token |
| 403 | Authenticated but not allowed | User A accessing admin endpoint |
| 404 | Not found | Unknown ID (or hide existence for security) |
| 409 | Conflict | Duplicate create, version conflict |
| 422 | Valid JSON, invalid values | Negative amount |
| 429 | Too many requests | Rate limit exceeded |
| 5xx | Server error | Should never happen for bad *client* input |

A 500 caused by bad user input is always a bug: the server should validate and return 4xx.

**2. Schema and contract** – the response has the agreed fields, types and enums. Use JSON Schema, OpenAPI validation, or consumer-driven contracts (see the Integration and End-to-End Testing chapter).

**3. Authentication (authN) vs authorisation (authZ)**
- **Authentication** = *who are you?* (login, token, API key)
- **Authorisation** = *what are you allowed to do?* (can user A read user B's data?)

The most common serious API bug is broken authorisation: changing an ID in the URL and seeing someone else's data. OWASP's API Security Top 10 (2023) lists **Broken Object Level Authorization (BOLA)** as API1. It is also called **IDOR** (Insecure Direct Object Reference).

**4. Idempotency** – sending the same request twice should not do the action twice. Critical for payments: if the network drops after the user taps "Pay", the app retries. Many payment APIs use an **idempotency key** header: same key → same result, no second charge.

**5. Rate limits** – too many requests get **429 Too Many Requests**, often with a `Retry-After` header. Check limits per user, reset timing, and that other users are not affected.

**6. Pagination** – first page, last page, empty page, page size limits, and stable ordering while new data arrives (cursor-based pagination handles this better than offset).

**7. Versioning and backward compatibility** – old clients (old app versions!) must keep working. Adding a field is usually safe; removing or renaming one breaks clients.

**8. Input validation** – boundaries, unicode, very long strings, nulls, wrong types, extra unknown fields.

**9. Error format** – errors have a consistent, helpful body, and never leak stack traces or internal details.

### API tests in Python

```python
import requests

BASE = "https://staging.pay.test/api/v1"

def test_get_own_transaction_returns_200(token_a, txn_of_a):
    r = requests.get(f"{BASE}/transactions/{txn_of_a}",
                     headers={"Authorization": f"Bearer {token_a}"}, timeout=5)
    assert r.status_code == 200
    assert r.json()["id"] == txn_of_a

def test_cannot_read_another_users_transaction(token_a, txn_of_b):
    # BOLA / IDOR check: user A asks for user B's transaction
    r = requests.get(f"{BASE}/transactions/{txn_of_b}",
                     headers={"Authorization": f"Bearer {token_a}"}, timeout=5)
    assert r.status_code in (403, 404)       # never 200
    assert "amount" not in r.text            # and no data leaked

def test_missing_token_returns_401():
    r = requests.get(f"{BASE}/transactions/any", timeout=5)
    assert r.status_code == 401
```

```python
import uuid
import requests

def test_same_idempotency_key_charges_once(token_a, api_balance):
    key = str(uuid.uuid4())
    body = {"to": "merchant_1", "amount_paise": 50000}
    headers = {"Authorization": f"Bearer {token_a}", "Idempotency-Key": key}
    before = api_balance(token_a)

    r1 = requests.post(f"{BASE}/payments", json=body, headers=headers, timeout=5)
    r2 = requests.post(f"{BASE}/payments", json=body, headers=headers, timeout=5)

    assert r1.status_code == 201
    assert r2.json()["payment_id"] == r1.json()["payment_id"]   # same result
    assert api_balance(token_a) == before - 50000               # charged once
```

## Part 2: Mobile testing

Mobile apps run in a world you don't control: thousands of devices, unstable networks, low batteries, interruptions and users who never update. In India especially, a large share of users are on budget Android phones with limited memory and patchy mobile data.

**Analogy:** Testing a web app is like testing a car on a test track. Testing a mobile app is like testing an auto-rickshaw on real Indian roads – potholes, traffic, rain, and every driver has modified their vehicle a little.

### The device matrix

You can't test every device, so you choose a **representative matrix** based on your real user analytics:

- **OS versions:** the oldest supported Android and iOS versions, the newest, and the most popular ones.
- **Manufacturers:** Samsung, Xiaomi, Vivo, Oppo, Realme, OnePlus, Google Pixel – manufacturers customise Android, which causes vendor-specific bugs (aggressive battery savers that kill background work are a classic).
- **Screen sizes and densities:** small phones, large phones, tablets, foldables.
- **Hardware tiers:** low RAM (2–3 GB) devices show memory and performance problems.

Use **pairwise testing** (see the Test Case Design Techniques chapter) to reduce combinations, and a device cloud for scale. **Firebase Test Lab** is Google's publicly available service for running tests on real and virtual Android and iOS devices in the cloud.

### Mobile-specific test areas

| Area | What to test |
|---|---|
| **Network** | 2G/3G/4G/5G, Wi-Fi to mobile switch, high latency, packet loss, airplane mode mid-request |
| **Offline** | What works offline? Are actions queued and synced later? No duplicate actions after sync? |
| **Battery and performance** | Battery drain, battery saver mode, app start time, memory use, jank (dropped frames), app size |
| **Permissions** | Camera, location, contacts, notifications: grant, deny, "ask every time", revoke later in settings |
| **Interruptions** | Incoming call, SMS, notification, low battery popup, screen lock, switching apps mid-flow |
| **Lifecycle** | App killed in background and restored – is state kept? Screen rotation |
| **Upgrades** | Upgrade from old version with existing data; database migration; forced update flow |
| **Install / storage** | Low storage, install on SD card, clear cache, reinstall |
| **Localisation** | Hindi, Tamil and other languages; long text; right-to-left languages if supported; number and currency formats (₹1,00,000) |
| **Deep links and notifications** | Opening the app from a link or push notification to the right screen, logged in or not |

### Mobile automation tools

- **Espresso** (Android, by Google) – fast, in-process UI tests with automatic synchronisation with the UI thread.
- **XCUITest** (iOS, by Apple).
- **Appium** – cross-platform, uses WebDriver protocol; you can write tests in Python.
- **UI Automator** (Android) – for interactions across apps and system UI (like permission dialogs).

Keep the pyramid: most logic in unit tests, some UI tests, and a few full-device journeys.

## Part 3: Security testing basics

Security testing checks that the system protects **confidentiality** (only the right people see data), **integrity** (data isn't changed wrongly) and **availability** (the service stays up). Professional penetration testing is a specialist job, but every QA engineer should catch the common problems.

### OWASP Top 10

The **OWASP Top 10** is a widely used awareness list of the most critical web application security risks, published by the Open Worldwide Application Security Project. The **2021 edition** is:

| # | Risk (2021) | Simple QA check |
|---|---|---|
| A01 | Broken Access Control | Change IDs in URLs; call admin APIs as a normal user |
| A02 | Cryptographic Failures | HTTPS everywhere; no sensitive data in plain text, logs or URLs |
| A03 | Injection (SQL, command, XSS) | Send `' OR '1'='1`, `<script>alert(1)</script>`; check output is escaped |
| A04 | Insecure Design | Threat-model flows: can a coupon be applied twice? |
| A05 | Security Misconfiguration | Default passwords, debug pages, verbose errors, open cloud buckets |
| A06 | Vulnerable and Outdated Components | Dependency scanning in CI |
| A07 | Identification and Authentication Failures | Brute force protection, session expiry, logout really invalidates the token |
| A08 | Software and Data Integrity Failures | Unsigned updates, untrusted deserialisation, CI pipeline integrity |
| A09 | Security Logging and Monitoring Failures | Are failed logins and suspicious actions logged and alerted? |
| A10 | Server-Side Request Forgery (SSRF) | A "fetch this URL" feature must not reach internal addresses |

OWASP updates the list every few years, so check [owasp.org/Top10](https://owasp.org/Top10/) for the newest edition before your interview. Broken access control has stayed at or near the top, which is why the BOLA test above is so valuable.

### Security tests a QA engineer can own

```python
import pytest
import requests

INJECTION_PAYLOADS = ["' OR '1'='1", "\"; DROP TABLE users; --",
                      "<script>alert(1)</script>", "../../etc/passwd"]

@pytest.mark.parametrize("payload", INJECTION_PAYLOADS)
def test_search_handles_malicious_input_safely(payload, token_a):
    r = requests.get(f"{BASE}/merchants", params={"q": payload},
                     headers={"Authorization": f"Bearer {token_a}"}, timeout=5)
    assert r.status_code in (200, 400)           # never a 500
    assert "<script>" not in r.text               # not reflected unescaped
    assert "Traceback" not in r.text              # no stack trace leak
```

Other easy wins: check security headers (Content-Security-Policy, Strict-Transport-Security), cookie flags (`HttpOnly`, `Secure`, `SameSite`), that logout invalidates tokens on the server, that passwords and OTPs never appear in logs, and that dependency scanners run in CI. Tools such as **OWASP ZAP** can run automated scans against a test environment.

**Important:** only run security tests against systems you are authorised to test.

## Part 4: Accessibility testing basics

**Accessibility (a11y)** means people with disabilities can use the product: people who are blind or have low vision, are deaf or hard of hearing, have motor impairments, or have cognitive differences. It also helps everyone – captions help in a noisy train, big buttons help when you're holding a bag.

### WCAG

The **Web Content Accessibility Guidelines (WCAG)** from the W3C are the main standard. WCAG 2.2 became a W3C Recommendation in October 2023. WCAG is organised around four principles, remembered as **POUR**:

- **Perceivable** – users can see or hear the content (alt text for images, captions, enough colour contrast).
- **Operable** – users can use it (keyboard access, no keyboard traps, enough time, big enough touch targets).
- **Understandable** – clear text, predictable behaviour, helpful error messages.
- **Robust** – works with assistive technologies like screen readers (correct HTML semantics, names and roles).

Each success criterion has a level: **A** (minimum), **AA** (the usual target in laws and company policies) and **AAA** (highest).

Some concrete AA checks:
- Text colour contrast at least **4.5:1** (3:1 for large text).
- Every form field has a visible label and a programmatic name.
- All functions work with a keyboard; focus is visible.
- Images have meaningful alt text (or empty alt if decorative).
- Errors are described in text, not only with colour.

### Contrast ratio in Python

```python
def _luminance(hex_color):
    """Relative luminance as defined by WCAG."""
    rgb = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]

def contrast_ratio(fg, bg):
    l1, l2 = sorted([_luminance(fg), _luminance(bg)], reverse=True)
    return round((l1 + 0.05) / (l2 + 0.05), 2)

print(contrast_ratio("#767676", "#FFFFFF"))   # 4.54 -> passes AA for normal text
print(contrast_ratio("#999999", "#FFFFFF"))   # 2.85 -> fails AA
```

### How to test accessibility

1. **Automated scans** – tools like **axe-core** (with Playwright via `axe-playwright-python`), **Lighthouse** in Chrome DevTools, and Android's **Accessibility Scanner**. Run them in CI. They catch a useful share of issues (missing labels, low contrast), but not all.
2. **Keyboard-only pass** – unplug the mouse. Can you reach and use everything with Tab, Shift+Tab, Enter, Space and arrow keys? Is focus always visible?
3. **Screen reader pass** – **TalkBack** (Android), **VoiceOver** (iOS/macOS), **NVDA** (Windows). Are buttons announced with useful names ("Pay ₹500", not "button")?
4. **Zoom and text size** – 200% zoom and large system font: does layout break or text get cut off?
5. **Real users** – nothing replaces testing with people who use assistive technology daily.

```python
# Playwright: make accessible names part of your normal tests
from playwright.sync_api import Page, expect

def test_pay_button_has_accessible_name(page: Page):
    page.goto("/send-money")
    # get_by_role uses the accessibility tree, like a screen reader does
    expect(page.get_by_role("button", name="Pay")).to_be_enabled()
    expect(page.get_by_label("Amount in rupees")).to_be_visible()
```

Using `get_by_role` and `get_by_label` in your normal Playwright tests is a quiet accessibility check: if a button has no accessible name, your test can't find it.

## Worked example: testing a "send money" feature

Feature: in a payments app, a user picks a contact, enters an amount, enters a PIN, and money is sent. There's a mobile app and a backend API.

**API**
- Status codes: 201 on success; 400 missing amount; 422 negative or zero amount; 401 no token; 403 blocked account; 429 too many attempts.
- Schema/contract: payment response has `payment_id`, `status` in {PENDING, SUCCESS, FAILED}, `amount_paise` integer.
- Authorisation: user A cannot read or cancel user B's payment (BOLA).
- Idempotency: same key twice → one payment; network drop and retry → one payment.
- Boundaries: minimum ₹1, per-transaction limit, daily limit (EP + BVA, the Test Case Design Techniques chapter).

**Mobile**
- Matrix from analytics: oldest supported Android, two budget devices with 3 GB RAM, popular Samsung and Xiaomi models, latest iPhone and one older iPhone.
- Network: send on 2G; airplane mode right after tapping Pay – the app must show "pending" and confirm later, never encourage a duplicate payment.
- Interruptions: incoming call during PIN entry; app killed after Pay.
- Permissions: deny contacts permission – user can still type a number.
- Upgrade: old version with saved contacts upgrades cleanly.

**Security**
- PIN never logged or sent in plain text; screenshot blocking on the PIN screen if required by policy.
- Brute force: lock after N wrong PINs.
- Injection strings in the "note" field are escaped in the receiver's history.
- Session expires after inactivity; logout invalidates the token server-side.

**Accessibility**
- TalkBack reads "Amount in rupees, edit box" and "Pay 500 rupees, button".
- Contrast of the amount text ≥ 4.5:1.
- PIN pad buttons are large enough and work with a screen reader.
- Error "Insufficient balance" is announced, not only shown in red.

## Interview phrases you can use

- "For APIs, I check status codes, schema, authN versus authZ, idempotency, rate limits, pagination and backward compatibility."
- "My first security test is always broken object-level authorisation: can user A see user B's data by changing an ID?"
- "I'd build the device matrix from real user analytics and reduce it with pairwise testing."
- "A 500 for bad client input is always a bug – the server should validate and return 4xx."
- "For accessibility I combine automated axe scans in CI with keyboard and screen reader passes, targeting WCAG AA."

## Tester's corner

- API tests are your best pyramid tool: push UI logic checks down to the API.
- Always test the "retry after network drop" path for anything involving money.
- Old app versions are real users. Keep backward-compatibility tests for APIs used by mobile clients.
- Make one BOLA/IDOR test per resource type a standard part of every API test suite.
- Use role- and label-based locators in Playwright; they make tests stabler and check accessibility at the same time.
- Security and accessibility are quality attributes like any other. Put them in the test plan from day one, not at the end.

## Key takeaways

- API testing covers status codes, schemas and contracts, authN vs authZ, idempotency, rate limits, pagination, versioning, validation and error format.
- Broken object-level authorisation (BOLA / IDOR) is the most common serious API security bug.
- Mobile testing needs a data-driven device matrix plus network, offline, battery, permissions, interruptions, lifecycle and upgrade tests.
- The OWASP Top 10 is a widely used list of critical web risks; broken access control has stayed at or near the top.
- WCAG's POUR principles and level AA guide accessibility; check contrast, labels, keyboard access and screen readers.
- Combine automated scans with manual passes for both security and accessibility.

## Quiz

1. User A changes the ID in `/transactions/123` to `/transactions/124` and sees user B's data. What is this called?
   A) SQL injection  B) BOLA / IDOR  C) Rate limiting  D) SSRF
2. True or false: a 500 error caused by a missing field in the request body is acceptable.
3. What is the difference between authentication and authorisation?
4. Which HTTP status code means "too many requests"?
   A) 401  B) 403  C) 404  D) 429
5. Why is idempotency important for payment APIs?
6. Name four mobile-specific areas you would test beyond normal functionality.
7. What do the letters in POUR stand for?
8. What is the WCAG AA minimum contrast ratio for normal text?
   A) 2:1  B) 3:1  C) 4.5:1  D) 7:1
9. True or false: automated accessibility scanners catch all accessibility problems.
10. A user taps "Pay", and the network drops before the response arrives. What would you test?

## Answer key

1. **B** - Broken Object Level Authorization, also called Insecure Direct Object Reference.
2. **False** - The server should validate input and return a 4xx error. A 500 for bad client input is a bug.
3. Authentication checks *who you are*; authorisation checks *what you are allowed to do*.
4. **D** - 429 Too Many Requests, often with a `Retry-After` header.
5. Clients retry after timeouts and network drops. Idempotency (for example an idempotency key) makes sure a retry doesn't charge the user twice.
6. Any four of: network conditions, offline mode, battery and performance, permissions, interruptions, app lifecycle, upgrades, storage, localisation, deep links and notifications, device fragmentation.
7. **Perceivable, Operable, Understandable, Robust.**
8. **C** - 4.5:1 for normal text (3:1 for large text).
9. **False** - They catch many issues like missing labels and low contrast, but keyboard, screen reader and real-user checks are still needed.
10. The app shows a pending state and later confirms the real result; retrying uses the same idempotency key so there is only one charge; the server state and the user's balance are correct; the user is not encouraged to pay twice.

## Flashcards

- **Q:** AuthN vs authZ? — **A:** Authentication is who you are; authorisation is what you may do.
- **Q:** What is BOLA? — **A:** Broken Object Level Authorization: accessing another user's object by changing its ID.
- **Q:** What is an idempotency key? — **A:** A unique request key so that retries of the same request run the action only once.
- **Q:** What does HTTP 429 mean? — **A:** Too Many Requests: a rate limit was exceeded.
- **Q:** How do you choose a mobile device matrix? — **A:** From real user analytics, reduced with pairwise testing and a device cloud.
- **Q:** What is Firebase Test Lab? — **A:** Google's cloud service for running app tests on real and virtual devices.
- **Q:** What is the OWASP Top 10? — **A:** A widely used awareness list of the most critical web application security risks.
- **Q:** OWASP Top 10 2021 A01? — **A:** Broken Access Control.
- **Q:** What does POUR stand for in WCAG? — **A:** Perceivable, Operable, Understandable, Robust.
- **Q:** WCAG AA contrast for normal text? — **A:** At least 4.5:1.
- **Q:** Name two automated accessibility tools. — **A:** axe-core and Lighthouse (also Android Accessibility Scanner).

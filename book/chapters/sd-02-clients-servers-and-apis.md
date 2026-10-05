# Clients, Servers and APIs

> **In this chapter:**
> - Understand the client/server model and what an API really is
> - Learn HTTP methods, status codes, headers, cookies, sessions and JWT tokens
> - Design clean REST resources with JSON, idempotency and pagination
> - Compare polling, long polling, Server-Sent Events and WebSockets, and see what an API gateway does
> - Know how a test engineer tests an API properly
>
> **Time:** ~40 minutes  |  **Level:** Zero

## The client/server model

A **client** is a program that asks for something. A **server** is a program that waits for requests and answers them.

Analogy: at a restaurant, you (the client) give your order to the kitchen (the server) through a waiter. You do not walk into the kitchen. You do not care how the chef cooks. You only care that you ask in a known way ("one masala dosa") and get a known result.

- Your browser is a client of `google.com`.
- The Swiggy app on your phone is a client of Swiggy's servers.
- Swiggy's order service may itself be a client of the payment service. A program can be a server for one thing and a client for another.

The server is usually **always on**, has a fixed address, and serves many clients at once. Clients come and go.

## What is an API

An **API** (Application Programming Interface) is the menu and the rules of the restaurant. It says what you can ask for, how to ask, and what you get back. It hides the kitchen.

In web systems, "API" usually means an **HTTP API**: the server exposes URLs, and clients send HTTP requests to them. For example:

```
GET https://api.shop.com/v1/products/42
```

returns the details of product 42. The client does not know if the server uses Python or Java, PostgreSQL or Spanner. This hiding is what lets teams change the inside without breaking the outside, as long as the API **contract** stays the same.

An API **contract** is the agreed shape of requests and responses: URLs, fields, types, status codes and error formats. It is often written in an **OpenAPI** (Swagger) file. As a tester, the contract is your main source of truth.

## HTTP methods (verbs)

The **method** tells the server what kind of action you want.

| Method | Meaning | Example | Safe? | Idempotent? |
|--------|---------|---------|-------|-------------|
| GET | Read a resource | `GET /orders/7` | Yes | Yes |
| POST | Create a resource or run an action | `POST /orders` | No | No |
| PUT | Replace a resource fully | `PUT /orders/7` | No | Yes |
| PATCH | Change part of a resource | `PATCH /orders/7` | No | Not always |
| DELETE | Remove a resource | `DELETE /orders/7` | No | Yes |
| HEAD | Like GET but only headers | `HEAD /files/9` | Yes | Yes |
| OPTIONS | Ask what is allowed (used by CORS) | `OPTIONS /orders` | Yes | Yes |

Two important words:

- **Safe** means the request does not change anything on the server. GET should only read. A GET that deletes data is a serious bug.
- **Idempotent** means sending the same request once or ten times leaves the server in the same final state. We will look at this closely soon, because it is a favourite interview topic.

## Status codes

The **status code** is a 3-digit number in the response. The first digit gives the family.

| Code | Name | When it is used |
|------|------|-----------------|
| 200 | OK | Request worked, body has the result |
| 201 | Created | A new resource was created (often after POST) |
| 204 | No Content | Worked, but no body (often after DELETE) |
| 301 | Moved Permanently | Resource has a new URL forever |
| 302 | Found | Temporary redirect |
| 304 | Not Modified | Your cached copy is still good |
| 400 | Bad Request | The request is malformed or invalid |
| 401 | Unauthorized | You are not logged in (no or bad credentials) |
| 403 | Forbidden | You are logged in, but not allowed to do this |
| 404 | Not Found | The resource does not exist |
| 405 | Method Not Allowed | For example, DELETE on a read-only URL |
| 409 | Conflict | Clashes with current state (duplicate, version conflict) |
| 422 | Unprocessable Content | Well-formed but fails validation |
| 429 | Too Many Requests | You hit a rate limit |
| 500 | Internal Server Error | Bug or crash on the server |
| 502 | Bad Gateway | A proxy got a bad answer from the server behind it |
| 503 | Service Unavailable | Server is overloaded or down for maintenance |
| 504 | Gateway Timeout | A proxy waited too long for the server behind it |

An easy way to remember:

- **2xx**: success.
- **3xx**: go somewhere else.
- **4xx**: **you** (the client) made a mistake.
- **5xx**: **we** (the server) made a mistake.

Common confusion: **401 vs 403**. 401 means "who are you?" (log in first). 403 means "I know who you are, and the answer is no."

## Headers

**Headers** are extra information sent with requests and responses, as `Name: value` pairs. Useful ones:

- `Content-Type: application/json` - the format of the body you are sending.
- `Accept: application/json` - the format you want back.
- `Authorization: Bearer <token>` - your credentials.
- `Cache-Control: max-age=60` - how long the response can be cached.
- `Location: /orders/7` - where the new resource lives (with 201) or where to go (with 3xx).
- `Retry-After: 30` - with 429 or 503, how many seconds to wait before retrying.
- `X-Request-ID` or `traceparent` - an ID that follows the request through many services, very helpful when debugging logs.

## Remembering who you are: cookies, sessions and tokens

HTTP is **stateless**. Each request stands alone. The server does not automatically remember that you logged in one second ago. So how does a website keep you logged in?

### Sessions with cookies

1. You log in with username and password.
2. The server creates a **session** (a record like "session `abc123` belongs to user 42") and stores it in memory, a database or a cache.
3. The server sends back a **cookie**: `Set-Cookie: session=abc123; HttpOnly; Secure`.
4. The browser automatically sends `Cookie: session=abc123` with every later request to that site.
5. The server looks up `abc123` and knows it is you.

Analogy: a cloakroom token at a wedding hall. You give your bag, you get token number 57. The token itself means nothing; the counter keeps the real list.

Important cookie flags:

- `HttpOnly` - JavaScript cannot read it (protects against stolen cookies via XSS).
- `Secure` - only sent over HTTPS.
- `SameSite` - limits sending the cookie from other sites (helps against CSRF).

### Tokens and JWT

With **tokens**, the server does not need to store sessions. A popular format is the **JWT** (JSON Web Token, pronounced "jot"). It has three parts separated by dots:

```
header.payload.signature
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiIsImV4cCI6MTcwMDAwMDAwMH0.k3Jx...
```

- **Header**: which algorithm signed it.
- **Payload**: **claims** such as user ID (`sub`), roles, and expiry time (`exp`).
- **Signature**: created with the server's secret key. If anyone changes the payload, the signature no longer matches.

Analogy: a train ticket with a hologram. The ticket conductor does not need to call the booking office. He checks the hologram (signature) and the date (expiry) on the spot.

Two key facts that testers must know:

1. A JWT payload is only **encoded** (Base64URL), **not encrypted**. Anyone can read it. Never put passwords or secrets in it.
2. Because the server does not store it, a JWT is hard to **revoke** before it expires. That is why access tokens are usually short-lived (minutes), with a longer-lived **refresh token** to get new ones.

```python
import base64, json

# Decode the payload (middle part) of a JWT. No secret needed to READ it.
token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiIsInJvbGUiOiJ1c2VyIn0.sig"
payload = token.split(".")[1]
payload += "=" * (-len(payload) % 4)      # add Base64 padding back
print(json.loads(base64.urlsafe_b64decode(payload)))
# Expected output: {'sub': '42', 'role': 'user'}
```

A good security test: change `"role": "user"` to `"role": "admin"`, re-encode, and send it. The server must reject it with 401, because the signature no longer matches.

## REST resource design

**REST** (Representational State Transfer) is a style for designing HTTP APIs. The main idea: your API is a set of **resources** (nouns), and you act on them with HTTP methods (verbs).

Good REST design rules:

- Use **nouns, in plural**, not verbs: `/orders`, not `/getOrders` or `/createOrder`.
- Use the **ID in the path** for one item: `/orders/7`.
- Use **nesting** for clear ownership, but not too deep: `/users/42/orders`.
- Use **query parameters** for filtering, sorting and paging: `/orders?status=paid&sort=-created_at&limit=20`.
- **Version** the API: `/v1/orders`, so you can change things later without breaking old clients.
- Return the right status code and a consistent error format.

Example for a food-delivery app:

| Action | Request | Success response |
|--------|---------|------------------|
| List my orders | `GET /v1/users/42/orders` | 200 + list |
| Get one order | `GET /v1/orders/7` | 200 + order |
| Place an order | `POST /v1/orders` | 201 + `Location: /v1/orders/7` |
| Change delivery address | `PATCH /v1/orders/7` | 200 + updated order |
| Cancel an order | `POST /v1/orders/7/cancel` or `DELETE /v1/orders/7` | 200 or 204 |

Note that "cancel" is a real action, not just deleting data (you still want a record of cancelled orders). Many teams use a small action sub-resource like `/cancel` for this. Being pragmatic is fine; being consistent is what matters.

Other API styles exist, such as **gRPC** (fast binary calls, used a lot inside companies, including Google, which created it) and **GraphQL** (the client asks for exactly the fields it needs). The later lesson on API design compares these styles.

## JSON

**JSON** (JavaScript Object Notation) is the most common body format. It is plain text with objects `{}`, arrays `[]`, strings, numbers, booleans (`true`/`false`) and `null`.

```
{
  "id": 7,
  "status": "PAID",
  "items": [{"sku": "DOSA-01", "qty": 2, "price_paise": 12000}],
  "delivery_note": null
}
```

Tips you will appreciate as a tester:

- Store money as integers in the smallest unit (paise), not floats. `0.1 + 0.2` is not exactly `0.3` in floating point.
- Decide and document whether missing fields, `null` and empty strings mean different things.
- Use a fixed date format, usually ISO 8601 in UTC: `"2026-10-05T09:30:00Z"`.

A good error body is also JSON and consistent:

```
{"error": {"code": "INVALID_PINCODE", "message": "Pincode must be 6 digits", "field": "pincode"}}
```

## Idempotency: safe to retry

Networks fail. Your app sends "pay Rs 500", and the connection drops before the reply arrives. Did the payment happen? The app does not know. If it retries, the user may be charged twice.

An operation is **idempotent** if doing it many times has the same effect as doing it once.

- `GET /orders/7` - idempotent, it only reads.
- `PUT /orders/7 {"address": "MG Road"}` - idempotent. Set it to "MG Road" ten times; it is still "MG Road".
- `DELETE /orders/7` - idempotent in effect. After the first call it is gone; later calls change nothing (they may return 404, but the state is the same).
- `POST /payments {"amount": 500}` - **not** idempotent by default. Each call may create a new payment.

The standard fix is an **idempotency key**. The client creates a unique ID (for example a UUID) for each logical action and sends it in a header. The server remembers keys it has processed.

```python
processed = {}   # idempotency_key -> saved response (a database in real life)

def create_payment(idem_key, amount):
    if idem_key in processed:            # same key seen before: do NOT charge again
        return processed[idem_key]
    result = {"payment_id": len(processed) + 1, "amount": amount}
    processed[idem_key] = result         # save before returning
    return result

print(create_payment("key-abc", 500))   # {'payment_id': 1, 'amount': 500}
print(create_payment("key-abc", 500))   # {'payment_id': 1, 'amount': 500}  (retry, same result)
print(create_payment("key-xyz", 500))   # {'payment_id': 2, 'amount': 500}  (new action)
```

UPI and card payment systems use similar ideas (a unique transaction reference) so retries do not cause double debits. In a real system, the check-and-save must be done atomically (for example with a unique database constraint), or two retries arriving at the same moment can both pass the check. Chapter 4 explains this kind of race condition.

## Pagination

If a user has 50,000 orders, you cannot return them all in one response. **Pagination** returns data in pages.

**Offset pagination**: `GET /orders?limit=20&offset=40` means "skip 40, give me the next 20".

- Simple, and you can jump to page 50.
- Slow for big offsets (the database still walks past the skipped rows).
- If new items are added while the user is paging, items can be **skipped or shown twice**.

**Cursor pagination** (also called keyset): `GET /orders?limit=20&after=ord_9f3a`. The server returns a `next_cursor` that points to the last item seen.

- Stable and fast, even for huge lists.
- You cannot jump to an exact page number.

```
{"data": [ ...20 orders... ], "next_cursor": "ord_8b21", "has_more": true}
```

Testers should check: the first page, a middle page, the last page, an empty result, a `limit` of 0, a negative or huge `limit`, an invalid cursor, and adding or deleting items between page requests.

## Real-time updates: polling, long polling, SSE, WebSockets

Normal HTTP is "client asks, server answers". But what if the server has news, like "your Swiggy rider is 2 minutes away" or a new chat message? There are four common ways.

**1. Short polling.** The client asks every few seconds: "Any update?" Simple, but wasteful. Most answers are "no".

**2. Long polling.** The client asks, and the server **holds the request open** until there is news or a timeout (say 30 seconds). Then the client immediately asks again. Fewer empty answers, works everywhere.

**3. Server-Sent Events (SSE).** The client opens one HTTP connection, and the server keeps sending events down it, one way only (server to client). Good for live scores, notifications, and streaming AI responses. The browser reconnects automatically.

**4. WebSockets.** The connection starts as HTTP, then "upgrades" to a **two-way**, always-open channel. Both sides can send messages at any time with very little overhead. Good for chat, multiplayer games, and live collaborative editing.

```
Short polling:  C->S "any?"  S->C "no"   ...  C->S "any?"  S->C "yes!"
Long polling:   C->S "any?"  ......(server waits)......  S->C "yes!"  C->S "any?"
SSE:            C->S open    S->C event  S->C event  S->C event   (one way)
WebSocket:      C<->S open   C->S msg  S->C msg  S->C msg  C->S msg  (two way)
```

| Method | Direction | Cost | Good for |
|--------|-----------|------|----------|
| Short polling | Client asks | High (many empty calls) | Rare updates, simple systems |
| Long polling | Client asks, server waits | Medium | Fallback when others are blocked |
| SSE | Server to client | Low | Live feeds, notifications |
| WebSocket | Both ways | Low per message, but keeps connections open | Chat, games, collaboration |

Trade-off to remember: WebSockets and SSE keep a connection open per user. A million online users means a million open connections, which affects how servers and load balancers are designed.

## API gateways

When a company has many backend services (orders, payments, users, search), clients should not need to know all of them. An **API gateway** is a single front door.

```
           Mobile app / Browser
                    |
             +--------------+
             |  API Gateway | -- auth check, rate limit, logging, routing
             +--------------+
              /      |       \
        Orders   Payments   Users     (internal services)
```

Common jobs of an API gateway:

- **Routing**: `/v1/orders/*` goes to the orders service.
- **Authentication**: check the token once, at the door.
- **Rate limiting**: return 429 if a client sends too many requests.
- **TLS termination**: handle HTTPS so internal services do not have to.
- **Logging, metrics and request IDs**.
- Sometimes **response combining** (one client call fans out to several services).

Analogy: the security gate and reception at a tech park. You show your ID once at the gate, and the reception tells you which building to go to.

## How testers test APIs

API tests are faster and more stable than UI tests, so they are a big part of a good test strategy. A complete API test plan covers:

1. **Contract tests**: does the response match the schema (fields, types, required fields)? Tools: JSON Schema, OpenAPI validators, consumer-driven contract tools like Pact.
2. **Functional tests**: correct data for valid input, the right status code (201 for create, not 200), and correct `Location` header.
3. **Negative tests**: missing fields, wrong types, too-long strings, invalid IDs, wrong method (expect 405), bad JSON (expect 400).
4. **Auth tests**: no token (401), expired token (401), tampered token (401), valid token but wrong user or role (403). Try to read another user's order by changing the ID (this bug is called **IDOR**, Insecure Direct Object Reference).
5. **Idempotency and retry tests**: send the same POST twice with the same idempotency key; confirm only one resource is created.
6. **Pagination and filtering tests**: edges, empty pages, and changes during paging.
7. **Performance tests**: latency under load and behaviour at the rate limit (429 with `Retry-After`).

A small example with Python `requests` and pytest style:

```python
import requests

BASE = "https://api.example.test/v1"

def test_create_order_returns_201_and_location():
    body = {"items": [{"sku": "DOSA-01", "qty": 2}]}
    r = requests.post(f"{BASE}/orders", json=body,
                      headers={"Authorization": "Bearer test-token"}, timeout=5)
    assert r.status_code == 201                       # created, not just 200
    assert r.headers["Location"].startswith("/v1/orders/")
    assert r.json()["status"] == "PENDING"

def test_missing_token_is_401():
    r = requests.get(f"{BASE}/orders/7", timeout=5)
    assert r.status_code == 401
```

Notice the `timeout=5`. Without a timeout, a hung server can make your test suite hang forever.

## Tester's corner

- **Status codes are part of the contract.** A create that returns 200 instead of 201, or a validation error that returns 500, is a real bug. 5xx for bad input means the server crashed on something it should have rejected.
- **Always test authorisation, not just authentication.** Logging in is not enough; user A must never read or change user B's data by changing an ID in the URL.
- **Decode JWTs in your tests.** Check the expiry, the claims, and that tampered tokens are rejected.
- **Retry the unsafe calls.** Send POSTs twice, drop the connection in the middle, and confirm no duplicate orders or double payments.
- **Pagination hides bugs at the edges.** Test the last page, empty pages and data that changes while paging.
- **Real-time features need special tests.** For WebSockets and SSE, test reconnect after network loss, message order, and duplicate messages.
- **Set timeouts on every HTTP call in tests**, and log the request ID header so developers can find the server logs quickly.

## Key takeaways

- A **client** asks and a **server** answers; an **API** is the agreed contract between them.
- HTTP **methods** express intent; GET must be safe, and PUT and DELETE are idempotent.
- **Status codes**: 2xx success, 3xx redirect, 4xx client mistake, 5xx server mistake. 401 means not logged in; 403 means not allowed.
- HTTP is **stateless**; sessions use **cookies**, while **JWTs** are signed (not encrypted) tokens that carry claims.
- **REST** uses plural nouns, IDs in paths, query parameters for filters, and versioned URLs.
- **Idempotency keys** make unsafe operations like payments safe to retry.
- **Cursor pagination** is stable for large, changing lists; **WebSockets** are two-way, **SSE** is server-to-client.
- An **API gateway** is a front door that handles routing, auth, rate limits and logging.

## Quiz

1. Which status code means "you are logged in but not allowed to do this"?
   A) 400  B) 401  C) 403  D) 404
2. True or false: A JWT payload is encrypted, so it is safe to put a password in it.
3. Which HTTP method should never change data on the server?
   A) GET  B) POST  C) PATCH  D) DELETE
4. Which is the best REST URL to get all orders of user 42?
   A) `/getOrders?user=42`  B) `/users/42/orders`  C) `/orders/getAllForUser/42`  D) `/user-orders-42`
5. What does "idempotent" mean?
6. A client gets a 503 response with `Retry-After: 30`. What should the client do?
7. Which real-time method gives a two-way, always-open channel?
   A) Short polling  B) Long polling  C) Server-Sent Events  D) WebSockets
8. True or false: With offset pagination, items can be skipped or repeated if new items are inserted while the user is paging.
9. What would you do? A "create payment" API sometimes charges a user twice when the mobile network is weak.
10. What would you do? You change the order ID in `GET /orders/1001` to `1002` while logged in as a normal user, and you see another customer's address.

## Answer key

1. **C** - 403 Forbidden means the server knows who you are but refuses. 401 means you are not authenticated.
2. **False** - The payload is only Base64URL-encoded, so anyone can read it. The signature stops changes, not reading.
3. **A** - GET is a safe method; it must only read data.
4. **B** - REST uses plural nouns and nesting for ownership, with no verbs in the URL.
5. **Same result if repeated** - Doing the operation once or many times leaves the server in the same final state, so it is safe to retry.
6. **Wait and retry** - Wait at least 30 seconds before retrying, ideally with backoff, instead of retrying immediately and adding more load.
7. **D** - WebSockets allow both sides to send messages at any time over one open connection. SSE is one way.
8. **True** - Offsets shift when data changes. Cursor pagination avoids this problem.
9. **Add idempotency** - Raise a bug and suggest that the client sends a unique idempotency key per payment and the server stores processed keys with a unique constraint. Then write a test that sends the same request twice and confirms one charge.
10. **Report a critical IDOR bug** - This is a broken authorisation (IDOR) bug and a privacy leak. Report it as high severity, and add automated tests that check every resource endpoint returns 403 or 404 for other users' IDs.

## Flashcards

- **Q:** What is an API? — **A:** The agreed contract (URLs, inputs, outputs, errors) that lets a client use a server without knowing its insides.
- **Q:** What does a safe HTTP method mean? — **A:** It does not change server state; GET, HEAD and OPTIONS are safe.
- **Q:** What does idempotent mean? — **A:** Repeating the operation gives the same final state as doing it once.
- **Q:** 401 vs 403? — **A:** 401 means not authenticated (log in); 403 means authenticated but not allowed.
- **Q:** 4xx vs 5xx? — **A:** 4xx is a client mistake; 5xx is a server mistake.
- **Q:** Why does HTTP need cookies or tokens? — **A:** HTTP is stateless, so each request must carry proof of who the user is.
- **Q:** What are the three parts of a JWT? — **A:** Header, payload (claims) and signature, separated by dots.
- **Q:** Is a JWT payload encrypted? — **A:** No, it is only encoded; anyone can read it, but the signature prevents tampering.
- **Q:** What is an idempotency key? — **A:** A unique client-generated ID that lets the server detect and ignore repeated requests.
- **Q:** Offset vs cursor pagination? — **A:** Offset is simple and allows page jumps; cursor is stable and fast for large, changing lists.
- **Q:** SSE vs WebSocket? — **A:** SSE is one-way server-to-client over HTTP; WebSocket is a two-way open channel.
- **Q:** What does an API gateway do? — **A:** It is the single front door that routes requests and handles auth, rate limits, TLS and logging.

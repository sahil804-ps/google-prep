# How the Internet Works: What Happens When You Type a URL

> **In this chapter:**
> - Follow one web request step by step, from your keyboard to a server and back
> - Understand IP addresses, ports, DNS, TCP and UDP in simple words
> - See how the TCP 3-way handshake and TLS (HTTPS) make a safe connection
> - Learn what an HTTP request and response look like, and why CDNs make websites fast
>
> **Time:** ~35 minutes  |  **Level:** Zero

## Why start here

Every system design question at Google, from "design a URL shortener" to "design a test results dashboard", sits on top of the internet. If you do not know how a request travels, words like "load balancer", "CDN" or "latency" will feel like magic.

The good news: you already use all of this every day. As an SDET, you have opened browser DevTools, seen a `404`, and debugged a slow API. This chapter gives names and order to the things you have already seen.

A classic interview warm-up question is: **"What happens when you type `https://www.google.com` into your browser and press Enter?"** By the end of this chapter, you can answer it in a clear, step-by-step way.

## The big picture in one story

Think of ordering a parcel from a shop in another city using India Post.

1. You know the shop's **name**, but India Post needs the **full address with PIN code**. You look it up in a directory. (This is **DNS**.)
2. You write the address on the envelope. (This is the **IP address**.)
3. You also write which **department** inside the building should get it, like "Accounts, Room 443". (This is the **port**.)
4. Before sending valuable items, you call the shop to confirm they are open and ready. (This is the **TCP handshake**.)
5. You put the items in a locked box that only the shop can open. (This is **TLS / HTTPS**.)
6. Inside the box is your letter: "Please send me your catalogue." (This is the **HTTP request**.)
7. The shop replies with the catalogue. (This is the **HTTP response**.)
8. If the shop has a local branch in your own city, you get the parcel much faster. (This is a **CDN**.)

Keep this story in mind. Now let us look at each step properly.

## IP addresses: the house address of a computer

An **IP address** (Internet Protocol address) is a number that identifies a device on a network. Every phone, laptop and server that talks on the internet has one.

There are two versions:

- **IPv4** looks like `142.250.183.4`. It has four numbers from 0 to 255, separated by dots. That is 32 bits, so there are about 4.3 billion possible addresses. That is not enough for the whole world.
- **IPv6** looks like `2404:6800:4009:82b::2004`. It is 128 bits long, so there are more addresses than we will ever need.

Some addresses are **private**. Your home Wi-Fi router gives your laptop an address like `192.168.1.5`. This address only works inside your home. The router uses **NAT** (Network Address Translation) to share one public IP address among all your home devices. It is like a big office with one reception desk: outside letters come to the reception, and the receptionist passes them to the right person.

A special address is `127.0.0.1`, also called **localhost**. It always means "this same machine". When you run a test server on your laptop at `http://localhost:8080`, you are using it.

## Ports: the room number inside the building

One server can run many programs at the same time: a web server, a database, an SSH server. The IP address finds the machine. The **port** finds the program on that machine.

A port is a number from 0 to 65535. Some common ones:

| Port | Used for |
|------|----------|
| 22 | SSH (remote login) |
| 53 | DNS |
| 80 | HTTP (plain web) |
| 443 | HTTPS (secure web) |
| 5432 | PostgreSQL database |
| 6379 | Redis cache |

When you type `https://example.com`, the browser uses port 443 by default. When you type `http://localhost:3000`, you are telling the browser "use port 3000 on my own machine".

The combination of IP address + port (for example `142.250.183.4:443`) is called a **socket address**. It is the full "building + room" address.

## DNS: the phonebook of the internet

Humans remember names like `www.google.com`. Computers need IP addresses. **DNS** (Domain Name System) converts names into IP addresses. It is like the Contacts app on your phone: you tap "Mom", and the phone dials the number.

DNS is not one big computer. It is a tree of servers spread around the world. Here is the order of steps when your browser needs the IP for `www.google.com`:

1. **Browser cache.** Did the browser look this up recently? If yes, use it.
2. **Operating system cache.** The OS also keeps a small cache. It also checks the `hosts` file (you may have edited this file to point a test domain to a staging server).
3. **Recursive resolver.** If still not found, the OS asks a **recursive resolver**. This is usually run by your internet provider (Jio, Airtel) or a public service like Google Public DNS (`8.8.8.8`). The resolver does the hard work for you.
4. **Root server.** The resolver asks a root server: "Who handles `.com`?"
5. **TLD server.** The root points to the `.com` **TLD** (Top-Level Domain) server. The resolver asks it: "Who handles `google.com`?"
6. **Authoritative server.** The TLD server points to Google's own **authoritative** name server. This server has the final answer: "`www.google.com` is `142.250.183.4`."
7. The resolver gives the answer back to your OS, and everyone caches it.

```
 Browser --> OS cache --> Recursive resolver
                               |
                               |--1--> Root server      ("ask .com servers")
                               |--2--> .com TLD server  ("ask google.com servers")
                               |--3--> Authoritative    ("142.250.183.4")
                               |
 Browser <-- OS <-------- answer (cached for TTL seconds)
```

Each answer comes with a **TTL** (Time To Live), in seconds. TTL says how long the answer can be cached. A TTL of 300 means "you can reuse this answer for 5 minutes". This is why, after a company changes its DNS records, some users still reach the old server for a while.

Common DNS record types:

- **A record**: name to IPv4 address.
- **AAAA record**: name to IPv6 address.
- **CNAME**: name to another name (an alias). For example, `www.shop.com` points to `shop.cdnprovider.net`.
- **MX**: which server receives email for the domain.

You can try this yourself in Python:

```python
import socket

# Ask the OS to resolve a name to an IP address (uses DNS under the hood)
ip = socket.gethostbyname("example.com")
print(ip)
# Expected output: an IPv4 address string, for example "93.184.215.14"
# (the exact number can change over time)
```

## TCP and UDP: two ways to send data

Data on the internet travels in small pieces called **packets**. A big web page is split into many packets. Packets can arrive late, out of order, or not at all. Two main **transport protocols** handle this differently.

### TCP: the registered post

**TCP** (Transmission Control Protocol) is **reliable**:

- Every packet has a sequence number, so the receiver can put them back in order.
- The receiver sends an **acknowledgement** (ACK) for data it gets.
- If the sender does not get an ACK in time, it sends the packet again.
- It controls speed so it does not flood the network (**congestion control**).

TCP is like registered post with tracking. It is slower, but nothing is lost. The web (HTTP/1.1 and HTTP/2), email, file transfer and database connections use TCP.

### UDP: the loudspeaker announcement

**UDP** (User Datagram Protocol) just sends packets. No handshake, no ACKs, no resending. If a packet is lost, it is lost.

UDP is like a railway station announcement. It is fast, and if you miss one word, the announcement continues. It is good when **speed matters more than perfection**: video calls, live cricket streaming, online games, and DNS lookups (small, quick questions).

| Feature | TCP | UDP |
|---------|-----|-----|
| Connection setup | Yes (handshake) | No |
| Delivery guaranteed | Yes | No |
| Order guaranteed | Yes | No |
| Speed | Slower | Faster |
| Examples | Web, email, databases | Video calls, games, DNS |

Fun fact: **HTTP/3** runs on **QUIC**, a protocol built on top of UDP. QUIC adds its own reliability and encryption, but avoids some of TCP's delays. QUIC was first developed at Google and is now an IETF standard (RFC 9000).

## The TCP 3-way handshake

Before TCP sends any real data, the two sides must agree to talk. This is the **3-way handshake**. Think of a phone call:

- You: "Hello, can you hear me?" (**SYN**, short for synchronise)
- Friend: "Yes, I can hear you. Can you hear me?" (**SYN-ACK**)
- You: "Yes, I can." (**ACK**)

Now the real conversation begins.

```
   Client                              Server
     |  ---------- SYN (seq=x) -------->  |
     |  <----- SYN-ACK (seq=y, ack=x+1) - |
     |  ---------- ACK (ack=y+1) ------>  |
     |                                     |
     |  ====== connection is open ======  |
```

Each arrow takes time to travel. The time for a message to go to the server and come back is called **RTT** (Round-Trip Time). The handshake costs one RTT before any data can be sent. If the server is in the USA and you are in Bengaluru, one RTT can be around 200 milliseconds. This is one big reason why companies put servers close to users.

When the conversation is over, TCP closes the connection with a similar exchange using **FIN** messages.

## TLS and HTTPS: the locked box

Plain HTTP sends everything as readable text. Anyone on the same café Wi-Fi could read your password. **TLS** (Transport Layer Security) fixes this. **HTTPS** is simply HTTP running inside a TLS connection.

TLS gives three things:

1. **Encryption**: nobody in the middle can read the data.
2. **Integrity**: nobody can change the data without being detected.
3. **Authentication**: you know you are really talking to `yourbank.com`, not a fake site.

How does the browser know the server is real? The server shows a **certificate**. A certificate is like an Aadhaar card for a website. It says "this public key belongs to `yourbank.com`", and it is signed by a trusted **Certificate Authority** (CA). Your browser and OS come with a list of CAs they trust.

A simplified TLS 1.3 handshake, after the TCP handshake:

```
   Client                                   Server
     |  -- ClientHello (ciphers, key share) --> |
     |  <-- ServerHello + certificate + -------- |
     |      key share + Finished                |
     |  -- Finished --------------------------> |
     |                                          |
     |  ===== encrypted HTTP traffic now ====== |
```

Both sides use the "key shares" to calculate the same secret key without ever sending that key over the network. This uses public-key math (key exchange). After that, the fast **symmetric** key encrypts all data. In TLS 1.3, this handshake adds about one RTT. Older TLS 1.2 needed about two.

Testers see TLS problems often: expired certificates on staging, "self-signed certificate" errors in automation, and tests that pass `verify=False` to hide the issue. Hiding the error in tests can also hide a real production bug.

## HTTP: the actual letter

Now the connection is open and secure. The browser sends an **HTTP request** (HyperText Transfer Protocol). It is plain structured text (in HTTP/1.1):

```
GET /search?q=cricket HTTP/1.1
Host: www.google.com
User-Agent: Mozilla/5.0
Accept: text/html
Cookie: session=abc123
```

- The first line has the **method** (`GET`), the **path** (`/search?q=cricket`) and the version.
- Then come **headers**: extra information as `Name: value` lines.
- Some requests (like `POST`) also have a **body** after a blank line.

The server replies with an **HTTP response**:

```
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 5120
Cache-Control: private, max-age=0

<!doctype html><html> ... </html>
```

The first line has a **status code** (`200 OK`). Then headers, a blank line, and the body (here, HTML). Chapter 2 covers methods, status codes and headers in detail.

HTTP versions in one line each:

- **HTTP/1.1**: one request at a time per connection; browsers open several connections.
- **HTTP/2**: many requests share one connection at the same time (**multiplexing**); headers are compressed.
- **HTTP/3**: like HTTP/2, but over QUIC (UDP), so a lost packet does not block all other streams.

## What the browser does with the response

The browser's job is not over when the HTML arrives.

1. It **parses** the HTML and builds the **DOM** (Document Object Model), the tree of elements that Selenium and Playwright query.
2. It finds more resources: CSS, JavaScript, images, fonts. Each one may need its own request (often to the same connection, sometimes to other domains, which means more DNS lookups and handshakes).
3. It builds the CSS rules, runs JavaScript, calculates the layout, and **paints** pixels on the screen.
4. JavaScript may call APIs (using `fetch`) to load more data after the page appears.

This is why "page loaded" is not one moment. It is why Playwright has auto-waiting, and why `time.sleep(5)` in Selenium tests causes flaky tests. We return to this in Chapter 4.

## CDNs: a local branch of the shop

A **CDN** (Content Delivery Network) is a group of servers spread across many cities. They keep copies of files that do not change often: images, videos, JavaScript and CSS files.

Analogy: Amazon does not ship every order from one warehouse in Mumbai. It has warehouses near every big city, so delivery is fast. A CDN is a set of warehouses for web files.

How it works:

1. The website's DNS points `static.shop.com` to the CDN (often using a CNAME).
2. The CDN's DNS gives you the IP of the **edge server** closest to you, for example in Chennai.
3. If the edge server has the file (a **cache hit**), it returns it immediately.
4. If not (a **cache miss**), it fetches the file from the main server (the **origin**), saves a copy, and returns it.

```
User in Chennai --> CDN edge (Chennai) --hit--> file returned in ~10 ms
                          |
                          +--miss--> Origin server (USA) --> copy saved at edge
```

Benefits: lower latency, less load on the origin server, and protection against traffic spikes (like a big sale or an IPL final).

The main risk is **stale content**. If you deploy a new `app.js` but the CDN still serves the old one, users get a broken page. Teams fix this by putting a version or hash in file names (`app.3f9a2c.js`) or by **purging** the CDN cache. The `Cache-Control` header tells the CDN and browser how long to keep a file.

## Putting it all together

Here is the full answer to "what happens when you type a URL":

```
1. Parse URL:   https://www.google.com/search?q=cricket
                scheme=https  host=www.google.com  port=443  path=/search
2. DNS:         browser cache -> OS cache -> resolver -> root -> TLD -> auth
                result: 142.250.183.4
3. TCP:         SYN -> SYN-ACK -> ACK            (1 RTT)
4. TLS:         ClientHello -> ServerHello+cert -> Finished (about 1 RTT)
5. HTTP:        GET /search?q=cricket  -->  200 OK + HTML
6. Browser:     parse HTML -> fetch CSS/JS/images (often from a CDN)
                -> run JS -> layout -> paint
```

In a real system, the request on the server side may also pass through a **load balancer**, many **application servers**, **caches** and **databases**. Those building blocks are covered in the later system design lessons. For now, you know the road the request travels to get there.

## Tester's corner

- **Use DevTools Network tab like a timeline.** It shows DNS, initial connection (TCP), SSL (TLS), waiting (server time, called TTFB: Time To First Byte) and content download for each request. When a page is slow, this tells you *which step* is slow.
- **DNS caching causes confusing test results.** After a deploy that changes DNS, some test machines may hit the old server until the TTL expires. Note the TTL when you debug "works on my machine" issues.
- **Do not hide TLS errors.** Using `verify=False` in `requests` or ignoring certificate errors in Playwright is fine for a known local setup, but add a separate test that checks the real certificate is valid and not close to expiry.
- **Test with network conditions.** Playwright and Chrome DevTools can throttle the network or go offline. Slow 3G behaviour often finds missing loading states and timeout bugs.
- **CDN bugs look like "random" failures.** If some users see an old version, check caching headers and whether file names are versioned. Check the response headers (many CDNs add a header showing hit or miss).
- **Know your ports and hosts in test environments.** Many environment bugs are just the wrong host, wrong port, or `localhost` used inside a Docker container where it means something different.

## Key takeaways

- An **IP address** finds the machine; a **port** finds the program on that machine.
- **DNS** turns names into IP addresses, using a chain of caches and servers, and answers are cached for their **TTL**.
- **TCP** is reliable and ordered; **UDP** is fast with no guarantees. HTTP/3 uses QUIC over UDP.
- The **TCP 3-way handshake** (SYN, SYN-ACK, ACK) costs one round trip before data flows.
- **TLS** gives encryption, integrity and authentication using certificates; **HTTPS** is HTTP inside TLS.
- An **HTTP request** has a method, path, headers and optional body; a **response** has a status code, headers and body.
- **CDNs** keep copies of static files close to users to cut latency, but can serve stale content.

## Quiz

1. What does DNS do?
   A) Encrypts web traffic  B) Converts domain names to IP addresses  C) Splits data into packets  D) Balances load between servers
2. True or false: UDP guarantees that packets arrive in order.
3. Which port does HTTPS use by default?
   A) 22  B) 53  C) 80  D) 443
4. What are the three messages of the TCP handshake, in order?
5. Which protocol is a better fit for a live video call?
   A) TCP, because nothing can be lost  B) UDP, because low delay matters more than a few lost packets  C) DNS  D) FTP
6. What does the TTL on a DNS record control?
7. Which of these is NOT something TLS provides?
   A) Encryption  B) Integrity  C) Authentication of the server  D) Faster page rendering
8. True or false: A CDN cache miss means the edge server fetches the file from the origin server.
9. What would you do? After a release, some users report an old version of the page with broken buttons, but your tests pass on a fresh machine.
10. What would you do? A Playwright test on the staging server fails with "certificate has expired". A teammate suggests ignoring HTTPS errors in the config.

## Answer key

1. **B** - DNS is the internet's phonebook: it maps names like `www.google.com` to IP addresses.
2. **False** - UDP gives no ordering or delivery guarantees. TCP is the one that guarantees order.
3. **D** - HTTPS uses port 443 by default. Port 80 is plain HTTP.
4. **SYN, SYN-ACK, ACK** - The client asks to connect, the server agrees and asks back, and the client confirms.
5. **B** - In a live call, old data is useless, so resending lost packets (as TCP does) only adds delay.
6. **How long the answer can be cached** - Resolvers and clients can reuse the answer for TTL seconds before asking again.
7. **D** - TLS secures the connection. It does not make the browser render faster; it actually adds a small handshake cost.
8. **True** - On a miss, the edge gets the file from the origin, stores a copy, and serves it.
9. **Suspect caching** - Check the CDN and browser caching headers, whether JS/CSS file names include a version hash, and whether the CDN needs a purge. Add a test that checks the deployed asset version.
10. **Do not just hide it** - Ignoring errors may be OK as a short-term unblock for a known staging setup, but raise a bug to renew the certificate and add a check that alerts before certificates expire. The same bug in production would block real users.

## Flashcards

- **Q:** What is an IP address? — **A:** A number that identifies a device on a network, like a house address.
- **Q:** What is a port? — **A:** A number (0-65535) that identifies which program on a machine should receive the data.
- **Q:** What does DNS do? — **A:** It converts a domain name into an IP address using caches, resolvers, root, TLD and authoritative servers.
- **Q:** What is DNS TTL? — **A:** The number of seconds a DNS answer may be cached before asking again.
- **Q:** TCP vs UDP in one line? — **A:** TCP is reliable and ordered with a handshake; UDP is fast with no guarantees.
- **Q:** What is the TCP 3-way handshake? — **A:** SYN, SYN-ACK, ACK; it opens a connection and costs one round trip.
- **Q:** What is RTT? — **A:** Round-Trip Time, the time for a message to reach the other side and a reply to come back.
- **Q:** What three things does TLS provide? — **A:** Encryption, integrity and server authentication (through certificates).
- **Q:** What is HTTPS? — **A:** HTTP sent inside an encrypted TLS connection, by default on port 443.
- **Q:** What is a CDN? — **A:** A network of edge servers in many cities that cache static files close to users.
- **Q:** What protocol does HTTP/3 use? — **A:** QUIC, which runs on top of UDP.

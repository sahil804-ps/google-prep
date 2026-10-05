# Numbers and Back-of-the-Envelope Estimation

> **In this chapter:**
> - Remember the approximate latency numbers that every engineer should know
> - Use powers of two and common data sizes without a calculator
> - Calculate QPS, storage and bandwidth step by step
> - Work through three full estimates: a URL shortener, a photo app and a chat app
> - Understand availability "nines" and simple rules of thumb
>
> **Time:** ~40 minutes  |  **Level:** Beginner

## Why estimation matters

In a system design interview, you will often hear: "Assume 100 million users. How much storage do we need? How many servers?" The interviewer is **not** testing your arithmetic. They want to see if you can:

- Turn vague words ("lots of users") into numbers.
- Make reasonable assumptions and **say them out loud**.
- Find the **bottleneck**: is this system limited by storage, by bandwidth, by database writes, or by open connections?

This is called **back-of-the-envelope estimation**: quick, rough maths that you could do on the back of an envelope. Being within a factor of 2 or even 10 is usually fine. Being off by a factor of 1,000 is not, because that changes the design.

Analogy: before planning a wedding, you estimate "about 500 guests, so about 50 tables and food for 550". You do not count every guest's name first. You just need the right size of hall.

## Latency numbers every engineer should know

**Latency** is the time one operation takes. The table below shows the classic list made popular by Jeff Dean (Google) and Peter Norvig around 2010. Hardware has changed since then (memory and SSDs are faster now), so treat these as **approximate orders of magnitude**, not exact facts. What matters is how they compare.

| Operation | Approximate time |
|-----------|------------------|
| L1 CPU cache reference | 0.5 ns |
| Branch mispredict | 5 ns |
| L2 CPU cache reference | 7 ns |
| Main memory (RAM) reference | 100 ns |
| Send 1 KB over a 1 Gbps network | 10 µs |
| Read 4 KB randomly from an SSD | ~150 µs |
| Read 1 MB sequentially from memory | ~250 µs |
| Round trip within the same data center | 500 µs |
| Read 1 MB sequentially from an SSD | ~1 ms |
| Hard disk seek | 10 ms |
| Read 1 MB sequentially from a hard disk | ~20 ms |
| Send a packet California to Netherlands and back | 150 ms |

Units: 1 ns (nanosecond) = one billionth of a second. 1 µs (microsecond) = 1,000 ns. 1 ms (millisecond) = 1,000 µs.

To feel the difference, imagine 1 ns is **1 second**. Then:

- An L1 cache read is half a second.
- A RAM read is nearly 2 minutes.
- An SSD random read is about 2 days.
- A hard disk seek is about 4 months.
- A round trip from California to the Netherlands is about 5 years.

The lessons from this table:

1. **Memory is much faster than disk.** This is why we use caches.
2. **Sequential reads are much faster than random reads**, especially on hard disks.
3. **Network calls inside a data center are cheap compared to calls across continents.** This is why we put servers and CDNs close to users.
4. **You cannot beat the speed of light.** A round trip from India to the USA will always take well over 100 ms. No code optimisation fixes that; only moving data closer does.

## Powers of two and data sizes

Computers count in powers of two. For estimation, you can treat 2^10 as roughly 1,000.

| Power | Exact value | Approximate | Name |
|-------|-------------|-------------|------|
| 2^10 | 1,024 | 1 thousand | 1 KB (kilobyte) |
| 2^20 | 1,048,576 | 1 million | 1 MB (megabyte) |
| 2^30 | about 1.07 billion | 1 billion | 1 GB (gigabyte) |
| 2^40 | about 1.1 trillion | 1 trillion | 1 TB (terabyte) |
| 2^50 | about 1.13 quadrillion | 10^15 | 1 PB (petabyte) |

Strictly, 1,024 bytes is a "KiB" (kibibyte) and 1,000 bytes is a "KB", but in interviews everyone rounds, and the 2-7% difference does not change the design.

Common sizes to remember (approximate):

| Thing | Size |
|-------|------|
| One ASCII character | 1 byte |
| One Hindi (Devanagari) character in UTF-8 | 3 bytes |
| An integer (int32) | 4 bytes |
| A long integer or timestamp (int64) | 8 bytes |
| A UUID (binary) | 16 bytes (36 bytes as text) |
| A short text message with metadata | a few hundred bytes |
| A compressed phone photo | about 1-5 MB |
| A small thumbnail image | tens of KB |

Also remember **1 byte = 8 bits**. Network speeds are in **bits** per second (Mbps, Gbps), but file sizes are in **bytes**. A 100 Mbps connection moves about 12.5 MB per second.

## Time numbers

- 1 day = 86,400 seconds. Round it to **about 100,000 (10^5) seconds**. This makes division easy.
- 1 month is about 2.5 million seconds.
- 1 year is about 31.5 million seconds (round to 3 × 10^7).
- 1 year is about 365 days; for storage, "times 400" is a fine quick upper estimate, or "times 365" if you want closer numbers.

## Calculating QPS

**QPS** means **queries per second** (also called RPS, requests per second). It tells you how busy the servers are.

The basic formula:

```
average QPS = (number of requests per day) / 86,400
peak QPS    = average QPS x peak factor   (often 2 to 5)
```

Traffic is not flat. People use apps more in the evening, and spikes happen (a cricket final, a flash sale). So we multiply by a **peak factor**. Say which factor you chose and why.

Example: 10 million daily active users (**DAU**), each doing 20 requests per day.

- Requests per day = 10,000,000 × 20 = 200,000,000.
- Average QPS = 200,000,000 / 100,000 (rounded) = about 2,000. (Exact: 200,000,000 / 86,400 = about 2,315.)
- Peak QPS with a factor of 3 = about 6,000-7,000.

Also separate **reads** from **writes**. Most systems are **read-heavy**: many people view a post, few people write one. The **read-to-write ratio** decides whether to focus on caching (read-heavy) or on fast database writes (write-heavy).

## Storage and bandwidth estimation

**Storage** formula:

```
storage per day  = new items per day x size of one item
storage total    = storage per day x days kept x replication factor
```

The **replication factor** is how many copies we keep (often 3, for safety, see the databases chapter).

**Bandwidth** formula:

```
bandwidth = QPS x size of one request or response
```

Do this separately for **ingress** (data coming in, like uploads) and **egress** (data going out, like downloads). Egress is usually much bigger, and it is what CDNs help with.

Here is a small Python helper you can use to check your numbers while practising:

```python
SECONDS_PER_DAY = 86_400

def estimate(per_day, item_bytes, read_ratio=1, peak=3, years=5, copies=3):
    write_qps = per_day / SECONDS_PER_DAY
    read_qps = write_qps * read_ratio
    storage_tb = per_day * item_bytes * 365 * years * copies / 1e12
    return round(write_qps), round(read_qps), round(read_qps * peak), round(storage_tb)

# URL shortener: 100M new URLs/day, 500 bytes each, 100 reads per write
print(estimate(100_000_000, 500, read_ratio=100, copies=1))
# Expected output: (1157, 115741, 347222, 91)
#   write QPS, read QPS, peak read QPS, storage in TB (no replication)
```

Now let us do three full examples by hand. Notice the same pattern every time: **assumptions, traffic, storage, bandwidth, then what it means for the design**.

## Worked example 1: a URL shortener

A URL shortener turns a long link into a short one, like `sho.rt/aB3x9Kp`, and redirects people who visit it.

**Step 1 - Assumptions (say these out loud):**

- 100 million new short URLs created per day.
- Read-to-write ratio 100:1 (each link is clicked about 100 times).
- Each record (short code, long URL, creation time, user ID) is about 500 bytes.
- Keep data for 5 years.

**Step 2 - Traffic:**

- Write QPS = 100,000,000 / 86,400 = about **1,160 writes per second**.
- Read QPS = 1,160 × 100 = about **116,000 reads per second**.
- Peak (factor 2) = about 2,300 writes and 230,000 reads per second.

**Step 3 - Storage:**

- Per day = 100,000,000 × 500 bytes = 50,000,000,000 bytes = **50 GB per day**.
- Per year = 50 GB × 365 = about **18 TB**.
- 5 years = about **91 TB**, before replication. With 3 copies, about 275 TB.

**Step 4 - How long must the short code be?**

- Total URLs in 5 years = 100 million × 365 × 5 = about **183 billion**.
- Using 62 characters (a-z, A-Z, 0-9), called **base62**:
  - 6 characters: 62^6 = about 57 billion. **Not enough.**
  - 7 characters: 62^7 = about 3.5 trillion. **Enough**, with lots of room.
- So use **7 characters**.

**Step 5 - Bandwidth:**

- Read egress = 116,000 × 500 bytes = about **58 MB per second** (around 460 Mbps). Small for a modern data center.

**Step 6 - Memory for a cache:**

- Use the **80/20 rule**: about 20% of links get most of the clicks. Caching 20% of one day's new links = 0.2 × 50 GB = **10 GB**. That fits in the memory of one large cache server (or a small cluster).

**What it means for the design:** The system is very **read-heavy** (116,000 reads per second), so a cache in front of the database is the key component. Storage of about 100 TB means one machine is not enough over 5 years, so the data must be split across machines (sharding, covered in a later lesson). Bandwidth is not the bottleneck.

## Worked example 2: a photo-sharing app

**Step 1 - Assumptions:**

- 10 million daily active users.
- 10% of users upload 2 photos a day, so 2 million new photos per day.
- Average stored photo: 2 MB. (We also store small versions, which we will add as extra.)
- Each user views 50 photos per day, served as a resized version of about 200 KB.
- Keep photos forever; 3 copies for safety.

**Step 2 - Traffic:**

- Upload QPS = 2,000,000 / 86,400 = about **23 uploads per second**. Peak (factor 3) about 70.
- Views per day = 10,000,000 × 50 = 500 million.
- View QPS = 500,000,000 / 86,400 = about **5,800 per second**. Peak about 17,000.
- Read-to-write ratio = 500 million / 2 million = **250:1**.

**Step 3 - Storage:**

- Photos per day = 2,000,000 × 2 MB = **4 TB per day**.
- Add about 20% for resized versions and thumbnails = about 4.8 TB per day.
- Per year = 4.8 TB × 365 = about **1.75 PB**.
- With 3 copies = about **5.3 PB per year**.
- Metadata (owner, caption, time, location) at about 1 KB per photo = 2,000,000 × 1 KB = **2 GB per day**, under 1 TB per year. Very small compared to the images.

**Step 4 - Bandwidth:**

- Ingress (uploads) = 23 × 2 MB = about **46 MB per second**.
- Egress (views) = 5,800 × 200 KB = about **1.16 GB per second**, which is about **9.3 Gbps** on average, and nearly 3 times that at peak.

**What it means for the design:** The biggest numbers are **image storage** (petabytes) and **egress bandwidth** (tens of Gbps at peak). So photos go into a cheap, durable **object store** (blob storage), not into a relational database. Metadata is small and can live in a normal database. Egress is large, so a **CDN** should serve images from cities close to users. Upload QPS is tiny; it is not where the difficulty is.

## Worked example 3: a chat app

**Step 1 - Assumptions:**

- 50 million daily active users.
- Each user sends 40 messages per day.
- Each message with metadata (IDs, timestamp, status) is about 200 bytes.
- At peak, 20% of daily users are online at the same time.
- Keep messages for 1 year on the server; 3 copies.

**Step 2 - Traffic:**

- Messages per day = 50,000,000 × 40 = **2 billion**.
- Message QPS = 2,000,000,000 / 86,400 = about **23,000 per second**. Peak (factor 3) about **70,000 per second**.
- For one-to-one chat, each message is also delivered once, so delivery QPS is similar. Group chats multiply delivery: a message to a 100-person group is 100 deliveries.

**Step 3 - Storage:**

- Per day = 2,000,000,000 × 200 bytes = **400 GB per day**.
- Per year = 400 GB × 365 = about **146 TB**.
- With 3 copies = about **440 TB**.

**Step 4 - Bandwidth:**

- Incoming = 23,000 × 200 bytes = about **4.6 MB per second**. Even at peak, this is small.

**Step 5 - Connections:**

- Online at peak = 20% × 50 million = **10 million open connections** (for example WebSockets, see Chapter 2).
- If one server can hold about 50,000 connections (an assumption; the real number depends on hardware and tuning), you need 10,000,000 / 50,000 = about **200 connection servers**, plus spare capacity.

**What it means for the design:** Bandwidth is small. The hard parts are **millions of open connections** and a **high, steady write rate** (tens of thousands of messages per second), which suits a database built for heavy writes and time-ordered data (like the wide-column stores from the databases chapter). Group chats increase delivery work, so the fan-out must be handled carefully.

Notice how three apps gave three different bottlenecks: **reads and caching** for the URL shortener, **storage and egress** for photos, and **connections and writes** for chat. That is the real point of estimation: it tells you where to spend your design effort.

## Availability and the "nines"

**Availability** is the percentage of time a system works correctly. It is often written as a number of "nines".

| Availability | Downtime per year | Downtime per month (30 days) | Downtime per day |
|--------------|-------------------|------------------------------|------------------|
| 99% ("two nines") | about 3.65 days | about 7.2 hours | about 14.4 minutes |
| 99.9% ("three nines") | about 8.76 hours | about 43.2 minutes | about 1.44 minutes |
| 99.95% | about 4.38 hours | about 21.6 minutes | about 43 seconds |
| 99.99% ("four nines") | about 52.6 minutes | about 4.3 minutes | about 8.6 seconds |
| 99.999% ("five nines") | about 5.26 minutes | about 26 seconds | under 1 second |

Each extra nine cuts allowed downtime by 10 times, and usually costs much more money and effort. Google's public SRE book makes this point: 100% is the wrong target, because users cannot tell the difference beyond a certain level (their own phone and network fail more often), and chasing it slows down releases. The SRE book calls the allowed unreliability an **error budget**. (SLIs, SLOs and SLAs are covered in a later lesson.)

Two quick calculations:

- **Components in a chain multiply.** If a request needs service A (99.9%) **and** service B (99.9%), the total is 0.999 × 0.999 = about **99.8%**. More dependencies in a chain mean lower availability.
- **Redundant copies help.** If you have two independent copies, each 99% available, and either one is enough, the chance both are down is 0.01 × 0.01 = 0.0001. So availability is **99.99%**. (This assumes failures are independent; in real life, a shared power supply or a bad deploy can take both down together.)

## Rules of thumb

- **Round aggressively.** 86,400 becomes 100,000. 365 becomes 400 when you want a safe upper estimate. Use powers of ten.
- **State assumptions first**, and write them down. The interviewer can correct them, which is good.
- **Separate reads and writes**, and calculate peak, not just average.
- **Multiply by the replication factor** for storage (usually 3).
- **The 80/20 rule**: about 20% of data gets about 80% of traffic, which helps you size caches.
- **Sanity check** each result. Does 5 PB per year for a photo app with 10 million users feel reasonable? Compare with what one disk holds (tens of TB in a big hard disk today).
- **Memory is much faster than SSD, and SSD is much faster than hard disk.** In the latency table, a random RAM read is over 1,000 times faster than a random SSD read. Network across continents is the slowest of all.
- **End with a design decision.** Every estimate should finish with "so this means we need a cache / a CDN / sharding / many connection servers".

## Tester's corner

- **Use estimation to plan performance and load tests.** If production peak is 70,000 messages per second, a load test at 500 per second proves very little. Target the estimated peak, then go beyond it.
- **Estimate test infrastructure too.** 20,000 tests × 30 seconds each = 600,000 seconds, which is about 7 days on one machine. To finish in 10 minutes (600 seconds), you need about 1,000 parallel workers. This is the kind of reasoning used in "design a test platform" questions.
- **Latency numbers explain slow tests.** A test that calls a service in another region 200 times pays about 150 ms each time, which is 30 seconds of pure waiting. Run tests close to the services, or batch calls.
- **Check limits and boundaries** from the estimates: the maximum short-code length, the number of open connections a server can hold, the largest file upload. These limits become test cases.
- **Availability maths applies to test pipelines.** If your CI depends on 5 services that are each 99% available, the pipeline works only about 95% of the time (0.99^5). That is a lot of "flaky" red builds that are really infrastructure.
- **Translate SLOs into test assertions.** "99% of requests under 300 ms" becomes a measurable performance check, rather than "it should be fast".

## Key takeaways

- Estimation is about **finding the bottleneck** with reasonable assumptions, not about exact numbers.
- Memory is far faster than disk, and cross-continent network round trips are the slowest; the classic latency table is **approximate**.
- Use powers of two (2^10 is about 1 thousand, 2^20 about 1 million, 2^30 about 1 billion), and remember 1 byte = 8 bits.
- **QPS = requests per day / 86,400** (about 10^5), then multiply by a peak factor.
- **Storage = items per day × size × days × replicas**; **bandwidth = QPS × size**, for ingress and egress separately.
- Different apps have different bottlenecks: reads (URL shortener), storage and egress (photos), connections and writes (chat).
- Each extra nine of availability is 10 times less downtime; components in a chain multiply their availability.

## Quiz

1. About how many seconds are in a day, rounded for quick estimation?
   A) 1,000  B) 10,000  C) 100,000  D) 1,000,000
2. True or false: Reading from main memory is roughly as fast as a hard disk seek.
3. An app gets 864 million requests per day. What is the average QPS?
4. Which is the best way to describe 2^30 bytes for estimation?
   A) About 1 MB  B) About 1 GB  C) About 1 TB  D) About 1 PB
5. A network link is 800 Mbps. About how many megabytes per second can it move?
6. How much downtime per year does 99.9% availability allow?
   A) About 5 minutes  B) About 52 minutes  C) About 8.8 hours  D) About 3.7 days
7. A request needs three services in a chain, each 99% available. What is the approximate total availability?
8. True or false: In the photo-sharing example, upload QPS was the main bottleneck.
9. What would you do? Your team plans a load test of a chat service at 1,000 messages per second, but your estimate of peak traffic is 70,000 per second.
10. What would you do? Your CI suite has 12,000 tests averaging 20 seconds each, and the team wants results in 15 minutes.

## Answer key

1. **C** - 86,400 seconds, rounded to about 100,000 (10^5) for easy division.
2. **False** - A memory reference is about 100 ns, and a disk seek is about 10 ms, which is roughly 100,000 times slower.
3. **10,000 QPS** - 864,000,000 / 86,400 = 10,000 requests per second on average. Peak will be higher.
4. **B** - 2^30 is about 1.07 billion, so 2^30 bytes is about 1 GB.
5. **About 100 MB per second** - Divide bits by 8: 800 / 8 = 100 MB per second (in practice a bit less because of protocol overhead).
6. **C** - 0.1% of 8,760 hours in a year is about 8.76 hours.
7. **About 97%** - 0.99 × 0.99 × 0.99 = about 0.970. Chained dependencies reduce availability.
8. **False** - Uploads were only about 23 per second. The bottlenecks were petabyte-scale storage and large egress bandwidth, which is why we used object storage and a CDN.
9. **Raise the target** - A test at 1/70th of peak cannot show how the system behaves under real load. Plan stages up to the estimated peak and above it (for example 1.5 times peak), and watch latency, errors and connection counts.
10. **Calculate the parallelism** - Total work is 12,000 × 20 = 240,000 seconds. To finish in 900 seconds, you need about 240,000 / 900 = about 267 parallel workers, plus some extra for setup time and uneven test lengths. Also look at removing or speeding up the slowest tests.

## Flashcards

- **Q:** How many seconds are in a day, rounded? — **A:** About 100,000 (exactly 86,400).
- **Q:** How do you calculate average QPS? — **A:** Divide requests per day by 86,400, then multiply by a peak factor for peak QPS.
- **Q:** About how long is a main memory reference? — **A:** About 100 nanoseconds (approximate).
- **Q:** About how long is a round trip from California to the Netherlands? — **A:** About 150 milliseconds (approximate).
- **Q:** What are 2^10, 2^20, 2^30 and 2^40 roughly? — **A:** About a thousand, a million, a billion and a trillion (KB, MB, GB, TB).
- **Q:** How do you convert Mbps to MB per second? — **A:** Divide by 8, because 1 byte is 8 bits.
- **Q:** What is the storage formula? — **A:** Items per day × item size × days kept × replication factor.
- **Q:** What is the bandwidth formula? — **A:** QPS × size of each request or response, for ingress and egress separately.
- **Q:** Why did the URL shortener need 7 base62 characters? — **A:** 62^6 is about 57 billion, less than the 183 billion links in 5 years; 62^7 is about 3.5 trillion.
- **Q:** How much downtime per year does 99.99% allow? — **A:** About 52.6 minutes.
- **Q:** What happens to availability when services are chained? — **A:** Their availabilities multiply, so the total is lower than any single one.
- **Q:** What is the 80/20 rule in caching? — **A:** About 20% of the data gets about 80% of the traffic, so caching that 20% gives most of the benefit.

# Google's Classic Papers Explained: GFS, MapReduce, Bigtable, Chubby, Dapper, Spanner, Borg

> **In this chapter:**
> - Understand the problem each famous Google paper solved, in simple words
> - Draw the core design of each system from memory
> - Explain the key trade-off behind each design
> - Use these ideas as building blocks in system design interviews
> - Know exactly where each official paper lives, so you can read it yourself
>
> **Time:** ~70 minutes  |  **Level:** Expert

Google published a series of research papers that shaped how the whole industry builds large systems. Hadoop copied GFS and MapReduce. HBase and Cassandra borrowed from Bigtable. ZooKeeper was influenced by Chubby. Zipkin and OpenTelemetry follow the Dapper model. Kubernetes came from lessons learned with Borg.

You do not need to memorize every detail. In an interview, you need to (1) know the main idea, (2) reuse the pattern when it fits, and (3) explain the trade-off. This chapter gives you that for seven papers.

**Accuracy note:** everything here comes from the public papers listed in each section. Google's systems have changed since these papers were written, so always say "according to the 2006 paper" and not "this is how Google works today".

| Year | System | One-line summary |
|---|---|---|
| 2003 | GFS | A file system for huge files on cheap machines |
| 2004 | MapReduce | Simple batch processing on thousands of machines |
| 2006 | Bigtable | A huge sorted key-value table on top of GFS |
| 2006 | Chubby | A lock service and tiny file store, built on Paxos |
| 2010 | Dapper | Tracing requests across many services |
| 2012 | Spanner | A global database with strong consistency, using TrueTime |
| 2015 | Borg | The cluster manager that runs everything |

## 1. GFS - The Google File System (2003)

**Paper:** Ghemawat, Gobioff and Leung, "The Google File System", SOSP 2003.
**URL:** https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf

### Problem it solved

Google needed to store very large files (many gigabytes) for crawling and indexing, on hundreds or thousands of **cheap commodity machines** where disk and machine failures are normal, every day. The workload was mostly **large streaming reads** and **appending** new data to the end of files, not random small writes.

### Core design in simple words

- Files are split into fixed-size **chunks** of 64 MB.
- Each chunk is stored on several **chunkservers** - three copies (replicas) by default.
- A single **master** keeps all **metadata** in memory: the file names, which chunks make up each file, and where each chunk's replicas live.
- A client asks the master "where is chunk 7 of this file?", then reads the data **directly from a chunkserver**. Data never flows through the master, so the master does not become a bandwidth bottleneck.
- The master logs metadata changes in an **operation log** that is replicated to other machines, and it checkpoints its state, so it can recover after a crash.
- For writes, the master gives one replica a **lease** to act as the **primary**, which decides the order of changes for that chunk.
- GFS offers **record append**: many clients can append to the same file at once. Each record is written at least once, so applications must handle duplicates (for example with unique record IDs and checksums).

```
            (1) where is chunk?       +--------+
  Client  ------------------------->  | Master |  metadata in RAM
          <-------------------------  +--------+  heartbeats to chunkservers
            (2) chunk handle + locations
     |
     | (3) read / write data directly
     v
 [Chunkserver A]   [Chunkserver B]   [Chunkserver C]   <- 3 replicas of a 64 MB chunk
```

Analogy: the master is the railway enquiry counter. It tells you which platform (chunkserver) your train (chunk) is on. You then walk to the platform yourself. The enquiry counter does not carry your luggage.

### Key trade-offs

- **Single master = simple design**, global knowledge for placement and re-replication. Risk: it is a single point of failure and a scaling limit. GFS reduces this with small metadata, client caching of locations, a replicated log and read-only "shadow" masters.
- **Relaxed consistency**: GFS chose speed and simplicity over strict guarantees. Applications must deal with duplicates and padding.
- **Large chunks** reduce metadata and master traffic, but small files can create hot spots.

### What it teaches for interviews

- Separate the **control plane** (metadata) from the **data plane** (bytes). This pattern appears in object storage, CDNs and test artifact stores.
- **Design for failure as normal**: heartbeats, re-replication, checksums.
- When you design a file storage system (like Google Drive), say: "metadata service + chunk storage with replication, clients go direct to storage".

## 2. MapReduce (2004)

**Paper:** Dean and Ghemawat, "MapReduce: Simplified Data Processing on Large Clusters", OSDI 2004.
**URL:** https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf

### Problem it solved

Engineers kept writing custom programs to process huge datasets (crawled pages, logs) across many machines. Each program had to handle splitting data, parallelism, machine failures and load balancing. MapReduce hid all this behind two simple functions that a normal engineer could write.

### Core design in simple words

- The user writes **map(key, value)**, which outputs intermediate (key, value) pairs, and **reduce(key, list of values)**, which combines all values for one key.
- The library splits input into **M map tasks** and partitions intermediate keys into **R reduce tasks** (by default `hash(key) mod R`).
- A **master** assigns tasks to idle **workers**. Map workers write output to their **local disk**. Reduce workers fetch their partition from all map workers (the **shuffle**), sort by key and call reduce.
- **Failure handling:** the master pings workers. If a worker dies, its tasks are run again elsewhere. Even finished map tasks are re-run, because their output was on the dead machine's local disk.
- **Stragglers:** near the end of a job, the master starts **backup copies** of the remaining tasks. Whichever copy finishes first wins. The paper reports this makes some jobs much faster.
- **Locality:** the master tries to run map tasks on machines that already hold a GFS replica of the input, to save network bandwidth.
- An optional **combiner** does a partial reduce on the map side (for example, summing word counts locally).

```
 Input splits     Map tasks          Shuffle (by key)       Reduce tasks      Output
 [split 1] --> [map] --(a,1)(b,1)--+                    +--> [reduce a] --> part-0
 [split 2] --> [map] --(a,1)(c,1)--+--> group by key ---+--> [reduce b] --> part-1
 [split 3] --> [map] --(b,1)(c,1)--+                    +--> [reduce c] --> part-2
```

```python
from collections import defaultdict

def map_fn(doc):                      # emit (word, 1) for each word
    return [(w, 1) for w in doc.split()]

def reduce_fn(word, counts):          # sum all counts for one word
    return word, sum(counts)

docs = ["upi pay upi", "pay later", "upi"]
groups = defaultdict(list)            # the "shuffle" step
for d in docs:
    for k, v in map_fn(d):
        groups[k].append(v)
print(sorted(reduce_fn(k, v) for k, v in groups.items()))
# [('later', 1), ('pay', 2), ('upi', 3)]
```

### Key trade-offs

- Very simple model, automatic fault tolerance. But it is **batch only** with high latency, and writing intermediate data to disk is slow for multi-step pipelines. Later systems (for example Google's FlumeJava and Dataflow, and Apache Spark outside Google) improved on this.
- Re-execution only works cleanly if map and reduce are **deterministic**. The paper notes that deterministic functions produce the same output as a non-faulty sequential run.

### What it teaches for interviews

- For "count top search queries per day" or "build an inverted index", describe a **map, shuffle, reduce** pipeline.
- **Re-execution** as fault tolerance needs idempotent, deterministic tasks.
- **Backup tasks** for stragglers is the same idea as sending hedged requests, and it is a great idea for test sharding too (re-run the slowest shard).

## 3. Bigtable (2006)

**Paper:** Chang et al., "Bigtable: A Distributed Storage System for Structured Data", OSDI 2006.
**URL:** https://static.googleusercontent.com/media/research.google.com/en//archive/bigtable-osdi06.pdf

### Problem it solved

Many Google products (the paper mentions web indexing, Google Earth and Google Finance) needed to store petabytes of structured data with very different needs: some wanted high write throughput, some low-latency reads. A relational database did not scale to this size on commodity machines.

### Core design in simple words

- The paper describes Bigtable as a **sparse, distributed, persistent, multi-dimensional sorted map**. The map is indexed by **(row key, column key, timestamp)** and the value is uninterpreted bytes.
- Rows are kept **sorted by row key**. The paper's "Webtable" example uses reversed URLs like `com.cnn.www` so pages from the same domain sit next to each other.
- Columns are grouped into **column families**. Each cell can keep several **timestamped versions**.
- Reads and writes to **one row are atomic**. There are no general multi-row transactions.
- A table is split into row ranges called **tablets**. Each tablet is served by one **tablet server**. A **master** assigns tablets to servers and balances load. Clients talk to tablet servers directly.
- **Write path:** a write goes to a commit log (stored on GFS) and to an in-memory **memtable**. When the memtable is full, it is written out as an immutable **SSTable** file on GFS. Background **compactions** merge SSTables. **Bloom filters** help skip SSTables that cannot contain a key.
- **Chubby** is used to elect the master, track live tablet servers, and store the location of the root tablet.

```
 Client --(find tablet: Chubby -> root tablet -> METADATA)--> [Tablet server 3]
                                                                   |
   write -> commit log (GFS) + memtable (RAM) --flush--> SSTables (GFS) --compaction--> merged SSTable
 [Master] assigns tablets, balances load      [Chubby] master lock, server liveness
```

Analogy: a huge phone directory, sorted by name. The directory is cut into volumes (tablets), each kept by a different librarian (tablet server). New entries go first into a notebook (memtable), and are later copied neatly into a printed volume (SSTable).

### Key trade-offs

- **Single-row atomicity only**: simple and scalable, but applications must design row keys carefully.
- **Sorted keys** give fast range scans, but sequential keys (like timestamps at the start of the key) can create a **hot tablet**.
- Building on GFS and Chubby reused existing systems, but created dependencies.

### What it teaches for interviews

- The **log-structured merge (LSM) tree** pattern - log + memtable + immutable sorted files + compaction - is behind Bigtable, HBase, Cassandra, RocksDB and LevelDB.
- **Row key design is the main skill**: group what you read together, avoid hot spots (add a hash prefix or reverse a key).
- Google Cloud offers Cloud Bigtable as a public product, so you can name it as a wide-column store for time series, IoT and test result data.

## 4. Chubby (2006)

**Paper:** Burrows, "The Chubby lock service for loosely-coupled distributed systems", OSDI 2006.
**URL:** https://static.googleusercontent.com/media/research.google.com/en//archive/chubby-osdi06.pdf

### Problem it solved

Many systems (GFS and Bigtable, for example) needed to **elect a leader** or store a small piece of configuration that everyone agrees on. Asking every team to implement Paxos correctly is risky. Chubby gives them a simple **lock service** instead.

### Core design in simple words

- A Chubby **cell** is a small group of replicas (the paper describes typically **five**). They use **Paxos** to elect a **master** and to replicate data.
- The interface looks like a **simple file system**: directories and small files. Any file can also be used as a **reader/writer lock**.
- Locks are **coarse-grained**: held for hours or days (for example "I am the Bigtable master"), not for milliseconds.
- Clients hold a **session** kept alive with **KeepAlive** messages. If the session expires, the client loses its locks.
- Clients **cache** file data. The master sends **invalidations** before a file changes, so caches stay consistent.
- **Sequencers**: a lock holder can pass a token describing the lock to servers, which check it - the same idea as a fencing token.
- Many teams also used Chubby as a **name service** to find servers.

```
 Clients (GFS master, Bigtable servers, ...)
     | KeepAlive / lock / read small file
     v
 +-------------- Chubby cell (5 replicas) --------------+
 | [Master] <--Paxos--> [Replica] [Replica] [Replica] [Replica] |
 +------------------------------------------------------+
```

Analogy: a society's notice board guarded by five committee members who vote. If you want to be "event organiser" (leader), you put your name on the board. Everyone checks the board instead of arguing.

### Key trade-offs

- **Availability and reliability over raw speed**: all reads and writes go to the master; writes need a majority.
- A **lock service** is easier for developers than a consensus library, but Chubby becomes a shared dependency that many systems rely on.
- Coarse-grained locks keep load low; fine-grained locking is left to applications.

### What it teaches for interviews

- When you need leader election or config, say "use a consensus-backed coordination service like Chubby, ZooKeeper or etcd" instead of inventing one.
- Mention **leases, sessions and fencing tokens** to handle a paused old leader.

## 5. Dapper (2010)

**Paper:** Sigelman et al., "Dapper, a Large-Scale Distributed Systems Tracing Infrastructure", Google Technical Report, 2010.
**URL:** https://static.googleusercontent.com/media/research.google.com/en//archive/papers/dapper-2010-1.pdf

### Problem it solved

One web search touches many services. When a request is slow, which service is the cause? Logs from each machine do not show the full path. Dapper records the path of a request across services.

### Core design in simple words

- A **trace** is a tree of **spans**. A span is one unit of work (for example one RPC) with a span ID, a parent span ID, a shared trace ID, start and end times, and optional **annotations** (notes added by the application).
- Dapper aimed for **application-level transparency**: instrumentation was added to a small set of **common libraries** (RPC, threading, control flow), so most developers did not need to change code.
- **Low overhead** through **sampling**: only a fraction of requests are traced (the paper discusses a uniform rate such as 1 in 1,024, and adaptive sampling).
- Span data is written to local log files, then collected by daemons into a central store (Bigtable in the paper) for analysis.

```
 Trace 42
 [frontend  0-120 ms]
    |-- [search backend 10-90 ms]
    |      |-- [index shard 1  15-60 ms]
    |      |-- [index shard 2  15-85 ms]   <- slowest child
    |-- [ads service 10-40 ms]
```

Analogy: a Swiggy order tracker that shows each step - restaurant accepted, food ready, rider picked up, delivered - with times, so you see exactly where the delay was.

### Key trade-offs

- **Sampling** keeps cost low but can miss rare slow requests. That is why tracing is combined with metrics and logs.
- Library-level instrumentation gives wide coverage, but only works if everyone uses the common libraries.

### What it teaches for interviews

- In any microservices design, mention **distributed tracing with trace IDs propagated in request headers**, sampled to control cost.
- Public tools such as Zipkin and OpenTelemetry follow this span-and-trace model.

## 6. Spanner (2012)

**Paper:** Corbett et al., "Spanner: Google's Globally-Distributed Database", OSDI 2012.
**URL:** https://static.googleusercontent.com/media/research.google.com/en//archive/spanner-osdi2012.pdf

### Problem it solved

Bigtable scaled well but lacked cross-row transactions and strong consistency across data centres. Teams (the paper mentions F1, the backend for Google's advertising business) wanted **SQL-like queries, transactions and global replication** together.

### Core design in simple words

- Data is split into many shards, and each shard is replicated across data centres using a **Paxos group**. Each group has a long-lived **leader**.
- Transactions that touch several Paxos groups use **two-phase commit**, where each participant is itself a Paxos group. This makes 2PC much less likely to block.
- The paper's key idea is **TrueTime**: an API whose `TT.now()` returns an interval `[earliest, latest]`. The true time is guaranteed to be inside. Google kept the uncertainty small using **GPS receivers and atomic clocks** in each data centre.
- **Commit wait**: after picking a commit timestamp, the leader waits until TrueTime is sure that timestamp is in the past before making the commit visible. Result: if transaction T1 commits before T2 starts, T1 gets a smaller timestamp. The paper calls this **external consistency**.
- Read-only transactions and snapshot reads at a timestamp can run **without locks**, on any sufficiently up-to-date replica.

```
 TT.now() = [earliest ----- latest]   (width = clock uncertainty)
 Commit: pick timestamp s >= latest
         wait until TT.now().earliest > s   <- "commit wait"
         then release locks and reply
 Data:  shard A -> Paxos group (US, EU, Asia)    shard B -> Paxos group
        cross-shard transaction -> 2PC across Paxos groups
```

Analogy: two cricket umpires with slightly different watches. If both know their watch error is at most 5 seconds, they wait 5 seconds before announcing a decision. Then the order of announcements is always correct.

### Key trade-offs

- Strong consistency and global transactions cost **write latency** (cross-region Paxos plus commit wait).
- TrueTime needs **special hardware** and careful operations. Without a bounded clock error, the design does not hold.
- In CAP terms, Spanner is a CP system that is engineered to be highly available in practice.

### What it teaches for interviews

- For money, inventory and bookings across regions, a Spanner-like database (Cloud Spanner is a public product) is a strong choice: "I pay some write latency for correctness".
- Explain the general lesson: **known clock uncertainty can be waited out**.

## 7. Borg (2015)

**Paper:** Verma et al., "Large-scale cluster management at Google with Borg", EuroSys 2015.
**URL:** https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/43438.pdf

### Problem it solved

Google runs a huge number of applications. Giving each one its own machines wastes resources. Borg is a **cluster manager**: users describe what to run, and Borg decides where it runs, restarts it if it fails, and packs many jobs onto shared machines.

### Core design in simple words

- Users submit **jobs**. A job has many identical **tasks** (for example 100 copies of a web server). The paper describes **long-running services** ("prod", latency-sensitive) and **batch jobs** ("non-prod") sharing the same machines.
- Machines are grouped into **cells**. Each cell has a **Borgmaster** and a **Borglet** agent on every machine.
- The Borgmaster is **replicated five times** and uses **Paxos** to elect a leader and store state.
- A **scheduler** finds feasible machines for each pending task and scores them. Tasks have **priorities**; a high-priority prod task can **preempt** (evict) lower-priority batch work. **Quota** limits how much each team can ask for.
- Borg's name service (BNS) writes task locations into Chubby so clients can find them.
- The paper lists lessons that Kubernetes later adopted, such as labels instead of rigid job groupings, and one IP address per pod instead of sharing the machine's IP.

```
 User --job config--> [Borgmaster x5 (Paxos)] --> [Scheduler]
                               |
             +-----------------+-----------------+
             v                 v                 v
        [Borglet]          [Borglet]         [Borglet]    <- one per machine
        prod task          prod task         batch task (can be preempted)
```

Analogy: a big wedding hall manager. Families (teams) request rooms and staff. VIP functions (prod) get priority; small events (batch) fill empty space and can be moved when a VIP arrives.

### Key trade-offs

- Mixing prod and batch on the same machines **raises utilization** a lot, but needs good isolation and preemption so batch work does not hurt latency.
- A central, replicated master is simpler than a fully decentralized design, but must be engineered to scale.

### What it teaches for interviews

- In any design, mention that services run as **replicated tasks on a cluster manager** (Kubernetes outside Google), with health checks and automatic restarts.
- For a test execution farm, Borg-style ideas apply directly: priorities (presubmit above nightly runs), quotas per team, and preemptible batch work.

## How the papers connect

```
 Borg runs everything --> GFS stores files --> MapReduce processes them
                          Chubby elects masters for GFS / Bigtable
                          Bigtable sits on GFS + Chubby
                          Spanner adds transactions + TrueTime
                          Dapper traces requests through all of it
```

## Tester's corner

- Each paper is mostly about **failure handling**. When you read one, list its failure cases and how it detects them. That list is a test plan.
- GFS record append and MapReduce re-execution both create **duplicates**. Test downstream consumers for idempotency.
- MapReduce **backup tasks** inspire test infrastructure: re-run the slowest shard on another worker and take the first result.
- Bigtable teaches **hot-spot testing**: load test with realistic key distributions, not random keys.
- Dapper shows why tests in microservice systems should **log trace IDs**. A failing end-to-end test with a trace ID is much faster to debug.
- Spanner shows that **clock assumptions** are a source of bugs. Test with skewed clocks.
- Borg-style **preemption** means your test workers can disappear at any time. Your test runner must handle it.

## Key takeaways

- GFS: single metadata master, 64 MB chunks, three replicas, clients read data directly from chunkservers.
- MapReduce: map, shuffle, reduce; fault tolerance by re-execution; backup tasks for stragglers.
- Bigtable: sorted map of (row, column, timestamp); tablets; memtable plus SSTables on GFS; single-row atomicity.
- Chubby: Paxos-backed lock service and small file store, typically five replicas, coarse-grained locks.
- Dapper: traces as trees of spans, library-level instrumentation, sampling for low overhead.
- Spanner: Paxos groups plus 2PC, TrueTime intervals and commit wait give external consistency.
- Borg: jobs and tasks in cells, replicated Borgmaster, priorities, quota and preemption; lessons fed into Kubernetes.
- In interviews, say "according to the paper" and reuse the pattern, not internal details.

## Quiz

1. In GFS, does file data flow through the master? A) Yes, always  B) No, clients read and write data directly with chunkservers  C) Only for reads  D) Only for appends
2. Why does MapReduce re-run completed map tasks when a worker dies?
3. What is a MapReduce "backup task"? A) A copy of input data  B) A duplicate run of a slow remaining task near the end of a job  C) A database backup  D) A retry of the master
4. Bigtable is indexed by: A) Row key only  B) Row key and column key  C) Row key, column key and timestamp  D) Primary key and foreign key
5. True or false: Bigtable supports atomic reads and writes within a single row.
6. What is Chubby mainly used for? A) Storing large videos  B) Coarse-grained locking, leader election and small config files  C) Running batch jobs  D) Tracing requests
7. In Dapper, what is a span?
8. What does TrueTime's `TT.now()` return? A) An exact timestamp  B) An interval [earliest, latest] that contains the true time  C) A Lamport counter  D) A vector clock
9. True or false: In Borg, prod and batch jobs always run on separate machines.
10. You are designing a test result store with heavy writes and range scans by test ID and time. Which paper's design would you borrow, and what row key would you pick?

## Answer key

1. **B** - The master only returns chunk locations; data moves directly between clients and chunkservers, so the master is not a bandwidth bottleneck.
2. **Local disk** - Map output is stored on the worker's local disk, so when that machine dies, the output is lost and must be recomputed.
3. **B** - Near the end, the master schedules duplicate executions of in-progress tasks; whichever finishes first is used, cutting straggler delay.
4. **C** - The paper describes a sorted map indexed by row key, column key and timestamp.
5. **True** - Bigtable gives single-row atomicity but no general multi-row transactions.
6. **B** - Chubby provides coarse-grained locks and a small file system, used by GFS and Bigtable for master election and metadata.
7. **One unit of work** - A span records one operation (like an RPC) with trace ID, span ID, parent ID, timing and annotations; spans form a trace tree.
8. **B** - TrueTime returns an uncertainty interval, and Spanner waits out the uncertainty (commit wait) before making commits visible.
9. **False** - The Borg paper describes mixing prod and non-prod work on shared machines to raise utilization, with priorities and preemption.
10. **Bigtable** - Use a wide-column, LSM-style store with row key like `test_id#reverse_timestamp` (or `test_id#run_time`) so one test's history is contiguous and newest first; add a hash prefix if one test is a hot spot.

## Flashcards

- **Q:** What chunk size and replica count did the GFS paper describe? — **A:** 64 MB chunks with three replicas by default.
- **Q:** What is the main GFS design pattern to reuse? — **A:** Separate the metadata master (control plane) from the data servers (data plane).
- **Q:** What are the three phases of MapReduce? — **A:** Map, shuffle (group by key), reduce.
- **Q:** How does MapReduce handle stragglers? — **A:** It runs backup copies of the last in-progress tasks and takes the first to finish.
- **Q:** What is a Bigtable tablet? — **A:** A contiguous range of rows, the unit of distribution and load balancing.
- **Q:** What is the Bigtable write path? — **A:** Commit log plus memtable, flushed to immutable SSTables, merged by compaction.
- **Q:** How many replicas does a typical Chubby cell have, and what protocol? — **A:** Five replicas using Paxos.
- **Q:** What made Dapper low-overhead? — **A:** Sampling only a fraction of requests and instrumenting shared libraries.
- **Q:** What is Spanner's commit wait? — **A:** Waiting until TrueTime guarantees the commit timestamp has passed before making the commit visible.
- **Q:** What does Spanner use for cross-shard transactions? — **A:** Two-phase commit across Paxos groups.
- **Q:** What are the main Borg components? — **A:** A five-way replicated Borgmaster with a scheduler, and a Borglet agent on each machine in a cell.
- **Q:** Which open-source system grew from Borg's lessons? — **A:** Kubernetes.

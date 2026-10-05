# Distributed Systems Deep Dive: Replication, Consensus, Clocks and Testing

> **In this chapter:**
> - Understand how machines fail, and how replication, quorums and consensus (Raft, Paxos) keep data safe
> - Build consistent hashing with virtual nodes in Python
> - Compare distributed transactions (2PC vs sagas) and understand logical clocks, vector clocks and the TrueTime idea
> - See why "exactly-once" is mostly a myth, and how idempotency and backpressure save you
> - Learn how experts TEST distributed systems: fault injection, Jepsen-style checks, chaos engineering and deterministic simulation
>
> **Time:** ~75 minutes  |  **Level:** Expert

In the earlier lessons you learned CAP, quorums, sharding and message queues at a high level. This chapter goes one level deeper. The goal is simple: when an interviewer says "What happens if this node dies?" or "How do these replicas agree?", you can answer step by step, and then explain how you would **test** it. That second part is where a test engineer shines.

A **distributed system** is a group of computers that work together and look like one system to the user. Think of IRCTC: many servers in many data centres, but you see one website and one ticket.

## 1. Failure models: how things break

Before you design anything, agree on **what can fail**. This list is called the **failure model**.

| Failure type | What happens | Everyday analogy |
|---|---|---|
| Crash-stop | A node stops and never comes back | A shop closes forever |
| Crash-recovery | A node stops, then restarts, maybe with old data on disk | A shopkeeper goes home and returns next morning |
| Omission | Some messages are lost | An SMS that never arrives |
| Timing / slow node | A node replies, but very late | A Swiggy rider stuck in traffic |
| Network partition | Two groups of nodes cannot talk to each other | A broken bridge between two towns |
| Byzantine | A node lies or sends wrong data (bug or attacker) | A cashier who gives fake receipts |

Key facts to say in an interview:

- **You cannot tell "slow" from "dead".** If a node does not reply in 2 seconds, it may be dead, or the network may be slow. A **timeout** is only a guess.
- Most company systems assume **crash-recovery plus partitions**, not Byzantine faults. Blockchains (which you have tested) are the main place where Byzantine fault tolerance is used.
- **Partial failure** is the hard part. In one computer, things usually work fully or fail fully. In a distributed system, half the system can work while the other half is broken.

## 2. Replication: keeping copies

**Replication** means keeping the same data on several machines. Reasons: survive failures, serve more reads, and put data closer to users.

### Leader-follower (single leader)

One node is the **leader**. All writes go to it. It sends a log of changes to **followers**. Reads can go to the leader (fresh) or to followers (maybe stale).

```
Client writes --> [Leader] --log--> [Follower 1]
                           --log--> [Follower 2]
Client reads  --> any node (followers may lag)
```

- **Synchronous** replication: the leader waits for followers before saying "OK". Safe, but slow, and one slow follower blocks writes.
- **Asynchronous** replication: the leader says "OK" at once. Fast, but if the leader dies, recent writes can be lost.
- Analogy: a cricket scorer (leader) writes every run, and the TV channels (followers) copy the score a few seconds later.

### Multi-leader

Several nodes accept writes, usually one per region. They sync with each other later. Good for offline apps and multi-region writes. The big problem is **write conflicts**: two people edit the same document in two regions at the same moment. You need a conflict rule, such as last-write-wins (simple, can lose data) or merge logic (like Google Docs style merging, or CRDTs - data types designed to merge automatically).

### Leaderless

Any replica accepts reads and writes (the Dynamo / Cassandra style). The client, or a coordinator, sends each write to N replicas and waits for some of them. This needs **quorums**.

## 3. Quorums: R + W > N

- **N** = number of replicas for a key.
- **W** = how many replicas must confirm a write.
- **R** = how many replicas you read from.

If **R + W > N**, every read set overlaps every write set in at least one node, so at least one replica you read has the latest write (it is identified by a version number).

Example with N = 3, W = 2, R = 2. A write reaches nodes A and B. A read asks B and C. B is in both groups, so the read sees the new value.

```python
# Check if a quorum config guarantees overlap, and how many failures it tolerates.
def quorum_info(n, r, w):
    overlap = r + w > n
    write_tolerates = n - w   # nodes that can be down and writes still work
    read_tolerates = n - r
    return overlap, write_tolerates, read_tolerates

print(quorum_info(3, 2, 2))  # (True, 1, 1)
print(quorum_info(3, 1, 1))  # (False, 2, 2)  fast but may read stale data
print(quorum_info(5, 3, 3))  # (True, 2, 2)
```

Warning: R + W > N is not full "strong consistency". With concurrent writes, sloppy quorums (writing to backup nodes during failures) and clock-based conflict resolution, you can still see odd results. Say this in an interview; it shows depth.

## 4. Consensus: getting nodes to agree

**Consensus** means several nodes agree on one value (or one ordered list of values), even if some nodes crash. It is used for leader election, configuration, locks and replicated logs. Consensus works if a **majority** (more than half) is alive. With 5 nodes you can lose 2. With 4 nodes you can still lose only 1, so odd numbers are common.

### Raft, step by step

Raft (Ongaro and Ousterhout, 2014) was designed to be easier to understand than Paxos. Each node is a **follower**, **candidate** or **leader**. Time is split into **terms** (term 1, term 2, ...), like numbered match innings.

1. **Start:** all nodes are followers. Each has a random **election timeout** (for example 150-300 ms). Randomness stops everyone from starting elections at the same moment.
2. **Election:** if a follower hears nothing from a leader before its timeout, it becomes a candidate, increases the term, votes for itself, and asks others for votes.
3. **Voting:** each node gives at most **one vote per term**, and only to a candidate whose log is at least as up to date as its own. This rule keeps committed data safe.
4. **Winner:** a candidate with votes from a majority becomes leader. It sends regular **heartbeats** so followers do not start new elections.
5. **Log replication:** a client sends a command to the leader. The leader appends it to its log and sends it to followers (AppendEntries messages).
6. **Commit:** when a majority has stored the entry, the leader marks it **committed**, applies it to its state machine, and replies to the client. Followers apply it later.
7. **Fixing followers:** if a follower's log differs, the leader finds the last matching entry and overwrites the rest. The leader's log always wins.
8. **Old leaders:** if an old leader comes back with a smaller term, it sees the higher term and steps down to follower.

```
Term 3:  [Leader A] --AppendEntries(x=5)--> B, C, D, E
         B, C reply OK -> A + B + C = majority (3 of 5) -> x=5 committed
```

Analogy: a class elects a monitor. If the monitor stops talking for too long, someone stands up and asks for votes. You need more than half the class. The monitor writes decisions on the board, and a decision is final once most students have copied it.

### Paxos intuition

Paxos (Leslie Lamport, "The Part-Time Parliament", 1998; "Paxos Made Simple", 2001) solves the same problem. The core idea in simple words:

- A **proposer** picks a unique, increasing proposal number and asks a majority of **acceptors** to "promise" not to accept older numbers (phase 1, prepare/promise).
- If acceptors already accepted some value, they report it, and the proposer **must** reuse the value with the highest number. This is how an already-chosen value survives.
- The proposer then asks acceptors to accept the value (phase 2, accept). Once a majority accepts, the value is **chosen**.

Any two majorities overlap, so two different values can never both be chosen. Multi-Paxos runs this for a sequence of log slots with a stable leader, which looks a lot like Raft. Google's Chubby and Spanner use Paxos (see the next chapter).

### Leader election in practice

You rarely write Raft yourself. You use a coordination service (etcd, ZooKeeper, or at Google, Chubby) and take a **lease**: a lock with an expiry time. The holder must renew it. Danger: an old leader with a long GC pause may think it is still leader. The fix is a **fencing token**: every new lease gets a bigger number, and the storage rejects writes with an older number.

## 5. Consistent hashing with virtual nodes

Plain `hash(key) % N` moves almost every key when N changes. **Consistent hashing** puts servers and keys on a ring. A key belongs to the first server clockwise. Adding a server only moves keys from its neighbour. **Virtual nodes** place each server at many points on the ring, so load is more even and a failed server's keys spread across many servers.

```python
import bisect, hashlib

def h(s):  # stable hash (Python's hash() changes between runs)
    return int(hashlib.md5(s.encode()).hexdigest(), 16)

class Ring:
    def __init__(self, nodes, vnodes=100):
        self.ring = sorted((h(f"{n}#{i}"), n) for n in nodes for i in range(vnodes))
        self.keys = [k for k, _ in self.ring]

    def get(self, key):
        i = bisect.bisect(self.keys, h(key)) % len(self.keys)  # wrap around
        return self.ring[i][1]

before = Ring(["A", "B", "C"])
after = Ring(["A", "B", "C", "D"])
users = [f"user{i}" for i in range(10000)]
moved = sum(before.get(u) != after.get(u) for u in users)
print(moved)  # about 2500 (~1/4 of keys move), not ~7500 as with % N
```

Test idea: assert load per node is within, say, 10% of the average, and that adding one node moves roughly `1/(N+1)` of keys.

## 6. Distributed transactions: 2PC and sagas

A **distributed transaction** changes data on several machines, all or nothing.

### Two-phase commit (2PC)

1. **Prepare:** the coordinator asks every participant "Can you commit?" Each one locks its data, writes to disk, and votes yes or no.
2. **Commit:** if all say yes, the coordinator sends "commit"; otherwise "abort".

Problem: if the coordinator crashes after participants voted yes, they are **stuck holding locks** and cannot decide alone. 2PC is a **blocking** protocol. Running the coordinator on a consensus group (as Spanner does with Paxos) reduces this risk.

### Sagas

A **saga** is a chain of local transactions. Each step has a **compensating action** that undoes it. Example, booking a trip: reserve train, then reserve hotel, then charge card. If the card charge fails, run "cancel hotel" and "cancel train".

| | 2PC | Saga |
|---|---|---|
| Consistency | Atomic, strong | Eventual; others can see middle states |
| Availability | Blocks on coordinator failure | Keeps going |
| Best for | Short transactions inside one database system | Long business flows across microservices |

Analogy: 2PC is a wedding where everyone must say "yes" before anything happens. A saga is a UPI refund: money leaves first, and if something fails later, a refund is sent.

## 7. Clocks and ordering

Machine clocks drift. NTP corrects them, but not perfectly, and a clock can even jump backwards. So "use the timestamp" is dangerous for ordering events.

- **Lamport clock** (Lamport, 1978): each node keeps a counter. Increase it on every event. Send it with every message. On receiving, set `counter = max(local, received) + 1`. If A caused B, then `L(A) < L(B)`. The reverse is not guaranteed.
- **Vector clock:** each node keeps a list of counters, one per node. Comparing two vectors tells you if one event happened before the other, or if they are **concurrent** (a real conflict).

```python
def compare(v1, v2):  # vector clocks as dicts {node: counter}
    nodes = set(v1) | set(v2)
    le = all(v1.get(n, 0) <= v2.get(n, 0) for n in nodes)
    ge = all(v1.get(n, 0) >= v2.get(n, 0) for n in nodes)
    if le and not ge: return "v1 before v2"
    if ge and not le: return "v2 before v1"
    return "equal" if le else "concurrent (conflict)"

print(compare({"A": 1}, {"A": 2, "B": 1}))          # v1 before v2
print(compare({"A": 2, "B": 0}, {"A": 1, "B": 1}))  # concurrent (conflict)
```

- **TrueTime idea** (Spanner paper, 2012): instead of one timestamp, the clock API returns an **interval** `[earliest, latest]` with a known error bound, kept small using GPS and atomic clocks. Spanner waits until the uncertainty has passed ("commit wait") before making a commit visible. Then timestamp order matches real-time order. The lesson: **if you know your clock error, you can wait it out.**

## 8. Idempotency and the exactly-once myth

Networks lose replies. A client retries. Did the first request succeed? The client cannot know. So in practice you get **at-most-once** (no retry, may lose) or **at-least-once** (retry, may duplicate). True **exactly-once delivery** over an unreliable network is not possible.

What systems call "exactly-once" is really **exactly-once processing (effect)** = at-least-once delivery + **idempotent** handling. Idempotent means doing it twice has the same effect as doing it once.

```python
processed = {}  # in real life: a DB table with a unique key and expiry

def charge(idempotency_key, user, amount):
    if idempotency_key in processed:          # duplicate retry
        return processed[idempotency_key]     # return the same result
    result = f"charged {user} Rs {amount}"    # do the real work once
    processed[idempotency_key] = result
    return result

print(charge("k1", "sahil", 500))  # charged sahil Rs 500
print(charge("k1", "sahil", 500))  # charged sahil Rs 500 (no double charge)
```

This is how UPI and payment gateways avoid double charges when you press "Pay" twice. Important detail: the check and the work must be **atomic** (one transaction), or two parallel retries can both pass the check.

## 9. Backpressure

**Backpressure** means a slow consumer tells fast producers to slow down, instead of silently collecting an endless queue. Without it, queues grow, latency explodes, memory runs out, and the system crashes.

Tools: bounded queues (block or reject when full), rate limits, returning HTTP 429 or 503 with "retry later", and client retries with **exponential backoff and jitter** (random delay so all clients do not retry together). Analogy: a railway ticket counter closes the queue gate when the hall is full, rather than letting the crowd crush everyone.

## 10. How to TEST distributed systems

This is the section that makes you different from other candidates. Normal unit tests run on one machine with perfect timing. Distributed bugs appear only with **specific orderings of failures and messages**.

### Fault injection

Deliberately cause failures and check behaviour. Kill a process, drop or delay packets (Linux `tc netem`), fill the disk, make DNS fail, return errors from a dependency. Each test has a **hypothesis**: "If one of three replicas dies, writes still succeed with W=2, and no acknowledged write is lost."

### Jepsen-style testing

Jepsen (by Kyle Kingsbury) is a well-known open-source tool that tests real databases. The method:

1. Run many clients doing concurrent operations (read, write, compare-and-set).
2. Meanwhile a "nemesis" injects faults: partitions, clock skew, process pauses, crashes.
3. Record a **history**: every operation's start, end and result.
4. Run a **checker** that asks: "Is there any valid order of these operations that explains the results?" (for example, a linearizability check).

The key idea for you: **do not assert on one response; assert on the whole history against a consistency model.** Jepsen has found data-loss bugs in many popular databases this way.

### Chaos engineering

Run controlled experiments in staging or production to build confidence. Steps: define "steady state" with metrics (success rate, latency), form a hypothesis, inject a real failure (kill an instance, cut a zone), limit the **blast radius** (how many users can be affected), and stop the experiment if metrics break. Netflix's Chaos Monkey is the famous example. The SWE at Google book's chapter on larger testing also lists disaster recovery and chaos engineering as a type of large test ([Chapter 14](https://abseil.io/resources/swe-book/html/ch14.html)).

### Deterministic simulation

Run the whole distributed system **inside one process** with a fake network, fake disk and fake clock, all controlled by one random seed. The simulator picks message order, drops and crashes. If a run fails, re-running the same seed reproduces it exactly. FoundationDB made this approach famous.

```python
import random
# Tiny idea: the seed controls message order, so any failure is replayable.
def simulate(seed, messages):
    rng = random.Random(seed)
    order = messages[:]
    rng.shuffle(order)                 # simulated network reordering
    dropped = [m for m in order if rng.random() < 0.2]  # simulated loss
    return order, dropped

print(simulate(42, ["vote", "append", "heartbeat"]))  # same output every run
```

### Other useful techniques

- **Property-based testing** (Hypothesis library in Python): generate random operation sequences, check invariants such as "balance never negative".
- **Invariant checks in production**: count rows in two systems and compare.
- **Linearizability checkers** (for example Knossos or Porcupine) for histories.
- **Formal methods** like TLA+ to check a design before coding.

## Tester's corner

- A "flaky" test in a distributed system is often a **real race or ordering bug**. Before adding a retry, ask which two messages or nodes were racing.
- Always test the **unhappy paths**: leader dies mid-write, network split during an election, a client retries after a timeout.
- Assert on **histories and invariants** ("no acknowledged write lost", "no double charge"), not only on single responses.
- Use **fixed seeds and fake clocks** so failures are reproducible. A bug you cannot replay is very hard to fix.
- Check **idempotency** directly: send the same request twice, in parallel, and assert one effect.
- For consistent hashing or sharding, test **even load** and **minimal key movement** when nodes join or leave.
- In chaos tests, define the **abort condition** and blast radius before you start.

## Key takeaways

- Agree on the failure model first; you cannot tell a slow node from a dead one.
- Replication can be leader-follower, multi-leader or leaderless; each trades consistency, latency and conflict handling.
- R + W > N makes read and write sets overlap, but it is not full strong consistency.
- Raft uses terms, randomized timeouts, majority votes and log replication; Paxos uses prepare/accept with overlapping majorities.
- Consistent hashing with virtual nodes moves only about 1/N of keys when a node is added.
- 2PC is atomic but blocking; sagas are available but eventually consistent with compensations.
- Exactly-once delivery is a myth; at-least-once plus idempotency gives exactly-once effect.
- Test distributed systems with fault injection, history checking (Jepsen-style), chaos experiments and deterministic simulation.

## Quiz

1. With N = 5 replicas, which setting guarantees read/write overlap? A) R=2, W=2  B) R=1, W=4  C) R=3, W=3  D) R=1, W=1
2. True or false: if a node does not reply within the timeout, it has definitely crashed.
3. In Raft, why are election timeouts randomized? A) To save CPU  B) To reduce split votes when many followers time out together  C) To encrypt votes  D) To speed up log replication
4. In Raft, when is a log entry committed? A) When the leader writes it  B) When any follower stores it  C) When a majority of nodes store it  D) When the client reads it
5. What is the main weakness of two-phase commit?
6. Two vector clocks are `{A:2, B:0}` and `{A:1, B:1}`. What is their relationship? A) First happened before  B) Second happened before  C) Concurrent  D) Equal
7. True or false: a message queue can guarantee exactly-once delivery over an unreliable network without any idempotency on the consumer.
8. A consumer is much slower than producers and memory keeps growing. What would you do?
9. A Jepsen-style test mainly checks: A) Code coverage  B) Whether the recorded history of operations is valid under a consistency model while faults are injected  C) UI rendering  D) Unit test speed
10. A bug in your distributed test appears once in 500 runs and you cannot reproduce it. What technique helps most?

## Answer key

1. **C** - 3 + 3 = 6 > 5. Option B gives 1 + 4 = 5, which is not strictly greater than 5, so a read and a write can miss each other.
2. **False** - The node may be slow, paused, or the network may be partitioned. A timeout is only a suspicion.
3. **B** - Random timeouts make it likely that one node starts an election first and wins, instead of many candidates splitting votes.
4. **C** - An entry is committed once a majority has stored it; then it survives any minority of failures.
5. **Blocking** - If the coordinator crashes after participants vote yes, they hold locks and cannot decide on their own until it recovers.
6. **C** - A is higher in the first, B is higher in the second, so neither happened before the other: concurrent.
7. **False** - Lost acknowledgements force retries, so delivery is at-least-once. You need idempotent processing for an exactly-once effect.
8. **Add backpressure** - Use a bounded queue, reject or slow producers (429/503), let clients back off with jitter, and scale or speed up consumers.
9. **B** - Jepsen records concurrent operations under faults and checks the full history against a model such as linearizability.
10. **Deterministic simulation** - Run with a fake network and clock driven by a seed, so the failing seed replays the exact same ordering every time.

## Flashcards

- **Q:** What does R + W > N guarantee? — **A:** Every read quorum overlaps every write quorum in at least one replica.
- **Q:** How many failures can a 5-node consensus group tolerate? — **A:** 2, because a majority of 3 must stay alive.
- **Q:** What are the three Raft roles? — **A:** Follower, candidate and leader.
- **Q:** What is a Raft term? — **A:** A numbered period with at most one leader; higher terms override lower ones.
- **Q:** What is a fencing token? — **A:** An increasing number given with each lease so storage can reject writes from an old leader.
- **Q:** Why use virtual nodes in consistent hashing? — **A:** To spread load evenly and spread a failed node's keys across many nodes.
- **Q:** What is a saga? — **A:** A chain of local transactions where each step has a compensating action to undo it.
- **Q:** What can a vector clock detect that a Lamport clock cannot? — **A:** Whether two events are concurrent (a true conflict).
- **Q:** What is the TrueTime idea? — **A:** The clock returns an interval with bounded error, and the system waits out the uncertainty before committing.
- **Q:** How do you get an exactly-once effect? — **A:** At-least-once delivery plus idempotent processing with a unique key.
- **Q:** What is deterministic simulation testing? — **A:** Running the whole system with fake network, disk and clock driven by a seed so any failure replays exactly.

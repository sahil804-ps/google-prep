# Operating System and Concurrency Basics

> **In this chapter:**
> - Understand the four main resources of a computer: CPU, memory, disk and network
> - Know the difference between processes and threads, and between concurrency and parallelism
> - See how race conditions happen, and how locks fix them (and how deadlocks appear)
> - Learn async/await, event loops, the Python GIL, timeouts and retries
> - Connect race conditions and timing directly to flaky tests
>
> **Time:** ~40 minutes  |  **Level:** Zero

## Why a tester should care

You have seen this many times: a test passes 9 times out of 10, and fails once with no code change. People call it a **flaky test**. Very often, the real cause is **timing**: two things happen in a different order than the test expected.

To understand timing bugs, you need to know how a computer runs many things at once. That is the job of the **operating system** (OS): Linux, Windows, macOS, Android. This chapter explains the core ideas in simple words. They also appear in system design interviews whenever you talk about servers handling many requests.

## The four resources: CPU, memory, disk, network

Think of a computer as a restaurant kitchen.

- **CPU** (Central Processing Unit) is the **chef**. It does the actual work: calculations and running instructions. A modern CPU has several **cores**; each core is like one chef who can work on one task at a time.
- **Memory** (RAM) is the **kitchen counter**. It is fast to reach, but limited in size, and it is cleared when the power goes off.
- **Disk** (SSD or hard disk) is the **storeroom**. It is large and keeps things after power off, but it is much slower to reach than the counter.
- **Network** is the **delivery van** to other restaurants. It is the slowest, and sometimes the van gets stuck in traffic.

The speed difference is huge. Reading from memory takes around 100 nanoseconds, while a network round trip to another continent takes around 150 milliseconds, which is more than a million times longer. (Chapter 5 has a full table of approximate numbers.) This is why programs spend most of their time **waiting**, not calculating.

A task that mostly waits for disk or network is called **I/O-bound** (I/O means input/output). A task that mostly uses the CPU, like resizing images or compressing files, is called **CPU-bound**. This difference decides which concurrency tool you should use.

## Processes and threads

A **program** is a file on disk, like `chrome.exe` or `python`. When you run it, the OS creates a **process**.

A **process** is a running program with its **own memory space**. One process cannot normally read another process's memory. If one process crashes, others keep running. Each Chrome tab often runs in its own process, so one bad website does not crash the whole browser.

A **thread** is a smaller unit of work **inside** a process. A process can have many threads, and they all **share the same memory**.

Analogy: a process is a **flat** (apartment). Each flat has its own kitchen and locked door. Threads are **family members inside one flat**. They share the same fridge. This is convenient (easy to share food), but if two people take the last bottle of milk at the same time, there is a problem.

| | Process | Thread |
|---|---------|--------|
| Memory | Own, separate | Shared with other threads in the process |
| Cost to create | Higher | Lower |
| Crash impact | Only that process | Can crash the whole process |
| Talking to each other | Harder (pipes, sockets, files) | Easy (shared variables), but risky |

## Context switching

A machine may have 8 cores but hundreds of processes and thousands of threads. How do they all run? The OS **scheduler** gives each thread a small slice of CPU time (a few milliseconds), then pauses it and runs another. It switches so quickly that everything seems to run at the same time.

Switching from one thread to another is called a **context switch**. The OS must save the current thread's state (where it was, its register values) and load the next one's. Like a chef who stops making dosa to stir the sambar: he must remember exactly where he stopped.

Context switches are not free. Each one costs some microseconds and makes CPU caches less effective. With too many threads, the CPU can spend a big share of its time switching instead of working.

The key point for testers: **you do not control when the OS pauses a thread**. A thread can be paused in the middle of any operation. This is the root of race conditions.

## Concurrency vs parallelism

These two words are often mixed up.

- **Concurrency** means **dealing with** many tasks at once. Tasks make progress in overlapping time periods, but not necessarily at the same instant.
- **Parallelism** means **doing** many tasks at the exact same instant, on different cores.

Analogy: one chef cooking three dishes, switching between them while each one simmers, is **concurrency**. Three chefs each cooking one dish at the same time is **parallelism**.

```
Concurrency (1 core):    A A B B A C C B A C     (tasks take turns)
Parallelism (3 cores):   core1: A A A A A
                         core2: B B B B B        (tasks run truly together)
                         core3: C C C C C
```

You can have concurrency without parallelism (one core switching tasks), and most real servers use both.

## Race conditions

A **race condition** happens when the result depends on the **timing or order** of events that you do not control. The threads "race", and the winner decides the result.

Classic example: two threads both add 1 to a shared counter. `count += 1` looks like one step, but it is really three:

1. Read `count` from memory.
2. Add 1.
3. Write the result back.

If the OS switches threads at the wrong moment:

```
count = 5
Thread A: read count  (5)
Thread B: read count  (5)         <- B reads before A writes
Thread A: write 5+1   (count = 6)
Thread B: write 5+1   (count = 6) <- A's update is lost; expected 7
```

This is the same "lost update" you saw with the train seat in the databases chapter. It is the same idea, at a different level.

```python
import threading, time

count = 0
def add_many():
    global count
    for _ in range(1_000):
        value = count       # 1. read
        time.sleep(0)       # let another thread run between read and write
        count = value + 1   # 2. add and 3. write: NOT atomic

threads = [threading.Thread(target=add_many) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(count)
# Expected: 4000. Actual: much lower, and different on every run.
# Without the sleep the gap is tiny, so the bug hides most of the time.
```

Notice the comment. The bug **does not always show up**. That is exactly what makes race conditions dangerous, and exactly what makes flaky tests.

The part of code that touches shared data and must not be interrupted by another thread is called the **critical section**.

## Locks and mutexes

A **lock**, also called a **mutex** (mutual exclusion), makes sure only **one thread at a time** can enter a critical section.

Analogy: a single-key bathroom at a petrol pump. You take the key, use the bathroom, and return the key. Anyone else must wait until the key is back.

```python
import threading

count = 0
lock = threading.Lock()

def add_many():
    global count
    for _ in range(100_000):
        with lock:          # only one thread at a time runs this line
            count += 1

threads = [threading.Thread(target=add_many) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(count)   # Expected output: 400000, every run
```

Locks fix the race, but they have costs:

- Threads **wait** for the lock, so the program can become slower.
- If you forget to release a lock (for example after an exception), other threads wait forever. Using `with lock:` releases it automatically.
- Locking too much code removes the benefit of concurrency.

Other tools you may hear about: **atomic operations** (hardware-level single-step updates), **semaphores** (allow up to N threads at once, like a parking lot with N spaces), and **thread-safe queues** (one thread puts work in, others take it out safely).

## Deadlock

A **deadlock** happens when two or more threads each wait for something another one holds, so **none** of them can ever continue.

Analogy: two cars meet on a narrow one-lane bridge from opposite sides. Each waits for the other to reverse. Nobody moves, forever.

```
Thread 1: holds Lock A, waiting for Lock B
Thread 2: holds Lock B, waiting for Lock A
          ---> both wait forever
```

Deadlock needs four conditions at the same time (known as the Coffman conditions):

1. **Mutual exclusion**: a resource can be held by only one thread.
2. **Hold and wait**: a thread holds one resource while waiting for another.
3. **No preemption**: you cannot force a thread to give up a resource.
4. **Circular wait**: there is a cycle of threads each waiting on the next.

Break any one condition, and deadlock cannot happen. The most practical fixes:

- **Always take locks in the same order** (for example, always A before B). This breaks circular wait.
- **Use timeouts when acquiring locks** (`lock.acquire(timeout=2)`), and back off if you fail.
- **Hold fewer locks, for shorter times.**

Databases detect deadlocks between transactions themselves, and cancel one of them with an error. Your application should be ready to retry that transaction.

## Async/await and event loops

Threads are one way to handle many waiting tasks. Another way is **asynchronous programming**, using an **event loop**.

Analogy: a single waiter in a busy restaurant. He takes an order from table 1, gives it to the kitchen, and does **not** stand there waiting for the food. He goes to table 2, then table 3. When the kitchen rings the bell for table 1's food, he picks it up and serves it. One waiter serves many tables because most of the time is spent waiting for the kitchen.

The **event loop** is that waiter. It runs on one thread, keeps a list of tasks, and runs whichever task is ready. When a task must wait for I/O (a network call, a timer), it **gives control back** to the loop with `await`, and the loop runs something else.

```python
import asyncio, time

async def fetch(name, seconds):
    await asyncio.sleep(seconds)    # pretend network wait; loop runs others meanwhile
    return f"{name} done"

async def main():
    start = time.perf_counter()
    results = await asyncio.gather(fetch("orders", 1), fetch("users", 1), fetch("cart", 1))
    print(results, round(time.perf_counter() - start))

asyncio.run(main())
# Expected output: ['orders done', 'users done', 'cart done'] 1
# Three 1-second waits finish in about 1 second total, not 3.
```

Important rules:

- Async is great for **I/O-bound** work (many network calls). It does **not** make CPU-bound work faster.
- One blocking call inside async code (like `time.sleep(5)` or a slow non-async library call) **freezes the whole loop**, and every other task waits.
- JavaScript and Node.js work this way. Playwright's API is built on async in Node.js and offers both async and sync APIs in Python. Browser JavaScript also runs on an event loop, which is why page updates happen "later" than your test's click.

## The Python GIL

In the main Python implementation (**CPython**), there is a **Global Interpreter Lock** (GIL). It allows only **one thread to run Python bytecode at a time** inside a process.

What this means in practice:

- For **I/O-bound** work, threads still help a lot. While one thread waits for the network, the GIL is released and another thread runs.
- For **CPU-bound** work, threads in CPython usually give **little or no speed-up**, because only one runs Python code at a time. Use **multiprocessing** (separate processes, each with its own GIL) instead.
- The GIL does **not** make your code safe from race conditions. The `count += 1` example can still go wrong, because a thread can be switched between the read and the write. Always use locks for shared data.

Note: Python 3.13 added an optional, experimental "free-threaded" build that can run without the GIL. The normal default build still has the GIL.

| Work type | Good tool in Python |
|-----------|---------------------|
| Many network calls (API tests, scraping) | `asyncio` or threads |
| Heavy calculation (image processing, big data crunch) | `multiprocessing` |
| Running many test files in parallel | Separate processes (for example `pytest-xdist`) |

## Timeouts

A **timeout** is the maximum time you are willing to wait for something. Without one, a call to a hung server can wait **forever**, and so does everything waiting behind it.

Analogy: you call a customer care number. If nobody answers in 2 minutes, you hang up and try later. You do not hold the phone for three days.

Good timeout practices:

- **Every network call needs a timeout**: HTTP calls, database queries, message queue reads.
- There are often two kinds: a **connect timeout** (how long to wait to open a connection) and a **read timeout** (how long to wait for the response once connected).
- In a chain of services, inner timeouts should be **shorter** than outer ones. If the gateway waits 5 seconds, the service behind it should give up before that, so the error can be reported clearly.

## Retries, backoff and jitter

Some failures are **temporary** (**transient**): a brief network glitch, a 503 during a deploy, a database deadlock. Retrying often fixes them. But careless retries can make things worse.

Rules for safe retries:

1. **Only retry transient errors**: timeouts, 503, 429, connection resets. Do not retry 400 or 404; they will fail again.
2. **Only retry idempotent operations**, or use an idempotency key (see Chapter 2). Otherwise you might charge a customer twice.
3. **Use exponential backoff**: wait 1s, then 2s, then 4s, and so on. This gives the struggling server time to recover.
4. **Add jitter** (a small random amount to each wait), so thousands of clients do not all retry at the same instant. This "retry storm" problem is sometimes called the **thundering herd**.
5. **Limit the number of retries**, then fail with a clear error.

```python
import random, time

def call_with_retry(func, max_tries=4, base=0.5):
    for attempt in range(max_tries):
        try:
            return func()
        except TimeoutError:
            if attempt == max_tries - 1:
                raise                               # give up after the last try
            wait = base * (2 ** attempt)            # 0.5, 1, 2 seconds ...
            time.sleep(wait + random.uniform(0, wait))   # plus jitter

# If func fails twice with TimeoutError and then succeeds,
# call_with_retry returns its result after roughly 0.5-1 s + 1-2 s of waiting.
```

## Race conditions, timing and flaky tests

Now we can connect everything to your daily work. Most flaky tests come from one of these timing problems.

**1. The test races the application.** Your test clicks "Save" and immediately checks for the "Saved!" message. The app sends an API call and updates the DOM later, through the browser's event loop. Sometimes the check runs first. This is a race condition between your test and the app.

- Bad fix: `time.sleep(3)`. Too short on a slow CI machine (still flaky), too long everywhere else (slow suite).
- Good fix: **wait for a condition**. Playwright's auto-waiting and web-first assertions (`expect(locator).to_have_text("Saved!")`) retry until the condition is true or a timeout is reached. In Selenium, use explicit waits (`WebDriverWait` with expected conditions).

**2. Tests race each other.** Tests running in parallel share the same user account, database row or file. Test A changes the user's address while test B checks it. The result depends on which runs first.

- Fix: give each test its **own data** (unique users, unique IDs per run), and avoid shared global state.

**3. Order dependence.** Test B only passes if test A ran first and created some data. When the runner changes order or runs them in parallel, B fails.

- Fix: each test sets up and cleans up what it needs. Tools that run tests in random order help reveal this.

**4. Asynchronous back-end work.** The API returns 202 Accepted, and a background worker finishes the job later. The test checks the result too early. Or a write goes to the database leader, and the read comes from a lagging replica.

- Fix: **poll with a timeout** until the expected state appears, and know the system's consistency guarantees.

**5. Real time and clocks.** Tests that use the current time can fail near midnight, at month end, or in a different time zone on the CI server.

- Fix: inject or freeze the clock in tests, and use UTC.

**6. Missing timeouts and bad retries.** A test hangs forever on a dead service, or a test framework blindly retries failed tests and hides a real race condition in the product.

- Fix: set timeouts everywhere. Treat "passes on retry" as a **signal to investigate**, not as a pass.

A powerful habit: when a test is flaky, ask "**What two things are racing here?**" Usually you find the test racing the app, or two tests racing each other. And remember that a flaky test can be exposing a **real race condition in the product**, the kind that users will also hit.

A simple way to find flakiness is to run one test many times, in parallel and under load. For example, `pytest --count=100` with the `pytest-repeat` plugin, or Playwright's `--repeat-each=100`. A test that fails 1 time in 100 is still broken.

## Tester's corner

- **Never use fixed sleeps to "fix" flakiness.** Wait for a specific condition with a timeout instead (Playwright web-first assertions, Selenium explicit waits).
- **Isolate test data.** Unique users and IDs per test remove most test-versus-test races when running in parallel.
- **Run new tests many times before merging** (repeat runs, random order, parallel workers) to catch timing bugs early.
- **Hunt for product races on purpose.** Fire concurrent requests at "use once" actions: coupons, last-seat booking, OTP verification, wallet withdrawals.
- **Check timeouts and retries in the product.** Ask: what happens if this dependency hangs? Does the retry use backoff and only on idempotent calls?
- **Treat "passes on retry" as data.** Track how often tests need retries; a rising number is an early warning.
- **Know your tools' concurrency model.** pytest-xdist uses separate processes; asyncio runs on one thread; browser JavaScript runs on an event loop. Each causes different kinds of timing issues.

## Key takeaways

- The **CPU** computes; **memory** is fast but small; **disk** is large but slower; **network** is slowest. Most programs spend their time waiting on I/O.
- A **process** has its own memory; **threads** inside a process share memory, which is convenient but risky.
- **Concurrency** is handling many tasks in overlapping time; **parallelism** is running them at the same instant on different cores.
- A **race condition** is when the result depends on uncontrolled timing; **locks** protect critical sections.
- A **deadlock** is a cycle of threads waiting on each other; taking locks in a fixed order prevents it.
- **Async/await** with an event loop handles many I/O tasks on one thread; a blocking call freezes the loop.
- The **Python GIL** limits CPU-bound threading but does not prevent race conditions.
- Use **timeouts** everywhere and **retries with exponential backoff and jitter** only for transient errors on idempotent operations. Most **flaky tests** are timing problems.

## Quiz

1. What is the main difference between a process and a thread?
   A) Threads have their own memory; processes share memory  B) Processes have their own memory; threads in a process share memory  C) There is no difference  D) Processes only run on one core
2. True or false: Concurrency and parallelism mean exactly the same thing.
3. Why can `count += 1` give the wrong result with multiple threads?
4. Thread 1 holds lock A and waits for lock B. Thread 2 holds lock B and waits for lock A. What is this called?
   A) Race condition  B) Deadlock  C) Context switch  D) Starvation by priority
5. Which is the simplest practical way to prevent the deadlock in question 4?
6. You need to make 500 API calls in a Python test setup script. Which tool is a good fit?
   A) `multiprocessing` with 500 processes  B) `asyncio` or a thread pool  C) A single loop with `time.sleep(1)` between calls  D) None, it cannot be done
7. True or false: Because of the GIL, Python threads can never have race conditions.
8. Which errors should a client usually retry?
   A) 400 Bad Request  B) 404 Not Found  C) 503 Service Unavailable  D) 403 Forbidden
9. What would you do? A UI test sometimes fails because the "Order placed" toast is not found. A teammate adds `time.sleep(5)` before the check.
10. What would you do? Two parallel tests both log in as `testuser1` and update the profile. One of them fails randomly.

## Answer key

1. **B** - Each process has its own memory space; threads in the same process share memory.
2. **False** - Concurrency is handling many tasks in overlapping time (possibly on one core); parallelism is running tasks at the same instant on multiple cores.
3. **It is not atomic** - It is a read, an add and a write. Another thread can read the old value before the first thread writes, so one update is lost.
4. **B** - Each thread waits for a lock the other holds, so neither can continue. That is a deadlock.
5. **Fixed lock order** - Make every thread acquire locks in the same order (always A then B). This breaks the circular wait. Lock timeouts also help.
6. **B** - API calls are I/O-bound, so asyncio or a thread pool lets many calls wait at the same time. 500 processes would waste memory.
7. **False** - The GIL allows one thread to run bytecode at a time, but threads can still be switched between the read and the write, so shared data still needs locks.
8. **C** - 503 is usually temporary. 400, 403 and 404 will fail again on retry.
9. **Replace the sleep with a condition wait** - Use a web-first assertion or explicit wait for the toast with a sensible timeout. Fixed sleeps are slow and still flaky on slow machines. Also check whether the app itself has a bug in showing the toast.
10. **Isolate test data** - The tests race each other on shared data. Create a unique user per test (or per worker), so parallel tests never touch the same records.

## Flashcards

- **Q:** What is a process? — **A:** A running program with its own separate memory space.
- **Q:** What is a thread? — **A:** A unit of execution inside a process that shares memory with the other threads of that process.
- **Q:** What is a context switch? — **A:** The OS saving one thread's state and loading another's so they can take turns on a CPU core.
- **Q:** Concurrency vs parallelism? — **A:** Concurrency is handling many tasks in overlapping time; parallelism is running them at the same instant on different cores.
- **Q:** What is a race condition? — **A:** A bug where the result depends on the uncontrolled timing or order of events.
- **Q:** What does a mutex do? — **A:** It lets only one thread at a time enter a critical section.
- **Q:** What is a deadlock? — **A:** Threads each waiting for a resource another holds, so none can ever proceed.
- **Q:** How do you prevent most deadlocks? — **A:** Acquire locks in the same fixed order everywhere, and use lock timeouts.
- **Q:** What is an event loop? — **A:** A single-threaded scheduler that runs whichever task is ready while others wait on I/O.
- **Q:** What does the Python GIL do? — **A:** It allows only one thread to run Python bytecode at a time in CPython, limiting CPU-bound threading.
- **Q:** What is exponential backoff with jitter? — **A:** Waiting longer after each retry (1s, 2s, 4s) plus a random extra, so clients do not retry all at once.
- **Q:** What is the most common root cause of flaky tests? — **A:** Timing: the test racing the app, or tests racing each other over shared data.

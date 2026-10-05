# Databases from Zero

> **In this chapter:**
> - Understand tables, rows, columns, primary keys and foreign keys
> - Read and write basic SQL: SELECT, WHERE, JOIN and GROUP BY
> - Know why indexes make queries fast, using a B-tree picture
> - Explain transactions, ACID, isolation levels and their anomalies with a bank-transfer example
> - Compare relational, key-value, document, wide-column and graph stores, and the basics of replication
>
> **Time:** ~45 minutes  |  **Level:** Zero

## Why databases matter

A **database** is a program that stores data safely and lets you find it again quickly. When your app restarts, memory is wiped. The database is what remembers your orders, your UPI history, and your test results.

Almost every system design answer has a database in it, and many bugs that testers find are really database bugs: duplicate records, lost updates, slow pages, and data that "disappears". This chapter gives you the base. The later lessons on SQL vs NoSQL, sharding and CAP build on it.

## Tables, rows and columns

A **relational database** stores data in **tables**. A table is like an Excel sheet with strict rules.

- A **column** is one kind of information, with a fixed **type** (number, text, date).
- A **row** is one record, for example one customer.
- The **schema** is the list of tables, columns and types. It is the design of the data.

Here is a `customers` table:

| id | name | city |
|----|------|------|
| 1 | Asha | Pune |
| 2 | Ravi | Delhi |
| 3 | Meena | Pune |

And an `orders` table:

| id | customer_id | amount | status |
|----|-------------|--------|--------|
| 101 | 1 | 450 | PAID |
| 102 | 1 | 120 | PAID |
| 103 | 2 | 900 | CANCELLED |

## Primary keys and foreign keys

A **primary key** is a column that uniquely identifies each row. In `customers`, `id` is the primary key. No two customers can have the same `id`, and it can never be empty. Think of it as an Aadhaar number for a row.

A **foreign key** is a column that points to the primary key of another table. In `orders`, `customer_id` is a foreign key to `customers.id`. It says "this order belongs to that customer".

The database can **enforce** foreign keys. If you try to insert an order with `customer_id = 99` and there is no customer 99, the database refuses. This is called **referential integrity**. It stops "orphan" rows that point to nothing.

```
customers                 orders
+----+-------+           +-----+-------------+--------+
| id | name  | <-------- | id  | customer_id | amount |
+----+-------+   (FK)    +-----+-------------+--------+
| 1  | Asha  |           | 101 |      1      |  450   |
| 2  | Ravi  |           | 103 |      2      |  900   |
```

Other useful **constraints** (rules the database checks for you):

- `UNIQUE` - no duplicates, for example on `email`.
- `NOT NULL` - the value is required.
- `CHECK` - a custom rule, for example `amount >= 0`.

Constraints are your last line of defence. Even if application code has a bug, the database can still block bad data.

## SQL basics

**SQL** (Structured Query Language) is the language for talking to relational databases. You describe **what** you want, and the database decides **how** to get it.

### SELECT and WHERE

```
SELECT name, city
FROM customers
WHERE city = 'Pune';
```

Result: Asha (Pune), Meena (Pune).

- `SELECT` chooses the columns.
- `FROM` chooses the table.
- `WHERE` filters the rows.
- `ORDER BY amount DESC` sorts, and `LIMIT 10` takes only the first 10.

### JOIN

A **JOIN** combines rows from two tables using a matching column.

```
SELECT c.name, o.id, o.amount
FROM customers c
JOIN orders o ON o.customer_id = c.id;
```

Result:

| name | id | amount |
|------|----|--------|
| Asha | 101 | 450 |
| Asha | 102 | 120 |
| Ravi | 103 | 900 |

Meena does not appear because she has no orders. This is an **INNER JOIN**: only rows that match on both sides. A **LEFT JOIN** keeps every row from the left table, and fills missing right-side values with `NULL`. A LEFT JOIN would show Meena with `NULL` for the order columns. That is how you find "customers who never ordered".

### GROUP BY

**GROUP BY** puts rows into groups and calculates a summary for each group, using functions like `COUNT`, `SUM`, `AVG`, `MIN` and `MAX`.

```
SELECT customer_id, COUNT(*) AS num_orders, SUM(amount) AS total
FROM orders
WHERE status = 'PAID'
GROUP BY customer_id
HAVING SUM(amount) > 200;
```

Result: customer 1, 2 orders, total 570.

`WHERE` filters rows **before** grouping. `HAVING` filters groups **after** grouping.

You can try SQL right now with Python's built-in SQLite:

```python
import sqlite3

db = sqlite3.connect(":memory:")          # a temporary database in memory
db.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INT, amount INT)")
db.executemany("INSERT INTO orders VALUES (?, ?, ?)",
               [(101, 1, 450), (102, 1, 120), (103, 2, 900)])
rows = db.execute(
    "SELECT customer_id, SUM(amount) FROM orders GROUP BY customer_id"
).fetchall()
print(rows)
# Expected output: [(1, 570), (2, 900)]
```

Note the `?` placeholders. They pass values safely. Building SQL by joining strings with user input leads to **SQL injection**, a classic security bug that testers should always try.

## Indexes: the index at the back of a book

Imagine a 1,000-page book on cricket. To find every page that mentions "Dhoni", you can read all 1,000 pages. Or you can turn to the **index** at the back, which lists "Dhoni: 45, 210, 388". The second way is much faster.

Without an index, a query like `WHERE email = 'asha@x.com'` must check every row. This is a **full table scan**. With a million rows, that is slow.

An **index** is an extra data structure that the database keeps, sorted by one or more columns, so it can jump to the right rows quickly.

### B-tree intuition

Most relational databases use a **B-tree** (or its close cousin, the B+ tree) for indexes. Think of it as a sorted, multi-level signboard system, like the floor directory in a big mall.

```
                    [  M  ]                      <- root: "A-L left, M-Z right"
                  /         \
          [ D   H ]           [ R   W ]          <- inner nodes
         /   |    \          /   |    \
     [A-C] [D-G] [H-L]   [M-Q] [R-V] [W-Z]       <- leaves: point to the rows
```

To find "Meena", you start at the root, go right (M or later), then to the leftmost leaf (M-Q), and find her. Each node holds many keys (often hundreds), so the tree is very wide and very short. Even with hundreds of millions of rows, a lookup usually needs only a few levels. In Big-O terms, a lookup is **O(log n)** instead of **O(n)** for a full scan.

Because leaves are kept in sorted order, B-trees are also good for **range queries** like `WHERE created_at BETWEEN '2026-01-01' AND '2026-01-31'` and for `ORDER BY`.

### Indexes are not free

- Every `INSERT`, `UPDATE` and `DELETE` must also update every index on that table. More indexes mean slower writes.
- Indexes use extra disk and memory.
- An index on a column with very few distinct values (like `is_active` true/false) often does not help much.

Rule of thumb: index the columns you often search, join or sort by. Use the database's `EXPLAIN` command to see whether a query uses an index or does a full scan.

## Transactions and ACID

A **transaction** is a group of database operations that must succeed or fail **as one unit**.

The classic example is a bank transfer. Asha sends Rs 500 to Ravi:

```
BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE id = 'asha';
UPDATE accounts SET balance = balance + 500 WHERE id = 'ravi';
COMMIT;
```

What if the server crashes after the first `UPDATE` but before the second? Without a transaction, Rs 500 disappears from the world. With a transaction, the database guarantees that either **both** updates happen or **neither** does. If something goes wrong, you call `ROLLBACK` and everything is undone.

Relational databases promise four properties, called **ACID**:

- **A - Atomicity**: all or nothing. The transfer never half-happens.
- **C - Consistency**: the data moves from one valid state to another. Rules (constraints like `balance >= 0`) are never broken after a commit.
- **I - Isolation**: transactions running at the same time do not see each other's half-done work. It looks as if they ran one after another (how strictly this holds depends on the isolation level, below).
- **D - Durability**: once the database says "committed", the data survives a crash or power cut. It is written to disk (usually to a log first).

Analogy: a UPI payment. You never see "money left my account but never reached the shop" as a final state. Either it completes, or it is reversed.

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE accounts (id TEXT PRIMARY KEY, balance INT CHECK (balance >= 0))")
db.executemany("INSERT INTO accounts VALUES (?, ?)", [("asha", 300), ("ravi", 100)])
db.commit()
try:
    with db:  # opens a transaction; commits on success, rolls back on error
        db.execute("UPDATE accounts SET balance = balance + 500 WHERE id = 'ravi'")
        db.execute("UPDATE accounts SET balance = balance - 500 WHERE id = 'asha'")
except sqlite3.IntegrityError:
    print("transfer failed, rolled back")
print(db.execute("SELECT * FROM accounts").fetchall())
# Expected output:
# transfer failed, rolled back
# [('asha', 300), ('ravi', 100)]   <- Ravi did NOT keep the extra 500
```

## Isolation levels and anomalies

Full isolation is expensive, because it means transactions must often wait for each other. So databases offer **isolation levels**: weaker levels are faster but allow some strange effects, called **anomalies**.

The main anomalies:

- **Dirty read**: you read data that another transaction has changed but **not yet committed**. If that transaction rolls back, you used data that never really existed.
- **Non-repeatable read**: you read the same row twice in one transaction and get **different values**, because someone else committed a change in between.
- **Phantom read**: you run the same query twice (for example "all orders over Rs 1000") and **new rows appear**, because someone inserted them in between.
- **Lost update**: two transactions read the same value, both change it, and the second write **overwrites** the first. Example: two people book the last seat on a train at the same moment; both read "1 seat left", both write "0 seats left", and two tickets are sold for one seat.

The standard SQL isolation levels:

| Level | Dirty read | Non-repeatable read | Phantom read |
|-------|-----------|---------------------|--------------|
| Read Uncommitted | Possible | Possible | Possible |
| Read Committed | Prevented | Possible | Possible |
| Repeatable Read | Prevented | Prevented | Possible (in the standard) |
| Serializable | Prevented | Prevented | Prevented |

Real databases differ in the details. For example, PostgreSQL's default is Read Committed, and MySQL's InnoDB default is Repeatable Read. Always check the documentation of the database you test.

How do you prevent the lost update for the train seat?

- Do it in **one atomic statement**: `UPDATE trains SET seats = seats - 1 WHERE id = 7 AND seats > 0;` and check that one row was updated.
- Or **lock the row** while reading: `SELECT ... FOR UPDATE`.
- Or use **optimistic locking**: keep a `version` column; update only `WHERE version = 5`, and if zero rows change, someone else won, so retry.
- Or use the **Serializable** level and retry when the database reports a conflict.

## Normalisation basics

**Normalisation** means designing tables so that each fact is stored **in only one place**.

Bad design: store the customer's city in every order row. If Asha moves from Pune to Mumbai, you must update 200 order rows. If you miss one, the data now disagrees with itself. This is called an **update anomaly**.

Good design: store the city once in `customers`, and let `orders` point to the customer with a foreign key.

The common normal forms, in simple words:

- **1NF (First Normal Form)**: each cell has one value. No lists like `"phone1, phone2"` in one cell.
- **2NF**: every non-key column depends on the **whole** primary key, not just part of it.
- **3NF**: non-key columns depend **only** on the key, not on other non-key columns. (City depends on the customer, not on the order.)

**Denormalisation** is the opposite: copying data on purpose to make reads faster and avoid expensive joins. Large systems often denormalise for speed, and accept that they must keep the copies in sync. It is a trade-off, not a mistake.

## Beyond tables: NoSQL families

Relational databases are excellent, but not perfect for every job. "**NoSQL**" is a loose name for databases that do not use the classic table model. There are four main families.

### Key-value stores

Data is a giant dictionary: a **key** maps to a **value**. You can get, put and delete by key, and that is mostly all.

- Example: `session:abc123 -> {"user_id": 42}`.
- Very fast and simple. Used for caches, sessions, and counters.
- Examples: Redis, Memcached, Amazon DynamoDB (which also supports more).

### Document stores

Each record is a **document**, usually JSON-like, and documents in the same collection can have different fields.

```
{"_id": "order_7", "customer": {"name": "Asha", "city": "Pune"},
 "items": [{"sku": "DOSA-01", "qty": 2}], "status": "PAID"}
```

- Good when data is naturally nested and read together (a product catalogue, a user profile).
- Flexible schema, but joins across documents are weaker.
- Examples: MongoDB, Firestore.

### Wide-column stores

Data is grouped by a **row key**, and each row can have a huge, flexible set of columns. Data is stored and sorted by the row key, which makes it very good for massive write volumes and time-series data.

- Good for logs, metrics, sensor data, and messages by user and time.
- Examples: Apache Cassandra, Apache HBase, and Google Cloud Bigtable. Google's original Bigtable design is described in the public 2006 paper "Bigtable: A Distributed Storage System for Structured Data".

### Graph databases

Data is stored as **nodes** (things) and **edges** (relationships). Questions like "friends of friends who live in Pune" are natural and fast.

- Good for social networks, recommendations, fraud detection (which accounts are linked).
- Examples: Neo4j, Amazon Neptune.

## Replication basics

**Replication** means keeping **copies** of the same data on several machines. Why?

- **Availability**: if one machine dies, another can take over.
- **Read scaling**: many copies can serve many reads.
- **Lower latency**: a copy can sit near users in another region.

The most common setup is **leader-follower** (also called primary-replica):

```
             writes
   App  ---------------->  Leader (primary)
    |                         |   copies changes
    |       reads             v
    +--------------->  Follower 1   Follower 2   (read replicas)
```

- All **writes** go to the leader.
- The leader sends changes to the followers.
- **Reads** can go to the leader or to followers.

**Synchronous replication**: the leader waits until followers confirm before saying "committed". Safer, but slower.

**Asynchronous replication**: the leader confirms immediately and sends changes later. Faster, but followers can be **behind**. This delay is called **replication lag**.

Replication lag causes a famous bug: you update your profile picture, the page reloads, and you still see the old picture, because the read went to a follower that has not caught up. A common fix is **read-your-own-writes**: send a user's reads to the leader for a short time after they write.

What happens when copies disagree, and how distributed databases choose between consistency and availability, is covered in the later lessons on replication and the CAP theorem. Splitting data across machines (sharding) also has its own lesson.

## When to choose what

| Need | Good first choice | Why |
|------|-------------------|-----|
| Money, orders, bookings, anything needing transactions | Relational (PostgreSQL, MySQL, Spanner) | ACID, constraints, joins |
| Sessions, cache, counters, rate limits | Key-value (Redis) | Very fast lookups by key |
| Flexible, nested records read as a whole | Document (MongoDB, Firestore) | Schema flexibility, one read per object |
| Huge write volume, time-series, logs | Wide-column (Cassandra, Bigtable) | Scales writes across many machines |
| Relationship-heavy queries | Graph (Neo4j) | Fast traversal of connections |

In interviews, a safe default is: **start with a relational database unless you have a clear reason not to**, then explain the reason when you switch. Many real systems use several databases together, each for the job it does best.

## Tester's corner

- **Test constraints directly.** Try to insert duplicates, nulls and negative amounts through the API. If they get in, the database is missing a constraint, and application code alone is protecting the data.
- **Test concurrency, not just correctness.** Fire two requests to book the last seat or redeem the same coupon at the same time. Lost updates only show up under parallel load.
- **Look for SQL injection.** Put `' OR '1'='1` and similar values into search and filter fields. Errors or extra data mean the query is built unsafely.
- **Watch for slow queries as data grows.** A page that is fast with 100 test rows can be slow with 10 million. Seed realistic data volumes and use `EXPLAIN` with developers to check index use.
- **Replication lag causes "flaky" reads.** A test that writes and then immediately reads may sometimes fail if reads go to a replica. Know the read path before calling a test flaky.
- **Keep test data isolated.** Use transactions that roll back after each test, or unique IDs per test run, so tests do not depend on each other's data.

## Key takeaways

- A relational database stores data in **tables** of rows and columns; a **primary key** identifies a row, and a **foreign key** links to another table.
- **SQL** uses SELECT/WHERE to filter, **JOIN** to combine tables, and **GROUP BY** with HAVING to summarise.
- **Indexes** (usually B-trees) turn full scans into fast O(log n) lookups, but slow down writes.
- A **transaction** is all-or-nothing; **ACID** means atomicity, consistency, isolation and durability.
- Weaker **isolation levels** allow anomalies like dirty reads, non-repeatable reads, phantoms and lost updates.
- **Normalisation** stores each fact once; **denormalisation** copies data on purpose for faster reads.
- NoSQL families are **key-value, document, wide-column and graph**, each good for different access patterns.
- **Replication** copies data for availability and read scaling; asynchronous replication causes **replication lag**.

## Quiz

1. What is a foreign key?
   A) A key used for encryption  B) A column that points to the primary key of another table  C) The first column of any table  D) A key stored in a different database
2. True or false: `WHERE` filters groups after `GROUP BY`, and `HAVING` filters rows before it.
3. Which JOIN would you use to list all customers, including those with no orders?
   A) INNER JOIN  B) LEFT JOIN with customers on the left  C) No join is possible  D) GROUP BY
4. Why can adding many indexes make a table slower?
5. In a bank transfer, which ACID property guarantees that money is never debited without being credited?
   A) Atomicity  B) Consistency  C) Isolation  D) Durability
6. Two users book the last train seat at the same instant and both get a ticket. What is this anomaly called?
7. Which store fits a user session cache best?
   A) Graph database  B) Key-value store  C) Wide-column store  D) A spreadsheet
8. True or false: With asynchronous replication, a read from a follower can return old data.
9. What would you do? An API test creates a user and then immediately fetches it, and it fails with 404 about 3% of the time.
10. What would you do? The orders page is fast in the test environment but takes 8 seconds in production.

## Answer key

1. **B** - A foreign key references another table's primary key and keeps the link valid (referential integrity).
2. **False** - It is the other way round: WHERE filters rows before grouping; HAVING filters groups after.
3. **B** - A LEFT JOIN keeps every customer, with NULL order columns for customers who have no orders.
4. **Every write updates every index** - Each insert, update and delete must also change all indexes, which adds work and storage.
5. **A** - Atomicity means both updates happen or neither does.
6. **Lost update** - Both read "1 seat", both write "0", and one write overwrites the other. Fix it with an atomic conditional update, row locks or optimistic locking.
7. **B** - Sessions are looked up by a single key, very often, so a fast key-value store like Redis fits well.
8. **True** - The follower may not have received the latest changes yet; this is replication lag.
9. **Suspect replication lag** - Check whether reads go to a replica. Confirm by logging which database served the read, and discuss read-your-own-writes with the developers instead of just adding a retry or sleep in the test.
10. **Suspect data volume and indexes** - Production has much more data. Seed a realistic volume in a test environment, use EXPLAIN to check for full table scans, and suggest an index on the filtered or sorted columns. Add a performance test with large data.

## Flashcards

- **Q:** What is a primary key? — **A:** A column (or set of columns) that uniquely identifies each row and cannot be null.
- **Q:** What is a foreign key? — **A:** A column that points to another table's primary key, enforcing a valid link.
- **Q:** INNER JOIN vs LEFT JOIN? — **A:** INNER keeps only matching rows; LEFT keeps all left rows and fills missing right values with NULL.
- **Q:** WHERE vs HAVING? — **A:** WHERE filters rows before grouping; HAVING filters groups after GROUP BY.
- **Q:** Why are B-tree indexes fast? — **A:** They are sorted, wide and short trees, so a lookup needs only a few steps (O(log n)).
- **Q:** What is the cost of an index? — **A:** Slower writes and extra storage, because every index must be updated.
- **Q:** What does ACID stand for? — **A:** Atomicity, Consistency, Isolation, Durability.
- **Q:** What is a dirty read? — **A:** Reading another transaction's changes before they are committed.
- **Q:** What is a lost update? — **A:** Two transactions read the same value and the second write silently overwrites the first.
- **Q:** What is normalisation? — **A:** Designing tables so each fact is stored only once, avoiding update anomalies.
- **Q:** Name the four NoSQL families. — **A:** Key-value, document, wide-column and graph.
- **Q:** What is replication lag? — **A:** The delay before a follower copy receives changes from the leader, causing stale reads.

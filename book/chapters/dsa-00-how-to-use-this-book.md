# How to Use This Book

> **In this chapter:**
> - Understand how the three volumes of this book fit together
> - Learn how to study with the web app and with Google NotebookLM
> - Follow a clear 12-week plan from October 5 to December 27, 2026
> - Use spaced repetition so you remember what you learn
> - Build habits that stop you from giving up halfway
>
> **Time:** ~20 minutes  |  **Level:** Zero

## Welcome

You are a test engineer with more than five years of real work. You know Selenium, Playwright, API testing and Python. That is a strong base. What you do not have yet is practice with **DSA** (Data Structures and Algorithms) and **system design**. This book is built to close that gap, step by step, from zero.

Think of this book like a railway journey from your city to a far station. You do not need to see the whole track on day one. You only need to know the next station, and you need to keep the train moving every day.

## How the book is organised

The book has three volumes. Each volume is a group of chapters on one big subject.

| Volume | Subject | What you get |
|---|---|---|
| Volume 1 | DSA (Data Structures and Algorithms) | Python basics, a problem-solving method, all core patterns, testing your own code, expert extras, and a mock interview playbook |
| Volume 2 | System Design | How large systems are built: load balancers, caches, databases, queues, and how to talk through a design |
| Volume 3 | Test Engineering | Test strategy, test design techniques, automation architecture, flaky tests, and testing at scale |

There is also a short bonus book, **Volume 4: English for technical interviews**. It has 22 grammar lessons with quizzes, an interview phrase bank and speaking prompts. It is not part of the three main subjects, so the counts in this chapter still say "three volumes".

Chapter files are named by volume. For example, `dsa-03-...` is chapter 3 of the DSA volume. Chapters 00 to 03 are the foundation. Chapters 30 to 32 are the finishing chapters: testing your own code, expert topics, and mock interviews.

### The shape of every chapter

Every chapter follows the same shape, so you always know where you are:

1. **In this chapter** - the learning goals.
2. **Body sections** - the teaching, with analogies and short Python examples.
3. **Tester's corner** - how the topic connects to your QA work.
4. **Key takeaways** - the short summary.
5. **Quiz** - ten questions to check yourself.
6. **Answer key** - answers with short explanations.
7. **Flashcards** - question and answer pairs for revision.

A good habit: read the Key takeaways first, then the body, then do the Quiz without looking back.

## How to study with the web app

The companion web app is at https://sahil804-ps.github.io/google-prep/. It holds lessons, problem lists and progress tracking. Use the book and the app together:

- **The book** explains ideas in depth. Read it when you meet a new topic.
- **The web app** is for daily practice. Open it to pick your problems for the day and to mark them done.
- When the app shows a problem you cannot solve, come back to the chapter for that pattern and read the worked example again.

Some topics, such as Big-O, recursion, sorting, prefix sums and the Python toolkit, are taught as lessons inside the app. This book does not repeat them in full; it points to them.

## How to study with NotebookLM

Google NotebookLM is a tool where you upload documents and then ask questions about them. It answers only from your documents, which makes it a good study partner.

Here is a simple way to use it:

1. Create one notebook per volume (for example "DSA Volume").
2. Upload the chapter files for that volume as sources.
3. Generate an **audio overview** of the chapter you are reading this week. Listen during your commute or while walking.
4. Ask NotebookLM to make a **quiz** or **flashcards** from a chapter, and answer them without looking.
5. When something is unclear, ask a direct question, such as "Explain the sliding window pattern with a cricket example."

Audio is great for revision, but it does not replace solving problems by hand. Listening to a cricket commentary does not make you a batsman. You still need to go to the nets.

## The 12-week plan

The plan runs from **Monday, October 5, 2026** to **Sunday, December 27, 2026**. That is 12 weeks.

### Your daily time budget

| Block | Time | What you do |
|---|---|---|
| DSA | 75 minutes | Read one pattern or solve 2-3 problems |
| System design | 45 minutes | Read one design topic or practise one design question aloud |
| English | 30 minutes | Speak your solutions aloud, record yourself, read one technical article |

That is 2.5 hours a day. If a work day is very heavy, do the **minimum day**: 30 minutes of DSA (one problem) and 10 minutes of English. A minimum day still keeps the chain alive.

### Sundays: weekly test

Every Sunday is test day. Do this:

- Pick 3 problems from this week's topics that you have not seen before.
- Set a timer for 45 minutes per problem.
- Solve them as if in an interview: talk aloud, write tests, state complexity.
- Score yourself with the rubric in the mock interview chapter (dsa-32).
- Write your mistakes in your mistakes log.

### Week by week

| Week | Dates | DSA focus | Design focus |
|---|---|---|---|
| 1 | Oct 5 - Oct 11 | Python for DSA, framework, Big-O | What system design is, client-server basics |
| 2 | Oct 12 - Oct 18 | Arrays, hashing, two pointers | Networking basics, APIs |
| 3 | Oct 19 - Oct 25 | Sliding window, stack | Databases: SQL vs NoSQL |
| 4 | Oct 26 - Nov 1 | Binary search, linked lists | Caching |
| 5 | Nov 2 - Nov 8 | Trees | Load balancing, scaling |
| 6 | Nov 9 - Nov 15 | Tries, heaps | Queues and async processing |
| 7 | Nov 16 - Nov 22 | Backtracking | Consistency and replication |
| 8 | Nov 23 - Nov 29 | Graphs | Design practice: URL shortener, rate limiter |
| 9 | Nov 30 - Dec 6 | Dynamic programming 1-D | Design practice: chat, feed |
| 10 | Dec 7 - Dec 13 | Dynamic programming 2-D, greedy, intervals | Test engineering volume: strategy and test design |
| 11 | Dec 14 - Dec 20 | Expert extras, testing your own code, revision | Testing at scale, flaky tests |
| 12 | Dec 21 - Dec 27 | Full mock interviews | Full mock design rounds |

**Week 12 is mock week.** Do one full mock every day: a 45-minute coding round, and on alternate days a 45-minute design round. Use the playbook in chapter dsa-32. Ask a friend or colleague to act as interviewer if you can. If not, record yourself on video and review it.

## Spaced repetition

**Spaced repetition** means you review a thing again just before you forget it. Each review pushes the "forget date" further away.

Think of a UPI PIN. The first week after you set it, you might forget it. After using it many times over a few weeks, it stays for years. Repetition at growing gaps is what made it stick.

Use this schedule for every problem you solve:

| Review | When | What you do |
|---|---|---|
| 1 | Day 1 (same day) | Solve it |
| 2 | Day 3 | Re-code from memory, no hints |
| 3 | Day 7 | Re-code from memory, time yourself |
| 4 | Day 14 | Explain the approach aloud in 2 minutes |
| 5 | Day 30 | Re-code once more |

A simple spreadsheet is enough. Make columns for problem name, pattern, date solved, and the next review date. Each morning, do the reviews that are due before new problems.

## How not to give up

Most people who prepare for big interviews do not fail because the topics are too hard. They stop. Here is how you keep going.

- **Expect to feel slow.** In weeks 1-4 you may take an hour on an "easy" problem. That is normal. Speed comes from patterns, and patterns come from repetition.
- **Never break the chain twice.** Missing one day is fine. Missing two days in a row is how habits die. After a missed day, do at least a minimum day.
- **Measure inputs, not feelings.** Track minutes studied and problems solved. Your mood will go up and down; your tracker will show real progress.
- **Use the 15-20 minute rule.** If you are stuck for 15-20 minutes with no new idea, look at a hint. Struggling for two hours teaches less than learning the pattern and re-coding it later (more in chapter dsa-03).
- **Celebrate small wins.** Your first medium problem solved alone is a big moment. Note it.
- **Remember your edge.** You already think about edge cases and failures every day at work. That skill is exactly what Google interviewers look for when you test your own code.

## Tester's corner

- Treat this plan like a test plan: it has scope (topics), schedule (weeks), entry criteria (basics done) and exit criteria (mock scores).
- Your mistakes log is like a bug tracker. Each mistake gets a short title, a root cause, and a fix.
- Sunday tests are your regression suite. They check that old skills still work after you learn new ones.
- Spaced repetition is like running a smoke test on old features at growing intervals.
- Track metrics (problems solved, mock scores) the same way you track pass rates in a test report.

## Key takeaways

- The book has three volumes: DSA, System Design and Test Engineering.
- Every chapter has goals, body, Tester's corner, takeaways, quiz, answer key and flashcards.
- Use the web app for daily practice and NotebookLM for audio, quizzes and questions.
- The plan runs October 5 to December 27, 2026: 75 minutes DSA, 45 minutes design, 30 minutes English per day.
- Sundays are weekly tests; week 12 is full mock interviews.
- Review each problem on days 1, 3, 7, 14 and 30.
- On bad days, do a minimum day so the chain never breaks twice.

## Quiz

1. How many volumes does this book have, and what are they?
2. What is the daily DSA time in the plan? A) 30 minutes B) 45 minutes C) 75 minutes D) 120 minutes
3. True or false: NotebookLM answers questions using only the documents you upload.
4. What should you do on Sundays during the plan?
5. Which week is dedicated to full mock interviews? A) Week 1 B) Week 6 C) Week 10 D) Week 12
6. On which days do you review a problem in the spaced repetition schedule?
7. True or false: Listening to audio overviews is enough to learn DSA.
8. What is a "minimum day"?
9. You are stuck on a problem for 20 minutes with no new idea. What would you do?
10. Which section in each chapter connects the topic to QA work? A) Key takeaways B) Tester's corner C) Flashcards D) Answer key

## Answer key

1. **Three** - Volume 1 DSA, Volume 2 System Design, Volume 3 Test Engineering.
2. **C** - The plan gives 75 minutes a day to DSA, 45 to design and 30 to English.
3. **True** - NotebookLM grounds its answers in your uploaded sources, which is why the chapters must be self-contained.
4. **A weekly test** - Solve 3 unseen problems, 45 minutes each, in interview style, then score yourself and log mistakes.
5. **D** - Week 12 (December 21-27) is mock week.
6. **Days 1, 3, 7, 14 and 30** - Each review comes just before you would forget.
7. **False** - Audio helps revision, but you must solve problems by hand to build the skill.
8. **A short fallback day** - 30 minutes of DSA (one problem) and 10 minutes of English, so the habit chain stays alive on busy days.
9. **Take a hint** - Use the 15-20 minute rule: look at a hint or the approach, then re-code it later from memory.
10. **B** - Tester's corner links each topic to testing and QA work.

## Flashcards

- **Q:** What are the three volumes of this book? — **A:** DSA, System Design, and Test Engineering.
- **Q:** What are the plan's start and end dates? — **A:** October 5, 2026 to December 27, 2026 (12 weeks).
- **Q:** What is the daily time split? — **A:** 75 minutes DSA, 45 minutes system design, 30 minutes English.
- **Q:** What happens every Sunday? — **A:** A weekly test of 3 unseen problems in interview style, scored with a rubric.
- **Q:** What is week 12 for? — **A:** Full mock interviews every day, using the mock interview playbook.
- **Q:** What is spaced repetition? — **A:** Reviewing material at growing gaps, just before you would forget it.
- **Q:** What is the review schedule for a problem? — **A:** Days 1, 3, 7, 14 and 30.
- **Q:** What is the rule for missed days? — **A:** Missing one day is fine; never miss two days in a row.
- **Q:** What is the 15-20 minute rule? — **A:** If stuck that long with no new idea, take a hint, then re-code from memory later.
- **Q:** How should you use NotebookLM? — **A:** Upload chapters, generate audio overviews, make quizzes and flashcards, and ask questions.

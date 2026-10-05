# The Mock Interview Playbook

> **In this chapter:**
> - Run a 45-minute coding round minute by minute, with English phrases for each step
> - Recover when you are stuck and take hints gracefully
> - Handle nerves before and during the interview
> - Follow a final two-week revision plan and a day-of-interview checklist
> - Score your own mock interviews with a clear rubric
>
> **Time:** ~40 minutes  |  **Level:** Intermediate

## Why a playbook

In cricket, a good team does not invent its plan on match day. It has a plan for the powerplay, the middle overs and the death overs, and players have practised each phase in the nets. A coding interview is the same. You already know the framework from chapter dsa-03. This chapter turns it into a **script** for a real 45-minute round, so that under pressure your mouth and hands know what to do.

Practise this playbook in every Sunday test and every day of week 12 (December 21-27, 2026).

## The 45-minute round, minute by minute

The timings below are a guide. Interviewers differ; some spend longer on introductions or add a follow-up question. The order matters more than the exact minutes.

| Minutes | Phase | Your goal |
|---|---|---|
| 0-3 | Introductions | Calm, friendly start |
| 3-8 | Understand and clarify | Restate, examples, 3-5 questions |
| 8-15 | Approaches | Brute force, then optimised idea, agree on plan |
| 15-30 | Code | Clean, narrated code |
| 30-38 | Test and fix | Dry run, edge cases, fix bugs |
| 38-41 | Complexity and follow-ups | State Big-O, discuss improvements |
| 41-45 | Your questions | Ask 1-2 genuine questions |

### Minutes 0-3: Introductions

Keep your introduction to 30-45 seconds. Do not tell your whole career story.

> "Hi, I'm Sahil. I'm an SDET with about five and a half years of experience, mostly in test automation with Playwright, Selenium and Python, and API testing. Recently I've worked on testing blockchain applications. I'm excited to be here."

If the interviewer introduces themselves, listen and say thank you. A small smile helps you and them relax.

### Minutes 3-8: Understand and clarify

Read the problem fully. Do not start talking about solutions in the first ten seconds.

Phrases to use:

- "Let me restate the problem to make sure I understand. We get ..., and we need to return ..."
- "Let me try this small example by hand. For [2, 7, 11, 15] and target 9, the answer is indices 0 and 1."
- "A few clarifying questions. Can the input be empty? Can there be duplicates? Can values be negative?"
- "How large can the input be? That will help me choose the approach."
- "If there are multiple valid answers, can I return any of them?"
- "Can I assume the input is valid, or should I handle invalid input?"

Write the agreed answers as short comments at the top of the document. This becomes your contract and your test list later.

```python
# Input: list of ints, may be empty, may have negatives and duplicates
# Output: indices of two numbers summing to target, or [] if none
# n up to 10^5 -> aim for O(n) or O(n log n)
```

### Minutes 8-15: Approaches

First state the brute force, then improve it. Then agree on the plan before coding.

- "The straightforward approach is to check every pair. That is O(n²) time and O(1) space."
- "We can do better. For each number, I need to know quickly whether its partner exists. A hash map gives O(1) lookups, so the whole thing becomes O(n) time and O(n) space."
- "Another option is sorting with two pointers, which is O(n log n), but it loses the original indices, so I prefer the hash map."
- "Here's my plan in comments. Does this approach sound good to you before I start coding?"

The last question is very important. If the interviewer has a concern, it is much cheaper to hear it now than after you have written 25 lines.

### Minutes 15-30: Code

Code steadily. Talk, but less than before. Explain decisions, not every keystroke.

- "I'll use a dictionary called `seen` that maps a value to its index."
- "I'm checking for the partner before inserting the current number, so I don't pair a number with itself."
- "I'll write a small helper for the neighbour check to keep the main loop clean."
- "I'm not sure about the exact name of this method; I'll write it as `popleft` from `collections.deque`, which I believe is correct."

Good habits while coding:

- Use clear names: `left`, `right`, `seen`, `count`, not `a`, `b`, `x2`.
- Keep functions short. Use a helper if logic repeats.
- If you notice a bug while coding, say so and fix it: "Wait, this should be `<=`, because the window can end at the last index."
- Leave a small `# TODO: handle empty input` if you want to come back, and say it aloud so you do not forget.

### Minutes 30-38: Test and fix

Never say "Done" right after the last line. Say:

- "Now let me test it. First I'll trace the example."
- "i is 0, num is 2, need is 7, not in seen, so seen becomes {2: 0}. i is 1, num is 7, need is 2, which is in seen, so I return [0, 1]. Correct."
- "Now edge cases: an empty list returns [] because the loop never runs. Duplicates like [3, 3] with target 6: at i = 1, need is 3, seen has 3 at index 0, so [0, 1]. Correct."
- "I see a bug here: for a single-element input, this line reads index 1, which is out of range. Let me fix it."

Chapter dsa-30 covers this phase in detail. As a test engineer, this is where you can clearly beat other candidates.

### Minutes 38-41: Complexity and follow-ups

- "Time complexity is O(n), since each element is visited once and dictionary operations are O(1) on average."
- "Space complexity is O(n) for the dictionary in the worst case."
- "If memory were very limited, I could sort and use two pointers for O(1) extra space, but then I'd need to keep track of original indices."
- "If the data came as a stream, I'd keep the dictionary and check each new number as it arrives."

If the interviewer asks a follow-up, treat it like a mini-problem: clarify, propose, and code only if asked.

### Minutes 41-45: Your questions

Always have two questions ready. Good questions are genuine and specific:

- "What does a typical week look like for a test engineer on your team?"
- "How does your team decide what to test with unit tests versus integration or end-to-end tests?"
- "What is one challenge your team is working on in test infrastructure right now?"
- "What do you enjoy most about working at Google?"

Avoid questions about your performance in this interview, and avoid salary questions here; those are for the recruiter.

## How to recover when stuck

Getting stuck is normal. Interviewers often care more about **how you behave when stuck** than about whether you get stuck. Think of a delivery rider whose route is blocked: a good rider does not freeze; they try a side road and keep the customer informed.

### A recovery checklist

When you have had no progress for 2-3 minutes, go through these out loud:

1. **Go back to the example.** "Let me solve a slightly bigger example by hand and watch what I do." Your hands often find the algorithm before your head does.
2. **Simplify the problem.** "What if the array were sorted? What if there were only positive numbers? What if k were 1?" Solve the easier version, then extend it.
3. **Run through the pattern list.** "Could a hash map help? Two pointers? Sorting first? A heap? Binary search on the answer? BFS?" Use the cheat sheet from chapter dsa-03.
4. **Think about what is repeated** in the brute force and how to store it.
5. **Work backwards** from the output: "What would I need to know at the last step to produce the answer?"
6. **Fall back to brute force.** "I'll code the brute force first so we have a working solution, then optimise." A working O(n²) solution is far better than an unfinished O(n) one.

Phrases that keep the interviewer with you:

- "I'm a bit stuck on how to avoid recomputing this sum. Let me think aloud."
- "One idea is ..., but I see a problem with it: ..."
- "Let me try a different angle."

Never go silent for more than about 30 seconds. If you need to think quietly, say so: "Can I take thirty seconds to think about this?"

## How to take hints

Interviewers give hints to help you, and taking a hint well is a positive signal. Taking it badly (ignoring it, or arguing) is a negative one.

- **Listen fully.** Do not interrupt the hint.
- **Repeat it in your words:** "So you're suggesting I think about what the sorted order gives me?"
- **Connect it to the problem:** "If it's sorted, then duplicates are next to each other, so I can skip them with a pointer. That removes the need for a set."
- **Thank them briefly and move on:** "That helps, thank you." Do not apologise many times.
- **If you do not understand the hint,** ask: "Could you say a bit more about what you mean by that?"

A hint is like a fielder's signal from the boundary in cricket. Use it quickly and keep playing.

## Handling nerves

Being nervous is normal and even useful; it means you care. The goal is not zero nerves but steady nerves.

### Before the interview

- **Practise under realistic conditions.** Week 12 mocks with a timer, a plain editor, and speaking aloud make the real thing feel familiar.
- **Sleep well** the night before. A tired brain makes more off-by-one errors than a nervous one.
- **Prepare your setup** the day before: laptop charged, stable internet, quiet room, water, a notebook and pen.
- **Warm up** one hour before with one easy problem you have solved before. Do not try new hard problems that day.

### During the interview

- **Breathe slowly.** Breathe in for 4 counts, hold for 4, out for 6. Do it while reading the problem.
- **Slow down your speech.** Nervous people speak fast. Speaking slowly sounds confident and gives you thinking time.
- **Write things down.** Comments and examples in the document reduce the load on your memory.
- **Treat it as working together.** The interviewer is a future colleague solving a problem with you, not a judge.
- **One bad moment is not a bad interview.** If you make a mistake, fix it calmly and continue. Interviewers see the whole round.

## Final two weeks revision plan

Use this for the two weeks before your interview. If your interview is at the end of the 12-week plan, this matches weeks 11 and 12.

| Days | Focus | Daily work |
|---|---|---|
| 14-12 days before | Pattern review 1 | Arrays, hashing, two pointers, sliding window, stack: re-code 2 old problems per pattern from memory |
| 11-9 days before | Pattern review 2 | Binary search, linked lists, trees, tries, heaps |
| 8-6 days before | Pattern review 3 | Graphs, backtracking, DP, greedy, intervals |
| 5-3 days before | Full mocks | One 45-minute mock per day with a partner or recorded; score with the rubric |
| 2 days before | Weak spots | Read the mistakes log; redo the 5 problems you failed most often |
| 1 day before | Light review | Read the cheat sheets and flashcards; one easy warm-up problem; rest early |
| Interview day | Warm-up only | One easy familiar problem, then stop |

Rules for these two weeks:

- **No new topics** in the last 5 days. Deepen what you know.
- **Mix in system design and test design** for 30-45 minutes daily, using Volumes 2 and 3.
- **Practise your leadership and Googleyness stories** aloud twice a week.

## Day-of-interview checklist

**Night before**
- [ ] Laptop charged, charger near you
- [ ] Interview link, time and time zone confirmed (India is UTC+5:30)
- [ ] Camera and microphone tested
- [ ] Quiet room arranged; family informed
- [ ] Clothes ready; water bottle ready

**One hour before**
- [ ] One easy warm-up problem in a plain editor
- [ ] Read the framework steps and your top 3 mistakes from the log
- [ ] Close extra apps and notifications; silence your phone

**During each round**
- [ ] Restate the problem and work an example
- [ ] Ask 3-5 clarifying questions
- [ ] State brute force with complexity, then the better approach
- [ ] Get agreement on the plan before coding
- [ ] Narrate while coding
- [ ] Dry run and test edge cases before saying "done"
- [ ] State time and space complexity
- [ ] Ask your questions at the end

**After each round**
- [ ] Take two minutes to breathe and drink water
- [ ] Do not replay mistakes; the next round is a fresh start

## How to self-score a mock

After each mock, score yourself (or ask your mock partner to score you) using this rubric. Each area gets 1 to 4 points. Watch your recording if you have one; memory is too kind.

| Area | 1 - Weak | 2 - Mixed | 3 - Good | 4 - Strong |
|---|---|---|---|---|
| Understanding and clarifying | Started coding immediately | Asked one question | Restated and asked key questions | Restated, worked an example, asked all questions that matter |
| Problem solving | No working idea | Brute force only | Found optimal idea with help | Found optimal idea mostly alone, explained why |
| Coding | Did not finish or major errors | Finished with several bugs | Clean code, minor bugs | Clean, readable, near-runnable code |
| Testing | No testing | Traced the example only | Example plus some edge cases | Systematic, risk-based cases; found and fixed own bugs |
| Complexity | Not stated or wrong | Stated without reasons | Correct with reasons | Correct, with trade-offs and alternatives |
| Communication | Long silences | Talked sometimes | Clear most of the time | Clear, structured, took hints well |

**Total out of 24:**

- **20-24:** Interview-ready for this difficulty. Increase difficulty.
- **15-19:** Close. Focus on your lowest area for the next week.
- **Below 15:** Go back to pattern practice for the weak topic before the next mock.

Write the score, date, problem and lowest area in a tracker. Over weeks 11 and 12, you want to see the total rise and the lowest area change. If the same area stays lowest for three mocks, make it your only focus for two days.

## Tester's corner

- A mock interview is a rehearsal environment, like staging before production. Find your failures there.
- The rubric is a test report with six test areas. Track scores over time like pass rates over builds.
- Your mistakes log plus the "lowest area" column is a defect trend analysis: fix the most frequent root cause first.
- The day-of checklist is a pre-release checklist. Checklists prevent simple, avoidable failures under stress.
- In the testing phase of a round, use the vocabulary you know: boundary values, equivalence classes, negative tests, regression after a fix.
- Questions about how the team decides between unit, integration and end-to-end tests show genuine test-engineering interest.

## Key takeaways

- Follow the 45-minute flow: introduce, clarify, approaches, code, test, complexity, your questions.
- Always state the brute force, then the better approach, and get agreement before coding.
- When stuck: return to the example, simplify, scan the patterns, and fall back to a working brute force. Never go silent for long.
- Take hints by listening, repeating them in your words, connecting them to the problem, and moving on.
- Manage nerves with realistic practice, sleep, slow breathing and slow speech.
- In the last two weeks: review patterns, run daily mocks, fix weak spots, and learn no new topics in the final five days.
- Score every mock out of 24 across six areas and focus on your lowest area.

## Quiz

1. What should you do in the first minutes after reading the problem? A) Start coding B) Restate it, work an example and ask clarifying questions C) State the complexity D) Ask about salary
2. Why should you ask "Does this approach sound good?" before coding?
3. True or false: if you cannot find the optimal solution, it is better to code nothing than to code a brute force.
4. You have made no progress for three minutes. Name two things from the recovery checklist you would try.
5. The interviewer gives a hint you do not understand. What would you do?
6. Which is a good question to ask the interviewer at the end? A) "Did I pass?" B) "What is the salary?" C) "How does your team balance unit and end-to-end tests?" D) "Can I skip the next round?"
7. True or false: you should learn new advanced topics in the last five days before the interview.
8. How many areas are in the self-scoring rubric, and what is the maximum total?
9. You scored 2 in Testing in three mocks in a row. What would you do?
10. Which breathing pattern does this chapter suggest for nerves? A) In 1, out 1 B) In 4, hold 4, out 6 C) Hold for 30 seconds D) No breathing technique

## Answer key

1. **B** - Restating, working an example and clarifying prevents solving the wrong problem.
2. **Early correction** - The interviewer can flag problems before you spend 15 minutes coding the wrong idea.
3. **False** - A working brute force is much better than an unfinished optimal solution; you can optimise afterwards.
4. **Any two** - Return to the example, simplify the problem, scan the pattern list, look for repeated work, work backwards, or code the brute force.
5. **Ask politely** - Say "Could you say a bit more about what you mean?", then repeat it in your words and connect it to the problem.
6. **C** - It is genuine and specific to the role; performance and salary questions are not for this moment.
7. **False** - The last five days are for deepening known patterns, mocks and rest, not new topics.
8. **Six areas, 24 points** - Understanding, problem solving, coding, testing, complexity and communication, each scored 1-4.
9. **Focus on it** - Make testing your only focus for two days: practise dry runs and edge-case categories from chapter dsa-30, then re-test in a mock.
10. **B** - Breathe in for 4 counts, hold for 4, out for 6.

## Flashcards

- **Q:** What are the phases of a 45-minute coding round? — **A:** Introductions, clarify, approaches, code, test, complexity and follow-ups, your questions.
- **Q:** How long should your self-introduction be? — **A:** About 30-45 seconds.
- **Q:** What should you say before starting to code? — **A:** "Here's my plan. Does this approach sound good to you?"
- **Q:** What is the first move when stuck? — **A:** Go back to the example and solve a slightly bigger one by hand.
- **Q:** What is the fallback when no optimal idea comes? — **A:** Code the brute force first, then optimise.
- **Q:** How do you take a hint well? — **A:** Listen fully, repeat it in your words, connect it to the problem, thank them and move on.
- **Q:** What is the longest you should stay silent? — **A:** About 30 seconds; ask for thinking time if you need more.
- **Q:** What do you do in the last five days before the interview? — **A:** No new topics: mocks, weak spots from the mistakes log, light review and rest.
- **Q:** What are the six rubric areas? — **A:** Understanding, problem solving, coding, testing, complexity, communication.
- **Q:** What total score means interview-ready? — **A:** 20-24 out of 24.
- **Q:** What breathing pattern helps with nerves? — **A:** In for 4, hold for 4, out for 6.

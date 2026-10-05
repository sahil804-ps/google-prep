# Googleyness and Behavioural Interviews

> **In this chapter:**
> - Understand what Google has publicly said it looks for: general cognitive ability, role-related knowledge, leadership and Googleyness
> - Answer behavioural questions with the STAR method, keeping the focus on what *you* did
> - Prepare structured answers for 10 common questions
> - Fill in a personal STAR story bank, including your qaforge-mcp and AI-QA-Script stories
> - Avoid the red flags that sink otherwise strong candidates
>
> **Time:** ~50 minutes  |  **Level:** Beginner

Many engineers spend 95% of their preparation on coding and 5% on behavioural questions. That is a mistake. A weak behavioural round can block an offer even when the technical rounds go well. The good news: behavioural answers are the most *preparable* part of the interview. You already have 5.5 years of real stories. This chapter helps you shape them.

## What Google says it looks for

In its official "How We Hire at Google" video on YouTube ([youtube.com/watch?v=zhUgaKb0s5A](https://www.youtube.com/watch?v=zhUgaKb0s5A)) and on its careers site ([google.com/about/careers/applications/how-we-hire](https://www.google.com/about/careers/applications/how-we-hire/)), Google describes **four attributes** it looks for:

1. **General cognitive ability** – how you learn and solve hard problems in real life. Not grades or test scores.
2. **Role-related knowledge** – the experience, background and skills for the specific role. For you: testing, automation, test infrastructure, coding.
3. **Leadership** – not job titles. The video mentions things like being a team player and navigating challenges to make an impact. Former Google people-operations head Laszlo Bock described this publicly as **"emergent leadership"**: stepping in to help solve a problem, and stepping back when someone else should lead (see his book *Work Rules!*, 2015).
4. **Googleyness** – the video says Google looks for signs of **comfort with ambiguity, bias to action, and a collaborative nature**. Other public descriptions add **intellectual humility** – being able to say "I was wrong, here's my new view" – and bringing a fresh perspective.

Google has also said publicly that it uses **structured interviews** (interviewers use consistent questions and rubrics) and that hiring decisions are reviewed by a **hiring committee**, not by one interviewer alone. Exact processes change over time and differ by role and country, so treat this as background, not a guarantee.

**Analogy:** Think of a cricket team selection. The selectors don't only look at batting average (role knowledge). They ask: does this player learn fast on new pitches (cognitive ability)? Do they step up when the captain is off the field (leadership)? Do they play for the team, accept feedback, and stay calm in a tight chase (Googleyness)?

### What Googleyness looks like in a test engineer's stories

| Trait | What it sounds like in your answer |
|---|---|
| Comfort with ambiguity | "The requirements were unclear, so I listed assumptions, confirmed the riskiest ones, and started with what we knew." |
| Bias to action | "Instead of waiting for a perfect plan, I built a small prototype in two days to test the idea." |
| Collaboration | "I paired with the developer to reproduce it, rather than throwing the bug over the wall." |
| Intellectual humility | "My first theory was wrong. The data showed it was a caching issue, so I changed direction." |
| User focus | "I pushed for the fix because it affected users on older Android phones, who are a big share of our users." |
| Doing the right thing | "I flagged the risk to the release manager even though it meant delaying my own feature." |

## The STAR method

**STAR** is a simple structure for telling a work story clearly:

- **S – Situation:** the context, in 1–2 sentences. Where, when, what product, what was at stake.
- **T – Task:** *your* responsibility or goal. What were *you* asked or expected to do?
- **A – Action:** what *you* did, step by step. This is the heart of the answer – about **60%** of your time.
- **R – Result:** the outcome, with numbers if possible, plus what you **learned**.

**Analogy:** STAR is like a good Swiggy order update: "Restaurant is preparing your order (S), rider assigned (T), rider picked up and is on the way via MG Road (A), delivered in 28 minutes (R)." Clear, ordered, and you always know what happened.

### Rules for great STAR answers

1. **Say "I", not "we", for your actions.** "We fixed the pipeline" hides your role. "I wrote the script that…" shows it. Use "we" for the team context.
2. **Keep it to about 2 minutes.** Practise with a timer. The interviewer will ask follow-ups if they want detail.
3. **Quantify the result.** "Reduced suite time from 3 hours to 40 minutes." "Flaky failures dropped from about 30 a week to 5." Only use numbers you can defend; "roughly" is fine if honest.
4. **Include the learning.** "What I learned was…" shows growth – very Googley.
5. **Be specific.** One real story with details beats a general description of "what I usually do".
6. **Prepare for follow-ups:** "What would you do differently?", "What did your manager think?", "How did you measure that?"

### A useful extension: STAR-L

Add **L – Learning** explicitly at the end. Google interviewers often ask "What did you learn?" anyway, so build it in.

## The 10 common questions and how to structure them

These match the behavioural prompts in your study app. For each: what the interviewer is really checking, and a structure.

### 1. "Tell me about yourself." (about 75 seconds)

**Checking:** communication, relevance, a clear story.

**Structure – Present → Past → Future:**
- *Present:* "I'm an SDET with 5.5 years of experience. Right now I [current role and main impact]."
- *Past:* two highlights – for example, blockchain app testing and building AI-based QA tools (qaforge-mcp, AI-QA-Script).
- *Future:* "I want to work on test infrastructure and quality at Google's scale, which is why this SWE-Test role excites me."

Do not recite your CV line by line.

### 2. "Why Google? Why a test / SDET role?"

**Checking:** genuine motivation, understanding of the role.

**Structure:** one reason about **scale and impact** (products used by billions), one about **engineering culture** (engineers own testing, strong test infrastructure – mention *Software Engineering at Google* which you have read), one about **you** (you enjoy building tools that make other engineers faster – that's exactly what you did with qaforge-mcp). Avoid "free food" or "brand name".

### 3. "Tell me about a time you found a critical bug late in a release."

**Checking:** judgment under pressure, communication, ownership, process improvement.

**Structure:** S – release date and stakes. T – you found it; your responsibility to raise it. A – how you confirmed severity quickly, who you told and how (facts, impact, options), how you helped with the fix or workaround. R – outcome (delayed, shipped with flag off, hotfix). **L – what you changed so the bug is caught earlier next time** (a new test at a lower level, a new check in CI). That last part is what makes it a great answer.

### 4. "Tell me about a disagreement with a developer or manager."

**Checking:** collaboration, respect, data over ego, ability to disagree and commit.

**Structure:** S – what the disagreement was about (keep it professional, not personal). T – your goal (good outcome for users, not winning). A – how you listened first, understood their view, brought data, proposed options, and agreed on a decision. R – outcome, and the relationship afterwards. **Never** make the other person look stupid.

### 5. "Tell me about a time you improved a process or tool for your team."

**Checking:** initiative, bias to action, leverage, measuring impact.

**Structure:** S – the pain (slow suite, flaky tests, manual regression). T – you decided to fix it (or were asked). A – how you measured the problem, built the solution, got adoption. R – numbers before and after; adoption by others.

### 6. "Tell me about a failure and what you learned."

**Checking:** honesty, humility, growth. This is a direct Googleyness check.

**Structure:** pick a **real** failure where *you* made a mistake (not "I work too hard"). S/T briefly. A – what you did wrong, and what you did when you realised. R – the impact. **L – the concrete change in how you work now.** Spend real time on the learning.

### 7. "Tell me about a time you had to learn something new quickly."

**Checking:** general cognitive ability, learning approach.

**Structure:** S – new technology or domain with a deadline (for example, blockchain testing or MCP). A – *how* you learned: official docs, small experiments, asking experts, building something small first. R – delivered on time; you then taught others.

### 8. "Tell me about a time you helped a teammate or mentored someone."

**Checking:** leadership without authority, generosity.

**Structure:** S – who and what they struggled with. A – how you helped (pairing, reviews, guides, letting them lead). R – their growth (they became independent, got promoted, wrote tests on their own).

### 9. "Tell me about a time you worked with unclear requirements."

**Checking:** comfort with ambiguity.

**Structure:** S – vague feature or spec. A – how you listed questions and assumptions, found the riskiest unknowns, confirmed them with the product owner, started testing the clear parts, documented decisions. R – shipped with fewer surprises; maybe the spec got better for everyone.

### 10. "Tell me about something you built that you are proud of."

**Checking:** depth, ownership, passion, technical judgment.

**Structure:** your **qaforge-mcp** or **AI-QA-Script** story. S – the problem that made you build it. T – your goal. A – key design decisions and *trade-offs* (why an MCP server? which 12 tools and why? how did you test it?). R – who uses it and what changed. L – what you would do differently. Be ready for deep technical follow-ups.

(Your app also has "a decision with incomplete data". Use the ambiguity structure, and stress how you limited risk – for example, a reversible decision with a flag, or a time-boxed experiment.)

## Worked example: a full STAR answer

**Question:** "Tell me about a disagreement with a developer."

*This is a sample to show shape and length. Replace every detail with your real story.*

> **Situation:** "In my previous project, we were two weeks from releasing a wallet feature in a blockchain app. I found that if a user double-tapped 'Send', two transactions were sometimes created."
>
> **Task:** "I was the QA owner for the feature, so it was my job to get this risk understood and resolved before release."
>
> **Action:** "The developer felt it was an edge case – 'nobody double-taps'. Instead of arguing, I first asked what would convince him. Then I did three things. One, I wrote a small automated test that reproduced it 7 times out of 10 on a slow network profile. Two, I pulled our analytics and showed that about [X]% of sessions had repeated taps on that button, mostly on low-end Android devices. Three, I suggested two options: disable the button after the first tap, which was quick, and an idempotency key on the API, which was the real fix. We agreed to do the quick fix for this release and the API fix in the next sprint, and I added both tests to our regression suite."
>
> **Result:** "We released on time with no duplicate-transaction complaints. The API fix landed the next sprint. The developer later asked me to review the idempotency design for another service, so the relationship actually got stronger."
>
> **Learning:** "I learned that data and options work better than opinions. Now when I raise a risky bug, I always bring a reproduction, the user impact, and at least one proposed fix."

Count the parts: Situation and Task are short; Action is the longest, full of "I"; Result has an outcome and a relationship signal; Learning is specific. That is the shape to copy.

## Your STAR story bank (fill in the blanks)

Prepare **8 stories**. One good story can answer several questions, so note which questions each one fits. Write them in your own words, then practise each out loud with a timer (target about 2 minutes).

### Story 1 – Bug found late
- **Situation:** In [project/company], [N] days before [release], I found [bug] in [feature].
- **Task:** I was responsible for [role]. The risk was [user impact].
- **Action:** I confirmed it by [how]. I told [who] with [evidence]. I proposed [options]. I helped by [what].
- **Result:** [Outcome: fix, delay, flag off]. [Number if any].
- **Learning / prevention:** I added [test/check] at [level] so it's caught in [stage] now.
- **Also fits:** pressure, communication, ownership.

### Story 2 – Conflict with a developer
- **Situation:** [Developer/manager] and I disagreed about [topic] in [project].
- **Task:** My goal was [user-focused outcome].
- **Action:** I listened to [their concern]. I gathered [data]. I proposed [options]. We agreed on [decision].
- **Result:** [Outcome] and [how the relationship was afterwards].
- **Learning:** [What you do differently now].
- **Also fits:** collaboration, influence without authority.

### Story 3 – Process improvement
- **Situation:** Our [suite/pipeline/process] took [time] / failed [often] / needed [manual effort].
- **Task:** I decided to [goal] (or: I was asked to).
- **Action:** I measured [baseline]. I built/changed [solution]. I got the team to adopt it by [how].
- **Result:** From [before] to [after]. [Who else uses it].
- **Learning:** [Lesson].
- **Also fits:** bias to action, leadership, tool building.

### Story 4 – Failure
- **Situation:** In [project], I [mistake you made].
- **Task:** I was responsible for [what].
- **Action:** When I realised, I [told someone / fixed / rolled back]. I took ownership by [what].
- **Result:** The impact was [honest impact].
- **Learning:** Since then I always [concrete change in behaviour].
- **Also fits:** humility, ownership.

### Story 5 – Learning fast
- **Situation:** I had to learn [technology/domain, for example blockchain testing or the Model Context Protocol] in [time] for [reason].
- **Task:** Deliver [what] by [when].
- **Action:** I [read official docs / built a small prototype / asked experts / made a checklist].
- **Result:** Delivered [what]. Then I [taught others / wrote a guide].
- **Learning:** My method for learning new things is [your method].
- **Also fits:** general cognitive ability, ambiguity.

### Story 6 – Mentoring
- **Situation:** [Teammate/junior] was struggling with [skill, for example writing stable automation].
- **Task:** I wanted to help them become independent.
- **Action:** I [paired with them / reviewed their code with explanations / created examples / let them lead a task].
- **Result:** They [improvement – for example their tests stopped flaking, they ran a release alone].
- **Learning:** [What mentoring taught you].
- **Also fits:** leadership, collaboration.

### Story 7 – Ambiguity
- **Situation:** We had to test [feature] with [unclear/missing requirements].
- **Task:** Make sure we tested the right things anyway.
- **Action:** I listed [questions and assumptions]. I identified the riskiest unknowns: [which]. I confirmed them with [who]. I started with [clear parts]. I documented [decisions].
- **Result:** [Outcome – fewer surprises, spec improved].
- **Learning:** [Lesson].
- **Also fits:** decision with incomplete data, communication.

### Story 8 – Built a tool (qaforge-mcp / AI-QA-Script)
- **Situation:** In my QA work, I saw that [pain – for example generating test cases, finding flaky tests, writing bug reports, running accessibility checks] took [time] and was inconsistent.
- **Task:** I wanted to [goal] for [me / my team / other QA engineers].
- **Action:** I built **qaforge-mcp**, an MCP server with **12 QA tools**, including [list the ones you'll talk about: for example test case generation from requirements, flaky test detection, security test generation, accessibility audit, bug report generation]. Key decisions: [why MCP; how tools are structured; how you tested the tool itself; how you handled AI output quality]. I also built **AI-QA-Script** to [what it does].
- **Result:** [Who uses it; time saved; quality improvement; any real numbers].
- **Learning:** [Technical and product lessons – for example, "AI output needs evaluation and guardrails, not blind trust"].
- **Also fits:** "something you're proud of", process improvement, learning fast.

**Tip:** for Story 8, be ready to go deep. An interviewer may ask: "How did you test the AI parts?" The Testing ML and AI Systems chapter gives you the language: eval sets, graders, non-determinism, guardrails.

## Red flags to avoid

These are common reasons good engineers fail behavioural rounds:

1. **Only "we", never "I".** The interviewer can't tell what you did.
2. **Blaming others.** "The developers were lazy." "My manager didn't understand." Even if true, it signals poor collaboration.
3. **No real failure.** "My weakness is that I'm a perfectionist" sounds rehearsed and avoids the question.
4. **No result or no numbers.** The story just stops.
5. **No learning.** You did the same thing again later.
6. **Long, wandering answers.** Five minutes of Situation and 30 seconds of Action.
7. **Hero stories that ignore the team.** Leadership at Google includes stepping back and giving credit.
8. **Badmouthing a past employer or sharing confidential details.** Talk about your work without revealing secrets; generalise names and numbers when needed.
9. **Made-up stories.** Follow-up questions quickly expose them. Use real stories, even small ones.
10. **Arrogance or dismissing feedback.** Intellectual humility is a core part of Googleyness.
11. **Not asking questions at the end.** Prepare 2–3 thoughtful questions about the team, its testing challenges, or how success is measured.

## How to practise

- Write each story in bullet form (not a script you memorise word for word).
- Say each one aloud with a 2-minute timer; record yourself and listen once.
- Practise in English daily for two weeks – short, clear sentences. Your English doesn't need to be fancy; it needs to be clear and structured.
- Do at least two mock interviews with a friend or mentor who asks follow-ups.
- Map stories to questions in a small table so you never use the same story twice in one interview.

## Interview phrases you can use

- "Let me give you a specific example from my last project."
- "My responsibility there was…, so what I did was…"
- "I didn't agree at first, so I asked what data would help us decide."
- "Looking back, what I'd do differently is…"
- "The result was…, and the main thing I learned was…"

## Tester's corner

- QA work is full of great behavioural stories: late bugs, disagreements about severity, flaky suites, unclear specs. Mine them.
- Your best leadership stories are probably about influence without authority – convincing developers, improving process, building tools others adopt.
- Always add the "prevention" step to bug stories: what test or process did you add so it doesn't happen again?
- Bring data to disagreements, both in real work and in your stories.
- Tool-building stories (qaforge-mcp, AI-QA-Script) show leverage – exactly what Google values in test engineers.
- Keep your stories honest and confidential: generalise company names and sensitive numbers if needed.

## Key takeaways

- Google has publicly described four attributes: general cognitive ability, role-related knowledge, leadership and Googleyness.
- Googleyness includes comfort with ambiguity, bias to action, collaboration and intellectual humility.
- Use STAR (plus Learning), spend about 60% on Action, say "I", and quantify results.
- Prepare structured answers for the 10 common questions, and know what each one is testing.
- Build a bank of 8 real stories; one story can answer several questions.
- Avoid red flags: blaming, no real failure, no result, no learning, rambling, invented stories.

## Quiz

1. Which four attributes has Google publicly described looking for?
2. In a STAR answer, which part should take the most time?
   A) Situation  B) Task  C) Action  D) Result
3. True or false: saying "we" throughout your answer is best because it shows teamwork.
4. Which of these is a strong answer to "Tell me about a failure"?
   A) "I'm a perfectionist."
   B) A real mistake you made, its impact, and the concrete change in how you work now
   C) "I have never failed."
   D) A story about a teammate's mistake
5. What does "emergent leadership" mean, as described publicly by Laszlo Bock?
6. Name three traits Google's "How We Hire" video lists under Googleyness.
7. True or false: adding what you learned at the end of a story is unnecessary.
8. A developer dismisses your bug as "an edge case". How would you handle it, in a way that makes a good interview story?
9. What three parts does the "Tell me about yourself" structure in this chapter use?
10. Give two red flags in behavioural answers.

## Answer key

1. **General cognitive ability, role-related knowledge, leadership and Googleyness.**
2. **C** - Action is where you show what *you* did; aim for about 60% of the answer.
3. **False** - Use "we" for context, but "I" for your own actions so the interviewer can assess you.
4. **B** - A real failure with honest impact and a specific learning shows humility and growth.
5. Stepping in to lead when a problem needs you, and stepping back when someone else is better placed to lead.
6. **Comfort with ambiguity, bias to action, and a collaborative nature** (other public descriptions add intellectual humility).
7. **False** - The learning shows growth and is often asked as a follow-up anyway.
8. Listen to their view, then bring a reproduction, user-impact data and options (quick fix plus proper fix); agree a decision together and add tests. Then describe the outcome and the relationship afterwards.
9. **Present, Past, Future.**
10. Any two of: only "we", blaming others, no real failure, no result or numbers, no learning, rambling, hero stories, badmouthing employers, invented stories, arrogance, no questions at the end.

## Flashcards

- **Q:** Google's four publicly described attributes? — **A:** General cognitive ability, role-related knowledge, leadership and Googleyness.
- **Q:** What is Googleyness? — **A:** Comfort with ambiguity, bias to action, collaboration and intellectual humility.
- **Q:** What does STAR stand for? — **A:** Situation, Task, Action, Result.
- **Q:** How much of a STAR answer should be Action? — **A:** About 60%.
- **Q:** "I" or "we"? — **A:** "We" for team context, "I" for your own actions.
- **Q:** Ideal behavioural answer length? — **A:** About 2 minutes, then let follow-ups add detail.
- **Q:** What is emergent leadership? — **A:** Stepping in to solve a problem and stepping back when others should lead.
- **Q:** Structure for "Tell me about yourself"? — **A:** Present, Past, Future in about 75 seconds.
- **Q:** What makes a bug story great? — **A:** Adding the prevention step: what test or process you added afterwards.
- **Q:** Biggest red flag in a failure story? — **A:** Not naming a real mistake, or having no learning.
- **Q:** How many stories should your bank have? — **A:** About 8 real stories, each mapped to several questions.

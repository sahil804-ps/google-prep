# How Google Coding Interviews Work

> **In this chapter:**
> - Understand the stages of Google's hiring process as Google describes it publicly
> - Know what each interview round looks like for SWE, SWE-Test, Test Engineer and SDET-style roles
> - Learn the five things interviewers evaluate in a coding round
> - Choose your language and get ready to code without autocomplete
>
> **Time:** ~25 minutes  |  **Level:** Zero

## Why this chapter matters

Imagine you are preparing for a cricket match, but you do not know if it is a T20 or a Test match. You would train the wrong way. Knowing the format of the Google interview tells you what to practise and what to ignore.

A quick note on sources. Everything here about Google's process comes from what Google publishes on its careers site ("How we hire", at google.com/about/careers/applications/how-we-hire) and from the Google Tech Dev Guide (techdevguide.withgoogle.com), plus what is commonly and publicly reported by candidates. Google itself says the process **can vary by role, level, team and country**. Your recruiter is the final source of truth for your own interviews. Always ask them.

## The role names

Google has used several names for engineering roles that focus on testing and quality. You may see:

- **Software Engineer (SWE)** - builds products and infrastructure.
- **Software Engineer, Test / SWE in Test** - a software engineer who focuses on test infrastructure, tools and quality.
- **Test Engineer (TE)** - focuses on test strategy, test design and quality for a product area, and also writes code.

Outside Google, the term **SDET** (Software Development Engineer in Test) is common for similar work. Exact titles change over time, so read the job description carefully. For every one of these roles, you should expect **coding interviews**. Test-focused roles usually add questions on **test design and test strategy**.

## The stages of the process

Google's public "How we hire" page describes a process that goes roughly like this. Think of it as a Swiggy order: you place the order, the restaurant accepts it, the food is cooked, checked, and then delivered. Each step has its own owner.

### 1. Application and resume review

You apply online, or a recruiter contacts you, or someone refers you. A recruiter reviews your resume against the role. Google's careers site advises you to make your resume clear and to show impact with specifics, for example "reduced test run time from 40 to 12 minutes" instead of "improved tests".

### 2. Recruiter conversation

A recruiter talks with you, usually by phone or video. This is not a deep technical test. They check your background, your interest in the role, location, level, and timelines. They also explain the next steps. This is your chance to ask:

- Which role and level am I being considered for?
- How many interviews, and what types?
- Which programming languages can I use?
- Will there be a test design or role-related round?

### 3. Technical screen (phone or virtual)

Google describes short virtual interviews before the main loop. For engineering roles, this is commonly one or two technical interviews of about 45 minutes. You solve one or two coding problems in a shared document or simple online editor while talking with an engineer. Some roles may also use an online assessment first. This varies, so confirm with your recruiter.

### 4. The interview loop ("onsite", often virtual)

If the screen goes well, you move to the main set of interviews, often called the "onsite" even when it happens over video. Google's public guidance describes interviews that assess these attributes:

- **General cognitive ability** - how you think through hard, open problems. For engineers, this shows up mostly in coding and problem-solving rounds.
- **Role-related knowledge** - skills for this specific job. For a test role, this often means **test design**: how you would test a feature, a system or an API, and how you think about quality and risk.
- **Leadership** - how you have stepped up, influenced others and handled hard situations, even without a manager title.
- **Googleyness** - Google's word for qualities like comfort with ambiguity, a bias to action, caring about the team and users, doing the right thing, and being humble enough to learn.

A loop is commonly about four or five interviews of about 45 minutes each. For test-focused roles, a typical mix (it varies) is two or three coding rounds, one test design or role-related round, and one Googleyness and leadership round.

### 5. Hiring committee

Google's careers site explains that hiring decisions are not made by one person. Your interviewers write detailed feedback. A **hiring committee**, a group of experienced Googlers, reviews the full packet (feedback, resume, any references) and makes a recommendation. This is meant to reduce the bias of any single interviewer.

Why does this matter for you? Every round is written down. Your words, your code and your test cases are recorded in feedback. Clear communication becomes evidence that the committee can read.

### 6. Team matching and offer

For many engineering roles, candidates who pass the committee go through **team matching**, where you talk with managers of teams that have open positions. This step is commonly reported for SWE roles, but it may not happen the same way for every role or country. After a match, the offer is reviewed and extended.

## What a 45-minute coding round looks like

A coding round usually follows this flow (details vary by interviewer):

| Minutes | What happens |
|---|---|
| 0-5 | Short introductions |
| 5-10 | Interviewer gives the problem; you ask clarifying questions |
| 10-20 | You discuss approaches, starting with brute force, then a better one |
| 20-35 | You write the code |
| 35-42 | You test the code by hand and fix bugs; you state time and space complexity |
| 42-45 | Your questions for the interviewer |

Sometimes a round has a follow-up question that extends the first problem, such as "What if the input does not fit in memory?" Chapter dsa-32 gives a minute-by-minute playbook with phrases to say.

## What interviewers evaluate

Interviewers do not just check "did the code run". Public Google guidance and the Tech Dev Guide stress that they want to see **how you think**. You can group what they look for into five areas.

### 1. Communication

Can you explain your thinking clearly? Do you ask good questions? Do you listen to hints? Silence is the biggest enemy. If you think quietly for five minutes, the interviewer has nothing to write down.

A good habit: speak like a cricket commentator. "Now I am checking the left side. If it is smaller, I move the pointer right."

### 2. Problem solving

Do you understand the problem before coding? Can you find a simple solution first and then improve it? Can you break a big problem into small steps? Do you notice patterns, such as "this is a sliding window problem"?

### 3. Coding

Is the code correct, clean and readable? Do you use good variable names? Do you use the language well, for example Python's `dict` and `set`? Can you write it without heavy help? Google interviewers usually care about logic more than tiny syntax slips, but your code should be close to runnable.

### 4. Testing

Do you check your own code? Do you think of edge cases such as an empty list, a single element, duplicates or negative numbers? Do you walk through an example line by line? This is your superpower as a test engineer. Chapter dsa-30 is all about it.

### 5. Complexity analysis

Can you state the **time complexity** (how running time grows with input size) and **space complexity** (how extra memory grows) using Big-O notation? Can you explain why, and say if a better solution is possible? The Big-O lesson in the web app covers the basics.

## Choosing your language

Google generally lets you choose a mainstream language for coding interviews, such as Python, Java, C++, JavaScript or Go. Confirm with your recruiter. **Python is a strong choice** for you because:

- You already use it at work.
- It is short. Less typing means more time for thinking and testing.
- It has useful built-in tools: `dict`, `set`, `collections.deque`, `heapq`, and sorting with `key=`.

One warning: pick **one** language and stay with it for all practice. Switching languages in the interview causes small mistakes.

Chapter dsa-02 teaches the Python you need from zero.

## Coding without autocomplete

In the interview you will likely code in a shared document or a simple editor. It may have **no autocomplete, no syntax highlighting help, and no way to run the code**. This is a shock for engineers who live in VS Code or PyCharm.

Think of it like driving without Google Maps. You can do it, but only if you have practised the route.

How to prepare:

- **Practise in a plain editor.** Use Notepad, a Google Doc, or a plain text file for at least half of your practice.
- **Know common names by heart:** `len`, `append`, `pop`, `sorted`, `enumerate`, `zip`, `range`, `dict.get`, `set.add`, `heapq.heappush`, `heapq.heappop`, `deque.popleft`.
- **Indent carefully.** In a doc, use 4 spaces and be consistent.
- **Run the code in your head.** Since you cannot press "Run", you must trace it by hand with a small example. This is the dry run skill in chapter dsa-30.

Here is the kind of code you should be able to type cleanly with no help:

```python
def two_sum(nums, target):
    """Return indices of two numbers that add up to target."""
    seen = {}                      # value -> index
    for i, num in enumerate(nums):
        need = target - num
        if need in seen:           # found the partner
            return [seen[need], i]
        seen[num] = i
    return []                      # no pair found

print(two_sum([2, 7, 11, 15], 9))  # Output: [0, 1]
```

## What you can do before you apply

- Read the job description and match your resume to it. Show impact with numbers you can explain.
- Read Google's "How we hire" page and the Tech Dev Guide yourself.
- Prepare 6-8 short stories from your work for leadership and Googleyness questions: a hard bug you found, a time you disagreed with a developer, a time you improved a process, a time you failed and learned.
- Practise explaining your solutions in English aloud every day.

## Tester's corner

- The test design round is where your 5.5 years of experience shine. Practise describing how you would test a feature end to end: functional, edge, negative, performance, security and usability.
- In coding rounds, testing your own solution is one of the five evaluation areas. Many developers skip it. You should not.
- The hiring committee reads written feedback. Saying test cases aloud ("for an empty list I return 0") gives your interviewer concrete evidence to write.
- Think of the interview like a release gate: each round is a check, and the committee is the final sign-off.
- Prepare stories about quality impact: flaky test reduction, faster pipelines, bugs caught before production.

## Key takeaways

- Google's public process: application, recruiter talk, technical screen, interview loop, hiring committee, then team matching and offer. Details vary by role and country.
- The loop assesses general cognitive ability, role-related knowledge, leadership and Googleyness.
- Test-focused roles add test design rounds on top of coding rounds.
- Interviewers evaluate communication, problem solving, coding, testing and complexity analysis.
- Python is a good choice; pick one language and practise only in it.
- Practise coding in a plain editor without autocomplete and without running the code.
- Your recruiter is the best source for your exact interview format.

## Quiz

1. Who makes the final hiring recommendation at Google, according to its public description? A) Your first interviewer B) The recruiter C) A hiring committee D) The team manager alone
2. Name the four attributes Google says it assesses in interviews.
3. True or false: Google's interview process is exactly the same for every role and country.
4. In a 45-minute coding round, what should you do before writing code?
5. Which of these is NOT one of the five evaluation areas in this chapter? A) Communication B) Testing C) Typing speed D) Complexity analysis
6. What is "role-related knowledge" likely to mean for a Test Engineer role?
7. True or false: Python is generally accepted for Google coding interviews.
8. The shared editor has no autocomplete and you cannot run code. What would you do to check your solution?
9. Why is thinking silently for a long time a problem in an interview?
10. What is team matching? A) A coding round B) Talking with teams that have open roles after passing committee C) A group interview D) A test design round

## Answer key

1. **C** - Google describes a hiring committee that reviews interview feedback, so no single interviewer decides.
2. **General cognitive ability, role-related knowledge, leadership, Googleyness** - These are the attributes listed on Google's "How we hire" page.
3. **False** - Google says the process can vary by role, level, team and location; confirm with your recruiter.
4. **Clarify and plan** - Ask clarifying questions, confirm examples, and discuss a brute force and a better approach before coding.
5. **C** - Typing speed is not evaluated; communication, problem solving, coding, testing and complexity are.
6. **Test design and quality skills** - For example, designing tests for a feature, system or API and reasoning about risk.
7. **True** - Mainstream languages such as Python are generally accepted, but confirm with your recruiter.
8. **Dry run by hand** - Trace the code line by line with a small example and edge cases, saying the variable values aloud.
9. **No evidence** - The interviewer cannot see your thinking or write feedback about it, and cannot give helpful hints.
10. **B** - Team matching is when you meet managers of teams with open roles after the committee step.

## Flashcards

- **Q:** What are the main stages of Google's hiring process? — **A:** Application, recruiter conversation, technical screen, interview loop, hiring committee, team matching and offer.
- **Q:** What four attributes does Google assess? — **A:** General cognitive ability, role-related knowledge, leadership, and Googleyness.
- **Q:** What is the hiring committee? — **A:** A group of experienced Googlers who review all interview feedback and make a recommendation.
- **Q:** How long is a typical coding interview? — **A:** About 45 minutes.
- **Q:** What extra round do test-focused roles usually have? — **A:** A test design or role-related knowledge round.
- **Q:** What five areas do coding interviewers evaluate? — **A:** Communication, problem solving, coding, testing, and complexity analysis.
- **Q:** Why is Python a good interview language? — **A:** It is short, you know it already, and it has strong built-ins like dict, set, deque and heapq.
- **Q:** How should you practise for coding without autocomplete? — **A:** Code in a plain editor or doc and trace the code by hand without running it.
- **Q:** Where should you confirm your exact interview format? — **A:** With your recruiter.
- **Q:** What is Googleyness? — **A:** Google's term for qualities like comfort with ambiguity, bias to action, caring for team and users, and humility.

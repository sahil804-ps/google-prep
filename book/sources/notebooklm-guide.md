# NotebookLM study guide (for Sahil)

This guide shows you how to turn our 4 PDFs and the free sources in `notebooklm-sources.md` into a personal tutor.

> **Note:** Google's help pages now call the product **"Gemini Notebook"**. The website is still at https://notebooklm.google.com. If you see a different name or button label, it is the same product.
>
> **Hinglish tip:** Naam badla hai, kaam wahi hai. Buttons thode alag dikh sakte hain, ghabrao mat.

---

## 1. Create the 3 notebooks

Use one notebook per subject. NotebookLM **cannot read across notebooks**, so keep each subject in its own notebook.

| Notebook name | Upload these PDFs first | Then add sources from |
|---|---|---|
| `Google Prep - A - DSA` | `book/dist/vol1-dsa.pdf` (optional: `vol4-english.pdf`) | Section A of `notebooklm-sources.md` |
| `Google Prep - B - System Design` | `book/dist/vol2-system-design.pdf` | Section B |
| `Google Prep - C - Test Eng + Googleyness` | `book/dist/vol3-test-engineering.pdf` + `vol4-english.pdf` | Section C |

**Steps:**

1. Open https://notebooklm.google.com and sign in with your Gmail account.
2. Click **Create new notebook**.
3. In the pop-up, choose **Upload a source** and pick the PDF from `book/dist/`.
4. Click the notebook title at the top and rename it (for example `Google Prep - A - DSA`).
5. Repeat for the other two notebooks.

**Limits (from Google's help page, Oct 2026):** a free account can add up to **50 sources per notebook**. Each source can be up to 500,000 words or 200 MB. Limits can change, so check the current limit in NotebookLM.

> **Hinglish tip:** Pehle apni book ki PDF daalo, baaki sources baad mein. Book hi main teacher hai, baaki sab extra reading hai.

## 2. Add website and YouTube URLs

1. In the **Sources** panel, click **Add** (or **+ Add source**).
2. Choose **Website** and paste the URL. To add many web links at once, paste them **separated by a space or a new line**.
3. For a video, choose **YouTube** and paste **one public video URL** (`youtube.com/watch?v=...`).
   - A channel link (`youtube.com/@NeetCode`) or a playlist link will not work as one source.
   - Open the channel, pick the video you need, and copy that video's link.
4. Wait until each source finishes loading. Then click the source to see its **Source guide**, which is an auto-generated summary.
5. To ask about only a few sources, **tick only those sources** in the Sources panel before you ask.

> **Hinglish tip:** Sab kuch ek saath mat daalo. Jo topic is hafte padh rahe ho, sirf uske 3-5 sources add karo. Kam sources se answers zyada focused milte hain.

## 3. Which features to use

These features are in the **Studio** panel on the right. All of them are listed in Google's NotebookLM help pages. The mobile app may not have every feature, so use the website on a laptop when you can.

| Feature | What it does | When to use it |
|---|---|---|
| **Audio Overview** | Two AI hosts discuss your sources like a podcast. Formats: **Deep Dive** (default), **Brief** (one speaker, under 2 minutes), **Critique**, **Debate**. Length: Shorter / Default / Longer. Use the **Customize** box to type instructions. | Commute, walking, gym. |
| **Video Overview** | A narrated video made from your sources (Explainer or Short format). It can take more than 30 minutes to make. | Weekend revision of a big topic. |
| **Mind Map** | A clickable map of the topics in your sources. | Before starting a new chapter, to see the big picture. |
| **Reports: Study guide / Briefing doc / FAQ** | Written summaries. You can export them to Google Docs. | Night-before revision notes. |
| **Flashcards** and **Quiz** | Practice cards and multiple-choice questions made from your sources. | Every night, 10-15 minutes. |
| **Data Table, Slide Deck, Infographic** | Tables, slides or a one-page visual. | For example, a table comparing all sorting algorithms. |
| **Chat** | Ask questions. Answers include citations (numbers) that link to the source text. | Any time you are confused. |

**Customize the Audio Overview:** click the **Customize** (pencil) option before you generate, choose the format and length, and type your instruction in the prompt box. Section 4 has ready-made examples (prompts 18-20).

**Language:** NotebookLM has an **output language** setting. You can set it to Hindi for some audio, but technical terms are clearest in English. A good mix is to keep English and ask for a short Hindi summary at the end of chat answers.

> **Hinglish tip:** Audio Overview ke citations aur facts kabhi kabhi galat ho sakte hain. Koi bhi doubt ho to chat mein citation number pe click karke original text check karo.

## 4. Twenty ready-to-copy prompts

Paste these into the **Chat** box. Replace the words in `[brackets]`.

### Learning (explain and summarise)

1. **Explain like I'm new**
   ```
   Explain [sliding window] like I am a QA engineer with zero DSA background. Use short sentences, one real-life Indian example (like UPI, IRCTC or Swiggy), and one tiny Python example. At the end, give a 3-line summary in simple Hindi (Hinglish is fine).
   ```
2. **Chapter summary**
   ```
   Summarise the chapter "[Hash maps and sets]" from my book in 10 bullet points. Mark the 3 points most likely to come up in a Google interview.
   ```
3. **Compare two ideas**
   ```
   Make a table comparing [BFS and DFS]: when to use, time complexity, space complexity, data structure used, and one interview problem for each. Cite the source for each row.
   ```
4. **Find my confusion**
   ```
   I am confused between [stubs, mocks and fakes]. Ask me 3 short questions to find exactly what I don't understand. Then explain only that part.
   ```

### Quizzes and flashcards

5. **MCQ quiz, one at a time**
   ```
   Quiz me with 10 multiple-choice questions on [binary search]. Ask ONE question at a time, with 4 options. Wait for my answer. After my answer, tell me if I was right, and explain why in 2-3 lines. Keep score and show my total at the end.
   ```
6. **Flashcards for a chapter**
   ```
   Make 20 flashcards for the chapter "[Flaky tests]". Format: Q: ... / A: ... Keep each answer under 25 words. Include 5 cards on tricky edge cases.
   ```
7. **Complexity drill**
   ```
   Give me 10 short Python code snippets one at a time. For each one, I will say the time and space complexity. Wait for my answer, then correct me.
   ```
8. **Spot the bug**
   ```
   Show me a buggy Python solution for [two sum]. Do not tell me the bug. Wait for me to find it and write test cases that would catch it. Then review my test cases like a Google test engineer.
   ```

### Mock interviews

9. **Google coding interviewer**
   ```
   Act as a Google coding interviewer. Give me one medium-level problem on [arrays and hashing] from my sources. Do not give the solution. Let me ask clarifying questions first. Then let me explain my approach, write code, and test it. Give hints only if I ask. At the end, score me on: communication, problem solving, coding, testing (1-4 each), with one tip for each.
   ```
10. **Google test design interviewer**
    ```
    Act as a Google SWE-Test interviewer. Ask me: "How would you test [Google Maps search / a URL shortener / a UPI payment button]?" Let me answer step by step. Push back like a real interviewer: ask about scale, edge cases, test sizes (small/medium/large), automation and flakiness. At the end, list what I missed.
    ```
11. **Google system design interviewer**
    ```
    Act as a Google system design interviewer. Ask me to design [a rate limiter]. Follow this order: requirements, estimates, API, data model, high-level design, deep dive, bottlenecks. Wait for my answer at each step. Then also ask: "How would you test this system?" Score me at the end.
    ```
12. **Hints, not solutions (NeetCode)**
    ```
    I am solving the NeetCode problem "[Longest Substring Without Repeating Characters]". Do NOT give me the solution or code. Give me hint 1 only (very small). Wait. If I say "next hint", give a slightly bigger hint. Maximum 4 hints. After I solve it, tell me which pattern it uses.
    ```
13. **Behavioural / Googleyness**
    ```
    Act as a Google interviewer asking Googleyness and behavioural questions. Ask me one question at a time (for example: a time I disagreed with a developer about a bug). Let me answer in STAR format. Then rewrite my answer in simple, clear English and tell me what made it stronger.
    ```
14. **Follow-up pressure**
    ```
    I just solved [top K frequent elements] with a heap. Ask me 5 follow-up questions an interviewer at Google would ask (larger input, streaming data, memory limit, testing). One at a time, wait for my answer.
    ```

### Planning and revision

15. **7-day plan from weak areas**
    ```
    My weak areas are: [dynamic programming, graphs, test doubles]. I have 2 hours on weekdays and 4 hours on weekends. Build a 7-day revision plan using only my sources. For each day: topic, which chapter or source to read, 3 practice problems, and a 5-question self-check.
    ```
16. **Night-before cheat sheet**
    ```
    Make a 1-page cheat sheet of [all DSA patterns in my book]: pattern name, when to use it (signal words in the problem), template idea in one line, and one NeetCode problem example.
    ```
17. **English polishing**
    ```
    Here is my answer to "[Tell me about yourself]": [paste answer]. Rewrite it in simple, confident, professional English (under 150 words). Then list the 3 changes you made and why.
    ```

### Audio Overview (paste in the Customize box)

18. **Pattern podcast**
    ```
    Two hosts explain the sliding window pattern to a QA engineer with no DSA background. Use Indian examples (IRCTC queues, cricket overs, UPI transactions). Walk through 2 interview problems slowly. About 10 minutes. Speak in simple English.
    ```
19. **System design story**
    ```
    Explain how Google's search system could handle millions of requests, using only ideas from my sources: load balancing, caching, sharding and replication. Use a Swiggy or Zomato analogy. End with 3 ways a test engineer would test this system.
    ```
20. **Debate format (choose "Debate")**
    ```
    Debate: "More end-to-end tests make a product safer." One host argues for, one argues against, using the Google Testing Blog and the test pyramid from my sources. End with what a Google SWE-Test interviewer would want to hear.
    ```

> **Hinglish tip:** Quiz prompts mein "wait for my answer" zaroor likho, warna NotebookLM saare answers ek saath bata dega.

## 5. Daily routine (web app + NotebookLM)

Use our practice web app **https://sahil804-ps.github.io/google-prep/** for hands-on practice, and NotebookLM for listening and revision.

| Time | Where | What to do (about) |
|---|---|---|
| **Morning, 60-90 min** | Web app | Solve 2-3 problems for today's pattern. Say your approach out loud first, then code, then write test cases. Note every mistake in a "weak areas" list. |
| **Commute, 15-30 min** | NotebookLM (phone) | Listen to an **Audio Overview** of today's topic (use prompts 18-20). Use the **Brief** format for quick revision and **Deep Dive** for new topics. |
| **Lunch break, 10 min** | NotebookLM | Open the **Mind Map** of today's chapter, or read a **Study guide**. |
| **Evening, 45-60 min** | Book PDF + NotebookLM chat | Read the chapter for any problem you failed. Ask "explain like I'm new" (prompt 1) for anything unclear. |
| **Night, 15 min** | NotebookLM | Do a **Quiz** or prompt 5 (10 MCQs, one at a time). Review **Flashcards** for older topics. |
| **Weekend** | Both | Saturday: one full mock interview (prompts 9, 10 or 11). Sunday: update your weak areas list and run prompt 15 to plan the next week. |

**Weekly rotation idea:** Mon/Wed/Fri are for DSA (notebook A). Tue/Thu are for Test Engineering (notebook C). Saturday is for System Design (notebook B) plus a mock. Sunday is for revision.

> **Hinglish tip:** Roz thoda thoda karo, consistency hi asli trick hai. Subah haath se practice, raste mein kaan se revision, raat ko quiz se test. Yahi routine 8-12 hafte follow karo.

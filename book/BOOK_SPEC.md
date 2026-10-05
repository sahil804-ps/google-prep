# Book writing spec

This is the shared spec for every chapter of "Zero to Google: DSA, System Design and Test Engineering for QA Engineers".

## Reader

The reader is Sahil, an SDET with 5.5 years of experience (Selenium, Playwright, API testing, blockchain apps, Python and JS). He has **no DSA or system design background**, and he is preparing for a Google SWE-Test / Test Engineer / SDET interview in India.

His English is intermediate, so:

- Use short sentences and simple words.
- Explain every new term the first time it appears.
- Avoid idioms.
- Use a real-life analogy for every big idea. Indian everyday examples are good (railway booking, UPI payments, Swiggy delivery, cricket scoreboard).

He will upload these files to **Google NotebookLM**. NotebookLM will generate audio overviews, quizzes and flashcards, and answer his questions. So the text must be self-contained, well structured, and correct.

## Tone

Write like a friendly senior engineer teaching a junior. Use "you". Be encouraging but precise.

## File format

Each file is GitHub-flavoured Markdown. Tables, nested lists and `###` headings are all allowed here.

Every chapter file uses this structure:

```
# <Chapter title>

> **In this chapter:** 3-5 bullet learning goals
> **Time:** ~N minutes  |  **Level:** Zero / Beginner / Intermediate / Advanced / Expert

## ...body sections...

## Tester's corner
How this topic connects to testing / QA work, and what a test engineer should notice. (3-8 bullets)

## Key takeaways
5-8 bullets.

## Quiz
10 questions, numbered 1-10. Mix: multiple choice (A-D), true/false, and short "what would you do" questions.

## Answer key
1. **B** - one or two sentence explanation of why.
...

## Flashcards
8-12 lines, each exactly: `- **Q:** question text — **A:** answer text`
```

## Code

Code is Python 3. Keep each block short (under 30 lines) and commented, and use fenced blocks marked ```python. Show a small input and the expected output in a comment.

## Accuracy

Do not invent statistics, quotes, or facts about Google's internal tools. If you mention a Google system (Borg, Spanner, TAP, Blaze/Bazel), state only what is publicly documented (papers, the SWE at Google book, the SRE book), and say where it comes from.

## Length

Main chapters are 1,800-3,500 words, plus the quiz.

## Output folder

Write files to `book/chapters/` using the exact file names given in your task. Do not edit files you were not asked to write.

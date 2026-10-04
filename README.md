# Google Prep

A 12-week daily study plan for a Google SWE-Test / SDET interview, in one installable web app. Started 5 Oct 2026.

Every day the **Today** page lists the steps in order:

1. **Learn**: concept notes, an animation link (VisuAlgo), concept videos and a quick quiz
2. **Practice**: 2-3 NeetCode 150 problems, with LeetCode links, a timer and the NeetCode solution video (hidden until you have tried)
3. **Revise**: spaced repetition, so each solved problem comes back after 1, 3, 7, 14 and 30 days
4. **Design**: test design, system design or Googleyness, rotating through the week
5. **English**: a grammar lesson with a Hindi tip and quiz, 5 interview phrases with text-to-speech, and a speaking recorder with a live transcript, words-per-minute and filler-word count
6. **Reflect**: a short journal and minutes studied

Week 1 also has five foundation lessons: Big-O, recursion, sorting, prefix sums with hash maps, and a Python toolkit. Every DSA topic has a deep lesson covering how to recognise it, 2-3 patterns with templates, a worked dry run and an interview talk track. Each topic also has hand-picked concept videos (English and Hindi) that play inside the app. All 22 test design questions and all 11 system design questions have model answers, which open only after you write your own. There are also 95 bonus problems for days you finish early.

Sundays are a weekly test. Week 12 is a full mock interview every day. The Progress tab shows your streak, a 12-week calendar, per-topic bars, test scores and your weak problems.

## Run it

It is a static site with no build step:

```
python -m http.server 8000
```

Then open http://localhost:8000. It can be installed as an app from Chrome and works offline after the first visit.

Progress is stored in the browser (localStorage), and recordings are stored in IndexedDB. Use **More > Export backup** and **Import backup** to move progress between devices.

## Development

- `tools/build_problems.py` regenerates `js/data/problems.js` and `js/data/bonus.js` from NeetCode's official problem list, including the video IDs.
- `tools/find_videos.py` lists YouTube candidates for concept videos. `tools/check_videos.py --all` confirms every video exists and allows embedding.
- `js/plan.js` and `js/day.js` hold the pure scheduling logic.
- Run all tests with `node --test tests/plan.test.js tests/day.test.js tests/content.test.js`. The content tests check that every lesson, quiz and model answer exists and uses only the markdown the app can render.
- Curriculum content lives in `js/data/`.

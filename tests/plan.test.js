const test = require('node:test');
const assert = require('node:assert/strict');
const Plan = require('../js/plan.js');
const PROBLEMS = require('../js/data/problems.js');

test('dates: add and diff days across month boundary', () => {
  assert.equal(Plan.addDays('2026-10-30', 3), '2026-11-02');
  assert.equal(Plan.diffDays('2026-10-05', '2026-10-12'), 7);
});

test('dayInfo maps start date to week 1 Monday study day', () => {
  const d = Plan.dayInfo('2026-10-05');
  assert.equal(d.index, 0);
  assert.equal(d.week, 1);
  assert.equal(d.dow, 0);
  assert.equal(d.kind, 'study');
});

test('dayInfo: Sunday is weekly test, week 12 weekdays are mocks, outside range flagged', () => {
  assert.equal(Plan.dayInfo('2026-10-11').kind, 'test');
  assert.equal(Plan.dayInfo('2026-12-21').kind, 'mock');
  assert.equal(Plan.dayInfo('2026-12-27').kind, 'test');
  assert.equal(Plan.dayInfo('2026-10-04').kind, 'before');
  assert.equal(Plan.dayInfo('2026-12-28').kind, 'after');
});

test('every NeetCode 150 problem is scheduled exactly once, 2-3 per study day', () => {
  const seen = new Map();
  for (let i = 0; i < Plan.TOTAL_DAYS; i++) {
    const iso = Plan.addDays(Plan.START, i);
    const list = Plan.problemsForDay(iso, PROBLEMS);
    if (Plan.dayInfo(iso).kind === 'study') {
      assert.ok(list.length >= 2 && list.length <= 3, `${iso} has ${list.length}`);
    } else {
      assert.equal(list.length, 0);
    }
    list.forEach((p) => seen.set(p.id, (seen.get(p.id) || 0) + 1));
  }
  assert.equal(seen.size, 150);
  assert.ok([...seen.values()].every((n) => n === 1));
});

test('newTopicsForDay reports a topic only on its first scheduled day', () => {
  assert.deepEqual(Plan.newTopicsForDay('2026-10-05', PROBLEMS), ['Arrays & Hashing']);
  assert.deepEqual(Plan.newTopicsForDay('2026-10-06', PROBLEMS), []);
});

test('reviews come due on day 1, 3, 7, 14, 30 after solving', () => {
  const recs = { a: { solvedAt: '2026-10-05', reviews: [] } };
  assert.deepEqual(Plan.dueReviews(recs, '2026-10-05'), []);
  assert.deepEqual(Plan.dueReviews(recs, '2026-10-06').map((r) => r.id), ['a']);
  recs.a.reviews = ['2026-10-06'];
  assert.deepEqual(Plan.dueReviews(recs, '2026-10-07'), []);
  assert.deepEqual(Plan.dueReviews(recs, '2026-10-08').map((r) => r.id), ['a']);
  recs.a.reviews = ['x', 'y', 'z', 'w', 'v'];
  assert.deepEqual(Plan.dueReviews(recs, '2027-01-01'), []);
});

test('dueReviews lists most overdue first', () => {
  const recs = {
    a: { solvedAt: '2026-10-10', reviews: [] },
    b: { solvedAt: '2026-10-05', reviews: [] },
  };
  assert.deepEqual(Plan.dueReviews(recs, '2026-10-12').map((r) => r.id), ['b', 'a']);
});

test('applyReview: "again" restarts the schedule, others advance it', () => {
  const r1 = Plan.applyReview({ solvedAt: '2026-10-05', reviews: ['2026-10-06'] }, '2026-10-08', 'again');
  assert.equal(r1.solvedAt, '2026-10-08');
  assert.deepEqual(r1.reviews, []);
  const r2 = Plan.applyReview({ solvedAt: '2026-10-05', reviews: [] }, '2026-10-06', 'good');
  assert.deepEqual(r2.reviews, ['2026-10-06']);
});

test('streak counts consecutive complete days ending today or yesterday', () => {
  const done = new Set(['2026-10-05', '2026-10-06', '2026-10-07']);
  const isDone = (d) => done.has(d);
  assert.equal(Plan.streak(isDone, '2026-10-07'), 3);
  assert.equal(Plan.streak(isDone, '2026-10-08'), 3);
  assert.equal(Plan.streak(isDone, '2026-10-09'), 0);
});

test('seededPick is deterministic and returns distinct items', () => {
  const a = Plan.seededPick([1, 2, 3, 4, 5], 2, 'seed');
  assert.deepEqual(a, Plan.seededPick([1, 2, 3, 4, 5], 2, 'seed'));
  assert.equal(new Set(a).size, 2);
});

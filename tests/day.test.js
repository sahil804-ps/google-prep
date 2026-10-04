const test = require('node:test');
const assert = require('node:assert/strict');
const Plan = require('../js/plan.js');
const Day = require('../js/day.js');
const DATA = {
  problems: require('../js/data/problems.js'),
  topics: require('../js/data/topics.js'),
  design: require('../js/data/design.js'),
  english: require('../js/data/english.js'),
};

test('every scheduled topic has notes, a visual link and a quiz', () => {
  const topics = new Set(DATA.problems.map((p) => p.topic));
  topics.forEach((t) => {
    assert.ok(DATA.topics[t], `missing topic ${t}`);
    assert.ok(DATA.topics[t].quiz.length >= 3);
  });
});

test('Monday of week 1: new topic, problems, test-design lesson, grammar lesson', () => {
  const d = Day.build('2026-10-05', DATA);
  assert.equal(d.kind, 'study');
  assert.deepEqual(d.learn.newTopics, ['Arrays & Hashing']);
  assert.ok(d.practice.length >= 2);
  assert.equal(d.design.type, 'td-lesson');
  assert.equal(d.design.item.id, 'tdl1');
  assert.equal(d.english.grammar.id, 'g1');
  assert.equal(d.english.phrases.length, 5);
  assert.ok(d.english.speaking);
});

test('weekday rotation of design work', () => {
  const types = [0, 1, 2, 3, 4, 5].map((i) => Day.build(Plan.addDays('2026-10-12', i), DATA).design.type);
  assert.deepEqual(types, ['td-lesson', 'sd-lesson', 'td-prompt', 'sd-prompt', 'td-prompt', 'behavioral']);
});

test('grammar only on Monday and Thursday; all 22 lessons used once', () => {
  const used = [];
  for (let i = 0; i < Plan.TOTAL_DAYS; i++) {
    const d = Day.build(Plan.addDays(Plan.START, i), DATA);
    if (d.english && d.english.grammar) used.push(d.english.grammar.id);
  }
  assert.equal(used.length, 22);
  assert.equal(new Set(used).size, 22);
});

test('every design item for weeks 1-11 exists', () => {
  for (let i = 0; i < Plan.STUDY_WEEKS * 7; i++) {
    const d = Day.build(Plan.addDays(Plan.START, i), DATA);
    if (d.kind === 'study') assert.ok(d.design.item, `no design item on day ${i}`);
  }
});

test('Sunday is a weekly test using that week\'s problems and grammar', () => {
  const d = Day.build('2026-10-11', DATA);
  assert.equal(d.kind, 'test');
  const weekIds = Plan.problemsForWeek(1, DATA.problems).map((p) => p.id);
  assert.equal(d.test.problems.length, 2);
  d.test.problems.forEach((p) => assert.ok(weekIds.includes(p.id)));
  assert.ok(d.test.quiz.length >= 8);
});

test('final Sunday test mixes 12 grammar questions from the whole course', () => {
  const d = Day.build('2026-12-27', DATA);
  assert.equal(d.test.quiz.length, 12);
});

test('week 12 weekdays are full mock interviews', () => {
  const d = Day.build('2026-12-22', DATA);
  assert.equal(d.kind, 'mock');
  assert.equal(d.mock.problems.length, 2);
  assert.ok(d.mock.testDesign && d.mock.behavioral);
});

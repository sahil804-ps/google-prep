const test = require('node:test');
const assert = require('node:assert/strict');
const PROBLEMS = require('../js/data/problems.js');
const BONUS = require('../js/data/bonus.js');
const TOPICS = require('../js/data/topics.js');
const DEEP = Object.assign({}, require('../js/data/topics-deep-1.js'), require('../js/data/topics-deep-2.js'));
const BASICS = require('../js/data/basics.js');
const VIDEOS = require('../js/data/videos.js');
const DESIGN = require('../js/data/design.js');
const TD = require('../js/data/td-answers.js');
const SD = require('../js/data/sd-answers.js');

function checkQuiz(name, quiz) {
  quiz.forEach((q, i) => {
    assert.ok(q.q && Array.isArray(q.options) && q.options.length >= 2, `${name} q${i} shape`);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${name} q${i} answer index`);
  });
}

// The in-app renderer only supports ## headings, flat - / 1. lists, fences, `code`, **bold**.
function checkMarkdown(name, src) {
  let inFence = false;
  src.split('\n').forEach((line, i) => {
    if (line.startsWith('```')) { inFence = !inFence; return; }
    if (inFence) return;
    assert.ok(!/^#{3,}\s|^#\s/.test(line), `${name} line ${i + 1}: unsupported heading "${line}"`);
    assert.ok(!/^\s*\|.*\|\s*$/.test(line), `${name} line ${i + 1}: tables are not supported`);
    assert.ok(!/^\s+(-|\d+\.)\s/.test(line), `${name} line ${i + 1}: nested lists are not supported`);
  });
  assert.ok(!inFence, `${name}: unclosed code fence`);
}

test('every NeetCode topic has a deep lesson with a valid 5-question quiz', () => {
  Object.keys(TOPICS).forEach((t) => {
    assert.ok(DEEP[t], `missing deep lesson for ${t}`);
    assert.equal(DEEP[t].quiz.length, 5, t);
    checkQuiz(t, DEEP[t].quiz);
    checkMarkdown(t, DEEP[t].notes);
  });
});

test('five foundation lessons with valid quizzes', () => {
  assert.deepEqual(BASICS.map((b) => b.id), ['b1', 'b2', 'b3', 'b4', 'b5']);
  BASICS.forEach((b) => { checkQuiz(b.id, b.quiz); checkMarkdown(b.id, b.notes); });
});

test('every test design and system design question has a model answer', () => {
  DESIGN.tdPrompts.forEach((p) => { assert.ok(TD[p.id], p.id); checkMarkdown(p.id, TD[p.id]); });
  DESIGN.sdPrompts.forEach((p) => { assert.ok(SD.answers[p.id], p.id); checkMarkdown(p.id, SD.answers[p.id]); });
  DESIGN.sdLessons.forEach((l) => { assert.ok(SD.lessons[l.id], l.id); checkMarkdown(l.id, SD.lessons[l.id]); });
});

test('every video key points at a real topic, basic or lesson', () => {
  const keys = new Set([
    ...Object.keys(TOPICS),
    ...BASICS.map((b) => b.id),
    ...DESIGN.sdLessons.map((l) => l.id),
    ...DESIGN.tdLessons.map((l) => l.id),
  ]);
  Object.keys(VIDEOS).forEach((k) => assert.ok(keys.has(k), `unknown video key ${k}`));
});

test('bonus problems are not in the main 150 and have unique ids', () => {
  const main = new Set(PROBLEMS.map((p) => p.id));
  const seen = new Set();
  BONUS.forEach((p) => {
    assert.ok(!main.has(p.id), p.id);
    assert.ok(!seen.has(p.id), p.id);
    seen.add(p.id);
  });
});

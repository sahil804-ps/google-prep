// Pure scheduling logic. No DOM, no storage: runs in the browser and in Node tests.
(function (root) {
  var START = '2026-10-05';
  var TOTAL_DAYS = 84;
  var STUDY_WEEKS = 11;
  var STUDY_DAYS = STUDY_WEEKS * 6;
  var REVIEW_INTERVALS = [1, 3, 7, 14, 30];

  function parse(iso) {
    var p = iso.split('-').map(Number);
    return Date.UTC(p[0], p[1] - 1, p[2]);
  }
  function fmt(ms) {
    return new Date(ms).toISOString().slice(0, 10);
  }
  function addDays(iso, n) {
    return fmt(parse(iso) + n * 86400000);
  }
  function diffDays(a, b) {
    return Math.round((parse(b) - parse(a)) / 86400000);
  }
  function today() {
    var d = new Date();
    return fmt(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  }

  function dayInfo(iso) {
    var index = diffDays(START, iso);
    if (index < 0) return { index: index, week: 0, dow: -1, kind: 'before' };
    if (index >= TOTAL_DAYS) return { index: index, week: 13, dow: -1, kind: 'after' };
    var week = Math.floor(index / 7) + 1;
    var dow = index % 7;
    var kind = dow === 6 ? 'test' : week > STUDY_WEEKS ? 'mock' : 'study';
    return { index: index, week: week, dow: dow, kind: kind };
  }

  function studyIndex(iso) {
    var d = dayInfo(iso);
    if (d.kind !== 'study') return -1;
    return (d.week - 1) * 6 + d.dow;
  }

  function sliceFor(k, n) {
    return [Math.floor((k * n) / STUDY_DAYS), Math.floor(((k + 1) * n) / STUDY_DAYS)];
  }

  function problemsForDay(iso, problems) {
    var k = studyIndex(iso);
    if (k < 0) return [];
    var r = sliceFor(k, problems.length);
    return problems.slice(r[0], r[1]);
  }

  function problemsForWeek(week, problems) {
    var out = [];
    for (var dow = 0; dow < 6; dow++) {
      out = out.concat(problemsForDay(addDays(START, (week - 1) * 7 + dow), problems));
    }
    return out;
  }

  function newTopicsForDay(iso, problems) {
    var k = studyIndex(iso);
    if (k < 0) return [];
    var r = sliceFor(k, problems.length);
    var before = {};
    problems.slice(0, r[0]).forEach(function (p) { before[p.topic] = true; });
    var out = [];
    problems.slice(r[0], r[1]).forEach(function (p) {
      if (!before[p.topic] && out.indexOf(p.topic) < 0) out.push(p.topic);
    });
    return out;
  }

  function currentTopic(iso, problems) {
    var list = problemsForDay(iso, problems);
    return list.length ? list[0].topic : null;
  }

  // records: { id: { solvedAt, reviews: [iso...] } }
  function dueReviews(records, on) {
    var due = [];
    Object.keys(records).forEach(function (id) {
      var r = records[id];
      if (!r || !r.solvedAt) return;
      var n = (r.reviews || []).length;
      if (n >= REVIEW_INTERVALS.length) return;
      var dueOn = addDays(r.solvedAt, REVIEW_INTERVALS[n]);
      var overdue = diffDays(dueOn, on);
      if (overdue >= 0) due.push({ id: id, step: n + 1, dueOn: dueOn, overdue: overdue });
    });
    due.sort(function (a, b) { return b.overdue - a.overdue || (a.id < b.id ? -1 : 1); });
    return due;
  }

  function applyReview(record, on, confidence) {
    if (confidence === 'again') return Object.assign({}, record, { solvedAt: on, reviews: [] });
    return Object.assign({}, record, { reviews: (record.reviews || []).concat([on]) });
  }

  function streak(isComplete, on) {
    var d = isComplete(on) ? on : addDays(on, -1);
    var n = 0;
    while (isComplete(d)) { n++; d = addDays(d, -1); }
    return n;
  }

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function seededPick(items, count, seed) {
    var s = hash(String(seed)) || 1;
    var pool = items.slice();
    var out = [];
    while (out.length < count && pool.length) {
      s = (Math.imul(s, 1103515245) + 12345) >>> 0;
      out.push(pool.splice(s % pool.length, 1)[0]);
    }
    return out;
  }

  var api = {
    START: START,
    TOTAL_DAYS: TOTAL_DAYS,
    STUDY_WEEKS: STUDY_WEEKS,
    REVIEW_INTERVALS: REVIEW_INTERVALS,
    addDays: addDays,
    diffDays: diffDays,
    today: today,
    dayInfo: dayInfo,
    problemsForDay: problemsForDay,
    problemsForWeek: problemsForWeek,
    newTopicsForDay: newTopicsForDay,
    currentTopic: currentTopic,
    dueReviews: dueReviews,
    applyReview: applyReview,
    streak: streak,
    seededPick: seededPick,
  };
  if (typeof module !== 'undefined') module.exports = api;
  else root.Plan = api;
})(this);

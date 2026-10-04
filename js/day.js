// Builds the content for one calendar day from the curriculum data. Pure: no storage.
(function (root) {
  var Plan = typeof module !== 'undefined' ? require('./plan.js') : root.Plan;

  function englishFor(info, english) {
    var w = info.week - 1;
    var grammar = null;
    if (info.kind === 'study' && info.dow === 0) grammar = english.grammar[w * 2];
    if (info.kind === 'study' && info.dow === 3) grammar = english.grammar[w * 2 + 1];
    var phrases = [];
    for (var i = 0; i < 5; i++) phrases.push(english.phrases[(info.index * 5 + i) % english.phrases.length]);
    return {
      grammar: grammar || null,
      phrases: phrases,
      speaking: english.speaking[info.index % english.speaking.length],
    };
  }

  function designFor(info, design) {
    var w = info.week - 1;
    switch (info.dow) {
      case 0: return { type: 'td-lesson', item: design.tdLessons[w] };
      case 1: return { type: 'sd-lesson', item: design.sdLessons[w] };
      case 2: return { type: 'td-prompt', item: design.tdPrompts[w * 2] };
      case 3: return { type: 'sd-prompt', item: design.sdPrompts[w] };
      case 4: return { type: 'td-prompt', item: design.tdPrompts[w * 2 + 1] };
      default: return { type: 'behavioral', item: design.behavioral[w] };
    }
  }

  function weeklyQuiz(week, data) {
    var quiz = [];
    var topics = {};
    Plan.problemsForWeek(week, data.problems).forEach(function (p) { topics[p.topic] = true; });
    Object.keys(topics).forEach(function (t) {
      data.topics[t].quiz.forEach(function (q, i) {
        quiz.push({ id: 'topic:' + t + ':' + i, source: t, q: q.q, options: q.options, answer: q.answer });
      });
    });
    [data.english.grammar[(week - 1) * 2], data.english.grammar[(week - 1) * 2 + 1]].forEach(function (g) {
      if (!g) return;
      g.quiz.forEach(function (q, i) {
        quiz.push({ id: g.id + ':' + i, source: 'Grammar: ' + g.title, q: q.q, options: q.options, answer: q.answer, why: q.why });
      });
    });
    return quiz;
  }

  function finalQuiz(data, iso) {
    var all = [];
    data.english.grammar.forEach(function (g) {
      g.quiz.forEach(function (q, i) {
        all.push({ id: g.id + ':' + i, source: 'Grammar: ' + g.title, q: q.q, options: q.options, answer: q.answer, why: q.why });
      });
    });
    return Plan.seededPick(all, 12, 'final' + iso);
  }

  function build(iso, data) {
    var info = Plan.dayInfo(iso);
    var day = { date: iso, week: info.week, dow: info.dow, index: info.index, kind: info.kind };
    if (info.kind === 'before' || info.kind === 'after') return day;

    day.english = englishFor(info, data.english);

    if (info.kind === 'study') {
      var newTopics = Plan.newTopicsForDay(iso, data.problems);
      day.learn = { newTopics: newTopics, topic: Plan.currentTopic(iso, data.problems) };
      day.practice = Plan.problemsForDay(iso, data.problems);
      day.design = designFor(info, data.design);
      return day;
    }

    if (info.kind === 'test') {
      var pool = info.week <= Plan.STUDY_WEEKS ? Plan.problemsForWeek(info.week, data.problems) : data.problems;
      day.test = {
        problems: Plan.seededPick(pool, 2, 'test' + iso),
        quiz: info.week <= Plan.STUDY_WEEKS ? weeklyQuiz(info.week, data) : finalQuiz(data, iso),
        speaking: 'Summarise what you learned this week in 2 minutes: topics, one hard problem, one test design idea.',
      };
      return day;
    }

    day.mock = {
      problems: Plan.seededPick(data.problems, 2, 'mock' + iso),
      testDesign: Plan.seededPick(data.design.tdPrompts, 1, 'td' + iso)[0],
      behavioral: Plan.seededPick(data.design.behavioral, 1, 'beh' + iso)[0],
    };
    return day;
  }

  var api = { build: build, weeklyQuiz: weeklyQuiz };
  if (typeof module !== 'undefined') module.exports = api;
  else root.Day = api;
})(this);

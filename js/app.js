(function () {
  'use strict';

  var TOPIC_DATA = {};
  Object.keys(TOPICS).forEach(function (t) {
    TOPIC_DATA[t] = Object.assign({}, TOPICS[t], (window.TOPICS_DEEP || {})[t] || {});
  });
  var BASICS_LIST = window.BASICS || [];
  var VIDEO_MAP = window.VIDEOS || {};
  var BONUS_LIST = window.BONUS || [];
  var TD_MODELS = window.TD_ANSWERS || {};
  var SD_MORE = window.SD_EXTRA || { lessons: {}, answers: {} };
  DESIGN.tdPrompts.forEach(function (it) { it.model = TD_MODELS[it.id]; });
  DESIGN.sdPrompts.forEach(function (it) { it.model = SD_MORE.answers[it.id]; });
  DESIGN.sdLessons.forEach(function (it) { if (SD_MORE.lessons[it.id]) it.notes = SD_MORE.lessons[it.id]; });

  var DATA = { problems: PROBLEMS, topics: TOPIC_DATA, design: DESIGN, english: ENGLISH, basics: BASICS_LIST };
  var app = document.getElementById('app');
  var S = Store.load();
  var ui = { open: {}, reveal: {}, vid: {}, model: {}, dsaFilter: 'all', prompts: {}, pendingUrl: null, freePrompt: 0 };
  var timer = { running: false, startedAt: 0, acc: 0, label: 'Focus timer' };

  var PROBLEM_BY_ID = {};
  PROBLEMS.concat(BONUS_LIST).forEach(function (p) { PROBLEM_BY_ID[p.id] = p; });
  var BONUS_IDS = {};
  BONUS_LIST.forEach(function (p) { BONUS_IDS[p.id] = true; });
  var BASIC_BY_ID = {};
  BASICS_LIST.forEach(function (b) { BASIC_BY_ID[b.id] = b; });
  var DESIGN_BY_ID = {};
  var DESIGN_TYPE = { tdLessons: 'td-lesson', tdPrompts: 'td-prompt', sdLessons: 'sd-lesson', sdPrompts: 'sd-prompt', behavioral: 'behavioral' };
  Object.keys(DESIGN_TYPE).forEach(function (k) {
    DESIGN[k].forEach(function (it) { DESIGN_BY_ID[it.id] = { item: it, type: DESIGN_TYPE[k] }; });
  });
  var GRAMMAR_BY_ID = {};
  ENGLISH.grammar.forEach(function (g) { GRAMMAR_BY_ID[g.id] = g; });
  var SCHEDULED_ON = {};
  for (var i = 0; i < Plan.TOTAL_DAYS; i++) {
    var iso = Plan.addDays(Plan.START, i);
    Plan.problemsForDay(iso, PROBLEMS).forEach(function (p) { SCHEDULED_ON[p.id] = iso; });
  }

  var WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var STEP_INFO = {
    learn: ['Learn', 'Concept notes, animation, quick quiz'],
    practice: ['Practice', 'Solve today\'s problems on LeetCode'],
    revisit: ['Revise', 'Spaced repetition of old problems'],
    design: ['Design', 'Test design / system design / Googleyness'],
    english: ['English', 'Grammar, phrases and speaking'],
    reflect: ['Reflect', '2 lines: what I learned, what was hard'],
    coding: ['Timed coding', '2 problems, 45 minutes, no notes'],
    quiz: ['Weekly quiz', 'Concepts + grammar from this week'],
    speaking: ['Speaking test', 'Record a 2-minute summary'],
    mockdesign: ['Test design round', '30 minutes, speak while you write'],
    behavioral: ['Googleyness round', 'Answer out loud using STAR'],
  };

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }
  function md(src) {
    var out = [];
    var lines = String(src).split('\n');
    var list = null;
    function closeList() { if (list) { out.push('</' + list + '>'); list = null; } }
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var m;
      if (line.indexOf('```') === 0) {
        closeList();
        var code = [];
        i++;
        while (i < lines.length && lines[i].indexOf('```') !== 0) { code.push(lines[i]); i++; }
        out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
      } else if ((m = line.match(/^#{2,4}\s+(.*)/))) {
        closeList(); out.push('<h4>' + inline(m[1]) + '</h4>');
      } else if ((m = line.match(/^-\s+(.*)/))) {
        if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul'; }
        out.push('<li>' + inline(m[1]) + '</li>');
      } else if ((m = line.match(/^\d+\.\s+(.*)/))) {
        if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol'; }
        out.push('<li>' + inline(m[1]) + '</li>');
      } else if (!line.trim()) {
        closeList();
      } else {
        closeList(); out.push('<p>' + inline(line) + '</p>');
      }
    }
    closeList();
    return '<div class="md">' + out.join('') + '</div>';
  }
  function pretty(iso) {
    var p = iso.split('-').map(Number);
    return p[2] + ' ' + MONTHS[p[1] - 1];
  }
  function ext(url, label, cls) {
    return '<a class="' + (cls || 'btn small ghost') + '" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + '</a>';
  }
  function yt(q) { return DESIGN.yt(q); }
  function save() { Store.save(S); }
  var saveTimer = null;
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 300); }
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }
  function dayState(iso) {
    if (!S.days[iso]) S.days[iso] = { steps: {}, journal: '', minutes: 0 };
    if (!S.days[iso].steps) S.days[iso].steps = {};
    return S.days[iso];
  }
  function fmtTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  // ---------- completion rules ----------
  function quizComplete(id, questions) {
    var q = S.quizzes[id];
    if (!q || !questions.length) return false;
    return questions.every(function (_, i) { return q.answers && q.answers[i] != null; });
  }
  function quizScore(id, questions) {
    var q = S.quizzes[id];
    var right = 0;
    var answered = 0;
    questions.forEach(function (qq, i) {
      if (q && q.answers && q.answers[i] != null) { answered++; if (q.answers[i] === qq.answer) right++; }
    });
    return { right: right, answered: answered, total: questions.length };
  }
  function hasRecording(ctx) {
    return S.speaking.some(function (r) { return r.ctx === ctx; });
  }
  function solved(id) { return !!(S.problems[id] && S.problems[id].solvedAt); }

  function stepsFor(day) {
    if (day.kind === 'study') return ['learn', 'practice', 'revisit', 'design', 'english', 'reflect'];
    if (day.kind === 'test') return ['coding', 'quiz', 'speaking', 'reflect'];
    if (day.kind === 'mock') return ['coding', 'mockdesign', 'behavioral', 'reflect'];
    return [];
  }
  function learnTopics(day) {
    return day.learn.newTopics.length ? day.learn.newTopics : [day.learn.topic];
  }
  function isStepDone(day, step) {
    var ds = S.days[day.date];
    if (ds && ds.steps && ds.steps[step]) return true;
    switch (step) {
      case 'learn':
        if (day.learn.basic && !quizComplete('basic:' + day.learn.basic.id, day.learn.basic.quiz)) return false;
        return learnTopics(day).every(function (t) { return quizComplete('topic:' + t, TOPIC_DATA[t].quiz); });
      case 'practice':
        return day.practice.every(function (p) { return solved(p.id); });
      case 'design':
        return !!(S.design[day.design.item.id] && S.design[day.design.item.id].done);
      case 'english':
        return hasRecording('day:' + day.date) && (!day.english.grammar || quizComplete(day.english.grammar.id, day.english.grammar.quiz));
      case 'reflect':
        return !!(ds && ds.journal && ds.journal.trim());
      case 'quiz':
        return quizComplete('test:' + day.date, day.test.quiz);
      case 'speaking':
        return hasRecording('test:' + day.date);
      case 'mockdesign':
        var k = day.mock.testDesign.id + '@' + day.date;
        return !!(S.design[k] && S.design[k].done);
      case 'behavioral':
        return hasRecording('mock:' + day.date);
      default:
        return false;
    }
  }
  var dayCache = {};
  function buildDay(iso) {
    if (!dayCache[iso]) dayCache[iso] = Day.build(iso, DATA);
    return dayCache[iso];
  }
  function dayFraction(iso) {
    var day = buildDay(iso);
    var steps = stepsFor(day);
    if (!steps.length) return 0;
    return steps.filter(function (s) { return isStepDone(day, s); }).length / steps.length;
  }
  function isDayComplete(iso) {
    var info = Plan.dayInfo(iso);
    if (info.kind === 'before' || info.kind === 'after') return false;
    return dayFraction(iso) === 1;
  }
  function syncAuto(day) {
    if (day.kind === 'study' && !Plan.dueReviews(S.problems, day.date).length) {
      var ds = dayState(day.date);
      if (!ds.steps.revisit) { ds.steps.revisit = true; save(); }
    }
  }

  // ---------- components ----------
  function renderQuiz(id, questions) {
    var st = S.quizzes[id] || { answers: {} };
    var sc = quizScore(id, questions);
    var html = questions.map(function (q, i) {
      var picked = st.answers ? st.answers[i] : null;
      var opts = q.options.map(function (o, j) {
        var cls = 'opt';
        if (picked != null) {
          if (j === q.answer) cls += ' right';
          else if (j === picked) cls += ' wrong';
        }
        return '<button class="' + cls + '" data-act="quiz" data-quiz="' + esc(id) + '" data-q="' + i + '" data-opt="' + j + '"' + (picked != null ? ' disabled' : '') + '>' + esc(o) + '</button>';
      }).join('');
      var why = picked != null && q.why ? '<div class="why">' + esc(q.why) + '</div>' : '';
      var src = q.source ? '<span class="muted small">' + esc(q.source) + ' - </span>' : '';
      return '<div class="q">' + src + (i + 1) + '. ' + esc(q.q) + '</div><div class="opts">' + opts + '</div>' + why;
    }).join('');
    var score = sc.answered ? '<span class="badge info">' + sc.right + ' / ' + sc.total + '</span>' : '';
    var reset = sc.answered ? ' <button class="btn small ghost" data-act="quiz-reset" data-quiz="' + esc(id) + '">Retry</button>' : '';
    return '<div class="quiz"><div class="row spread"><b>Quick quiz</b><span>' + score + reset + '</span></div>' + html + '</div>';
  }

  function videoBlock(p) {
    var state = ui.reveal[p.id];
    if (!state) return '';
    if (!p.video) return '<p class="muted small">No video for this problem.</p>';
    if (state === 'ask' && !solved(p.id)) {
      return '<div class="tip" style="margin-top:10px">Did you think for at least 15-20 minutes and write your approach as comments? ' +
        'Watch only the approach part, then close the video and code it yourself.<div class="row" style="margin-top:8px">' +
        '<button class="btn small" data-act="reveal-show" data-id="' + p.id + '">Yes, show the video</button>' +
        '<button class="btn small ghost" data-act="reveal-hide" data-id="' + p.id + '">I will try more</button></div></div>';
    }
    return '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(p.video) + '" title="' + esc(p.title) + ' solution" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
  }

  function renderProblem(p, opts) {
    opts = opts || {};
    var r = S.problems[p.id] || {};
    var isSolved = !!r.solvedAt;
    var head = '<div class="row spread"><a href="#/problem/' + p.id + '"><b>' + esc(p.title) + '</b></a><span class="row">' +
      '<span class="badge ' + p.difficulty + '">' + p.difficulty + '</span><span class="badge info">' + esc(p.topic) + '</span>' +
      (r.weak ? '<span class="badge Hard">weak</span>' : '') + '</span></div>';
    var actions = '<div class="row" style="margin-top:8px">' +
      ext('https://leetcode.com/problems/' + p.slug + '/', 'Solve on LeetCode', 'btn small') +
      '<button class="btn small ghost" data-act="timer-for" data-label="' + esc(p.title) + '">Start timer</button>' +
      (p.video ? '<button class="btn small ghost" data-act="reveal" data-id="' + p.id + '">Solution video</button>' : '') +
      (isSolved ? '' : '<button class="btn small green" data-act="solve" data-id="' + p.id + '">Mark solved</button>') +
      '</div>';
    var solvedRow = '';
    if (isSolved) {
      var conf = ['easy', 'ok', 'hard'].map(function (c) {
        return '<button class="btn small ' + (r.conf === c ? '' : 'ghost') + '" data-act="conf" data-id="' + p.id + '" data-conf="' + c + '">' + c[0].toUpperCase() + c.slice(1) + '</button>';
      }).join('');
      solvedRow = '<div class="row small" style="margin-top:8px">Solved ' + pretty(r.solvedAt) +
        ' - minutes <input type="number" min="0" data-bind="problems.' + p.id + '.minutes" value="' + esc(r.minutes || '') + '">' +
        ' Felt: ' + conf + ' <button class="btn small red" data-act="unsolve" data-id="' + p.id + '">Undo</button></div>';
    }
    var notes = opts.noNotes ? '' : '<textarea style="margin-top:8px;min-height:60px" placeholder="My approach in 2-3 lines, complexity, and the mistake I made..." data-bind="problems.' + p.id + '.notes">' + esc(r.notes || '') + '</textarea>';
    return '<div class="problem' + (isSolved ? ' solved' : '') + '">' + head + actions + videoBlock(p) + solvedRow + notes + '</div>';
  }

  function renderVideos(key, moreUrl) {
    var list = VIDEO_MAP[key] || [];
    var players = list.filter(function (v) { return ui.vid[key + ':' + v.id]; }).map(function (v) {
      return '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(v.id) + '" title="' + esc(v.title) + '" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>' +
        '<p class="small muted">' + esc(v.title) + ' - ' + esc(v.channel) + ' (' + esc(v.lang) + ')</p>';
    }).join('');
    var buttons = list.filter(function (v) { return !ui.vid[key + ':' + v.id]; }).map(function (v) {
      return '<button class="btn small" data-act="play" data-k="' + esc(key + ':' + v.id) + '">Watch: ' + esc(v.title) + ' - ' + esc(v.channel) + ' (' + esc(v.lang) + ')</button>';
    }).join('');
    var more = moreUrl ? ext(moreUrl, list.length ? 'More videos on YouTube' : 'Find a video on YouTube') : '';
    return players + '<div class="row videos">' + buttons + more + '</div>';
  }

  function topicLinks(t) {
    var tp = TOPIC_DATA[t];
    return renderVideos(t, yt('NeetCode ' + t + ' explained')) + '<div class="row" style="margin-top:6px">' +
      ext(tp.visual, 'Animation (VisuAlgo)') +
      ext(yt('take U forward ' + t), 'Striver videos (Hindi/English)') +
      ext('https://pythontutor.com/visualize.html', 'Run code step by step') +
      '</div>';
  }

  function renderBasic(b) {
    return '<span class="badge Medium">Foundation lesson</span><h3><a href="#/basics/' + b.id + '">' + esc(b.title) + '</a></h3>' +
      '<p class="muted small">Basics first: they make every NeetCode topic easier.</p>' +
      renderVideos(b.id, yt(b.title + ' explained')) + md(b.notes) + renderQuiz('basic:' + b.id, b.quiz);
  }

  function renderModel(item, storeKey) {
    if (!item.model) return '';
    var state = ui.model[storeKey];
    if (state === 'show') {
      return '<div class="card model"><div class="row spread"><b>Model answer</b><button class="btn small ghost" data-act="model-hide" data-id="' + esc(storeKey) + '">Hide</button></div>' +
        '<p class="small muted">Compare with yours: what did you miss? Add it to your notes, then say the full answer out loud once.</p>' + md(item.model) + '</div>';
    }
    if (state === 'ask') {
      return '<div class="tip">Write your own answer first - in the interview nobody will show you one. Even 5 bullet points is enough.' +
        '<div class="row" style="margin-top:8px"><button class="btn small" data-act="model-show" data-id="' + esc(storeKey) + '">Show it anyway</button>' +
        '<button class="btn small ghost" data-act="model-hide" data-id="' + esc(storeKey) + '">I will write first</button></div></div>';
    }
    return '<button class="btn small ghost" data-act="model" data-id="' + esc(storeKey) + '">Show model answer</button>';
  }

  function renderDesign(item, type, storeKey) {
    storeKey = storeKey || item.id;
    var st = S.design[storeKey] || {};
    var doneBtn = '<button class="btn small ' + (st.done ? 'green' : '') + '" data-act="design-done" data-id="' + esc(storeKey) + '">' + (st.done ? 'Done' : 'Mark done') + '</button>';
    if (type === 'td-lesson' || type === 'sd-lesson') {
      return '<span class="badge info">' + (type === 'td-lesson' ? 'Test design lesson' : 'System design lesson') + '</span>' +
        '<h3>' + esc(item.title) + '</h3>' + md(item.notes) +
        renderVideos(item.id, item.video) +
        '<div class="row" style="margin-top:6px">' + item.read.map(function (r) { return ext(r.url, 'Read: ' + r.label); }).join('') + '</div>' +
        '<textarea style="margin-top:10px" placeholder="3 key points in my own words (in English)..." data-bind="design.' + storeKey + '.answer">' + esc(st.answer || '') + '</textarea>' +
        '<div class="row" style="margin-top:8px">' + doneBtn + '</div>';
    }
    if (type === 'behavioral') {
      return '<span class="badge info">Googleyness / behavioural</span><h3>' + esc(item.title) + '</h3>' +
        '<div class="tip small">' + esc(item.tips).replace(/\n/g, '<br>') + '</div>' +
        '<textarea style="margin-top:10px" placeholder="Bullet points for your STAR story (not a script)..." data-bind="design.' + storeKey + '.answer">' + esc(st.answer || '') + '</textarea>' +
        '<div style="margin-top:10px">' + renderRecorder('beh:' + storeKey, item.prompt) + '</div>' +
        '<div class="row" style="margin-top:8px">' + doneBtn + '</div>';
    }
    var checked = st.checked || {};
    var list = item.checklist.map(function (c, i) {
      return '<label><input type="checkbox" data-act="check-item" data-id="' + esc(storeKey) + '" data-idx="' + i + '"' + (checked[i] ? ' checked' : '') + '> <span>' + esc(c) + '</span></label>';
    }).join('');
    var n = Object.keys(checked).filter(function (k) { return checked[k]; }).length;
    return '<span class="badge info">' + (type === 'td-prompt' ? 'Test design practice' : 'System design practice') + '</span>' +
      '<h3>' + esc(item.title) + '</h3><p>' + esc(item.prompt) + '</p>' +
      '<div class="row"><button class="btn small ghost" data-act="timer-for" data-label="' + esc(item.title) + '">Start 30-min timer</button></div>' +
      '<p class="muted small">Speak out loud while you write, like in the interview. Then tick what you covered.</p>' +
      '<textarea style="min-height:160px" placeholder="Clarifying questions, then your answer..." data-bind="design.' + storeKey + '.answer">' + esc(st.answer || '') + '</textarea>' +
      '<h4>Self-check (' + n + ' / ' + item.checklist.length + ')</h4><div class="checklist">' + list + '</div>' +
      '<div style="margin-top:8px">' + renderModel(item, storeKey) + '</div>' +
      '<div class="row" style="margin-top:8px">' + doneBtn + '</div>';
  }

  function renderGrammar(g) {
    return '<span class="badge info">Grammar</span><h3>' + esc(g.title) + '</h3>' + md(g.notes) +
      '<div class="hindi small"><b>Hindi tip:</b> ' + esc(g.hindi) + '</div>' + renderQuiz(g.id, g.quiz);
  }

  function speakBtn(text) {
    return '<button class="btn small ghost" data-act="tts" data-text="' + esc(text) + '" title="Listen">Listen</button>';
  }

  function renderRecorder(ctx, prompt) {
    ui.prompts[ctx] = prompt;
    var safe = esc(ctx);
    var body;
    var active = Recorder.active && Recorder.active.ctx === ctx;
    var pending = Recorder.pending && Recorder.pending.ctx === ctx ? Recorder.pending : null;
    if (!Recorder.supported) {
      body = '<p class="muted small">Recording needs a modern browser (Chrome / Edge) and microphone permission.</p>';
    } else if (active) {
      body = '<div class="row"><span class="live">Recording <span id="rec-time">00:00</span></span>' +
        '<button class="btn small red" data-act="rec-stop">Stop</button></div>' +
        '<p class="muted small" id="rec-live">' + (Recorder.transcriptSupported ? 'Start speaking...' : 'Live transcript works in Chrome/Edge. Audio is still recorded.') + '</p>';
    } else if (pending) {
      var m = Recorder.metrics(pending.transcript, pending.seconds, ENGLISH.fillers);
      if (!ui.pendingUrl) ui.pendingUrl = URL.createObjectURL(pending.blob);
      body = '<audio controls src="' + ui.pendingUrl + '" style="width:100%"></audio>' +
        '<div class="metrics"><span><b>' + fmtTime(pending.seconds) + '</b> length</span><span><b>' + m.words + '</b> words</span>' +
        '<span><b>' + m.wpm + '</b> words/min (target 120-150)</span><span><b>' + m.fillers.total + '</b> fillers</span></div>' +
        (m.fillers.total ? '<p class="small muted">Fillers: ' + Object.keys(m.fillers.counts).map(function (f) { return esc(f) + ' x' + m.fillers.counts[f]; }).join(', ') + '</p>' : '') +
        '<textarea id="rec-text" placeholder="Transcript (you can fix words the browser misheard)">' + esc(pending.transcript) + '</textarea>' +
        '<div class="row" style="margin-top:8px"><button class="btn small green" data-act="rec-save">Save</button>' +
        '<button class="btn small ghost" data-act="rec-ai">Check grammar with AI</button>' +
        '<button class="btn small red" data-act="rec-discard">Discard</button></div>';
    } else {
      body = '<button class="btn small" data-act="rec-start" data-ctx="' + safe + '">Record answer</button> <span class="muted small">Aim for 1-2 minutes. Listen back once.</span>';
    }
    var saved = S.speaking.filter(function (r) { return r.ctx === ctx; }).slice(-3).reverse();
    var hist = saved.map(function (r) {
      return '<div class="rec-item small"><div class="row spread"><span>' + pretty(r.date) + ' - ' + fmtTime(r.seconds) + ' - ' + r.wpm + ' wpm - ' + r.fillers + ' fillers</span>' +
        '<span><button class="btn small ghost" data-act="rec-play" data-id="' + r.id + '">Play</button></span></div>' +
        (r.transcript ? '<div class="muted">' + esc(r.transcript) + '</div>' : '') + '</div>';
    }).join('');
    return '<div class="recorder"><div style="margin-bottom:8px"><b>Speak:</b> ' + esc(prompt) + '</div>' + body + hist + '</div>';
  }

  function stepCard(day, step, n, body) {
    var done = isStepDone(day, step);
    var key = day.date + ':' + step;
    var open = ui.open[key] !== undefined ? ui.open[key] : !done;
    var info = STEP_INFO[step];
    return '<details class="card step' + (done ? ' done' : '') + '" data-key="' + key + '"' + (open ? ' open' : '') + '>' +
      '<summary><span class="stepnum">' + (done ? '&#10003;' : n) + '</span><span class="steptitle"><b>' + info[0] + '</b><span class="muted small">' + info[1] + '</span></span>' +
      '<input type="checkbox" class="check" data-act="toggle-step" data-date="' + day.date + '" data-step="' + step + '"' + (done ? ' checked' : '') + ' aria-label="Mark ' + info[0] + ' done"></summary>' +
      '<div class="body">' + body + '</div></details>';
  }

  // ---------- step bodies ----------
  function learnBody(day) {
    var fresh = day.learn.newTopics.length > 0;
    var basic = day.learn.basic ? renderBasic(day.learn.basic) + '<hr>' : '';
    return basic + learnTopics(day).map(function (t) {
      var tp = TOPIC_DATA[t];
      var notes = fresh ? md(tp.notes) : '<details><summary class="small">Show notes</summary>' + md(tp.notes) + '</details>';
      return '<div class="stack">' +
        (fresh ? '<span class="badge Medium">New topic</span>' : '<span class="badge info">5-minute revision</span>') +
        '<h3><a href="#/topic/' + encodeURIComponent(t) + '">' + esc(t) + '</a></h3>' +
        (fresh ? '<p class="muted small">Watch the concept video or animation first (20 min), then read the notes.</p>' : '') +
        topicLinks(t) + notes + renderQuiz('topic:' + t, tp.quiz) + '</div>';
    }).join('<hr>');
  }

  function practiceBody(day) {
    var extra = '';
    if (day.practice.every(function (p) { return solved(p.id); })) {
      var next = BONUS_LIST.filter(function (b) { return b.topic === day.learn.topic && !solved(b.id); })[0];
      if (next) extra = '<h4>Done early? Bonus problem</h4>' + renderProblem(next);
    }
    return '<div class="tip small"><b>Method:</b> think 15-20 min, write the approach as comments, code it, run tests. ' +
      'Stuck? Watch only the approach in the video, close it, re-code without looking. Then explain it out loud in English.</div>' +
      '<div style="margin-top:10px">' + day.practice.map(function (p) { return renderProblem(p); }).join('') + extra + '</div>';
  }

  function revisitBody(day) {
    var today = Plan.today();
    if (day.date !== today) {
      return '<p class="muted">The revision list is built from what you solved, so it shows on today\'s page.</p>';
    }
    var due = Plan.dueReviews(S.problems, today);
    if (!due.length) return '<p>Nothing due today. Revisions appear 1, 3, 7, 14 and 30 days after you solve a problem.</p>';
    return '<p class="small muted">Re-solve each one from scratch without looking at your old code. Then rate how it went. "Again" restarts its schedule.</p>' +
      due.map(function (d) {
        var p = PROBLEM_BY_ID[d.id];
        if (!p) return '';
        var r = S.problems[d.id];
        var btns = [['again', 'Again', 'red'], ['hard', 'Hard', 'ghost'], ['good', 'Good', 'ghost'], ['easy', 'Easy', 'green']].map(function (b) {
          return '<button class="btn small ' + b[2] + '" data-act="review" data-id="' + d.id + '" data-conf="' + b[0] + '">' + b[1] + '</button>';
        }).join('');
        return '<div class="problem"><div class="row spread"><b>' + esc(p.title) + '</b><span class="badge info">Revision ' + d.step + ' of 5</span></div>' +
          '<div class="row" style="margin-top:8px">' + ext('https://leetcode.com/problems/' + p.slug + '/', 'Open on LeetCode', 'btn small') + btns + '</div>' +
          (r.notes ? '<details class="small" style="margin-top:6px"><summary>My notes</summary><div>' + esc(r.notes) + '</div></details>' : '') + '</div>';
      }).join('');
  }

  function englishBody(day) {
    var e = day.english;
    var parts = [];
    if (e.grammar) parts.push(renderGrammar(e.grammar));
    parts.push('<h3>Today\'s 5 phrases</h3><p class="muted small">Listen, repeat each 3 times, and use at least one today at work.</p>' +
      e.phrases.map(function (p) { return '<div class="phrase"><span>' + esc(p) + '</span>' + speakBtn(p) + '</div>'; }).join(''));
    parts.push('<h3>Speaking practice</h3><p class="tip small">' + esc(ENGLISH.shadowingTip) + '</p>' + renderRecorder('day:' + day.date, e.speaking));
    return parts.join('<hr>');
  }

  function reflectBody(day) {
    var ds = S.days[day.date] || {};
    return '<textarea placeholder="Today I learned... The hardest part was... Tomorrow I will..." data-bind="days.' + day.date + '.journal">' + esc(ds.journal || '') + '</textarea>' +
      '<div class="row small" style="margin-top:8px">Minutes studied today <input type="number" min="0" data-bind="days.' + day.date + '.minutes" value="' + esc(ds.minutes || '') + '"></div>';
  }

  function stepBody(day, step) {
    switch (step) {
      case 'learn': return learnBody(day);
      case 'practice': return practiceBody(day);
      case 'revisit': return revisitBody(day);
      case 'design': return renderDesign(day.design.item, day.design.type);
      case 'english': return englishBody(day);
      case 'reflect': return reflectBody(day);
      case 'coding':
        var list = day.kind === 'test' ? day.test.problems : day.mock.problems;
        return '<div class="tip small">Start the timer for 45 minutes. Solve both without notes or videos. Talk out loud the whole time. Tick this step when the time is up.</div>' +
          '<div class="row" style="margin:8px 0"><button class="btn small" data-act="timer-for" data-label="Timed coding (45 min)">Start 45-min timer</button></div>' +
          list.map(function (p) { return renderProblem(p, { noNotes: true }); }).join('');
      case 'quiz':
        if (!day.test.quiz.length) return '<p>Final week: no new quiz. Retry any grammar lesson from the English tab.</p>';
        return renderQuiz('test:' + day.date, day.test.quiz);
      case 'speaking': return renderRecorder('test:' + day.date, day.test.speaking);
      case 'mockdesign': return renderDesign(day.mock.testDesign, 'td-prompt', day.mock.testDesign.id + '@' + day.date);
      case 'behavioral':
        return '<h3>' + esc(day.mock.behavioral.title) + '</h3><div class="tip small">' + esc(day.mock.behavioral.tips).replace(/\n/g, '<br>') + '</div>' +
          '<div style="margin-top:10px">' + renderRecorder('mock:' + day.date, day.mock.behavioral.prompt) + '</div>';
      default: return '';
    }
  }

  // ---------- pages ----------
  function pageToday(iso) {
    var today = Plan.today();
    iso = iso || today;
    var info = Plan.dayInfo(iso);
    if (info.kind === 'before') return pageBefore();
    if (info.kind === 'after') return pageAfter();
    var day = buildDay(iso);
    if (iso === today) syncAuto(day);
    var steps = stepsFor(day);
    var doneCount = steps.filter(function (s) { return isStepDone(day, s); }).length;
    var kindLabel = { study: 'Study day', test: 'Weekly test', mock: 'Mock interview day' }[day.kind];
    var title = day.kind === 'study' && day.learn.topic ? day.learn.topic : kindLabel;
    var prev = info.index > 0 ? '<a class="btn small ghost" href="#/today/' + Plan.addDays(iso, -1) + '">&larr; Prev</a>' : '';
    var next = info.index < Plan.TOTAL_DAYS - 1 ? '<a class="btn small ghost" href="#/today/' + Plan.addDays(iso, 1) + '">Next &rarr;</a>' : '';
    var back = iso !== today && Plan.dayInfo(today).kind !== 'before' && Plan.dayInfo(today).kind !== 'after' ? '<a class="btn small" href="#/today">Back to today</a>' : '';
    var head = '<div class="card"><div class="dayhead"><div><div class="muted small">Week ' + day.week + ' of 12 - ' + WEEKDAYS[day.dow] + ', ' + pretty(iso) + ' - ' + kindLabel + '</div>' +
      '<h1>' + esc(title) + '</h1></div><div class="row">' + prev + next + '</div></div>' +
      '<div class="progressbar"><span style="width:' + Math.round((doneCount / steps.length) * 100) + '%"></span></div>' +
      '<div class="row spread small muted" style="margin-top:6px"><span>' + doneCount + ' of ' + steps.length + ' steps done</span>' + back + '</div></div>';
    if (doneCount === steps.length) head += '<div class="card" style="border-color:var(--green)"><b>Day complete.</b> Great work - rest, or revise a weak problem from the DSA tab.</div>';
    return head + steps.map(function (s, i) { return stepCard(day, s, i + 1, stepBody(day, s)); }).join('');
  }

  function pageBefore() {
    return '<div class="card"><h1>Your 12-week plan starts on Monday, 5 Oct</h1>' +
      '<p>Every day this page will show your steps in order: <b>Learn, Practice, Revise, Design, English, Reflect</b>. Sundays are a weekly test. The last week is mock interviews.</p>' +
      '<a class="btn" href="#/today/' + Plan.START + '">Preview day 1</a></div>' +
      '<div class="card"><h2>Do this today (20 minutes)</h2><ol>' +
      '<li>Install this app on your phone: open the link in Chrome, menu, <b>Add to Home screen</b>.</li>' +
      '<li>Read how Google interviews: ' + ext('https://www.google.com/about/careers/applications/how-we-hire/', 'How Google hires', '') + '</li>' +
      '<li>Record your starting point below. In 12 weeks you will compare.</li></ol>' +
      renderRecorder('baseline', 'Tell me about yourself, and why you want to work at Google. (about 75 seconds)') + '</div>';
  }

  function pageAfter() {
    return '<div class="card"><h1>12-week plan complete</h1><p>Keep the habit: 1 new problem + revisions every day, and one mock interview per week. Use the DSA tab to re-solve weak problems and the English tab for speaking practice.</p>' +
      '<a class="btn" href="#/progress">See your progress</a></div>';
  }

  function pageDsa() {
    var total = PROBLEMS.length;
    var done = PROBLEMS.filter(function (p) { return solved(p.id); }).length;
    var weak = PROBLEMS.filter(function (p) { return S.problems[p.id] && S.problems[p.id].weak; }).length;
    var filters = [['all', 'All'], ['todo', 'Not solved'], ['weak', 'Weak'], ['blind', 'Blind 75']].map(function (f) {
      return '<button class="btn small ' + (ui.dsaFilter === f[0] ? '' : 'ghost') + '" data-act="dsa-filter" data-f="' + f[0] + '">' + f[1] + '</button>';
    }).join('');
    var byTopic = {};
    PROBLEMS.forEach(function (p) { (byTopic[p.topic] = byTopic[p.topic] || []).push(p); });
    var sections = Object.keys(byTopic).map(function (t) {
      var list = byTopic[t].filter(function (p) {
        var r = S.problems[p.id] || {};
        if (ui.dsaFilter === 'todo') return !r.solvedAt;
        if (ui.dsaFilter === 'weak') return r.weak;
        if (ui.dsaFilter === 'blind') return p.blind75;
        return true;
      });
      if (!list.length) return '';
      var n = byTopic[t].filter(function (p) { return solved(p.id); }).length;
      var bonus = BONUS_LIST.filter(function (p) { return p.topic === t; });
      var bonusDone = bonus.filter(function (p) { return solved(p.id); }).length;
      return '<div class="card"><div class="row spread"><h3 style="margin:0"><a href="#/topic/' + encodeURIComponent(t) + '">' + esc(t) + '</a></h3><span class="muted small">' + n + ' / ' + byTopic[t].length + '</span></div>' +
        '<div class="list">' + list.map(problemItem).join('') + '</div>' +
        (bonus.length ? '<details class="small" style="margin-top:6px"><summary>Bonus practice (' + bonusDone + ' / ' + bonus.length + ') - only after the main list</summary><div class="list">' + bonus.map(problemItem).join('') + '</div></details>' : '') +
        '</div>';
    }).join('');
    var basics = BASICS_LIST.length ? '<div class="card"><h3>Foundations (week 1)</h3><div class="list">' + BASICS_LIST.map(function (b) {
      var sc = quizScore('basic:' + b.id, b.quiz);
      return '<a class="item" href="#/basics/' + b.id + '"><span class="row"><span class="dot' + (sc.answered === sc.total ? ' on' : '') + '"></span>' + esc(b.title) + '</span><span class="muted small">' + (sc.answered ? sc.right + '/' + sc.total : '') + '</span></a>';
    }).join('') + '</div></div>' : '';
    return '<div class="card"><h1>NeetCode 150</h1><div class="row spread"><span><b>' + done + '</b> / ' + total + ' solved - <b>' + weak + '</b> weak</span>' + ext('https://neetcode.io/roadmap', 'NeetCode roadmap') + '</div>' +
      '<div class="bar" style="margin-top:8px"><span style="width:' + Math.round((done / total) * 100) + '%"></span></div>' +
      '<div class="row" style="margin-top:10px">' + filters + '</div></div>' + basics + (sections || '<div class="card muted">Nothing here yet.</div>');
  }

  function problemItem(p) {
    var r = S.problems[p.id] || {};
    var when = SCHEDULED_ON[p.id] ? pretty(SCHEDULED_ON[p.id]) : 'bonus';
    return '<a class="item" href="#/problem/' + p.id + '"><span class="row"><span class="dot' + (r.weak ? ' weak' : r.solvedAt ? ' on' : '') + '"></span>' + esc(p.title) + '</span>' +
      '<span class="row small"><span class="muted">' + when + '</span><span class="badge ' + p.difficulty + '">' + p.difficulty + '</span></span></a>';
  }

  function pageBasic(id) {
    var b = BASIC_BY_ID[id];
    if (!b) return '<div class="card">Lesson not found. <a href="#/dsa">Back</a></div>';
    return '<div class="card"><a href="#/dsa" class="small">&larr; DSA</a>' + renderBasic(b) + '</div>';
  }

  function pageProblem(id) {
    var p = PROBLEM_BY_ID[id];
    if (!p) return '<div class="card">Problem not found. <a href="#/dsa">Back</a></div>';
    if (!ui.reveal[id] && solved(id)) ui.reveal[id] = 'show';
    var r = S.problems[id] || {};
    var hist = (r.reviews || []).map(pretty).join(', ') || 'none yet';
    return '<div class="card"><a href="#/dsa" class="small">&larr; All problems</a><h1>' + esc(p.title) + '</h1>' + renderProblem(p) +
      '<div class="row small muted" style="margin-top:10px">' +
      (SCHEDULED_ON[id] ? '<span>Planned for <a href="#/today/' + SCHEDULED_ON[id] + '">' + pretty(SCHEDULED_ON[id]) + '</a></span>' : '<span>Bonus problem (extra practice)</span>') +
      '<span>Revisions: ' + hist + '</span></div>' +
      '<div class="row" style="margin-top:10px"><button class="btn small ' + (r.weak ? 'red' : 'ghost') + '" data-act="weak" data-id="' + id + '">' + (r.weak ? 'Marked weak (tap to clear)' : 'Mark as weak') + '</button>' +
      '<a class="btn small ghost" href="#/topic/' + encodeURIComponent(p.topic) + '">' + esc(p.topic) + ' notes</a></div></div>';
  }

  function pageTopic(t) {
    var tp = TOPIC_DATA[t];
    if (!tp) return '<div class="card">Topic not found.</div>';
    var list = PROBLEMS.filter(function (p) { return p.topic === t; });
    var bonus = BONUS_LIST.filter(function (p) { return p.topic === t; });
    return '<div class="card"><a href="#/dsa" class="small">&larr; DSA</a><h1>' + esc(t) + '</h1>' + topicLinks(t) + md(tp.notes) + renderQuiz('topic:' + t, tp.quiz) + '</div>' +
      '<div class="card"><h3>Problems</h3>' + list.map(function (p) { return renderProblem(p, { noNotes: true }); }).join('') + '</div>' +
      (bonus.length ? '<div class="card"><h3>Bonus practice</h3><p class="muted small">Extra problems from NeetCode\'s full list. Do these only after the main list, or on weekends.</p>' + bonus.map(function (p) { return renderProblem(p, { noNotes: true }); }).join('') + '</div>' : '');
  }

  function designList(title, items, type) {
    return '<div class="card"><h3>' + title + '</h3><div class="list">' + items.map(function (it) {
      var st = S.design[it.id] || {};
      return '<a class="item" href="#/design/' + it.id + '"><span class="row"><span class="dot' + (st.done ? ' on' : '') + '"></span>' + esc(it.title) + '</span><span class="muted small">' + type + '</span></a>';
    }).join('') + '</div></div>';
  }

  function pageDesign(id) {
    if (id) {
      var d = DESIGN_BY_ID[id];
      if (!d) return '<div class="card">Not found.</div>';
      return '<div class="card"><a href="#/design" class="small">&larr; Design</a>' + renderDesign(d.item, d.type) + '</div>';
    }
    return '<div class="card"><h1>Design</h1><p class="muted">For a SWE-Test / SDET loop, test design and test infrastructure design matter most. Lessons first, then timed practice.</p></div>' +
      designList('Test design - lessons', DESIGN.tdLessons, 'lesson') +
      designList('Test design - practice questions', DESIGN.tdPrompts, 'practice') +
      designList('System design - lessons', DESIGN.sdLessons, 'lesson') +
      designList('System design - practice questions', DESIGN.sdPrompts, 'practice') +
      designList('Googleyness / behavioural', DESIGN.behavioral, 'STAR');
  }

  function pageEnglish(sub, id) {
    if (sub === 'grammar' && GRAMMAR_BY_ID[id]) {
      return '<div class="card"><a href="#/english" class="small">&larr; English</a>' + renderGrammar(GRAMMAR_BY_ID[id]) + '</div>';
    }
    var g = ENGLISH.grammar.map(function (gr) {
      var sc = quizScore(gr.id, gr.quiz);
      return '<a class="item" href="#/english/grammar/' + gr.id + '"><span class="row"><span class="dot' + (sc.answered === sc.total ? ' on' : '') + '"></span>' + esc(gr.title) + '</span><span class="muted small">' + (sc.answered ? sc.right + '/' + sc.total : '') + '</span></a>';
    }).join('');
    var recs = S.speaking.slice();
    var trend = '';
    if (recs.length) {
      var avg = function (arr, f) { return arr.length ? Math.round(arr.reduce(function (a, r) { return a + f(r); }, 0) / arr.length) : 0; };
      var perMin = function (r) { return r.seconds ? (r.fillers * 60) / r.seconds : 0; };
      var first = recs.slice(0, 5);
      var last = recs.slice(-5);
      trend = '<div class="metrics"><span><b>' + recs.length + '</b> recordings</span>' +
        '<span>Speed: <b>' + avg(first, function (r) { return r.wpm; }) + ' &rarr; ' + avg(last, function (r) { return r.wpm; }) + '</b> wpm</span>' +
        '<span>Fillers per min: <b>' + avg(first, perMin) + ' &rarr; ' + avg(last, perMin) + '</b></span></div>' +
        '<p class="muted small">First 5 recordings vs last 5. Goal: 120-150 words/min and fewer than 2 fillers per minute.</p>';
    }
    var prompt = ENGLISH.speaking[ui.freePrompt % ENGLISH.speaking.length];
    var history = recs.slice(-10).reverse().map(function (r) {
      return '<div class="rec-item small"><div class="row spread"><span>' + pretty(r.date) + ' - ' + esc(r.prompt) + '</span><span>' + r.wpm + ' wpm - ' + r.fillers + ' fillers ' +
        '<button class="btn small ghost" data-act="rec-play" data-id="' + r.id + '">Play</button><button class="btn small red" data-act="rec-delete" data-id="' + r.id + '">Delete</button></span></div></div>';
    }).join('');
    return '<div class="card"><h1>English</h1><p class="muted">30 minutes a day: grammar (Mon, Thu), 5 phrases and speaking every day. Speaking matters most - record, listen, fix, repeat.</p>' + trend + '</div>' +
      '<div class="card"><h3>Speaking studio</h3><div class="row" style="margin-bottom:8px"><button class="btn small ghost" data-act="next-prompt">Another question</button></div>' +
      renderRecorder('free:' + (ui.freePrompt % ENGLISH.speaking.length), prompt) + (history ? '<h4 style="margin-top:14px">Recent recordings</h4>' + history : '') + '</div>' +
      '<div class="card"><h3>Grammar lessons (' + ENGLISH.grammar.length + ')</h3><div class="list">' + g + '</div></div>' +
      '<div class="card"><h3>Interview phrase bank</h3>' + ENGLISH.phrases.map(function (p) { return '<div class="phrase"><span>' + esc(p) + '</span>' + speakBtn(p) + '</div>'; }).join('') + '</div>';
  }

  function pageProgress() {
    var today = Plan.today();
    var daysDone = 0;
    var cells = '';
    for (var w = 0; w < 12; w++) {
      cells += '<span class="muted">W' + (w + 1) + '</span>';
      for (var d = 0; d < 7; d++) {
        var iso = Plan.addDays(Plan.START, w * 7 + d);
        var f = dayFraction(iso);
        if (f === 1) daysDone++;
        var lvl = f === 0 ? '' : f < 0.34 ? 'l1' : f < 0.67 ? 'l2' : f < 1 ? 'l3' : 'l4';
        cells += '<a href="#/today/' + iso + '" class="' + lvl + (iso === today ? ' today' : '') + '" title="' + pretty(iso) + ' - ' + Math.round(f * 100) + '%"></a>';
      }
    }
    var solvedCount = PROBLEMS.filter(function (p) { return solved(p.id); }).length;
    var reviews = Object.keys(S.problems).reduce(function (a, k) { return a + ((S.problems[k].reviews || []).length); }, 0);
    var minutes = Object.keys(S.days).reduce(function (a, k) { return a + (Number(S.days[k].minutes) || 0); }, 0);
    var stats = [
      [Plan.streak(isDayComplete, today), 'day streak'],
      [daysDone + ' / 84', 'days complete'],
      [solvedCount + ' / 150', 'problems solved'],
      [reviews, 'revisions done'],
      [S.speaking.length, 'recordings'],
      [Math.round(minutes / 60) + ' h', 'study time logged'],
    ].map(function (s) { return '<div class="card stat"><b>' + s[0] + '</b><span class="muted small">' + s[1] + '</span></div>'; }).join('');
    var byTopic = {};
    PROBLEMS.forEach(function (p) { var t = byTopic[p.topic] = byTopic[p.topic] || [0, 0]; t[1]++; if (solved(p.id)) t[0]++; });
    var topics = Object.keys(byTopic).map(function (t) {
      return '<div class="topicrow"><div><div class="small">' + esc(t) + '</div><div class="bar"><span style="width:' + Math.round((byTopic[t][0] / byTopic[t][1]) * 100) + '%"></span></div></div><span class="small muted">' + byTopic[t][0] + ' / ' + byTopic[t][1] + '</span></div>';
    }).join('');
    var tests = '';
    for (var wk = 1; wk <= 12; wk++) {
      var tIso = Plan.addDays(Plan.START, wk * 7 - 1);
      var q = buildDay(tIso).test.quiz;
      var sc = quizScore('test:' + tIso, q);
      tests += '<a class="item" href="#/today/' + tIso + '"><span>Week ' + wk + ' test (' + pretty(tIso) + ')</span><span class="muted small">' + (sc.answered ? sc.right + ' / ' + sc.total : '-') + '</span></a>';
    }
    var weak = PROBLEMS.filter(function (p) { return S.problems[p.id] && S.problems[p.id].weak; });
    return '<h1>Progress</h1><div class="grid">' + stats + '</div>' +
      '<div class="card"><h3>12-week calendar</h3><div class="heat"><span></span>' + ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(function (x) { return '<span class="muted" style="text-align:center">' + x + '</span>'; }).join('') + cells + '</div></div>' +
      '<div class="card"><h3>DSA by topic</h3>' + topics + '</div>' +
      '<div class="card"><h3>Weekly tests</h3><div class="list">' + tests + '</div></div>' +
      '<div class="card"><h3>Weak problems (' + weak.length + ')</h3>' + (weak.length ? '<div class="list">' + weak.map(function (p) { return '<a class="item" href="#/problem/' + p.id + '"><span>' + esc(p.title) + '</span><span class="badge ' + p.difficulty + '">' + p.difficulty + '</span></a>'; }).join('') + '</div>' : '<p class="muted">None. Mark a problem "Hard" after solving to add it here.</p>') + '</div>';
  }

  function pageMore() {
    var res = DESIGN.resources.map(function (g) {
      return '<h3>' + esc(g.group) + '</h3><div class="row">' + g.items.map(function (it) { return ext(it.url, it.label); }).join('') + '</div>';
    }).join('');
    return '<div class="card"><h1>How to use this app</h1><ol>' +
      '<li>Open <b>Today</b> every morning and do the steps top to bottom (about 2.5 hours).</li>' +
      '<li>Daily time split: 75 min DSA, 45 min design, 30 min English.</li>' +
      '<li>Use the timer in the top bar. Log minutes in Reflect.</li>' +
      '<li>Sunday: weekly test. Week 12: one full mock interview every day.</li>' +
      '<li>Missed a day? Do not skip it - use Prev/Next and catch up on the weekend.</li></ol></div>' +
      '<div class="card"><h2>Resources</h2>' + res + '</div>' +
      '<div class="card"><h2>Backup and sync</h2><p class="muted small">Progress is saved in this browser. To move it to your phone or another computer: Export here, then Import there. Voice recordings stay on the device where you recorded them.</p>' +
      '<div class="row"><button class="btn" data-act="export">Export backup</button><label class="btn ghost">Import backup<input type="file" accept="application/json" id="import-file" hidden></label></div></div>' +
      '<div class="card"><h2>Install on phone</h2><p>Open this site in Chrome on Android, tap the menu, then <b>Add to Home screen</b> / <b>Install app</b>. On iPhone use Safari, Share, <b>Add to Home Screen</b>. It works offline after the first visit.</p></div>' +
      '<div class="card"><h2>Danger zone</h2><button class="btn red" data-act="reset">Delete all progress</button></div>';
  }

  // ---------- router ----------
  function route() {
    var parts = (location.hash || '#/today').slice(2).split('/');
    var tab = parts[0] || 'today';
    var html;
    switch (tab) {
      case 'today': html = pageToday(parts[1]); break;
      case 'dsa': html = pageDsa(); break;
      case 'problem': html = pageProblem(parts[1]); tab = 'dsa'; break;
      case 'topic': html = pageTopic(decodeURIComponent(parts.slice(1).join('/'))); tab = 'dsa'; break;
      case 'basics': html = pageBasic(parts[1]); tab = 'dsa'; break;
      case 'design': html = pageDesign(parts[1]); break;
      case 'english': html = pageEnglish(parts[1], parts[2]); break;
      case 'progress': html = pageProgress(); break;
      case 'more': html = pageMore(); break;
      default: html = pageToday(); tab = 'today';
    }
    return { tab: tab, html: html };
  }

  function render() {
    var r = route();
    app.innerHTML = r.html;
    document.querySelectorAll('#tabs a').forEach(function (a) { a.classList.toggle('active', a.dataset.tab === r.tab); });
    var st = Plan.streak(isDayComplete, Plan.today());
    document.getElementById('streak').textContent = st ? st + '-day streak' : '';
  }

  // ---------- timer ----------
  function timerSeconds() {
    return Math.floor((timer.acc + (timer.running ? Date.now() - timer.startedAt : 0)) / 1000);
  }
  function paintTimer() {
    document.getElementById('timer-time').textContent = fmtTime(timerSeconds());
    document.getElementById('timer-label').textContent = timer.label;
    document.getElementById('timer-toggle').textContent = timer.running ? 'Pause' : 'Start';
    var rt = document.getElementById('rec-time');
    if (rt) rt.textContent = fmtTime(Recorder.elapsed());
  }
  setInterval(paintTimer, 1000);

  // ---------- actions ----------
  function today() { return Plan.today(); }
  var actions = {
    'toggle-step': function (el) {
      var ds = dayState(el.dataset.date);
      var day = buildDay(el.dataset.date);
      var step = el.dataset.step;
      if (ds.steps[step]) delete ds.steps[step];
      else if (isStepDone(day, step)) { toast('This step is already complete'); return; }
      else ds.steps[step] = true;
      save();
    },
    quiz: function (el) {
      var id = el.dataset.quiz;
      var q = S.quizzes[id] || (S.quizzes[id] = { answers: {} });
      q.answers[el.dataset.q] = Number(el.dataset.opt);
      save();
    },
    'quiz-reset': function (el) { delete S.quizzes[el.dataset.quiz]; save(); },
    solve: function (el) {
      var id = el.dataset.id;
      var r = S.problems[id] || {};
      r.solvedAt = today();
      r.reviews = [];
      if (timer.label === (PROBLEM_BY_ID[id] || {}).title && timerSeconds() > 30) r.minutes = Math.round(timerSeconds() / 60);
      S.problems[id] = r;
      save();
      toast('Solved. First revision is due tomorrow.');
    },
    unsolve: function (el) {
      var r = S.problems[el.dataset.id];
      if (r) { delete r.solvedAt; r.reviews = []; }
      save();
    },
    conf: function (el) {
      var r = S.problems[el.dataset.id];
      r.conf = el.dataset.conf;
      r.weak = r.conf === 'hard';
      save();
    },
    review: function (el) {
      var id = el.dataset.id;
      var conf = el.dataset.conf;
      var r = Plan.applyReview(S.problems[id], today(), conf);
      if (conf === 'again' || conf === 'hard') r.weak = true;
      if (conf === 'easy') r.weak = false;
      S.problems[id] = r;
      if (!Plan.dueReviews(S.problems, today()).length) dayState(today()).steps.revisit = true;
      save();
    },
    weak: function (el) {
      var r = S.problems[el.dataset.id] || (S.problems[el.dataset.id] = {});
      r.weak = !r.weak;
      save();
    },
    reveal: function (el) { ui.reveal[el.dataset.id] = ui.reveal[el.dataset.id] ? null : (solved(el.dataset.id) ? 'show' : 'ask'); },
    'reveal-show': function (el) { ui.reveal[el.dataset.id] = 'show'; },
    'reveal-hide': function (el) { ui.reveal[el.dataset.id] = null; },
    play: function (el) { ui.vid[el.dataset.k] = true; },
    model: function (el) {
      var st = S.design[el.dataset.id] || {};
      ui.model[el.dataset.id] = (st.answer || '').trim().length >= 40 ? 'show' : 'ask';
    },
    'model-show': function (el) { ui.model[el.dataset.id] = 'show'; },
    'model-hide': function (el) { ui.model[el.dataset.id] = null; },
    'design-done': function (el) {
      var st = S.design[el.dataset.id] || (S.design[el.dataset.id] = {});
      st.done = !st.done;
      save();
    },
    'check-item': function (el) {
      var st = S.design[el.dataset.id] || (S.design[el.dataset.id] = {});
      st.checked = st.checked || {};
      st.checked[el.dataset.idx] = !st.checked[el.dataset.idx];
      save();
    },
    'dsa-filter': function (el) { ui.dsaFilter = el.dataset.f; },
    'next-prompt': function () { ui.freePrompt++; },
    tts: function (el) {
      if (!('speechSynthesis' in window)) { toast('Text-to-speech is not supported in this browser'); return false; }
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(el.dataset.text);
      u.lang = 'en-US';
      u.rate = 0.95;
      speechSynthesis.speak(u);
      return false;
    },
    'timer-toggle': function () {
      if (timer.running) { timer.acc += Date.now() - timer.startedAt; timer.running = false; }
      else { timer.startedAt = Date.now(); timer.running = true; }
      paintTimer();
      return false;
    },
    'timer-reset': function () {
      var had = timerSeconds() > 0;
      timer = { running: false, startedAt: 0, acc: 0, label: 'Focus timer' };
      paintTimer();
      toast(had ? 'Timer reset to 00:00' : 'Timer is already at 00:00 - press Start');
      return false;
    },
    'timer-for': function (el) {
      timer = { running: true, startedAt: Date.now(), acc: 0, label: el.dataset.label };
      paintTimer();
      toast('Timer started: ' + el.dataset.label);
      return false;
    },
    'rec-start': function (el) {
      var ctx = el.dataset.ctx;
      if (Recorder.pending) { toast('Save or discard your last recording first'); return false; }
      Recorder.start(ctx, ui.prompts[ctx], function (evt, text) {
        if (evt === 'transcript') {
          var live = document.getElementById('rec-live');
          if (live) live.textContent = text;
        } else {
          render();
        }
      }).catch(function () { toast('Microphone permission was blocked. Allow it in the browser settings.'); });
      return false;
    },
    'rec-stop': function () { Recorder.stop(); return false; },
    'rec-discard': function () {
      if (ui.pendingUrl) URL.revokeObjectURL(ui.pendingUrl);
      ui.pendingUrl = null;
      Recorder.pending = null;
    },
    'rec-save': function () {
      var p = Recorder.pending;
      if (!p) return;
      var textEl = document.getElementById('rec-text');
      var text = textEl ? textEl.value.trim() : p.transcript;
      var m = Recorder.metrics(text, p.seconds, ENGLISH.fillers);
      var id = 'rec-' + Date.now();
      S.speaking.push({ id: id, ctx: p.ctx, prompt: p.prompt, date: today(), seconds: p.seconds, transcript: text, words: m.words, wpm: m.wpm, fillers: m.fillers.total });
      save();
      Store.audio.put(id, p.blob).catch(function () { toast('Could not store audio on this device'); });
      if (ui.pendingUrl) URL.revokeObjectURL(ui.pendingUrl);
      ui.pendingUrl = null;
      Recorder.pending = null;
      toast('Recording saved');
    },
    'rec-ai': function () {
      var p = Recorder.pending;
      if (!p) return false;
      var textEl = document.getElementById('rec-text');
      var text = textEl ? textEl.value.trim() : p.transcript;
      var prompt = 'I am preparing for a Google software test engineer interview and practising spoken English. ' +
        'This is the transcript of my spoken answer to: "' + p.prompt + '"\n\n"' + text + '"\n\n' +
        'Please: 1) list my grammar mistakes with the corrected sentence, 2) rewrite my answer in natural, confident interview English (similar length), ' +
        '3) give me 3 short tips to sound more fluent. Keep explanations simple.';
      if (navigator.clipboard) navigator.clipboard.writeText(prompt).catch(function () {});
      window.open('https://chatgpt.com/?q=' + encodeURIComponent(prompt), '_blank', 'noopener');
      toast('Copied. If the text did not appear, paste it into ChatGPT or Gemini.');
      return false;
    },
    'rec-play': function (el) {
      Store.audio.get(el.dataset.id).then(function (blob) {
        if (!blob) { toast('Audio is on another device'); return; }
        var url = URL.createObjectURL(blob);
        var a = new Audio(url);
        a.onended = function () { URL.revokeObjectURL(url); };
        a.play();
      });
      return false;
    },
    'rec-delete': function (el) {
      if (!confirm('Delete this recording?')) return false;
      S.speaking = S.speaking.filter(function (r) { return r.id !== el.dataset.id; });
      Store.audio.del(el.dataset.id);
      save();
    },
    export: function () {
      var blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'google-prep-backup-' + today() + '.json';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      return false;
    },
    reset: function () {
      if (!confirm('Delete ALL progress, notes and recordings on this device? Export a backup first if unsure.')) return false;
      S = Store.empty();
      save();
      Store.audio.clear();
      toast('All progress deleted');
    },
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || !actions[el.dataset.act]) return;
    if (el.dataset.act === 'toggle-step') e.preventDefault();
    var y = window.scrollY;
    var rerender = actions[el.dataset.act](el, e);
    if (rerender !== false) {
      render();
      window.scrollTo(0, y);
    }
  });

  app.addEventListener('input', function (e) {
    var el = e.target;
    if (!el.dataset || !el.dataset.bind) return;
    var val = el.type === 'number' ? (el.value === '' ? '' : Number(el.value)) : el.value;
    Store.setPath(S, el.dataset.bind, val);
    saveSoon();
  });

  app.addEventListener('change', function (e) {
    if (e.target.dataset && e.target.dataset.bind) {
      var y = window.scrollY;
      save();
      if (/\.journal$/.test(e.target.dataset.bind)) { render(); window.scrollTo(0, y); }
    }
    if (e.target.id === 'import-file' && e.target.files[0]) {
      e.target.files[0].text().then(function (txt) {
        var data = JSON.parse(txt);
        if (!Store.isValidBackup(data)) throw new Error('bad file');
        S = Object.assign(Store.empty(), data);
        save();
        render();
        toast('Backup imported');
      }).catch(function () { toast('That file is not a Google Prep backup'); });
    }
  });

  app.addEventListener('toggle', function (e) {
    var key = e.target.dataset && e.target.dataset.key;
    if (key) ui.open[key] = e.target.open;
  }, true);

  window.addEventListener('hashchange', function () { render(); window.scrollTo(0, 0); });
  window.addEventListener('storage', function (e) { if (e.key === Store.KEY) { S = Store.load(); render(); } });

  render();
  paintTimer();
})();

// Microphone recording + live transcript (Web Speech API, Chrome/Edge/Android) + speaking metrics.
(function (root) {
  var SpeechRec = root.SpeechRecognition || root.webkitSpeechRecognition;

  function countFillers(text, fillers) {
    var lower = ' ' + text.toLowerCase().replace(/[^a-z' ]+/g, ' ') + ' ';
    var counts = {};
    var total = 0;
    fillers.forEach(function (f) {
      var n = lower.split(' ' + f + ' ').length - 1;
      if (n) { counts[f] = n; total += n; }
    });
    return { total: total, counts: counts };
  }

  function metrics(transcript, seconds, fillers) {
    var words = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
    var minutes = Math.max(seconds, 1) / 60;
    return {
      words: words,
      wpm: Math.round(words / minutes),
      fillers: countFillers(transcript, fillers),
    };
  }

  var Recorder = {
    supported: !!(navigator.mediaDevices && root.MediaRecorder),
    transcriptSupported: !!SpeechRec,
    active: null,
    pending: null,

    start: function (ctx, prompt, onUpdate) {
      var self = this;
      if (self.active) return Promise.resolve();
      return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        var chunks = [];
        var mr = new MediaRecorder(stream);
        var state = { ctx: ctx, prompt: prompt, startedAt: Date.now(), finalText: '', interim: '', mr: mr, stream: stream, rec: null };
        mr.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
        mr.onstop = function () {
          stream.getTracks().forEach(function (t) { t.stop(); });
          var seconds = Math.round((Date.now() - state.startedAt) / 1000);
          var text = (state.finalText + ' ' + state.interim).trim();
          self.pending = {
            ctx: ctx,
            prompt: prompt,
            blob: new Blob(chunks, { type: mr.mimeType || 'audio/webm' }),
            transcript: text,
            seconds: seconds,
          };
          self.active = null;
          onUpdate('stopped');
        };
        mr.start();

        if (SpeechRec) {
          var rec = new SpeechRec();
          rec.lang = 'en-IN';
          rec.continuous = true;
          rec.interimResults = true;
          rec.onresult = function (e) {
            var interim = '';
            for (var i = e.resultIndex; i < e.results.length; i++) {
              if (e.results[i].isFinal) state.finalText += ' ' + e.results[i][0].transcript;
              else interim += e.results[i][0].transcript;
            }
            state.interim = interim;
            onUpdate('transcript', (state.finalText + ' ' + interim).trim());
          };
          rec.onend = function () { if (self.active === state) { try { rec.start(); } catch (err) { /* already started */ } } };
          try { rec.start(); } catch (err) { /* ignore */ }
          state.rec = rec;
        }
        self.active = state;
        onUpdate('started');
      });
    },

    stop: function () {
      var s = this.active;
      if (!s || s.stopping) return;
      s.stopping = true;
      if (s.rec) { var rec = s.rec; s.rec = null; rec.onend = null; try { rec.stop(); } catch (e) { /* ignore */ } }
      setTimeout(function () { if (s.mr.state !== 'inactive') s.mr.stop(); }, 400);
    },

    elapsed: function () {
      return this.active ? Math.round((Date.now() - this.active.startedAt) / 1000) : 0;
    },

    metrics: metrics,
    countFillers: countFillers,
  };

  root.Recorder = Recorder;
})(this);

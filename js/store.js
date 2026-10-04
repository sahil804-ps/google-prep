// Progress lives in localStorage; audio recordings live in IndexedDB (too big for localStorage).
(function (root) {
  var KEY = 'gprep:v1';

  function empty() {
    return { version: 1, days: {}, problems: {}, design: {}, quizzes: {}, speaking: [] };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      return Object.assign(empty(), JSON.parse(raw));
    } catch (e) {
      return empty();
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function setPath(obj, path, value) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (cur[parts[i]] == null || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }

  function getPath(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }

  function isValidBackup(data) {
    return data && typeof data === 'object' && data.days && data.problems && Array.isArray(data.speaking);
  }

  var DB_NAME = 'gprep-audio';
  function db() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore('clips'); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (resolve, reject) {
        var t = d.transaction('clips', mode);
        var r = fn(t.objectStore('clips'));
        t.oncomplete = function () { resolve(r && r.result); };
        t.onerror = function () { reject(t.error); };
      });
    });
  }
  var audio = {
    put: function (id, blob) { return tx('readwrite', function (s) { return s.put(blob, id); }); },
    get: function (id) { return tx('readonly', function (s) { return s.get(id); }); },
    del: function (id) { return tx('readwrite', function (s) { return s.delete(id); }); },
    clear: function () { return tx('readwrite', function (s) { return s.clear(); }); },
  };

  root.Store = {
    KEY: KEY,
    empty: empty,
    load: load,
    save: save,
    setPath: setPath,
    getPath: getPath,
    isValidBackup: isValidBackup,
    audio: audio,
  };
})(this);

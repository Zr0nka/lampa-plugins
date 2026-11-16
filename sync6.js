(function () {
  'use strict';

  var DEFAULT_ADDR = '192.168.1.1:1234';
  var PUSH_DELAY = 10000;
  var RETRY_DELAY = 120000;
  var PULL_INTERVAL = 300000;

  var K_TOKEN = 'sync_token', K_REV = 'sync_rev', K_SHADOW = 'sync_shadow';
  var K_FVAT = 'sync_fv_at', K_AUTO = 'sync_auto_cats', K_MANUAL = 'sync_manual_cats';
  // Настройки плагина (префикс sync_ — в синхронизацию настроек не попадают, пароль на сервер не уходит)
  var K_SRV = 'sync_srv', K_SRV_PASS = 'sync_srv_pass', K_SRV_SAVE = 'sync_srv_save';

  var CATEGORIES = [
    { id: 'file_view',      title: 'Таймкоды и прогресс (file_view)',            defA: true,  defM: true },
    { id: 'favorite',       title: 'Закладки, избранное, история (favorite)',     defA: true,  defM: true },
    { id: 'online_view',    title: 'Просмотренные онлайн (online_view)',          defA: true,  defM: true },
    { id: 'torrents_view',  title: 'Просмотренные торренты (torrents_view)',      defA: true,  defM: true },
    { id: 'search_history', title: 'История поиска (search_history)',             defA: true,  defM: true },
    { id: 'online_choice',  title: 'Выбор озвучки и фильтра в онлайн',            defA: true,  defM: true },
    { id: 'subscribes',     title: 'Подписки (subscribes)',                       defA: false, defM: true },
    { id: 'plugins',        title: 'Установленные плагины (plugins)',             defA: false, defM: false },
    { id: 'settings',       title: 'Настройки Lampa (интерфейс, плеер, парсер)', defA: false, defM: false }
  ];

  var SET_KEYS = ['online_view', 'torrents_view', 'favorite', 'search_history'];
  // Для массивов (не favorite): true, если Lampa кладёт новое элемент в НАЧАЛО массива. Проверка: сделать два разных
  // поиска и выполнить в консоли Lampa.Storage.get('search_history') — новый запрос в конце (false) или в начале (true).
  var NEWEST_FIRST = { online_view: false, torrents_view: false, search_history: false };
  var ORDERED = { favorite: 1, online_view: 1, torrents_view: 1, search_history: 1 };   // наборы, где синхронизируется порядок
  var KV_KEYS = ['online_choice', 'subscribes', 'plugins', 'settings'];
  var EXCLUDE = {
    sync_token: 1, sync_rev: 1, sync_shadow: 1, sync_fv_at: 1, sync_auto_cats: 1, sync_manual_cats: 1,
    sync_srv: 1, sync_srv_pass: 1, sync_srv_save: 1,
    acc_sync: 1, acc_auth: 1, file_view: 1, favorite: 1, online_view: 1, torrents_view: 1,
    search_history: 1, online_choice: 1, subscribes: 1, plugins: 1, platform: 1, device_uid: 1,
    lampa_uid: 1, cub_token: 1, account: 1, account_user: 1, account_use: 1, account_bookmarks: 1,
    time_offset: 1, activity: 1
  };

  // SHA-256 (hex) для строки в UTF-8. crypto.subtle на http недоступен, поэтому своя реализация.
  function sha256(str) {
    var ascii = unescape(encodeURIComponent(str));
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    var pow = Math.pow, maxWord = pow(2, 32), i, j, result = '';
    var words = [], bitLen = ascii.length * 8;
    var hash = [], k = [], primes = 0, composite = {};
    for (var cand = 2; primes < 64; cand++) {
      if (!composite[cand]) {
        for (i = 0; i < 313; i += cand) composite[i] = cand;
        hash[primes] = (pow(cand, 0.5) * maxWord) | 0;
        k[primes++] = (pow(cand, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = ((bitLen / maxWord) | 0);
    words[words.length] = bitLen;
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), old = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        var t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] +
          (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] +
            (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }

  function startPlugin() {
    // Перенос адреса из прежних отдельных полей IP и порт в одно поле «IP:порт»
    (function () {
      var ip = localStorage.getItem('sync_srv_ip'), port = localStorage.getItem('sync_srv_port');
      if (localStorage.getItem(K_SRV) === null && (ip || port)) {
        localStorage.setItem(K_SRV, (ip || '217.25.226.225') + ':' + (port || '933'));
      }
      localStorage.removeItem('sync_srv_ip');
      localStorage.removeItem('sync_srv_port');
    })();

    var pendingFV = {}, dirtySets = {}, dirtyKV = {};
    var pushTimer = null, pushPromise = null, pulling = false, fvShadow = null;
    var shadow = loadJson(K_SHADOW, {});
    var lastShadowStr = localStorage.getItem(K_SHADOW);   // чтобы не перезаписывать хранилище ТВ без изменений

    function log() { console.log.apply(console, ['Sync'].concat([].slice.call(arguments))); }
    function token() { return localStorage.getItem(K_TOKEN); }
    function active() { return !!token() && Lampa.Storage.field('acc_sync'); }
    function synced() { return localStorage.getItem(K_REV) !== null; }
    function fvKey() { return (Lampa.Timeline && Lampa.Timeline.filename && Lampa.Timeline.filename()) || 'file_view'; }
    function clone(o) { return JSON.parse(JSON.stringify(o)); }
    function isObj(o) { return o && typeof o === 'object' && !Array.isArray(o); }
    function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
    function q(p) { return p + '?token=' + encodeURIComponent(token()); }

    function loadJson(k, def) {
      try { var v = JSON.parse(localStorage.getItem(k)); return isObj(v) ? v : def; }
      catch (e) { return def; }
    }

    function saveShadow() {
      try {
        var s = JSON.stringify(shadow);
        if (s === lastShadowStr) return;
        localStorage.setItem(K_SHADOW, s);
        lastShadowStr = s;
      } catch (e) { log('shadow save error:', e.message); }
    }

    function resetLocalState() {
      lastShadowStr = null;
      [K_REV, K_SHADOW, K_FVAT].forEach(function (k) { localStorage.removeItem(k); });
      shadow = {}; pendingFV = {}; dirtySets = {}; dirtyKV = {};
    }

    function bumpFvAt(recs) {
      var at = parseInt(localStorage.getItem(K_FVAT) || '0', 10) || 0;
      for (var h in recs) if (recs[h] && recs[h].updated > at) at = recs[h].updated;
      if (at) localStorage.setItem(K_FVAT, String(at));
    }

    function rawStr(k, def) {
      var v = localStorage.getItem(k);
      v = (v === null) ? '' : String(v).trim();
      return v || def;
    }

    // Адрес сервера хранится одной строкой «IP:порт»
    function serverUrl() {
      var a = rawStr(K_SRV, DEFAULT_ADDR).replace(/\s+/g, '').replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      return 'http://' + a;
    }

    function request(method, path, body, timeout) {
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, serverUrl() + path, true);
        xhr.timeout = timeout || 30000;
        if (body !== undefined) xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); } catch (e) { reject(new Error('Bad JSON')); }
          } else {
            var er = new Error('HTTP ' + xhr.status);
            er.status = xhr.status;
            try { er.body = JSON.parse(xhr.responseText); } catch (e) { er.body = null; }
            reject(er);
          }
        };
        xhr.onerror = function () { reject(new Error('Network error')); };
        xhr.ontimeout = function () { reject(new Error('Timeout')); };
        xhr.send(body === undefined ? null : JSON.stringify(body));
      });
    }

    // ---------- Категории (Фон vs Кнопка) ----------

    function getCats(sKey, isM) {
      var raw = loadJson(sKey, null), out = {};
      CATEGORIES.forEach(function (c) {
        out[c.id] = (raw && has(raw, c.id)) ? !!raw[c.id] : (isM ? c.defM : c.defA);
      });
      return out;
    }

    function isAutoOn(id) { return !!getCats(K_AUTO, false)[id]; }

    function countCats(sKey, isM) {
      var cfg = getCats(sKey, isM), n = 0;
      CATEGORIES.forEach(function (c) { if (cfg[c.id]) n++; });
      return n + ' из ' + CATEGORIES.length;
    }

    function openCatSelector(title, sKey, isM, onDone) {
      var cfg = getCats(sKey, isM), added = {};
      Lampa.Select.show({
        title: title,
        items: CATEGORIES.map(function (c) {
          return { title: c.title, cat_id: c.id, checkbox: true, checked: !!cfg[c.id] };
        }),
        onCheck: function (it) {
          cfg[it.cat_id] = !!it.checked;
          try { localStorage.setItem(sKey, JSON.stringify(cfg)); } catch (e) {}
          if (!isM) {
            if (it.checked) added[it.cat_id] = true;
            else delete added[it.cat_id];
          }
        },
        onBack: function () {
          Lampa.Controller.toggle('settings_component');
          if (onDone) onDone();
          if (!isM && active() && Object.keys(added).length) syncMerge(added, true);
        }
      });
    }

    // ---------- Наборы (sets): favorite, online_view, torrents_view, search_history ----------

    function kk(key, w) { return key === 'favorite' ? w.c + ':' + w.v : String(w); }
    function mapOf(arr) { var m = Object.create(null); arr.forEach(function (e) { m[e.k] = e; }); return m; }

    function readFavoriteRaw() {
      var d = Lampa.Storage.get('favorite', '{}');
      if (isObj(d) && Object.keys(d).some(function (k) { return k !== 'card' && Array.isArray(d[k]) && d[k].length > 0; })) {
        return d;
      }
      try {
        var r = JSON.parse(localStorage.getItem('favorite') || '{}');
        if (isObj(r)) return r;
      } catch (e) {}
      return isObj(d) ? d : {};
    }

    function flat(key) {
      var out = [], seen = Object.create(null);
      function put(k, w) { if (!seen[k]) { seen[k] = 1; out.push({ k: k, w: w }); } }

      if (key === 'favorite') {
        var data = readFavoriteRaw();
        Object.keys(data).forEach(function (cat) {
          var list = data[cat];
          if (cat !== 'card' && Array.isArray(list)) {
            for (var i = list.length - 1; i >= 0; i--) {
              if (list[i] !== null && list[i] !== undefined && list[i] !== '') {
                put(cat + ':' + list[i], { c: cat, v: list[i] });
              }
            }
          }
        });
      } else {
        var arr = Lampa.Storage.get(key, '[]');
        if (Array.isArray(arr)) arr.forEach(function (v) { if (v !== null && v !== undefined && String(v)) put(String(v), String(v)); });
        if (newestFirst(key)) out.reverse();   // внутри плагина порядок всегда «от старых к новым»
      }
      return out;
    }

    // В каком конце массива Lampa хранит новое. Должно быть одинаково на всех устройствах, поэтому задано константой
    // (NEWEST_FIRST вверху файла). true — новое в начале массива, false — в конце.
    function newestFirst(key) { return !!NEWEST_FIRST[key]; }

    function cardsFor(entries) {
      var data = readFavoriteRaw(), out = {}, ids = {};
      if (!Array.isArray(data.card)) return out;
      entries.forEach(function (e) { ids[String(e.w.v)] = 1; });
      data.card.forEach(function (c) { if (c && has(ids, String(c.id))) out[String(c.id)] = c; });
      return out;
    }

    function build(key, entries, cards) {
      if (key !== 'favorite') {
        var list = entries.map(function (e) { return e.w; });
        if (newestFirst(key)) list.reverse();
        Lampa.Storage.set(key, list, true);
        return;
      }
      var data = readFavoriteRaw();
      var oldCards = Array.isArray(data.card) ? data.card : [], cats = {}, need = {}, list = [], have = {};

      Object.keys(data).forEach(function (c) { if (c !== 'card' && Array.isArray(data[c])) cats[c] = []; });
      entries.forEach(function (e) {
        if (!cats[e.w.c]) cats[e.w.c] = [];
        cats[e.w.c].unshift(e.w.v);
        need[String(e.w.v)] = 1;
      });
      oldCards.forEach(function (c) {
        var id = c && String(c.id);
        if (id && has(need, id) && !have[id]) { list.push(c); have[id] = 1; }
      });
      for (var id in need) if (!have[id] && cards && has(cards, id)) list.push(cards[id]);
      for (var c in cats) data[c] = cats[c];
      data.card = list;

      localStorage.setItem('favorite', JSON.stringify(data));
      Lampa.Storage.set('favorite', data, true);
      try { Lampa.Favorite.init(); Lampa.Favorite.read(true); } catch (e) {}
    }

    function setShadow(key, k, w) {
      if (!shadow[key]) shadow[key] = {};
      shadow[key][k] = key === 'favorite' ? w : 1;
    }

    // ---------- Порядок элементов (перемещение наверх) ----------
    // shadow['ord_<key>'] — порядок ключей (от старых к новым) в том виде, как он на сервере по нашим сведениям.
    // Сравнивая с ним текущий локальный порядок, находим элементы, которых подняли наверх на этом устройстве.

    function ordKey(key) { return 'ord_' + key; }

    // индексы массива, НЕ входящие в наибольшую возрастающую подпоследовательность (т.е. «переехавшие»)
    function lisKeep(arr) {
      var tails = [], tailIdx = [], prev = [], i, lo, hi, mid;
      for (i = 0; i < arr.length; i++) {
        lo = 0; hi = tails.length;
        while (lo < hi) { mid = (lo + hi) >> 1; if (tails[mid] < arr[i]) lo = mid + 1; else hi = mid; }
        tails[lo] = arr[i]; tailIdx[lo] = i; prev[i] = lo > 0 ? tailIdx[lo - 1] : -1;
      }
      var keep = [], j = tails.length ? tailIdx[tails.length - 1] : -1;
      while (j >= 0) { keep[j] = true; j = prev[j]; }
      return keep;
    }

    function detectMoves(key, cur) {
      var ord = shadow[ordKey(key)];
      if (!ORDERED[key] || !Array.isArray(ord) || !ord.length) return [];
      var base = shadow[key] || {}, inOrd = Object.create(null), inCur = mapOf(cur), groups = Object.create(null), out = [];
      ord.forEach(function (k) { inOrd[k] = 1; });
      cur.forEach(function (e) {
        if (!has(base, e.k) || !inOrd[e.k]) return;
        var c = key === 'favorite' ? e.w.c : '';
        (groups[c] = groups[c] || { a: [], b: [] }).a.push(e);
      });
      ord.forEach(function (k) {
        var c = key === 'favorite' ? k.slice(0, k.indexOf(':')) : '';
        if (groups[c] && inCur[k] && has(base, k)) groups[c].b.push(k);
      });
      Object.keys(groups).forEach(function (c) {
        var g = groups[c], pos = Object.create(null);
        if (g.a.length !== g.b.length) return;
        g.b.forEach(function (k, i) { pos[k] = i; });
        // при неоднозначности «переехавшими» считаем более новые элементы (Lampa поднимает наверх, т.е. в конец списка),
        // поэтому ищем подпоследовательность справа налево
        var seq = g.a.map(function (e) { return -pos[e.k]; }).reverse(), kr = lisKeep(seq), n = g.a.length;
        g.a.forEach(function (e, i) { if (!kr[n - 1 - i]) out.push(e); });
      });
      return out;
    }

    // применить к сохранённому порядку операции: удалить delKeys, поднять touchKeys наверх (в заданном порядке)
    function orderApply(key, delKeys, touchKeys) {
      if (!ORDERED[key]) return;
      var ord = shadow[ordKey(key)], drop = Object.create(null);
      if (!Array.isArray(ord)) ord = [];
      delKeys.forEach(function (k) { drop[k] = 1; });
      touchKeys.forEach(function (k) { drop[k] = 1; });
      ord = ord.filter(function (k) { return !drop[k]; });
      touchKeys.forEach(function (k) { ord.push(k); });
      shadow[ordKey(key)] = ord;
    }

    // Если сохранённого порядка ещё нет (первый запуск этой версии) — берём порядок с сервера как точку отсчёта.
    function ensureOrder() {
      var miss = Object.keys(ORDERED).filter(function (k) { return !Array.isArray(shadow[ordKey(k)]); });
      if (!token() || !miss.length) return Promise.resolve();
      return request('GET', q('/lampa/state') + '&since=0').then(function (res) {
        if (res && res.success && res.sets) {
          miss.forEach(function (k) {
            if (res.sets[k]) shadow[ordKey(k)] = (res.sets[k].add || []).map(function (w) { return kk(k, w); });
          });
          saveShadow();
        }
      })['catch'](function () {});
    }

    function diff(key) {
      var cur = flat(key), map = mapOf(cur), base = shadow[key] || {};
      return {
        add: cur.filter(function (e) { return !has(base, e.k); }),
        del: Object.keys(base).filter(function (k) { return !map[k]; }).map(function (k) {
          return key === 'favorite' ? base[k] : k;
        }),
        bump: detectMoves(key, cur)
      };
    }

    // ---------- Словари и настройки (KV) ----------

    function allowSetting(k) {
      if (!k || EXCLUDE[k] || k === fvKey()) return false;
      if (/^(sync_|weather_|cache_|online_choice_|file_view|metric_|timetable|notices)/.test(k)) return false;
      var raw = localStorage.getItem(k);
      return raw !== null && raw.length <= 15000;
    }

    function parseOcKey(ck) {
      var i = ck.indexOf(':');
      if (i === -1) return { sk: 'online_choice', id: ck };
      var p = ck.slice(0, i);
      return { sk: p === '__main__' ? 'online_choice' : p, id: ck.slice(i + 1) };
    }

    function readLocalKV(catId) {
      var out = {}, i, k;
      if (catId === 'online_choice') {
        var oc = Lampa.Storage.get('online_choice', '{}');
        if (isObj(oc)) Object.keys(oc).forEach(function (id) {
          if (isObj(oc[id])) out['__main__:' + id] = JSON.stringify(oc[id]);
        });
        for (i = 0; i < localStorage.length; i++) {
          k = localStorage.key(i);
          if (k && k.indexOf('online_choice_') === 0) {
            var sub = Lampa.Storage.get(k, '{}');
            if (isObj(sub)) Object.keys(sub).forEach(function (id) {
              if (isObj(sub[id])) out[k + ':' + id] = JSON.stringify(sub[id]);
            });
          }
        }
      } else if (catId === 'subscribes' || catId === 'plugins') {
        var arr = Lampa.Storage.get(catId, '[]');
        if (Array.isArray(arr)) arr.forEach(function (it, idx) {
          if (it) out[String(it.id || it.url || ('idx_' + idx))] = JSON.stringify(it);
        });
      } else if (catId === 'settings') {
        for (i = 0; i < localStorage.length; i++) {
          k = localStorage.key(i);
          if (allowSetting(k)) out[k] = localStorage.getItem(k);
        }
      }
      return out;
    }

    function diffKV(catId, forceAll) {
      var cur = readLocalKV(catId), base = shadow['kv_' + catId] || {}, set = {}, del = [];
      Object.keys(cur).forEach(function (k) { if (forceAll || base[k] !== cur[k]) set[k] = cur[k]; });
      if (!forceAll) Object.keys(base).forEach(function (k) { if (!has(cur, k)) del.push(k); });
      return { set: set, del: del };
    }

    function writeRawSetting(k, rawStr) {
      if (!k || EXCLUDE[k] || k === fvKey()) return false;
      if (/^(sync_|weather_|cache_|online_choice_|file_view|metric_|timetable|notices)/.test(k)) return false;
      var prev = localStorage.getItem(k);
      if (prev === rawStr) return false;
      localStorage.setItem(k, rawStr);
      // Обновляем внутренний кеш Lampa.Storage только для не-массивов, чтобы не сломать menu_sort
      if (Lampa.Storage && Lampa.Storage.set) {
        try {
          var parsed = JSON.parse(rawStr);
          if (!Array.isArray(parsed)) Lampa.Storage.set(k, parsed, true);
        } catch (e) {
          Lampa.Storage.set(k, rawStr, true);
        }
      }
      return true;
    }

    function applyRemoteKV(res, allowedMap, replace) {
      var kv = res.kv || {}, settingsChanged = false;
      KV_KEYS.forEach(function (catId) {
        if (!allowedMap[catId] || !kv[catId]) return;
        var incSet = kv[catId].set || {}, incDel = kv[catId].del || [];
        var skey = 'kv_' + catId, base = shadow[skey] || {};

        if (res.full) {
          if (!Object.keys(incSet).length) return; // Не стираем локальные настройки/плагины, если на сервере категория пуста
          var localCur = readLocalKV(catId), merged = {}, ns = {};
          Object.keys(incSet).forEach(function (k) {
            ns[k] = incSet[k];
            if (!replace && has(base, k) && !has(localCur, k)) return;
            merged[k] = (!replace && has(localCur, k) && localCur[k] !== base[k]) ? localCur[k] : incSet[k];
          });
          if (!replace) Object.keys(localCur).forEach(function (k) {
            if (!has(base, k) && !has(merged, k)) merged[k] = localCur[k];
          });
          shadow[skey] = ns;

          if (catId === 'online_choice') {
            var byStore = {};
            Object.keys(merged).forEach(function (ck) {
              var p = parseOcKey(ck);
              if (!byStore[p.sk]) byStore[p.sk] = {};
              try { byStore[p.sk][p.id] = JSON.parse(merged[ck]); } catch (e) {}
            });
            Object.keys(byStore).forEach(function (sk) { Lampa.Storage.set(sk, byStore[sk], true); });
          } else if (catId === 'subscribes' || catId === 'plugins') {
            var list = [];
            Object.keys(merged).forEach(function (k) { try { list.push(JSON.parse(merged[k])); } catch (e) {} });
            Lampa.Storage.set(catId, list, true);
            settingsChanged = true;
          } else if (catId === 'settings') {
            if (replace) {
              Object.keys(localCur).forEach(function (k) {
                if (!has(merged, k)) {
                  localStorage.removeItem(k);
                  settingsChanged = true;
                }
              });
            }
            Object.keys(merged).forEach(function (k) {
              if (writeRawSetting(k, merged[k])) settingsChanged = true;
            });
          }
        } else {
          if (!shadow[skey]) shadow[skey] = {};
          var sh = shadow[skey];
          if (catId === 'online_choice') {
            var stores = {};
            incDel.forEach(function (ck) {
              var p = parseOcKey(ck);
              if (!stores[p.sk]) stores[p.sk] = Lampa.Storage.get(p.sk, '{}');
              if (isObj(stores[p.sk])) delete stores[p.sk][p.id];
              delete sh[ck];
            });
            Object.keys(incSet).forEach(function (ck) {
              var p = parseOcKey(ck);
              if (!isObj(stores[p.sk])) stores[p.sk] = isObj(Lampa.Storage.get(p.sk, '{}')) ? Lampa.Storage.get(p.sk, '{}') : {};
              try { stores[p.sk][p.id] = JSON.parse(incSet[ck]); sh[ck] = incSet[ck]; } catch (e) {}
            });
            Object.keys(stores).forEach(function (sk) { Lampa.Storage.set(sk, stores[sk], true); });
          } else if (catId === 'subscribes' || catId === 'plugins') {
            var arr = Lampa.Storage.get(catId, '[]'), map = {}, order = [], ch = false;
            if (Array.isArray(arr)) arr.forEach(function (it, idx) {
              if (!it) return;
              var id = String(it.id || it.url || ('idx_' + idx));
              if (!has(map, id)) order.push(id);
              map[id] = it;
            });
            incDel.forEach(function (k) { if (has(map, k)) { delete map[k]; ch = true; } delete sh[k]; });
            Object.keys(incSet).forEach(function (k) {
              try { if (!has(map, k)) order.push(k); map[k] = JSON.parse(incSet[k]); sh[k] = incSet[k]; ch = true; } catch (e) {}
            });
            if (ch) {
              Lampa.Storage.set(catId, order.filter(function (k) { return has(map, k); }).map(function (k) { return map[k]; }), true);
              settingsChanged = true;
            }
          } else if (catId === 'settings') {
            incDel.forEach(function (k) {
              if (localStorage.getItem(k) !== null) {
                localStorage.removeItem(k);
                settingsChanged = true;
              }
              delete sh[k];
            });
            Object.keys(incSet).forEach(function (k) {
              if (writeRawSetting(k, incSet[k])) settingsChanged = true;
              sh[k] = incSet[k];
            });
          }
        }
      });
      return settingsChanged;
    }

    // ---------- Отправка и получение ----------

    function schedulePush(delay) {
      clearTimeout(pushTimer);
      pushTimer = setTimeout(push, delay || PUSH_DELAY);
    }

    function push(customMap) {
      if ((!active() && !customMap) || (!synced() && !customMap)) return Promise.resolve();
      if (pushPromise) return pushPromise;

      var allowed = customMap || getCats(K_AUTO, false);
      var ok = function (id) { return !!allowed[id]; };
      var fv = ok('file_view') ? pendingFV : {};
      var keys = Object.keys(dirtySets).filter(ok);
      var kvKeys = Object.keys(dirtyKV).filter(ok);
      var sets = {}, ops = {}, cards = {}, kvOut = {}, kvSnap = {};

      keys.forEach(function (key) {
        var d = diff(key);
        if (!d.add.length && !d.del.length && !d.bump.length) return;
        ops[key] = d;
        sets[key] = { add: d.add.map(function (e) { return e.w; }), del: d.del, bump: d.bump.map(function (e) { return e.w; }) };
        if (key === 'favorite') Object.assign(cards, cardsFor(d.add.concat(d.bump)));
      });

      kvKeys.forEach(function (catId) {
        var d = diffKV(catId, false);
        if (Object.keys(d.set).length || d.del.length) { kvOut[catId] = d; kvSnap[catId] = d; }
      });

      if (!Object.keys(fv).length && !Object.keys(ops).length && !Object.keys(kvOut).length) {
        keys.forEach(function (k) { delete dirtySets[k]; });
        kvKeys.forEach(function (k) { delete dirtyKV[k]; });
        return Promise.resolve();
      }

      if (ok('file_view')) pendingFV = {};
      keys.forEach(function (k) { delete dirtySets[k]; });
      kvKeys.forEach(function (k) { delete dirtyKV[k]; });

      pushPromise = request('POST', q('/lampa/push'), { file_view: fv, sets: sets, cards: cards, kv: kvOut }).then(function (res) {
        pushPromise = null;
        Object.keys(ops).forEach(function (key) {
          ops[key].add.forEach(function (e) { setShadow(key, e.k, e.w); });
          ops[key].del.forEach(function (w) { if (shadow[key]) delete shadow[key][kk(key, w)]; });
          orderApply(key, ops[key].del.map(function (w) { return kk(key, w); }),
            ops[key].add.concat(ops[key].bump).map(function (e) { return e.k; }));
        });
        Object.keys(kvSnap).forEach(function (catId) {
          var sk = 'kv_' + catId;
          if (!shadow[sk]) shadow[sk] = {};
          Object.keys(kvSnap[catId].set).forEach(function (k) { shadow[sk][k] = kvSnap[catId].set[k]; });
          kvSnap[catId].del.forEach(function (k) { delete shadow[sk][k]; });
        });
        saveShadow();
        bumpFvAt(fv);
        log('отправлено, изменений:', res.changed);
        return res;
      })['catch'](function (e) {
        pushPromise = null;
        for (var h in fv) if (!pendingFV[h]) pendingFV[h] = fv[h];
        keys.forEach(function (k) { dirtySets[k] = true; });
        kvKeys.forEach(function (k) { dirtyKV[k] = true; });
        schedulePush(RETRY_DELAY);
      });

      return pushPromise;
    }

    function applyFileView(res, allowedMap, replace) {
      if (!allowedMap['file_view']) return;
      var ids = Object.keys(res.file_view || {});
      if (!ids.length) return; // Не стираем локальные таймкоды, если на сервере пусто
      var key = fvKey(), local = Lampa.Storage.get(key, '{}'), ch = false;
      if (!isObj(local)) local = {};

      ids.forEach(function (h) {
        var inc = res.file_view[h], cur = local[h];
        if (!replace && pendingFV[h]) return;
        if (!replace && isObj(cur) && cur.updated && inc.updated && cur.updated > inc.updated) {
          pendingFV[h] = clone(cur);
          return;
        }
        local[h] = Object.assign({ duration: 0, time: 0, percent: 0 }, inc);
        if (fvShadow) fvShadow[h] = JSON.stringify(local[h]);
        ch = true;
      });
      if (ch) {
        Lampa.Storage.set(key, local, true);
        if (Lampa.Timeline && Lampa.Timeline.read) Lampa.Timeline.read();
        bumpFvAt(res.file_view || {});
      }
    }

    function applySets(res, allowedMap, replace) {
      var sets = res.sets || {}, cards = res.cards || {};
      SET_KEYS.forEach(function (key) {
        if (!allowedMap[key] || !sets[key]) return;
        var add = sets[key].add || [], del = sets[key].del || [];
        if (!add.length && !del.length) return; // Не затираем локальный список, если на сервере категория пуста

        var local = flat(key), lmap = mapOf(local), entries, ch = true;
        var pend = replace ? [] : detectMoves(key, local);   // локальные перемещения, ещё не ушедшие на сервер
        if (res.full) {
          var remote = add.map(function (w) { return { k: kk(key, w), w: w }; });
          var rmap = mapOf(remote), base = shadow[key] || {}, ns = {};
          entries = remote.slice();
          if (!replace) {
            local.forEach(function (e) { if (!has(base, e.k) && !rmap[e.k]) entries.push(e); });
            entries = entries.filter(function (e) { return !(has(base, e.k) && !lmap[e.k]); });
          }
          remote.forEach(function (e) { ns[e.k] = key === 'favorite' ? e.w : 1; });
          if (!replace) Object.keys(base).forEach(function (k) { if (!lmap[k] && !has(ns, k)) ns[k] = base[k]; });
          shadow[key] = ns;
          if (ORDERED[key]) shadow[ordKey(key)] = remote.map(function (e) { return e.k; });
        } else {
          var gone = Object.create(null), touch = [];
          del.forEach(function (w) { gone[kk(key, w)] = 1; });
          entries = local.filter(function (e) { return !gone[e.k]; });
          ch = entries.length !== local.length;
          add.forEach(function (w) {
            var k = kk(key, w);
            setShadow(key, k, w);
            touch.push(k);
            if (!lmap[k]) { entries.push({ k: k, w: w }); lmap[k] = 1; ch = true; }
            else if (ORDERED[key]) {   // элемент уже есть, но его подняли наверх на другом устройстве
              entries = entries.filter(function (e) { return e.k !== k; });
              entries.push({ k: k, w: w });
              ch = true;
            }
          });
          Object.keys(gone).forEach(function (k) { if (shadow[key]) delete shadow[key][k]; });
          orderApply(key, Object.keys(gone), touch);
        }
        if (ch && pend.length) {   // наши неотправленные перемещения остаются выше чужих
          var pk = Object.create(null), present = mapOf(entries);
          pend.forEach(function (e) { pk[e.k] = 1; });
          entries = entries.filter(function (e) { return !pk[e.k]; }).concat(pend.filter(function (e) { return present[e.k]; }));
        }
        if (ch) build(key, entries, cards);
      });
    }

    function pull(forceFull, replace, customMap) {
      if ((!active() && !customMap) || pulling) return Promise.resolve(null);
      pulling = true;
      var catMap = customMap || getCats(K_AUTO, false);
      var since = forceFull ? 0 : parseInt(localStorage.getItem(K_REV) || '0', 10) || 0;

      var prevRev = parseInt(localStorage.getItem(K_REV) || '0', 10) || 0;
      return request('GET', q('/lampa/state') + '&since=' + since).then(function (res) {
        pulling = false;
        if (!res || !res.success) throw new Error('Bad state');

        // Защита от стирания локальных данных, если сервер был сброшен (ревизия сервера стала 0 или меньше локальной)
        if ((prevRev > 0 && res.rev < prevRev) || res.rev === 0) {
          shadow = {};
          saveShadow();
          if (res.rev === 0 && !replace) {
            // Сервер пуст после сброса — ничего не удаляем локально, а ставим локальные данные в очередь на отправку
            SET_KEYS.forEach(function (k) { if (catMap[k]) dirtySets[k] = true; });
            KV_KEYS.forEach(function (k) { if (catMap[k]) dirtyKV[k] = true; });
            localStorage.setItem(K_REV, '0');
            schedulePush(500);
            return res;
          }
        }

        applyFileView(res, catMap, replace);
        applySets(res, catMap, replace);
        var settingsChanged = applyRemoteKV(res, catMap, replace);
        saveShadow();

        var autoCfg = getCats(K_AUTO, false);
        var coversAll = !customMap || Object.keys(autoCfg).every(function (k) { return !autoCfg[k] || !!customMap[k]; });
        if (coversAll) localStorage.setItem(K_REV, String(res.rev));

        if (Object.keys(pendingFV).length || Object.keys(dirtySets).length || Object.keys(dirtyKV).length) schedulePush();
        res._settingsChanged = settingsChanged;
        return res;
      })['catch'](function (e) {
        pulling = false;
        log('pull error:', e.message);
        return null;
      });
    }

    // 1. Двустороннее объединение (при включении фоновой синхронизации и старте)
    function syncMerge(catMap, silent) {
      if (!token()) return silent || Lampa.Noty.show('Вы не зашли в аккаунт');
      if (!Object.keys(catMap).some(function (k) { return !!catMap[k]; })) {
        return silent || Lampa.Noty.show('Не выбрано ни одной категории');
      }
      if (!silent) Lampa.Noty.show('Синхронизация...');

      SET_KEYS.forEach(function (k) { if (catMap[k]) dirtySets[k] = true; });
      KV_KEYS.forEach(function (k) { if (catMap[k]) dirtyKV[k] = true; });

      var wait = ensureOrder().then(function () {
        return pushPromise ? pushPromise.then(function () { return push(catMap); }) : push(catMap);
      });
      return wait.then(function (pushed) {
        var pushedN = (pushed && pushed.changed) || 0;
        var fv = {}, sets = {}, cards = {}, kvOut = {};
        if (catMap['file_view']) {
          var local = Lampa.Storage.get(fvKey(), '{}');
          if (isObj(local)) for (var h in local) if (isObj(local[h])) fv[h] = local[h];
        }
        SET_KEYS.forEach(function (k) {
          if (!catMap[k]) return;
          var entries = flat(k);
          if (entries.length) {
            sets[k] = { add: entries.map(function (e) { return e.w; }), del: [] };
            if (k === 'favorite') Object.assign(cards, cardsFor(entries));
          }
        });
        KV_KEYS.forEach(function (catId) {
          if (!catMap[catId]) return;
          var hasSh = shadow['kv_' + catId] && Object.keys(shadow['kv_' + catId]).length > 0;
          var d = diffKV(catId, !hasSh);
          if (Object.keys(d.set).length || d.del.length) kvOut[catId] = { set: d.set, del: d.del };
        });

        return request('POST', q('/lampa/push'), { bulk: true, file_view: fv, sets: sets, cards: cards, kv: kvOut }).then(function (res) {
          if (catMap['file_view']) { pendingFV = {}; bumpFvAt(fv); }
          return pull(true, true, catMap).then(function (got) {
            if (!got) throw new Error('pull failed');
            if (!silent) Lampa.Noty.show('Синхронизировано (изменений на сервере: ' + (res.changed + pushedN) + ')');
          });
        });
      })['catch'](function (e) {
        log('syncMerge error', e.message);
        if (!silent) Lampa.Noty.show('Ошибка синхронизации');
      });
    }

    // 2. Ручной ЭКСПОРТ на сервер: гарантированно отправляет выбранные категории и перезаписывает сервер
    function exportToServer(catMap) {
      if (!token()) return Lampa.Noty.show('Вы не зашли в аккаунт');
      if (!Object.keys(catMap).some(function (k) { return !!catMap[k]; })) {
        return Lampa.Noty.show('Не выбрано ни одной категории для экспорта');
      }
      Lampa.Noty.show('Экспорт на сервер...');

      var wait = pushPromise ? pushPromise : Promise.resolve();
      return wait.then(function () {
        var fv = {}, sets = {}, cards = {}, kvOut = {}, kvSnap = {};
        var now = Date.now(), sentDetails = [];

        if (catMap['file_view']) {
          var local = Lampa.Storage.get(fvKey(), '{}'), fvCount = 0;
          if (isObj(local)) {
            for (var h in local) {
              if (isObj(local[h])) {
                var rec = clone(local[h]);
                rec.updated = Math.max(now, (rec.updated || 0) + 1);
                fv[h] = rec;
                fvCount++;
              }
            }
          }
          sentDetails.push('таймкодов: ' + fvCount);
        }

        SET_KEYS.forEach(function (k) {
          if (!catMap[k]) return;
          var entries = flat(k);
          if (!entries.length) return; // Не затираем сервер пустым списком при экспорте
          sets[k] = { add: entries.map(function (e) { return e.w; }), del: [], replace: true };
          if (k === 'favorite') {
            Object.assign(cards, cardsFor(entries));
            sentDetails.push('избранное/история: ' + entries.length);
          } else if (k === 'torrents_view') {
            sentDetails.push('торренты: ' + entries.length);
          }
        });

        KV_KEYS.forEach(function (catId) {
          if (!catMap[catId]) return;
          var cur = readLocalKV(catId);
          kvOut[catId] = { set: cur, del: [], overwrite: true, replace: true };
          kvSnap[catId] = cur;
          if (catId === 'settings') sentDetails.push('настроек: ' + Object.keys(cur).length);
        });

        // Важно: передаём bulk: false и export: true, чтобы сервер перезаписал любые существующие записи
        return request('POST', q('/lampa/push'), {
          bulk: false,
          export: true,
          file_view: fv,
          sets: sets,
          cards: cards,
          kv: kvOut
        }).then(function (res) {
          if (catMap['file_view']) {
            pendingFV = {};
            bumpFvAt(fv);
          }
          SET_KEYS.forEach(function (k) {
            if (!catMap[k]) return;
            delete dirtySets[k];
            shadow[k] = {};
            flat(k).forEach(function (e) { setShadow(k, e.k, e.w); });
            if (ORDERED[k]) shadow[ordKey(k)] = flat(k).map(function (e) { return e.k; });
          });
          KV_KEYS.forEach(function (catId) {
            if (!catMap[catId]) return;
            delete dirtyKV[catId];
            shadow['kv_' + catId] = clone(kvSnap[catId] || {});
          });
          saveShadow();
          var info = sentDetails.length ? ' (' + sentDetails.join(', ') + ')' : '';
          Lampa.Noty.show('Экспорт завершён, обновлено на сервере: ' + res.changed + info);
        });
      })['catch'](function (e) {
        log('export error', e.message);
        Lampa.Noty.show('Ошибка экспорта: ' + e.message);
      });
    }

    // 3. Ручной ИМПОРТ с сервера: загружает полное состояние с сервера и сразу перезагружает Lampa при изменении настроек
    function importFromServer(catMap) {
      if (!token()) return Lampa.Noty.show('Вы не зашли в аккаунт');
      if (!Object.keys(catMap).some(function (k) { return !!catMap[k]; })) {
        return Lampa.Noty.show('Не выбрано ни одной категории для импорта');
      }
      Lampa.Noty.show('Импорт с сервера...');

      if (catMap['file_view']) pendingFV = {};
      SET_KEYS.forEach(function (k) { if (catMap[k]) delete dirtySets[k]; });
      KV_KEYS.forEach(function (k) { if (catMap[k]) delete dirtyKV[k]; });

      pulling = false; // сбрасываем блокировку, чтобы ручной импорт сработал мгновенно
      return pull(true, true, catMap).then(function (got) {
        if (!got) throw new Error('pull failed');
        if (got._settingsChanged || catMap['settings'] || catMap['plugins']) {
          Lampa.Noty.show('Импорт завершён! Перезапуск Lampa для применения настроек...');
          setTimeout(function () { window.location.reload(); }, 1500);
        } else {
          Lampa.Noty.show('Импорт выбранных категорий завершён');
        }
      })['catch'](function (e) {
        log('import error', e.message);
        Lampa.Noty.show('Ошибка импорта с сервера');
      });
    }

    function startup() {
      var autoMap = getCats(K_AUTO, false);
      if (!synced()) return syncMerge(autoMap, true);
      SET_KEYS.forEach(function (k) { if (autoMap[k]) dirtySets[k] = true; });
      KV_KEYS.forEach(function (k) { if (autoMap[k]) dirtyKV[k] = true; });
      if (isAutoOn('file_view')) {
        var at = parseInt(localStorage.getItem(K_FVAT) || '0', 10) || 0, local = Lampa.Storage.get(fvKey(), '{}');
        if (at && isObj(local)) for (var h in local) if (isObj(local[h]) && local[h].updated > at && !pendingFV[h]) pendingFV[h] = clone(local[h]);
      }
      return ensureOrder().then(function () { return push(); }).then(function () { return pull(); });
    }

    // ---------- События и таймеры ----------

    if (Lampa.Timeline && Lampa.Timeline.listener && Lampa.Timeline.listener.follow) {
      Lampa.Timeline.listener.follow('update', function (e) {
        if (active() && isAutoOn('file_view') && e && e.data && e.data.road) {
          pendingFV[e.data.hash] = clone(e.data.road);
          schedulePush();
        }
      });
    } else {
      var curFv = Lampa.Storage.get(fvKey(), '{}');
      fvShadow = {};
      if (isObj(curFv)) for (var h in curFv) fvShadow[h] = JSON.stringify(curFv[h]);
    }

    Lampa.Storage.listener.follow('change', function (e) {
      if (!active() || !e || !e.name) return;
      if (SET_KEYS.indexOf(e.name) !== -1 && isAutoOn(e.name)) { dirtySets[e.name] = true; schedulePush(); }
      else if ((e.name === 'online_choice' || e.name.indexOf('online_choice_') === 0) && isAutoOn('online_choice')) { dirtyKV['online_choice'] = true; schedulePush(); }
      else if (KV_KEYS.indexOf(e.name) !== -1 && isAutoOn(e.name)) { dirtyKV[e.name] = true; schedulePush(); }
      else if (fvShadow && e.name === fvKey() && isAutoOn('file_view') && isObj(e.value)) {
        for (var k in e.value) {
          var s = JSON.stringify(e.value[k]);
          if (fvShadow[k] !== s) { fvShadow[k] = s; if (isObj(e.value[k])) pendingFV[k] = clone(e.value[k]); }
        }
        schedulePush();
      } else if (isAutoOn('settings') && allowSetting(e.name)) { dirtyKV['settings'] = true; schedulePush(); }
    });

    document.addEventListener('visibilitychange', function () { if (document.hidden) push(); else pull(); });
    setInterval(function () { if (!document.hidden) pull(); }, PULL_INTERVAL);

    // ---------- Управление сервером (пароль, добавление пользователей) ----------

    var adminOk = false, adminPass = '', newToken = '';
    var srvState = '', passState = '', checkSeq = 0;   // '' | 'wait' | 'active' (зелёный) | 'error' (красный)

    // Огонёк слева от названия пункта, как у TorrServer (зелёный / красный / жёлтый при проверке).
    // У пунктов, добавленных плагином, штатного индикатора Lampa нет, поэтому рисуем свой.
    try {
      if (!$('#sync-status-css').length) {
        $('head').append('<style id="sync-status-css">' +
          '.sync-status{display:none;position:absolute;left:-1.05em;top:.38em;width:.5em;height:.5em;border-radius:50%;background:#8bc34a}' +
          '.sync-status.wait{display:block;background:#ffc107}' +
          '.sync-status.active{display:block;background:#8bc34a}' +
          '.sync-status.error{display:block;background:#f44336}</style>');
      }
    } catch (e) { log('style error:', e.message); }

    var statusEls = {};   // последний отрисованный пункт для каждого поля

    function statusOn(it, state) {
      if (!it || !it.length) return;
      var name = it.find('.settings-param__name').first();
      if (!name.length) return;
      var d = name.find('.sync-status');
      if (!d.length) {
        name.css({ position: 'relative', overflow: 'visible' });
        d = $('<span class="sync-status"></span>');
        name.append(d);
      }
      d.removeClass('active error wait');
      if (state) d.addClass(state);
    }

    function bindStatus(key, it, state) {
      statusEls[key] = it;
      statusOn(it, state);
    }

    function refreshStatus() {
      var root = $('body'), st = {};
      st[K_SRV] = srvState;
      st[K_SRV_PASS] = passState;
      Object.keys(st).forEach(function (key) {
        statusOn(root.find('div[data-name="' + key + '"]'), st[key]);
        if (statusEls[key]) statusOn(statusEls[key], st[key]);
      });
    }

    // Есть ли по указанному адресу сервер lampa-sync (отвечает на /checkToken даже с пустым токеном)
    function checkServer() {
      var seq = ++checkSeq;
      srvState = 'wait';
      refreshStatus();
      return request('POST', '/checkToken', { token: '' }, 6000).then(function (res) {
        return !!(res && (res.userId || res.success === false));
      })['catch'](function () { return false; }).then(function (ok) {
        if (seq === checkSeq) { srvState = ok ? 'active' : 'error'; refreshStatus(); }
        return ok;
      });
    }

    function savedPass() { return (localStorage.getItem(K_SRV_PASS) || '').trim(); }
    function vis(it, hidden) { it.toggleClass('hide', !!hidden); }

    function copyText(t, prefix) {
      if (!t) return;
      if (Lampa.Utils && Lampa.Utils.copyTextToClipboard) {
        Lampa.Utils.copyTextToClipboard(t, function () { Lampa.Noty.show(prefix + t); });
      } else Lampa.Noty.show(prefix + t);
    }

    function refreshAuthUI(root) {
      root = root || $('body');
      var has = !!token();
      vis(root.find('div[data-name="acc_auth"]'), has);
      ['acc_status_title', 'acc_token_info', 'acc_exit'].forEach(function (n) {
        vis(root.find('div[data-name="' + n + '"]'), !has);
      });
    }

    function refreshAdminUI() {
      var root = $('body');
      vis(root.find('div[data-name="acc_adm_add"]'), !adminOk);
      var res = root.find('div[data-name="acc_adm_result"]');
      vis(res, !(adminOk && newToken));
      res.find('.settings-param__name').text(newToken ? 'Пользователь добавлен. Токен: ' + newToken : '');
      refreshStatus();
    }

    function adminError(e) {
      var s = e && e.status;
      if (s === 403 && e.body && e.body.disabled) return 'off';
      if (s === 403 && e.body && e.body.stale) return 'error';   // вызов устарел — просто повторить
      if (s === 403) return 'bad';
      if (s === 429) return 'locked';
      return 'error';
    }

    function adminMsg(code) {
      return {
        bad: 'Пароль неверный',
        off: 'Удалённое управление отключено на сервере',
        locked: 'Слишком много неверных попыток, попробуйте позже',
        error: 'Не удалось связаться с сервером'
      }[code];
    }

    // Пароль по сети не уходит: сервер выдаёт соль и одноразовый вызов (nonce), плагин отвечает
    // sha256(nonce + sha256(соль + пароль)); сервер сравнивает со своим хэшем, хранящимся в памяти.
    function adminCall(path, pass) {
      return request('POST', '/admin/challenge', {}, 8000).then(function (ch) {
        if (!ch || !ch.nonce || !ch.salt) throw new Error('Bad challenge');
        var hashed = sha256(ch.salt + pass);
        return request('POST', path, { nonce: ch.nonce, proof: sha256(ch.nonce + hashed) }, 8000);
      });
    }

    // -> 'ok' | 'bad' | 'off' | 'locked' | 'error'
    function verifyAdmin(pass, silent) {
      adminOk = false;
      passState = pass ? 'wait' : '';
      refreshAdminUI();
      if (!pass) return Promise.resolve('bad');
      return adminCall('/admin/check', pass).then(function () {
        adminOk = true; adminPass = pass; passState = 'active';
        refreshAdminUI();
        if (!silent) Lampa.Noty.show('Пароль принят');
        return 'ok';
      })['catch'](function (e) {
        var code = adminError(e);
        adminOk = false; passState = 'error';
        if (code === 'bad') {
          adminPass = '';
          // неверный сохранённый пароль не держим, иначе каждое открытие настроек считалось бы за попытку подбора
          if (savedPass() === pass) Lampa.Storage.set(K_SRV_PASS, '');
        }
        refreshAdminUI();
        if (!silent) Lampa.Noty.show(adminMsg(code));
        return code;
      });
    }

    function addUser() {
      if (!adminOk || !adminPass) return Lampa.Noty.show('Сначала введите пароль сервера');
      adminCall('/admin/addUser', adminPass).then(function (res) {
        if (!res || !res.token) throw new Error('no token');
        newToken = res.token;
        refreshAdminUI();
        Lampa.Noty.show('Пользователь добавлен');
      })['catch'](function (e) {
        var code = adminError(e);
        if (code === 'bad' || code === 'off') { adminOk = false; refreshAdminUI(); }
        Lampa.Noty.show(adminMsg(code) || 'Ошибка добавления пользователя');
      });
    }

    function serverChanged() {
      resetLocalState();     // ревизии и «тени» относятся к старому серверу
      adminOk = false; newToken = ''; passState = '';
      refreshAdminUI();
      checkServer().then(function (ok) {
        var p = adminPass || savedPass();
        if (ok && p) verifyAdmin(p, true);
      });
    }

    // ---------- Настройки (UI) ----------

    Lampa.SettingsApi.addComponent({
      component: 'acc',
      name: 'Авторизация',
      icon: '<svg width="256" height="256" viewBox="0 0 32 32" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M16 17.25c4.556 0 8.25-3.694 8.25-8.25S20.556.75 16 .75 7.75 4.444 7.75 9s3.694 8.25 8.25 8.25zm0-14c3.176 0 5.75 2.574 5.75 5.75s-2.574 5.75-5.75 5.75S10.25 12.176 10.25 9 12.824 3.25 16 3.25zM30.9 29.73C29.35 22.83 23.27 17.75 16 17.75S2.65 22.83 1.12 29.63c-.02.08-.03.17-.03.27 0 .69.56 1.25 1.25 1.25.6 0 1.1-.42 1.22-.98C4.86 24.4 9.94 20.15 16 20.15s11.16 4.25 12.44 9.93c.13.57.62.98 1.22.98.1 0 .19-.01.28-.03.57-.13.98-.62.98-1.22 0-.1-.01-.19-.03-.28z"/></svg>'
    });

    Lampa.Settings.listener.follow('open', function (e) {
      setTimeout(function () { $('div[data-component=interface]').before($('div[data-component=acc]')); }, 30);
      if (e.name !== 'acc') return;
      refreshAuthUI(e.body || $('body'));
      refreshAdminUI();
      setTimeout(function () { refreshAuthUI(); refreshAdminUI(); }, 50);
      checkServer().then(function (ok) {
        if (ok && !adminOk && (adminPass || savedPass())) verifyAdmin(adminPass || savedPass(), true);
      });
    });

    function addTitle(name, label, hiddenFn) {
      Lampa.SettingsApi.addParam({
        component: 'acc', param: { name: name, type: 'title' }, field: { name: label, description: '' },
        onRender: function (it) {
          it.attr('data-name', name);
          if (hiddenFn) vis(it, hiddenFn());
        }
      });
    }

    function addCatBtn(name, label, desc, modalTitle, sKey, isM) {
      Lampa.SettingsApi.addParam({
        component: 'acc', param: { name: name, type: 'static' }, field: { name: label, description: desc },
        onRender: function (it) {
          function upd() {
            var txt = 'Выбрано категорий: ' + countCats(sKey, isM), d = it.find('.settings-param__descr');
            if (d.length) d.text(txt).show(); else it.append('<div class="settings-param__descr">' + txt + '</div>');
          }
          upd();
          it.on('hover:enter', function () { openCatSelector(modalTitle, sKey, isM, upd); });
        }
      });
    }

    // Адрес сервера — самым первым пунктом, ещё до авторизации
    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: K_SRV, type: 'input', values: '', placeholder: 'Например: 192.168.1.1:933', default: DEFAULT_ADDR },
      field: { name: 'Адрес сервера синхронизации', description: 'Укажите IP и порт в формате IP:порт, например 192.168.1.1:933' },
      onRender: function (it) { it.attr('data-name', K_SRV); bindStatus(K_SRV, it, srvState); },
      onChange: function (val) {
        val = (val || '').replace(/\s+/g, '').replace(/^https?:\/\//i, '').replace(/\/+$/, '');
        Lampa.Storage.set(K_SRV, val);
        if (val && !/^[A-Za-z0-9.\-]+:\d{1,5}$/.test(val)) Lampa.Noty.show('Неверный формат, нужно IP:порт');
        serverChanged();
      }
    });

    addTitle('acc_title_auth', 'Авторизация');

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: 'acc_auth', type: 'input', values: '', placeholder: 'Нужно будет ввести токен', default: '' },
      field: { name: 'Выполнить вход', description: '' },
      onRender: function (it) { it.attr('data-name', 'acc_auth'); vis(it, !!token()); },
      onChange: function (val) {
        val = (val || '').trim();
        if (!val) return;
        request('POST', '/checkToken', { token: val }).then(function (res) {
          if (res.userId) {
            resetLocalState();
            localStorage.setItem(K_TOKEN, val);
            Lampa.Storage.set('acc_auth', '');
            Lampa.Noty.show('Токен действителен');
            Lampa.Settings.update();
            setTimeout(function () { refreshAuthUI(); }, 50);
          } else {
            localStorage.removeItem(K_TOKEN);
            Lampa.Noty.show('Токен недействителен');
          }
        })['catch'](function (e) {
          Lampa.Noty.show(e && e.status === 429 ? 'Слишком много неверных попыток, попробуйте позже' : 'Ошибка запроса');
        });
      }
    });

    addTitle('acc_status_title', 'Аккаунт подключен', function () { return !token(); });

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: 'acc_token_info', type: 'static' },
      field: { name: 'Токен авторизации', description: 'Нажмите, чтобы скопировать токен' },
      onRender: function (it) {
        it.attr('data-name', 'acc_token_info');
        vis(it, !token());   // до входа поле с токеном не показываем
        it.find('.settings-param__name').text('Токен авторизации: ' + (token() || ''));
        it.on('hover:enter', function () { copyText(token(), 'Токен скопирован: '); });
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: 'acc_exit', type: 'static' },
      field: { name: 'Выйти из аккаунта', description: '' },
      onRender: function (it) {
        it.attr('data-name', 'acc_exit');
        vis(it, !token());
        it.on('hover:enter', function () {
          localStorage.removeItem(K_TOKEN);
          resetLocalState();
          Lampa.Storage.set('acc_sync', false);
          Lampa.Settings.update();
          setTimeout(function () { refreshAuthUI(); }, 50);
        });
      }
    });

    addTitle('acc_title_sync', 'Фоновая синхронизация');

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: 'acc_sync', type: 'trigger', default: false },
      field: { name: 'Автоматическая синхронизация', description: 'В фоне отправлять и получать выбранные ниже категории' },
      onChange: function (val) {
        if (val !== 'true') return;
        if (!token()) {
          Lampa.Noty.show('Вы не зашли в аккаунт');
          Lampa.Storage.set('acc_sync', false);
          Lampa.Settings.update();
          return;
        }
        syncMerge(getCats(K_AUTO, false), false);
      }
    });

    addCatBtn('acc_auto_cats_btn', 'Категории фоновой синхронизации', 'Выбор данных для автоматической синхронизации', 'Фоновая синхронизация', K_AUTO, false);
    addTitle('acc_title_manual', 'Ручная синхронизация');
    addCatBtn('acc_manual_cats_btn', 'Категории для ручной синхронизации', 'Выбор данных для экспорта и импорта по кнопкам ниже', 'Категории для ручной синхронизации', K_MANUAL, true);

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: 'acc_manual_export', type: 'static' },
      field: {
        name: 'Экспорт на сервер (отправить с устройства)',
        description: 'Перезаписать выбранные выше категории на сервере данными с этого устройства'
      },
      onRender: function (it) {
        it.on('hover:enter', function () { exportToServer(getCats(K_MANUAL, true)); });
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: 'acc_manual_import', type: 'static' },
      field: {
        name: 'Импорт с сервера (загрузить на устройство)',
        description: 'Загрузить выбранные выше категории с сервера и применить на этом устройстве'
      },
      onRender: function (it) {
        it.on('hover:enter', function () { importFromServer(getCats(K_MANUAL, true)); });
      }
    });

    addTitle('acc_title_danger', 'Управление данными');

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: 'sync_reset', type: 'static' },
      field: { name: 'Сброс данных синхронизации', description: 'Внимание !!! После нажатия ваши данные на сервере будут удалены' },
      onRender: function (it) {
        it.on('hover:enter', function () {
          if (!token()) return Lampa.Noty.show('Вы не зашли в аккаунт');
          request('DELETE', q('/lampa/sync')).then(function () {
            resetLocalState();
            Lampa.Noty.show('Данные синхронизации удалены');
          })['catch'](function () { Lampa.Noty.show('Ошибка при удалении или данные отсутствуют'); });
        });
      }
    });

    // ---------- Настройки плагина: сервер, пароль, добавление пользователей ----------

    addTitle('acc_title_plugin', 'Настройки плагина');

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: K_SRV_PASS, type: 'input', values: '', placeholder: 'Пароль сервера', default: '' },
      field: { name: 'Пароль сервера', description: '' },
      onRender: function (it) { it.attr('data-name', K_SRV_PASS); bindStatus(K_SRV_PASS, it, passState); },
      onChange: function (val) {
        val = (val || '').trim();
        if (!val) {
          adminOk = false; adminPass = ''; newToken = ''; passState = '';
          refreshAdminUI();
          return;
        }
        verifyAdmin(val, false).then(function (code) {
          if (code === 'bad' || (code === 'ok' && !Lampa.Storage.field(K_SRV_SAVE))) {
            Lampa.Storage.set(K_SRV_PASS, '');   // неверный или не сохраняемый пароль на диске не держим
            Lampa.Settings.update();
          }
        });
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: K_SRV_SAVE, type: 'trigger', default: false },
      field: { name: 'Сохранить пароль', description: 'Хранить пароль сервера на этом устройстве' },
      onChange: function (val) {
        if (val === 'true') { if (adminPass) Lampa.Storage.set(K_SRV_PASS, adminPass); }
        else Lampa.Storage.set(K_SRV_PASS, '');
        Lampa.Settings.update();
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: 'acc_adm_add', type: 'static' },
      field: { name: 'Добавить нового пользователя', description: 'Создать на сервере нового пользователя со случайным токеном' },
      onRender: function (it) {
        it.attr('data-name', 'acc_adm_add');
        vis(it, !adminOk);
        it.on('hover:enter', addUser);
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: 'acc_adm_result', type: 'static' },
      field: { name: 'Токен нового пользователя', description: 'Нажмите, чтобы скопировать токен' },
      onRender: function (it) {
        it.attr('data-name', 'acc_adm_result');
        vis(it, !(adminOk && newToken));
        it.find('.settings-param__name').text(newToken ? 'Пользователь добавлен. Токен: ' + newToken : '');
        it.on('hover:enter', function () { copyText(newToken, 'Токен скопирован: '); });
      }
    });

    if (token() && Lampa.Storage.field('acc_sync')) {
      request('POST', '/checkToken', { token: token() }).then(function (res) {
        if (!res.userId) {
          localStorage.removeItem(K_TOKEN);
          Lampa.Storage.set('acc_sync', false);
          Lampa.Noty.show('Токен недействителен');
          return;
        }
        startup();
      })['catch'](function (e) {
        log('token check error:', e.message);
        Lampa.Noty.show('Синхронизация: сервер недоступен (' + e.message + ')');
      });
    }
  }

  if (window.appready) startPlugin();
  else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();

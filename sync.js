(function () {
  'use strict';

  var DEFAULT_IP = '192.168.1.1';
  var DEFAULT_PORT = '1234';
  var PUSH_DELAY = 20000;
  var RETRY_DELAY = 120000;
  var PULL_INTERVAL = 300000;

  var K_TOKEN = 'sync_token', K_REV = 'sync_rev', K_SHADOW = 'sync_shadow';
  var K_FVAT = 'sync_fv_at', K_AUTO = 'sync_auto_cats', K_MANUAL = 'sync_manual_cats';
  // Настройки плагина (префикс sync_ — в синхронизацию настроек не попадают, пароль на сервер не уходит)
  var K_SRV_IP = 'sync_srv_ip', K_SRV_PORT = 'sync_srv_port', K_SRV_PASS = 'sync_srv_pass', K_SRV_SAVE = 'sync_srv_save';

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
  var KV_KEYS = ['online_choice', 'subscribes', 'plugins', 'settings'];
  var EXCLUDE = {
    sync_token: 1, sync_rev: 1, sync_shadow: 1, sync_fv_at: 1, sync_auto_cats: 1, sync_manual_cats: 1,
    sync_srv_ip: 1, sync_srv_port: 1, sync_srv_pass: 1, sync_srv_save: 1,
    acc_sync: 1, acc_auth: 1, file_view: 1, favorite: 1, online_view: 1, torrents_view: 1,
    search_history: 1, online_choice: 1, subscribes: 1, plugins: 1, platform: 1, device_uid: 1,
    lampa_uid: 1, cub_token: 1, account: 1, account_user: 1, account_use: 1, account_bookmarks: 1,
    time_offset: 1, activity: 1
  };

  function startPlugin() {
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

    function serverUrl() {
      var host = rawStr(K_SRV_IP, DEFAULT_IP).replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      var port = rawStr(K_SRV_PORT, DEFAULT_PORT).replace(/\D/g, '');
      if (host.indexOf(':') === -1 && port) host += ':' + port;
      return 'http://' + host;
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
      }
      return out;
    }

    function cardsFor(entries) {
      var data = readFavoriteRaw(), out = {}, ids = {};
      if (!Array.isArray(data.card)) return out;
      entries.forEach(function (e) { ids[String(e.w.v)] = 1; });
      data.card.forEach(function (c) { if (c && has(ids, String(c.id))) out[String(c.id)] = c; });
      return out;
    }

    function build(key, entries, cards) {
      if (key !== 'favorite') {
        Lampa.Storage.set(key, entries.map(function (e) { return e.w; }), true);
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

    function diff(key) {
      var cur = flat(key), map = mapOf(cur), base = shadow[key] || {};
      return {
        add: cur.filter(function (e) { return !has(base, e.k); }),
        del: Object.keys(base).filter(function (k) { return !map[k]; }).map(function (k) {
          return key === 'favorite' ? base[k] : k;
        })
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
        if (!d.add.length && !d.del.length) return;
        ops[key] = d;
        sets[key] = { add: d.add.map(function (e) { return e.w; }), del: d.del };
        if (key === 'favorite') Object.assign(cards, cardsFor(d.add));
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
        });
        Object.keys(kvSnap).forEach(function (catId) {
          var sk =

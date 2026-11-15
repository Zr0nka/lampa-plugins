(function () {
  'use strict';

  var SERVER = 'http://217.25.226.225:933';
  var PUSH_DELAY = 3000;
  var RETRY_DELAY = 15000;
  var PULL_INTERVAL = 60000;

  var K_TOKEN = 'sync_token', K_REV = 'sync_rev', K_SHADOW = 'sync_shadow';
  var K_FVAT = 'sync_fv_at', K_AUTO = 'sync_auto_cats', K_MANUAL = 'sync_manual_cats';

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
    acc_sync: 1, acc_auth: 1, file_view: 1, favorite: 1, online_view: 1, torrents_view: 1,
    search_history: 1, online_choice: 1, subscribes: 1, plugins: 1, platform: 1, device_uid: 1,
    lampa_uid: 1, cub_token: 1, account: 1, account_user: 1, account_use: 1, account_bookmarks: 1,
    time_offset: 1, activity: 1
  };

  function startPlugin() {
    var pendingFV = {}, dirtySets = {}, dirtyKV = {};
    var pushTimer = null, pushPromise = null, pulling = false, fvShadow = null;
    var shadow = loadJson(K_SHADOW, {});

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
      try { localStorage.setItem(K_SHADOW, JSON.stringify(shadow)); }
      catch (e) { log('shadow save error:', e.message); }
    }

    function resetLocalState() {
      [K_REV, K_SHADOW, K_FVAT].forEach(function (k) { localStorage.removeItem(k); });
      shadow = {}; pendingFV = {}; dirtySets = {}; dirtyKV = {};
    }

    function bumpFvAt(recs) {
      var at = parseInt(localStorage.getItem(K_FVAT) || '0', 10) || 0;
      for (var h in recs) if (recs[h] && recs[h].updated > at) at = recs[h].updated;
      if (at) localStorage.setItem(K_FVAT, String(at));
    }

    function request(method, path, body) {
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, SERVER + path, true);
        xhr.timeout = 30000;
        if (body !== undefined) xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); } catch (e) { reject(new Error('Bad JSON')); }
          } else reject(new Error('HTTP ' + xhr.status));
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
          var sk = 'kv_' + catId;
          if (!shadow[sk]) shadow[sk] = {};
          Object.keys(kvSnap[catId].set).forEach(function (k) { shadow[sk][k] = kvSnap[catId].set[k]; });
          kvSnap[catId].del.forEach(function (k) { delete shadow[sk][k]; });
        });
        saveShadow();
        bumpFvAt(fv);
        log('отправлено, изменений:', res.changed);
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
        } else {
          var gone = Object.create(null);
          del.forEach(function (w) { gone[kk(key, w)] = 1; });
          entries = local.filter(function (e) { return !gone[e.k]; });
          ch = entries.length !== local.length;
          add.forEach(function (w) {
            var k = kk(key, w);
            setShadow(key, k, w);
            if (!lmap[k]) { entries.push({ k: k, w: w }); lmap[k] = 1; ch = true; }
          });
          Object.keys(gone).forEach(function (k) { if (shadow[key]) delete shadow[key][k]; });
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

      var wait = pushPromise ? pushPromise.then(function () { return push(catMap); }) : push(catMap);
      return wait.then(function () {
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
            if (!silent) Lampa.Noty.show('Синхронизировано (изменений на сервере: ' + res.changed + ')');
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
      return push().then(function () { return pull(); });
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

    // ---------- Настройки (UI) ----------

    Lampa.SettingsApi.addComponent({
      component: 'acc',
      name: 'Аккаунт',
      icon: '<svg width="256" height="256" viewBox="0 0 32 32" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M16 17.25c4.556 0 8.25-3.694 8.25-8.25S20.556.75 16 .75 7.75 4.444 7.75 9s3.694 8.25 8.25 8.25zm0-14c3.176 0 5.75 2.574 5.75 5.75s-2.574 5.75-5.75 5.75S10.25 12.176 10.25 9 12.824 3.25 16 3.25zM30.9 29.73C29.35 22.83 23.27 17.75 16 17.75S2.65 22.83 1.12 29.63c-.02.08-.03.17-.03.27 0 .69.56 1.25 1.25 1.25.6 0 1.1-.42 1.22-.98C4.86 24.4 9.94 20.15 16 20.15s11.16 4.25 12.44 9.93c.13.57.62.98 1.22.98.1 0 .19-.01.28-.03.57-.13.98-.62.98-1.22 0-.1-.01-.19-.03-.28z"/></svg>'
    });

    Lampa.Settings.listener.follow('open', function (e) {
      setTimeout(function () { $('div[data-component=interface]').before($('div[data-component=acc]')); }, 30);
      if (e.name !== 'acc') return;
      var body = e.body || $('body');
      if (token()) body.find('div[data-name="acc_auth"]').addClass('hide');
      else body.find('div[data-name="acc_status_title"], div[data-name="acc_token_info"], div[data-name="acc_exit"]').addClass('hide');
    });

    function addTitle(name, label) {
      Lampa.SettingsApi.addParam({
        component: 'acc', param: { name: name, type: 'title' }, field: { name: label, description: '' },
        onRender: function (it) { it.attr('data-name', name); }
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

    addTitle('acc_title_auth', 'Авторизация');

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: 'acc_auth', type: 'input', values: '', placeholder: 'Нужно будет ввести токен', default: '' },
      field: { name: 'Выполнить вход', description: '' },
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
          } else {
            localStorage.removeItem(K_TOKEN);
            Lampa.Noty.show('Токен недействителен');
          }
        })['catch'](function () { Lampa.Noty.show('Ошибка запроса'); });
      }
    });

    addTitle('acc_status_title', 'Аккаунт подключен');

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: 'acc_token_info', type: 'static' },
      field: { name: 'Токен авторизации', description: 'Нажмите, чтобы скопировать токен' },
      onRender: function (it) {
        var t = token() || '';
        it.find('.settings-param__name').text('Токен авторизации: ' + t);
        it.on('hover:enter', function () {
          var cur = token() || '';
          if (cur && Lampa.Utils && Lampa.Utils.copyTextToClipboard) {
            Lampa.Utils.copyTextToClipboard(cur, function () { Lampa.Noty.show('Токен скопирован: ' + cur); });
          } else if (cur) Lampa.Noty.show('Токен: ' + cur);
        });
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'acc',
      param: { name: 'acc_exit', type: 'static' },
      field: { name: 'Выйти из аккаунта', description: '' },
      onRender: function (it) {
        it.on('hover:enter', function () {
          localStorage.removeItem(K_TOKEN);
          resetLocalState();
          Lampa.Storage.set('acc_sync', false);
          Lampa.Settings.update();
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

    if (token() && Lampa.Storage.field('acc_sync')) {
      request('POST', '/checkToken', { token: token() }).then(function (res) {
        if (!res.userId) {
          localStorage.removeItem(K_TOKEN);
          Lampa.Storage.set('acc_sync', false);
          Lampa.Noty.show('Токен недействителен');
          return;
        }
        startup();
      })['catch'](function (e) { log('token check error:', e.message); });
    }
  }

  if (window.appready) startPlugin();
  else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();

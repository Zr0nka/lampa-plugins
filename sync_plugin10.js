(function () {
    'use strict';

    var SERVER = 'http://217.25.226.225:933';

    var PUSH_DELAY = 3000;          // пауза после последнего изменения перед отправкой
    var RETRY_DELAY = 15000;        // повтор отправки при ошибке
    var PULL_INTERVAL = 60 * 1000;  // как часто забирать изменения с других устройств

    var K_TOKEN = 'sync_token';
    var K_REV = 'sync_rev';         // ревизия сервера, до которой мы всё получили (нет ключа — первая синхронизация)
    var K_SHADOW = 'sync_shadow';   // что, по нашему мнению, уже есть на сервере (по наборам и словарям)
    var K_FVAT = 'sync_fv_at';      // до какой метки updated таймкоды уже отправлены
    var K_AUTO_CATS = 'sync_auto_cats';     // категории для фоновой синхронизации
    var K_MANUAL_CATS = 'sync_manual_cats'; // категории для ручной кнопки «Синхронизировать сейчас»

    // Все поддерживаемые категории синхронизации Lampa
    var CATEGORIES = [
        { id: 'file_view',      type: 'fv',       title: 'Таймкоды и прогресс (file_view)',            defAuto: true,  defManual: true },
        { id: 'favorite',       type: 'set',      title: 'Закладки, избранное, история (favorite)',     defAuto: true,  defManual: true },
        { id: 'online_view',    type: 'set',      title: 'Просмотренные онлайн (online_view)',          defAuto: true,  defManual: true },
        { id: 'torrents_view',  type: 'set',      title: 'Просмотренные торренты (torrents_view)',      defAuto: true,  defManual: true },
        { id: 'search_history', type: 'set',      title: 'История поиска (search_history)',             defAuto: true,  defManual: true },
        { id: 'online_choice',  type: 'kv',       title: 'Выбор озвучки и фильтра в онлайн',            defAuto: true,  defManual: true },
        { id: 'subscribes',     type: 'json_arr', title: 'Подписки (subscribes)',                       defAuto: false, defManual: true },
        { id: 'plugins',        type: 'json_arr', title: 'Установленные плагины (plugins)',             defAuto: false, defManual: false },
        { id: 'settings',       type: 'settings', title: 'Настройки Lampa (интерфейс, плеер, парсер)', defAuto: false, defManual: false }
    ];

    var SET_KEYS = ['online_view', 'torrents_view', 'favorite', 'search_history'];
    var KV_KEYS = ['online_choice', 'subscribes', 'plugins', 'settings'];

    // Системные и привязанные к конкретному ТВ ключи, которые нельзя переносить в категории settings
    var SETTINGS_EXCLUDE = {
        sync_token: 1, sync_rev: 1, sync_shadow: 1, sync_fv_at: 1,
        sync_auto_cats: 1, sync_manual_cats: 1,
        acc_sync: 1, acc_auth: 1,
        file_view: 1, favorite: 1, online_view: 1, torrents_view: 1, search_history: 1,
        online_choice: 1, subscribes: 1, plugins: 1,
        platform: 1, device_uid: 1, lampa_uid: 1, cub_token: 1, account: 1, account_user: 1,
        account_use: 1, account_bookmarks: 1, time_offset: 1, activity: 1
    };

    function startPlugin() {
        var pendingFV = {};    // hash -> запись прогресса, ещё не отправленная
        var dirtySets = {};    // ключ набора -> true
        var dirtyKV = {};      // ключ словаря (online_choice, settings и т.д.) -> true
        var pushTimer = null;
        var pushPromise = null;
        var pulling = false;
        var fvShadow = null;   // запасной путь для старых Lampa без Timeline.listener
        var shadow = loadShadow();

        function log() {
            var args = ['Sync'].concat([].slice.call(arguments));
            console.log.apply(console, args);
        }

        function token() { return localStorage.getItem(K_TOKEN); }
        function active() { return !!token() && Lampa.Storage.field('acc_sync'); }
        function synced() { return localStorage.getItem(K_REV) !== null; }
        function fvKey() { return (Lampa.Timeline.filename && Lampa.Timeline.filename()) || 'file_view'; }
        function clone(o) { return JSON.parse(JSON.stringify(o)); }
        function isObj(o) { return o && typeof o === 'object' && !Array.isArray(o); }
        function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
        function mapOf(entries) {
            var m = Object.create(null);
            entries.forEach(function (e) { m[e.k] = e; });
            return m;
        }

        // ---------- Управление выбранными категориями (Фон vs Кнопка) ----------

        function getCatConfig(storageKey, isManual) {
            try {
                var raw = JSON.parse(localStorage.getItem(storageKey));
                if (isObj(raw)) return raw;
            } catch (e) {}
            var def = {};
            CATEGORIES.forEach(function (c) {
                def[c.id] = isManual ? c.defManual : c.defAuto;
            });
            return def;
        }

        function saveCatConfig(storageKey, cfg) {
            try { localStorage.setItem(storageKey, JSON.stringify(cfg)); } catch (e) {}
        }

        function isAutoOn(catId) {
            var cfg = getCatConfig(K_AUTO_CATS, false);
            return !!cfg[catId];
        }

        function countEnabled(storageKey, isManual) {
            var cfg = getCatConfig(storageKey, isManual);
            var n = 0;
            CATEGORIES.forEach(function (c) { if (cfg[c.id]) n++; });
            return n + ' из ' + CATEGORIES.length;
        }

        function openCatSelector(title, storageKey, isManual, onDone) {
            var cfg = getCatConfig(storageKey, isManual);
            var newlyEnabled = {};
            var items = CATEGORIES.map(function (c) {
                return {
                    title: c.title,
                    cat_id: c.id,
                    checkbox: true,
                    checked: !!cfg[c.id]
                };
            });

            Lampa.Select.show({
                title: title,
                items: items,
                onCheck: function (item) {
                    cfg[item.cat_id] = !!item.checked;
                    saveCatConfig(storageKey, cfg);
                    if (!isManual) {
                        if (item.checked) newlyEnabled[item.cat_id] = true;
                        else delete newlyEnabled[item.cat_id];
                    }
                },
                onBack: function () {
                    Lampa.Controller.toggle('settings_component');
                    if (onDone) onDone();
                    if (!isManual && active() && Object.keys(newlyEnabled).length) {
                        syncSelected(newlyEnabled, true);
                    }
                }
            });
        }

        // ---------- Теневая копия и состояние ----------

        function loadShadow() {
            try {
                var s = JSON.parse(localStorage.getItem(K_SHADOW));
                return isObj(s) ? s : {};
            }
            catch (e) { return {}; }
        }

        function saveShadow() {
            try { localStorage.setItem(K_SHADOW, JSON.stringify(shadow)); }
            catch (e) { log('не удалось сохранить теневую копию:', e.message); }
        }

        function resetLocalState() {
            localStorage.removeItem(K_REV);
            localStorage.removeItem(K_SHADOW);
            localStorage.removeItem(K_FVAT);
            shadow = {};
            pendingFV = {};
            dirtySets = {};
            dirtyKV = {};
        }

        function bumpFvAt(records) {
            var at = parseInt(localStorage.getItem(K_FVAT) || '0', 10) || 0;
            for (var h in records) if (records[h] && records[h].updated > at) at = records[h].updated;
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
                        try { resolve(JSON.parse(xhr.responseText)); }
                        catch (e) { reject(new Error('Bad response')); }
                    }
                    else reject(new Error('HTTP ' + xhr.status));
                };
                xhr.onerror = function () { reject(new Error('Network error')); };
                xhr.ontimeout = function () { reject(new Error('Timeout')); };

                xhr.send(body === undefined ? null : JSON.stringify(body));
            });
        }

        function q(path) { return path + '?token=' + encodeURIComponent(token()); }

        // ---------- Наборы (sets): закладки, история поиска, «просмотрено» ----------

        function kk(key, w) { return key === 'favorite' ? w.c + ':' + w.v : String(w); }

        function flat(key) {
            var out = [], seen = Object.create(null);

            function put(k, w) {
                if (seen[k]) return;
                seen[k] = true;
                out.push({ k: k, w: w });
            }

            if (key === 'favorite') {
                var data = Lampa.Storage.get('favorite', '{}');
                if (!isObj(data)) return out;

                Object.keys(data).forEach(function (cat) {
                    var list = data[cat];
                    if (cat === 'card' || !Array.isArray(list)) return;
                    for (var i = list.length - 1; i >= 0; i--) put(cat + ':' + list[i], { c: cat, v: list[i] });
                });
            }
            else {
                var arr = Lampa.Storage.get(key, '[]');
                if (Array.isArray(arr)) arr.forEach(function (v) { if (typeof v === 'string' && v) put(v, v); });
            }

            return out;
        }

        function cardsFor(entries) {
            var data = Lampa.Storage.get('favorite', '{}'), out = {}, ids = {};
            if (!isObj(data) || !Array.isArray(data.card)) return out;

            entries.forEach(function (e) { ids[String(e.w.v)] = true; });
            data.card.forEach(function (c) { if (c && has(ids, String(c.id))) out[String(c.id)] = c; });

            return out;
        }

        function build(key, entries, cards) {
            if (key !== 'favorite') {
                Lampa.Storage.set(key, entries.map(function (e) { return e.w; }), true);
                return;
            }

            var data = Lampa.Storage.get('favorite', '{}');
            if (!isObj(data)) data = {};

            var oldCards = Array.isArray(data.card) ? data.card : [];
            var cats = {}, need = {};

            Object.keys(data).forEach(function (c) { if (c !== 'card' && Array.isArray(data[c])) cats[c] = []; });

            entries.forEach(function (e) {
                if (!cats[e.w.c]) cats[e.w.c] = [];
                cats[e.w.c].unshift(e.w.v);
                need[String(e.w.v)] = true;
            });

            var list = [], have = {};

            oldCards.forEach(function (c) {
                if (c && has(need, String(c.id)) && !have[String(c.id)]) {
                    list.push(c);
                    have[String(c.id)] = true;
                }
            });

            for (var id in need) if (!have[id] && cards && has(cards, id)) list.push(cards[id]);
            for (var c in cats) data[c] = cats[c];

            data.card = list;

            Lampa.Storage.set('favorite', data, true);

            try {
                Lampa.Favorite.init();
                Lampa.Favorite.read(true);
            } catch (e) { log('favorite reload error', e.message); }
        }

        function setShadow(key, k, w) {
            if (!shadow[key]) shadow[key] = {};
            shadow[key][k] = key === 'favorite' ? w : 1;
        }

        function delShadow(key, k) {
            if (shadow[key]) delete shadow[key][k];
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

        // ---------- Словари и прочие данные (KV): online_choice, subscribes, plugins, settings ----------

        function isSettingKeyAllowed(k) {
            if (!k || SETTINGS_EXCLUDE[k]) return false;
            if (k === fvKey()) return false;
            if (k.indexOf('sync_') === 0 || k.indexOf('weather_') === 0 || k.indexOf('cache_') === 0) return false;
            if (k.indexOf('online_choice_') === 0 || k.indexOf('file_view') === 0) return false;
            var raw = localStorage.getItem(k);
            if (raw === null || raw.length > 8000) return false; // отсекаем тяжёлые кеши
            return true;
        }

        function readLocalKV(catId) {
            var out = {};
            if (catId === 'online_choice') {
                // Поддержка и единого объекта online_choice, и ключей с префиксом online_choice_<balanser>
                var oc = Lampa.Storage.get('online_choice', '{}');
                if (isObj(oc)) {
                    Object.keys(oc).forEach(function (k) {
                        if (oc[k] && typeof oc[k] === 'object') out['__main__:' + k] = JSON.stringify(oc[k]);
                    });
                }
                for (var j = 0; j < localStorage.length; j++) {
                    var lk = localStorage.key(j);
                    if (lk && lk.indexOf('online_choice_') === 0) {
                        var sub = Lampa.Storage.get(lk, '{}');
                        if (isObj(sub)) {
                            Object.keys(sub).forEach(function (id) {
                                if (sub[id] && typeof sub[id] === 'object') {
                                    out[lk + ':' + id] = JSON.stringify(sub[id]);
                                }
                            });
                        }
                    }
                }
            }
            else if (catId === 'subscribes' || catId === 'plugins') {
                var arr = Lampa.Storage.get(catId, '[]');
                if (Array.isArray(arr)) {
                    arr.forEach(function (item, idx) {
                        if (!item) return;
                        var id = item.id || item.url || ('idx_' + idx);
                        out[String(id)] = JSON.stringify(item);
                    });
                }
            }
            else if (catId === 'settings') {
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    if (isSettingKeyAllowed(k)) {
                        out[k] = localStorage.getItem(k);
                    }
                }
            }
            return out;
        }

        function diffKV(catId, forceAll) {
            var cur = readLocalKV(catId);
            var skey = 'kv_' + catId;
            var base = shadow[skey] || {};
            var set = {}, del = [];

            Object.keys(cur).forEach(function (k) {
                if (forceAll || base[k] !== cur[k]) set[k] = cur[k];
            });

            if (!forceAll) {
                Object.keys(base).forEach(function (k) {
                    if (!has(cur, k)) del.push(k);
                });
            }

            return { set: set, del: del, cur: cur };
        }

        function applyRemoteKV(res, allowedCatMap, replace) {
            var kv = res.kv || {};
            KV_KEYS.forEach(function (catId) {
                if (!allowedCatMap[catId] || !kv[catId]) return;

                var ops = kv[catId];
                var incSet = ops.set || {}, incDel = ops.del || [];
                var skey = 'kv_' + catId;
                var base = shadow[skey] || {};

                if (res.full) {
                    // Трёхстороннее слияние для KV (как в applySets):
                    // если replace=false, не затираем несохранённые локальные изменения и удаления
                    var localCur = readLocalKV(catId);
                    var merged = {};

                    Object.keys(incSet).forEach(function (k) {
                        if (!replace && has(base, k) && !has(localCur, k)) return; // было удалено локально
                        if (!replace && has(localCur, k) && localCur[k] !== base[k]) {
                            merged[k] = localCur[k]; // изменено локально — сохраняем локальное
                        } else {
                            merged[k] = incSet[k];
                        }
                    });

                    if (!replace) {
                        Object.keys(localCur).forEach(function (k) {
                            if (!has(base, k) && !has(merged, k)) merged[k] = localCur[k];
                        });
                    }

                    var newShadow = {};
                    Object.keys(incSet).forEach(function (k) { newShadow[k] = incSet[k]; });
                    shadow[skey] = newShadow;

                    writeFullKVToStorage(catId, merged);
                }
                else {
                    if (!shadow[skey]) shadow[skey] = {};
                    applyIncrementalKVToStorage(catId, incSet, incDel, shadow[skey]);
                }
            });
        }

        function parseOnlineChoiceKey(compKey) {
            var idx = compKey.indexOf(':');
            if (idx === -1) return { storeKey: 'online_choice', itemId: compKey };
            var prefix = compKey.slice(0, idx);
            var itemId = compKey.slice(idx + 1);
            return { storeKey: prefix === '__main__' ? 'online_choice' : prefix, itemId: itemId };
        }

        function writeFullKVToStorage(catId, mergedMap) {
            if (catId === 'online_choice') {
                var byStore = {};
                Object.keys(mergedMap).forEach(function (ck) {
                    var p = parseOnlineChoiceKey(ck);
                    if (!byStore[p.storeKey]) byStore[p.storeKey] = {};
                    try { byStore[p.storeKey][p.itemId] = JSON.parse(mergedMap[ck]); } catch (e) {}
                });
                Object.keys(byStore).forEach(function (sk) {
                    Lampa.Storage.set(sk, byStore[sk], true);
                });
            }
            else if (catId === 'subscribes' || catId === 'plugins') {
                var list = [];
                Object.keys(mergedMap).forEach(function (k) {
                    try { list.push(JSON.parse(mergedMap[k])); } catch (e) {}
                });
                Lampa.Storage.set(catId, list, true);
            }
            else if (catId === 'settings') {
                Object.keys(mergedMap).forEach(function (k) {
                    if (isSettingKeyAllowed(k)) {
                        localStorage.setItem(k, mergedMap[k]);
                        if (Lampa.Storage && Lampa.Storage.set) {
                            try { Lampa.Storage.set(k, JSON.parse(mergedMap[k]), true); }
                            catch (e) { Lampa.Storage.set(k, mergedMap[k], true); }
                        }
                    }
                });
            }
        }

        function applyIncrementalKVToStorage(catId, incSet, incDel, shObj) {
            if (catId === 'online_choice') {
                var touchedStores = {};
                incDel.forEach(function (ck) {
                    var p = parseOnlineChoiceKey(ck);
                    if (!touchedStores[p.storeKey]) touchedStores[p.storeKey] = Lampa.Storage.get(p.storeKey, '{}');
                    if (isObj(touchedStores[p.storeKey])) delete touchedStores[p.storeKey][p.itemId];
                    delete shObj[ck];
                });
                Object.keys(incSet).forEach(function (ck) {
                    var p = parseOnlineChoiceKey(ck);
                    if (!touchedStores[p.storeKey]) touchedStores[p.storeKey] = Lampa.Storage.get(p.storeKey, '{}');
                    if (!isObj(touchedStores[p.storeKey])) touchedStores[p.storeKey] = {};
                    try {
                        touchedStores[p.storeKey][p.itemId] = JSON.parse(incSet[ck]);
                        shObj[ck] = incSet[ck];
                    } catch (e) {}
                });
                Object.keys(touchedStores).forEach(function (sk) {
                    Lampa.Storage.set(sk, touchedStores[sk], true);
                });
            }
            else if (catId === 'subscribes' || catId === 'plugins') {
                var arr = Lampa.Storage.get(catId, '[]');
                if (!Array.isArray(arr)) arr = [];
                var map = {}, order = [];
                arr.forEach(function (item, idx) {
                    if (!item) return;
                    var id = String(item.id || item.url || ('idx_' + idx));
                    if (!has(map, id)) order.push(id);
                    map[id] = item;
                });
                var changedArr = false;
                incDel.forEach(function (k) {
                    if (has(map, k)) { delete map[k]; changedArr = true; }
                    delete shObj[k];
                });
                Object.keys(incSet).forEach(function (k) {
                    try {
                        if (!has(map, k)) order.push(k);
                        map[k] = JSON.parse(incSet[k]);
                        shObj[k] = incSet[k];
                        changedArr = true;
                    } catch (e) {}
                });
                if (changedArr) {
                    var newList = [];
                    order.forEach(function (k) { if (has(map, k)) newList.push(map[k]); });
                    Lampa.Storage.set(catId, newList, true);
                }
            }
            else if (catId === 'settings') {
                incDel.forEach(function (k) {
                    if (isSettingKeyAllowed(k)) localStorage.removeItem(k);
                    delete shObj[k];
                });
                Object.keys(incSet).forEach(function (k) {
                    if (isSettingKeyAllowed(k)) {
                        localStorage.setItem(k, incSet[k]);
                        shObj[k] = incSet[k];
                        if (Lampa.Storage && Lampa.Storage.set) {
                            try { Lampa.Storage.set(k, JSON.parse(incSet[k]), true); }
                            catch (e) { Lampa.Storage.set(k, incSet[k], true); }
                        }
                    }
                });
            }
        }

        // ---------- Отправка изменений ----------

        function schedulePush(delay) {
            clearTimeout(pushTimer);
            pushTimer = setTimeout(push, delay || PUSH_DELAY);
        }

        // push(customCatMap): без аргументов отправляет фоновые категории (K_AUTO_CATS),
        // с customCatMap отправляет указанный набор категорий
        function push(customCatMap) {
            if ((!active() && !customCatMap) || (!synced() && !customCatMap)) return Promise.resolve();
            if (pushPromise) return pushPromise;

            var allowed = customCatMap || getCatConfig(K_AUTO_CATS, false);
            var isAllowed = function (catId) { return !!allowed[catId]; };

            var fv = isAllowed('file_view') ? pendingFV : {};
            var keys = Object.keys(dirtySets).filter(isAllowed);
            var kvKeys = Object.keys(dirtyKV).filter(isAllowed);
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
                if (!Object.keys(d.set).length && !d.del.length) return;
                kvOut[catId] = { set: d.set, del: d.del };
                kvSnap[catId] = d;
            });

            if (!Object.keys(fv).length && !Object.keys(ops).length && !Object.keys(kvOut).length) {
                keys.forEach(function (k) { delete dirtySets[k]; });
                kvKeys.forEach(function (k) { delete dirtyKV[k]; });
                return Promise.resolve();
            }

            if (isAllowed('file_view')) pendingFV = {};
            keys.forEach(function (k) { delete dirtySets[k]; });
            kvKeys.forEach(function (k) { delete dirtyKV[k]; });

            pushPromise = request('POST', q('/lampa/push'), {
                file_view: fv,
                sets: sets,
                cards: cards,
                kv: kvOut
            }).then(function (res) {
                pushPromise = null;

                Object.keys(ops).forEach(function (key) {
                    ops[key].add.forEach(function (e) { setShadow(key, e.k, e.w); });
                    ops[key].del.forEach(function (w) { delShadow(key, kk(key, w)); });
                });

                Object.keys(kvSnap).forEach(function (catId) {
                    var skey = 'kv_' + catId;
                    if (!shadow[skey]) shadow[skey] = {};
                    Object.keys(kvSnap[catId].set).forEach(function (k) {
                        shadow[skey][k] = kvSnap[catId].set[k];
                    });
                    kvSnap[catId].del.forEach(function (k) {
                        delete shadow[skey][k];
                    });
                });

                saveShadow();
                bumpFvAt(fv);
                log('отправлено, изменений на сервере:', res.changed);
            })['catch'](function (e) {
                pushPromise = null;
                log('ошибка отправки, повтор позже:', e.message);

                for (var h in fv) if (!pendingFV[h]) pendingFV[h] = fv[h];
                keys.forEach(function (k) { dirtySets[k] = true; });
                kvKeys.forEach(function (k) { dirtyKV[k] = true; });

                schedulePush(RETRY_DELAY);
            });

            return pushPromise;
        }

        function onTimelineUpdate(e) {
            if (!active() || !isAutoOn('file_view') || !e || !e.data || !e.data.road) return;

            pendingFV[e.data.hash] = clone(e.data.road);
            schedulePush();
        }

        function onStorageChange(e) {
            if (!active() || !e || !e.name) return;

            if (SET_KEYS.indexOf(e.name) !== -1) {
                if (isAutoOn(e.name)) {
                    dirtySets[e.name] = true;
                    schedulePush();
                }
            }
            else if (e.name === 'online_choice' || e.name.indexOf('online_choice_') === 0) {
                if (isAutoOn('online_choice')) {
                    dirtyKV['online_choice'] = true;
                    schedulePush();
                }
            }
            else if (KV_KEYS.indexOf(e.name) !== -1) {
                if (isAutoOn(e.name)) {
                    dirtyKV[e.name] = true;
                    schedulePush();
                }
            }
            else if (fvShadow && e.name === fvKey()) {
                if (isAutoOn('file_view')) diffFileView(e.value);
            }
            else if (isAutoOn('settings') && isSettingKeyAllowed(e.name)) {
                dirtyKV['settings'] = true;
                schedulePush();
            }
        }

        function buildFvShadow() {
            var cur = Lampa.Storage.get(fvKey(), '{}');
            fvShadow = {};
            if (isObj(cur)) for (var h in cur) fvShadow[h] = JSON.stringify(cur[h]);
        }

        function diffFileView(value) {
            if (!isObj(value)) return;
            for (var h in value) {
                var s = JSON.stringify(value[h]);
                if (fvShadow[h] !== s) {
                    fvShadow[h] = s;
                    if (isObj(value[h])) pendingFV[h] = clone(value[h]);
                }
            }
            schedulePush();
        }

        function queueFvSince() {
            if (!isAutoOn('file_view')) return;
            var at = parseInt(localStorage.getItem(K_FVAT) || '0', 10) || 0;
            var local = Lampa.Storage.get(fvKey(), '{}');
            if (!at || !isObj(local)) return;

            for (var h in local) {
                if (isObj(local[h]) && local[h].updated > at && !pendingFV[h]) pendingFV[h] = clone(local[h]);
            }
        }

        // ---------- Получение изменений с сервера ----------

        function applyFileView(res, allowedCatMap) {
            if (!allowedCatMap['file_view']) return;

            var ids = Object.keys(res.file_view || {});
            if (!ids.length) return;

            var key = fvKey();
            var local = Lampa.Storage.get(key, '{}');
            var changed = false;

            if (!isObj(local)) local = {};

            ids.forEach(function (h) {
                var inc = res.file_view[h], cur = local[h];

                if (pendingFV[h]) return;

                if (isObj(cur) && cur.updated && inc.updated && cur.updated > inc.updated) {
                    pendingFV[h] = clone(cur);
                    return;
                }

                local[h] = Object.assign({ duration: 0, time: 0, percent: 0 }, inc);
                if (fvShadow) fvShadow[h] = JSON.stringify(local[h]);
                changed = true;
            });

            if (changed) {
                Lampa.Storage.set(key, local, true);
                Lampa.Timeline.read();
                bumpFvAt(res.file_view);
            }
        }

        function applySets(res, allowedCatMap, replace) {
            var sets = res.sets || {}, cards = res.cards || {};

            SET_KEYS.forEach(function (key) {
                if (!allowedCatMap[key]) return;

                var ops = sets[key];
                if (!ops) return;

                var add = ops.add || [], del = ops.del || [];
                if (!res.full && !add.length && !del.length) return;

                var local = flat(key), lmap = mapOf(local), entries, changed = true;

                if (res.full) {
                    var remote = add.map(function (w) { return { k: kk(key, w), w: w }; });
                    var rmap = mapOf(remote), base = shadow[key] || {}, ns = {};

                    entries = remote.slice();

                    if (!replace) {
                        local.forEach(function (e) {
                            if (!has(base, e.k) && !rmap[e.k]) entries.push(e);
                        });
                        entries = entries.filter(function (e) { return !(has(base, e.k) && !lmap[e.k]); });
                    }

                    remote.forEach(function (e) { ns[e.k] = key === 'favorite' ? e.w : 1; });

                    if (!replace) Object.keys(base).forEach(function (k) {
                        if (!lmap[k] && !has(ns, k)) ns[k] = base[k];
                    });

                    shadow[key] = ns;
                }
                else {
                    var gone = Object.create(null);
                    del.forEach(function (w) { gone[kk(key, w)] = true; });

                    entries = local.filter(function (e) { return !gone[e.k]; });
                    changed = entries.length !== local.length;

                    add.forEach(function (w) {
                        var k = kk(key, w);
                        setShadow(key, k, w);
                        if (!lmap[k]) {
                            entries.push({ k: k, w: w });
                            lmap[k] = true;
                            changed = true;
                        }
                    });

                    Object.keys(gone).forEach(function (k) { delShadow(key, k); });
                }

                if (changed) build(key, entries, cards);
            });

            saveShadow();
        }

        function pull(forceFull, replace, customCatMap) {
            if ((!active() && !customCatMap) || pulling) return Promise.resolve(null);

            pulling = true;
            var catMap = customCatMap || getCatConfig(K_AUTO_CATS, false);
            var since = forceFull ? 0 : parseInt(localStorage.getItem(K_REV) || '0', 10) || 0;

            return request('GET', q('/lampa/state') + '&since=' + since).then(function (res) {
                pulling = false;

                if (!res || !res.success) throw new Error('Bad state');

                applyFileView(res, catMap);
                applySets(res, catMap, replace);
                applyRemoteKV(res, catMap, replace);
                saveShadow();

                // Обновляем глобальную ревизию только тогда, когда все включённые фоновые категории тоже были обработаны
                var autoCfg = getCatConfig(K_AUTO_CATS, false);
                var coversAllAuto = !customCatMap || Object.keys(autoCfg).every(function (k) {
                    return !autoCfg[k] || !!customCatMap[k];
                });
                if (coversAllAuto) {
                    localStorage.setItem(K_REV, String(res.rev));
                }

                if (Object.keys(pendingFV).length || Object.keys(dirtySets).length || Object.keys(dirtyKV).length) {
                    schedulePush();
                }

                log('получено: ревизия ' + res.rev + (res.full ? ' (полное состояние)' : ''));
                return res;
            })['catch'](function (e) {
                pulling = false;
                log('ошибка получения:', e.message);
                return null;
            });
        }

        // Ручная синхронизация по кнопке (использует K_MANUAL_CATS) или синхронизация выбранного набора
        function syncSelected(catMap, silent) {
            if (!token()) return silent || Lampa.Noty.show('Вы не зашли в аккаунт');

            var selectedIds = Object.keys(catMap).filter(function (k) { return !!catMap[k]; });
            if (!selectedIds.length) {
                return silent || Lampa.Noty.show('Не выбрано ни одной категории для синхронизации');
            }

            if (!silent) Lampa.Noty.show('Синхронизация выбранных категорий...');

            SET_KEYS.forEach(function (k) { if (catMap[k]) dirtySets[k] = true; });
            KV_KEYS.forEach(function (k) { if (catMap[k]) dirtyKV[k] = true; });

            // Передаём catMap в push(catMap), чтобы сначала ушли удаления (del) именно по выбранным категориям,
            // даже если фоновая синхронизация выключена или категории не входят в фоновый список
            var waitPush = pushPromise ? pushPromise.then(function () { return push(catMap); }) : push(catMap);

            return waitPush.then(function () {
                var fv = {}, sets = {}, cards = {}, kvOut = {};

                if (catMap['file_view']) {
                    var key = fvKey();
                    var local = Lampa.Storage.get(key, '{}');
                    if (isObj(local)) for (var h in local) if (isObj(local[h])) fv[h] = local[h];
                }

                SET_KEYS.forEach(function (k) {
                    if (!catMap[k]) return;
                    var entries = flat(k);
                    if (!entries.length) return;

                    sets[k] = { add: entries.map(function (e) { return e.w; }), del: [] };
                    if (k === 'favorite') Object.assign(cards, cardsFor(entries));
                });

                KV_KEYS.forEach(function (catId) {
                    if (!catMap[catId]) return;
                    var d = diffKV(catId, true);
                    if (Object.keys(d.set).length) {
                        kvOut[catId] = { set: d.set, del: [] };
                    }
                });

                return request('POST', q('/lampa/push'), {
                    bulk: true,
                    file_view: fv,
                    sets: sets,
                    cards: cards,
                    kv: kvOut
                }).then(function (res) {
                    if (catMap['file_view']) {
                        pendingFV = {};
                        bumpFvAt(fv);
                    }

                    return pull(true, true, catMap).then(function (got) {
                        if (!got) throw new Error('pull failed');
                        if (!silent) Lampa.Noty.show('Синхронизировано, изменений на сервере: ' + res.changed);
                    });
                });
            })['catch'](function (e) {
                log('syncSelected error', e.message);
                if (!silent) Lampa.Noty.show('Ошибка синхронизации');
            });
        }

        function startup() {
            var autoMap = getCatConfig(K_AUTO_CATS, false);
            if (!synced()) return syncSelected(autoMap, true);

            SET_KEYS.forEach(function (k) { if (autoMap[k]) dirtySets[k] = true; });
            KV_KEYS.forEach(function (k) { if (autoMap[k]) dirtyKV[k] = true; });
            queueFvSince();

            return push().then(function () { return pull(); });
        }

        // ---------- Подписки ----------

        if (Lampa.Timeline.listener && Lampa.Timeline.listener.follow) {
            Lampa.Timeline.listener.follow('update', onTimelineUpdate);
        }
        else buildFvShadow();

        Lampa.Storage.listener.follow('change', onStorageChange);

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) push();
            else pull();
        });

        setInterval(function () {
            if (!document.hidden) pull();
        }, PULL_INTERVAL);

        // ---------- Настройки (UI) ----------

        Lampa.SettingsApi.addComponent({
            component: 'acc',
            name: 'Аккаунт',
            icon: '<svg width="256" height="256" viewBox="0 0 32 32" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M16 17.25c4.556 0 8.25-3.694 8.25-8.25S20.556.75 16 .75 7.75 4.444 7.75 9s3.694 8.25 8.25 8.25zm0-14c3.176 0 5.75 2.574 5.75 5.75s-2.574 5.75-5.75 5.75S10.25 12.176 10.25 9 12.824 3.25 16 3.25zM30.9 29.73C29.35 22.83 23.27 17.75 16 17.75S2.65 22.83 1.12 29.63c-.02.08-.03.17-.03.27 0 .69.56 1.25 1.25 1.25.6 0 1.1-.42 1.22-.98C4.86 24.4 9.94 20.15 16 20.15s11.16 4.25 12.44 9.93c.13.57.62.98 1.22.98.1 0 .19-.01.28-.03.57-.13.98-.62.98-1.22 0-.1-.01-.19-.03-.28z"/></svg>'
        });

        Lampa.Settings.listener.follow('open', function (event) {
            setTimeout(function () {
                $('div[data-component=interface]').before($('div[data-component=acc]'));
            }, 30);

            if (event.name !== 'acc') return;

            var body = event.body || $('body');

            if (token()) {
                body.find('div[data-name="acc_auth"]').addClass('hide');
            }
            else {
                body.find('div[data-name="acc_status_title"], div[data-name="acc_token_info"], div[data-name="acc_exit"]').addClass('hide');
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_title_auth', type: 'title' },
            field: { name: 'Авторизация', description: '' }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_auth', type: 'input', values: '', placeholder: 'Нужно будет ввести токен', default: '' },
            field: { name: 'Выполнить вход', description: '' },
            onChange: function (value) {
                value = (value || '').trim();
                if (!value) return;

                request('POST', '/checkToken', { token: value }).then(function (res) {
                    if (res.userId) {
                        resetLocalState();
                        localStorage.setItem(K_TOKEN, value);
                        Lampa.Storage.set('acc_auth', '');
                        Lampa.Noty.show('Токен действителен');
                        Lampa.Settings.update();
                    }
                    else {
                        localStorage.removeItem(K_TOKEN);
                        Lampa.Noty.show('Токен недействителен');
                    }
                })['catch'](function () {
                    Lampa.Noty.show('Ошибка запроса');
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_status_title', type: 'title' },
            field: { name: 'Аккаунт подключен', description: '' },
            onRender: function (item) {
                item.attr('data-name', 'acc_status_title');
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_token_info', type: 'static' },
            field: { name: 'Токен авторизации', description: '' },
            onRender: function (item) {
                var t = token() || '';
                item.find('.settings-param__descr').text(t).show();
                item.on('hover:enter', function () {
                    if (t && Lampa.Utils && Lampa.Utils.copyTextToClipboard) {
                        Lampa.Utils.copyTextToClipboard(t, function () {
                            Lampa.Noty.show('Токен скопирован в буфер обмена');
                        });
                    }
                    else if (t) {
                        Lampa.Noty.show('Токен: ' + t);
                    }
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_exit', type: 'static' },
            field: { name: 'Выйти из аккаунта', description: '' },
            onRender: function (item) {
                item.on('hover:enter', function () {
                    localStorage.removeItem(K_TOKEN);
                    resetLocalState();
                    Lampa.Storage.set('acc_sync', false);
                    Lampa.Settings.update();
                });
            }
        });

        // --- Раздел: Фоновая синхронизация ---

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_title_sync', type: 'title' },
            field: { name: 'Фоновая синхронизация', description: '' }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_sync', type: 'trigger', default: false },
            field: {
                name: 'Автоматическая синхронизация',
                description: 'В фоне отправлять и получать выбранные ниже категории'
            },
            onChange: function (value) {
                if (value !== 'true') return;

                if (!token()) {
                    Lampa.Noty.show('Вы не зашли в аккаунт');
                    Lampa.Storage.set('acc_sync', false);
                    Lampa.Settings.update();
                    return;
                }

                syncSelected(getCatConfig(K_AUTO_CATS, false));
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_auto_cats_btn', type: 'static' },
            field: {
                name: 'Категории фоновой синхронизации',
                description: ''
            },
            onRender: function (item) {
                function updateCount() {
                    item.find('.settings-param__descr').text('Выбрано категорий: ' + countEnabled(K_AUTO_CATS, false)).show();
                }
                updateCount();
                item.on('hover:enter', function () {
                    openCatSelector('Фоновая синхронизация', K_AUTO_CATS, false, updateCount);
                });
            }
        });

        // --- Раздел: Ручная синхронизация ---

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_title_manual', type: 'title' },
            field: { name: 'Ручная синхронизация', description: '' }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_manual_cats_btn', type: 'static' },
            field: {
                name: 'Категории для ручной синхронизации',
                description: ''
            },
            onRender: function (item) {
                function updateCount() {
                    item.find('.settings-param__descr').text('Выбрано категорий: ' + countEnabled(K_MANUAL_CATS, true)).show();
                }
                updateCount();
                item.on('hover:enter', function () {
                    openCatSelector('Категории для кнопки синхронизации', K_MANUAL_CATS, true, updateCount);
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_sync_all', type: 'static' },
            field: {
                name: 'Синхронизировать выбранное сейчас',
                description: 'Отправить и получить только категории, отмеченные для ручной синхронизации'
            },
            onRender: function (item) {
                item.on('hover:enter', function () {
                    syncSelected(getCatConfig(K_MANUAL_CATS, true), false);
                });
            }
        });

        // --- Раздел: Управление данными ---

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_title_danger', type: 'title' },
            field: { name: 'Управление данными', description: '' }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'sync_reset', type: 'static' },
            field: {
                name: 'Сброс данных синхронизации',
                description: 'Внимание !!! После нажатия ваши данные на сервере будут удалены'
            },
            onRender: function (item) {
                item.on('hover:enter', function () {
                    if (!token()) return Lampa.Noty.show('Вы не зашли в аккаунт');

                    request('DELETE', q('/lampa/sync')).then(function () {
                        resetLocalState();
                        Lampa.Noty.show('Данные синхронизации удалены');
                    })['catch'](function () {
                        Lampa.Noty.show('Ошибка при удалении или данные отсутствуют');
                    });
                });
            }
        });

        // старт: проверяем токен, отправляем накопленное и забираем изменения
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
                log('ошибка проверки токена:', e.message);
            });
        }
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (event) {
        if (event.type == 'ready') startPlugin();
    });
})();

(function () {
    'use strict';

    var SERVER = 'http://217.25.226.225:933';

    var PUSH_DELAY = 3000;          // пауза после последнего изменения перед отправкой
    var RETRY_DELAY = 15000;        // повтор отправки при ошибке
    var PULL_INTERVAL = 60 * 1000;  // как часто забирать изменения с других устройств
    var SNAP_KEYS = ['online_view', 'torrents_view', 'favorite', 'search_history'];
    var K_TOKEN = 'sync_token';
    var K_REV = 'sync_rev';

    function startPlugin() {
        var pendingFV = {};    // hash -> запись прогресса, ещё не отправленная
        var pendingSnap = {};  // ключ -> true, снимок ещё не отправлен
        var pushTimer = null;
        var pushing = false;
        var pulling = false;
        var shadow = null;     // запасной путь для старых Lampa без Timeline.listener

        function log() {
            var args = ['Sync'].concat([].slice.call(arguments));
            console.log.apply(console, args);
        }

        function token() { return localStorage.getItem(K_TOKEN); }
        function active() { return !!token() && Lampa.Storage.field('acc_sync'); }
        function fvKey() { return (Lampa.Timeline.filename && Lampa.Timeline.filename()) || 'file_view'; }
        function clone(o) { return JSON.parse(JSON.stringify(o)); }
        function isObj(o) { return o && typeof o === 'object' && !Array.isArray(o); }

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

        // ---------- отправка изменений ----------

        function schedulePush(delay) {
            clearTimeout(pushTimer);
            pushTimer = setTimeout(push, delay || PUSH_DELAY);
        }

        function push() {
            if (!active() || pushing) return;

            var fv = pendingFV, snapKeys = Object.keys(pendingSnap);

            if (!Object.keys(fv).length && !snapKeys.length) return;

            pendingFV = {};
            pendingSnap = {};
            pushing = true;

            var snapshots = {};

            snapKeys.forEach(function (key) {
                snapshots[key] = Lampa.Storage.get(key, key === 'favorite' ? '{}' : '[]');
            });

            request('POST', q('/lampa/push'), { file_view: fv, snapshots: snapshots }).then(function (res) {
                pushing = false;
                log('отправлено, изменений на сервере:', res.changed);
            })['catch'](function (e) {
                pushing = false;
                log('ошибка отправки, повтор позже:', e.message);

                // возвращаем в очередь то, что не успели заменить более свежим
                for (var h in fv) if (!pendingFV[h]) pendingFV[h] = fv[h];
                snapKeys.forEach(function (k) { pendingSnap[k] = true; });

                schedulePush(RETRY_DELAY);
            });
        }

        function onTimelineUpdate(e) {
            if (!active() || !e || !e.data || !e.data.road) return;

            pendingFV[e.data.hash] = clone(e.data.road);
            schedulePush();
        }

        function onStorageChange(e) {
            if (!active()) return;

            if (SNAP_KEYS.indexOf(e.name) !== -1) {
                pendingSnap[e.name] = true;
                schedulePush();
            }
            else if (shadow && e.name === fvKey()) diffFileView(e.value);
        }

        // Запасной путь: если Timeline.listener нет, ищем изменённые записи сравнением
        function buildShadow() {
            var cur = Lampa.Storage.get(fvKey(), '{}');

            shadow = {};
            if (isObj(cur)) for (var h in cur) shadow[h] = JSON.stringify(cur[h]);
        }

        function diffFileView(value) {
            if (!isObj(value)) return;

            for (var h in value) {
                var s = JSON.stringify(value[h]);

                if (shadow[h] !== s) {
                    shadow[h] = s;
                    if (isObj(value[h])) pendingFV[h] = clone(value[h]);
                }
            }

            schedulePush();
        }

        // ---------- получение изменений ----------

        function applyState(res) {
            var changedFV = false;
            var ids = Object.keys(res.file_view || {});

            if (ids.length) {
                var key = fvKey();
                var local = Lampa.Storage.get(key, '{}');

                if (!isObj(local)) local = {};

                ids.forEach(function (h) {
                    var inc = res.file_view[h], cur = local[h];

                    if (pendingFV[h]) return; // свежее локальное изменение ещё не ушло — не затираем

                    if (isObj(cur) && cur.updated && inc.updated && cur.updated > inc.updated) {
                        pendingFV[h] = clone(cur); // локальная запись новее — сообщим серверу
                        return;
                    }

                    local[h] = Object.assign({ duration: 0, time: 0, percent: 0 }, inc);
                    if (shadow) shadow[h] = JSON.stringify(local[h]);
                    changedFV = true;
                });

                if (changedFV) {
                    Lampa.Storage.set(key, local, true); // true — без события, чтобы не отправить обратно
                    Lampa.Timeline.read();
                }
            }

            var snaps = res.snapshots || {};

            for (var k in snaps) {
                if (SNAP_KEYS.indexOf(k) === -1 || pendingSnap[k]) continue;

                Lampa.Storage.set(k, snaps[k], true);

                if (k === 'favorite') {
                    try {
                        Lampa.Favorite.init();
                        Lampa.Favorite.read(true);
                    } catch (e) { log('favorite reload error', e.message); }
                }
            }

            if (Object.keys(pendingFV).length) schedulePush();

            return changedFV;
        }

        function pull(full) {
            if (!active() || pulling) return Promise.resolve(null);

            pulling = true;

            var since = full ? 0 : parseInt(localStorage.getItem(K_REV) || '0', 10) || 0;

            return request('GET', q('/lampa/state') + '&since=' + since).then(function (res) {
                pulling = false;

                if (!res || !res.success) throw new Error('Bad state');

                applyState(res);
                localStorage.setItem(K_REV, String(res.rev));
                log('получено: записей ' + Object.keys(res.file_view || {}).length + ', ревизия ' + res.rev);

                return res;
            })['catch'](function (e) {
                pulling = false;
                log('ошибка получения:', e.message);

                return null;
            });
        }

        // Кнопка «Синхронизировать всё»: отправляем всё, сервер объединяет, забираем результат целиком
        function syncAll(silent) {
            if (!token()) return silent || Lampa.Noty.show('Вы не зашли в аккаунт');

            var key = fvKey();
            var local = Lampa.Storage.get(key, '{}');
            var fv = {};

            if (isObj(local)) for (var h in local) if (isObj(local[h])) fv[h] = local[h];

            var snapshots = {};

            SNAP_KEYS.forEach(function (k) {
                snapshots[k] = Lampa.Storage.get(k, k === 'favorite' ? '{}' : '[]');
            });

            if (!silent) Lampa.Noty.show('Синхронизация...');

            request('POST', q('/lampa/push'), { bulk: true, file_view: fv, snapshots: snapshots }).then(function (res) {
                pendingFV = {};
                pendingSnap = {};

                return pull(true).then(function () {
                    if (!silent) Lampa.Noty.show('Синхронизировано, изменений на сервере: ' + res.changed);
                });
            })['catch'](function (e) {
                log('syncAll error', e.message);
                if (!silent) Lampa.Noty.show('Ошибка синхронизации');
            });
        }

        // ---------- подписки ----------

        if (Lampa.Timeline.listener && Lampa.Timeline.listener.follow) {
            Lampa.Timeline.listener.follow('update', onTimelineUpdate);
        }
        else buildShadow();

        Lampa.Storage.listener.follow('change', onStorageChange);

        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) pull();
        });

        setInterval(function () {
            if (!document.hidden) pull();
        }, PULL_INTERVAL);

        // ---------- настройки ----------

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

            // Прячем классом hide, а не .hide(): Lampa при установке фокуса пропускает только элементы с этим классом.
            // Если скрыть стилем, пульт «залипает» на невидимом поле токена и меню не реагирует.
            if (token()) $('div[data-name="acc_auth"]').addClass('hide');
            else $('div > span:contains("Аккаунт подключен")').closest('div').addClass('hide');
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
                request('POST', '/checkToken', { token: value }).then(function (res) {
                    if (res.userId) {
                        localStorage.setItem(K_TOKEN, value);
                        localStorage.removeItem(K_REV);
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
            param: { name: 'acc_status', type: 'title' },
            field: { name: 'Аккаунт подключен', description: '' }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_exit', type: 'static' },
            field: { name: 'Выйти из аккаунта', description: '' },
            onRender: function (item) {
                item.on('hover:enter', function () {
                    localStorage.removeItem(K_TOKEN);
                    localStorage.removeItem(K_REV);
                    Lampa.Storage.set('acc_sync', false);
                    Lampa.Settings.update();
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_title_sync', type: 'title' },
            field: { name: 'Синхронизация', description: '' }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_sync', type: 'trigger', default: false },
            field: {
                name: 'Синхронизация данных',
                description: 'Закладки, таймкоды, история просмотров и поиска между устройствами'
            },
            onChange: function (value) {
                if (value !== 'true') return;

                if (!token()) {
                    Lampa.Noty.show('Вы не зашли в аккаунт');
                    Lampa.Storage.set('acc_sync', false);
                    Lampa.Settings.update();

                    return;
                }

                // первое включение: объединяем локальные данные с серверными, ничего не теряя
                syncAll();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: { name: 'acc_sync_all', type: 'static' },
            field: {
                name: 'Синхронизировать всё',
                description: 'Отправить все данные устройства на сервер и объединить с серверными. Ничего не удаляется'
            },
            onRender: function (item) {
                item.on('hover:enter', function () { syncAll(); });
            }
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
                        localStorage.removeItem(K_REV);
                        Lampa.Noty.show('Данные синхронизации удалены');
                    })['catch'](function () {
                        Lampa.Noty.show('Ошибка при удалении или данные отсутствуют');
                    });
                });
            }
        });

        // старт: проверяем токен и забираем изменения
        if (token() && Lampa.Storage.field('acc_sync')) {
            request('POST', '/checkToken', { token: token() }).then(function (res) {
                if (!res.userId) {
                    localStorage.removeItem(K_TOKEN);
                    Lampa.Storage.set('acc_sync', false);
                    Lampa.Noty.show('Токен недействителен');

                    return;
                }

                // устройство ещё ни разу не синхронизировалось — объединяем, а не перезаписываем
                if (localStorage.getItem(K_REV) === null) syncAll(true);
                else pull();
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

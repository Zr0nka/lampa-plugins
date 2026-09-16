(function () {
    'use strict';

    Lampa.Platform.tv();

    var SERVER = 'http://94.156.115.58:803';

    // Ключи, которые участвуют в синхронизации.
    // Настройки приложения и список плагинов сюда намеренно не входят.
    var SYNC_KEYS = ['online_view', 'torrents_view', 'favorite', 'file_view', 'search_history'];

    function startPlugin() {
        var infoBlock = $('<div class="myBot" style="line-height: 1;color: #ffffff;font-family: &quot;SegoeUI&quot;, sans-serif;font-size: 1em;box-sizing: border-box;outline: none;user-select: none;display: flex;-webkit-box-align: start;align-items: flex-start;position: relative;background-color: rgba(255, 255, 255, 0.1);border-radius: 0.3em;margin: 1.5em 2em;flex-wrap: wrap;"><div class="ad-server__text" style="flex: 1; line-height: 1.8;">Для получения токена перейдите в наш телеграм бот <span style="background-color: #ffe216; border-radius: 0.3em; padding: 0.15em; color: #000;">@bylampa_sync_bot</span> или на сайт <span style="background-color: #ffe216; border-radius: 0.3em; padding: 0.15em; color: #000;">sync.bylampa.online</span></div><img class="ad-server__qr" style="opacity: 1; border-radius: 0.3em; overflow: hidden; box-sizing: border-box; margin: auto 0.6em auto auto;" src="http://bylampa.online/img/qr_sync.png"></div>');

        var sync = {
            timer: null,
            needsSync: false,
            isSyncSuccessful: false,

            handleStorageChange: function (event) {
                var key = event.name;

                if (SYNC_KEYS.indexOf(key) === -1) return;

                console.log('Sync', 'Изменен ключ в локальном хранилище: ' + key);
                this.needsSync = true;

                if (this.timer) clearTimeout(this.timer);

                this.timer = setTimeout(function () {
                    if (this.needsSync && !skipFirstChange) {
                        var token = localStorage.getItem('token');

                        if (token) this.startSync(token);

                        this.needsSync = false;
                    }

                    skipFirstChange = null;
                }.bind(this), 500);
            },

            startSync: function (token) {
                console.log('Sync', 'Запуск синхронизации...');
                this.isSyncSuccessful = false;

                this.sendDataToServer(token).then(function () {
                    if (this.isSyncSuccessful) console.log('Sync', 'Синхронизация успешно завершена');
                    else console.log('Sync', 'Ошибка: Данные для синхронизации отсутствуют');

                    this.needsSync = false;
                }.bind(this))['catch'](function (error) {
                    console.log('Sync', 'Ошибка синхронизации:', error.message || error);
                    this.needsSync = true;
                }.bind(this));
            },

            sendDataToServer: function (token) {
                var attempt = 0;
                var data = this.getSyncedData();
                var form = new FormData();

                for (var key in data) {
                    if (data.hasOwnProperty(key)) form.append(key, JSON.stringify(data[key]));
                }

                form.append('file', new Blob([JSON.stringify(data)], {
                    type: 'application/json'
                }));

                var send = function () {
                    attempt++;
                    console.log('Sync', 'Попытка отправки данных ' + attempt + ' из 3...');

                    return this.makeHttpRequest('POST', SERVER + '/lampa/sync?token=' + encodeURIComponent(token), form).then(function (xhr) {
                        if (xhr.status === 200) {
                            this.isSyncSuccessful = true;
                            console.log('Sync', 'Данные отправлены');

                            return JSON.parse(xhr.responseText);
                        }

                        this.isSyncSuccessful = false;
                        throw new Error('Ошибка сервера: ' + xhr.status);
                    }.bind(this))['catch'](function (error) {
                        var message = error.message || 'Неизвестная ошибка';

                        console.log('Sync', 'Ошибка при попытке ' + attempt + ' [' + message + ']');

                        if (attempt < 3) {
                            console.log('Sync', 'Повтор через 5 секунд...');

                            return new Promise(function (resolve) {
                                setTimeout(function () {
                                    resolve(send());
                                }, 5000);
                            });
                        }

                        console.log('Sync', 'Все попытки исчерпаны');
                        throw new Error('Не удалось отправить данные после 3 попыток [' + message + ']');
                    }.bind(this));
                }.bind(this);

                return send();
            },

            getSyncedData: function () {
                return {
                    online_view: Lampa.Storage.get('online_view', '[]'),
                    torrents_view: Lampa.Storage.get('torrents_view', '[]'),
                    favorite: Lampa.Storage.get('favorite', '{}'),
                    file_view: Lampa.Storage.get('file_view', '{}'),
                    search_history: Lampa.Storage.get('search_history', '[]')
                };
            },

            loadDataFromServer: function (token) {
                return this.makeHttpRequest('GET', SERVER + '/lampa/sync?token=' + encodeURIComponent(token)).then(function (xhr) {
                    if (xhr.status === 200) return JSON.parse(xhr.responseText);

                    console.log('Sync', 'Данные для синхронизации отсутствуют');

                    return {
                        success: false,
                        data: null
                    };
                }).then(function (response) {
                    return response && response.success && response.data ? response.data : null;
                })['catch'](function (error) {
                    console.log('Sync', 'Ошибка при загрузке данных [' + (error.message || 'Сервер недоступен') + ']');

                    return null;
                });
            },

            makeHttpRequest: function (method, url, body) {
                return new Promise(function (resolve, reject) {
                    var xhr = new XMLHttpRequest();

                    xhr.open(method, url, true);

                    if (method === 'POST') xhr.send(body);
                    else xhr.send();

                    xhr.onload = function () {
                        if (xhr.status >= 200 && xhr.status < 300) resolve(xhr);
                        else reject(new Error('HTTP Error: ' + xhr.status + ' ' + xhr.statusText));
                    };

                    xhr.onerror = function () {
                        reject(new Error('Network error'));
                    };

                    xhr.ontimeout = function () {
                        reject(new Error('Timeout'));
                    };
                });
            },

            updateLocalStorage: function (data) {
                if (typeof data === 'undefined') return;

                if (typeof data !== 'object' || data === null) {
                    console.log('Sync', 'Ошибка: Данные для синхронизации некорректны или отсутствуют');

                    return;
                }

                for (var i = 0; i < SYNC_KEYS.length; i++) {
                    var key = SYNC_KEYS[i];

                    if (!data.hasOwnProperty(key) || (!Array.isArray(data[key]) && typeof data[key] !== 'object')) {
                        console.log('Sync', 'Ошибка: Данные для ключа "' + key + '" некорректны');

                        continue;
                    }

                    if (key === 'favorite') {
                        Lampa.Storage.set('favorite', data[key]);
                        Lampa.Favorite.init();
                        Lampa.Favorite.read(true);
                    }
                    else if (key === 'file_view') {
                        Lampa.Storage.set('file_view', data[key]);
                        Lampa.Timeline.read();
                    }
                    else {
                        Lampa.Storage.set(key, data[key]);
                    }
                }
            }
        };

        Lampa.SettingsApi.addComponent({
            component: 'acc',
            name: 'Аккаунт',
            icon: '<svg fill="#ffffff" width="256px" height="256px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>user</title> <path d="M16 17.25c4.556 0 8.25-3.694 8.25-8.25s-3.694-8.25-8.25-8.25c-4.556 0-8.25 3.694-8.25 8.25v0c0.005 4.554 3.696 8.245 8.249 8.25h0.001zM16 3.25c3.176 0 5.75 2.574 5.75 5.75s-2.574 5.75-5.75 5.75c-3.176 0-5.75-2.574-5.75-5.75v0c0.004-3.174 2.576-5.746 5.75-5.75h0zM30.898 29.734c-1.554-6.904-7.633-11.984-14.899-11.984s-13.345 5.080-14.88 11.882l-0.019 0.102c-0.018 0.080-0.029 0.172-0.029 0.266 0 0.69 0.56 1.25 1.25 1.25 0.596 0 1.095-0.418 1.22-0.976l0.002-0.008c1.301-5.77 6.383-10.016 12.457-10.016s11.155 4.245 12.44 9.93l0.016 0.085c0.126 0.566 0.623 0.984 1.219 0.984h0c0 0 0 0 0 0 0.095 0 0.187-0.011 0.276-0.031l-0.008 0.002c0.567-0.125 0.984-0.623 0.984-1.219 0-0.095-0.011-0.187-0.031-0.276l0.002 0.008z"></path> </g></svg>'
        });

        Lampa.Settings.listener.follow('open', function (event) {
            setTimeout(function () {
                $('div[data-component=interface]').before($('div[data-component=acc]'));
            }, 30);

            if (event.name !== 'acc') return;

            $('div[data-name="acc_auth"]').before(infoBlock);

            if (localStorage.getItem('token') !== null) {
                $('div[data-name="acc_auth"]').hide();

                var focusTarget = document.querySelector('#app > div.settings > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(5)');

                Lampa.Controller.focus(focusTarget);
                Lampa.Controller.toggle('settings_component');
            }
            else {
                $('div > span:contains("Аккаунт")').hide();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: {
                name: 'acc_title_auth',
                type: 'title'
            },
            field: {
                name: 'Авторизация',
                description: ''
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: {
                name: 'acc_auth',
                type: 'input',
                values: '',
                placeholder: 'Нужно будет ввести токен',
                default: ''
            },
            field: {
                name: 'Выполнить вход',
                description: ''
            },
            onChange: function (token) {
                console.log('Sync', 'Введенный токен:', token);

                var xhr = new XMLHttpRequest();

                xhr.open('POST', SERVER + '/checkToken', true);
                xhr.setRequestHeader('Content-Type', 'application/json');

                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== 4) return;

                    if (xhr.status !== 200) {
                        Lampa.Noty.show('Ошибка запроса');

                        return;
                    }

                    var response = JSON.parse(xhr.responseText);

                    console.log('Sync', 'Ответ сервера:', response);

                    if (response.userId) {
                        console.log('Sync', 'Токен действителен');
                        localStorage.setItem('token', token);
                        Lampa.Noty.show('Токен действителен');
                        Lampa.Settings.update();
                    }
                    else {
                        console.log('Sync', 'Токен недействителен');
                        localStorage.removeItem('token');
                        Lampa.Noty.show('Токен недействителен');
                    }
                };

                xhr.send(JSON.stringify({
                    token: token
                }));
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: {
                name: 'acc_status',
                type: 'title'
            },
            field: {
                name: '<div class="settings-folder" style="padding:0!important"><div style="width:1.3em;height:1.3em;padding-right:.1em"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path style="fill:#1E0478;" d="M334.975,0c95.414,0,173.046,77.632,173.046,173.046c0,95.426-77.632,173.046-173.046,173.046 c-21.224,0-41.843-3.771-61.415-11.224l-40.128,40.128c-2.358,2.358-5.574,3.695-8.916,3.695h-27.139v27.126 c0,6.974-5.65,12.611-12.611,12.611h-12.359v12.359c0,6.974-5.65,12.611-12.611,12.611h-30.833v30.884 c0,3.342-1.337,6.558-3.708,8.916l-25.146,25.108C97.753,510.676,94.55,512,91.208,512H16.59c-6.961,0-12.611-5.65-12.611-12.611 v-90.546c0-3.342,1.337-6.558,3.695-8.916l165.467-165.479c-7.44-19.572-11.211-40.191-11.211-61.402 C161.929,77.632,239.549,0,334.975,0z M482.8,173.046c0-81.504-66.32-147.824-147.824-147.824 c-81.516,0-147.824,66.32-147.824,147.824c0,20.644,4.162,40.607,12.371,59.334c2.131,4.843,0.958,10.303-2.522,13.872 c-0.038,0.038-0.063,0.076-0.101,0.113L29.2,414.064v22.788l138.089-138.089c4.439-4.426,11.615-4.426,16.054,0 c4.426,4.439,4.426,11.615,0,16.054L29.2,468.959v17.819h56.787l17.756-17.731v-38.261c0-6.961,5.65-12.611,12.611-12.611h30.833 v-12.359c0-6.961,5.65-12.611,12.611-12.611h12.359V366.08c0-6.974,5.65-12.611,12.611-12.611h34.528l42.347-42.36 c0.038-0.038,0.076-0.063,0.113-0.101c3.581-3.481,9.029-4.653,13.872-2.522c18.74,8.222,38.703,12.384,59.347,12.384 C416.479,320.87,482.8,254.562,482.8,173.046z"/><path style="fill:#9B8CCC;" d="M334.975,25.222c81.504,0,147.824,66.32,147.824,147.824c0,81.516-66.32,147.824-147.824,147.824 c-20.644,0-40.607-4.162-59.347-12.384c-4.843-2.131-10.29-0.958-13.872,2.522c-0.038,0.038-0.076,0.063-0.113,0.101l-42.347,42.36 h-34.528c-6.961,0-12.611,5.637-12.611,12.611v27.126h-12.359c-6.961,0-12.611,5.65-12.611,12.611v12.359h-30.833 c-6.961,0-12.611,5.65-12.611,12.611v38.261l-17.756,17.731H29.2v-17.819l154.142-154.142c4.426-4.439,4.426-11.615,0-16.054 c-4.439-4.426-11.615-4.426-16.054,0L29.2,436.852v-22.788l167.699-167.699c0.038-0.038,0.063-0.076,0.101-0.113 c3.481-3.569,4.653-9.029,2.522-13.872c-8.21-18.727-12.371-38.69-12.371-59.334C187.151,91.542,253.459,25.222,334.975,25.222z M434.866,120.383c0-26.041-21.186-47.24-47.228-47.24c-26.054,0-47.24,21.199-47.24,47.24s21.186,47.24,47.24,47.24 C413.68,167.623,434.866,146.424,434.866,120.383z"/><path style="fill:#1E0478;" d="M387.638,73.143c26.041,0,47.228,21.199,47.228,47.24s-21.186,47.24-47.228,47.24 c-26.054,0-47.24-21.199-47.24-47.24S361.584,73.143,387.638,73.143z M409.644,120.383c0-12.144-9.874-22.019-22.006-22.019 c-12.144,0-22.018,9.874-22.018,22.019s9.874,22.019,22.018,22.019C399.77,142.402,409.644,132.527,409.644,120.383z"/><path style="fill:#FFFFFF;" d="M387.638,98.365c12.132,0,22.006,9.874,22.006,22.019s-9.874,22.019-22.006,22.019 c-12.144,0-22.019-9.874-22.019-22.019S375.494,98.365,387.638,98.365z"/></svg></div><div style="font-size:1.1em"><div style="padding: 0.3em 0.3em; padding-top: 0;"><div style="background: #d99821; padding: 0.5em; border-radius: 0.4em;color: white;"><div style="line-height: 0.3;">Аккаунт подключен</div></div></div></div></div>',
                description: ''
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: {
                name: 'acc_exit',
                type: 'static'
            },
            field: {
                name: 'Выйти из аккаунта',
                description: ''
            },
            onRender: function (item) {
                item.on('hover:enter', function () {
                    localStorage.removeItem('token');
                    Lampa.Storage.set('acc_sync', false);
                    Lampa.Settings.update();
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: {
                name: 'acc_title_sync',
                type: 'title'
            },
            field: {
                name: 'Синхронизация',
                description: ''
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: {
                name: 'acc_sync',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Синхронизация данных',
                description: 'Синхронизация ваших закладок, таймкодов, историй просмотров и поиска между устройствами'
            },
            onChange: function (value) {
                if (value !== 'true') return;

                var token = localStorage.getItem('token');

                if (!token) {
                    Lampa.Noty.show('Вы не зашли в аккаунт');

                    if (Lampa.Storage.field('acc_sync')) {
                        Lampa.Storage.set('acc_sync', false);
                        Lampa.Settings.update();
                    }

                    return;
                }

                sync.loadDataFromServer(token).then(function (data) {
                    if (data) {
                        sync.updateLocalStorage(data);
                        Lampa.Noty.show('Приложение будет перезапущено ...');

                        setTimeout(function () {
                            window.location.reload();
                        }, 3000);
                    }
                    else {
                        console.log('Sync', 'Не удалось загрузить данные для синхронизации');
                    }
                })['catch'](function (error) {
                    console.log('Sync', 'Ошибка при загрузке данных:', error);
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'acc',
            param: {
                name: 'sync_reset',
                type: 'static'
            },
            field: {
                name: 'Сброс данных синхронизации',
                description: 'Внимание !!! После нажатия ваши синхронизированные данные будут удалены'
            },
            onRender: function (item) {
                item.on('hover:enter', function () {
                    var token = localStorage.getItem('token');

                    if (!token) {
                        Lampa.Noty.show('Вы не зашли в аккаунт');

                        return;
                    }

                    var xhr = new XMLHttpRequest();

                    xhr.open('DELETE', SERVER + '/lampa/sync?token=' + encodeURIComponent(token));

                    xhr.onload = function () {
                        if (xhr.status === 200) {
                            Lampa.Noty.show('Данные синхронизации удалены');
                        }
                        else {
                            console.error('Ошибка при удалении данных синхронизации:', xhr.status, xhr.statusText);
                            Lampa.Noty.show('Ошибка при удалении или данные отсутствуют');
                        }
                    };

                    xhr.onerror = function () {
                        console.error('Ошибка при удалении данных синхронизации:', xhr.status, xhr.statusText);
                        Lampa.Noty.show('Ошибка при удалении или данные отсутствуют');
                    };

                    xhr.send();
                });
            }
        });

        Lampa.Storage.listener.follow('change', function (event) {
            if (Lampa.Storage.field('acc_sync')) sync.handleStorageChange(event);
        });

        // Стартовая загрузка данных с сервера.
        // Переменная заодно работает флагом: пока она не сброшена в null,
        // первое изменение хранилища не вызывает обратную отправку.
        var skipFirstChange = setInterval(function () {
            if (typeof Lampa === 'undefined') return;

            clearInterval(skipFirstChange);

            var token = localStorage.getItem('token');
            var enabled = Lampa.Storage.get('acc_sync', false);

            if (!token || !enabled) {
                console.log('Sync', 'Вы не зашли в аккаунт или синхронизация отключена');

                return;
            }

            var xhr = new XMLHttpRequest();

            xhr.open('POST', SERVER + '/checkToken', true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;

                if (xhr.status !== 200) {
                    console.log('Sync', 'Ошибка при проверке токена:', xhr.statusText);
                    Lampa.Noty.show('Ошибка запроса на сервер');

                    return;
                }

                var response = JSON.parse(xhr.responseText);

                if (!response.userId) {
                    console.log('Sync', 'Токен недействителен');
                    localStorage.removeItem('token');
                    Lampa.Storage.set('acc_sync', false);
                    Lampa.Noty.show('Токен недействителен');

                    return;
                }

                console.log('Sync', 'Токен действителен');

                sync.loadDataFromServer(token).then(function (data) {
                    if (data) {
                        sync.updateLocalStorage(data);
                        skipFirstChange = true;
                    }
                    else {
                        console.log('Sync', 'Не удалось загрузить данные для синхронизации');
                    }
                })['catch'](function (error) {
                    console.log('Sync', 'Ошибка при загрузке данных:', error);
                });
            };

            xhr.send(JSON.stringify({
                token: token
            }));
        }, 200);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (event) {
        if (event.type == 'ready') startPlugin();
    });
})();

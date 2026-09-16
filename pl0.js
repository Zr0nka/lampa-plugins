(function () {
    'use strict';
    Lampa.Platform.tv();

    // Проверка авторства сборки. Если это не "bylampa", плагин работать не будет.
    if (Lampa.Manifest.author !== 'bylampa') {
      //  Lampa.Noty.show('Ошибка доступа');
     //   return;
    }

    var SERVER_URL = 'http://94.156.115.58:803';

    // Верстка для отображения QR-кода и инструкции по получению токена в Telegram
    var botHtml = $('<div class="myBot" style="line-height: 1;color: #ffffff;font-family: &quot;SegoeUI&quot;, sans-serif;font-size: 1em;box-sizing: border-box;outline: none;user-select: none;display: flex;-webkit-box-align: start;align-items: flex-start;position: relative;background-color: rgba(255, 255, 255, 0.1);border-radius: 0.3em;margin: 1.5em 2em;flex-wrap: wrap;">' +
        '<img class="ad-server__qr" style="opacity: 1; border-radius: 0.3em; overflow: hidden; box-sizing: border-box; margin: auto 0.6em auto auto;" src="https://bylampa.online/img/qr_sync.png">' +
        '<div class="ad-server__text" style="flex: 1; line-height: 1.8;">' +
        'Для получения токена перейдите в наш телеграм бот <span style="background-color: #ffe216; border-radius: 0.3em; padding: 0.15em; color: #000;">@bylampa_sync_bot</span> или на сайт <span style="background-color: #ffe216; border-radius: 0.3em; padding: 0.15em; color: #000;">sync.bylampa.online</span>' +
        '</div>' +
        '</div>');

    // Добавляем раздел "Аккаунт" в настройки Lampa
    Lampa.SettingsApi.addComponent({
        component: 'acc',
        name: 'Аккаунт',
        icon: '<svg fill="#ffffff" width="256px" height="256px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M16 17.25c4.556 0 8.25-3.694 8.25-8.25s-3.694-8.25-8.25-8.25c-4.556 0-8.25 3.694-8.25 8.25v0c0.005 4.554 3.696 8.245 8.249 8.25h0.001zM16 3.25c3.176 0 5.75 2.574 5.75 5.75s-2.574 5.75-5.75 5.75c-3.176 0-5.75-2.574-5.75-5.75v0c0.004-3.174 2.576-5.746 5.75-5.75h0zM30.898 29.734c-1.554-6.904-7.633-11.984-14.899-11.984s-13.345 5.080-14.88 11.882l-0.019 0.102c-0.018 0.080-0.029 0.172-0.029 0.266 0 0.69 0.56 1.25 1.25 1.25 0.596 0 1.095-0.418 1.22-0.976l0.002-0.008c1.301-5.77 6.383-10.016 12.457-10.016s11.155 4.245 12.44 9.93l0.016 0.085c0.126 0.566 0.623 0.984 1.219 0.984h0c0 0 0 0 0 0 0.095 0 0.187-0.011 0.276-0.031l-0.008 0.002c0.567-0.125 0.984-0.623 0.984-1.219 0-0.095-0.011-0.187-0.031-0.276l0.002 0.008z"></path></svg>'
    });

    // Обработчик открытия настроек
    Lampa.Settings.listener.follow('open', function (e) {
        setTimeout(function () {
            // Перемещаем кнопку "Выйти" в конец списка
            $('#app > div.settings > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(5)').before($('.settings-param > div:contains("Выйти")'));
        }, 30);

        if (e.name == 'acc') {
            $('div[data-component=acc]').append(botHtml);
            
            // Если токен есть, прячем поле ввода, иначе показываем
            if (localStorage.getItem('token') !== null) {
                $('div[data-name="acc_auth"]').hide();
                var accElement = document.querySelector('div > span:contains("Аккаунт")');
                Lampa.Controller.update(accElement);
                Lampa.SettingsApi.update('acc');
            } else {
                $('div[data-component=interface]').empty();
                $('div[data-component=acc]').parent().empty();
            }
        }
    });

    // Заголовок "Авторизация"
    Lampa.SettingsApi.addParam({
        component: 'acc',
        param: { name: 'acc_title_auth', type: 'title' },
        field: { name: 'Авторизация', description: '' }
    });

    // Поле ввода токена
    Lampa.SettingsApi.addParam({
        component: 'acc',
        param: { name: 'token', type: 'input', values: '', placeholder: 'Нужно будет ввести токен', default: '' },
        field: { name: 'Выполнить вход', description: '' },
        onChange: function (value) {
            console.log('Sync', 'Введенный токен:', value);
            var xhr = new XMLHttpRequest();
            xhr.open('POST', SERVER_URL + '/checkToken', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    console.log('Sync', 'Ответ сервера:', response);
                    if (response.success) {
                        console.log('Sync', 'Токен действителен');
                        localStorage.setItem('token', value);
                        Lampa.Noty.show('Токен действителен');
                        Lampa.Settings.update();
                    } else {
                        console.log('Sync', 'Токен недействителен');
                        localStorage.removeItem('token');
                        Lampa.Noty.show('Токен недействителен');
                    }
                } else {
                    Lampa.Noty.show('Ошибка запроса');
                }
            };
            xhr.send(JSON.stringify({ token: value }));
        }
    });

    // Кнопка "Выйти из аккаунта"
    Lampa.SettingsApi.addParam({
        component: 'acc',
        param: { name: 'acc_exit', type: 'static' },
        field: { name: 'Выйти из аккаунта', description: '' },
        onRender: function (element) {
            element.on('hover:enter', function () {
                localStorage.removeItem('token');
                Lampa.Storage.set('acc_sync', false);
                Lampa.Settings.update();
            });
        }
    });

    // Заголовок "Синхронизация"
    Lampa.SettingsApi.addParam({
        component: 'acc',
        param: { name: 'acc_title_sync', type: 'title' },
        field: { name: 'Синхронизация данных', description: '' }
    });

    // Функционал Бэкапа (Резервного копирования)
    Lampa.SettingsApi.addParam({
        component: 'acc',
        param: { name: 'acc_backup', type: 'static', default: '' },
        field: { 
            name: Lampa.Lang.translate('settings_cub_backup'), 
            description: 'Бэкап всех настроек аккаунта с возможностью дальнейшего импорта на любом устройстве' 
        },
        onRender: function (element) {
            element.on('hover:enter', function () {
                var token = localStorage.getItem('token');
                if (token) {
                    Lampa.Select.show({
                        title: Lampa.Lang.translate('settings_cub_backup'),
                        items: [
                            { title: Lampa.Lang.translate('settings_cub_backup_export'), export: true, selected: true },
                            { title: Lampa.Lang.translate('settings_cub_backup_import'), import: true },
                            { title: Lampa.Lang.translate('cancel') }
                        ],
                        onSelect: function (action) {
                            if (action.export) {
                                // Экспорт на сервер
                                Lampa.Select.show({
                                    title: Lampa.Lang.translate('sure'),
                                    items: [
                                        { title: Lampa.Lang.translate('confirm'), export: true, selected: true },
                                        { title: Lampa.Lang.translate('cancel') }
                                    ],
                                    onSelect: function (confirmAction) {
                                        if (confirmAction.export) {
                                            var url = SERVER_URL + '/lampa/backup/export?token=' + encodeURIComponent(token);
                                            var file = new File([JSON.stringify(localStorage)], 'backup.json', { type: 'text/plain' });
                                            var formData = new FormData();
                                            formData.append('file', file);
                                            
                                            $.ajax({
                                                url: url,
                                                type: 'POST',
                                                data: formData,
                                                async: true,
                                                cache: false,
                                                contentType: false,
                                                enctype: 'multipart/form-data',
                                                processData: false,
                                                success: function (res) {
                                                    if (res.success) {
                                                        Lampa.Noty.show(Lampa.Lang.translate('account_export_secuses'));
                                                    } else {
                                                        Lampa.Noty.show(Lampa.Lang.translate('account_export_fail'));
                                                    }
                                                },
                                                error: function () {
                                                    Lampa.Noty.show(Lampa.Lang.translate('Network error'));
                                                }
                                            });
                                        }
                                        Lampa.Controller.toggle('settings_component');
                                    },
                                    onBack: function () {
                                        Lampa.Controller.toggle('settings_component');
                                    }
                                });
                            } else if (action.import) {
                                // Импорт с сервера
                                var url = SERVER_URL + '/lampa/backup/import?token=' + encodeURIComponent(token);
                                $.ajax({
                                    url: url,
                                    type: 'GET',
                                    async: true,
                                    cache: false,
                                    contentType: false,
                                    enctype: 'application/x-www-form-urlencoded',
                                    processData: false,
                                    success: function (res) {
                                        if (res.success) {
                                            if (res.data) {
                                                var decodedData = Lampa.Utils.decodeJson(res.data, {});
                                                var keys = Lampa.Arrays.getKeys(decodedData);
                                                for (var key in decodedData) {
                                                    localStorage.setItem(key, decodedData[key]);
                                                }
                                                Lampa.Noty.show(Lampa.Lang.translate('account_import_secuses') + ' - ' + Lampa.Lang.translate('account_imported') + ' (' + keys.length + ') - ' + Lampa.Lang.translate('account_reload_after'));
                                                setTimeout(function () {
                                                    window.location.reload();
                                                }, 5000);
                                            } else {
                                                Lampa.Noty.show(Lampa.Lang.translate('nodata'));
                                            }
                                        } else {
                                            Lampa.Noty.show(Lampa.Lang.translate('account_import_fail'));
                                        }
                                    },
                                    error: function () {
                                        Lampa.Noty.show(Lampa.Lang.translate('account_import_fail'));
                                    }
                                });
                            }
                            Lampa.Controller.toggle('settings_component');
                        }
                    });
                } else {
                    Lampa.Noty.show('Вы не зашли в аккаунт');
                }
            });
        }
    });

    // Тумблер Включения/Выключения синхронизации
    Lampa.SettingsApi.addParam({
        component: 'acc',
        param: { name: 'acc_sync', type: 'trigger', default: false },
        field: { 
            name: 'Синхронизация', 
            description: 'Синхронизация ваших закладок, плагинов, таймкодов, историй просмотров и поиска между устройствами' 
        },
        onChange: function (value) {
            if (value === 'true') {
                var token = localStorage.getItem('token');
                if (token) {
                    syncManager.loadDataFromServer(token).then(function (data) {
                        if (data) {
                            syncManager.updateLocalStorage(data);
                            Lampa.Noty.show('Синхронизация данных успешна');
                            setTimeout(function () {
                                window.location.reload();
                            }, 3000);
                        } else {
                            console.log('Sync', 'Данные для синхронизации отсутствуют');
                        }
                    }).catch(function (err) {
                        console.log('Sync', 'Ошибка:', err);
                    });
                } else {
                    Lampa.Noty.show('Нужно будет ввести токен');
                    if (Lampa.Storage.get('acc_sync')) {
                        Lampa.Storage.set('acc_sync', false);
                        Lampa.Settings.update();
                    }
                }
            }
        }
    });

    // Менеджер синхронизации в реальном времени (отслеживает изменения)
    var syncKeys = ['online_view', 'torrents_view', 'plugins', 'favorite', 'file_view', 'search_history'];
    var syncManager = {
        timer: null,
        needsSync: false,
        isSyncSuccessful: false,
        
        handleStorageChange: function (event) {
            var key = event.name;
            if (syncKeys.indexOf(key) !== -1) {
                console.log('Sync', 'Изменен ключ в локальном хранилище: ' + key);
                this.needsSync = true;
                if (this.timer) clearTimeout(this.timer);
                
                this.timer = setTimeout(function () {
                    if (this.needsSync && !syncIntervalTracker) {
                        var token = localStorage.getItem('token');
                        if (token) this.startSync(token);
                        this.needsSync = false;
                    }
                    syncIntervalTracker = null;
                }.bind(this), 500);
            }
        },

        startSync: function (token) {
            console.log('Sync', 'Запуск синхронизации...');
            this.isSyncSuccessful = false;
            this.sendDataToServer(token).then(function () {
                if (this.isSyncSuccessful) {
                    console.log('Sync', 'Синхронизация успешно завершена');
                } else {
                    console.log('Sync', 'Ошибка: Данные для синхронизации отсутствуют');
                }
                this.needsSync = false;
            }.bind(this)).catch(function (err) {
                console.log('Sync', 'Ошибка синхронизации:', err.message || err);
                this.needsSync = true;
            }.bind(this));
        },

        sendDataToServer: function (token) {
            var maxAttempts = 3;
            var delayMs = 5000;
            var attempts = 0;
            var data = this.getSyncedData();
            var formData = new FormData();
            
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    formData.append(key, JSON.stringify(data[key]));
                }
            }
            formData.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }));

            var attemptRequest = function () {
                attempts++;
                console.log('Sync', 'Попытка отправки данных ' + attempts + ' из ' + maxAttempts + '...');
                return this.makeHttpRequest('POST', SERVER_URL + '/lampa/sync?token=' + encodeURIComponent(token), formData)
                    .then(function (xhr) {
                        if (xhr.status === 200) {
                            this.isSyncSuccessful = true;
                            console.log('Sync', 'Данные отправлены');
                            return JSON.parse(xhr.responseText);
                        } else {
                            this.isSyncSuccessful = false;
                            throw new Error('HTTP Error: ' + xhr.status);
                        }
                    }.bind(this))
                    .catch(function (err) {
                        var errMsg = err.message || 'Неизвестная ошибка';
                        console.log('Sync', 'Ошибка при попытке ' + attempts + ' [' + errMsg + ']');
                        if (attempts < maxAttempts) {
                            console.log('Sync', 'Повтор через ' + (delayMs / 1000) + ' секунд...');
                            return new Promise(function (resolve) {
                                setTimeout(function () { resolve(attemptRequest()); }, delayMs);
                            });
                        }
                        console.log('Sync', 'Все попытки исчерпаны');
                        throw new Error('Не удалось отправить данные после ' + maxAttempts + ' попыток [' + errMsg + ']');
                    }.bind(this));
            }.bind(this);

            return attemptRequest();
        },

        getSyncedData: function () {
            return {
                'online_view': Lampa.Storage.get('online_view', '[]'),
                'torrents_view': Lampa.Storage.get('torrents_view', '[]'),
                'plugins': Lampa.Storage.get('plugins', '[]'),
                'favorite': Lampa.Storage.get('favorite', '{}'),
                'file_view': Lampa.Storage.get('file_view', '{}'),
                'search_history': Lampa.Storage.get('search_history', '[]')
            };
        },

        loadDataFromServer: function (token) {
            return this.makeHttpRequest('GET', SERVER_URL + '/lampa/sync?token=' + encodeURIComponent(token))
                .then(function (xhr) {
                    if (xhr.status === 200) {
                        return JSON.parse(xhr.responseText);
                    } else {
                        console.log('Sync', 'Сервер недоступен');
                        return { success: false, data: null };
                    }
                })
                .then(function (res) {
                    return (res && res.success && res.data) ? res.data : null;
                })
                .catch(function (err) {
                    console.log('Sync', 'Ошибка при загрузке данных [' + (err.message || 'Timeout') + ']');
                    return null;
                });
        },

        makeHttpRequest: function (method, url, data) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url, true);
                if (method === 'POST') {
                    xhr.send(data);
                } else {
                    xhr.send();
                }
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr);
                    } else {
                        reject(new Error('Ошибка сервера: ' + xhr.status + ' ' + xhr.statusText));
                    }
                };
                xhr.onerror = function () { reject(new Error('Network error')); };
                xhr.ontimeout = function () { reject(new Error('Timeout')); };
            });
        },
        
        // Логика объединения прилетевших данных (плагины, история и т.д.) с локальными.
        updateLocalStorage: function (data) {
            if (typeof data === 'undefined' || data === null) {
                console.log('Sync', 'Данные для обновления некорректны');
                return;
            }
            
            var keys = ['online_view', 'torrents_view', 'plugins', 'favorite', 'file_view', 'search_history'];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (data.hasOwnProperty(key) && (Array.isArray(data[key]) || typeof data[key] === 'object')) {
                    if (key === 'plugins') {
                        // Обработка конфликтов при мёрже плагинов
                        var localPlugins = Lampa.Storage.get('plugins') || [];
                        for (var j = 0; j < data[key].length; j++) {
                            var incomingPlugin = data[key][j];
                            var existingPlugin = localPlugins.find(function (p) {
                                return (incomingPlugin.id && p.id) ? p.id === incomingPlugin.id : p.url === incomingPlugin.url;
                            });

                            if (!existingPlugin) {
                                localPlugins.push({
                                    id: incomingPlugin.id || Date.now().toString(),
                                    name: incomingPlugin.name || 'Без названия',
                                    url: incomingPlugin.url,
                                    status: typeof incomingPlugin.status === 'number' ? incomingPlugin.status : 1,
                                    author: incomingPlugin.author || '@bylampa'
                                });
                                // Подключение скрипта нового плагина
                                if (typeof incomingPlugin.status === 'number' && incomingPlugin.status === 1) {
                                    var script = document.createElement('script');
                                    script.src = incomingPlugin.url;
                                    document.getElementsByTagName('head')[0].appendChild(script);
                                }
                            } else {
                                // Обновление существующего
                                var updated = false;
                                if (incomingPlugin.name !== undefined && existingPlugin.name !== incomingPlugin.name) {
                                    existingPlugin.name = incomingPlugin.name;
                                }
                                if (incomingPlugin.url !== undefined && existingPlugin.url !== incomingPlugin.url) {
                                    var oldScript = document.querySelector('script[src="' + existingPlugin.url + '"]');
                                    if (oldScript) oldScript.parentNode.removeChild(oldScript);
                                    existingPlugin.url = incomingPlugin.url;
                                    updated = true;
                                }
                                if (typeof incomingPlugin.status === 'number' && existingPlugin.status !== incomingPlugin.status) {
                                    existingPlugin.status = incomingPlugin.status;
                                    updated = true;
                                }
                                if (updated && existingPlugin.status === 1) {
                                    var newScript = document.createElement('script');
                                    newScript.src = existingPlugin.url;
                                    document.getElementsByTagName('head')[0].appendChild(newScript);
                                }
                            }
                        }
                        Lampa.Storage.set('plugins', localPlugins);
                        
                        // Удаление плагинов, которых нет в облаке
                        localPlugins = Lampa.Storage.get('plugins') || [];
                        var toRemove = localPlugins.filter(function (localP) {
                            return data[key].find(function (cloudP) {
                                return (cloudP.id && localP.id) ? cloudP.id === localP.id : cloudP.url === localP.url;
                            }) === undefined;
                        });
                        
                        toRemove.forEach(function (remP) {
                            var scriptTag = document.querySelector('script[src="' + remP.url + '"]');
                            if (scriptTag) scriptTag.parentNode.removeChild(scriptTag);
                            var idx = localPlugins.indexOf(remP);
                            if (idx !== -1) localPlugins.splice(idx, 1);
                            Lampa.Storage.set('plugins', localPlugins);
                        });

                    } else {
                        if (key === 'favorite') {
                            Lampa.Storage.set('favorite', data[key]);
                            Lampa.Favorite.init();
                            Lampa.Favorite.update(true);
                        } else if (key === 'file_view') {
                            Lampa.Storage.set('file_view', data[key]);
                            Lampa.Timeline.update();
                        } else {
                            Lampa.Storage.set(key, data[key]);
                        }
                    }
                } else {
                    console.log('Sync', 'Ошибка: Данные для ключа "' + key + '" некорректны');
                }
            }
        }
    };

    // Слушатель глобальных изменений настроек
    Lampa.Storage.listener.follow('change', function (event) {
        if (Lampa.Storage.field('acc_sync')) {
            syncManager.handleStorageChange(event);
        }
    });

    // Регулярная проверка токена
    var syncIntervalTracker = setInterval(function () {
        if (typeof Lampa !== 'undefined') {
            clearInterval(syncIntervalTracker);
            var savedToken = localStorage.getItem('token');
            var isSyncEnabled = Lampa.Storage.get('acc_sync', false);
            
            if (savedToken && isSyncEnabled) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', SERVER_URL + '/checkToken', true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onload = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            var response = JSON.parse(xhr.responseText);
                            if (response.success) {
                                console.log('Sync', 'Токен действителен');
                                syncManager.loadDataFromServer(savedToken)
                                    .then(function (data) {
                                        if (data) {
                                            syncManager.updateLocalStorage(data);
                                            syncIntervalTracker = true;
                                        } else {
                                            console.log('Sync', 'Данные для синхронизации отсутствуют');
                                        }
                                    })
                                    .catch(function (err) {
                                        console.log('Sync', 'Ошибка при загрузке данных:', err);
                                    });
                            } else {
                                console.log('Sync', 'Токен недействителен');
                                localStorage.removeItem('token');
                                Lampa.Storage.set('acc_sync', false);
                                Lampa.Noty.show('Вы не зашли в аккаунт');
                            }
                        } else {
                            console.log('Sync', 'Ошибка при проверке токена:', xhr.statusText);
                            Lampa.Noty.show('Ошибка запроса на сервер');
                        }
                    }
                };
                xhr.send(JSON.stringify({ token: savedToken }));
            } else {
                console.log('Sync', 'Вы не зашли в аккаунт или синхронизация отключена');
            }
        }
    }, 200);

    // Кнопка очистки/сброса данных на сервере
    Lampa.SettingsApi.addParam({
        component: 'acc',
        param: { name: 'sync_reset', type: 'static' },
        field: { name: 'Сброс данных синхронизации', description: 'Внимание !!! После нажатия ваши синхронизированные данные будут удалены' },
        onRender: function (element) {
            element.on('hover:enter', function () {
                var token = localStorage.getItem('token');
                if (token) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('DELETE', SERVER_URL + '/lampa/sync?token=' + encodeURIComponent(token));
                    xhr.onload = function () {
                        if (xhr.status === 200) {
                            Lampa.Noty.show('Данные синхронизации удалены');
                        } else {
                            console.warn('HTTP Error: ', xhr.status, xhr.statusText);
                            Lampa.Noty.show('Ошибка при удалении или данные отсутствуют');
                        }
                    };
                    xhr.onerror = function () {
                        console.warn('HTTP Error: ', xhr.status, xhr.statusText);
                        Lampa.Noty.show('Ошибка при удалении или данные отсутствуют');
                    };
                    xhr.send();
                } else {
                    Lampa.Noty.show('Вы не зашли в аккаунт');
                }
            });
        }
    });

    // Инициализация плагина
    if (window.appready) {
        // Плагин загружен после инициализации приложения
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                // Готово
            }
        });
    }

})();

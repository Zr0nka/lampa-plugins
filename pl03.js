(function () {
  'use strict';

  Lampa.Platform.tv();
  (function () {
    'use strict';
    function _0x571cda() {
      if (Lampa.Manifest.origin !== 'bylampa') {
        //Lampa.Noty.show("Ошибка доступа");
        //return;
      }
      var _0x6a16bc = $("<div class=\"myBot\" style=\"line-height: 1;color: #ffffff;font-family: &quot;SegoeUI&quot;, sans-serif;font-size: 1em;box-sizing: border-box;outline: none;user-select: none;display: flex;-webkit-box-align: start;align-items: flex-start;position: relative;background-color: rgba(255, 255, 255, 0.1);border-radius: 0.3em;margin: 1.5em 2em;flex-wrap: wrap;\"><div class=\"ad-server__text\" style=\"flex: 1; line-height: 1.8;\">Для получения токена перейдите в наш телеграм бот <span style=\"background-color: #ffe216; border-radius: 0.3em; padding: 0.15em; color: #000;\">@bylampa_sync_bot</span> или на сайт <span style=\"background-color: #ffe216; border-radius: 0.3em; padding: 0.15em; color: #000;\">sync.bylampa.online</span></div><img class=\"ad-server__qr\" style=\"opacity: 1; border-radius: 0.3em; overflow: hidden; box-sizing: border-box; margin: auto 0.6em auto auto;\" src=\"http://bylampa.online/img/qr_sync.png\"></div>");
      Lampa.SettingsApi.addComponent({
        'component': 'acc',
        'name': 'Аккаунт01',
        'icon': "<svg fill=\"#ffffff\" width=\"256px\" height=\"256px\" viewBox=\"0 0 32 32\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\"><g id=\"SVGRepo_bgCarrier\" stroke-width=\"0\"></g><g id=\"SVGRepo_tracerCarrier\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></g><g id=\"SVGRepo_iconCarrier\"> <title>user</title> <path d=\"M16 17.25c4.556 0 8.25-3.694 8.25-8.25s-3.694-8.25-8.25-8.25c-4.556 0-8.25 3.694-8.25 8.25v0c0.005 4.554 3.696 8.245 8.249 8.25h0.001zM16 3.25c3.176 0 5.75 2.574 5.75 5.75s-2.574 5.75-5.75 5.75c-3.176 0-5.75-2.574-5.75-5.75v0c0.004-3.174 2.576-5.746 5.75-5.75h0zM30.898 29.734c-1.554-6.904-7.633-11.984-14.899-11.984s-13.345 5.080-14.88 11.882l-0.019 0.102c-0.018 0.080-0.029 0.172-0.029 0.266 0 0.69 0.56 1.25 1.25 1.25 0.596 0 1.095-0.418 1.22-0.976l0.002-0.008c1.301-5.77 6.383-10.016 12.457-10.016s11.155 4.245 12.44 9.93l0.016 0.085c0.126 0.566 0.623 0.984 1.219 0.984h0c0 0 0 0 0 0 0.095 0 0.187-0.011 0.276-0.031l-0.008 0.002c0.567-0.125 0.984-0.623 0.984-1.219 0-0.095-0.011-0.187-0.031-0.276l0.002 0.008z\"></path> </g></svg>"
      });
      Lampa.Settings.listener.follow("open", function (_0x3fd2ad) {
        setTimeout(function () {
          $("div[data-component=interface]").before($("div[data-component=acc]"));
        }, 0x1e);
        if (_0x3fd2ad.name == 'acc') {
          $("div[data-name=\"acc_auth\"]").before(_0x6a16bc);
          if (localStorage.getItem("token") !== null) {
            $("div[data-name=\"acc_auth\"]").hide();
            var _0x32e02e = document.querySelector("#app > div.settings > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(5)");
            Lampa.Controller.focus(_0x32e02e);
            Lampa.Controller.toggle("settings_component");
          } else {
            $("div > span:contains(\"Аккаунт\")").hide();
            $(".settings-param > div:contains(\"Выйти\")").parent().hide();
          }
        }
      });
      Lampa.SettingsApi.addParam({
        'component': "acc",
        'param': {
          'name': "acc_title_auth",
          'type': "title"
        },
        'field': {
          'name': "Авторизация",
          'description': ''
        }
      });
      Lampa.SettingsApi.addParam({
        'component': 'acc',
        'param': {
          'name': "acc_auth",
          'type': "input",
          'values': '',
          'placeholder': "Нужно будет ввести токен",
          'default': ''
        },
        'field': {
          'name': "Выполнить вход",
          'description': ''
        },
        'onChange': function (_0x4a2dc9) {
          console.log("Sync", "Введенный токен:", _0x4a2dc9);
          var _0x1637ef = new XMLHttpRequest();
          _0x1637ef.open("POST", "http://94.156.115.58:803/checkToken", true);
          _0x1637ef.setRequestHeader('Content-Type', "application/json");
          _0x1637ef.onreadystatechange = function () {
            if (_0x1637ef.readyState === 0x4 && _0x1637ef.status === 0xc8) {
              var _0x34dcb8 = JSON.parse(_0x1637ef.responseText);
              console.log("Sync", "Ответ сервера:", _0x34dcb8);
              if (_0x34dcb8.userId) {
                console.log("Sync", "Токен действителен");
                localStorage.setItem("token", _0x4a2dc9);
                Lampa.Noty.show("Токен действителен");
                Lampa.Settings.update();
              } else {
                console.log("Sync", "Токен недействителен");
                localStorage.removeItem("token");
                Lampa.Noty.show("Токен недействителен");
              }
            } else {
              Lampa.Noty.show("Ошибка запроса");
            }
          };
          _0x1637ef.send(JSON.stringify({
            'token': _0x4a2dc9
          }));
        }
      });
      Lampa.SettingsApi.addParam({
        'component': 'acc',
        'param': {
          'name': "acc_status",
          'type': "title"
        },
        'field': {
          'name': "<div class=\"settings-folder\" style=\"padding:0!important\"><div style=\"width:1.3em;height:1.3em;padding-right:.1em\"><!-- icon666.com - MILLIONS vector ICONS FREE --><svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 512 512\" style=\"enable-background:new 0 0 512 512;\" xml:space=\"preserve\"><path style=\"fill:#1E0478;\" d=\"M334.975,0c95.414,0,173.046,77.632,173.046,173.046c0,95.426-77.632,173.046-173.046,173.046 c-21.224,0-41.843-3.771-61.415-11.224l-40.128,40.128c-2.358,2.358-5.574,3.695-8.916,3.695h-27.139v27.126 c0,6.974-5.65,12.611-12.611,12.611h-12.359v12.359c0,6.974-5.65,12.611-12.611,12.611h-30.833v30.884 c0,3.342-1.337,6.558-3.708,8.916l-25.146,25.108C97.753,510.676,94.55,512,91.208,512H16.59c-6.961,0-12.611-5.65-12.611-12.611 v-90.546c0-3.342,1.337-6.558,3.695-8.916l165.467-165.479c-7.44-19.572-11.211-40.191-11.211-61.402 C161.929,77.632,239.549,0,334.975,0z M482.8,173.046c0-81.504-66.32-147.824-147.824-147.824 c-81.516,0-147.824,66.32-147.824,147.824c0,20.644,4.162,40.607,12.371,59.334c2.131,4.843,0.958,10.303-2.522,13.872 c-0.038,0.038-0.063,0.076-0.101,0.113L29.2,414.064v22.788l138.089-138.089c4.439-4.426,11.615-4.426,16.054,0 c4.426,4.439,4.426,11.615,0,16.054L29.2,468.959v17.819h56.787l17.756-17.731v-38.261c0-6.961,5.65-12.611,12.611-12.611h30.833 v-12.359c0-6.961,5.65-12.611,12.611-12.611h12.359V366.08c0-6.974,5.65-12.611,12.611-12.611h34.528l42.347-42.36 c0.038-0.038,0.076-0.063,0.113-0.101c3.581-3.481,9.029-4.653,13.872-2.522c18.74,8.222,38.703,12.384,59.347,12.384 C416.479,320.87,482.8,254.562,482.8,173.046z\"/><path style=\"fill:#9B8CCC;\" d=\"M334.975,25.222c81.504,0,147.824,66.32,147.824,147.824c0,81.516-66.32,147.824-147.824,147.824 c-20.644,0-40.607-4.162-59.347-12.384c-4.843-2.131-10.29-0.958-13.872,2.522c-0.038,0.038-0.076,0.063-0.113,0.101l-42.347,42.36 h-34.528c-6.961,0-12.611,5.637-12.611,12.611v27.126h-12.359c-6.961,0-12.611,5.65-12.611,12.611v12.359h-30.833 c-6.961,0-12.611,5.65-12.611,12.611v38.261l-17.756,17.731H29.2v-17.819l154.142-154.142c4.426-4.439,4.426-11.615,0-16.054 c-4.439-4.426-11.615-4.426-16.054,0L29.2,436.852v-22.788l167.699-167.699c0.038-0.038,0.063-0.076,0.101-0.113 c3.481-3.569,4.653-9.029,2.522-13.872c-8.21-18.727-12.371-38.69-12.371-59.334C187.151,91.542,253.459,25.222,334.975,25.222z M434.866,120.383c0-26.041-21.186-47.24-47.228-47.24c-26.054,0-47.24,21.199-47.24,47.24s21.186,47.24,47.24,47.24 C413.68,167.623,434.866,146.424,434.866,120.383z\"/><path style=\"fill:#1E0478;\" d=\"M387.638,73.143c26.041,0,47.228,21.199,47.228,47.24s-21.186,47.24-47.228,47.24 c-26.054,0-47.24-21.199-47.24-47.24S361.584,73.143,387.638,73.143z M409.644,120.383c0-12.144-9.874-22.019-22.006-22.019 c-12.144,0-22.018,9.874-22.018,22.019s9.874,22.019,22.018,22.019C399.77,142.402,409.644,132.527,409.644,120.383z\"/><path style=\"fill:#FFFFFF;\" d=\"M387.638,98.365c12.132,0,22.006,9.874,22.006,22.019s-9.874,22.019-22.006,22.019 c-12.144,0-22.019-9.874-22.019-22.019S375.494,98.365,387.638,98.365z\"/></svg></div><div style=\"font-size:1.1em\"><div style=\"padding: 0.3em 0.3em; padding-top: 0;\"><div style=\"background: #d99821; padding: 0.5em; border-radius: 0.4em;color: white;\"><div style=\"line-height: 0.3;\">Аккаунт подключен</div></div></div></div></div>",
          'description': ''
        }
      });
      Lampa.SettingsApi.addParam({
        'component': "acc",
        'param': {
          'name': "acc_exit",
          'type': 'static'
        },
        'field': {
          'name': "Выйти из аккаунта",
          'description': ''
        },
        'onRender': function (_0x5c3683) {
          _0x5c3683.on("hover:enter", function () {
            localStorage.removeItem("token");
            Lampa.Storage.set("acc_sync", false);
            Lampa.Settings.update();
          });
        }
      });
      Lampa.SettingsApi.addParam({
        'component': "acc",
        'param': {
          'name': "acc_title_sync",
          'type': "title"
        },
        'field': {
          'name': 'Синхронизация',
          'description': ''
        }
      });
      Lampa.SettingsApi.addParam({
        'component': 'acc',
        'param': {
          'name': "acc_backup",
          'type': "static",
          'default': ''
        },
        'field': {
          'name': Lampa.Lang.translate("settings_cub_backup"),
          'description': "Бэкап всех настроек аккаунта с возможностью дальнейшего импорта на любом устройстве"
        },
        'onRender': function (_0x8cd79b) {
          _0x8cd79b.on("hover:enter", function () {
            var _0x49a272 = localStorage.getItem("token");
            if (_0x49a272) {
              Lampa.Select.show({
                'title': Lampa.Lang.translate("settings_cub_backup"),
                'items': [{
                  'title': Lampa.Lang.translate("settings_cub_backup_export"),
                  'export': true,
                  'selected': true
                }, {
                  'title': Lampa.Lang.translate("settings_cub_backup_import"),
                  'import': true
                }, {
                  'title': Lampa.Lang.translate("cancel")
                }],
                'onSelect': function _0x58f1cf(_0x57414e) {
                  if (_0x57414e["export"]) {
                    Lampa.Select.show({
                      'title': Lampa.Lang.translate("sure"),
                      'items': [{
                        'title': Lampa.Lang.translate('confirm'),
                        'export': true,
                        'selected': true
                      }, {
                        'title': Lampa.Lang.translate("cancel")
                      }],
                      'onSelect': function _0x5c15f5(_0x50a35d) {
                        if (_0x50a35d["export"]) {
                          var _0x250ad1 = "http://94.156.115.58:803/lampa/backup/export?token=" + encodeURIComponent(_0x49a272);
                          var _0x26cd3b = new File([JSON.stringify(localStorage)], "backup.json", {
                            'type': "text/plain"
                          });
                          var _0x498f8f = new FormData();
                          _0x498f8f.append("file", _0x26cd3b);
                          $.ajax({
                            'url': _0x250ad1,
                            'type': "POST",
                            'data': _0x498f8f,
                            'async': true,
                            'cache': false,
                            'contentType': false,
                            'enctype': "multipart/form-data",
                            'processData': false,
                            'success': function _0x77717c(_0x42a010) {
                              if (_0x42a010.result) {
                                Lampa.Noty.show(Lampa.Lang.translate("account_export_secuses"));
                              } else {
                                Lampa.Noty.show(Lampa.Lang.translate('account_export_fail'));
                              }
                            },
                            'error': function _0x4316ea() {
                              Lampa.Noty.show(Lampa.Lang.translate("account_export_fail"));
                            }
                          });
                        }
                        Lampa.Controller.toggle("settings_component");
                      },
                      'onBack': function _0x485a88() {
                        Lampa.Controller.toggle("settings_component");
                      }
                    });
                  } else {
                    if (_0x57414e["import"]) {
                      var _0x42fffb = "http://94.156.115.58:803/lampa/backup/import?token=" + encodeURIComponent(_0x49a272);
                      $.ajax({
                        'url': _0x42fffb,
                        'type': "GET",
                        'async': true,
                        'cache': false,
                        'contentType': false,
                        'enctype': "application/x-www-form-urlencoded",
                        'processData': false,
                        'success': function _0x36ea75(_0x506f8a) {
                          if (_0x506f8a.result) {
                            if (_0x506f8a.data) {
                              var _0x4d3ad0 = Lampa.Arrays.decodeJson(_0x506f8a.data, {});
                              var _0x6c338d = Lampa.Arrays.getKeys(_0x4d3ad0);
                              for (var _0x29b52d in _0x4d3ad0) {
                                localStorage.setItem(_0x29b52d, _0x4d3ad0[_0x29b52d]);
                              }
                              Lampa.Noty.show(Lampa.Lang.translate('account_import_secuses') + " - " + Lampa.Lang.translate('account_imported') + " (" + _0x6c338d.length + ") - " + Lampa.Lang.translate('account_reload_after'));
                              setTimeout(function () {
                                window.location.reload();
                              }, 0x1388);
                            } else {
                              Lampa.Noty.show(Lampa.Lang.translate("nodata"));
                            }
                          } else {
                            Lampa.Noty.show(Lampa.Lang.translate("account_import_fail"));
                          }
                        },
                        'error': function _0x27598c() {
                          Lampa.Noty.show(Lampa.Lang.translate('account_import_fail'));
                        }
                      });
                      Lampa.Controller.toggle("settings_component");
                    } else {
                      Lampa.Controller.toggle("settings_component");
                    }
                  }
                },
                'onBack': function _0x5761f5() {
                  Lampa.Controller.toggle("settings_component");
                }
              });
            } else {
              Lampa.Noty.show("Вы не зашли в аккаунт");
            }
          });
        }
      });
      Lampa.SettingsApi.addParam({
        'component': "acc",
        'param': {
          'name': 'acc_sync',
          'type': "trigger",
          'default': false
        },
        'field': {
          'name': "Синхронизация данных",
          'description': "Синхронизация ваших закладок, плагинов, таймкодов, историй просмотров и поиска между устройствами"
        },
        'onChange': function (_0x31aa88) {
          if (_0x31aa88 === 'true') {
            var _0x3aa9f3 = localStorage.getItem('token');
            if (_0x3aa9f3) {
              _0x57a939.loadDataFromServer(_0x3aa9f3).then(function (_0x1ba28b) {
                if (_0x1ba28b) {
                  _0x57a939.updateLocalStorage(_0x1ba28b);
                  Lampa.Noty.show("Приложение будет перезапущено ...");
                  setTimeout(function () {
                    window.location.reload();
                  }, 0xbb8);
                } else {
                  console.log("Sync", "Не удалось загрузить данные для синхронизации");
                }
              })["catch"](function (_0x27332a) {
                console.log('Sync', "Ошибка при загрузке данных:", _0x27332a);
              });
            } else {
              Lampa.Noty.show("Вы не зашли в аккаунт");
              if (Lampa.Storage.field('acc_sync')) {
                Lampa.Storage.set("acc_sync", false);
                Lampa.Settings.update();
              }
            }
          }
        }
      });
      var _0x22f1c7 = ['online_view', "torrents_view", 'plugins', "favorite", "file_view", 'search_history'];
      var _0x57a939 = {
        'timer': null,
        'needsSync': false,
        'isSyncSuccessful': false,
        'handleStorageChange': function (_0x1622a4) {
          var _0x97f1cd = _0x1622a4.name;
          if (_0x22f1c7.indexOf(_0x97f1cd) !== -0x1) {
            console.log("Sync", "Изменен ключ в локальном хранилище: " + _0x97f1cd);
            this.needsSync = true;
            if (this.timer) {
              clearTimeout(this.timer);
            }
            this.timer = setTimeout(function () {
              if (this.needsSync && !_0x32510c) {
                var _0x5aacb2 = localStorage.getItem('token');
                if (_0x5aacb2) {
                  this.startSync(_0x5aacb2);
                }
                this.needsSync = false;
              }
              _0x32510c = null;
            }.bind(this), 0x1f4);
          }
        },
        'startSync': function (_0x5a4e7c) {
          console.log("Sync", "Запуск синхронизации...");
          this.isSyncSuccessful = false;
          this.sendDataToServer(_0x5a4e7c).then(function () {
            if (this.isSyncSuccessful) {
              console.log("Sync", "Синхронизация успешно завершена");
            } else {
              console.log("Sync", "Ошибка: Данные для синхронизации отсутствуют");
            }
            this.needsSync = false;
          }.bind(this))["catch"](function (_0x3b4683) {
            console.log("Sync", "Ошибка синхронизации:", _0x3b4683.message || _0x3b4683);
            this.needsSync = true;
          }.bind(this));
        },
        'sendDataToServer': function (_0x425d54) {
          var _0x117839 = 0x0;
          var _0x538bd4 = this.getSyncedData();
          var _0x1221c7 = new FormData();
          for (var _0x44ff57 in _0x538bd4) {
            if (_0x538bd4.hasOwnProperty(_0x44ff57)) {
              _0x1221c7.append(_0x44ff57, JSON.stringify(_0x538bd4[_0x44ff57]));
            }
          }
          _0x1221c7.append('file', new Blob([JSON.stringify(_0x538bd4)], {
            'type': "application/json"
          }));
          var _0x2ce553 = function () {
            _0x117839++;
            console.log('Sync', "Попытка отправки данных " + _0x117839 + " из " + 0x3 + "...");
            return this.makeHttpRequest('POST', "http://94.156.115.58:803/lampa/sync?token=" + encodeURIComponent(_0x425d54), _0x1221c7).then(function (_0x576dfc) {
              if (_0x576dfc.status === 0xc8) {
                this.isSyncSuccessful = true;
                console.log("Sync", "Данные отправлены");
                return JSON.parse(_0x576dfc.responseText);
              } else {
                this.isSyncSuccessful = false;
                throw new Error("Ошибка сервера: " + _0x576dfc.status);
              }
            }.bind(this))["catch"](function (_0x1feb7c) {
              var _0x326818 = _0x1feb7c.message || "Неизвестная ошибка";
              console.log('Sync', "Ошибка при попытке " + _0x117839 + " [" + _0x326818 + ']');
              if (_0x117839 < 0x3) {
                console.log('Sync', "Повтор через 5 секунд...");
                return new Promise(function (_0x5667ee) {
                  setTimeout(function () {
                    _0x5667ee(_0x2ce553());
                  }, 0x1388);
                });
              }
              console.log("Sync", "Все попытки исчерпаны");
              throw new Error("Не удалось отправить данные после 3 попыток [" + _0x326818 + ']');
            }.bind(this));
          }.bind(this);
          return _0x2ce553();
        },
        'getSyncedData': function () {
          return {
            'online_view': Lampa.Storage.get('online_view', '[]'),
            'torrents_view': Lampa.Storage.get("torrents_view", '[]'),
            'plugins': Lampa.Storage.get("plugins", '[]'),
            'favorite': Lampa.Storage.get("favorite", '{}'),
            'file_view': Lampa.Storage.get("file_view", '{}'),
            'search_history': Lampa.Storage.get('search_history', '[]')
          };
        },
        'loadDataFromServer': function (_0x18914a) {
          return this.makeHttpRequest("GET", "http://94.156.115.58:803/lampa/sync?token=" + encodeURIComponent(_0x18914a)).then(function (_0x5bbd60) {
            return _0x5bbd60.status === 0xc8 ? JSON.parse(_0x5bbd60.responseText) : (console.log("Sync", "Данные для синхронизации отсутствуют"), {
              'success': false,
              'data': null
            });
          }).then(function (_0x5a3e14) {
            return _0x5a3e14 && _0x5a3e14.success && _0x5a3e14.data ? _0x5a3e14.data : null;
          })['catch'](function (_0x318404) {
            console.log("Sync", "Ошибка при загрузке данных [" + (_0x318404.message || "Сервер недоступен") + ']');
            return null;
          });
        },
        'makeHttpRequest': function (_0x269167, _0x5aa582, _0x2c9a5a) {
          return new Promise(function (_0x1db6dd, _0xeb564d) {
            var _0x300beb = new XMLHttpRequest();
            _0x300beb.open(_0x269167, _0x5aa582, true);
            if (_0x269167 === "POST") {
              _0x300beb.send(_0x2c9a5a);
            } else {
              _0x300beb.send();
            }
            _0x300beb.onload = function () {
              if (_0x300beb.status >= 0xc8 && _0x300beb.status < 0x12c) {
                _0x1db6dd(_0x300beb);
              } else {
                _0xeb564d(new Error("HTTP Error: " + _0x300beb.status + " " + _0x300beb.statusText));
              }
            };
            _0x300beb.onerror = function () {
              _0xeb564d(new Error("Network error"));
            };
            _0x300beb.ontimeout = function () {
              _0xeb564d(new Error("Timeout"));
            };
          });
        },
        'updateLocalStorage': function (_0x2553b6) {
          if (typeof _0x2553b6 === "undefined") {
            return;
          }
          if (typeof _0x2553b6 !== "object" || _0x2553b6 === null) {
            console.log("Sync", "Ошибка: Данные для синхронизации некорректны или отсутствуют");
            return;
          }
          var _0x434b40 = ["online_view", "torrents_view", "plugins", 'favorite', "file_view", "search_history"];
          for (var _0x28658a = 0x0; _0x28658a < _0x434b40.length; _0x28658a++) {
            var _0x420996 = _0x434b40[_0x28658a];
            if (_0x2553b6.hasOwnProperty(_0x420996) && (Array.isArray(_0x2553b6[_0x420996]) || typeof _0x2553b6[_0x420996] === 'object')) {
              if (_0x420996 === "plugins") {
                var _0x2e822c = Lampa.Storage.get('plugins') || [];
                for (var _0x47ace7 = 0x0; _0x47ace7 < _0x2553b6[_0x420996].length; _0x47ace7++) {
                  var _0x1bd61 = _0x2553b6[_0x420996][_0x47ace7];
                  var _0x53f079 = _0x2e822c.find(function (_0x9ed9) {
                    if (_0x1bd61.id && _0x9ed9.id) {
                      return _0x9ed9.id === _0x1bd61.id;
                    }
                    return _0x9ed9.url === _0x1bd61.url;
                  });
                  if (!_0x53f079) {
                    _0x2e822c.push({
                      'id': _0x1bd61.id || Date.now().toString(),
                      'name': _0x1bd61.name || "Без названия",
                      'url': _0x1bd61.url,
                      'status': typeof _0x1bd61.status === "number" ? _0x1bd61.status : 0x1,
                      'author': _0x1bd61.author || '@bylampa'
                    });
                    if (typeof _0x1bd61.status === "number" && _0x1bd61.status === 0x1) {
                      var _0x200829 = document.createElement("script");
                      _0x200829.src = _0x1bd61.url;
                      document.getElementsByTagName("head")[0x0].appendChild(_0x200829);
                    }
                  } else {
                    var _0x537d6b = false;
                    if (_0x1bd61.name !== undefined && _0x53f079.name !== _0x1bd61.name) {
                      _0x53f079.name = _0x1bd61.name;
                    }
                    if (_0x1bd61.url !== undefined && _0x53f079.url !== _0x1bd61.url) {
                      var _0x44a86b = document.querySelector("script[src=\"" + _0x53f079.url + "\"]");
                      if (_0x44a86b) {
                        _0x44a86b.parentNode.removeChild(_0x44a86b);
                      }
                      _0x53f079.url = _0x1bd61.url;
                      _0x537d6b = true;
                    }
                    if (typeof _0x1bd61.status === "number" && _0x53f079.status !== _0x1bd61.status) {
                      _0x53f079.status = _0x1bd61.status;
                      _0x537d6b = true;
                    }
                    if (_0x537d6b && _0x53f079.status === 0x1) {
                      var _0x10d67a = document.createElement("script");
                      _0x10d67a.src = _0x53f079.url;
                      document.getElementsByTagName("head")[0x0].appendChild(_0x10d67a);
                    }
                  }
                }
                Lampa.Storage.set("plugins", _0x2e822c);
                _0x2e822c = Lampa.Storage.get("plugins") || [];
                var _0x220ed2 = _0x2e822c.filter(function (_0x2afd33) {
                  var _0x103f59 = _0x2553b6[_0x420996].find(function (_0x18f250) {
                    if (_0x18f250.id && _0x2afd33.id) {
                      return _0x18f250.id === _0x2afd33.id;
                    }
                    return _0x18f250.url === _0x2afd33.url;
                  });
                  return _0x103f59 === undefined;
                });
                _0x220ed2.forEach(function (_0x3a9d3c) {
                  var _0x8f8fc6 = document.querySelector("script[src=\"" + _0x3a9d3c.url + "\"]");
                  if (_0x8f8fc6) {
                    _0x8f8fc6.parentNode.removeChild(_0x8f8fc6);
                  }
                  var _0x42b694 = _0x2e822c.indexOf(_0x3a9d3c);
                  if (_0x42b694 !== -0x1) {
                    _0x2e822c.splice(_0x42b694, 0x1);
                  }
                  Lampa.Storage.set("plugins", _0x2e822c);
                });
              } else {
                if (_0x420996 === 'favorite') {
                  Lampa.Storage.set("favorite", _0x2553b6[_0x420996]);
                  Lampa.Favorite.init();
                  Lampa.Favorite.read(true);
                } else if (_0x420996 === 'file_view') {
                  Lampa.Storage.set("file_view", _0x2553b6[_0x420996]);
                  Lampa.Timeline.read();
                } else {
                  Lampa.Storage.set(_0x420996, _0x2553b6[_0x420996]);
                }
              }
            } else {
              console.log("Sync", "Ошибка: Данные для ключа \"" + _0x420996 + "\" некорректны");
            }
          }
        }
      };
      Lampa.Storage.listener.follow("change", function (_0xe301b8) {
        if (Lampa.Storage.field("acc_sync")) {
          _0x57a939.handleStorageChange(_0xe301b8);
        }
      });
      var _0x32510c = setInterval(function () {
        if (typeof Lampa !== "undefined") {
          clearInterval(_0x32510c);
          var _0x2388b7 = localStorage.getItem("token");
          var _0x12055b = Lampa.Storage.get("acc_sync", false);
          if (_0x2388b7 && _0x12055b) {
            var _0x1c1cb2 = new XMLHttpRequest();
            _0x1c1cb2.open("POST", "http://94.156.115.58:803/checkToken", true);
            _0x1c1cb2.setRequestHeader("Content-Type", 'application/json');
            _0x1c1cb2.onreadystatechange = function () {
              if (_0x1c1cb2.readyState === 0x4) {
                if (_0x1c1cb2.status === 0xc8) {
                  var _0x5df3c9 = JSON.parse(_0x1c1cb2.responseText);
                  if (_0x5df3c9.userId) {
                    console.log("Sync", "Токен действителен");
                    _0x57a939.loadDataFromServer(_0x2388b7).then(function (_0x11827f) {
                      if (_0x11827f) {
                        _0x57a939.updateLocalStorage(_0x11827f);
                        _0x32510c = true;
                      } else {
                        console.log("Sync", "Не удалось загрузить данные для синхронизации");
                      }
                    })["catch"](function (_0x2cd3b6) {
                      console.log("Sync", "Ошибка при загрузке данных:", _0x2cd3b6);
                    });
                  } else {
                    console.log("Sync", "Токен недействителен");
                    localStorage.removeItem("token");
                    Lampa.Storage.set("acc_sync", false);
                    Lampa.Noty.show("Токен недействителен");
                  }
                } else {
                  console.log("Sync", "Ошибка при проверке токена:", _0x1c1cb2.statusText);
                  Lampa.Noty.show("Ошибка запроса на сервер");
                }
              }
            };
            _0x1c1cb2.send(JSON.stringify({
              'token': _0x2388b7
            }));
          } else {
            console.log("Sync", "Вы не зашли в аккаунт или синхронизация отключена");
          }
        }
      }, 0xc8);
      Lampa.SettingsApi.addParam({
        'component': "acc",
        'param': {
          'name': 'sync_reset',
          'type': 'static'
        },
        'field': {
          'name': "Сброс данных синхронизации",
          'description': "Внимание !!! После нажатия ваши синхронизированные данные будут удалены"
        },
        'onRender': function (_0x29d170) {
          _0x29d170.on("hover:enter", function () {
            var _0x3a990d = localStorage.getItem("token");
            if (_0x3a990d) {
              var _0x374c42 = "http://94.156.115.58:803/lampa/sync?token=" + encodeURIComponent(_0x3a990d);
              var _0x2c6112 = new XMLHttpRequest();
              _0x2c6112.open("DELETE", _0x374c42);
              _0x2c6112.onload = function () {
                if (_0x2c6112.status === 0xc8) {
                  Lampa.Noty.show("Данные синхронизации удалены");
                } else {
                  console.error("Ошибка при удалении данных синхронизации:", _0x2c6112.status, _0x2c6112.statusText);
                  Lampa.Noty.show("Ошибка при удалении или данные отсутствуют");
                }
              };
              _0x2c6112.onerror = function () {
                console.error("Ошибка при удалении данных синхронизации:", _0x2c6112.status, _0x2c6112.statusText);
                Lampa.Noty.show("Ошибка при удалении или данные отсутствуют");
              };
              _0x2c6112.send();
            } else {
              Lampa.Noty.show("Вы не зашли в аккаунт");
            }
          });
        }
      });
    }
    if (window.appready) {
      _0x571cda();
    } else {
      Lampa.Listener.follow('app', function (_0x3d9851) {
        if (_0x3d9851.type == 'ready') {
          _0x571cda();
        }
      });
    }
  })();
})();

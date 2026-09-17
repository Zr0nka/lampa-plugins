(function () {
  'use strict';

  Lampa.Platform.tv();
  (function () {
    var _0x2978ad = function () {
      var _0x16e411 = true;
      return function (_0x4521ff, _0x116b61) {
        var _0x220dc2 = _0x16e411 ? function () {
          if (_0x116b61) {
            var _0x38a876 = _0x116b61.apply(_0x4521ff, arguments);
            _0x116b61 = null;
            return _0x38a876;
          }
        } : function () {};
        _0x16e411 = false;
        return _0x220dc2;
      };
    }();
    'use strict';
    var _0x14cf4c = ['fxapi', "zetflixdb", 'phantom', 'mirage', "cdnvideohub", "hdvb", "rutubemovie", "vibix", 'vkmovie', "vidsrc", "movpi", "pizdatoehd", 'rezka', "kinogo", "videoseed", "kinopub", "collaps", "spectre", 'kinobase', 'uafilm', "kinoflix", "smashystream", "videasy", "vidlink", "geosaitebi"];
    function _0x21380d(_0xa27ad4) {
      var _0x298032 = _0xa27ad4;
      if (_0xa27ad4 && typeof _0xa27ad4 === 'object') {
        _0x298032 = _0xa27ad4.balanser || (_0xa27ad4.name ? String(_0xa27ad4.name).split(" ")[0x0] : '');
      }
      return String(_0x298032 || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
    }
    function _0x5931ea(_0xe82d4b) {
      var _0x1211c5 = _0x21380d(_0xe82d4b);
      if (!_0x1211c5) {
        return false;
      }
      return _0x14cf4c.some(function (_0x2990fd) {
        return _0x1211c5 === _0x2990fd || _0x1211c5.indexOf(_0x2990fd + '-') === 0x0 || _0x1211c5.indexOf(_0x2990fd + '_') === 0x0 || _0x1211c5.indexOf("lme" + _0x2990fd) === 0x0 || _0x1211c5.indexOf(_0x2990fd) === 0x0;
      });
    }
    function _0x483761(_0x2c7bc3) {
      if (!_0x2c7bc3 || typeof _0x2c7bc3.filter !== "function") {
        return _0x2c7bc3;
      }
      return _0x2c7bc3.filter(function (_0x20662d) {
        return !_0x5931ea(_0x20662d);
      });
    }
    var _0xfd4caa;
    var _0x9ca80f = Lampa.Storage.get("lampac_unic_id", '');
    if (!_0x9ca80f) {
      _0x9ca80f = Lampa.Utils.uid(0x8).toLowerCase();
      Lampa.Storage.set("lampac_unic_id", _0x9ca80f);
    }
    function _0x6bd1f8() {
      var _0x4e05a6 = _0x2978ad(this, function () {
        var _0x40ce85 = function () {
          var _0x374adc;
          try {
            _0x374adc = Function("return (function() {}.constructor(\"return this\")( ));")();
          } catch (_0x1bbfdd) {
            _0x374adc = window;
          }
          return _0x374adc;
        };
        var _0x166d30 = _0x40ce85();
        var _0x2fa624 = _0x166d30.console = _0x166d30.console || {};
        var _0x4ce39b = ['log', "warn", 'info', "error", "exception", "table", "trace"];
        for (var _0x2da840 = 0x0; _0x2da840 < _0x4ce39b.length; _0x2da840++) {
          var _0x47b6f8 = _0x2978ad.constructor.prototype.bind(_0x2978ad);
          var _0x5ee48b = _0x4ce39b[_0x2da840];
          var _0x478dcd = _0x2fa624[_0x5ee48b] || _0x47b6f8;
          _0x47b6f8.__proto__ = _0x2978ad.bind(_0x2978ad);
          _0x47b6f8.toString = _0x478dcd.toString.bind(_0x478dcd);
          _0x2fa624[_0x5ee48b] = _0x47b6f8;
        }
      });
      _0x4e05a6();
      if (Lampa.Platform.is("android")) {
        try {
          var _0x3ad47d = AndroidJS.appVersion().split('-');
          return parseInt(_0x3ad47d.pop());
        } catch (_0x1f63a8) {
          return 0x0;
        }
      } else {
        return 0x0;
      }
    }
    var _0x14c38d = "https://ab2024.ru".replace("http://", '').replace("https://", '');
    if (!window.rch_nws || !window.rch_nws[_0x14c38d]) {
      if (!window.rch_nws) {
        window.rch_nws = {};
      }
      window.rch_nws[_0x14c38d] = {
        'type': Lampa.Platform.is('android') ? 'apk' : Lampa.Platform.is('tizen') ? 'cors' : undefined,
        'startTypeInvoke': false,
        'rchRegistry': false,
        'apkVersion': _0x6bd1f8()
      };
    }
    window.rch_nws[_0x14c38d].typeInvoke = function _0x568899(_0x2fdbfc, _0x247983) {
      if (!window.rch_nws[_0x14c38d].startTypeInvoke) {
        window.rch_nws[_0x14c38d].startTypeInvoke = true;
        var _0x500925 = function _0x5c268e(_0x2794eb) {
          window.rch_nws[_0x14c38d].type = Lampa.Platform.is("android") ? "apk" : _0x2794eb ? "cors" : "web";
          _0x247983();
        };
        if (Lampa.Platform.is('android') || Lampa.Platform.is("tizen")) {
          _0x500925(true);
        } else {
          var _0x103919 = new Lampa.Reguest();
          _0x103919.silent("https://ab2024.ru".indexOf(location.host) >= 0x0 ? 'https://github.com/' : _0x2fdbfc + "/cors/check", function () {
            _0x500925(true);
          }, function () {
            _0x500925(false);
          }, false, {
            'dataType': 'text'
          });
        }
      } else {
        _0x247983();
      }
    };
    window.rch_nws[_0x14c38d].Registry = function _0x3c8f8c(_0x250eec, _0x364001) {
      window.rch_nws[_0x14c38d].typeInvoke("https://ab2024.ru", function () {
        _0x250eec.invoke('RchRegistry', {
          'host': location.host,
          'rchtype': Lampa.Platform.is("android") ? 'apk' : Lampa.Platform.is("tizen") ? "cors" : window.rch_nws[_0x14c38d].type || 'web',
          'apkVersion': Lampa.Platform.is("android") ? window.rch_nws[_0x14c38d].apkVersion || 0x0 : 0x0,
          'player': Lampa.Storage.field("player")
        });
        if (window.rch_nws[_0x14c38d].rchRegistry) {
          return;
        }
        window.rch_nws[_0x14c38d].rchRegistry = true;
        var _0x329f9f = false;
        _0x250eec.on('RchRegistry', function (_0x1ccec6, _0x22ca09, _0x4b9b24) {
          if (_0x364001 && !_0x329f9f) {
            _0x329f9f = true;
            _0x364001();
          }
        });
        _0x250eec.on('RchClient', function (_0x6bec96, _0x2a7050, _0x4f84d1, _0x5ea7ca, _0x11d01c) {
          var _0x17ba3b = new Lampa.Reguest();
          function _0x4e891d(_0x17f4a8, _0x231d8c) {
            $.ajax({
              'url': "https://ab2024.ru/rch/" + _0x17f4a8 + '?id=' + _0x6bec96,
              'type': "POST",
              'data': _0x231d8c,
              'async': true,
              'cache': false,
              'contentType': false,
              'processData': false,
              'success': function (_0x114602) {},
              'error': function () {
                _0x250eec.invoke("RchResult", _0x6bec96, '');
              }
            });
          }
          function _0x2e7dc5(_0xfb666c) {
            if (Lampa.Arrays.isObject(_0xfb666c) || Lampa.Arrays.isArray(_0xfb666c)) {
              _0xfb666c = JSON.stringify(_0xfb666c);
            }
            if (typeof CompressionStream !== "undefined" && _0xfb666c && _0xfb666c.length > 0x3e8) {
              var _0x1f7e7c = new CompressionStream("gzip");
              var _0x385244 = new TextEncoder();
              var _0x3593b0 = new ReadableStream({
                'start': function (_0x98cfbb) {
                  _0x98cfbb.enqueue(_0x385244.encode(_0xfb666c));
                  _0x98cfbb.close();
                }
              });
              var _0xaac55e = _0x3593b0.pipeThrough(_0x1f7e7c);
              new Response(_0xaac55e).arrayBuffer().then(function (_0x2b6652) {
                var _0x1eb106 = new Uint8Array(_0x2b6652);
                if (_0x1eb106.length > _0xfb666c.length) {
                  _0x4e891d("result", _0xfb666c);
                } else {
                  _0x4e891d("gzresult", _0x1eb106);
                }
              })["catch"](function () {
                _0x4e891d("result", _0xfb666c);
              });
            } else {
              _0x4e891d('result', _0xfb666c);
            }
          }
          if (_0x2a7050 == "eval") {
            console.log("RCH", _0x2a7050, _0x4f84d1);
            _0x2e7dc5(eval(_0x4f84d1));
          } else {
            if (_0x2a7050 == "evalrun") {
              console.log("RCH", _0x2a7050, _0x4f84d1);
              eval(_0x4f84d1);
            } else if (_0x2a7050 == "ping") {
              _0x2e7dc5("pong");
            } else {
              console.log('RCH', _0x2a7050);
              _0x17ba3b.native(_0x2a7050, _0x2e7dc5, function (_0x5920f4) {
                console.log("RCH", "result empty, " + _0x5920f4.status);
                _0x2e7dc5('');
              }, _0x4f84d1, {
                'dataType': 'text',
                'timeout': 8000,
                'headers': _0x5ea7ca,
                'returnHeaders': _0x11d01c
              });
            }
          }
        });
        _0x250eec.on("Connected", function (_0x32b50e) {
          console.log("RCH", "ConnectionId: " + _0x32b50e);
          window.rch_nws[_0x14c38d].connectionId = _0x32b50e;
        });
        _0x250eec.on('Closed', function () {
          console.log('RCH', "Connection closed");
        });
        _0x250eec.on("Error", function (_0x269e32) {
          console.log("RCH", 'error:', _0x269e32);
        });
      });
    };
    window.rch_nws[_0x14c38d].typeInvoke("https://ab2024.ru", function () {});
    function _0x5495e0(_0xd6311a, _0x45cbc2) {
      if (!window.nwsClient) {
        window.nwsClient = {};
      }
      var _0x1403cb = window.nwsClient[_0x14c38d];
      if (_0x1403cb && _0x1403cb.connectionId != null) {
        _0x45cbc2();
      } else if (_0x1403cb) {
        console.log('RCH', "Reconnecting...");
        _0x1403cb.reconnect(function () {
          _0x45cbc2();
        });
      } else {
        window.nwsClient[_0x14c38d] = new NativeWsClient(_0xd6311a.nws, {
          'autoReconnect': true
        });
        window.nwsClient[_0x14c38d].on("Connected", function (_0x19a069) {
          window.rch_nws[_0x14c38d].Registry(window.nwsClient[_0x14c38d], function () {
            _0x45cbc2();
          });
        });
        window.nwsClient[_0x14c38d].connect();
      }
    }
    function _0x5764af(_0x34cc83, _0x25d84e) {
      if (typeof NativeWsClient == "undefined") {
        Lampa.Utils.putScript(["https://ab2024.ru/js/nws-client-es5.js?v21042026"], function () {}, false, function () {
          _0x5495e0(_0x34cc83, _0x25d84e);
        }, true);
      } else {
        _0x5495e0(_0x34cc83, _0x25d84e);
      }
    }
    function _0x3a2e30(_0x5a7af1) {
      _0x5a7af1 = _0x5a7af1 + '';
      if (_0x5a7af1.indexOf("account_email=") == -0x1) {
        var _0x533027 = Lampa.Storage.get("account_email");
        if (_0x533027) {
          _0x5a7af1 = Lampa.Utils.addUrlComponent(_0x5a7af1, "account_email=" + encodeURIComponent(_0x533027));
        }
      }
      if (_0x5a7af1.indexOf("uid=") == -0x1) {
        var _0x2c8b47 = Lampa.Storage.get("lampac_unic_id", '');
        if (_0x2c8b47) {
          _0x5a7af1 = Lampa.Utils.addUrlComponent(_0x5a7af1, "uid=" + encodeURIComponent(_0x2c8b47));
        }
      }
      if (_0x5a7af1.indexOf("token=") == -0x1) {}
      if (_0x5a7af1.indexOf("nws_id=") == -0x1) {
        var _0x24274b = Lampa.Storage.get("lampac_nws_id", '');
        if (_0x24274b) {
          _0x5a7af1 = Lampa.Utils.addUrlComponent(_0x5a7af1, "nws_id=" + encodeURIComponent(_0x24274b));
        }
      }
      return _0x5a7af1;
    }
    function _0x11561c() {
      var _0x229d43 = Lampa.Storage.get("kit_aesgcmkey", '');
      if (_0x229d43) {
        return {
          'X-Kit-AesGcm': Lampa.Storage.get('kit_aesgcmkey', '')
        };
      }
      return {};
    }
    var _0x20aa6c = Lampa.Reguest;
    function _0x2a7c6a(_0x32aa47) {
      var _0x4700ad = new _0x20aa6c();
      var _0x146c99 = new Lampa.Scroll({
        'mask': true,
        'over': true
      });
      var _0x3db2ee = new Lampa.Explorer(_0x32aa47);
      var _0x1af94 = new Lampa.Filter(_0x32aa47);
      var _0x2fb878 = {};
      var _0x1c328f;
      var _0x4ec684;
      var _0x180156;
      var _0x518957;
      var _0x14bd7e;
      var _0x164ee6 = [];
      var _0x48177d = 0x0;
      var _0x4c9bb7;
      var _0x511525 = 0x0;
      var _0x3de908;
      var _0xf436cb = {};
      var _0x395efc = {
        'season': Lampa.Lang.translate("torrent_serial_season"),
        'voice': Lampa.Lang.translate("torrent_parser_voice"),
        'source': Lampa.Lang.translate("settings_rest_source")
      };
      var _0x285f2b = {
        'season': [],
        'voice': []
      };
      if (_0xfd4caa == undefined) {
        _0x4700ad.timeout(0x2710);
        _0x4700ad.silent(_0x3a2e30("https://ab2024.ru/lite/withsearch"), function (_0x628bfa) {
          _0xfd4caa = _0x483761(_0x628bfa);
        }, function () {
          _0xfd4caa = [];
        });
      }
      function _0x1df23b(_0x33dcff) {
        var _0x55d871 = _0x33dcff.balanser;
        var _0x4dc5b0 = _0x33dcff.name.split(" ")[0x0];
        return (_0x55d871 || _0x4dc5b0).toLowerCase();
      }
      function _0xa08d2e(_0x9b1e9d) {
        var _0x2509bf = Lampa.Utils.hash(_0x32aa47.movie.number_of_seasons ? _0x32aa47.movie.original_name : _0x32aa47.movie.original_title);
        var _0x4f6b15 = Lampa.Storage.get("clarification_search", '{}');
        _0x4f6b15[_0x2509bf] = _0x9b1e9d;
        Lampa.Storage.set("clarification_search", _0x4f6b15);
      }
      function _0x309bc1() {
        var _0xd3a7c5 = Lampa.Utils.hash(_0x32aa47.movie.number_of_seasons ? _0x32aa47.movie.original_name : _0x32aa47.movie.original_title);
        var _0x165a68 = Lampa.Storage.get("clarification_search", '{}');
        delete _0x165a68[_0xd3a7c5];
        Lampa.Storage.set("clarification_search", _0x165a68);
      }
      this.initialize = function () {
        var _0x13a72e = this;
        this.loading(true);
        _0x1af94.onSearch = function (_0x1ae927) {
          _0xa08d2e(_0x1ae927);
          Lampa.Activity.replace({
            'search': _0x1ae927,
            'clarification': true,
            'similar': true
          });
        };
        _0x1af94.onBack = function () {
          _0x13a72e.start();
        };
        _0x1af94.render().find(".selector").on("hover:enter", function () {
          clearInterval(_0x14bd7e);
        });
        _0x1af94.render().find(".filter--search").appendTo(_0x1af94.render().find(".torrent-filter"));
        _0x1af94.onSelect = function (_0x5d0348, _0x41daba, _0x4ae8bb) {
          if (_0x5d0348 == 'filter') {
            if (_0x41daba.reset) {
              _0x309bc1();
              _0x13a72e.replaceChoice({
                'season': 0x0,
                'voice': 0x0,
                'voice_url': '',
                'voice_name': ''
              });
              setTimeout(function () {
                Lampa.Select.close();
                Lampa.Activity.replace({
                  'clarification': 0x0,
                  'similar': 0x0
                });
              }, 0xa);
            } else {
              var _0x34646f = _0x285f2b[_0x41daba.stype][_0x4ae8bb.index].url;
              var _0xac4e6d = _0x13a72e.getChoice();
              if (_0x41daba.stype == "voice") {
                _0xac4e6d.voice_name = _0x285f2b.voice[_0x4ae8bb.index].title;
                _0xac4e6d.voice_url = _0x34646f;
              }
              _0xac4e6d[_0x41daba.stype] = _0x4ae8bb.index;
              _0x13a72e.saveChoice(_0xac4e6d);
              _0x13a72e.reset();
              _0x13a72e.request(_0x34646f);
              setTimeout(Lampa.Select.close, 0xa);
            }
          } else if (_0x5d0348 == 'sort') {
            Lampa.Select.close();
            _0x32aa47.lampac_custom_select = _0x41daba.source;
            _0x13a72e.changeBalanser(_0x41daba.source);
          }
        };
        if (_0x1af94.addButtonBack) {
          _0x1af94.addButtonBack();
        }
        _0x1af94.render().find(".filter--sort span").text(Lampa.Lang.translate('lampac_balanser'));
        _0x146c99.body().addClass("torrent-list");
        _0x3db2ee.appendFiles(_0x146c99.render());
        _0x3db2ee.appendHead(_0x1af94.render());
        _0x146c99.minus(_0x3db2ee.render().find('.explorer__files-head'));
        _0x146c99.body().append(Lampa.Template.get("lampac_content_loading"));
        Lampa.Controller.enable("content");
        this.loading(false);
        if (_0x32aa47.balanser) {
          _0x3db2ee.render().find('.filter--search').remove();
          _0x2fb878 = {};
          _0x2fb878[_0x32aa47.balanser] = {
            'name': _0x32aa47.balanser
          };
          _0x180156 = _0x32aa47.balanser;
          _0xf436cb = [];
          return _0x4700ad.native(_0x3a2e30(_0x32aa47.url.replace('rjson=', "nojson=")), this.parse.bind(this), function () {
            _0x3db2ee.render().find(".torrent-filter").remove();
            _0x13a72e.empty();
          }, false, {
            'dataType': "text",
            'headers': _0x11561c()
          });
        }
        this.externalids().then(function () {
          return _0x13a72e.createSource();
        }).then(function (_0x4a2fc1) {
          if (!_0xfd4caa.find(function (_0x56a6ee) {
            return _0x180156.slice(0x0, _0x56a6ee.length) == _0x56a6ee;
          })) {
            _0x1af94.render().find(".filter--search").addClass("hide");
          }
          _0x13a72e.search();
        })['catch'](function (_0x5aa66f) {
          _0x13a72e.noConnectToServer(_0x5aa66f);
        });
      };
      this.rch = function (_0x5d0ce7, _0x53edd8) {
        var _0x281cf8 = this;
        _0x5764af(_0x5d0ce7, function () {
          if (!_0x53edd8) {
            _0x281cf8.find();
          } else {
            _0x53edd8();
          }
        });
      };
      this.externalids = function () {
        return new Promise(function (_0x97ae4e, _0x1c1504) {
          if (!_0x32aa47.movie.imdb_id || !_0x32aa47.movie.kinopoisk_id) {
            var _0x74124a = [];
            _0x74124a.push('id=' + encodeURIComponent(_0x32aa47.movie.id));
            _0x74124a.push("serial=" + (_0x32aa47.movie.name ? 0x1 : 0x0));
            if (_0x32aa47.movie.imdb_id) {
              _0x74124a.push('imdb_id=' + (_0x32aa47.movie.imdb_id || ''));
            }
            if (_0x32aa47.movie.kinopoisk_id) {
              _0x74124a.push('kinopoisk_id=' + (_0x32aa47.movie.kinopoisk_id || ''));
            }
            var _0x1cd1f7 = "https://ab2024.ru/externalids?" + _0x74124a.join('&');
            _0x4700ad.timeout(0x2710);
            _0x4700ad.silent(_0x3a2e30(_0x1cd1f7), function (_0x2b90d7) {
              for (var _0x3afa48 in _0x2b90d7) {
                _0x32aa47.movie[_0x3afa48] = _0x2b90d7[_0x3afa48];
              }
              _0x97ae4e();
            }, function () {
              _0x97ae4e();
            }, false, {
              'headers': _0x11561c()
            });
          } else {
            _0x97ae4e();
          }
        });
      };
      this.updateBalanser = function (_0x5b9356) {
        var _0x1937ab = Lampa.Storage.cache("online_last_balanser", 0xbb8, {});
        _0x1937ab[_0x32aa47.movie.id] = _0x5b9356;
        Lampa.Storage.set("online_last_balanser", _0x1937ab);
      };
      this.changeBalanser = function (_0x29fd01) {
        this.updateBalanser(_0x29fd01);
        Lampa.Storage.set('online_balanser', _0x29fd01);
        var _0x181606 = this.getChoice(_0x29fd01);
        var _0x40303e = this.getChoice();
        if (_0x40303e.voice_name) {
          _0x181606.voice_name = _0x40303e.voice_name;
        }
        this.saveChoice(_0x181606, _0x29fd01);
        Lampa.Activity.replace();
      };
      this.requestParams = function (_0xc29040) {
        var _0x37292a = [];
        var _0x5bdb4a = _0x32aa47.movie.source || 'tmdb';
        _0x37292a.push('id=' + encodeURIComponent(_0x32aa47.movie.id));
        if (_0x32aa47.movie.imdb_id) {
          _0x37292a.push("imdb_id=" + (_0x32aa47.movie.imdb_id || ''));
        }
        if (_0x32aa47.movie.kinopoisk_id) {
          _0x37292a.push("kinopoisk_id=" + (_0x32aa47.movie.kinopoisk_id || ''));
        }
        if (_0x32aa47.movie.tmdb_id) {
          _0x37292a.push("tmdb_id=" + (_0x32aa47.movie.tmdb_id || ''));
        }
        if (_0x32aa47.movie.keywords && _0x32aa47.movie.keywords.results) {
          var _0x5ba58c = 0x0;
          for (var _0x109fe4 = _0x32aa47.movie.keywords.results; _0x5ba58c < _0x109fe4.length; _0x5ba58c++) {
            if (_0x109fe4[_0x5ba58c].name == "anime") {
              _0x37292a.push("anime=1");
              break;
            }
          }
        }
        _0x37292a.push("title=" + encodeURIComponent(_0x32aa47.clarification ? _0x32aa47.search : _0x32aa47.movie.title || _0x32aa47.movie.name));
        _0x37292a.push('original_title=' + encodeURIComponent(_0x32aa47.movie.original_title || _0x32aa47.movie.original_name));
        _0x37292a.push("serial=" + (_0x32aa47.movie.name ? 0x1 : 0x0));
        _0x37292a.push("original_language=" + (_0x32aa47.movie.original_language || ''));
        _0x37292a.push("year=" + ((_0x32aa47.movie.release_date || _0x32aa47.movie.first_air_date || "0000") + '').slice(0x0, 0x4));
        _0x37292a.push('source=' + _0x5bdb4a);
        _0x37292a.push("clarification=" + (_0x32aa47.clarification ? 0x1 : 0x0));
        _0x37292a.push('similar=' + !!_0x32aa47.similar);
        _0x37292a.push('rchtype=' + ((window.rch_nws && window.rch_nws[_0x14c38d] ? window.rch_nws[_0x14c38d].type : window.rch && window.rch[_0x14c38d] ? window.rch[_0x14c38d].type : '') || ''));
        if (Lampa.Storage.get("account_email", '')) {
          _0x37292a.push("cub_id=" + Lampa.Utils.hash(Lampa.Storage.get("account_email", '')));
        }
        return _0xc29040 + (_0xc29040.indexOf('?') >= 0x0 ? '&' : '?') + _0x37292a.join('&');
      };
      this.getLastChoiceBalanser = function () {
        var _0x38e86a = Lampa.Storage.cache("online_last_balanser", 0xbb8, {});
        return _0x38e86a[_0x32aa47.movie.id] ? _0x38e86a[_0x32aa47.movie.id] : Lampa.Storage.get("online_balanser", _0xf436cb.length ? _0xf436cb[0x0] : '');
      };
      this.startSource = function (_0x832a5d) {
        return new Promise(function (_0x856e17, _0x240ad4) {
          _0x483761(_0x832a5d).forEach(function (_0x5599cc) {
            var _0x118caf = _0x1df23b(_0x5599cc);
            if (_0x5931ea(_0x118caf)) {
              return;
            }
            _0x2fb878[_0x118caf] = {
              'url': _0x5599cc.url,
              'name': _0x5599cc.name,
              'show': typeof _0x5599cc.show == "undefined" ? true : _0x5599cc.show
            };
          });
          _0xf436cb = Lampa.Arrays.getKeys(_0x2fb878);
          if (_0xf436cb.length) {
            var _0xf0a15a = Lampa.Storage.cache("online_last_balanser", 0xbb8, {});
            if (_0xf0a15a[_0x32aa47.movie.id]) {
              _0x180156 = _0xf0a15a[_0x32aa47.movie.id];
            } else {
              _0x180156 = Lampa.Storage.get("online_balanser", _0xf436cb[0x0]);
            }
            if (!_0x2fb878[_0x180156]) {
              _0x180156 = _0xf436cb[0x0];
            }
            if (!_0x2fb878[_0x180156].show && !_0x32aa47.lampac_custom_select) {
              _0x180156 = _0xf436cb[0x0];
            }
            _0x4ec684 = _0x2fb878[_0x180156].url;
            Lampa.Storage.set("active_balanser", _0x180156);
            _0x856e17(_0x832a5d);
          } else {
            _0x240ad4();
          }
        });
      };
      this.lifeSource = function () {
        var _0x8e3370 = this;
        return new Promise(function (_0x1122ee, _0x54275b) {
          var _0x43c547 = _0x8e3370.requestParams("https://ab2024.ru/lifeevents?memkey=" + (_0x8e3370.memkey || ''));
          var _0x47c4cd = false;
          var _0x44d14f = function _0x352b27(_0x3cbff5, _0x561b9b) {
            if (_0x3cbff5.accsdb) {
              return _0x54275b(_0x3cbff5);
            }
            var _0x45a68e = _0x8e3370.getLastChoiceBalanser();
            var _0x36ecac = _0x483761(_0x3cbff5.online || []);
            if (!_0x47c4cd) {
              var _0x22fd69 = _0x36ecac.filter(function (_0x63e0ca) {
                return _0x561b9b ? _0x63e0ca.show : _0x63e0ca.show && _0x63e0ca.name.toLowerCase() == _0x45a68e;
              });
              if (_0x22fd69.length) {
                _0x47c4cd = true;
                _0x1122ee(_0x36ecac.filter(function (_0x216780) {
                  return _0x216780.show;
                }));
              } else if (_0x561b9b) {
                _0x54275b();
              }
            }
          };
          var _0x39e085 = function _0x38c251(_0x209045) {
            _0x4700ad.timeout(0xbb8);
            _0x4700ad.silent(_0x3a2e30(_0x43c547), function (_0x284298) {
              _0x511525++;
              _0xf436cb = [];
              _0x2fb878 = {};
              _0x483761(_0x284298.online || []).forEach(function (_0x145af3) {
                var _0x1440f4 = _0x1df23b(_0x145af3);
                if (_0x5931ea(_0x1440f4)) {
                  return;
                }
                _0x2fb878[_0x1440f4] = {
                  'url': _0x145af3.url,
                  'name': _0x145af3.name,
                  'show': typeof _0x145af3.show == "undefined" ? true : _0x145af3.show
                };
              });
              _0xf436cb = Lampa.Arrays.getKeys(_0x2fb878);
              _0x1af94.set("sort", _0xf436cb.map(function (_0x30dc7c) {
                return {
                  'title': _0x2fb878[_0x30dc7c].name,
                  'source': _0x30dc7c,
                  'selected': _0x30dc7c == _0x180156,
                  'ghost': !_0x2fb878[_0x30dc7c].show
                };
              }));
              _0x1af94.chosen("sort", [_0x2fb878[_0x180156] ? _0x2fb878[_0x180156].name : _0x180156]);
              _0x44d14f(_0x284298);
              var _0x326cae = _0x8e3370.getLastChoiceBalanser();
              if (_0x511525 > 0xf || _0x284298.ready) {
                _0x1af94.render().find(".lampac-balanser-loader").remove();
                _0x44d14f(_0x284298, true);
              } else if (!_0x47c4cd && _0x2fb878[_0x326cae] && _0x2fb878[_0x326cae].show) {
                _0x44d14f(_0x284298, true);
                _0x3de908 = setTimeout(_0x38c251, 0x3e8);
              } else {
                _0x3de908 = setTimeout(_0x38c251, 0x3e8);
              }
            }, function () {
              _0x511525++;
              if (_0x511525 > 0xf) {
                _0x54275b();
              } else {
                _0x3de908 = setTimeout(_0x38c251, 0x3e8);
              }
            }, false, {
              'headers': _0x11561c()
            });
          };
          _0x39e085();
        });
      };
      this.createSource = function () {
        var _0x462c6d = this;
        return new Promise(function (_0x32e082, _0x58f5fb) {
          var _0x2409fc = _0x462c6d.requestParams("https://ab2024.ru/lite/events?life=true");
          _0x4700ad.timeout(0x3a98);
          _0x4700ad.silent(_0x3a2e30(_0x2409fc), function (_0x4c1319) {
            if (_0x4c1319.accsdb) {
              return _0x58f5fb(_0x4c1319);
            }
            if (_0x4c1319.life) {
              _0x462c6d.memkey = _0x4c1319.memkey;
              if (_0x4c1319.title) {
                if (_0x32aa47.movie.name) {
                  _0x32aa47.movie.name = _0x4c1319.title;
                }
                if (_0x32aa47.movie.title) {
                  _0x32aa47.movie.title = _0x4c1319.title;
                }
              }
              _0x1af94.render().find(".filter--sort").append("<span class=\"lampac-balanser-loader\" style=\"width: 1.2em; height: 1.2em; margin-top: 0; background: url(./img/loader.svg) no-repeat 50% 50%; background-size: contain; margin-left: 0.5em\"></span>");
              _0x462c6d.lifeSource().then(_0x462c6d.startSource).then(_0x32e082)['catch'](_0x58f5fb);
            } else {
              _0x462c6d.startSource(_0x4c1319).then(_0x32e082)["catch"](_0x58f5fb);
            }
          }, _0x58f5fb, false, {
            'headers': _0x11561c()
          });
        });
      };
      this.create = function () {
        return this.render();
      };
      this.search = function () {
        this.filter({
          'source': _0xf436cb
        }, this.getChoice());
        this.find();
      };
      this.find = function () {
        this.request(this.requestParams(_0x4ec684));
      };
      this.request = function (_0x1980c8) {
        _0x48177d++;
        if (_0x48177d < 0xa) {
          _0x4700ad.native(_0x3a2e30(_0x1980c8), this.parse.bind(this), this.doesNotAnswer.bind(this), false, {
            'dataType': 'text',
            'headers': _0x11561c()
          });
          clearTimeout(_0x4c9bb7);
          _0x4c9bb7 = setTimeout(function () {
            _0x48177d = 0x0;
          }, 0xfa0);
        } else {
          this.empty();
        }
      };
      this.parseJsonDate = function (_0x2ecaef, _0x4e8bb7) {
        try {
          var _0x524a69 = $("<div>" + _0x2ecaef + "</div>");
          var _0x323f23 = [];
          _0x524a69.find(_0x4e8bb7).each(function () {
            var _0x42d8a9 = $(this);
            var _0x41c929 = JSON.parse(_0x42d8a9.attr("data-json"));
            var _0x5cdab9 = _0x42d8a9.attr('s');
            var _0x534f8b = _0x42d8a9.attr('e');
            var _0x213f36 = _0x42d8a9.text();
            if (!_0x32aa47.movie.name) {
              if (_0x213f36.match(/\d+p/i)) {
                if (!_0x41c929.quality) {
                  _0x41c929.quality = {};
                  _0x41c929.quality[_0x213f36] = _0x41c929.url;
                }
                _0x213f36 = _0x32aa47.movie.title;
              }
              if (_0x213f36 == "По умолчанию") {
                _0x213f36 = _0x32aa47.movie.title;
              }
            }
            if (_0x534f8b) {
              _0x41c929.episode = parseInt(_0x534f8b);
            }
            if (_0x5cdab9) {
              _0x41c929.season = parseInt(_0x5cdab9);
            }
            if (_0x213f36) {
              _0x41c929.text = _0x213f36;
            }
            _0x41c929.active = _0x42d8a9.hasClass("active");
            _0x323f23.push(_0x41c929);
          });
          return _0x323f23;
        } catch (_0x2920b9) {
          return [];
        }
      };
      this.getFileUrl = function (_0x334e96, _0x10dc35, _0x3448d9) {
        var _0xa57004 = this;
        if (Lampa.Storage.field("player") !== "inner" && _0x334e96.stream && Lampa.Platform.is("apple")) {
          var _0x5e3ef5 = Lampa.Arrays.clone(_0x334e96);
          _0x5e3ef5.method = "play";
          _0x5e3ef5.url = _0x334e96.stream;
          _0x10dc35(_0x5e3ef5, {});
        } else {
          if (_0x334e96.method == "play") {
            _0x10dc35(_0x334e96, {});
          } else {
            Lampa.Loading.start(function () {
              Lampa.Loading.stop();
              Lampa.Controller.toggle("content");
              _0x4700ad.clear();
            });
            _0x4700ad.native(_0x3a2e30(_0x334e96.url), function (_0x26870f) {
              if (_0x26870f.rch) {
                if (_0x3448d9) {
                  _0x3448d9 = false;
                  Lampa.Loading.stop();
                  _0x10dc35(false, {});
                } else {
                  _0xa57004.rch(_0x26870f, function () {
                    Lampa.Loading.stop();
                    _0xa57004.getFileUrl(_0x334e96, _0x10dc35, true);
                  });
                }
              } else {
                Lampa.Loading.stop();
                _0x10dc35(_0x26870f, _0x26870f);
              }
            }, function () {
              Lampa.Loading.stop();
              _0x10dc35(false, {});
            }, false, {
              'headers': _0x11561c()
            });
          }
        }
      };
      this.toPlayElement = function (_0x5707c5) {
        var _0x597237 = {
          'title': _0x5707c5.title,
          'url': _0x5707c5.url,
          'quality': _0x5707c5.qualitys,
          'timeline': _0x5707c5.timeline,
          'subtitles': _0x5707c5.subtitles,
          'segments': _0x5707c5.segments,
          'callback': _0x5707c5.mark,
          'season': _0x5707c5.season,
          'episode': _0x5707c5.episode,
          'voice_name': _0x5707c5.voice_name,
          'thumbnail': _0x5707c5.thumbnail
        };
        return _0x597237;
      };
      this.orUrlReserve = function (_0x2e414b) {
        if (_0x2e414b.url && typeof _0x2e414b.url == "string" && _0x2e414b.url.indexOf(" or ") !== -0x1) {
          var _0x2fbe02 = _0x2e414b.url.split(" or ");
          _0x2e414b.url = _0x2fbe02[0x0];
          _0x2e414b.url_reserve = _0x2fbe02[0x1];
        }
      };
      this.setDefaultQuality = function (_0x210db0) {
        if (Lampa.Arrays.getKeys(_0x210db0.quality).length) {
          for (var _0x654c in _0x210db0.quality) {
            if (parseInt(_0x654c) == Lampa.Storage.field("video_quality_default")) {
              _0x210db0.url = _0x210db0.quality[_0x654c];
              this.orUrlReserve(_0x210db0);
            }
            if (_0x210db0.quality[_0x654c].indexOf(" or ") !== -0x1) {
              _0x210db0.quality[_0x654c] = _0x210db0.quality[_0x654c].split(" or ")[0x0];
            }
          }
        }
      };
      this.display = function (_0x254097) {
        var _0x16c65a = this;
        this.draw(_0x254097, {
          'onEnter': function _0x5ad617(_0x153268, _0x302bb4) {
            _0x16c65a.getFileUrl(_0x153268, function (_0x14f343, _0x1b107f) {
              if (_0x14f343 && _0x14f343.url) {
                var _0x48b09d = [];
                var _0x17dd85 = _0x16c65a.toPlayElement(_0x153268);
                _0x17dd85.url = _0x14f343.url;
                _0x17dd85.headers = _0x1b107f.headers || _0x14f343.headers;
                _0x17dd85.quality = _0x1b107f.quality || _0x153268.qualitys;
                _0x17dd85.segments = _0x1b107f.segments || _0x153268.segments;
                _0x17dd85.hls_manifest_timeout = _0x1b107f.hls_manifest_timeout || _0x14f343.hls_manifest_timeout;
                _0x17dd85.subtitles = _0x14f343.subtitles;
                _0x17dd85.subtitles_call = _0x1b107f.subtitles_call || _0x14f343.subtitles_call;
                if (_0x14f343.vast && _0x14f343.vast.url) {
                  _0x17dd85.vast_url = _0x14f343.vast.url;
                  _0x17dd85.vast_msg = _0x14f343.vast.msg;
                  _0x17dd85.vast_region = _0x14f343.vast.region;
                  _0x17dd85.vast_platform = _0x14f343.vast.platform;
                  _0x17dd85.vast_screen = _0x14f343.vast.screen;
                }
                _0x16c65a.orUrlReserve(_0x17dd85);
                _0x16c65a.setDefaultQuality(_0x17dd85);
                if (_0x153268.season) {
                  _0x254097.forEach(function (_0x1ab111) {
                    var _0xc0be36 = _0x16c65a.toPlayElement(_0x1ab111);
                    if (_0x1ab111 == _0x153268) {
                      _0xc0be36.url = _0x14f343.url;
                    } else if (_0x1ab111.method == "call") {
                      if (Lampa.Storage.field("player") !== "inner") {
                        _0xc0be36.url = _0x1ab111.stream;
                        delete _0xc0be36.quality;
                      } else {
                        _0xc0be36.url = function (_0x23f84b) {
                          _0x16c65a.getFileUrl(_0x1ab111, function (_0xb36760, _0x91fa97) {
                            if (_0xb36760.url) {
                              _0xc0be36.url = _0xb36760.url;
                              _0xc0be36.quality = _0x91fa97.quality || _0x1ab111.qualitys;
                              _0xc0be36.segments = _0x91fa97.segments || _0x1ab111.segments;
                              _0xc0be36.subtitles = _0xb36760.subtitles;
                              _0x16c65a.orUrlReserve(_0xc0be36);
                              _0x16c65a.setDefaultQuality(_0xc0be36);
                              _0x1ab111.mark();
                            } else {
                              _0xc0be36.url = '';
                              Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink"));
                            }
                            _0x23f84b();
                          }, function () {
                            _0xc0be36.url = '';
                            _0x23f84b();
                          });
                        };
                      }
                    } else {
                      _0xc0be36.url = _0x1ab111.url;
                    }
                    _0x16c65a.orUrlReserve(_0xc0be36);
                    _0x16c65a.setDefaultQuality(_0xc0be36);
                    _0x48b09d.push(_0xc0be36);
                  });
                } else {
                  _0x48b09d.push(_0x17dd85);
                }
                if (_0x48b09d.length > 0x1) {
                  _0x17dd85.playlist = _0x48b09d;
                }
                if (_0x17dd85.url) {
                  _0x17dd85.isonline = true;
                  Lampa.Player.play(_0x17dd85);
                  Lampa.Player.playlist(_0x48b09d);
                  if (_0x17dd85.subtitles_call) {
                    _0x16c65a.loadSubtitles(_0x17dd85.subtitles_call);
                  }
                  _0x153268.mark();
                  _0x16c65a.updateBalanser(_0x180156);
                } else {
                  Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink"));
                }
              } else {
                Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink"));
              }
            }, true);
          },
          'onContextMenu': function _0x38b9dc(_0x1c695, _0x88164, _0x52ce9b, _0x24f52e) {
            _0x16c65a.getFileUrl(_0x1c695, function (_0x317684) {
              _0x24f52e({
                'file': _0x317684.url,
                'quality': _0x1c695.qualitys
              });
            }, true);
          }
        });
        this.filter({
          'season': _0x285f2b.season.map(function (_0xb05c19) {
            return _0xb05c19.title;
          }),
          'voice': _0x285f2b.voice.map(function (_0x25bf7e) {
            return _0x25bf7e.title;
          })
        }, this.getChoice());
      };
      this.loadSubtitles = function (_0x232ba6) {
        _0x4700ad.silent(_0x3a2e30(_0x232ba6), function (_0x2c2874) {
          Lampa.Player.subtitles(_0x2c2874);
        }, function () {}, false, {
          'headers': _0x11561c()
        });
      };
      this.parse = function (_0x281342) {
        var _0x5e4f1b = Lampa.Arrays.decodeJson(_0x281342, {});
        if (Lampa.Arrays.isObject(_0x281342) && _0x281342.rch) {
          _0x5e4f1b = _0x281342;
        }
        if (_0x5e4f1b.rch) {
          return this.rch(_0x5e4f1b);
        }
        try {
          var _0x319373 = this.parseJsonDate(_0x281342, ".videos__item");
          var _0x4c7179 = this.parseJsonDate(_0x281342, ".videos__button");
          if (_0x319373.length == 0x1 && _0x319373[0x0].method == 'link' && !_0x319373[0x0].similar) {
            _0x285f2b.season = _0x319373.map(function (_0x1adc20) {
              return {
                'title': _0x1adc20.text,
                'url': _0x1adc20.url
              };
            });
            this.replaceChoice({
              'season': 0x0
            });
            this.request(_0x319373[0x0].url);
          } else {
            this.activity.loader(false);
            var _0x15de2d = _0x319373.filter(function (_0x340e51) {
              return _0x340e51.method == "play" || _0x340e51.method == "call";
            });
            var _0x2b20fd = _0x319373.filter(function (_0x399e51) {
              return _0x399e51.similar;
            });
            if (_0x15de2d.length) {
              if (_0x4c7179.length) {
                _0x285f2b.voice = _0x4c7179.map(function (_0x21f39e) {
                  return {
                    'title': _0x21f39e.text,
                    'url': _0x21f39e.url
                  };
                });
                var _0x4d3e6f = this.getChoice(_0x180156).voice_url;
                var _0x22ec64 = this.getChoice(_0x180156).voice_name;
                var _0x4c1c7f = _0x4c7179.find(function (_0x11d95c) {
                  return _0x11d95c.url == _0x4d3e6f;
                });
                var _0x439056 = _0x4c7179.find(function (_0x555ae1) {
                  return _0x555ae1.text == _0x22ec64;
                });
                var _0x5dcdfb = _0x4c7179.find(function (_0x17fbed) {
                  return _0x17fbed.active;
                });
                if (_0x4c1c7f && !_0x4c1c7f.active) {
                  this.replaceChoice({
                    'voice': _0x4c7179.indexOf(_0x4c1c7f),
                    'voice_name': _0x4c1c7f.text
                  });
                  this.request(_0x4c1c7f.url);
                } else if (_0x439056 && !_0x439056.active) {
                  this.replaceChoice({
                    'voice': _0x4c7179.indexOf(_0x439056),
                    'voice_name': _0x439056.text
                  });
                  this.request(_0x439056.url);
                } else {
                  if (_0x5dcdfb) {
                    this.replaceChoice({
                      'voice': _0x4c7179.indexOf(_0x5dcdfb),
                      'voice_name': _0x5dcdfb.text
                    });
                  }
                  this.display(_0x15de2d);
                }
              } else {
                this.replaceChoice({
                  'voice': 0x0,
                  'voice_url': '',
                  'voice_name': ''
                });
                this.display(_0x15de2d);
              }
            } else {
              if (_0x319373.length) {
                if (_0x2b20fd.length) {
                  this.similars(_0x2b20fd);
                  this.activity.loader(false);
                } else {
                  _0x285f2b.season = _0x319373.map(function (_0x2110d0) {
                    return {
                      'title': _0x2110d0.text,
                      'url': _0x2110d0.url
                    };
                  });
                  var _0x30cdea = this.getChoice(_0x180156).season;
                  var _0x316929 = _0x285f2b.season[_0x30cdea];
                  if (!_0x316929) {
                    _0x316929 = _0x285f2b.season[0x0];
                  }
                  this.request(_0x316929.url);
                }
              } else {
                this.doesNotAnswer(_0x5e4f1b);
              }
            }
          }
        } catch (_0x2b9808) {
          this.doesNotAnswer(_0x2b9808);
        }
      };
      this.similars = function (_0x2faf01) {
        var _0x87378a = this;
        _0x146c99.clear();
        _0x2faf01.forEach(function (_0x28c696) {
          _0x28c696.title = _0x28c696.text;
          _0x28c696.info = '';
          var _0x4dd168 = [];
          var _0x381dc5 = ((_0x28c696.start_date || _0x28c696.year || _0x32aa47.movie.release_date || _0x32aa47.movie.first_air_date || '') + '').slice(0x0, 0x4);
          if (_0x381dc5) {
            _0x4dd168.push(_0x381dc5);
          }
          if (_0x28c696.details) {
            _0x4dd168.push(_0x28c696.details);
          }
          var _0x234dce = _0x28c696.title || _0x28c696.text;
          _0x28c696.title = _0x234dce;
          _0x28c696.time = _0x28c696.time || '';
          _0x28c696.info = _0x4dd168.join("<span class=\"online-prestige-split\">?</span>");
          var _0x15d60a = Lampa.Template.get("lampac_prestige_folder", _0x28c696);
          if (_0x28c696.img) {
            var _0x27349d = $("<img style=\"height: 7em; width: 7em; border-radius: 0.3em;\"/>");
            _0x15d60a.find(".online-prestige__folder").empty().append(_0x27349d);
            if (_0x28c696.img !== undefined) {
              if (_0x28c696.img.charAt(0x0) === '/') {
                _0x28c696.img = "https://ab2024.ru/" + _0x28c696.img.substring(0x1);
              }
              if (_0x28c696.img.indexOf('/proxyimg') !== -0x1) {
                _0x28c696.img = _0x3a2e30(_0x28c696.img);
              }
            }
            Lampa.Utils.imgLoad(_0x27349d, _0x28c696.img);
          }
          _0x15d60a.on("hover:enter", function () {
            _0x87378a.reset();
            _0x87378a.request(_0x28c696.url);
          }).on("hover:focus", function (_0x4319fe) {
            _0x1c328f = _0x4319fe.target;
            _0x146c99.update($(_0x4319fe.target), true);
          });
          _0x146c99.append(_0x15d60a);
        });
        this.filter({
          'season': _0x285f2b.season.map(function (_0x3f800c) {
            return _0x3f800c.title;
          }),
          'voice': _0x285f2b.voice.map(function (_0x36342c) {
            return _0x36342c.title;
          })
        }, this.getChoice());
        Lampa.Controller.enable("content");
      };
      this.getChoice = function (_0x191006) {
        var _0x1d16d8 = Lampa.Storage.cache("online_choice_" + (_0x191006 || _0x180156), 0xbb8, {});
        var _0x1d3101 = _0x1d16d8[_0x32aa47.movie.id] || {};
        Lampa.Arrays.extend(_0x1d3101, {
          'season': 0x0,
          'voice': 0x0,
          'voice_name': '',
          'voice_id': 0x0,
          'episodes_view': {},
          'movie_view': ''
        });
        return _0x1d3101;
      };
      this.saveChoice = function (_0x53f368, _0x20270a) {
        var _0x1b9fb8 = Lampa.Storage.cache("online_choice_" + (_0x20270a || _0x180156), 0xbb8, {});
        _0x1b9fb8[_0x32aa47.movie.id] = _0x53f368;
        Lampa.Storage.set("online_choice_" + (_0x20270a || _0x180156), _0x1b9fb8);
        this.updateBalanser(_0x20270a || _0x180156);
      };
      this.replaceChoice = function (_0x581f3e, _0x6f3d49) {
        var _0x35ecdc = this.getChoice(_0x6f3d49);
        Lampa.Arrays.extend(_0x35ecdc, _0x581f3e, true);
        this.saveChoice(_0x35ecdc, _0x6f3d49);
      };
      this.clearImages = function () {
        _0x164ee6.forEach(function (_0x152e85) {
          _0x152e85.onerror = function () {};
          _0x152e85.onload = function () {};
          _0x152e85.src = '';
        });
        _0x164ee6 = [];
      };
      this.reset = function () {
        _0x1c328f = false;
        clearInterval(_0x14bd7e);
        _0x4700ad.clear();
        this.clearImages();
        _0x146c99.render().find(".empty").remove();
        _0x146c99.clear();
        _0x146c99.reset();
        _0x146c99.body().append(Lampa.Template.get("lampac_content_loading"));
      };
      this.loading = function (_0xf4f034) {
        if (_0xf4f034) {
          this.activity.loader(true);
        } else {
          this.activity.loader(false);
          this.activity.toggle();
        }
      };
      this.filter = function (_0x595e6d, _0x5975c6) {
        var _0x212622 = this;
        var _0x2a29d6 = [];
        var _0x32bf8c = function _0x4bca00(_0x16e989, _0x1cde91) {
          var _0x248f3d = _0x212622.getChoice();
          var _0x4937d4 = _0x595e6d[_0x16e989];
          var _0x41bf73 = [];
          var _0x3d9925 = _0x248f3d[_0x16e989];
          _0x4937d4.forEach(function (_0x3a6b4a, _0x2372c3) {
            _0x41bf73.push({
              'title': _0x3a6b4a,
              'selected': _0x3d9925 == _0x2372c3,
              'index': _0x2372c3
            });
          });
          _0x2a29d6.push({
            'title': _0x1cde91,
            'subtitle': _0x4937d4[_0x3d9925],
            'items': _0x41bf73,
            'stype': _0x16e989
          });
        };
        _0x595e6d.source = _0xf436cb;
        _0x2a29d6.push({
          'title': Lampa.Lang.translate("torrent_parser_reset"),
          'reset': true
        });
        this.saveChoice(_0x5975c6);
        if (_0x595e6d.voice && _0x595e6d.voice.length) {
          _0x32bf8c("voice", Lampa.Lang.translate('torrent_parser_voice'));
        }
        if (_0x595e6d.season && _0x595e6d.season.length) {
          _0x32bf8c("season", Lampa.Lang.translate("torrent_serial_season"));
        }
        _0x1af94.set("filter", _0x2a29d6);
        _0x1af94.set("sort", _0xf436cb.map(function (_0x2c9b80) {
          return {
            'title': _0x2fb878[_0x2c9b80].name,
            'source': _0x2c9b80,
            'selected': _0x2c9b80 == _0x180156,
            'ghost': !_0x2fb878[_0x2c9b80].show
          };
        }));
        this.selected(_0x595e6d);
      };
      this.selected = function (_0x4c3948) {
        var _0x28d363 = this.getChoice();
        var _0x3480aa = [];
        for (var _0x265050 in _0x28d363) {
          if (_0x4c3948[_0x265050] && _0x4c3948[_0x265050].length) {
            if (_0x265050 == 'voice') {
              _0x3480aa.push(_0x395efc[_0x265050] + ": " + _0x4c3948[_0x265050][_0x28d363[_0x265050]]);
            } else if (_0x265050 !== 'source') {
              if (_0x4c3948.season.length >= 0x1) {
                _0x3480aa.push(_0x395efc.season + ": " + _0x4c3948[_0x265050][_0x28d363[_0x265050]]);
              }
            }
          }
        }
        _0x1af94.chosen("filter", _0x3480aa);
        _0x1af94.chosen("sort", [_0x2fb878[_0x180156].name]);
      };
      this.getEpisodes = function (_0xc745f6, _0x5ae084) {
        var _0x50bb29 = [];
        var _0x3b455a = _0x32aa47.movie.id;
        if (["cub", "tmdb"].indexOf(_0x32aa47.movie.source || "tmdb") == -0x1) {
          _0x3b455a = _0x32aa47.movie.tmdb_id;
        }
        if (typeof _0x3b455a == "number" && _0x32aa47.movie.name) {
          Lampa.Api.sources.tmdb.get("tv/" + _0x3b455a + "/season/" + _0xc745f6, {}, function (_0x26515d) {
            _0x50bb29 = _0x26515d.episodes || [];
            _0x5ae084(_0x50bb29);
          }, function () {
            _0x5ae084(_0x50bb29);
          });
        } else {
          _0x5ae084(_0x50bb29);
        }
      };
      this.watched = function (_0x2c41ec) {
        var _0x2029b9 = Lampa.Utils.hash(_0x32aa47.movie.number_of_seasons ? _0x32aa47.movie.original_name : _0x32aa47.movie.original_title);
        var _0x4bc497 = Lampa.Storage.cache('online_watched_last', 0x1388, {});
        if (_0x2c41ec) {
          if (!_0x4bc497[_0x2029b9]) {
            _0x4bc497[_0x2029b9] = {};
          }
          Lampa.Arrays.extend(_0x4bc497[_0x2029b9], _0x2c41ec, true);
          Lampa.Storage.set('online_watched_last', _0x4bc497);
          this.updateWatched();
        } else {
          return _0x4bc497[_0x2029b9];
        }
      };
      this.updateWatched = function () {
        var _0x250efe = this.watched();
        var _0x4a351a = _0x146c99.body().find(".online-prestige-watched .online-prestige-watched__body").empty();
        if (_0x250efe) {
          var _0x2dde9f = [];
          if (_0x250efe.balanser_name) {
            _0x2dde9f.push(_0x250efe.balanser_name);
          }
          if (_0x250efe.voice_name) {
            _0x2dde9f.push(_0x250efe.voice_name);
          }
          if (_0x250efe.season) {
            _0x2dde9f.push(Lampa.Lang.translate("torrent_serial_season") + " " + _0x250efe.season);
          }
          if (_0x250efe.episode) {
            _0x2dde9f.push(Lampa.Lang.translate('torrent_serial_episode') + " " + _0x250efe.episode);
          }
          _0x2dde9f.forEach(function (_0x1e3562) {
            _0x4a351a.append("<span>" + _0x1e3562 + '</span>');
          });
        } else {
          _0x4a351a.append("<span>" + Lampa.Lang.translate("lampac_no_watch_history") + '</span>');
        }
      };
      this.draw = function (_0x25d215) {
        var _0x81e70b = this;
        var _0x520986 = arguments.length > 0x1 && arguments[0x1] !== undefined ? arguments[0x1] : {};
        if (!_0x25d215.length) {
          return this.empty();
        }
        _0x146c99.clear();
        if (!_0x32aa47.balanser) {
          _0x146c99.append(Lampa.Template.get("lampac_prestige_watched", {}));
        }
        this.updateWatched();
        this.getEpisodes(_0x25d215[0x0].season, function (_0x12ae1d) {
          var _0x5eaed1 = Lampa.Storage.cache('online_view', 0x1388, []);
          var _0xe443a2 = !!_0x32aa47.movie.name;
          var _0x4a2928 = _0x81e70b.getChoice();
          var _0x2c469f = window.innerWidth > 0x1e0;
          var _0x1eb5f5 = false;
          var _0x53ab5f = false;
          _0x25d215.forEach(function (_0x3c5a59, _0x5b04e0) {
            var _0x39d433 = _0xe443a2 && _0x12ae1d.length && !_0x520986.similars ? _0x12ae1d.find(function (_0x2355eb) {
              return _0x2355eb.episode_number == _0x3c5a59.episode;
            }) : false;
            var _0x6f4e05 = _0x3c5a59.episode || _0x5b04e0 + 0x1;
            var _0x4aecb8 = _0x4a2928.episodes_view[_0x3c5a59.season];
            var _0x4f18f4 = _0x4a2928.voice_name || (_0x285f2b.voice[0x0] ? _0x285f2b.voice[0x0].title : false) || _0x3c5a59.voice_name || (_0xe443a2 ? "Неизвестно" : _0x3c5a59.text) || "Неизвестно";
            if (_0x3c5a59.quality) {
              _0x3c5a59.qualitys = _0x3c5a59.quality;
              _0x3c5a59.quality = Lampa.Arrays.getKeys(_0x3c5a59.quality)[0x0];
            }
            Lampa.Arrays.extend(_0x3c5a59, {
              'voice_name': _0x4f18f4,
              'info': _0x4f18f4.length > 0x3c ? _0x4f18f4.substr(0x0, 0x3c) + "..." : _0x4f18f4,
              'quality': '',
              'time': Lampa.Utils.secondsToTime((_0x39d433 ? _0x39d433.runtime : _0x32aa47.movie.runtime) * 0x3c, true)
            });
            var _0x3888b0 = Lampa.Utils.hash(_0x3c5a59.season ? [_0x3c5a59.season, _0x3c5a59.season > 0xa ? ':' : '', _0x3c5a59.episode, _0x32aa47.movie.original_title].join('') : _0x32aa47.movie.original_title);
            var _0x4e6a45 = Lampa.Utils.hash(_0x3c5a59.season ? [_0x3c5a59.season, _0x3c5a59.season > 0xa ? ':' : '', _0x3c5a59.episode, _0x32aa47.movie.original_title, _0x3c5a59.voice_name].join('') : _0x32aa47.movie.original_title + _0x3c5a59.voice_name);
            var _0x2ff2cc = {
              'hash_timeline': _0x3888b0,
              'hash_behold': _0x4e6a45
            };
            var _0xb29610 = [];
            if (_0x3c5a59.season) {
              _0x3c5a59.translate_episode_end = _0x81e70b.getLastEpisode(_0x25d215);
              _0x3c5a59.translate_voice = _0x3c5a59.voice_name;
            }
            if (_0x3c5a59.text && !_0x39d433) {
              _0x3c5a59.title = _0x3c5a59.text;
            }
            _0x3c5a59.timeline = Lampa.Timeline.view(_0x3888b0);
            if (_0x39d433) {
              _0x3c5a59.title = _0x39d433.name;
              if (_0x3c5a59.info.length < 0x1e && _0x39d433.vote_average) {
                _0xb29610.push(Lampa.Template.get("lampac_prestige_rate", {
                  'rate': parseFloat(_0x39d433.vote_average + '').toFixed(0x1)
                }, true));
              }
              if (_0x39d433.air_date && _0x2c469f) {
                _0xb29610.push(Lampa.Utils.parseTime(_0x39d433.air_date).full);
              }
            } else if (_0x32aa47.movie.release_date && _0x2c469f) {
              _0xb29610.push(Lampa.Utils.parseTime(_0x32aa47.movie.release_date).full);
            }
            if (!_0xe443a2 && _0x32aa47.movie.tagline && _0x3c5a59.info.length < 0x1e) {
              _0xb29610.push(_0x32aa47.movie.tagline);
            }
            if (_0x3c5a59.info) {
              _0xb29610.push(_0x3c5a59.info);
            }
            if (_0xb29610.length) {
              _0x3c5a59.info = _0xb29610.map(function (_0xff13b) {
                return '<span>' + _0xff13b + "</span>";
              }).join("<span class=\"online-prestige-split\">?</span>");
            }
            var _0x59d961 = Lampa.Template.get("lampac_prestige_full", _0x3c5a59);
            var _0xb7fd5 = _0x59d961.find(".online-prestige__loader");
            var _0x31fb6c = _0x59d961.find(".online-prestige__img");
            if (_0x32aa47.balanser) {
              _0x31fb6c.hide();
            }
            if (!_0xe443a2) {
              if (_0x4a2928.movie_view == _0x4e6a45) {
                _0x1eb5f5 = _0x59d961;
              }
            } else if (typeof _0x4aecb8 !== "undefined" && _0x4aecb8 == _0x6f4e05) {
              _0x1eb5f5 = _0x59d961;
            }
            if (_0xe443a2 && !_0x39d433) {
              _0x31fb6c.append("<div class=\"online-prestige__episode-number\">" + (((_0x3c5a59.episode || _0x5b04e0 + 0x1) < 0xa ? '0' : '') + (_0x3c5a59.episode || _0x5b04e0 + 0x1)) + "</div>");
              _0xb7fd5.remove();
            } else {
              if (!_0xe443a2 && _0x32aa47.movie.backdrop_path == "undefined") {
                _0xb7fd5.remove();
              } else {
                var _0x3e115a = _0x59d961.find("img")[0x0];
                _0x3e115a.onerror = function () {
                  _0x3e115a.src = "./img/img_broken.svg";
                };
                _0x3e115a.onload = function () {
                  _0x31fb6c.addClass("online-prestige__img--loaded");
                  _0xb7fd5.remove();
                  if (_0xe443a2) {
                    _0x31fb6c.append("<div class=\"online-prestige__episode-number\">" + (((_0x3c5a59.episode || _0x5b04e0 + 0x1) < 0xa ? '0' : '') + (_0x3c5a59.episode || _0x5b04e0 + 0x1)) + "</div>");
                  }
                };
                _0x3e115a.src = Lampa.TMDB.image('t/p/w300' + (_0x39d433 ? _0x39d433.still_path : _0x32aa47.movie.backdrop_path));
                _0x164ee6.push(_0x3e115a);
                _0x3c5a59.thumbnail = _0x3e115a.src;
              }
            }
            _0x59d961.find(".online-prestige__timeline").append(Lampa.Timeline.render(_0x3c5a59.timeline));
            if (_0x5eaed1.indexOf(_0x4e6a45) !== -0x1) {
              _0x53ab5f = _0x59d961;
              _0x59d961.find(".online-prestige__img").append("<div class=\"online-prestige__viewed\">" + Lampa.Template.get("icon_viewed", {}, true) + "</div>");
            }
            _0x3c5a59.mark = function () {
              _0x5eaed1 = Lampa.Storage.cache("online_view", 0x1388, []);
              if (_0x5eaed1.indexOf(_0x4e6a45) == -0x1) {
                _0x5eaed1.push(_0x4e6a45);
                Lampa.Storage.set("online_view", _0x5eaed1);
                if (_0x59d961.find(".online-prestige__viewed").length == 0x0) {
                  _0x59d961.find(".online-prestige__img").append("<div class=\"online-prestige__viewed\">" + Lampa.Template.get("icon_viewed", {}, true) + "</div>");
                }
              }
              _0x4a2928 = _0x81e70b.getChoice();
              if (!_0xe443a2) {
                _0x4a2928.movie_view = _0x4e6a45;
              } else {
                _0x4a2928.episodes_view[_0x3c5a59.season] = _0x6f4e05;
              }
              _0x81e70b.saveChoice(_0x4a2928);
              var _0x37b28d = _0x4a2928.voice_name || _0x3c5a59.voice_name || _0x3c5a59.title;
              if (_0x37b28d.length > 0x1e) {
                _0x37b28d = _0x37b28d.slice(0x0, 0x1e) + '...';
              }
              _0x81e70b.watched({
                'balanser': _0x180156,
                'balanser_name': Lampa.Utils.capitalizeFirstLetter(_0x2fb878[_0x180156] ? _0x2fb878[_0x180156].name.split(" ")[0x0] : _0x180156),
                'voice_id': _0x4a2928.voice_id,
                'voice_name': _0x37b28d,
                'episode': _0x3c5a59.episode,
                'season': _0x3c5a59.season
              });
            };
            _0x3c5a59.unmark = function () {
              _0x5eaed1 = Lampa.Storage.cache('online_view', 0x1388, []);
              if (_0x5eaed1.indexOf(_0x4e6a45) !== -0x1) {
                Lampa.Arrays.remove(_0x5eaed1, _0x4e6a45);
                Lampa.Storage.set("online_view", _0x5eaed1);
                Lampa.Storage.remove("online_view", _0x4e6a45);
                _0x59d961.find(".online-prestige__viewed").remove();
              }
            };
            _0x3c5a59.timeclear = function () {
              _0x3c5a59.timeline.percent = 0x0;
              _0x3c5a59.timeline.time = 0x0;
              _0x3c5a59.timeline.duration = 0x0;
              Lampa.Timeline.update(_0x3c5a59.timeline);
            };
            _0x59d961.on("hover:enter", function () {
              if (_0x32aa47.movie.id) {
                Lampa.Favorite.add("history", _0x32aa47.movie, 0x64);
              }
              if (_0x520986.onEnter) {
                _0x520986.onEnter(_0x3c5a59, _0x59d961, _0x2ff2cc);
              }
            }).on("hover:focus", function (_0x644ba0) {
              _0x1c328f = _0x644ba0.target;
              if (_0x520986.onFocus) {
                _0x520986.onFocus(_0x3c5a59, _0x59d961, _0x2ff2cc);
              }
              _0x146c99.update($(_0x644ba0.target), true);
            });
            if (_0x520986.onRender) {
              _0x520986.onRender(_0x3c5a59, _0x59d961, _0x2ff2cc);
            }
            _0x81e70b.contextMenu({
              'html': _0x59d961,
              'element': _0x3c5a59,
              'onFile': function _0xc545dd(_0x5297da) {
                if (_0x520986.onContextMenu) {
                  _0x520986.onContextMenu(_0x3c5a59, _0x59d961, _0x2ff2cc, _0x5297da);
                }
              },
              'onClearAllMark': function _0x4c2924() {
                _0x25d215.forEach(function (_0x2d4533) {
                  _0x2d4533.unmark();
                });
              },
              'onClearAllTime': function _0x237353() {
                _0x25d215.forEach(function (_0xf054fa) {
                  _0xf054fa.timeclear();
                });
              }
            });
            _0x146c99.append(_0x59d961);
          });
          if (_0xe443a2 && _0x12ae1d.length > _0x25d215.length && !_0x520986.similars) {
            var _0x1f47ff = _0x12ae1d.slice(_0x25d215.length);
            _0x1f47ff.forEach(function (_0x526507) {
              var _0x331f8b = [];
              if (_0x526507.vote_average) {
                _0x331f8b.push(Lampa.Template.get("lampac_prestige_rate", {
                  'rate': parseFloat(_0x526507.vote_average + '').toFixed(0x1)
                }, true));
              }
              if (_0x526507.air_date) {
                _0x331f8b.push(Lampa.Utils.parseTime(_0x526507.air_date).full);
              }
              var _0x44e0db = new Date((_0x526507.air_date + '').replace(/-/g, '/'));
              var _0x43dab9 = Date.now();
              var _0xdbf030 = Math.round((_0x44e0db.getTime() - _0x43dab9) / 86400000);
              var _0x27eff4 = Lampa.Lang.translate('full_episode_days_left') + ": " + _0xdbf030;
              var _0x171b5f = Lampa.Template.get("lampac_prestige_full", {
                'time': Lampa.Utils.secondsToTime((_0x526507 ? _0x526507.runtime : _0x32aa47.movie.runtime) * 0x3c, true),
                'info': _0x331f8b.length ? _0x331f8b.map(function (_0x1cdc5d) {
                  return "<span>" + _0x1cdc5d + "</span>";
                }).join("<span class=\"online-prestige-split\">?</span>") : '',
                'title': _0x526507.name,
                'quality': _0xdbf030 > 0x0 ? _0x27eff4 : ''
              });
              var _0x5cf916 = _0x171b5f.find(".online-prestige__loader");
              var _0x5d5f03 = _0x171b5f.find('.online-prestige__img');
              var _0x94ced1 = _0x25d215[0x0] ? _0x25d215[0x0].season : 0x1;
              _0x171b5f.find(".online-prestige__timeline").append(Lampa.Timeline.render(Lampa.Timeline.view(Lampa.Utils.hash([_0x94ced1, _0x526507.episode_number, _0x32aa47.movie.original_title].join('')))));
              var _0x4a8f34 = _0x171b5f.find('img')[0x0];
              if (_0x526507.still_path) {
                _0x4a8f34.onerror = function () {
                  _0x4a8f34.src = "./img/img_broken.svg";
                };
                _0x4a8f34.onload = function () {
                  _0x5d5f03.addClass("online-prestige__img--loaded");
                  _0x5cf916.remove();
                  _0x5d5f03.append("<div class=\"online-prestige__episode-number\">" + ((_0x526507.episode_number < 0xa ? '0' : '') + _0x526507.episode_number) + "</div>");
                };
                _0x4a8f34.src = Lampa.TMDB.image("t/p/w300" + _0x526507.still_path);
                _0x164ee6.push(_0x4a8f34);
              } else {
                _0x5cf916.remove();
                _0x5d5f03.append("<div class=\"online-prestige__episode-number\">" + ((_0x526507.episode_number < 0xa ? '0' : '') + _0x526507.episode_number) + "</div>");
              }
              _0x171b5f.on("hover:focus", function (_0x344ef1) {
                _0x1c328f = _0x344ef1.target;
                _0x146c99.update($(_0x344ef1.target), true);
              });
              _0x171b5f.css("opacity", "0.5");
              _0x146c99.append(_0x171b5f);
            });
          }
          if (_0x1eb5f5) {
            _0x1c328f = _0x1eb5f5[0x0];
          } else if (_0x53ab5f) {
            _0x1c328f = _0x53ab5f[0x0];
          }
          Lampa.Controller.enable('content');
        });
      };
      this.contextMenu = function (_0x126f16) {
        _0x126f16.html.on('hover:long', function () {
          function _0x1e1955(_0x4de572) {
            var _0x26ac8e = Lampa.Controller.enabled().name;
            var _0x475921 = [];
            if (Lampa.Platform.is("webos")) {
              _0x475921.push({
                'title': Lampa.Lang.translate("player_lauch") + " - Webos",
                'player': "webos"
              });
            }
            if (Lampa.Platform.is('android')) {
              _0x475921.push({
                'title': Lampa.Lang.translate('player_lauch') + " - Android",
                'player': "android"
              });
            }
            _0x475921.push({
              'title': Lampa.Lang.translate("player_lauch") + " - Lampa",
              'player': "lampa"
            });
            _0x475921.push({
              'title': Lampa.Lang.translate("lampac_video"),
              'separator': true
            });
            _0x475921.push({
              'title': Lampa.Lang.translate('torrent_parser_label_title'),
              'mark': true
            });
            _0x475921.push({
              'title': Lampa.Lang.translate("torrent_parser_label_cancel_title"),
              'unmark': true
            });
            _0x475921.push({
              'title': Lampa.Lang.translate("time_reset"),
              'timeclear': true
            });
            if (_0x4de572) {
              _0x475921.push({
                'title': Lampa.Lang.translate('copy_link'),
                'copylink': true
              });
            }
            if (window.lampac_online_context_menu) {
              window.lampac_online_context_menu.push(_0x475921, _0x4de572, _0x126f16);
            }
            _0x475921.push({
              'title': Lampa.Lang.translate("more"),
              'separator': true
            });
            if (Lampa.Account.logged() && _0x126f16.element && typeof _0x126f16.element.season !== "undefined" && _0x126f16.element.translate_voice) {
              _0x475921.push({
                'title': Lampa.Lang.translate('lampac_voice_subscribe'),
                'subscribe': true
              });
            }
            _0x475921.push({
              'title': Lampa.Lang.translate("lampac_clear_all_marks"),
              'clearallmark': true
            });
            _0x475921.push({
              'title': Lampa.Lang.translate("lampac_clear_all_timecodes"),
              'timeclearall': true
            });
            Lampa.Select.show({
              'title': Lampa.Lang.translate("title_action"),
              'items': _0x475921,
              'onBack': function _0x13691a() {
                Lampa.Controller.toggle(_0x26ac8e);
              },
              'onSelect': function _0x8844db(_0x48394a) {
                if (_0x48394a.mark) {
                  _0x126f16.element.mark();
                }
                if (_0x48394a.unmark) {
                  _0x126f16.element.unmark();
                }
                if (_0x48394a.timeclear) {
                  _0x126f16.element.timeclear();
                }
                if (_0x48394a.clearallmark) {
                  _0x126f16.onClearAllMark();
                }
                if (_0x48394a.timeclearall) {
                  _0x126f16.onClearAllTime();
                }
                if (window.lampac_online_context_menu) {
                  window.lampac_online_context_menu.onSelect(_0x48394a, _0x126f16);
                }
                Lampa.Controller.toggle(_0x26ac8e);
                if (_0x48394a.player) {
                  Lampa.Player.runas(_0x48394a.player);
                  _0x126f16.html.trigger("hover:enter");
                }
                if (_0x48394a.copylink) {
                  if (_0x4de572.quality) {
                    var _0x59f0db = [];
                    for (var _0x49808d in _0x4de572.quality) {
                      _0x59f0db.push({
                        'title': _0x49808d,
                        'file': _0x4de572.quality[_0x49808d]
                      });
                    }
                    Lampa.Select.show({
                      'title': Lampa.Lang.translate("settings_server_links"),
                      'items': _0x59f0db,
                      'onBack': function _0x2c07dc() {
                        Lampa.Controller.toggle(_0x26ac8e);
                      },
                      'onSelect': function _0x5ba778(_0x5b4218) {
                        Lampa.Utils.copyTextToClipboard(_0x5b4218.file, function () {
                          Lampa.Noty.show(Lampa.Lang.translate("copy_secuses"));
                        }, function () {
                          Lampa.Noty.show(Lampa.Lang.translate('copy_error'));
                        });
                      }
                    });
                  } else {
                    Lampa.Utils.copyTextToClipboard(_0x4de572.file, function () {
                      Lampa.Noty.show(Lampa.Lang.translate("copy_secuses"));
                    }, function () {
                      Lampa.Noty.show(Lampa.Lang.translate("copy_error"));
                    });
                  }
                }
                if (_0x48394a.subscribe) {
                  Lampa.Account.subscribeToTranslation({
                    'card': _0x32aa47.movie,
                    'season': _0x126f16.element.season,
                    'episode': _0x126f16.element.translate_episode_end,
                    'voice': _0x126f16.element.translate_voice
                  }, function () {
                    Lampa.Noty.show(Lampa.Lang.translate("lampac_voice_success"));
                  }, function () {
                    Lampa.Noty.show(Lampa.Lang.translate('lampac_voice_error'));
                  });
                }
              }
            });
          }
          _0x126f16.onFile(_0x1e1955);
        }).on("hover:focus", function () {
          if (Lampa.Helper) {
            Lampa.Helper.show('online_file', Lampa.Lang.translate("helper_online_file"), _0x126f16.html);
          }
        });
      };
      this.empty = function () {
        var _0x3413b8 = Lampa.Template.get('lampac_does_not_answer', {});
        _0x3413b8.find(".online-empty__buttons").remove();
        _0x3413b8.find(".online-empty__title").text(Lampa.Lang.translate('empty_title_two'));
        _0x3413b8.find(".online-empty__time").text(Lampa.Lang.translate("empty_text"));
        _0x146c99.clear();
        _0x146c99.append(_0x3413b8);
        this.loading(false);
      };
      this.noConnectToServer = function (_0x4fff81) {
        var _0x54be26 = Lampa.Template.get('lampac_does_not_answer', {});
        _0x54be26.find('.online-empty__buttons').remove();
        _0x54be26.find(".online-empty__title").text(Lampa.Lang.translate("title_error"));
        _0x54be26.find(".online-empty__time").text(_0x4fff81 && _0x4fff81.accsdb ? _0x4fff81.msg : Lampa.Lang.translate("lampac_does_not_answer_text").replace("{balanser}", _0x180156[_0x180156].name));
        _0x146c99.clear();
        _0x146c99.append(_0x54be26);
        this.loading(false);
      };
      this.doesNotAnswer = function (_0x2c8fb6) {
        var _0x280d06 = this;
        this.reset();
        var _0x761c52 = Lampa.Template.get("lampac_does_not_answer", {
          'balanser': _0x180156
        });
        if (_0x2c8fb6 && _0x2c8fb6.accsdb) {
          _0x761c52.find('.online-empty__title').html(_0x2c8fb6.msg);
        }
        var _0x2a4740 = _0x2c8fb6 && _0x2c8fb6.accsdb ? 0xa : 0x5;
        _0x761c52.find(".cancel").on("hover:enter", function () {
          clearInterval(_0x14bd7e);
        });
        _0x761c52.find(".change").on("hover:enter", function () {
          clearInterval(_0x14bd7e);
          _0x1af94.render().find(".filter--sort").trigger("hover:enter");
        });
        _0x146c99.clear();
        _0x146c99.append(_0x761c52);
        this.loading(false);
        _0x14bd7e = setInterval(function () {
          _0x2a4740--;
          _0x761c52.find(".timeout").text(_0x2a4740);
          if (_0x2a4740 == 0x0) {
            clearInterval(_0x14bd7e);
            var _0x244f7d = Lampa.Arrays.getKeys(_0x2fb878);
            var _0x1a68c0 = _0x244f7d.indexOf(_0x180156);
            var _0x4ac26d = _0x244f7d[_0x1a68c0 + 0x1];
            if (!_0x4ac26d) {
              _0x4ac26d = _0x244f7d[0x0];
            }
            _0x180156 = _0x4ac26d;
            if (Lampa.Activity.active().activity == _0x280d06.activity) {
              _0x280d06.changeBalanser(_0x180156);
            }
          }
        }, 0x3e8);
      };
      this.getLastEpisode = function (_0x3331eb) {
        var _0x470827 = 0x0;
        _0x3331eb.forEach(function (_0x5482dd) {
          if (typeof _0x5482dd.episode !== "undefined") {
            _0x470827 = Math.max(_0x470827, parseInt(_0x5482dd.episode));
          }
        });
        return _0x470827;
      };
      this.start = function () {
        if (Lampa.Activity.active().activity !== this.activity) {
          return;
        }
        if (!_0x518957) {
          _0x518957 = true;
          this.initialize();
        }
        Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(_0x32aa47.movie));
        Lampa.Controller.add('content', {
          'toggle': function _0x17f5aa() {
            Lampa.Controller.collectionSet(_0x146c99.render(), _0x3db2ee.render());
            Lampa.Controller.collectionFocus(_0x1c328f || false, _0x146c99.render());
          },
          'gone': function _0x3d8a15() {
            clearTimeout(_0x14bd7e);
          },
          'up': function _0x25bcae() {
            if (Navigator.canmove('up')) {
              Navigator.move('up');
            } else {
              Lampa.Controller.toggle("head");
            }
          },
          'down': function _0x26b9e3() {
            Navigator.move('down');
          },
          'right': function _0xf0125() {
            if (Navigator.canmove('right')) {
              Navigator.move('right');
            } else {
              _0x1af94.show(Lampa.Lang.translate("title_filter"), "filter");
            }
          },
          'left': function _0x5d997f() {
            if (Navigator.canmove("left")) {
              Navigator.move("left");
            } else {
              Lampa.Controller.toggle("menu");
            }
          },
          'back': this.back.bind(this)
        });
        Lampa.Controller.toggle("content");
      };
      this.render = function () {
        return _0x3db2ee.render();
      };
      this.back = function () {
        Lampa.Activity.backward();
      };
      this.pause = function () {};
      this.stop = function () {};
      this.destroy = function () {
        _0x4700ad.clear();
        this.clearImages();
        _0x3db2ee.destroy();
        _0x146c99.destroy();
        clearInterval(_0x14bd7e);
        clearTimeout(_0x3de908);
      };
    }
    function _0x4cf2f5(_0x3a5e93, _0x104679) {
      var _0x4e6a6a = new Lampa.Reguest();
      var _0x31fa2d = {
        'title': _0x3a5e93,
        'search': function (_0x429d54, _0x292f1f) {
          function _0x1886a4(_0x41f0e8) {
            var _0x3c8159 = _0x483761(Lampa.Arrays.getKeys(_0x41f0e8));
            if (_0x3c8159.length) {
              var _0x1aa3f5 = new Lampa.Status(_0x3c8159.length);
              _0x1aa3f5.onComplite = function (_0x4b14eb) {
                var _0xcc8502 = [];
                _0x3c8159.forEach(function (_0xc12352) {
                  var _0x3b5719 = _0x4b14eb[_0xc12352];
                  if (_0x3b5719 && _0x3b5719.data && _0x3b5719.type == "similar") {
                    var _0x51063 = _0x3b5719.data.map(function (_0x1dfb85) {
                      _0x1dfb85.title = Lampa.Utils.capitalizeFirstLetter(_0x1dfb85.title);
                      _0x1dfb85.release_date = _0x1dfb85.year || "0000";
                      _0x1dfb85.balanser = _0x104679;
                      if (_0x1dfb85.img !== undefined) {
                        if (_0x1dfb85.img.charAt(0x0) === '/') {
                          _0x1dfb85.img = "https://ab2024.ru/" + _0x1dfb85.img.substring(0x1);
                        }
                        if (_0x1dfb85.img.indexOf("/proxyimg") !== -0x1) {
                          _0x1dfb85.img = _0x3a2e30(_0x1dfb85.img);
                        }
                      }
                      return _0x1dfb85;
                    });
                    _0xcc8502.push({
                      'title': _0xc12352,
                      'results': _0x51063
                    });
                  }
                });
                _0x292f1f(_0xcc8502);
              };
              _0x3c8159.forEach(function (_0x481be1) {
                _0x4e6a6a.silent(_0x3a2e30(_0x41f0e8[_0x481be1]), function (_0x128553) {
                  _0x1aa3f5.append(_0x481be1, _0x128553);
                }, function () {
                  _0x1aa3f5.error();
                }, false, {
                  'headers': _0x11561c()
                });
              });
            } else {
              _0x292f1f([]);
            }
          }
          _0x4e6a6a.silent(_0x3a2e30("https://ab2024.ru/lite/" + _0x104679 + "?title=" + _0x429d54.query), function (_0x79282d) {
            if (_0x79282d.rch) {
              _0x5764af(_0x79282d, function () {
                _0x4e6a6a.silent(_0x3a2e30("https://ab2024.ru/lite/" + _0x104679 + "?title=" + _0x429d54.query), function (_0x5cd213) {
                  _0x1886a4(_0x5cd213);
                }, function () {
                  _0x292f1f([]);
                }, false, {
                  'headers': _0x11561c()
                });
              });
            } else {
              _0x1886a4(_0x79282d);
            }
          }, function () {
            _0x292f1f([]);
          }, false, {
            'headers': _0x11561c()
          });
        },
        'onCancel': function () {
          _0x4e6a6a.clear();
        },
        'params': {
          'lazy': true,
          'align_left': true,
          'card_events': {
            'onMenu': function () {}
          }
        },
        'onMore': function (_0x4439e9, _0xb3bdd1) {
          _0xb3bdd1();
        },
        'onSelect': function (_0x2074fc, _0x343815) {
          _0x343815();
          Lampa.Activity.push({
            'url': _0x2074fc.element.url,
            'title': "Lampac - " + _0x2074fc.element.title,
            'component': "lampac",
            'movie': _0x2074fc.element,
            'page': 0x1,
            'search': _0x2074fc.element.title,
            'clarification': true,
            'balanser': _0x2074fc.element.balanser,
            'noinfo': true
          });
        }
      };
      Lampa.Search.addSource(_0x31fa2d);
    }
    function _0x3f468b() {
      window.lampac_plugin = true;
      var _0x390635 = {
        'type': "video",
        'version': "7.7.7",
        'name': "Cinema",
        'description': "Плагин для просмотра онлайн сериалов и фильмов",
        'component': "cinema_online",
        'onContextMenu': function _0x566aaa(_0x3f59a2) {
          return {
            'name': Lampa.Lang.translate('lampac_watch'),
            'description': ''
          };
        },
        'onContextLauch': function _0x33a2c6(_0x4e31eb) {
          _0xb57877();
          Lampa.Component.add("cinema_online", _0x2a7c6a);
          var _0x22d982 = Lampa.Utils.hash(_0x4e31eb.number_of_seasons ? _0x4e31eb.original_name : _0x4e31eb.original_title);
          var _0x28c30 = Lampa.Storage.get('clarification_search', '{}');
          Lampa.Activity.push({
            'url': '',
            'title': Lampa.Lang.translate("title_online"),
            'component': 'cinema_online',
            'search': _0x28c30[_0x22d982] ? _0x28c30[_0x22d982] : _0x4e31eb.title,
            'search_one': _0x4e31eb.title,
            'search_two': _0x4e31eb.original_title,
            'movie': _0x4e31eb,
            'page': 0x1,
            'clarification': !!_0x28c30[_0x22d982]
          });
        }
      };
      _0x4cf2f5("Cinema", "spider");
      _0x4cf2f5("Cinema - Anime", "spider/anime");
      Lampa.Manifest.plugins = _0x390635;
      Lampa.Lang.add({
        'lampac_watch': {
          'ru': "Смотреть онлайн",
          'en': "Watch online",
          'uk': "Дивитися онлайн",
          'zh': "????"
        },
        'lampac_video': {
          'ru': "Видео",
          'en': "Video",
          'uk': 'Відео',
          'zh': '??'
        },
        'lampac_no_watch_history': {
          'ru': "Нет истории просмотра",
          'en': "No browsing history",
          'ua': "Немає історії перегляду",
          'zh': "??????"
        },
        'lampac_nolink': {
          'ru': "Не удалось извлечь ссылку",
          'uk': "Неможливо отримати посилання",
          'en': "Failed to fetch link",
          'zh': "??????"
        },
        'lampac_balanser': {
          'ru': 'Источник',
          'uk': "Джерело",
          'en': "Source",
          'zh': '??'
        },
        'helper_online_file': {
          'ru': "Удерживайте клавишу \"ОК\" для вызова контекстного меню",
          'uk': "Утримуйте клавішу \"ОК\" для виклику контекстного меню",
          'en': "Hold the \"OK\" key to bring up the context menu",
          'zh': "??\"??\"????????"
        },
        'title_online': {
          'ru': 'Онлайн',
          'uk': "Онлайн",
          'en': "Online",
          'zh': "???"
        },
        'lampac_voice_subscribe': {
          'ru': "Подписаться на перевод",
          'uk': "Підписатися на переклад",
          'en': "Subscribe to translation",
          'zh': "????"
        },
        'lampac_voice_success': {
          'ru': "Вы успешно подписались",
          'uk': "Ви успішно підписалися",
          'en': "You have successfully subscribed",
          'zh': "??????"
        },
        'lampac_voice_error': {
          'ru': "Возникла ошибка",
          'uk': "Виникла помилка",
          'en': "An error has occurred",
          'zh': "?????"
        },
        'lampac_clear_all_marks': {
          'ru': "Очистить все метки",
          'uk': "Очистити всі мітки",
          'en': "Clear all labels",
          'zh': "??????"
        },
        'lampac_clear_all_timecodes': {
          'ru': "Очистить все тайм-коды",
          'uk': "Очистити всі тайм-коди",
          'en': "Clear all timecodes",
          'zh': '????????'
        },
        'lampac_change_balanser': {
          'ru': "Изменить балансер",
          'uk': "Змінити балансер",
          'en': "Change balancer",
          'zh': "?????"
        },
        'lampac_balanser_dont_work': {
          'ru': "Поиск на ({balanser}) не дал результатов",
          'uk': "Пошук на ({balanser}) не дав результатів",
          'en': "Search on ({balanser}) did not return any results",
          'zh': "?? ({balanser}) ???????"
        },
        'lampac_balanser_timeout': {
          'ru': "Источник будет переключен автоматически через <span class=\"timeout\">10</span> секунд.",
          'uk': "Джерело буде автоматично переключено через <span class=\"timeout\">10</span> секунд.",
          'en': "The source will be switched automatically after <span class=\"timeout\">10</span> seconds.",
          'zh': "?????<span class=\"timeout\">10</span>???????"
        },
        'lampac_does_not_answer_text': {
          'ru': "Поиск на ({balanser}) не дал результатов",
          'uk': "Пошук на ({balanser}) не дав результатів",
          'en': "Search on ({balanser}) did not return any results",
          'zh': "?? ({balanser}) ???????"
        }
      });
      Lampa.Template.add("lampac_css", "\n        <style>\n        @charset 'UTF-8';.online-prestige{position:relative;-webkit-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative}@media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}.online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}.online-prestige__img>img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}.online-prestige__img--loaded>img{opacity:1}@media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}.online-prestige__folder{padding:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige__folder>svg{width:4.4em !important;height:4.4em !important}.online-prestige__viewed{position:absolute;top:1em;left:1em;background:rgba(0,0,0,0.45);-webkit-border-radius:100%;border-radius:100%;padding:.25em;font-size:.76em}.online-prestige__viewed>svg{width:1.5em !important;height:1.5em !important}.online-prestige__episode-number{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;font-size:2em}.online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;-webkit-background-size:contain;-o-background-size:contain;background-size:contain}.online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__timeline{margin:.8em 0}.online-prestige__timeline>.time-line{display:block !important}.online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}@media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}.online-prestige__time{padding-left:2em}.online-prestige__info{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__info>*{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}.online-prestige__quality{padding-left:1em;white-space:nowrap}.online-prestige__scan-file{position:absolute;bottom:0;left:0;right:0}.online-prestige__scan-file .broadcast__scan{margin:0}.online-prestige .online-prestige-split{font-size:.8em;margin:0 1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige.focus::after{content:'';position:absolute;top:-0.6em;left:-0.6em;right:-0.6em;bottom:-0.6em;-webkit-border-radius:.7em;border-radius:.7em;border:solid .3em #fff;z-index:-1;pointer-events:none}.online-prestige+.online-prestige{margin-top:1.5em}.online-prestige--folder .online-prestige__footer{margin-top:.8em}.online-prestige-watched{padding:1em}.online-prestige-watched__icon>svg{width:1.5em;height:1.5em}.online-prestige-watched__body{padding-left:1em;padding-top:.1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.online-prestige-watched__body>span+span::before{content:' ? ';vertical-align:top;display:inline-block;margin:0 .5em}.online-prestige-rate{display:-webkit-inline-box;display:-webkit-inline-flex;display:-moz-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige-rate>svg{width:1.3em !important;height:1.3em !important}.online-prestige-rate>span{font-weight:600;font-size:1.1em;padding-left:.7em}.online-empty{line-height:1.4}.online-empty__title{font-size:1.8em;margin-bottom:.3em}.online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}.online-empty__buttons{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-empty__buttons>*+*{margin-left:1em}.online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;-webkit-border-radius:.2em;border-radius:.2em;margin-bottom:2.4em}.online-empty__button.focus{background:#fff;color:black}.online-empty__templates .online-empty-template:nth-child(2){opacity:.5}.online-empty__templates .online-empty-template:nth-child(3){opacity:.2}.online-empty-template{background-color:rgba(255,255,255,0.3);padding:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template>*{background:rgba(0,0,0,0.3);-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template__ico{width:4em;height:4em;margin-right:2.4em}.online-empty-template__body{height:1.7em;width:70%}.online-empty-template+.online-empty-template{margin-top:1em}\n        </style>\n    ");
      $("body").append(Lampa.Template.get("lampac_css", {}, true));
      function _0xb57877() {
        Lampa.Template.add("lampac_prestige_full", "<div class=\"online-prestige online-prestige--full selector\">\n            <div class=\"online-prestige__img\">\n                <img alt=\"\">\n                <div class=\"online-prestige__loader\"></div>\n            </div>\n            <div class=\"online-prestige__body\">\n                <div class=\"online-prestige__head\">\n                    <div class=\"online-prestige__title\">{title}</div>\n                    <div class=\"online-prestige__time\">{time}</div>\n                </div>\n\n                <div class=\"online-prestige__timeline\"></div>\n\n                <div class=\"online-prestige__footer\">\n                    <div class=\"online-prestige__info\">{info}</div>\n                    <div class=\"online-prestige__quality\">{quality}</div>\n                </div>\n            </div>\n        </div>");
        Lampa.Template.add("lampac_content_loading", "<div class=\"online-empty\">\n            <div class=\"broadcast__scan\"><div></div></div>\n\t\t\t\n            <div class=\"online-empty__templates\">\n                <div class=\"online-empty-template selector\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n            </div>\n        </div>");
        Lampa.Template.add("lampac_does_not_answer", "<div class=\"online-empty\">\n            <div class=\"online-empty__title\">\n                #{lampac_balanser_dont_work}\n            </div>\n            <div class=\"online-empty__time\">\n                #{lampac_balanser_timeout}\n            </div>\n            <div class=\"online-empty__buttons\">\n                <div class=\"online-empty__button selector cancel\">#{cancel}</div>\n                <div class=\"online-empty__button selector change\">#{lampac_change_balanser}</div>\n            </div>\n            <div class=\"online-empty__templates\">\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n            </div>\n        </div>");
        Lampa.Template.add("lampac_prestige_rate", "<div class=\"online-prestige-rate\">\n            <svg width=\"17\" height=\"16\" viewBox=\"0 0 17 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                <path d=\"M8.39409 0.192139L10.99 5.30994L16.7882 6.20387L12.5475 10.4277L13.5819 15.9311L8.39409 13.2425L3.20626 15.9311L4.24065 10.4277L0 6.20387L5.79819 5.30994L8.39409 0.192139Z\" fill=\"#fff\"></path>\n            </svg>\n            <span>{rate}</span>\n        </div>");
        Lampa.Template.add('lampac_prestige_folder', "<div class=\"online-prestige online-prestige--folder selector\">\n            <div class=\"online-prestige__folder\">\n                <svg viewBox=\"0 0 128 112\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect y=\"20\" width=\"128\" height=\"92\" rx=\"13\" fill=\"white\"></rect>\n                    <path d=\"M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z\" fill=\"white\" fill-opacity=\"0.23\"></path>\n                    <rect x=\"11\" y=\"8\" width=\"106\" height=\"76\" rx=\"13\" fill=\"white\" fill-opacity=\"0.51\"></rect>\n                </svg>\n            </div>\n            <div class=\"online-prestige__body\">\n                <div class=\"online-prestige__head\">\n                    <div class=\"online-prestige__title\">{title}</div>\n                    <div class=\"online-prestige__time\">{time}</div>\n                </div>\n\n                <div class=\"online-prestige__footer\">\n                    <div class=\"online-prestige__info\">{info}</div>\n                </div>\n            </div>\n        </div>");
        Lampa.Template.add('lampac_prestige_watched', "<div class=\"online-prestige online-prestige-watched selector\">\n            <div class=\"online-prestige-watched__icon\">\n                <svg width=\"21\" height=\"21\" viewBox=\"0 0 21 21\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <circle cx=\"10.5\" cy=\"10.5\" r=\"9\" stroke=\"currentColor\" stroke-width=\"3\"/>\n                    <path d=\"M14.8477 10.5628L8.20312 14.399L8.20313 6.72656L14.8477 10.5628Z\" fill=\"currentColor\"/>\n                </svg>\n            </div>\n            <div class=\"online-prestige-watched__body\">\n                \n            </div>\n        </div>");
      }
      var _0x385f1c = "<div class=\"full-start__button selector cinema--online lampac--button\" data-subtitle=\"".concat("Cinema", " v").concat("7.7.7", "\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"29\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M11.585.031c-.342.087-.603.22-.94.478c-.354.273-.644.582-1.038 1.11c-.748 1.01-1.475 2.337-2.332 4.265c-.105.236-.198.43-.205.43a10 10 0 0 1-.211-.655c-.442-1.47-.77-2.426-1.095-3.196C5.254 1.25 4.793.638 4.234.43a1.25 1.25 0 0 0-.795.007c-.565.23-.985.838-1.318 1.914c-.522 1.676-.96 4.53-1.472 9.6c-.478 4.69-.675 7.526-.646 9.257c.012.835.045 1.181.15 1.62c.187.792.622 1.206 1.225 1.163c.159-.013.216-.03.392-.134c.173-.102.247-.17.434-.391c.504-.602.976-1.62 1.952-4.22c.364-.967 1.967-5.397 1.967-5.434c0-.026-.703-2.417-.822-2.8l-.04-.123l-.034.076c-.064.143-.72 1.934-1.448 3.952c-1 2.772-1.577 4.32-1.884 5.06l-.097.239l.012-.267c.01-.146.026-.495.038-.773c.086-1.766.33-4.554.703-8.068c.375-3.536.708-5.842 1.043-7.227c.1-.414.26-.959.294-1.004c.024-.027.233.424.404.871c.356.934.636 1.816 1.515 4.774c1.083 3.651 1.627 5.265 2.325 6.901c.61 1.436 1.104 2.305 1.72 3.036c.432.512.84.835 1.294 1.029a2.03 2.03 0 0 0 1.626.017c1.385-.557 2.565-2.553 3.971-6.719c.378-1.122.691-2.122 1.35-4.32c.911-3.045 1.313-4.251 1.7-5.128a7 7 0 0 1 .211-.447l.057-.098l.038.11c.33.916.663 2.636.971 5.02c.333 2.552.81 7.354.988 9.89c.057.818.12 1.976.117 2.192v.155l-.074-.169c-.235-.534-.779-1.999-1.9-5.102c-.869-2.404-1.484-4.076-1.515-4.113c-.011-.013-.029.014-.043.057c-.574 1.9-.836 2.777-.836 2.81c0 .04.976 2.756 1.686 4.69c.606 1.647 1.152 3.041 1.416 3.618c.349.764.605 1.206.888 1.543c.164.194.242.264.413.365c.376.213.704.16.97.007c.84-.495.985-1.903.66-6.39c-.164-2.229-.523-5.94-.834-8.602c-.494-4.228-1.017-6.645-1.66-7.671c-.254-.408-.601-.7-.938-.793a1.44 1.44 0 0 0-.668.017c-.876.298-1.548 1.546-2.557 4.75c-.136.434-.262.836-.276.892c-.016.059-.038.107-.045.107c-.01 0-.073-.13-.145-.29C15.516 3.2 14.494 1.523 13.542.677c-.278-.247-.729-.52-.995-.604c-.245-.076-.739-.098-.962-.04zm.682 2.15c.726.38 1.918 2.452 3.322 5.778l.44 1.04l-.345 1.099c-.639 2.046-1.05 3.227-1.534 4.382c-.672 1.605-1.316 2.657-1.812 2.958a.73.73 0 0 1-.615.042c-.798-.335-1.798-2.198-2.881-5.375a77 77 0 0 1-.805-2.51l-.135-.442l.346-.837c1.344-3.239 2.541-5.417 3.297-6.008c.273-.213.484-.25.722-.126Z\"/></svg>\n\n        <span>#{title_online}</span>\n    </div>");
      Lampa.Component.add("cinema_online", _0x2a7c6a);
      _0xb57877();
      function _0x46bd36(_0x1c789d) {
        if (_0x1c789d.render.find(".lampac--button").length) {
          return;
        }
        var _0x505b19 = $(Lampa.Lang.translate(_0x385f1c));
        _0x505b19.on("hover:enter", function () {
          _0xb57877();
          Lampa.Component.add("cinema_online", _0x2a7c6a);
          var _0x24925c = Lampa.Utils.hash(_0x1c789d.movie.number_of_seasons ? _0x1c789d.movie.original_name : _0x1c789d.movie.original_title);
          var _0x57a83b = Lampa.Storage.get('clarification_search', '{}');
          Lampa.Activity.push({
            'url': '',
            'title': Lampa.Lang.translate("title_online"),
            'component': "cinema_online",
            'search': _0x57a83b[_0x24925c] ? _0x57a83b[_0x24925c] : _0x1c789d.movie.title,
            'search_one': _0x1c789d.movie.title,
            'search_two': _0x1c789d.movie.original_title,
            'movie': _0x1c789d.movie,
            'page': 0x1,
            'clarification': !!_0x57a83b[_0x24925c]
          });
        });
        _0x1c789d.render.after(_0x505b19);
      }
      Lampa.Listener.follow("full", function (_0x3e2cbc) {
        if (_0x3e2cbc.type == "complite") {
          _0x46bd36({
            'render': _0x3e2cbc.object.activity.render().find(".view--torrent"),
            'movie': _0x3e2cbc.data.movie
          });
        }
      });
      try {
        if (Lampa.Activity.active().component == "full") {
          _0x46bd36({
            'render': Lampa.Activity.active().activity.render().find(".view--torrent"),
            'movie': Lampa.Activity.active().card
          });
        }
      } catch (_0x5f5084) {}
      if (Lampa.Manifest.app_digital >= 0xb1) {
        var _0x3deabb = ["filmix", 'filmixtv', "fxapi", "rezka", 'pizdatoehd', "getstv", "kinopub", "zetflixdb", "collaps", "hdvb", "kodik", 'bamboo', "eneyida", "kinoukr", "uafilm", "uakino", "kinotochka", 'remux', "anilibria", 'animedia', "animego", "animevost", "animebesst", "alloha", "mirage", "phantom", "animelib", 'moonanime', 'vibix', "fancdn", 'cdnvideohub', "vokino", "hydraflix", "videasy", "vidsrc", "movpi", "vidlink", "smashystream", 'autoembed', 'pidtor', 'videoseed', "iptvonline", "veoveo", 'kinoflix', "leproduction", "vkmovie", "videoseed", 'veoveo', "kinogo", "kinobase", "fancdn", "asiage", 'geosaitebi', "mikai", "dreamerscast"];
        _0x3deabb.forEach(function (_0x5d64cf) {
          Lampa.Storage.sync("online_choice_" + _0x5d64cf, "object_object");
        });
        Lampa.Storage.sync('online_watched_last', "object_object");
      }
    }
    if (!window.lampac_plugin) {
      _0x3f468b();
    }
  })();
})();

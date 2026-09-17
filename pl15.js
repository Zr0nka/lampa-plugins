(function () {
  'use strict';

  var TAG = '[LOCAL-NO-ADS]';
  var installed = false;
  var active = [];

  function log() {
    try {
      var args = [TAG];
      for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
      console.log.apply(console, args);
    } catch (e) {}
  }

  function warn() {
    try {
      var args = [TAG];
      for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
      console.warn.apply(console, args);
    } catch (e) {}
  }

  function findActive(data) {
    for (var i = 0; i < active.length; i++) {
      if (active[i].data === data) return i;
    }
    return -1;
  }

  function mark(data, source) {
    if (!data || findActive(data) !== -1) return;

    var hadIptv = Object.prototype.hasOwnProperty.call(data, 'iptv');
    var originalIptv = data.iptv;

    active.push({
      data: data,
      source: source,
      hadIptv: hadIptv,
      originalIptv: originalIptv
    });

    data.iptv = true;

    log('source=' + source, 'preroll skip armed', data.url);
  }

  function restore(data) {
    var idx = findActive(data);
    if (idx === -1) return;

    var item = active[idx];
    active.splice(idx, 1);

    if (item.hadIptv) {
      data.iptv = item.originalIptv;
    } else {
      try {
        delete data.iptv;
      } catch (e) {
        data.iptv = false;
      }
    }

    log('source=' + item.source, 'temporary flag restored');
  }

  function install() {
    if (installed) return true;

    if (
      !window.Lampa ||
      !Lampa.Player ||
      !Lampa.Player.listener ||
      typeof Lampa.Player.listener.send !== 'function'
    ) {
      return false;
    }

    if (Lampa.Player.listener.send.__localNoAdsWrapped) {
      installed = true;
      return true;
    }

    var originalSend = Lampa.Player.listener.send;

    function wrappedSend(type, payload) {
      // Before all normal "start" listeners run, remove our temporary flag.
      if (type === 'start' && payload) {
        restore(payload);
      }

      var result = originalSend.apply(this, arguments);

      // Player.play emits "create" synchronously before Preroll.show().
      // Modify only after all regular create listeners have already run,
      // so we do not interfere with their logic.
      // NOTE: unconditional — applies to ALL sources, not just Jellyfin/Torrent Manager.
      if (type === 'create' && payload && payload.data) {
        mark(payload.data, 'all');
      }

      // Safety cleanup for aborted/destroyed playback.
      if (type === 'destroy' && active.length) {
        while (active.length) {
          restore(active[0].data);
        }
      }

      return result;
    }

    wrappedSend.__localNoAdsWrapped = true;
    wrappedSend.__localNoAdsOriginal = originalSend;

    Lampa.Player.listener.send = wrappedSend;
    installed = true;

    log('installed');
    log('Preroll skip: enabled for all sources');

    return true;
  }

  function start() {
    if (install()) return;

    var tries = 0;
    var timer = setInterval(function () {
      tries++;

      if (install()) {
        clearInterval(timer);
        return;
      }

      if (tries >= 60) {
        clearInterval(timer);
        warn('could not install Player listener hook');
      }
    }, 500);
  }

  if (window.__LOCAL_NO_ADS_PLUGIN__) {
    log('already loaded');
    return;
  }

  window.__LOCAL_NO_ADS_PLUGIN__ = true;

  if (window.appready) {
    start();
  } else if (
    window.Lampa &&
    Lampa.Listener &&
    typeof Lampa.Listener.follow === 'function'
  ) {
    Lampa.Listener.follow('app', function (e) {
      if (e && e.type === 'ready') start();
    });

    setTimeout(start, 1500);
  } else {
    setTimeout(start, 1500);
  }
})();

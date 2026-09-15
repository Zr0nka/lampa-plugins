(function () {
    'use strict';

    if (window.__LampaAdDebugPlugin) {
        console.log('[AD DEBUG] Plugin already loaded');
        return;
    }

    window.__LampaAdDebugPlugin = true;

    console.log('========================================');
    console.log('[AD DEBUG] Plugin loaded');
    console.log('========================================');

    const DEBUG = true;

    function log() {
        if (DEBUG) {
            // Безопасный способ преобразования arguments для старых ТВ
            console.log.apply(console, ['[AD DEBUG]'].concat(
                Array.prototype.slice.call(arguments)
            ));
        }
    }

    function suspicious(url) {
        if (!url) return false;
        url = String(url).toLowerCase();
        return (
            url.includes('ad.') || url.includes('/ad/') || url.includes('/ads/') ||
            url.includes('advert') || url.includes('preroll') || url.includes('pre-roll') ||
            url.includes('banner') || url.includes('promo') ||
            url.includes('cub.red') || url.includes('cub.best') || url.includes('cub.black')
        );
    }

    // ========================================
    // FETCH
    // ========================================
    function hookFetch() {
        if (!window.fetch || window.fetch.__adDebugHook) return;

        const originalFetch = window.fetch;

        function debugFetch() {
            const args = arguments;
            const url = args[0] && args[0].url ? args[0].url : args[0];

            if (suspicious(url)) {
                console.log('%c[AD DEBUG][FETCH]', 'font-weight:bold', url, args);
            }

            // КРИТИЧНО: нативный fetch всегда должен вызываться в контексте window!
            return originalFetch.apply(window, args);
        }

        debugFetch.__adDebugHook = true;
        debugFetch.__original = originalFetch;
        window.fetch = debugFetch;

        log('FETCH hook installed');
    }

    // ========================================
    // XMLHttpRequest
    // ========================================
    function hookXHR() {
        if (!window.XMLHttpRequest) return;
        const proto = XMLHttpRequest.prototype;
        if (proto.open.__adDebugHook) return;

        const originalOpen = proto.open;
        const originalSend = proto.send;

        proto.open = function (method, url) {
            this.__adDebugMethod = method;
            this.__adDebugUrl = url;

            if (suspicious(url)) {
                console.log('%c[AD DEBUG][XHR OPEN]', 'font-weight:bold', method, url);
            }
            return originalOpen.apply(this, arguments);
        };
        proto.open.__adDebugHook = true;

        proto.send = function () {
            if (suspicious(this.__adDebugUrl)) {
                console.log('[AD DEBUG][XHR SEND]', this.__adDebugMethod, this.__adDebugUrl);
            }
            return originalSend.apply(this, arguments);
        };
        proto.send.__adDebugHook = true;

        log('XHR hooks installed');
    }

    // ========================================
    // VIDEO SRC
    // ========================================
    function hookVideoSrc() {
        const descriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
        if (!descriptor || !descriptor.set || descriptor.set.__adDebugHook) return;

        const originalSetter = descriptor.set;

        function newSetter(value) {
            if (suspicious(value)) {
                console.log('%c[AD DEBUG][VIDEO SRC]', 'font-weight:bold', value);
            }
            return originalSetter.call(this, value);
        }

        newSetter.__adDebugHook = true;

        Object.defineProperty(HTMLMediaElement.prototype, 'src', {
            configurable: descriptor.configurable,
            enumerable: descriptor.enumerable,
            get: descriptor.get,
            set: newSetter
        });

        log('VIDEO SRC hook installed');
    }

    // ========================================
    // VIDEO ELEMENTS
    // ========================================
    function inspectVideo(video) {
        if (!video || video.__adDebugInspected) return;
        video.__adDebugInspected = true;
        log('VIDEO FOUND', video);

        function check() {
            const src = video.currentSrc || video.src;
            if (src && suspicious(src)) {
                console.log('%c[AD DEBUG][!!! SUSPICIOUS VIDEO !!!]', 'font-weight:bold; color:red', src);
            }
        }

        check();
        // Используем массив и forEach, так как это массив строк, а не NodeList
        ['loadstart', 'loadedmetadata', 'loadeddata', 'play', 'playing'].forEach(function(ev) {
            video.addEventListener(ev, check);
        });
    }

    function scanVideos() {
        var nodes = document.querySelectorAll('video, audio');
        // Используем цикл for, чтобы избежать ошибки forEach is not a function у NodeList на ТВ
        for (var i = 0; i < nodes.length; i++) {
            inspectVideo(nodes[i]);
        }
    }

    // ========================================
    // DOM OBSERVER
    // ========================================
    function startMutationObserver() {
        const observer = new MutationObserver(function (mutations) {
            // Массив mutations безопасен для forEach
            mutations.forEach(function (mutation) {
                // mutation.addedNodes - это NodeList, используем цикл for
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    
                    if (node.nodeType !== 1) continue;

                    if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
                        console.log('%c[AD DEBUG][MEDIA ADDED]', 'font-weight:bold', node);
                        inspectVideo(node);
                    }

                    if (node.querySelectorAll) {
                        var innerMedia = node.querySelectorAll('video, audio');
                        for (var j = 0; j < innerMedia.length; j++) {
                            inspectVideo(innerMedia[j]);
                        }
                    }

                    const text = String(node.className || '') + ' ' + String(node.id || '');
                    if (/ad|advert|preroll|promo/i.test(text)) {
                        console.log('%c[AD DEBUG][AD-LIKE ELEMENT]', 'font-weight:bold', node);
                    }
                }
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        log('MutationObserver installed');
    }

    // ========================================
    // VIDEO EVENTS
    // ========================================
    function hookVideoEvents() {
        const events = ['loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'play', 'playing', 'pause', 'waiting', 'ended', 'error'];
        
        events.forEach(function (eventName) {
            document.addEventListener(eventName, function (event) {
                const target = event.target;
                if (target && (target.tagName === 'VIDEO' || target.tagName === 'AUDIO')) {
                    const src = target.currentSrc || target.src || '';
                    // Логируем только если есть подозрения, иначе консоль зависнет от потока событий
                    if(suspicious(src)) {
                        console.log('[AD DEBUG][MEDIA EVENT]', eventName, src, target);
                    }
                }
            }, true);
        });

        log('Media event hooks installed');
    }

    // ========================================
    // LAMPA PLAYER
    // ========================================
    function inspectLampa() {
        if (!window.Lampa) {
            log('Lampa not available yet');
            return;
        }

        log('Lampa detected');
    }

    // ========================================
    // PERIODIC CHECK
    // ========================================
    function periodicCheck() {
        try {
            hookFetch();
            hookXHR();
            hookVideoSrc();
            scanVideos();
        } catch (e) {
            console.error('[AD DEBUG] periodic error:', e);
        }
    }

    // ========================================
    // START
    // ========================================
    function start() {
        console.log('========================================');
        console.log('[AD DEBUG] START');
        console.log('========================================');

        hookFetch();
        hookXHR();
        hookVideoSrc();

        startMutationObserver();
        hookVideoEvents();

        inspectLampa();
        scanVideos();

        setInterval(periodicCheck, 2000);

        log('ALL DEBUG HOOKS STARTED');
    }

    if (window.Lampa) {
        start();
    } else {
        let attempts = 0;
        const timer = setInterval(function () {
            attempts++;
            if (window.Lampa) {
                clearInterval(timer);
                start();
            } else if (attempts >= 60) {
                clearInterval(timer);
                console.error('[AD DEBUG] Lampa not found');
            }
        }, 1000);
    }
})();

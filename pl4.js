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

    // ========================================
    // Настройки
    // ========================================

    const DEBUG = true;

    function log() {
        if (DEBUG) {
            console.log.apply(console, ['[AD DEBUG]'].concat(
                Array.from(arguments)
            ));
        }
    }

    function suspicious(url) {
        if (!url) return false;

        url = String(url).toLowerCase();

        return (
            url.includes('ad.') ||
            url.includes('/ad/') ||
            url.includes('/ads/') ||
            url.includes('advert') ||
            url.includes('preroll') ||
            url.includes('pre-roll') ||
            url.includes('banner') ||
            url.includes('promo') ||
            url.includes('cub.red') ||
            url.includes('cub.best') ||
            url.includes('cub.black')
        );
    }


    // ========================================
    // FETCH
    // ========================================

    function hookFetch() {
        if (!window.fetch) return;

        if (window.fetch.__adDebugHook) return;

        const originalFetch = window.fetch;

        function debugFetch() {
            const args = arguments;
            const url = args[0] && args[0].url
                ? args[0].url
                : args[0];

            if (suspicious(url)) {
                console.log(
                    '%c[AD DEBUG][FETCH]',
                    'font-weight:bold',
                    url,
                    args
                );

                console.trace('[AD DEBUG] FETCH trace');
            }

            return originalFetch.apply(this, args);
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

                console.log(
                    '%c[AD DEBUG][XHR OPEN]',
                    'font-weight:bold',
                    method,
                    url
                );

                console.trace('[AD DEBUG] XHR trace');
            }

            return originalOpen.apply(this, arguments);
        };

        proto.open.__adDebugHook = true;
        proto.open.__original = originalOpen;


        proto.send = function () {

            if (suspicious(this.__adDebugUrl)) {

                console.log(
                    '[AD DEBUG][XHR SEND]',
                    this.__adDebugMethod,
                    this.__adDebugUrl
                );

                console.log(
                    '[AD DEBUG][XHR DATA]',
                    arguments[0]
                );
            }

            return originalSend.apply(this, arguments);
        };

        proto.send.__adDebugHook = true;
        proto.send.__original = originalSend;

        log('XHR hooks installed');
    }


    // ========================================
    // VIDEO SRC
    // ========================================

    function hookVideoSrc() {

        const descriptor =
            Object.getOwnPropertyDescriptor(
                HTMLMediaElement.prototype,
                'src'
            );

        if (!descriptor || !descriptor.set) {
            log('video src descriptor not found');
            return;
        }

        if (descriptor.set.__adDebugHook) return;

        const originalSetter = descriptor.set;

        function newSetter(value) {

            if (suspicious(value)) {

                console.log(
                    '%c[AD DEBUG][VIDEO SRC]',
                    'font-weight:bold',
                    value
                );

                console.trace('[AD DEBUG] VIDEO SRC trace');
            }

            return originalSetter.call(this, value);
        }

        newSetter.__adDebugHook = true;
        newSetter.__original = originalSetter;

        Object.defineProperty(
            HTMLMediaElement.prototype,
            'src',
            {
                configurable: descriptor.configurable,
                enumerable: descriptor.enumerable,
                get: descriptor.get,
                set: newSetter
            }
        );

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

            if (src) {

                console.log(
                    '[AD DEBUG][VIDEO]',
                    'src =',
                    src
                );

                if (suspicious(src)) {

                    console.log(
                        '%c[AD DEBUG][!!! SUSPICIOUS VIDEO !!!]',
                        'font-weight:bold',
                        src
                    );

                    console.trace(
                        '[AD DEBUG] suspicious video trace'
                    );
                }
            }

            if (video.poster) {
                console.log(
                    '[AD DEBUG][VIDEO] poster =',
                    video.poster
                );
            }
        }

        check();

        video.addEventListener('loadstart', check);
        video.addEventListener('loadedmetadata', check);
        video.addEventListener('loadeddata', check);
        video.addEventListener('play', check);
        video.addEventListener('playing', check);
    }


    function scanVideos() {

        document
            .querySelectorAll('video, audio')
            .forEach(inspectVideo);
    }


    // ========================================
    // DOM OBSERVER
    // ========================================

    function startMutationObserver() {

        const observer = new MutationObserver(function (mutations) {

            mutations.forEach(function (mutation) {

                mutation.addedNodes.forEach(function (node) {

                    if (node.nodeType !== 1) return;

                    if (
                        node.tagName === 'VIDEO' ||
                        node.tagName === 'AUDIO'
                    ) {
                        console.log(
                            '%c[AD DEBUG][MEDIA ADDED]',
                            'font-weight:bold',
                            node
                        );

                        inspectVideo(node);
                    }


                    if (node.querySelectorAll) {

                        node
                            .querySelectorAll('video, audio')
                            .forEach(function (media) {

                                console.log(
                                    '[AD DEBUG][MEDIA FOUND IN NODE]',
                                    media
                                );

                                inspectVideo(media);
                            });
                    }


                    // Проверяем подозрительные классы
                    const elements = [];

                    if (node.className) {
                        elements.push(node);
                    }

                    if (node.querySelectorAll) {

                        node
                            .querySelectorAll('*')
                            .forEach(function (el) {

                                if (
                                    typeof el.className === 'string' &&
                                    el.className
                                ) {
                                    elements.push(el);
                                }
                            });
                    }


                    elements.forEach(function (el) {

                        const text =
                            String(el.className || '') +
                            ' ' +
                            String(el.id || '');

                        if (
                            /ad|advert|preroll|promo/i.test(text)
                        ) {

                            console.log(
                                '%c[AD DEBUG][AD-LIKE ELEMENT]',
                                'font-weight:bold',
                                el
                            );
                        }
                    });

                });

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

        const events = [
            'loadstart',
            'loadedmetadata',
            'loadeddata',
            'canplay',
            'play',
            'playing',
            'pause',
            'waiting',
            'ended',
            'error'
        ];

        events.forEach(function (eventName) {

            document.addEventListener(
                eventName,
                function (event) {

                    const target = event.target;

                    if (
                        target &&
                        (
                            target.tagName === 'VIDEO' ||
                            target.tagName === 'AUDIO'
                        )
                    ) {

                        const src =
                            target.currentSrc ||
                            target.src ||
                            '';

                        console.log(
                            '[AD DEBUG][MEDIA EVENT]',
                            eventName,
                            src,
                            target
                        );
                    }

                },
                true
            );

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

        if (Lampa.Player) {

            console.log(
                '[AD DEBUG] Lampa.Player methods:',
                Object.keys(Lampa.Player)
            );

            [
                'play',
                'programReady',
                'iptv',
                'playdata',
                'callback',
                'opened',
                'close'
            ].forEach(function (name) {

                if (typeof Lampa.Player[name] === 'function') {

                    console.log(
                        '[AD DEBUG] Lampa.Player.' +
                        name +
                        ':',
                        Lampa.Player[name].toString()
                    );
                }

            });
        }


        if (Lampa.Listener) {

            console.log(
                '[AD DEBUG] Lampa.Listener:',
                Object.keys(Lampa.Listener)
            );
        }
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
        }
        catch (e) {
            console.error(
                '[AD DEBUG] periodic error:',
                e
            );
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

        // Повторяем установку хуков,
        // если Lampa/CUB их перезапишет.
        setInterval(
            periodicCheck,
            2000
        );

        log('ALL DEBUG HOOKS STARTED');
    }


    // ========================================
    // Ждем Lampa
    // ========================================

    if (window.Lampa) {

        start();

    } else {

        let attempts = 0;

        const timer = setInterval(function () {

            attempts++;

            if (window.Lampa) {

                clearInterval(timer);
                start();

            }

            if (attempts >= 60) {

                clearInterval(timer);

                console.error(
                    '[AD DEBUG] Lampa not found'
                );

            }

        }, 1000);
    }

})();

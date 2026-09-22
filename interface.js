(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // Предотвращение повторной инициализации плагина
    if (window.plugin_interface_ready_v3) return;

    // Функция внедрения CSS-стилей
    function injectStyles() {
        if (injectStyles.loaded) return;
        injectStyles.loaded = true;

        var isWide = Lampa.Storage.get('style_interface') !== false;

        var css = isWide ? `
            .new-interface .card.card--wide { width: 18.3em; }
            .new-interface-info { padding: 1.5em; height: 26em; }
            .new-interface-info__body { width: 80%; }
            .new-interface-info__head { min-height: 1em; }
            .new-interface-info__head span { color: #fff; }
            .new-interface-info__title {
                font-size: 1.4em;
                font-weight: 310;
                margin-bottom: 0.3em;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                line-clamp: 1;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: '.';
            }
            .new-interface-info__details {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                min-height: 1.9em;
                margin-bottom: 0.2em;
            }
            .new-interface-info__split { margin: 0 1em; font-size: 0.7em; }
            .new-interface-info__description {
                font-size: 1.2em;
                font-weight: 310;
                line-height: 1.3;
                overflow: hidden;
                -o-text-overflow: '.';
                display: -webkit-box;
                -webkit-line-clamp: 3;
                line-clamp: 3;
                -webkit-box-orient: vertical;
            }
            .new-interface .card.card--small { padding-bottom: 95%; }
            .new-interface .full-start__background { top: -5em; }
            .new-interface .full-start__rate { margin-right: 0; }
            .new-interface .card__promo { display: none !important; }
            .new-interface .card.card--wide + .card-more .card-more__box { height: 17.4em; }
            .new-interface .card-more__box { height: 108%; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--small.focus .card__view { width: 69%; }
            .new-interface .card.card--wide .card-watched { height: 25.3em; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.focus .card__view { animation: animation-card-focus 0.2s; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.animate-trigger-enter .card__view { animation: animation-trigger-enter 0.2s forwards; }
            body.light--version .new-interface-info { color: rgba(255, 255, 255, 0.6); }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--small.animate-trigger-enter .card__view { animation: animation-trigger-enter 0.2s forwards; }
            body.light--version .new-interface-info__body { color: #fff; }
        ` : `
            .new-interface .card.card--wide { width: 18.3em; }
            .card .card__age, .card .card__title { display: none; }
            .new-interface-info { position: relative; padding: 1.5em; height: 17.4em; }
            .new-interface-info__body { width: 70%; padding-top: 1.1em; }
            .new-interface-info__head { display: flex; align-items: center; margin-bottom: 0.2em; }
            .new-interface-info__head span { font-size: 0.7em; }
            .new-interface-info__title {
                font-size: 3em;
                font-weight: 600;
                margin-bottom: 0.2em;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                line-clamp: 1;
                -webkit-box-orient: vertical;
                margin-left: -0.03em;
                overflow: hidden;
                text-overflow: '.';
            }
            .new-interface-info__details {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                min-height: 1.9em;
                font-size: 1.2em;
            }
            .new-interface-info__split { margin: 0 1em; font-size: 0.7em; }
            .new-interface-info__description {
                font-size: 1.3em;
                line-height: 1.3;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: '.';
            }
            .new-interface .card-more__box { padding-bottom: 150%; }
            .new-interface .full-start__background { top: -5em; }
            .new-interface .full-start__rate { margin-right: 0; }
            .new-interface .card__promo { display: none; }
            .new-interface .card.card--wide + .card-more .card-more__box { height: 17.4em; }
            .new-interface .card-more__box { height: 108%; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--small.focus .card__view { width: 69%; }
            .new-interface .card.card--wide .card-watched { height: 25.3em; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.focus .card__view { animation: animation-card-focus 0.2s; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.animate-trigger-enter .card__view { animation: animation-trigger-enter 0.2s forwards; }
            body.light--version .new-interface-info { color: rgba(255, 255, 255, 0.6); }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--small.animate-trigger-enter .card__view { animation: animation-trigger-enter 0.2s forwards; }
            body.light--version .new-interface-info__body { color: #fff; }
        `;

        Lampa.Template.add('new_interface_style_v3', css);
        $('head').append(Lampa.Template.get('new_interface_style_v3', {}, true));
    }

    // Компонент блока с информацией о фильме/сериале
    function InfoElement() {
        this.html = null;
        this.timer = null;
        this.network = new Lampa.Reguest();
        this.loaded = {};
        this.currentUrl = null;
    }

    InfoElement.prototype.create = function () {
        this.html = $(`
            <div class="new-interface-info">
                <div class="new-interface-info__body">
                    <div class="new-interface-info__head"></div>
                    <div class="new-interface-info__title"></div>
                    <div class="new-interface-info__details"></div>
                    <div class="new-interface-info__description"></div>
                </div>
            </div>
        `);
    };

    InfoElement.prototype.render = function (asNativeNode) {
        if (!this.html) this.create();
        return asNativeNode ? this.html[0] : this.html;
    };

    InfoElement.prototype.update = function (data) {
        if (!data || !this.html) return;

        this.html.find('.new-interface-info__head, .new-interface-info__details').empty();

        // Отображение логотипа вместо текста названия
        if (Lampa.Storage.get('logo_card_style') !== false) {
            var mediaType = data.name ? 'tv' : 'movie';
            var apiKey = Lampa.TMDB.key();
            var url = Lampa.TMDB.api(mediaType + '/' + data.id + '/images?api_key=' + apiKey + '&append_to_response=content_ratings,release_dates&language=' + Lampa.Storage.get('language'));
            var self = this;

            $.get(url, function (response) {
                if (response.logos && response.logos[0]) {
                    var filePath = response.logos[0].file_path;
                    if (filePath !== '') {
                        var imgUrl = Lampa.TMDB.img('t/p/w500' + filePath.replace('.svg', '.png'));
                        var logoHtml = '<img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 2.8em; max-width: 6.8em;" src="' + imgUrl + '" />';
                        self.html.find('.new-interface-info__title').html(logoHtml);
                    } else {
                        self.html.find('.new-interface-info__title').text(data.title || data.name || '');
                    }
                } else {
                    self.html.find('.new-interface-info__title').text(data.title || data.name || '');
                }
            });
        } else {
            this.html.find('.new-interface-info__title').text(data.title || data.name || '');
        }

        // Описание карточки
        if (Lampa.Storage.get('desc') !== false) {
            this.html.find('.new-interface-info__description').text(data.overview || Lampa.Lang.translate('full_notext'));
        }

        // Обновление заднего фона
        if (data.backdrop_path) {
            Lampa.Background.change(Lampa.TMDB.img(data.backdrop_path, 'w1280'));
        }

        // Загрузка подробной информации из TMDB
        this.loadDetails(data);
    };

    InfoElement.prototype.loadDetails = function (data) {
        if (!data || !data.id) return;

        var source = data.source || 'tmdb';
        if (source !== 'tmdb' && source !== 'cub') return;
        if (!Lampa.TMDB || typeof Lampa.TMDB.api !== 'function' || typeof Lampa.TMDB.key !== 'function') return;

        var mediaType = data.number_of_seasons || data.name || data.first_air_date ? 'tv' : 'movie';
        var lang = Lampa.Storage.get('language');
        var requestUrl = Lampa.TMDB.api(mediaType + '/' + data.id + '?api_key=' + Lampa.TMDB.key() + '&append_to_response=content_ratings,release_dates&language=' + lang);

        this.currentUrl = requestUrl;

        if (this.loaded[requestUrl]) {
            this.draw(this.loaded[requestUrl]);
            return;
        }

        clearTimeout(this.timer);
        var self = this;
        this.timer = setTimeout(function () {
            self.network.clear();
            self.network.timeout(5000);
            self.network.silent(requestUrl, function (res) {
                self.loaded[requestUrl] = res;
                if (self.currentUrl === requestUrl) {
                    self.draw(res);
                }
            });
        }, 300);
    };

    InfoElement.prototype.draw = function (res) {
        if (!res || !this.html) return;

        var year = ((res.release_date || res.first_air_date || '0000') + '').slice(0, 4);
        var rate = parseFloat((res.vote_average || 0) + '').toFixed(1);
        var headParts = [];
        var detailParts = [];

        var countries = Lampa.Utils.parseCountries(res);
        var pg = Lampa.Utils.parsePG(res);

        if (year !== '0000') headParts.push('<span>' + year + '</span>');
        if (countries.length > 0) headParts.push(countries.join(', '));

        if (Lampa.Storage.get('rat') !== false && rate > 0) {
            detailParts.push('<div class="full-start__rate"><div>' + rate + '</div><div>TMDB</div></div>');
        }

        if (Lampa.Storage.get('ganr') !== false && res.genres && res.genres.length > 0) {
            detailParts.push(res.genres.map(function (g) {
                return Lampa.Utils.capitalizeFirstLetter(g.name);
            }).join(' | '));
        }

        if (Lampa.Storage.get('vremya') !== false && res.runtime) {
            detailParts.push(Lampa.Utils.secondsToTime(res.runtime * 60, true));
        }

        if (Lampa.Storage.get('seas') !== false && res.number_of_seasons) {
            detailParts.push('<span class="full-start__pg" style="font-size: 0.9em;">Сезонов ' + res.number_of_seasons + '</span>');
        }

        if (Lampa.Storage.get('eps') !== false && res.number_of_episodes) {
            detailParts.push('<span class="full-start__pg" style="font-size: 0.9em;">Эпизодов ' + res.number_of_episodes + '</span>');
        }

        if (Lampa.Storage.get('year_ogr') !== false && pg) {
            detailParts.push('<span class="full-start__pg" style="font-size: 0.9em;">' + pg + '</span>');
        }

        if (Lampa.Storage.get('status') !== false && res.status) {
            var statusText = '';
            switch (res.status.toLowerCase()) {
                case 'in production': statusText = 'В производстве'; break;
                case 'ended': statusText = 'Закончен'; break;
                case 'returning series': statusText = 'Онгоинг'; break;
                case 'canceled': statusText = 'Отменено'; break;
                case 'planned': statusText = 'Запланировано'; break;
                case 'released': statusText = 'Выпущенный'; break;
                case 'post production': statusText = 'Скоро'; break;
                default: statusText = res.status; break;
            }
            if (statusText) {
                detailParts.push('<span class="full-start__status" style="font-size: 0.9em;">' + statusText + '</span>');
            }
        }

        this.html.find('.new-interface-info__head').empty().html(headParts.join(', '));
        this.html.find('.new-interface-info__details').html(detailParts.join('<span class="new-interface-info__split">&#9679;</span>'));
    };

    InfoElement.prototype.empty = function () {
        if (!this.html) return;
        this.html.find('.new-interface-info__head, .new-interface-info__details').empty();
    };

    InfoElement.prototype.destroy = function () {
        clearTimeout(this.timer);
        this.network.clear();
        this.loaded = {};
        this.currentUrl = null;
        if (this.html) {
            this.html.remove();
            this.html = null;
        }
    };

    // Вспомогательные функции управления состоянием
    function shouldEnable(object) {
        if (!object) return false;
        if (window.innerWidth < 767) return false;
        if (Lampa.Platform.is && Lampa.Platform.is('mobile')) return false;
        if (object.title === 'Избранное') return false;
        return true;
    }

    function getOrCreateInfoState(main) {
        if (main.__newInterfaceState) return main.__newInterfaceState;
        var state = createInterfaceController(main);
        main.__newInterfaceState = state;
        return state;
    }

    function createInterfaceController(main) {
        var info = new InfoElement();
        info.create();

        var backgroundImg = document.createElement('img');
        backgroundImg.className = 'full-start__background';

        var controller = {
            main: main,
            info: info,
            background: backgroundImg,
            infoElement: null,
            backgroundTimer: null,
            backgroundLast: '',
            attached: false,
            attach: function () {
                if (this.attached) return;
                var renderEl = main.render(true);
                if (!renderEl) return;

                renderEl.classList.add('new-interface');

                if (!backgroundImg.parentNode) {
                    renderEl.insertBefore(backgroundImg, renderEl.firstChild || null);
                }

                var infoNode = info.render(true);
                this.infoElement = infoNode;

                if (infoNode && infoNode.parentNode !== renderEl) {
                    if (backgroundImg.parentNode === renderEl) {
                        renderEl.insertBefore(infoNode, backgroundImg.nextSibling);
                    } else {
                        renderEl.insertBefore(infoNode, renderEl.firstChild || null);
                    }
                }

                if (main.scroll && typeof main.scroll.append === 'function') {
                    main.scroll.append(infoNode);
                }
                this.attached = true;
            },
            update: function (cardData) {
                if (!cardData) return;
                info.update(cardData);
                this.updateBackground(cardData);
            },
            updateBackground: function (cardData) {
                var bgPath = cardData && cardData.backdrop_path ? Lampa.TMDB.img(cardData.backdrop_path, 'w1280') : '';
                if (!bgPath || bgPath === this.backgroundLast) return;

                clearTimeout(this.backgroundTimer);
                var self = this;
                this.backgroundTimer = setTimeout(function () {
                    backgroundImg.classList.remove('loaded');
                    backgroundImg.onload = function () { backgroundImg.classList.add('loaded'); };
                    backgroundImg.onerror = function () { backgroundImg.classList.remove('loaded'); };
                    self.backgroundLast = bgPath;
                    setTimeout(function () { backgroundImg.src = self.backgroundLast; }, 50);
                }, 100);
            },
            reset: function () {
                info.empty();
            },
            destroy: function () {
                clearTimeout(this.backgroundTimer);
                info.destroy();
                var renderEl = main.render(true);
                if (renderEl) renderEl.classList.remove('new-interface');
                if (this.infoElement && this.infoElement.parentNode) {
                    this.infoElement.parentNode.removeChild(this.infoElement);
                }
                if (backgroundImg && backgroundImg.parentNode) {
                    backgroundImg.parentNode.removeChild(backgroundImg);
                }
                this.attached = false;
            }
        };

        return controller;
    }

    function bindCardEvents(controller, card) {
        if (!card || card.__newInterfaceCard || typeof card.render !== 'function' || !card.data) return;
        card.__newInterfaceCard = true;
        card.params = card.params || {};
        card.params.style = card.params.style || {};

        if (!card.params.style.name) {
            card.params.style.name = Lampa.Storage.get('style_interface') !== false ? 'wide' : 'small';
        }

        card.render({
            onFocus: function () { controller.update(card.data); },
            onHover: function () { controller.update(card.data); },
            onTouch: function () { controller.update(card.data); },
            onDestroy: function () { delete card.__newInterfaceCard; }
        });
    }

    function extractCardData(activeItem, activeGroup, index) {
        index = index || 0;
        if (activeItem && activeItem.data) return activeItem.data;
        if (activeGroup && Array.isArray(activeGroup.results)) {
            return activeGroup.results[index] || activeGroup.results[0];
        }
        return null;
    }

    function findCardDataFromElement(elem) {
        if (!elem) return null;
        var target = elem && elem.length ? elem[0] : elem;
        while (target && !target.card_data) {
            target = target.parentNode;
        }
        return target && target.card_data ? target.card_data : null;
    }

    function getActiveCardData(line) {
        var el = line && typeof line.render === 'function' ? line.render(true) : null;
        if (!el || !el.querySelector) return null;
        var focused = el.querySelector('.selector.focus') || el.querySelector('.focus');
        return findCardDataFromElement(focused);
    }

    function hookLineEvents(main, line, params) {
        if (line.__newInterfaceLine) return;
        line.__newInterfaceLine = true;

        var state = getOrCreateInfoState(main);
        var attachCard = function (c) { bindCardEvents(state, c); };

        line.render({
            onInstance: function (inst) { attachCard(inst); },
            onActive: function (activeItem, activeGroup) {
                var cardData = extractCardData(activeItem, activeGroup);
                if (cardData) state.update(cardData);
            },
            onToggle: function () {
                setTimeout(function () {
                    var cardData = getActiveCardData(line);
                    if (cardData) state.update(cardData);
                }, 32);
            },
            onMore: function () { state.reset(); },
            onDestroy: function () {
                state.destroy();
                delete line.__newInterfaceLine;
            }
        });

        if (Array.isArray(line.items) && line.items.length) {
            line.items.forEach(attachCard);
        }

        if (line.firstChild) {
            var cardData = findCardDataFromElement(line.firstChild);
            if (cardData) state.update(cardData);
        }
    }

    function hookMakerMethod(target, method, wrapper) {
        if (!target) return;
        var original = typeof target[method] === 'function' ? target[method] : null;
        target[method] = function () {
            var args = Array.prototype.slice.call(arguments);
            return wrapper.call(this, original, args);
        };
    }

    // Инициализация плагина и перехват методов Lampa.Maker
    function initPlugin() {
        if (window.plugin_interface_ready_v3) return;
        window.plugin_interface_ready_v3 = true;

        injectStyles();
        setupSettings();

        var mainMaker = Lampa.Maker.map('Main');
        if (!mainMaker || !mainMaker.onInit || !mainMaker.onCreate) return;

        hookMakerMethod(mainMaker.onInit, 'onInit', function (orig, args) {
            if (orig) orig.apply(this, args);
            this.__newInterfaceEnabled = shouldEnable(this && this.object);
        });

        hookMakerMethod(mainMaker.onCreate, 'onCreate', function (orig, args) {
            if (orig) orig.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            var state = getOrCreateInfoState(this);
            state.attach();
        });

        hookMakerMethod(mainMaker.Create, 'onCreateAndAppend', function (orig, args) {
            var line = args && args[0];
            if (this.__newInterfaceEnabled && line && Array.isArray(line.items)) {
                Lampa.Items.extendItemsParams(line.items, {
                    style: { name: Lampa.Storage.get('style_interface') !== false ? 'wide' : 'small' }
                });
            }
            return orig ? orig.apply(this, args) : undefined;
        });

        hookMakerMethod(mainMaker.onInit, 'onAppend', function (orig, args) {
            if (orig) orig.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            var line = args && args[0];
            var params = args && args[1];
            if (line && params) hookLineEvents(this, line, params);
        });

        hookMakerMethod(mainMaker.onInit, 'onDestroy', function (orig, args) {
            if (this.__newInterfaceState) {
                this.__newInterfaceState.destroy();
                delete this.__newInterfaceState;
            }
            delete this.__newInterfaceEnabled;
            if (orig) orig.apply(this, args);
        });
    }

    function setDefaultSettings() {
        Lampa.Storage.set('new_interface_style_v3', 'true');
        Lampa.Storage.set('wide_post', 'true');
        Lampa.Storage.set('style_interface', 'true');
        Lampa.Storage.set('logo_card_style', 'true');
        Lampa.Storage.set('status', 'true');
        Lampa.Storage.set('seas', 'false');
        Lampa.Storage.set('eps', 'false');
        Lampa.Storage.set('year_ogr', 'true');
        Lampa.Storage.set('vremya', 'true');
        Lampa.Storage.set('desc', 'true');
        Lampa.Storage.set('rat', 'true');
    }

    // Регистрация меню и параметров в настройках Lampa
    function setupSettings() {
        Lampa.Activity.listener.follow('change', function (e) {
            if (e.name === 'main') {
                if (Lampa.Activity.active().render().find('.new-interface-info').length === 0) {
                    Lampa.SettingsApi.addComponent({
                        component: 'style_interface',
                        name: 'Стильный интерфейс'
                    });
                }
                Lampa.Activity.active().update();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'style_interface', type: 'trigger', default: true },
            field: { name: 'Стильный интерфейс', description: 'Настройки элементов' },
            onRender: function (item) {
                setTimeout(function () {
                    $('.settings-param > div:contains("Стильный интерфейс")').parent().insertAfter($('[data-component="style_interface"]'));
                }, 20);

                item.on('hover:enter', function () {
                    Lampa.Settings.open('style_interface');
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: { name: 'style_interface', type: 'trigger', default: true },
            field: { name: 'Широкие постеры' }
        });

        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: { name: 'logo_card_style', type: 'trigger', default: true },
            field: { name: 'Логотип вместо названия' }
        });

        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: { name: 'status', type: 'trigger', default: true },
            field: { name: 'Показывать статус фильма/сериала' }
        });

        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: { name: 'seas', type: 'trigger', default: false },
            field: { name: 'Показывать количество сезонов' }
        });

        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: { name: 'eps', type: 'trigger', default: false },
            field: { name: 'Показывать количество эпизодов' }
        });

        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: { name: 'year_ogr', type: 'trigger', default: true },
            field: { name: 'Показывать возрастное ограничение' }
        });

        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: { name: 'vremya', type: 'trigger', default: true },
            field: { name: 'Показывать время фильма' }
        });

        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: { name: 'ganr', type: 'trigger', default: true },
            field: { name: 'Показывать жанр фильма' }
        });

        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: { name: 'rat', type: 'trigger', default: true },
            field: { name: 'Показывать рейтинг фильма' }
        });

        var checkTimer = setInterval(function () {
            if (typeof Lampa !== 'undefined') {
                clearInterval(checkTimer);
                if (!Lampa.Storage.get('new_interface_style_v3', false)) {
                    setDefaultSettings();
                }
            }
        }, 200);
    }

    initPlugin();
})();

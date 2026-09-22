(function () {
    'use strict';

    Lampa.Platform.tv();

    if (typeof Lampa === 'undefined') return;

    function initPlugin() {
      

        if (!Lampa.Maker || !Lampa.Maker.map || !Lampa.Storage) return;
        if (window.plugin_interface_ready_v3) return;

        window.plugin_interface_ready_v3 = true;

        injectStyles();
        registerSettings();

        var MainComponent = Lampa.Maker.map('Main');
        if (!MainComponent || !MainComponent.prototype || !MainComponent.constructor) return;

        // Перехват методов интерфейса
        patchMethod(MainComponent.prototype, 'onInit', function (origMethod, args) {
            if (origMethod) origMethod.apply(this, args);
            this.__newInterfaceEnabled = isInterfaceAllowed(this && this.object);
        });

        patchMethod(MainComponent.constructor, 'onCreate', function (origMethod, args) {
            if (origMethod) origMethod.apply(this, args);
            if (!this.__newInterfaceEnabled) return;

            var interfaceManager = getOrCreateInfoManager(this);
            interfaceManager.attach();
        });

        patchMethod(MainComponent.constructor, 'extendItemsParams', function (origMethod, args) {
            var firstArg = args && args[0];
            if (this.__newInterfaceEnabled && firstArg) {
                applyCardStyle(firstArg);
            }
            return origMethod ? origMethod.apply(this, args) : undefined;
        });

        patchMethod(MainComponent.prototype, 'onAppend', function (origMethod, args) {
            if (origMethod) origMethod.apply(this, args);
            if (!this.__newInterfaceEnabled) return;

            var card = args && args[0];
            var container = args && args[1];
            if (card && container) {
                bindCardEvents(this, card, container);
            }
        });

        patchMethod(MainComponent.prototype, 'onDestroy', function (origMethod, args) {
            if (this.__newInterfaceLine) {
                this.__newInterfaceLine.destroy();
                delete this.__newInterfaceLine;
            }
            delete this.__newInterfaceEnabled;
            if (origMethod) origMethod.apply(this, args);
        });
    }

    // Проверка, можно ли отображать интерфейс (разрешение экрана, разделы)
    function isInterfaceAllowed(object) {
        if (!object) return false;
        if (window.innerWidth < 767) return false;
        if (Lampa.Platform.is('mobile')) return false;
        if (object.title === 'Избранное') return false;
        return true;
    }

    function getOrCreateInfoManager(mainInstance) {
        if (mainInstance.__newInterfaceLine) return mainInstance.__newInterfaceLine;
        var manager = createInfoManager(mainInstance);
        mainInstance.__newInterfaceLine = manager;
        return manager;
    }

    // Управление блоком информации и фоновым изображением
    function createInfoManager(mainInstance) {
        var infoCard = new InfoCardComponent();
        infoCard.create();

        var backgroundElem = document.createElement('img');
        backgroundElem.className = 'full-start__background';

        var manager = {
            main: mainInstance,
            info: infoCard,
            background: backgroundElem,
            infoElement: null,
            backgroundTimer: null,
            backgroundLast: '',
            attached: false,

            attach: function () {
                if (this.attached) return;
                var renderElem = mainInstance.render(true);
                if (!renderElem) return;

                renderElem.classList.add('new-interface');

                if (!backgroundElem.parentNode) {
                    renderElem.insertBefore(backgroundElem, renderElem.firstChild || null);
                }

                var infoElem = infoCard.render(true);
                this.infoElement = infoElem;

                if (infoElem && infoElem.parentNode !== renderElem) {
                    if (backgroundElem.parentNode === renderElem) {
                        renderElem.insertBefore(infoElem, backgroundElem.nextSibling);
                    } else {
                        renderElem.insertBefore(infoElem, renderElem.firstChild || null);
                    }
                }

                mainInstance.scroll.add(infoElem);
                this.attached = true;
            },

            update: function (cardData) {
                if (!cardData) return;
                infoCard.update(cardData);
                this.updateBackground(cardData);
            },

            updateBackground: function (cardData) {
                var bgUrl = cardData && cardData.backdrop_path 
                    ? Lampa.TMDB.img(cardData.backdrop_path, 'w1280') 
                    : '';

                if (!bgUrl || bgUrl === this.backgroundLast) return;

                clearTimeout(this.backgroundTimer);
                var self = this;

                this.backgroundTimer = setTimeout(function () {
                    backgroundElem.classList.remove('loaded');
                    backgroundElem.onload = function () {
                        backgroundElem.classList.add('loaded');
                    };
                    backgroundElem.onerror = function () {
                        backgroundElem.classList.remove('loaded');
                    };
                    self.backgroundLast = bgUrl;

                    setTimeout(function () {
                        backgroundElem.src = self.backgroundLast;
                    }, 50);
                }, 100);
            },

            reset: function () {
                infoCard.empty();
            },

            destroy: function () {
                clearTimeout(this.backgroundTimer);
                infoCard.destroy();

                var renderElem = mainInstance.render(true);
                if (renderElem) {
                    renderElem.classList.remove('new-interface');
                }

                if (this.infoElement && this.infoElement.parentNode) {
                    this.infoElement.parentNode.removeChild(this.infoElement);
                }
                if (backgroundElem && backgroundElem.parentNode) {
                    backgroundElem.parentNode.removeChild(backgroundElem);
                }

                this.attached = false;
            }
        };

        return manager;
    }

    function applyCardStyle(item) {
        if (!item) return;
        if (Array.isArray(item.items)) {
            Lampa.Storage.set(item.items, {
                'style': {
                    'name': Lampa.Storage.get('style_interface') !== false ? 'wide' : 'small'
                }
            });
        }
    }

    function setupCardListeners(infoManager, cardInstance) {
        if (!cardInstance || cardInstance.__newInterfaceCard || typeof cardInstance.onFocus !== 'function' || !cardInstance.data) return;

        cardInstance.__newInterfaceCard = true;
        cardInstance.params = cardInstance.params || {};
        cardInstance.params.style = cardInstance.params.style || {};

        if (!cardInstance.params.style.name) {
            cardInstance.params.style.name = Lampa.Storage.get('style_interface') !== false ? 'wide' : 'small';
        }

        cardInstance.onFocus({
            'onFocus': function () {
                infoManager.update(cardInstance.data);
            },
            'onHover': function () {
                infoManager.update(cardInstance.data);
            },
            'onTouch': function () {
                infoManager.update(cardInstance.data);
            },
            'onDestroy': function () {
                delete cardInstance.__newInterfaceCard;
            }
        });
    }

    function getCardData(item, itemsContainer, index) {
        index = index || 0;
        if (item && item.data) return item.data;
        if (itemsContainer && Array.isArray(itemsContainer.results)) {
            return itemsContainer.results[index] || itemsContainer.results[0];
        }
        return null;
    }

    function extractCardData(element) {
        if (!element) return null;
        var target = element && element.length ? element[0] : element;

        while (target && !target.card_data) {
            target = target.parentNode;
        }
        return target && target.card_data ? target.card_data : null;
    }

    function getFocusedCardData(container) {
        var rendered = container && typeof container.render === 'function' ? container.render(true) : null;
        if (!rendered || !rendered.querySelector) return null;

        var focusElem = rendered.querySelector('.selector.focus') || rendered.querySelector('.focus');
        return extractCardData(focusElem);
    }

    function bindCardEvents(mainInstance, container, options) {
        if (container.__newInterfaceEnabled) return;
        container.__newInterfaceEnabled = true;

        var infoManager = getOrCreateInfoManager(mainInstance);
        var bindCallback = function (card) {
            setupCardListeners(infoManager, card);
        };

        container.onFocus({
            'onInstance': function (instance) {
                bindCallback(instance);
            },
            'onActive': function (activeItem, containerData) {
                var cardData = getCardData(activeItem, containerData);
                if (cardData) infoManager.update(cardData);
            },
            'onToggle': function () {
                setTimeout(function () {
                    var focusedData = getFocusedCardData(container);
                    if (focusedData) infoManager.update(focusedData);
                }, 32);
            },
            'onMore': function () {
                infoManager.reset();
            },
            'onDestroy': function () {
                infoManager.destroy();
                delete container.__newInterfaceEnabled;
            }
        });

        if (Array.isArray(container.items) && container.items.length) {
            container.items.forEach(bindCallback);
        }

        if (container.object) {
            var cardData = extractCardData(container.object);
            if (cardData) infoManager.update(cardData);
        }
    }

    function patchMethod(target, methodName, wrapper) {
        if (!target) return;
        var original = typeof target[methodName] === 'function' ? target[methodName] : null;

        target[methodName] = function () {
            var args = Array.prototype.slice.call(arguments);
            return wrapper.call(this, original, args);
        };
    }

    // Внедрение CSS-стилей интерфейса
    function injectStyles() {
        if (injectStyles.added) return;
        injectStyles.added = true;

        var isWide = Lampa.Storage.get('style_interface') !== false;

        var cssStyles = isWide ? `
            .new-interface .card.card--wide { width: 18.3em; }
            .new-interface-info { position: relative; padding: 1.5em; height: 26em; }
            .new-interface-info__body { width: 80%; display: flex; flex-wrap: wrap; }
            .new-interface-info__head { display: flex; align-items: center; min-height: 1em; }
            .new-interface-info__head span { color: #fff; }
            .new-interface-info__title { font-size: 4em; font-weight: 600; margin-bottom: 0.2em; display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; -o-text-overflow: '.'; text-overflow: '.'; }
            .new-interface-info__details { font-size: 1.3em; display: flex; flex-wrap: wrap; margin-bottom: 0.3em; min-height: 1.9em; }
            .new-interface-info__split { margin: 0 1em; font-size: 0.7em; }
            .new-interface-info__description { font-size: 1.2em; color: rgba(255, 255, 255, 0.6); line-height: 1.3; overflow: hidden; -o-text-overflow: '.'; text-overflow: '.'; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; }
            .new-interface .card-more__box { padding-bottom: 95%; }
            .new-interface .full-start__background { top: -5em; }
            .new-interface .full-start__rate { display: flex; align-items: center; }
            .new-interface .card__promo { display: none !important; }
            .new-interface .card.card--wide .card-watched { display: none; }
            .new-interface .card.card--wide + .card-more .card-more__box { width: 69%; height: 17.4em; }
            .new-interface .card.card--small { height: 25.3em; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.focus .card__view { animation: animation-card-focus 0.2s; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.animate-trigger-enter .card__view { animation: animation-trigger-enter 0.2s forwards; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--small.focus .card__view { animation: animation-card-focus 0.2s; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--small.animate-trigger-enter .card__view { animation: animation-trigger-enter 0.2s forwards; }
            body.light--version .new-interface-info { color: #fff; }
            body.light--version .new-interface-info__body { width: 80%; }
        ` : `
            .new-interface .card.card--wide { width: 18.3em; }
            .card .card__age, .card .card__title { display: none; }
            .new-interface-info { position: relative; padding: 1.5em; height: 108%; }
            .new-interface-info__body { width: 70%; padding-top: 1.1em; }
            .new-interface-info__head { display: flex; align-items: center; min-height: 1em; padding-top: 0.2em; }
            .new-interface-info__head span { color: rgba(255, 255, 255, 0.6); }
            .new-interface-info__title { font-size: 3em; font-weight: 600; margin-bottom: 0.2em; display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical; margin-left: -0.03em; overflow: hidden; -o-text-overflow: '.'; text-overflow: '.'; }
            .new-interface-info__details { font-size: 1.4em; display: flex; flex-wrap: wrap; margin-bottom: 0.3em; min-height: 1.9em; font-size: 1.2em; }
            .new-interface-info__split { margin: 0 1em; font-size: 0.7em; }
            .new-interface-info__description { font-size: 1.3em; color: rgba(255, 255, 255, 0.6); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; -o-text-overflow: '.'; text-overflow: '.'; }
            .new-interface .card-more__box { padding-bottom: 150%; }
            .new-interface .full-start__background { top: -5em; }
            .new-interface .full-start__rate { display: flex; align-items: center; }
            .new-interface .card__promo { display: none; }
            .new-interface .card.card--wide + .card-more .card-more__box { width: 69%; height: 17.4em; }
            .new-interface .card.card--small { height: 25.3em; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.focus .card__view { animation: animation-card-focus 0.2s; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.animate-trigger-enter .card__view { animation: animation-trigger-enter 0.2s forwards; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--small.focus .card__view { animation: animation-card-focus 0.2s; }
            body.advanced--animation:not(.no--animation) .new-interface .card.card--small.animate-trigger-enter .card__view { animation: animation-trigger-enter 0.2s forwards; }
            body.light--version .new-interface-info__body { width: 80%; }
        `;

        Lampa.Template.add('new_interface_style_v3', cssStyles);
        $('body').append(Lampa.Template.get('new_interface_style_v3', {}, true));
    }

    // Компонент инфо-карточки (заголовок, логотип, жанры, рейтинг, описание)
    function InfoCardComponent() {
        this.html = null;
        this.timer = null;
        this.network = new Lampa.Reguest();
        this.loaded = {};
        this.currentUrl = null;
    }

    InfoCardComponent.prototype.create = function () {
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

    InfoCardComponent.prototype.render = function (asNative) {
        if (!this.html) this.create();
        return asNative ? this.html[0] : this.html;
    };

    InfoCardComponent.prototype.update = function (data) {
        if (!data || !this.html) return;

        this.html.find('.new-interface-info__head,.new-interface-info__details').removeClass('hide');

        // Загрузка логотипа фильма/сериала вместо текста
        if (Lampa.Storage.get('logo_card_style') !== false) {
            var mediaType = data.number_of_seasons ? 'tv' : 'movie';
            var apiKey = Lampa.TMDB.key();
            var url = Lampa.TMDB.api(mediaType + '/' + data.id + '/images?api_key=' + apiKey + '&append_to_response=content_ratings,release_dates&language=' + Lampa.Storage.get('language'));
            var self = this;

            $.get(url, function (res) {
                if (res.logos && res.logos[0]) {
                    var logoPath = res.logos[0].file_path;
                    if (logoPath !== '') {
                        var isPng = Lampa.Storage.get('logo_card_style') !== false;
                        var imgTag = isPng 
                            ? '<img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 2.8em; max-width: 6.8em;" src="' + Lampa.TMDB.img('t/p/w500' + logoPath.replace('.svg', '.png')) + '" />'
                            : '<img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 1.8em; max-width: 6.8em;" src="' + Lampa.TMDB.img('t/p/w500' + logoPath.replace(/(((.+)+)+)+$/, '.png')) + '" />';
                        
                        self.html.find('.new-interface-info__title').html(imgTag);
                    } else {
                        self.html.find('.new-interface-info__title').removeClass().text(data.title || data.name || '');
                    }
                } else {
                    self.html.find('.new-interface-info__title').text(data.title || data.name || '');
                }
            });
        } else {
            this.html.find('.new-interface-info__title').text(data.title || data.name || '');
        }

        // Описание
        if (Lampa.Storage.get('desc') !== false) {
            this.html.find('.new-interface-info__description').text(data.overview || Lampa.Lang.translate('full_notext'));
        }

        // Фоновый постер
        Lampa.Background.change(Lampa.TMDB.img(data.backdrop_path, 'w1280'));

        // Загрузка детальной информации (рейтинг, время, статусы)
        this.fetchDetails(data);
    };

    InfoCardComponent.prototype.fetchDetails = function (data) {
        if (!data || !data.id) return;

        var source = data.source || 'tmdb';
        if (source !== 'tmdb' && source !== 'cub') return;
        if (!Lampa.TMDB || typeof Lampa.TMDB.api !== 'function' || typeof Lampa.TMDB.key !== 'function') return;

        var mediaType = data.media_type === 'tv' || data.number_of_seasons ? 'tv' : 'movie';
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
            self.network.silent(requestUrl, function (response) {
                self.loaded[requestUrl] = response;
                if (self.currentUrl === requestUrl) {
                    self.draw(response);
                }
            });
        }, 300);
    };

    InfoCardComponent.prototype.draw = function (details) {
        if (!details || !this.html) return;

        var releaseYear = ((details.release_date || details.first_air_date || '0000') + '').slice(0, 4);
        var rating = parseFloat((details.vote_average || 0) + '').toFixed(1);
        var headParts = [];
        var detailParts = [];

        var countries = Lampa.Utils.parseCountries(details);
        var pgRating = Lampa.Utils.parsePG(details);

        if (releaseYear !== '0000') headParts.push('<span>' + releaseYear + '</span>');
        if (countries.length > 0) headParts.push(countries.join(', '));

        // Рейтинг
        if (Lampa.Storage.get('rat') !== false && rating > 0) {
            detailParts.push('<div class="full-start__rate"><div>' + rating + '</div><div>TMDB</div></div>');
        }

        // Жанры
        if (Lampa.Storage.get('ganr') !== false && details.genres && details.genres.length > 0) {
            detailParts.push(details.genres.map(function (g) {
                return Lampa.Utils.capitalizeFirstLetter(g.name);
            }).join(' | '));
        }

        // Длительность
        if (Lampa.Storage.get('vremya') !== false && details.runtime) {
            detailParts.push(Lampa.Utils.secondsToTime(details.runtime * 60, true));
        }

        // Сезоны / Эпизоды
        if (Lampa.Storage.get('seas') !== false && details.number_of_seasons) {
            detailParts.push('<span class="full-start__pg" style="font-size: 0.9em;">Сезонов ' + details.number_of_seasons + '</span>');
        }
        if (Lampa.Storage.get('eps') !== false && details.number_of_episodes) {
            detailParts.push('<span class="full-start__pg" style="font-size: 0.9em;">Эпизодов ' + details.number_of_episodes + '</span>');
        }

        // Возрастное ограничение
        if (Lampa.Storage.get('year_ogr') !== false && pgRating) {
            detailParts.push('<span class="full-start__pg" style="font-size: 0.9em;">' + pgRating + '</span>');
        }

        // Статус (выпущен, онгоинг, отменён и т.д.)
        if (Lampa.Storage.get('status') !== false && details.status) {
            var statusText = '';
            switch (details.status.toLowerCase()) {
                case 'released': statusText = 'Выпущенный'; break;
                case 'ended': statusText = 'Закончен'; break;
                case 'returning series': statusText = 'Онгоинг'; break;
                case 'canceled': statusText = 'Отменено'; break;
                case 'planned': statusText = 'Запланировано'; break;
                case 'in production': statusText = 'В производстве'; break;
                case 'post production': statusText = 'Скоро'; break;
                default: statusText = details.status; break;
            }
            if (statusText) {
                detailParts.push('<span class="full-start__status" style="font-size: 0.9em;">' + statusText + '</span>');
            }
        }

        this.html.find('.new-interface-info__head').empty().append(headParts.join(', '));
        this.html.find('.new-interface-info__details').html(detailParts.join('<span class="new-interface-info__split">&#9679;</span>'));
    };

    InfoCardComponent.prototype.empty = function () {
        if (!this.html) return;
        this.html.find('.new-interface-info__head,.new-interface-info__details').addClass('hide');
    };

    InfoCardComponent.prototype.destroy = function () {
        clearTimeout(this.timer);
        this.network.clear();
        this.loaded = {};
        this.currentUrl = null;
        if (this.html) {
            this.html.remove();
            this.html = null;
        }
    };

    // Регистрация настроек плагина в меню Lampa
    function registerSettings() {
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'main') {
                if (Lampa.Settings.main().render().find('[data-component="style_interface"]').length === 0) {
                    Lampa.SettingsApi.addComponent({
                        'component': 'style_interface',
                        'name': 'Стильный интерфейс'
                    });
                }
                Lampa.Settings.main().update();
                Lampa.Settings.main().render().find('[data-component="style_interface"]').insertBefore('.settings-param > div:contains("Стильный интерфейс")');
            }
        });

        // Тумблеры настроек
        Lampa.SettingsApi.addParam({
            'component': 'interface',
            'param': { 'name': 'style_interface', 'type': 'trigger', 'default': true },
            'field': { 'name': 'Стильный интерфейс', 'description': 'Настройки элементов' },
            'onRender': function (item) {
                setTimeout(function () {
                    $('.settings-param > div:contains("Стильный интерфейс")').parent().insertAfter($('#int_plug'));
                }, 20);
                item.on('hover:enter', function () {
                    Lampa.Settings.create('style_interface');
                    Lampa.Controller.enabled().controller.back = function () {
                        Lampa.Settings.create('interface');
                    };
                });
            }
        });

        Lampa.SettingsApi.addParam({
            'component': 'style_interface',
            'param': { 'name': 'wide_post', 'type': 'trigger', 'default': true },
            'field': { 'name': 'Широкие постеры' }
        });

        Lampa.SettingsApi.addParam({
            'component': 'style_interface',
            'param': { 'name': 'logo_card_style', 'type': 'trigger', 'default': true },
            'field': { 'name': 'Логотип вместо названия' }
        });

        Lampa.SettingsApi.addParam({
            'component': 'style_interface',
            'param': { 'name': 'desc', 'type': 'trigger', 'default': true },
            'field': { 'name': 'Показывать описание' }
        });

        Lampa.SettingsApi.addParam({
            'component': 'style_interface',
            'param': { 'name': 'status', 'type': 'trigger', 'default': true },
            'field': { 'name': 'Показывать статус фильма/сериала' }
        });

        Lampa.SettingsApi.addParam({
            'component': 'style_interface',
            'param': { 'name': 'seas', 'type': 'trigger', 'default': false },
            'field': { 'name': 'Показывать количество сезонов' }
        });

        Lampa.SettingsApi.addParam({
            'component': 'style_interface',
            'param': { 'name': 'eps', 'type': 'trigger', 'default': false },
            'field': { 'name': 'Показывать количество эпизодов' }
        });

        Lampa.SettingsApi.addParam({
            'component': 'style_interface',
            'param': { 'name': 'year_ogr', 'type': 'trigger', 'default': true },
            'field': { 'name': 'Показывать возрастное ограничение' }
        });

        Lampa.SettingsApi.addParam({
            'component': 'style_interface',
            'param': { 'name': 'vremya', 'type': 'trigger', 'default': true },
            'field': { 'name': 'Показывать время фильма' }
        });

        Lampa.SettingsApi.addParam({
            'component': 'style_interface',
            'param': { 'name': 'ganr', 'type': 'trigger', 'default': true },
            'field': { 'name': 'Показывать жанр фильма' }
        });

        Lampa.SettingsApi.addParam({
            'component': 'style_interface',
            'param': { 'name': 'rat', 'type': 'trigger', 'default': true },
            'field': { 'name': 'Показывать рейтинг фильма' }
        });

        // Установка значений по умолчанию при первом запуске
        var initCheck = setInterval(function () {
            if (typeof Lampa !== 'undefined') {
                clearInterval(initCheck);
                if (!Lampa.Storage.get('plugin_interface_ready_v3', 'false')) {
                    setDefaultSettings();
                }
            }
        }, 200);

        function setDefaultSettings() {
            Lampa.Storage.set('plugin_interface_ready_v3', 'true');
            Lampa.Storage.set('wide_post', 'true');
            Lampa.Storage.set('logo_card_style', 'true');
            Lampa.Storage.set('desc', 'true');
            Lampa.Storage.set('status', 'true');
            Lampa.Storage.set('seas', 'false');
            Lampa.Storage.set('eps', 'false');
            Lampa.Storage.set('year_ogr', 'true');
            Lampa.Storage.set('vremya', 'true');
            Lampa.Storage.set('ganr', 'true');
            Lampa.Storage.set('rat', 'true');
        }
    }

    if (!window.plugin_interface_ready_v3) {
        initPlugin();
    }
})();

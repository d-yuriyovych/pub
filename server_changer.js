(function () {
    'use strict';

    var servers = [
        { name: 'Lampa (MX)', url: 'http://lampa.mx' },
        { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
        { name: 'Lampa (NNMTV)', url: 'http://nnmtv.pw' },
        { name: 'Lampa (VIP)', url: 'http://lampa.vip' }
    ];

    function ServerSwitcher() {
        var _this = this;

        this.cleanUrl = function(url) {
            return url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase() : '';
        };

        this.getCurrent = function() {
            var fromStorage = Lampa.Storage.get('source');
            if (fromStorage) return _this.cleanUrl(fromStorage);
            return _this.cleanUrl(window.location.origin);
        };

        this.checkStatus = function (url, callback) {
            var img = new Image(); // Надійний метод перевірки без CORS помилок
            img.onload = function() { callback(true); };
            img.onerror = function() { callback(false); };
            img.src = url + '/favicon.ico?' + Math.random();
            setTimeout(function() { img.src = ""; callback(false); }, 4000);
        };

        this.open = function () {
            var currentUrl = _this.getCurrent();
            var modal = $('<div class="switcher-layer"><div class="switcher-container"></div></div>');
            var container = modal.find('.switcher-container');

            // Header
            var currentObj = servers.find(function(s) { return _this.cleanUrl(s.url) === currentUrl; });
            var currentName = currentObj ? currentObj.name : 'Інше джерело';

            container.append('<div class="sw-title">Поточний сервер</div>');
            container.append('<div class="sw-current-name">' + currentName + '</div>');
            container.append('<div class="sw-hr"></div>');
            container.append('<div class="sw-title">Доступні сервери</div>');

            var list = $('<div class="sw-list"></div>');
            
            servers.forEach(function(s) {
                if (_this.cleanUrl(s.url) === currentUrl) return;

                var item = $('<div class="sw-item selector" data-url="'+s.url+'"><div class="sw-info"><span class="sw-dot"></span><span class="sw-name">'+s.name+'</span></div><span class="sw-status">Перевірка...</span></div>');
                
                _this.checkStatus(s.url, function(online) {
                    if (online) {
                        item.find('.sw-status').text('Доступний').addClass('sw-online');
                        item.find('.sw-name').addClass('sw-online');
                        item.find('.sw-dot').addClass('sw-dot-online');
                    } else {
                        item.find('.sw-status').text('Недоступний').addClass('sw-offline');
                        item.find('.sw-name').addClass('sw-offline');
                        item.addClass('is-disabled');
                    }
                });

                item.on('hover:enter click', function() {
                    if ($(this).hasClass('is-disabled')) return;
                    container.find('.sw-item').removeClass('is-active');
                    $(this).addClass('is-active');
                });

                list.append(item);
            });

            container.append(list);

            var applyBtn = $('<div class="sw-apply selector">Змінити сервер</div>');
            applyBtn.on('hover:enter click', function() {
                var active = container.find('.sw-item.is-active');
                if (active.length) {
                    var newUrl = active.data('url');
                    Lampa.Storage.set('source', newUrl);
                    Lampa.Storage.save(true);
                    Lampa.Noty.show('Перемикання на: ' + newUrl);
                    setTimeout(function() { window.location.href = newUrl; }, 800);
                } else {
                    Lampa.Noty.show('Оберіть працюючий сервер');
                }
            });

            container.append(applyBtn);

            // Функція закриття
            var close = function() {
                modal.remove();
                $(window).off('keydown', keyClose);
                Lampa.Controller.toggle('content');
            };

            var keyClose = function(e) {
                if (e.keyCode === 27 || e.keyCode === 8 || e.keyCode === 461) {
                    e.preventDefault();
                    close();
                }
            };

            $(window).on('keydown', keyClose);
            $('body').append(modal);
            Lampa.Controller.add('switcher_modal', {
                toggle: function() {
                    Lampa.Controller.collection(modal[0]);
                },
                back: close
            });
            Lampa.Controller.toggle('switcher_modal');
        };
    }

    var style = `
        .switcher-layer { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.85); z-index: 999; display:flex; align-items:center; justify-content:center; }
        .switcher-container { background: #1a1a1a; width: 450px; padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); box-sizing: border-box; }
        .sw-title { color: #888; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; }
        .sw-current-name { color: #fff; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .sw-hr { height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 20px; }
        .sw-list { max-height: 300px; overflow-y: auto; margin-bottom: 20px; }
        .sw-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-bottom: 10px; cursor: pointer; border: 2px solid transparent; box-sizing: border-box; min-height: 60px; }
        .sw-item.is-active { border-color: #fbd043; background: rgba(255,255,255,0.1); }
        .sw-info { display: flex; align-items: center; }
        .sw-dot { width: 8px; height: 8px; border-radius: 50%; background: #555; margin-right: 12px; }
        .sw-dot-online { background: #4b6; box-shadow: 0 0 8px #4b6; }
        .sw-name { font-size: 18px; color: #ccc; }
        .sw-online { color: #4b6 !important; }
        .sw-offline { color: #f44 !important; }
        .sw-status { font-size: 14px; opacity: 0.8; }
        .sw-apply { background: #fbd043; color: #000; padding: 18px; border-radius: 15px; text-align: center; font-weight: bold; text-transform: uppercase; cursor: pointer; transition: 0.2s; }
        .sw-apply.focus { background: #d4ae2d; transform: scale(1.03); }
        .is-disabled { opacity: 0.4; pointer-events: none; }
    `;

    $('head').append('<style>' + style + '</style>');
    var Switcher = new ServerSwitcher();

    // Додавання кнопок
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            // 1. Бічне меню
            var menu_item = $('<li class="menu__item selector"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="12 4 12 20"></polyline></svg></div><div class="menu__text">Зміна сервера</div></li>');
            menu_item.on('hover:enter click', Switcher.open);
            $('.menu .menu__list').append(menu_item);

            // 2. Налаштування
            Lampa.Settings.listener.follow('open', function(s) {
                if (s.name === 'main') {
                    var set_btn = $('<div class="settings-param selector" data-type="button"><div class="settings-param__name">Змінити сервер</div><div class="settings-param__descr">Вибір джерела завантаження Lampa</div></div>');
                    set_btn.on('hover:enter click', Switcher.open);
                    $('.settings__list').append(set_btn);
                }
            });
        }
    });
})();

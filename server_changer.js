(function () {
    'use strict';

    var servers = [
        { name: 'Lampa (MX)', url: 'http://lampa.mx' },
        { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
        { name: 'Lampa (NNMTV)', url: 'http://nnmtv.pw' },
        { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
    ];

    function ServerSwitcher() {
        var _this = this;
        var modal;

        this.cleanUrl = function(url) {
            if(!url) return '';
            return url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
        };

        // Визначаємо сервер на якому РЕАЛЬНО зараз запущено додаток
        this.getRealCurrent = function() {
            return window.location.host.toLowerCase();
        };

        this.checkStatus = function (url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.timeout = 4000;
            xhr.onload = function() { callback(true); };
            xhr.onerror = function() { callback(false); };
            xhr.ontimeout = function() { callback(false); };
            try { xhr.send(); } catch (e) { callback(false); }
        };

        this.build = function () {
            var currentHost = this.getRealCurrent();
            var html = $('<div class="server-switcher-modal"></div>');
            
            // Знаходимо назву поточного хоста
            var currentObj = servers.find(function(s) { 
                return _this.cleanUrl(s.url).indexOf(currentHost) > -1; 
            });
            var currentName = currentObj ? currentObj.name : currentHost;

            html.append('<div class="server-switcher-label">Поточний сервер:</div>');
            html.append('<div class="server-switcher-current">' + currentName + '</div>');
            html.append('<div class="server-switcher-divider"></div>');
            html.append('<div class="server-switcher-label">Список серверів:</div>');

            var list = $('<div class="server-switcher-list"></div>');
            
            servers.forEach(function (server) {
                var serverHost = _this.cleanUrl(server.url);
                if (currentHost.indexOf(serverHost) > -1) return;

                var item = $('<div class="server-switcher-item selector" data-url="' + server.url + '"></div>');
                var info = $('<div class="server-info"><span class="server-dot"></span><span class="server-name">' + server.name + '</span></div>');
                var statusText = $('<span class="server-status">Перевірка...</span>');

                item.append(info).append(statusText);
                item.on('hover:enter click', function () {
                    if ($(this).hasClass('disabled')) return;
                    $('.server-switcher-item', html).removeClass('active');
                    $(this).addClass('active');
                });

                list.append(item);

                _this.checkStatus(server.url, function(isOnline) {
                    var dot = item.find('.server-dot');
                    if(isOnline) {
                        statusText.text('Доступний').addClass('status-online');
                        dot.addClass('dot-online');
                    } else {
                        statusText.text('Недоступний').addClass('status-offline');
                        dot.addClass('dot-offline');
                        item.addClass('disabled').removeClass('selector');
                    }
                });
            });

            html.append(list);
            var btn = $('<div class="button selector" style="text-align:center; margin-top: 15px; width: 100%;">Змінити сервер</div>');
            btn.on('hover:enter click', function () {
                var selected = $('.server-switcher-item.active', html);
                if (selected.length) _this.applyServer(selected.data('url'));
                else Lampa.Noty.show('Оберіть доступний сервер');
            });

            html.append(btn);
            return html;
        };

        this.applyServer = function (newUrl) {
            Lampa.Storage.set('source', newUrl);
            Lampa.Storage.set('proxy_tmdb', false); // Вимикаємо проксі, щоб не заважало новому серверу
            Lampa.Storage.set('language', 'uk');
            Lampa.Storage.save(); 
            
            Lampa.Modal.close();
            Lampa.Noty.show('Перехід на: ' + newUrl);

            setTimeout(function () {
                // Пряма зміна локації для 100% результату
                window.location.href = newUrl;
            }, 800);
        };

        this.open = function () {
            Lampa.Modal.open({
                title: 'Зміна серверу',
                html: _this.build(),
                size: 'medium',
                mask: true,
                onBack: function () {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('content');
                }
            });
        };
    }

    var css = `
        .server-switcher-modal { padding: 15px; }
        .server-switcher-label { color: #aaa; font-size: 0.8em; margin-bottom: 5px; text-transform: uppercase; }
        .server-switcher-current { color: #ffd948; font-size: 1.4em; font-weight: bold; margin-bottom: 15px; }
        .server-switcher-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 15px 0; }
        .server-switcher-list { max-height: 50vh; overflow-y: auto; }
        .server-switcher-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-radius: 6px; margin-bottom: 5px; background: rgba(255,255,255,0.05); }
        .server-switcher-item.active { background: rgba(255,255,255,0.2) !important; border: 1px solid rgba(255,255,255,0.3); }
        .server-switcher-item.disabled { opacity: 0.5; cursor: default; }
        .server-info { display: flex; align-items: center; }
        .server-name { font-weight: bold; margin-left: 10px; color: #fff; }
        .server-dot { width: 10px; height: 10px; border-radius: 50%; background: #555; }
        .dot-online { background: #4b6; }
        .dot-offline { background: #f44; }
        .status-online { color: #4b6; font-size: 0.85em; }
        .status-offline { color: #f44; font-size: 0.85em; }
    `;
    
    if (!$('style#server-switcher-style').length) {
        $('<style id="server-switcher-style">').text(css).appendTo('head');
    }

    var Switcher = new ServerSwitcher();

    // Ініціалізація налаштувань (Виправлено: без підменю)
    function initSettings() {
        var Settings = Lampa.SettingsApi || Lampa.Settings;
        if (!Settings) return;

        Settings.addParam({
            component: 'interface', // Додаємо прямо в розділ "Інтерфейс" або створюємо свій
            param: { name: 'server_switch_trigger', type: 'click' },
            field: { name: 'Зміна серверу Lampa', description: 'Відкрити вікно вибору сервера' },
            onChange: function () { Switcher.open(); }
        });
    }

    function initMenu() {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                var item = $('<li class="menu__item selector"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg></div><div class="menu__text">Зміна серверу</div></li>');
                item.on('hover:enter click', function () { Switcher.open(); });
                $('.menu .menu__list').append(item);
            }
        });
    }

    function initHeader() {
        Lampa.Listener.follow('app', function(e) {
            if(e.type == 'ready') {
                if ($('.head__action.srv-trigger').length) return;
                var btn = $('<div class="head__action selector srv-trigger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1.5em; vertical-align:middle"><rect x="2" y="2" width="20" height="8" rx="2"></rect><rect x="2" y="14" width="20" height="8" rx="2"></rect></svg></div>');
                btn.on('hover:enter click', function () { Switcher.open(); });
                $('.head__actions').prepend(btn);
            }
        });
    }

    // Запуск
    if (window.Lampa) {
        initSettings();
        initHeader();
        initMenu();
    }
})();

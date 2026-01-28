(function () {
    'use strict';

    function ServerSwitcher() {
        var _this = this;
        var servers = [
            { name: 'Lampa (MX)', url: 'http://lampa.mx' },
            { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
            { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
            { name: 'Lampa (NNMTV)', url: 'http://lam.nnmtv.pw' }
        ];

        this.init = function () {
            this.addStyles();
            
            // 1. Додавання в налаштування
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main') {
                    var item = $('<div class="settings-folder selector" data-action="server_switch"><div class="settings-folder__icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="settings-folder__name">Зміна Сервера</div></div>');
                    item.on('hover:enter', function () { _this.open(); });
                    $('.settings__content .settings-folder').last().after(item);
                }
            });

            // 2. Додавання в ліве меню
            Lampa.Listener.follow('menu', function (e) {
                if (e.type == 'ready') {
                    var menu_item = $('<div class="menu__item selector" data-action="server_switch"><div class="menu__item-icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" style="fill: currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="menu__item-title">Сервер</div></div>');
                    menu_item.on('hover:enter', function () { _this.open(); });
                    $('.menu__list').append(menu_item);
                }
            });

            // 3. Шапка
            var head_btn = $('<div class="head__action selector"><svg style="fill: currentColor; width: 22px; height: 22px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>');
            head_btn.on('hover:enter', function() { _this.open(); });
            $('.head__actions').prepend(head_btn);
        };

        this.addStyles = function() {
            var css = `
                .server-switcher-title { font-size: 1.2em; color: #fff; margin: 15px 0 10px 5px; font-weight: bold; opacity: 0.6; }
                .server-item { padding: 12px; margin-bottom: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 2px solid transparent; }
                .server-item.focus { background: rgba(255,255,255,0.15); border-color: #fff; }
                .server-item.current-active { background: rgba(255, 193, 7, 0.1); border-color: transparent; cursor: default; }
                .server-name { font-size: 1.1em; font-weight: 500; }
                .server-name.online { color: #00ff44; }
                .server-name.offline { color: #ff3b3b; }
                .server-name.current { color: #ffc107; }
                .server-status-dot { width: 10px; height: 10px; border-radius: 50%; background: #555; }
                .server-status-dot.online { background: #00ff44; box-shadow: 0 0 8px #00ff44; }
                .server-status-dot.offline { background: #ff3b3b; box-shadow: 0 0 8px #ff3b3b; }
            `;
            if (!$('#server-switcher-style').length) $('body').append('<style id="server-switcher-style">' + css + '</style>');
        };

        this.checkAvailability = function(url, callback) {
            var img = new Image();
            var timer = setTimeout(function() {
                img.onload = img.onerror = null;
                callback(false);
            }, 4000);
            img.onload = function() { clearTimeout(timer); callback(true); };
            img.onerror = function() { clearTimeout(timer); callback(true); }; // Для багатьох серверів помилка завантаження картинки = сервер відповів (живий)
            img.src = url + "/favicon.ico?" + Math.random();
        };

        this.open = function () {
            var html = $('<div class="server-switcher-modal"></div>');
            var current_host = window.location.hostname;

            // Секція ПОТОЧНИЙ
            html.append('<div class="server-switcher-title">Поточний сервер</div>');
            var current_obj = servers.find(s => s.url.indexOf(current_host) > -1) || {name: current_host, url: '#'};
            html.append('<div class="server-item current-active"><div class="server-name current">'+current_obj.name+'</div></div>');

            // Секція СПИСОК
            html.append('<div class="server-switcher-title">Список серверів</div>');
            var list = $('<div class="server-list"></div>');
            
            servers.forEach(function (server) {
                if (server.url.indexOf(current_host) > -1) return;

                var item = $('<div class="server-item selector"><div class="server-name">'+server.name+'</div><div class="server-status-dot"></div></div>');
                
                item.on('hover:enter', function () {
                    // Фікс Android: чистимо Storage перед переходом для уникнення конфліктів мови
                    localStorage.removeItem('language'); 
                    localStorage.removeItem('language_code');
                    Lampa.Noty.show('Перехід: ' + server.name);
                    setTimeout(function() {
                        window.location.replace(server.url);
                    }, 500);
                });

                _this.checkAvailability(server.url, function(is_online) {
                    var name_el = item.find('.server-name');
                    var dot_el = item.find('.server-status-dot');
                    if (is_online) {
                        name_el.addClass('online');
                        dot_el.addClass('online');
                    } else {
                        name_el.addClass('offline');
                        dot_el.addClass('offline');
                    }
                });

                list.append(item);
            });

            html.append(list);

            Lampa.Modal.open({
                title: 'Вибір локації',
                html: html,
                size: 'small',
                onBack: function () {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('content');
                }
            });
        };
    }

    if (window.appready) new ServerSwitcher().init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') new ServerSwitcher().init(); });
})();

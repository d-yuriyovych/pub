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
            this.injectItems();
        };

        this.injectItems = function() {
            // В налаштування (без дублювання)
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main' && !$('.settings__content [data-action="server_switch"]').length) {
                    var item = $('<div class="settings-folder selector" data-action="server_switch"><div class="settings-folder__icon"><svg height="44" viewBox="0 0 24 24" width="44" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="settings-folder__name">Зміна Сервера</div></div>');
                    item.on('hover:enter', function () { _this.open(); });
                    $('.settings__content .settings-folder').eq(0).after(item);
                }
            });

            // В ліве меню
            Lampa.Listener.follow('menu', function (e) {
                if (e.type == 'ready' && !$('.menu__list [data-action="server_switch"]').length) {
                    var menu_item = $('<li class="menu__item selector" data-action="server_switch"><div class="menu__ico"><svg height="44" viewBox="0 0 24 24" width="44" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="menu__text">Зміна сервера</div></li>');
                    menu_item.on('hover:enter', function () { _this.open(); });
                    $('.menu__list').append(menu_item);
                }
            });

            // В шапку
            if (!$('.head__action[data-action="server_switch"]').length) {
                var head_btn = $('<div class="head__action selector" data-action="server_switch" style="color: #a3d9ff;"><svg style="fill: currentColor; width: 22px; height: 22px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>');
                head_btn.on('hover:enter', function() { _this.open(); });
                $('.head .head__actions').prepend(head_btn);
            }
        };

        this.addStyles = function() {
            var css = `
                .server-switcher-modal { padding: 15px; }
                .server-item { padding: 12px; margin-bottom: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 2px solid transparent; }
                .server-item.focus { border-color: #fff; background: rgba(255,255,255,0.1); }
                
                /* Поточний (Жовтий) */
                .server-item.active-srv { border-color: #ffc107; background: rgba(255, 193, 7, 0.1); pointer-events: none; }
                .server-item.active-srv .server-name { color: #ffc107; }
                
                /* Назви кольорові */
                .server-name { font-weight: bold; font-size: 1.1em; color: #fff; }
                .is-online .server-name { color: #00ff44; }
                .is-offline .server-name { color: #ff0044; }
                
                /* Крапки */
                .status-dot { width: 10px; height: 10px; border-radius: 50%; background: #444; }
                .dot-online { background: #00ff44; box-shadow: 0 0 8px #00ff44; }
                .dot-offline { background: #ff0044; box-shadow: 0 0 10px #ff0044; animation: srv-blink 0.8s infinite; }
                
                @keyframes srv-blink { 0% { opacity: 1; } 50% { opacity: 0.2; } 100% { opacity: 1; } }
                .server-url { display: none !important; }
                .current-tag { font-size: 0.6em; color: #ffc107; text-transform: uppercase; display: block; }
                .apply-btn { margin-top: 15px; padding: 15px; text-align: center; background: #222; border-radius: 8px; color: #555; font-weight: bold; }
                .apply-btn.focus { background: #fff; color: #000; }
                .apply-btn.active { background: #00ff44; color: #000; }
            `;
            if (!$('#ss-styles').length) $('body').append('<style id="ss-styles">' + css + '</style>');
        };

        this.open = function () {
            var selected = null;
            var html = $('<div class="server-switcher-modal"><div class="srv-list"></div><div class="apply-btn selector">Оберіть сервер</div></div>');
            var current_host = window.location.hostname;

            // 1. Поточний сервер (ТІЛЬКИ ЗГОРИ)
            var current = servers.find(s => s.url.indexOf(current_host) > -1);
            if (current) {
                html.find('.srv-list').append('<div class="server-item active-srv"><div class="info"><span class="current-tag">Поточний сервер</span><div class="server-name">'+current.name+'</div></div><div class="status-dot dot-online"></div></div>');
            }

            // 2. Список інших
            servers.forEach(function (server) {
                if (current && server.url === current.url) return;
                var item = $('<div class="server-item selector"><div class="server-name">'+server.name+'</div><div class="status-dot"></div></div>');
                html.find('.srv-list').append(item);

                // Перевірка (з анти-кешем)
                fetch(server.url + '?t=' + Date.now(), { mode: 'no-cors' }).then(function() {
                    item.addClass('is-online').find('.status-dot').addClass('dot-online');
                }).catch(function() {
                    item.addClass('is-offline').find('.status-dot').addClass('dot-offline');
                });

                item.on('hover:enter', function () {
                    if (item.hasClass('is-offline')) return Lampa.Noty.show('Сервер недоступний');
                    selected = server.url;
                    html.find('.apply-btn').addClass('active').text('ПІДКЛЮЧИТИСЬ: ' + server.name);
                });
            });

            html.find('.apply-btn').on('hover:enter', function () {
                if (!selected) return;
                Lampa.Storage.set('source', selected); // Фікс для Android
                window.location.replace(selected);
            });

            Lampa.Modal.open({ title: 'Вибір сервера', html: html, size: 'medium' });
        };
    }

    if (window.appready) new ServerSwitcher().init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') new ServerSwitcher().init(); });
})();

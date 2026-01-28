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
            
            // 1. Вставка в ліве меню через системний механізм
            Lampa.Listener.follow('menu', function (e) {
                if (e.type == 'ready') {
                    var item = $('<div class="menu__item selector" data-action="server_switch"><div class="menu__item-icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="menu__item-title">Сервер</div></div>');
                    item.on('hover:enter click', _this.open);
                    $('.menu__list').append(item);
                }
            });

            // 2. Вставка в налаштування
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main') {
                    setTimeout(function() {
                        var item = $('<div class="settings-folder selector" data-action="server_switch"><div class="settings-folder__icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="settings-folder__name">Зміна Сервера</div></div>');
                        item.on('hover:enter click', _this.open);
                        $('.settings__content').append(item);
                    }, 10);
                }
            });

            // 3. Шапка
            var head_btn = $('<div class="head__action selector" data-action="server_switch"><svg style="fill: currentColor; width: 22px; height: 22px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>');
            head_btn.on('hover:enter click', _this.open);
            $('.head__actions').prepend(head_btn);
        };

        this.addStyles = function() {
            var css = `
                .ss-label { font-size: 1.2rem; color: #aaa; margin: 10px 5px; font-weight: bold; }
                .ss-current { background: rgba(255, 193, 7, 0.1); padding: 12px; border-radius: 6px; color: #ffc107; font-size: 1.4rem; text-align: center; border: 1px solid rgba(255, 193, 7, 0.3); margin-bottom: 20px; font-weight: bold; }
                .ss-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: rgba(255,255,255,0.05); border-radius: 6px; margin-bottom: 5px; }
                .ss-item.focus { background: #fff; color: #000; }
                .ss-name { font-size: 1.2rem; font-weight: bold; }
                .ss-name.online { color: #00ff44; }
                .ss-name.offline { color: #ff4444; }
                .ss-item.focus .ss-name { color: #000 !important; }
                .ss-dot { width: 10px; height: 10px; border-radius: 50%; background: #444; }
                .ss-dot.online { background: #00ff44; }
                .ss-dot.offline { background: #ff4444; }
            `;
            if (!$('#ss-styles').length) $('body').append('<style id="ss-styles">' + css + '</style>');
        };

        this.open = function () {
            var html = $('<div></div>');
            var cur_host = window.location.hostname;
            var current = servers.find(s => s.url.indexOf(cur_host) > -1) || { name: 'Невідомий' };

            html.append('<div class="ss-label">Поточний сервер</div>');
            html.append('<div class="ss-current">' + current.name + '</div>');
            html.append('<div class="ss-label">Список серверів</div>');

            servers.forEach(function (server) {
                if (server.url.indexOf(cur_host) > -1) return;

                var item = $('<div class="ss-item selector"><div class="ss-name">' + server.name + '</div><div class="ss-dot"></div></div>');
                
                item.on('hover:enter click', function () {
                    Lampa.Storage.set('source', server.url);
                    localStorage.setItem('language', 'uk'); // Фікс мови Android
                    window.location.replace(server.url);
                });

                // Перевірка статусу (без проксі)
                var img = new Image();
                img.onload = function() { item.find('.ss-name, .ss-dot').addClass('online'); };
                img.onerror = function() { item.find('.ss-name, .ss-dot').addClass('offline'); };
                img.src = server.url + '/favicon.ico?' + Math.random();

                html.append(item);
            });

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

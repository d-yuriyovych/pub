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
            // Постійна перевірка для вставки в меню, якщо воно з'явилося
            setInterval(function() {
                _this.inject('menu', '.menu__list', '<div class="menu__item selector" data-action="server_switch"><div class="menu__item-icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="menu__item-title">Сервер</div></div>');
                _this.inject('settings', '.settings__content', '<div class="settings-folder selector" data-action="server_switch"><div class="settings-folder__icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="settings-folder__name">Зміна Сервера</div></div>');
            }, 1000);

            // Шапка
            if (!$('.head__action[data-action="server_switch"]').length) {
                var head_btn = $('<div class="head__action selector" data-action="server_switch" style="color: #a3d9ff;"><svg style="fill: currentColor; width: 22px; height: 22px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>');
                head_btn.on('hover:enter click', function() { _this.open(); });
                $('.head__actions').prepend(head_btn);
            }
        };

        this.inject = function(type, container, html) {
            if ($(container).length && !$(container).find('[data-action="server_switch"]').length) {
                var el = $(html);
                el.on('hover:enter click', function() { _this.open(); });
                $(container).append(el);
            }
        };

        this.addStyles = function() {
            var css = `
                .server-label { font-size: 1.2em; color: rgba(255,255,255,0.5); margin: 10px 0; font-weight: bold; text-transform: uppercase; }
                .server-current-name { background: rgba(255, 193, 7, 0.1); padding: 15px; border-radius: 8px; color: #ffc107; font-size: 1.3em; margin-bottom: 20px; text-align: center; border: 1px solid rgba(255, 193, 7, 0.2); }
                .server-list-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 8px; }
                .server-list-item.focus { background: #fff; color: #000; }
                .server-status-text { font-size: 1.1em; font-weight: 500; }
                .server-status-text.online { color: #00ff44; }
                .server-status-text.offline { color: #ff4444; }
                .server-list-item.focus .server-status-text { color: #000; }
                .server-dot-sm { width: 10px; height: 10px; border-radius: 50%; background: #444; }
                .server-dot-sm.online { background: #00ff44; box-shadow: 0 0 8px #00ff44; }
                .server-dot-sm.offline { background: #ff4444; }
            `;
            if (!$('#ss-style').length) $('body').append('<style id="ss-style">' + css + '</style>');
        };

        this.open = function () {
            var html = $('<div></div>');
            var cur_host = window.location.hostname;
            var current = servers.find(s => s.url.indexOf(cur_host) > -1) || {name: 'Невідомий'};

            html.append('<div class="server-label">Поточний сервер</div>');
            html.append('<div class="server-current-name">' + current.name + '</div>');
            html.append('<div class="server-label">Список серверів</div>');

            servers.forEach(function (server) {
                if (server.url.indexOf(cur_host) > -1) return;

                var item = $('<div class="server-list-item selector"><div class="server-status-text">' + server.name + '</div><div class="server-dot-sm"></div></div>');
                
                item.on('hover:enter click', function () {
                    Lampa.Storage.set('source', server.url);
                    // Фікс для Андроїд: не даємо скидати мову
                    localStorage.setItem('language', 'uk');
                    localStorage.setItem('language_code', 'uk');
                    window.location.replace(server.url);
                });

                // Перевірка
                var img = new Image();
                img.onload = () => { item.find('.server-status-text, .server-dot-sm').addClass('online'); };
                img.onerror = () => { item.find('.server-status-text, .server-dot-sm').addClass('offline'); };
                img.src = server.url + '/favicon.ico?' + Math.random();

                html.append(item);
            });

            Lampa.Modal.open({
                title: 'Вибір локації',
                html: html,
                size: 'small',
                select: html.find('.selector').eq(0), // Фокус на першу кнопку
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

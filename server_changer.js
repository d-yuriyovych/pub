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
            
            // В налаштування
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main') {
                    var item = $('<div class="settings-folder selector" data-action="server_switch"><div class="settings-folder__icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="settings-folder__name">Зміна Сервера</div></div>');
                    item.on('hover:enter', function () { _this.open(); });
                    $('.settings__content .settings-folder').last().after(item);
                }
            });

            // В ліве меню
            Lampa.Listener.follow('menu', function (e) {
                if (e.type == 'ready') {
                    var menu_item = $('<div class="menu__item selector" data-action="server_switch"><div class="menu__item-icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="menu__item-title">Сервер</div></div>');
                    menu_item.on('hover:enter', function () { _this.open(); });
                    $('.menu__list').append(menu_item);
                }
            });

            // В шапку
            var head_btn = $('<div class="head__action selector" style="color: #a3d9ff;"><svg style="fill: currentColor; width: 22px; height: 22px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>');
            head_btn.on('hover:enter', function() { _this.open(); });
            $('.head__actions').prepend(head_btn);
        };

        this.addStyles = function() {
            var css = `
                .server-label { font-size: 1.2rem; color: #fff; margin: 15px 0 8px 5px; opacity: 0.8; font-weight: bold; }
                .server-current-box { background: rgba(255, 193, 7, 0.1); padding: 12px; border-radius: 8px; color: #ffc107; font-size: 1.2rem; margin-bottom: 20px; border: 1px solid rgba(255, 193, 7, 0.3); }
                .server-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: rgba(255,255,255,0.07); border-radius: 8px; margin-bottom: 8px; border: 2px solid transparent; }
                .server-card.focus { background: rgba(255,255,255,0.15); border-color: #fff; }
                .server-name { font-size: 1.2rem; font-weight: 500; }
                .server-name.online { color: #00ff44; }
                .server-name.offline { color: #ff4444; }
                .server-dot { width: 12px; height: 12px; border-radius: 50%; background: #444; transition: all 0.3s; }
                .server-dot.online { background: #00ff44; box-shadow: 0 0 10px rgba(0,255,68,0.5); }
                .server-dot.offline { background: #ff4444; }
            `;
            if (!$('#server-switcher-style').length) $('body').append('<style id="server-switcher-style">' + css + '</style>');
        };

        this.checkAvailability = function(url, callback) {
            var controller = new AbortController();
            var id = setTimeout(() => controller.abort(), 3500);
            fetch(url + '/favicon.ico', { mode: 'no-cors', signal: controller.signal })
                .then(() => { clearTimeout(id); callback(true); })
                .catch(() => { clearTimeout(id); callback(false); });
        };

        this.open = function () {
            var html = $('<div style="padding: 10px;"></div>');
            var current_host = window.location.hostname;
            var current_server = servers.find(s => s.url.indexOf(current_host) > -1) || { name: 'Невідомий' };

            html.append('<div class="server-label">Поточний сервер</div>');
            html.append('<div class="server-current-box">' + current_server.name + '</div>');
            html.append('<div class="server-label">Список серверів</div>');

            var list = $('<div></div>');
            servers.forEach(function (server) {
                if (server.url.indexOf(current_host) > -1) return;

                var item = $('<div class="server-card selector"><div class="server-name">' + server.name + '</div><div class="server-dot"></div></div>');
                
                item.on('hover:enter', function () {
                    Lampa.Storage.set('source', server.url);
                    Lampa.Noty.show('Зміна сервера...');
                    // Android Fix: уникнення циклу вибору мови
                    localStorage.setItem('language', 'uk');
                    localStorage.setItem('language_code', 'uk');
                    setTimeout(function() { window.location.replace(server.url); }, 500);
                });

                _this.checkAvailability(server.url, function(is_online) {
                    if (is_online) {
                        item.find('.server-name').addClass('online');
                        item.find('.server-dot').addClass('online');
                    } else {
                        item.find('.server-name').addClass('offline');
                        item.find('.server-dot').addClass('offline');
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

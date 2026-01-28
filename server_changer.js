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
            
            // Додавання всюди (Шапка, Меню, Налаштування) через єдиний цикл
            setInterval(function() {
                if ($('.head__actions').length && !$('.head__action[data-action="server_switch"]').length) {
                    var btn = $('<div class="head__action selector" data-action="server_switch" style="color: #a3d9ff;"><svg style="fill: currentColor; width: 22px; height: 22px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>');
                    btn.on('hover:enter click', _this.open);
                    $('.head__actions').prepend(btn);
                }
                if ($('.menu__list').length && !$('.menu__item[data-action="server_switch"]').length) {
                    var btn = $('<div class="menu__item selector" data-action="server_switch"><div class="menu__item-icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="menu__item-title">Сервер</div></div>');
                    btn.on('hover:enter click', _this.open);
                    $('.menu__list').append(btn);
                }
                if ($('.settings__content').length && !$('.settings-folder[data-action="server_switch"]').length) {
                    var btn = $('<div class="settings-folder selector" data-action="server_switch"><div class="settings-folder__icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="settings-folder__name">Зміна Сервера</div></div>');
                    btn.on('hover:enter click', _this.open);
                    $('.settings__content').append(btn);
                }
            }, 1000);
        };

        this.addStyles = function() {
            var css = `
                .ss-title { font-size: 1.2em; color: #fff; margin: 15px 0 5px; opacity: 0.5; font-weight: bold; }
                .ss-curr-card { background: rgba(255, 193, 7, 0.1); padding: 12px; border-radius: 6px; color: #ffc107; font-size: 1.3em; margin-bottom: 20px; border: 1px solid #ffc107; text-align: center; }
                .ss-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; margin-bottom: 5px; cursor: pointer; }
                .ss-item.focus { background: #fff !important; color: #000 !important; }
                .ss-name { font-size: 1.2em; font-weight: bold; }
                .ss-dot { width: 12px; height: 12px; border-radius: 50%; background: #444; }
                .online-text { color: #00ff44 !important; }
                .offline-text { color: #ff4444 !important; }
                .online-dot { background: #00ff44 !important; }
                .offline-dot { background: #ff4444 !important; }
                .ss-item.focus .ss-name { color: #000 !important; }
            `;
            if (!$('#ss-styles').length) $('body').append('<style id="ss-styles">' + css + '</style>');
        };

        this.open = function () {
            var html = $('<div style="width: 100%; max-width: 400px;"></div>');
            var cur_h = window.location.hostname;
            
            // Назва поточного
            var current = servers.find(s => s.url.indexOf(cur_h) > -1) || { name: cur_h };

            html.append('<div class="ss-title">Поточний сервер</div>');
            html.append('<div class="ss-curr-card">' + current.name + '</div>');
            html.append('<div class="ss-title">Список серверів</div>');

            servers.forEach(function (server) {
                if (server.url.indexOf(cur_h) > -1) return;

                var item = $('<div class="ss-item selector"><div class="ss-name">' + server.name + '</div><div class="ss-dot"></div></div>');
                
                item.on('hover:enter click', function () {
                    Lampa.Storage.set('source', server.url);
                    window.location.replace(server.url);
                });

                // Перевірка
                var img = new Image();
                img.onload = function() { 
                    item.find('.ss-name').addClass('online-text');
                    item.find('.ss-dot').addClass('online-dot');
                };
                img.onerror = function() { 
                    item.find('.ss-name').addClass('offline-text');
                    item.find('.ss-dot').addClass('offline-dot');
                };
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

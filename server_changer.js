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
            
            // 1. Бічне меню
            Lampa.Listener.follow('menu', function (e) {
                if (e.type == 'ready' && !$('.menu__list [data-action="server_switch"]').length) {
                    var item = $('<li class="menu__item selector" data-action="server_switch"><div class="menu__text">Зміна сервера</div></li>');
                    item.on('hover:enter', function () { _this.open(); });
                    $('.menu__list').append(item);
                }
            });

            // 2. Налаштування
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main' && !$('.settings__content [data-action="server_switch"]').length) {
                    var item = $('<div class="settings-folder selector" data-action="server_switch"><div class="settings-folder__name">Зміна Сервера</div></div>');
                    item.on('hover:enter', function () { _this.open(); });
                    $('.settings__content .settings-folder').eq(0).after(item);
                }
            });

            // 3. Шапка
            if (!$('.head__action[data-action="server_switch"]').length) {
                var btn = $('<div class="head__action selector" data-action="server_switch">Сервер</div>');
                btn.on('hover:enter', function() { _this.open(); });
                $('.head .head__actions').prepend(btn);
            }
        };

        this.addStyles = function() {
            var css = `
                .srv-modal { padding: 15px; }
                .srv-caption { font-size: 1.2em; font-weight: bold; margin: 15px 0 10px 0; color: #fff; opacity: 0.6; }
                .srv-item { padding: 15px; margin-bottom: 8px; background: rgba(255,255,255,0.05); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
                .srv-item.focus { background: rgba(255,255,255,0.15); border: 1px solid #fff; }
                
                /* Поточний сервер */
                .srv-current { color: #ffc107 !important; border: 1px solid #ffc107; pointer-events: none; }
                .srv-current .srv-name { color: #ffc107; }
                
                /* Кольори статусів */
                .srv-name { font-weight: bold; font-size: 1.1em; }
                .status-online .srv-name { color: #00ff44; }
                .status-offline .srv-name { color: #ff0000; }
                
                .srv-dot { width: 10px; height: 10px; border-radius: 50%; background: #444; }
                .status-online .srv-dot { background: #00ff44; }
                .status-offline .srv-dot { background: #ff0000; }
            `;
            if (!$('#srv-styles').length) $('body').append('<style id="srv-styles">' + css + '</style>');
        };

        this.open = function () {
            var html = $('<div class="srv-modal"></div>');
            var current_host = window.location.hostname;
            var current_srv = servers.find(s => s.url.indexOf(current_host) > -1);

            // Поточний сервер
            if (current_srv) {
                html.append('<div class="srv-caption">Поточний сервер</div>');
                html.append('<div class="srv-item srv-current"><span class="srv-name">' + current_srv.name + '</span><div class="srv-dot status-online"></div></div>');
            }

            // Список серверів
            html.append('<div class="srv-caption">Список серверів</div>');
            var list = $('<div class="srv-list"></div>');
            html.append(list);

            servers.forEach(function (s) {
                if (current_srv && s.url === current_srv.url) return;

                var item = $('<div class="srv-item selector"><span class="srv-name">' + s.name + '</span><div class="srv-dot"></div></div>');
                list.append(item);

                fetch(s.url + '?t=' + Date.now(), { mode: 'no-cors' }).then(function() {
                    item.addClass('status-online').find('.srv-dot').addClass('status-online');
                }).catch(function() {
                    item.addClass('status-offline').find('.srv-dot').addClass('status-offline');
                });

                item.on('hover:enter', function () {
                    Lampa.Storage.set('source', s.url);
                    Lampa.Storage.set('proxy_url', s.url);
                    Lampa.Noty.show('Зміна сервера...');
                    setTimeout(function() { window.location.replace(s.url); }, 500);
                });
            });

            Lampa.Modal.open({ title: 'Вибір сервера', html: html, size: 'medium' });
        };
    }

    new ServerSwitcher().init();
})();

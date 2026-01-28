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
            
            // Пряма вставка в меню
            var menu_timer = setInterval(function() {
                if ($('.menu__list').length && !$('.menu__item[data-action="srv"]').length) {
                    var item = $('<li class="menu__item selector" data-action="srv"><div class="menu__text">Зміна сервера</div></li>');
                    item.on('hover:enter', _this.open);
                    $('.menu__list').append(item);
                }
                if ($('.head__actions').length && !$('.head__action[data-action="srv"]').length) {
                    var btn = $('<div class="head__action selector" data-action="srv">Сервер</div>');
                    btn.on('hover:enter', _this.open);
                    $('.head__actions').prepend(btn);
                }
            }, 1000);

            // В налаштування
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main' && !$('.settings-folder[data-action="srv"]').length) {
                    var srv = $('<div class="settings-folder selector" data-action="srv"><div class="settings-folder__name">Зміна Сервера</div></div>');
                    srv.on('hover:enter', _this.open);
                    $('.settings__content .settings-folder').eq(0).after(srv);
                }
            });
        };

        this.addStyles = function() {
            var css = `
                .srv-modal { padding: 10px; }
                .srv-caption { font-size: 1.2em; color: rgba(255,255,255,0.5); margin: 15px 0 10px 5px; text-transform: uppercase; font-weight: bold; }
                .srv-item { padding: 15px; margin-bottom: 5px; background: rgba(255,255,255,0.05); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 2px solid transparent; }
                .srv-item.focus { border-color: #fff; background: rgba(255,255,255,0.1); }
                .srv-name { font-weight: bold; font-size: 1.2em; }
                
                /* Поточний сервер */
                .srv-item.is-current { color: #ffc107; border-color: #ffc107; pointer-events: none; }
                .srv-item.is-current .srv-name { color: #ffc107; }
                
                /* Кольори статусів */
                .srv-online .srv-name { color: #00ff44; }
                .srv-offline .srv-name { color: #ff0000; }
                .srv-dot { width: 10px; height: 10px; border-radius: 50%; background: #444; }
                .srv-online .srv-dot { background: #00ff44; }
                .srv-offline .srv-dot { background: #ff0000; }
            `;
            if (!$('#srv-css').length) $('body').append('<style id="srv-css">' + css + '</style>');
        };

        this.open = function () {
            var html = $('<div class="srv-modal"></div>');
            var current_host = window.location.hostname;
            var current_srv = servers.find(s => s.url.indexOf(current_host) > -1);

            if (current_srv) {
                html.append('<div class="srv-caption">Поточний сервер</div>');
                html.append('<div class="srv-item is-current"><span class="srv-name">' + current_srv.name + '</span><div class="srv-dot srv-online"></div></div>');
            }

            html.append('<div class="srv-caption">Список серверів</div>');
            servers.forEach(function (s) {
                if (current_srv && s.url === current_srv.url) return;
                var item = $('<div class="srv-item selector"><span class="srv-name">' + s.name + '</span><div class="srv-dot"></div></div>');
                html.append(item);

                fetch(s.url + '?t=' + Date.now(), { mode: 'no-cors' }).then(function() {
                    item.addClass('srv-online').find('.srv-dot').addClass('srv-online');
                }).catch(function() {
                    item.addClass('srv-offline').find('.srv-dot').addClass('srv-offline');
                });

                item.on('hover:enter', function () {
                    Lampa.Storage.set('source', s.url);
                    Lampa.Storage.set('proxy_url', s.url);
                    window.location.replace(s.url);
                });
            });

            Lampa.Modal.open({ title: 'Вибір сервера', html: html, size: 'medium' });
        };
    }

    new ServerSwitcher().init();
})();

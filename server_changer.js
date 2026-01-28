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
            
            // "Силовий" метод додавання в меню - перевірка щосекунди
            setInterval(function() {
                // В бічне меню зліва
                if ($('.menu__list').length && !$('.menu__item[data-action="srv_sw"]').length) {
                    var m = $('<li class="menu__item selector" data-action="srv_sw"><div class="menu__text">Зміна сервера</div></li>');
                    m.on('hover:enter', _this.open);
                    $('.menu__list').append(m);
                }
                // В налаштування
                if ($('.settings__content').length && !$('.settings-folder[data-action="srv_sw"]').length) {
                    var s = $('<div class="settings-folder selector" data-action="srv_sw"><div class="settings-folder__name">Зміна Сервера</div></div>');
                    s.on('hover:enter', _this.open);
                    $('.settings__content .settings-folder').eq(0).after(s);
                }
            }, 1000);
        };

        this.addStyles = function() {
            var css = `
                .srv-modal { padding: 10px; }
                .srv-cap { font-size: 1.1em; color: rgba(255,255,255,0.4); margin: 15px 0 10px 5px; font-weight: bold; }
                .srv-item { padding: 15px; margin-bottom: 5px; background: rgba(255,255,255,0.05); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
                .srv-item.focus { background: rgba(255,255,255,0.15); border: 1px solid #fff; }
                .srv-name { font-weight: bold; font-size: 1.2em; }
                .srv-item.is-curr { color: #ffc107; border: 1px solid #ffc107; pointer-events: none; }
                .srv-item.is-curr .srv-name { color: #ffc107; }
                .srv-on .srv-name { color: #00ff44; }
                .srv-off .srv-name { color: #ff0000; }
                .srv-dot { width: 10px; height: 10px; border-radius: 50%; background: #444; }
                .srv-on .srv-dot { background: #00ff44; }
                .srv-off .srv-dot { background: #ff0000; }
            `;
            if (!$('#srv-css').length) $('body').append('<style id="srv-css">' + css + '</style>');
        };

        this.open = function () {
            var html = $('<div class="srv-modal"></div>');
            var host = window.location.hostname;
            var current = servers.find(s => s.url.indexOf(host) > -1);

            if (current) {
                html.append('<div class="srv-cap">Поточний сервер</div>');
                html.append('<div class="srv-item is-curr"><span class="srv-name">' + current.name + '</span><div class="srv-dot srv-on"></div></div>');
            }

            html.append('<div class="srv-cap">Список серверів</div>');
            servers.forEach(function (s) {
                if (current && s.url === current.url) return;
                var item = $('<div class="srv-item selector"><span class="srv-name">' + s.name + '</span><div class="srv-dot"></div></div>');
                html.append(item);

                fetch(s.url + '?t=' + Date.now(), { mode: 'no-cors' }).then(function() {
                    item.addClass('srv-on').find('.srv-dot').addClass('srv-on');
                }).catch(function() {
                    item.addClass('srv-off').find('.srv-dot').addClass('srv-off');
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

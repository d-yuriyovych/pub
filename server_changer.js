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
            this.injectButtons();
        };

        this.injectButtons = function() {
            // Додавання в шапку (відразу)
            if (!$('.head__action[data-action="server_switch"]').length) {
                var head_btn = $('<div class="head__action selector" data-action="server_switch" style="color: #a3d9ff;"><svg style="fill: currentColor; width: 22px; height: 22px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>');
                head_btn.on('hover:enter click', function() { _this.open(); });
                $('.head__actions').prepend(head_btn);
            }

            // Очікування і вставка в ліве меню та налаштування
            var injectInterval = setInterval(function() {
                // Ліве меню
                if ($('.menu__list').length && !$('.menu__item[data-action="server_switch"]').length) {
                    var menu_item = $('<div class="menu__item selector" data-action="server_switch"><div class="menu__item-icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="menu__item-title">Сервер</div></div>');
                    menu_item.on('hover:enter click', function() { _this.open(); });
                    $('.menu__list').append(menu_item);
                }

                // Налаштування (розділ Інше/Система)
                if ($('.settings__content').length && !$('.settings-folder[data-action="server_switch"]').length) {
                    var set_item = $('<div class="settings-folder selector" data-action="server_switch"><div class="settings-folder__icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="settings-folder__name">Зміна Сервера</div></div>');
                    set_item.on('hover:enter click', function () { _this.open(); });
                    $('.settings__content').append(set_item);
                }
            }, 2000);
        };

        this.addStyles = function() {
            var css = `
                .server-label { font-size: 1.3rem; color: #fff; margin: 15px 0 10px 5px; opacity: 0.6; font-weight: bold; }
                .server-current-box { background: rgba(255, 193, 7, 0.15); padding: 15px; border-radius: 10px; color: #ffc107; font-size: 1.4rem; margin-bottom: 25px; border: 1px solid rgba(255, 193, 7, 0.4); font-weight: bold; text-align: center; }
                .server-card { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: rgba(255,255,255,0.06); border-radius: 10px; margin-bottom: 10px; border: 2px solid transparent; }
                .server-card.focus { background: rgba(255,255,255,0.12); border-color: #fff; }
                .server-name-txt { font-size: 1.3rem; font-weight: 500; }
                .server-name-txt.online { color: #00ff44; }
                .server-name-txt.offline { color: #ff4444; }
                .server-dot-fixed { width: 14px; height: 14px; border-radius: 50%; background: #444; }
                .server-dot-fixed.online { background: #00ff44; box-shadow: 0 0 10px rgba(0,255,68,0.6); }
                .server-dot-fixed.offline { background: #ff4444; }
            `;
            if (!$('#server-switcher-style').length) $('body').append('<style id="server-switcher-style">' + css + '</style>');
        };

        this.open = function () {
            var html = $('<div style="padding: 10px; min-width: 300px;"></div>');
            
            // Визначення поточної назви через URL
            var cur_url = window.location.href;
            var current_obj = servers.find(function(s) { 
                var clean_url = s.url.replace(/^https?:\/\//, '');
                return cur_url.indexOf(clean_url) > -1;
            });
            var current_name = current_obj ? current_obj.name : "Невідомий";

            html.append('<div class="server-label">Поточний сервер</div>');
            html.append('<div class="server-current-box">' + current_name + '</div>');
            html.append('<div class="server-label">Список серверів</div>');

            var list = $('<div></div>');
            servers.forEach(function (server) {
                // Не показуємо поточний у списку для вибору
                if (current_obj && server.url === current_obj.url) return;

                var item = $('<div class="server-card selector"><div class="server-name-txt">' + server.name + '</div><div class="server-dot-fixed"></div></div>');
                
                item.on('hover:enter click', function () {
                    Lampa.Noty.show('Зміна сервера на ' + server.name);
                    // Android Fix: уникнення скидання мови
                    Lampa.Storage.set('language', 'uk');
                    Lampa.Storage.set('language_code', 'uk');
                    setTimeout(function() { window.location.replace(server.url); }, 400);
                });

                // Перевірка доступності (без блимання)
                var img = new Image();
                img.onload = function() { 
                    item.find('.server-name-txt').addClass('online'); 
                    item.find('.server-dot-fixed').addClass('online'); 
                };
                img.onerror = function() { 
                    item.find('.server-name-txt').addClass('offline'); 
                    item.find('.server-dot-fixed').addClass('offline'); 
                };
                img.src = server.url + '/favicon.ico?' + Math.random();

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

    // Запуск
    var startPlugin = function() {
        if (window.server_switcher_inited) return;
        new ServerSwitcher().init();
        window.server_switcher_inited = true;
    };

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();

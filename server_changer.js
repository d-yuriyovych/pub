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
            // Реєстрація в налаштуваннях (Інше)
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main') {
                    var item = $('<div class="settings-folder selector" data-action="server_switch"><div class="settings-folder__icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="settings-folder__name">Зміна Сервера</div></div>');
                    item.on('hover:enter click', _this.open);
                    $('.settings__content').append(item);
                }
            });

            // Додавання в шапку
            var head_btn = $('<div class="head__action selector" data-action="server_switch"><svg style="fill: #a3d9ff; width: 22px; height: 22px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>');
            head_btn.on('hover:enter click', _this.open);
            $('.head__actions').prepend(head_btn);

            // Додавання в ліве меню
            Lampa.Listener.follow('menu', function (e) {
                if (e.type == 'ready') {
                    var menu_item = $('<div class="menu__item selector" data-action="server_switch"><div class="menu__item-icon"><svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="menu__item-title">Сервер</div></div>');
                    menu_item.on('hover:enter click', _this.open);
                    $('.menu__list').append(menu_item);
                }
            });
        };

        this.open = function () {
            var items = [];
            var cur_host = window.location.hostname;
            var current = servers.find(function(s) { return s.url.indexOf(cur_host) > -1; }) || { name: 'Невідомо' };

            // Поточний сервер (неклікабельний заголовок)
            items.push({
                title: 'ПОТОЧНИЙ: ' + current.name,
                subtitle: 'Цей сервер зараз активний',
                type: 'none'
            });

            // Список доступних
            servers.forEach(function (server) {
                if (server.url.indexOf(cur_host) > -1) return;

                var item = {
                    title: server.name,
                    url: server.url
                };

                // Перевірка статусу для кольору
                var img = new Image();
                img.onload = function() { item.ghost = false; }; 
                img.onerror = function() { item.ghost = true; };
                img.src = server.url + '/favicon.ico?' + Math.random();

                items.push(item);
            });

            Lampa.Select.show({
                title: 'Вибір сервера',
                items: items,
                onSelect: function (a) {
                    if (a.url) {
                        Lampa.Storage.set('source', a.url);
                        // Android fix (уникнення рестартів мови)
                        Lampa.Storage.set('language', 'uk');
                        Lampa.Storage.set('language_code', 'uk');
                        window.location.replace(a.url);
                    }
                },
                onBack: function () {
                    Lampa.Controller.toggle('content');
                }
            });

            // Кастомні стилі для кольорів назв (через 100мс після відкриття)
            setTimeout(function() {
                $('.select-item').each(function() {
                    var txt = $(this).find('.select-item__title').text();
                    if (txt.indexOf('ПОТОЧНИЙ') > -1) $(this).css('color', '#ffc107');
                    else if (txt.indexOf('Lampa') > -1) $(this).css('color', '#00ff44');
                });
            }, 100);
        };
    }

    if (window.appready) new ServerSwitcher().init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') new ServerSwitcher().init(); });
})();

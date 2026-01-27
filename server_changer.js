(function () {
    'use strict';

    Lampa.Plugins.add('server_switcher', function (object) {
        var servers = [
            { name: 'Lampa (MX)', url: 'http://lampa.mx' },
            { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app/' },
            { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
            { name: 'Lampa (NNMTV)', url: 'http://lam.nnmtv.pw' }
        ];

        // Функція для перевірки статусу (Ping)
        function checkStatus(callback) {
            var count = 0;
            Lampa.Noty.show('Перевірка серверів...');
            servers.forEach(function (s) {
                var start = Date.now();
                var img = new Image();
                img.onload = function () { s.status = 'online'; s.ping = Date.now() - start; next(); };
                img.onerror = function () { s.status = 'online'; s.ping = Date.now() - start; next(); };
                img.src = s.url + '/favicon.ico?' + Math.random();
                setTimeout(function () { if (!s.status) { s.status = 'offline'; next(); } }, 3000);
            });
            function next() {
                count++;
                if (count === servers.length) callback();
            }
        }

        // Функція відкриття вікна вибору
        function openSwitcher() {
            checkStatus(function () {
                Lampa.Select.show({
                    title: 'Вибір сервера',
                    items: servers.map(function (s) {
                        return {
                            title: s.name,
                            subtitle: s.status === 'online' ? '<span style="color:#4caf50">● Доступний</span> (' + s.ping + 'ms)' : '<span style="color:#f44336">● Офлайн</span>',
                            server: s
                        };
                    }),
                    onSelect: function (item) {
                        if (item.server.status !== 'online') {
                            Lampa.Noty.show('Сервер недоступний!');
                            return;
                        }
                        Lampa.Storage.set('server_url', item.server.url); // Міняємо основний сервер
                        Lampa.Noty.show('Сервер змінено на: ' + item.server.name);
                        setTimeout(function () { location.reload(); }, 1000);
                    },
                    onBack: function () {
                        Lampa.Controller.toggle('content');
                    }
                });
            });
        }

        // 1. Додаємо в Налаштування (Розділ "Інтерфейс")
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name == 'interface') {
                var item = $('<div class="settings-param selector" data-type="button"><div class="settings-param__name">Змінити сервер</div><div class="settings-param__value">Список доступних</div></div>');
                item.on('hover:enter', openSwitcher);
                e.body.find('.settings-list').append(item);
            }
        });

        // 2. Додаємо в Бічне меню
        Lampa.Menu.add({
            id: 'server_switcher',
            title: 'Сервери',
            icon: '<svg height="36" viewBox="0 0 24 24" width="36" fill="currentColor"><path d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.68-1.5-1.5s.68-1.5 1.5-1.5 1.5.68 1.5 1.5-.68 1.5-1.5 1.5zM19 5v4H5V5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5C6.18 8.5 5.5 7.82 5.5 7S6.18 5.5 7 5.5s1.5.68 1.5 1.5-.68 1.5-1.5 1.5z"/></svg>',
            onSelect: openSwitcher
        });

        // 3. Додаємо в Шапку
        var header_item = $('<div class="header__item selector"><svg height="24" viewBox="0 0 24 24" width="24" fill="white"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.68-1.5-1.5s.68-1.5 1.5-1.5 1.5.68 1.5 1.5-.68 1.5-1.5 1.5zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5C6.18 8.5 5.5 7.82 5.5 7S6.18 5.5 7 5.5s1.5.68 1.5 1.5-.68 1.5-1.5 1.5z"/></svg></div>');
        header_item.on('hover:enter', openSwitcher);
        $('.header__items').prepend(header_item);

    });
})();

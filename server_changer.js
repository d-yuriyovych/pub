(function () {
    'use strict';

    Lampa.Platform.tv(); // Забезпечуємо сумісність

    function ServerSwitcher() {
        var network = new Lampa.Reguest();
        var servers = [
            { name: 'Lampa (MX)', url: 'http://lampa.mx' },
            { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app/' },
            { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
            { name: 'Lampa (NNMTV)', url: 'http://lam.nnmtv.pw' }
        ];

        this.create = function () {
            this.render();
        };

        // Функція перевірки статусів
        this.checkServers = function (callback) {
            var results = [];
            var count = 0;

            servers.forEach(function (serv) {
                var start = Date.now();
                fetch(serv.url, { mode: 'no-cors', cache: 'no-set' })
                    .then(() => {
                        serv.status = 'online';
                        serv.ping = Date.now() - start;
                        next();
                    })
                    .catch(() => {
                        serv.status = 'offline';
                        next();
                    });
            });

            function next() {
                count++;
                if (count === servers.length) callback();
            }
        };

        this.open = function () {
            var _this = this;
            Lampa.Select.show({
                title: 'Вибір сервера',
                items: servers.map(s => ({
                    title: s.name,
                    subtitle: s.status === 'online' ? 'Доступний (OK)' : 'Недоступний',
                    server: s,
                    template: 'is_status' // Спеціальний шаблон з кольором
                })),
                onSelect: function (item) {
                    if (item.server.status !== 'online') {
                        Lampa.Noty.show('Сервер недоступний!');
                        return;
                    }
                    
                    // Логіка зміни сервера
                    Lampa.Storage.set('server_url', item.server.url);
                    Lampa.Noty.show('Сервер змінено на: ' + item.server.name);
                    
                    setTimeout(() => {
                        window.location.reload(); // Перезавантаження для застосування
                    }, 1000);
                }
            });
        };

        this.render = function () {
            var _this = this;
            
            // 1. Додаємо в Налаштування
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main') {
                    var item = $('<div class="settings-param selector"><div class="settings-param__name">Змінити сервер</div></div>');
                    item.on('hover:enter', function () { _this.checkServers(() => _this.open()); });
                    e.body.find('.settings-list').append(item);
                }
            });

            // 2. Додаємо в Бокове меню
            Lampa.Menu.add({
                id: 'server_switch',
                title: 'Сервери',
                icon: '<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.68-1.5-1.5s.68-1.5 1.5-1.5 1.5.68 1.5 1.5-.68 1.5-1.5 1.5zM19 5v4H5V5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5C6.18 8.5 5.5 7.82 5.5 7S6.18 5.5 7 5.5s1.5.68 1.5 1.5-.68 1.5-1.5 1.5z" fill="currentColor"/></svg>',
                onSelect: function () { _this.checkServers(() => _this.open()); }
            });

            // 3. Додаємо в Шапку (Header)
            var btn = $('<div class="header__item selector"><svg height="24" viewBox="0 0 24 24" width="24" fill="white"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.68-1.5-1.5s.68-1.5 1.5-1.5 1.5.68 1.5 1.5-.68 1.5-1.5 1.5zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5C6.18 8.5 5.5 7.82 5.5 7S6.18 5.5 7 5.5s1.5.68 1.5 1.5-.68 1.5-1.5 1.5z"/></svg></div>');
            btn.on('hover:enter', function () { _this.checkServers(() => _this.open()); });
            $('.header__items').prepend(btn);
        };
    }

    if (window.appready) new ServerSwitcher().create();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') new ServerSwitcher().create();
        });
    }
})();


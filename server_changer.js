(function () {
    'use strict';

    function ServerSwitcher() {
        var _this = this;
        var servers = [
            { name: 'Lampa (MX)', url: 'http://lampa.mx' },
            { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app/' },
            { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
            { name: 'Lampa (NNMTV)', url: 'http://lam.nnmtv.pw' }
        ];

        this.start = function () {
            this.addSettings();
            this.addMenu();
            this.addHeader();
        };

        // Логіка перевірки серверів
        this.checkServers = function (callback) {
            var count = 0;
            Lampa.Noty.show('Перевірка статусів...');
            
            servers.forEach(function (serv) {
                var start = Date.now();
                fetch(serv.url, { mode: 'no-cors' }).then(function() {
                    serv.status = 'online';
                    serv.ping = Date.now() - start;
                    next();
                }).catch(function() {
                    serv.status = 'offline';
                    next();
                });
            });

            function next() {
                count++;
                if (count === servers.length) callback();
            }
        };

        this.showSelect = function () {
            Lampa.Select.show({
                title: 'Вибір сервера',
                items: servers.map(function(s) {
                    return {
                        title: s.name,
                        subtitle: s.status === 'online' ? 'Доступний (' + (s.ping || 0) + 'ms)' : 'Недоступний',
                        server: s
                    };
                }),
                onSelect: function (item) {
                    if (item.server.status !== 'online') {
                        Lampa.Noty.show('Сервер недоступний!');
                        return;
                    }
                    Lampa.Storage.set('server_url', item.server.url);
                    Lampa.Noty.show('Сервер змінено: ' + item.server.name);
                    setTimeout(function() { window.location.reload(); }, 800);
                },
                onBack: function () {
                    Lampa.Controller.toggle('settings');
                }
            });
        };

        // 1. Інтеграція в Налаштування
        this.addSettings = function () {
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main') {
                    var item = $('<div class="settings-param selector" data-type="button"><div class="settings-param__name">Змінити сервер</div><div class="settings-param__value">Вибрати зі списку</div></div>');
                    item.on('hover:enter', function () {
                        _this.checkServers(function() { _this.showSelect(); });
                    });
                    e.body.find('.settings-list').append(item);
                }
            });
        };

        // 2. Інтеграція в Бічне меню
        this.addMenu = function () {
            var menu_item = {
                id: 'server_switcher',
                title: 'Сервери',
                icon: '<svg height="36" viewBox="0 0 24 24" width="36" fill="currentColor"><path d="M15 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.68-1.5-1.5s.68-1.5 1.5-1.5 1.5.68 1.5 1.5-.68 1.5-1.5 1.5z"/></svg>',
                onSelect: function () {
                    _this.checkServers(function() { _this.showSelect(); });
                }
            };
            Lampa.Menu.add(menu_item);
        };

        // 3. Інтеграція в Шапку
        this.addHeader = function () {
            var icon = '<svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.68-1.5-1.5s.68-1.5 1.5-1.5 1.5.68 1.5 1.5-.68 1.5-1.5 1.5z"/></svg>';
            Lampa.Header.add({
                id: 'server_switcher',
                icon: icon,
                onSelect: function () {
                    _this.checkServers(function() { _this.showSelect(); });
                }
            });
        };
    }

    // Реєстрація та запуск
    if (window.appready) {
        new ServerSwitcher().start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') new ServerSwitcher().start();
        });
    }
})();

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
            // Додаємо в налаштування (найбільш стабільний метод)
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'interface') { // Додаємо в розділ "Інтерфейс"
                    var item = $('<div class="settings-param selector" data-type="button" data-name="server_change">' +
                        '<div class="settings-param__name">Змінити сервер</div>' +
                        '<div class="settings-param__value">Натисніть для вибору</div>' +
                        '</div>');

                    item.on('hover:enter', function () {
                        _this.checkServers(function() { _this.showSelect(); });
                    });

                    e.body.find('[data-name="interface_size"]').before(item);
                }
            });

            // Додаємо в бічне меню через тайм-аут, щоб компоненти встигли завантажитись
            setTimeout(function() {
                if (Lampa.Menu) {
                    Lampa.Menu.add({
                        id: 'server_switcher',
                        title: 'Сервери',
                        icon: '<svg height="36" viewBox="0 0 24 24" width="36" fill="currentColor"><path d="M15 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.68-1.5-1.5s.68-1.5 1.5-1.5 1.5.68 1.5 1.5-.68 1.5-1.5 1.5z"/></svg>',
                        onSelect: function () {
                            _this.checkServers(function() { _this.showSelect(); });
                        }
                    });
                }
            }, 1000);
        };

        this.checkServers = function (callback) {
            var count = 0;
            Lampa.Noty.show('Перевірка статусів...');
            
            servers.forEach(function (serv) {
                var start = Date.now();
                var img = new Image(); // Найнадійніший спосіб пінгу без CORS помилок
                img.onload = function() { serv.status = 'online'; serv.ping = Date.now() - start; next(); };
                img.onerror = function() { serv.status = 'online'; serv.ping = Date.now() - start; next(); }; // Навіть помилка означає, що сервер відповів
                img.src = serv.url + '/favicon.ico?' + Math.random();
                
                setTimeout(function() { if(!serv.status) { serv.status = 'offline'; next(); } }, 3000);
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
                    var color = s.status === 'online' ? '#4caf50' : '#f44336';
                    return {
                        title: s.name,
                        subtitle: '<span style="color:' + color + '">●</span> ' + (s.status === 'online' ? 'Доступний' : 'Офлайн'),
                        server: s
                    };
                }),
                onSelect: function (item) {
                    if (item.server.status !== 'online') {
                        Lampa.Noty.show('Сервер недоступний!');
                        return;
                    }
                    // В Lampa сервер зберігається в налаштуваннях під ключем 'server_proxy' або власною логікою
                    localStorage.setItem('lampa_custom_server', item.server.url);
                    Lampa.Noty.show('Налаштовано: ' + item.server.name);
                    setTimeout(function() { location.reload(); }, 500);
                }
            });
        };
    }

    // Офіційний запуск плагіна
    if (window.appready) new ServerSwitcher().start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') new ServerSwitcher().start();
        });
    }
})();

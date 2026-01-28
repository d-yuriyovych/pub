(function () {
    'use strict';

    if (window.server_changer_installed) return;
    window.server_changer_installed = true;

    var servers = [
        { name: 'Lampa (MX)', url: 'http://lampa.mx' },
        { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app/' },
        { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
        { name: 'Lampa (NNMTV)', url: 'http://lam.nnmtv.pw' }
    ];

    function openServerManager() {
        var selected_url = '';
        
        // 1. Спочатку перевіряємо сервери (ping)
        Lampa.Noty.show('Перевірка серверів...');
        
        var promises = servers.map(function(server) {
            return new Promise(function(resolve) {
                var img = new Image();
                var start = Date.now();
                img.onload = function() { server.status = 'online'; server.ping = Date.now() - start; resolve(); };
                img.onerror = function() { server.status = 'online'; server.ping = Date.now() - start; resolve(); }; // Більшість заблокують CORS, томуonerror теж рахуємо як "живий"
                img.src = server.url + '/favicon.ico?' + Math.random();
                setTimeout(function() { if(!server.status) server.status = 'offline'; resolve(); }, 2000);
            });
        });

        Promise.all(promises).then(function() {
            var items = servers.map(function(s) {
                var is_online = s.status === 'online';
                return {
                    title: s.name,
                    subtitle: is_online ? '<span style="color:#46b85a">Доступний (' + s.ping + 'ms)</span>' : '<span style="color:#d24a4a">Недоступний</span>',
                    url: s.url,
                    ghost: !is_online, // Недоступні не можна вибрати
                    icon: is_online ? '<div style="width:10px;height:10px;background:#46b85a;border-radius:50%"></div>' : '<div style="width:10px;height:10px;background:#d24a4a;border-radius:50%"></div>'
                };
            });

            // Додаємо кнопку "ЗМІНИТИ" в кінець списку
            items.push({
                title: '<b>ЗМІНИТИ СЕРВЕР</b>',
                action: 'confirm',
                separator: true
            });

            Lampa.Select.show({
                title: 'Вибір сервера',
                items: items,
                onSelect: function(item) {
                    if (item.action === 'confirm') {
                        if (!selected_url) {
                            Lampa.Noty.show('Спочатку оберіть робочий сервер зі списку!');
                        } else {
                            Lampa.Storage.set('server_url', selected_url);
                            Lampa.Noty.show('Сервер змінено! Перезавантаження...');
                            setTimeout(function() { location.reload(); }, 500);
                        }
                    } else {
                        selected_url = item.url;
                        Lampa.Noty.show('Обрано: ' + item.title + '. Тепер натисніть "ЗМІНИТИ"');
                    }
                },
                onBack: function() {
                    Lampa.Controller.toggle('content');
                }
            });
        });
    }

    // --- Реєстрація всюди ---
    function start() {
        // 1. Бічне меню (Sidebar)
        Lampa.Menu.add({
            id: 'server_changer',
            title: 'Змінити сервер',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 10h20M2 15h20"/></svg>',
            onSelect: openServerManager
        });

        // 2. Шапка (Head)
        var head_btn = $('<div class="head__action selector button--server-change"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></div>');
        head_btn.on('hover:enter', openServerManager);
        $('.head .head__actions').prepend(head_btn);

        // 3. Налаштування (через SettingsApi)
        if (Lampa.SettingsApi) {
            Lampa.SettingsApi.addComponent({
                component: 'server_changer_set',
                name: 'Server Changer',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>'
            });
            Lampa.SettingsApi.addParam({
                component: 'server_changer_set',
                param: { name: 'run', type: 'button' },
                field: { name: 'Запустити зміну', description: 'Відкрити список доступних серверів' },
                onChange: openServerManager
            });
        }
    }

    // Очікування готовності Lampa
    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();

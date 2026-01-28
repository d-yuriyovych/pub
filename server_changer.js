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

    var current_url = Lampa.Storage.get('server_url') || 'Стандартний';

    function openServerManager() {
        var selected_item = null;
        
        Lampa.Noty.show('Перевірка зв\'язку...');

        // Пінгуємо всі сервери
        var promises = servers.map(function(s) {
            return new Promise(function(resolve) {
                var img = new Image();
                var start = Date.now();
                img.onload = function() { s.status = 'online'; s.ping = Date.now() - start; resolve(); };
                img.onerror = function() { s.status = 'online'; s.ping = Date.now() - start; resolve(); };
                img.src = s.url + '/favicon.ico?' + Math.random();
                setTimeout(function() { if(!s.status) s.status = 'offline'; resolve(); }, 2500);
            });
        });

        Promise.all(promises).then(function() {
            var items = servers.map(function(s) {
                var is_active = (s.url === current_url || s.url + '/' === current_url);
                var is_online = s.status === 'online';
                
                return {
                    title: s.name + (is_active ? ' (Поточний)' : ''),
                    subtitle: is_online ? '<span style="color:#46b85a">Онлайн: ' + s.ping + 'ms</span>' : '<span style="color:#d24a4a">Офлайн</span>',
                    url: s.url,
                    ghost: !is_online,
                    selected: is_active
                };
            });

            items.push({
                title: '<b>ПІДТВЕРДИТИ ЗМІНУ</b>',
                action: 'confirm',
                separator: true
            });

            Lampa.Select.show({
                title: 'Сервери (Зараз: ' + current_url + ')',
                items: items,
                onSelect: function(item) {
                    if (item.action === 'confirm') {
                        if (selected_item) {
                            Lampa.Storage.set('server_url', selected_item.url);
                            Lampa.Noty.show('Сервер змінено! Перезавантаження...');
                            setTimeout(function() { location.reload(); }, 500);
                        } else {
                            Lampa.Noty.show('Спершу виберіть доступний сервер зі списку');
                        }
                    } else {
                        selected_item = item;
                        Lampa.Noty.show('Обрано: ' + item.title);
                    }
                },
                onBack: function() {
                    Lampa.Controller.toggle('content');
                }
            });
        });
    }

    function startPlugin() {
        // 1. Додавання в БІЧНЕ МЕНЮ
        Lampa.Menu.add({
            id: 'server_changer',
            title: 'Змінити сервер',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
            onSelect: openServerManager
        });

        // 2. Додавання в ШАПКУ (через таймер, щоб Lampa встигла відрендерити head)
        var checkHead = setInterval(function(){
            if ($('.head__actions').length) {
                if ($('.button--server-change').length) return; // вже є
                var head_btn = $('<div class="head__action selector button--server-change" title="Сервер: ' + current_url + '"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>');
                head_btn.on('hover:enter click', openServerManager);
                $('.head__actions').prepend(head_btn);
                clearInterval(checkHead);
            }
        }, 1000);

        // 3. Додавання в НАЛАШТУВАННЯ
        Lampa.SettingsApi.addComponent({
            component: 'server_changer_set',
            name: 'Server Changer',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 10h20M2 15h20"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'server_changer_set',
            param: { name: 'current_srv', type: 'static' },
            field: { name: 'Поточний сервер', description: current_url }
        });

        Lampa.SettingsApi.addParam({
            component: 'server_changer_set',
            param: { name: 'run_btn', type: 'button' },
            field: { name: 'Відкрити список', description: 'Перевірити статус та змінити адресу' },
            onChange: openServerManager
        });
    }

    // Чекаємо повної готовності
    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });
})();

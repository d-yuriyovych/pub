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

    // --- Функціонал перевірки та вибору ---
    function openServerManager() {
        var items = [];
        var selected_server = null;
        var modal = $('<div></div>');
        
        Lampa.Noty.show('Перевірка з\'єднання...');

        var check_count = 0;
        servers.forEach(function(server) {
            var start = Date.now();
            var status_img = new Image();
            
            var finalize = function(is_ok) {
                server.ping = Date.now() - start;
                server.status = is_ok ? 'online' : 'offline';
                check_count++;
                if (check_count === servers.length) renderList();
            };

            status_img.onload = function() { finalize(true); };
            status_img.onerror = function() { finalize(true); }; // Фавікон може не вантажитись, але сервер відповість
            status_img.src = server.url + '/favicon.ico?' + Math.random();
            
            setTimeout(function() { if (!server.status) finalize(false); }, 3000);
        });

        function renderList() {
            var menu_items = servers.map(function(s) {
                var color = s.status === 'online' ? '#46b85a' : '#d24a4a';
                return {
                    title: s.name,
                    subtitle: '<span style="color:'+color+'">' + (s.status === 'online' ? 'Доступний ('+s.ping+'ms)' : 'Недоступний') + '</span>',
                    url: s.url,
                    ghost: s.status !== 'online'
                };
            });

            Lampa.Select.show({
                title: 'Оберіть сервер',
                items: menu_items,
                onSelect: function(item) {
                    selected_server = item;
                    confirmChange(item);
                },
                onBack: function() {
                    Lampa.Controller.toggle('head');
                }
            });
        }

        function confirmChange(server) {
            Lampa.Select.show({
                title: 'Підтвердити зміну',
                items: [
                    { title: 'Змінити на ' + server.title, change: true },
                    { title: 'Відміна', cancel: true }
                ],
                onSelect: function(item) {
                    if (item.change) {
                        Lampa.Storage.set('server_url', server.url);
                        Lampa.Noty.show('Сервер змінено на ' + server.url);
                        setTimeout(function() { location.reload(); }, 800);
                    } else {
                        renderList();
                    }
                }
            });
        }
    }

    // --- Реєстрація в Налаштуваннях (як у Bandera) ---
    function initSettings() {
        var Settings = Lampa.SettingsApi || Lampa.Settings;
        
        Settings.addComponent({
            component: 'server_changer',
            name: 'Server Changer',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M2 10h20M2 15h20" stroke="currentColor" stroke-width="2"/></svg>'
        });

        Settings.addParam({
            component: 'server_changer',
            param: { name: 'open_list', type: 'button' },
            field: { name: 'Керування серверами', description: 'Перевірка статусу та зміна дзеркала' },
            onChange: openServerManager
        });
    }

    // --- Додавання всюди ---
    function start() {
        // 1. У шапку (біля пошуку/налаштувань)
        var head_item = $('<div class="head__action selector button--server" title="Змінити сервер">' +
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
        '</div>');
        
        head_item.on('hover:enter', openServerManager);
        $('.head .head__actions').prepend(head_item);

        // 2. У бічне меню
        Lampa.Menu.add({
            id: 'server_changer',
            title: 'Сервер',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18"/></svg>',
            onSelect: openServerManager
        });

        // 3. У налаштування
        initSettings();
    }

    // Запуск після готовності програми
    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') start(); });

})();

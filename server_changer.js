(function () {
    'use strict';

    // Захист від повторного запуску
    if (window.server_changer_installed) return;
    window.server_changer_installed = true;

    // Список серверів
    var servers = [
        { name: 'Lampa (MX)', url: 'http://lampa.mx' },
        { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app/' },
        { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
        { name: 'Lampa (NNMTV)', url: 'http://lam.nnmtv.pw' }
    ];

    // Функція відкриття модального вікна з вибором
    function openServerSelector() {
        Lampa.Noty.show('Перевірка серверів...');
        
        var count = 0;
        servers.forEach(function (s) {
            var start = Date.now();
            var img = new Image();
            img.onload = function () { s.ping = Date.now() - start; s.status = 'online'; next(); };
            img.onerror = function () { s.ping = Date.now() - start; s.status = 'online'; next(); };
            img.src = s.url + '/favicon.ico?' + Math.random();
            setTimeout(function () { if (!s.status) { s.status = 'offline'; next(); } }, 2000);
        });

        function next() {
            count++;
            if (count === servers.length) {
                Lampa.Select.show({
                    title: 'Оберіть сервер Lampa',
                    items: servers.map(function (s) {
                        return {
                            title: s.name,
                            subtitle: s.status === 'online' ? 'Працює (' + s.ping + 'ms)' : 'Недоступний',
                            url: s.url,
                            ghost: s.status !== 'online'
                        };
                    }),
                    onSelect: function (item) {
                        if (item.ghost) {
                            Lampa.Noty.show('Сервер офлайн');
                            return;
                        }
                        Lampa.Storage.set('server_url', item.url);
                        Lampa.Noty.show('Сервер змінено! Перезавантаження...');
                        setTimeout(function () { location.reload(); }, 1000);
                    },
                    onBack: function () {
                        Lampa.Controller.toggle('settings_component'); // Повертаємо фокус у налаштування
                    }
                });
            }
        }
    }

    function initSettings() {
        var Settings = Lampa.SettingsApi || Lampa.Settings;
        
        // 1. Створюємо новий розділ у налаштуваннях
        Settings.addComponent({
            component: 'server_changer',
            name: 'Server Changer',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 15V19H5V15H19ZM20 13H4C3.45 13 3 13.45 3 14V20C3 20.55 3.45 21 4 21H20C20.55 21 21 20.55 21 20V14C21 13.45 20.55 13 20 13ZM19 5V9H5V5H19ZM20 3H4C3.45 3 3 3.45 3 4V10C3 10.55 3.45 11 4 11H20C20.55 11 21 10.55 21 10V4C21 3.45 20.55 3 20 3Z" fill="currentColor"/></svg>'
        });

        // 2. Додаємо кнопку всередину цього розділу
        Settings.addParam({
            component: 'server_changer',
            param: {
                name: 'open_switcher',
                type: 'button'
            },
            field: {
                name: 'Змінити адресу сервера',
                description: 'Натисніть, щоб обрати інше дзеркало Lampa'
            },
            onChange: function () {
                openServerSelector();
            }
        });
        
        // Додатково додаємо в бічне меню для швидкого доступу
        Lampa.Menu.add({
            id: 'server_changer_menu',
            title: 'Сервери',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12,11L12,19L5,19L5,11L12,11M13,9L4,9L4,21L13,21L13,9ZM20,11L20,19L13,19L13,11L20,11M21,9L12,9L12,21L21,21L21,9ZM12,3L12,8L5,8L5,3L12,3M13,1L4,1L4,10L13,10L13,1ZM20,3L20,8L13,8L13,3L20,3M21,1L12,1L12,10L21,10L21,1Z" /></svg>',
            onSelect: openServerSelector
        });
    }

    // Запуск
    if (window.appready) initSettings();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') initSettings();
        });
    }
})();

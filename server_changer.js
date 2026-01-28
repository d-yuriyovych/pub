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

    var current_url = Lampa.Storage.get('server_url') || 'lampa.mx';

    // Головна функція вибору
    var openChanger = function () {
        Lampa.Noty.show('Перевірка серверів...');
        
        var server_items = [];
        var selected_url = '';

        // Перевірка статусів
        var check_all = servers.map(function(s) {
            return new Promise(function(resolve) {
                var img = new Image();
                var start = Date.now();
                img.onload = function() { s.status = 'online'; s.ping = Date.now() - start; resolve(); };
                img.onerror = function() { s.status = 'online'; s.ping = Date.now() - start; resolve(); };
                img.src = s.url + '/favicon.ico?' + Math.random();
                setTimeout(function() { if(!s.status) s.status = 'offline'; resolve(); }, 2000);
            });
        });

        Promise.all(check_all).then(function() {
            server_items = servers.map(function(s) {
                var is_online = s.status === 'online';
                var is_curr = (s.url === current_url || s.url + '/' === current_url);
                return {
                    title: s.name + (is_curr ? ' (Поточний)' : ''),
                    subtitle: is_online ? '<span style="color:#46b85a">Online (' + s.ping + 'ms)</span>' : '<span style="color:#d24a4a">Offline</span>',
                    url: s.url,
                    ghost: !is_online
                };
            });

            server_items.push({
                title: '<b style="color:#ffde1a">ЗМІНИТИ СЕРВЕР</b>',
                action: 'apply',
                separator: true
            });

            Lampa.Select.show({
                title: 'Сервер: ' + current_url,
                items: server_items,
                onSelect: function(item) {
                    if (item.action === 'apply') {
                        if (selected_url) {
                            Lampa.Storage.set('server_url', selected_url);
                            Lampa.Noty.show('Сервер змінено! Перезавантаження...');
                            setTimeout(function() { location.reload(); }, 500);
                        } else {
                            Lampa.Noty.show('Спочатку виберіть робочий сервер');
                        }
                    } else {
                        selected_url = item.url;
                        Lampa.Noty.show('Обрано: ' + item.title);
                    }
                },
                onBack: function() { Lampa.Controller.toggle('content'); }
            });
        });
    };

    // Компонент для налаштувань (як у Bandera)
    function ServerComponent(object) {
        this.create = function () { return null; };
        this.prepare = function () { openChanger(); };
        this.render = function () { return null; };
        this.destroy = function () { };
    }

    function init() {
        // 1. Додаємо в Налаштування (через офіційний метод)
        Lampa.Component.add('server_changer', ServerComponent);
        
        var set_item = {
            component: 'server_changer',
            name: 'Server Changer',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 10h20M2 15h20"/></svg>'
        };

        if (Lampa.SettingsApi) Lampa.SettingsApi.addComponent(set_item);
        else if (Lampa.Settings.addComponent) Lampa.Settings.addComponent(set_item);

        // 2. Додаємо в Бічне Меню
        Lampa.Menu.add({
            id: 'server_changer_menu',
            title: 'Змінити сервер',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12,11L12,19L5,19L5,11L12,11M13,9L4,9L4,21L13,21L13,9ZM20,11L20,19L13,19L13,11L20,11M21,9L12,9L12,21L21,21L21,9ZM12,3L12,8L5,8L5,3L12,3M13,1L4,1L4,10L13,10L13,1ZM20,3L20,8L13,8L13,3L20,3M21,1L12,1L12,10L21,10L21,1Z" /></svg>',
            onSelect: openChanger
        });

        // 3. Додаємо в Шапку (прямий метод)
        var head_icon = $('<div class="head__action selector button--server-changer" title="Змінити сервер">' +
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
        '</div>');

        head_icon.on('hover:enter click', openChanger);
        
        // Використовуємо таймер, щоб точно вставити після рендеру шапки
        var waitHead = setInterval(function() {
            if ($('.head__actions').length) {
                $('.head__actions').prepend(head_icon);
                clearInterval(waitHead);
            }
        }, 500);
    }

    // Реєстрація плагіна в системі Lampa
    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') init(); });
})();

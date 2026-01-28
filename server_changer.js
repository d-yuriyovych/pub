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

    // Функція запуску вікна вибору
    var openMenu = function () {
        var current = Lampa.Storage.get('server_url') || 'lampa.mx';
        var selected_url = '';

        // Пінгуємо для статусів
        Lampa.Noty.show('Перевірка серверів...');
        var promises = servers.map(function(s) {
            return new Promise(function(resolve) {
                var img = new Image();
                var start = Date.now();
                img.onload = img.onerror = function() { s.status = 'online'; s.p = Date.now() - start; resolve(); };
                img.src = s.url + '/favicon.ico?' + Math.random();
                setTimeout(function() { if(!s.status) s.status = 'offline'; resolve(); }, 2000);
            });
        });

        Promise.all(promises).then(function() {
            var items = servers.map(function(s) {
                var is_curr = (s.url === current || s.url + '/' === current);
                return {
                    title: s.name + (is_curr ? ' ✅' : ''),
                    subtitle: s.status === 'online' ? '<span style="color:#46b85a">Онлайн ('+s.p+'ms)</span>' : '<span style="color:#d24a4a">Офлайн</span>',
                    url: s.url,
                    ghost: s.status !== 'online'
                };
            });

            items.push({
                title: '<b style="color:#ffde1a">ЗМІНИТИ СЕРВЕР</b>',
                action: 'apply',
                separator: true
            });

            Lampa.Select.show({
                title: 'Поточний: ' + current,
                items: items,
                onSelect: function(item) {
                    if (item.action === 'apply') {
                        if (selected_url) {
                            Lampa.Storage.set('server_url', selected_url);
                            location.reload();
                        } else Lampa.Noty.show('Спочатку виберіть сервер!');
                    } else {
                        selected_url = item.url;
                        Lampa.Noty.show('Обрано: ' + item.title);
                    }
                },
                onBack: function() { Lampa.Controller.toggle('content'); }
            });
        });
    };

    // 1. Реєстрація компонента (ЯК У ПРИКЛАДІ БАНДЕРИ)
    Lampa.Component.add('server_changer', function (object) {
        this.create = function () {};
        this.render = function () { return null; };
        this.prepare = function () { openMenu(); };
        this.destroy = function () {};
    });

    function start() {
        // 2. Додавання в НАЛАШТУВАННЯ (Як у тебе запрацювало)
        Lampa.SettingsApi.addComponent({
            component: 'server_changer',
            name: 'Server Changer',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 10h20M2 15h20"/></svg>'
        });

        // 3. Додавання в БІЧНЕ МЕНЮ
        Lampa.Menu.add({
            id: 'server_changer_menu',
            title: 'Змінити сервер',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM11 19.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"/></svg>',
            onSelect: openMenu
        });

        // 4. Додавання в ШАПКУ
        var head_icon = $('<div class="head__action selector button--server-change"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>');
        head_icon.on('click hover:enter', openMenu);
        
        setInterval(function() {
            if ($('.head__actions').length && !$('.button--server-change').length) {
                $('.head__actions').prepend(head_icon);
            }
        }, 2000);
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });

})();

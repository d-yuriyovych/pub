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

    // Головна функція інтерфейсу
    function runChanger() {
        Lampa.Noty.show('Перевірка серверів...');
        var selected_url = '';

        var promises = servers.map(function(s) {
            return new Promise(function(resolve) {
                var img = new Image();
                var start = Date.now();
                img.onload = img.onerror = function() { s.status = 'online'; s.p = Date.now()-start; resolve(); };
                img.src = s.url + '/favicon.ico?' + Math.random();
                setTimeout(function() { if(!s.status) s.status = 'offline'; resolve(); }, 2000);
            });
        });

        Promise.all(promises).then(function() {
            var items = servers.map(function(s) {
                var is_curr = (s.url === current_url || s.url + '/' === current_url);
                return {
                    title: s.name + (is_curr ? ' — [ПОТОЧНИЙ]' : ''),
                    subtitle: s.status === 'online' ? 'Доступний ('+s.p+'ms)' : 'НЕРОБОЧИЙ',
                    url: s.url,
                    ghost: s.status !== 'online'
                };
            });

            items.push({
                title: '<b>ЗМІНИТИ СЕРВЕР</b>',
                action: 'apply',
                separator: true
            });

            Lampa.Select.show({
                title: 'Сервер: ' + current_url,
                items: items,
                onSelect: function(item) {
                    if (item.action === 'apply') {
                        if (selected_url) {
                            Lampa.Storage.set('server_url', selected_url);
                            location.reload();
                        } else Lampa.Noty.show('Оберіть сервер зі списку!');
                    } else {
                        selected_url = item.url;
                        Lampa.Noty.show('Обрано: ' + item.title);
                    }
                },
                onBack: function() { Lampa.Controller.toggle('content'); }
            });
        });
    }

    // Реєстрація компонента (як у Bandera Online)
    Lampa.Component.add('server_changer', function (object) {
        this.create = function () {};
        this.render = function () { return null; };
        this.prepare = function () { runChanger(); };
        this.destroy = function () {};
    });

    function startPlugin() {
        // 1. Пряме додавання в БІЧНЕ МЕНЮ (Side Menu)
        var menu_item = {
            id: 'server_changer',
            title: 'Змінити сервер',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
            onSelect: runChanger
        };
        Lampa.Menu.add(menu_item);

        // 2. Пряме додавання в НАЛАШТУВАННЯ (через хук рендеру)
        Lampa.Listener.follow('settings', function (e) {
            if (e.type === 'open') {
                setTimeout(function() {
                    if ($('.settings-folder[data-component="server_changer"]').length) return;
                    var btn = $('<div class="settings-folder selector" data-component="server_changer"><div class="settings-folder__icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><rect x="2" y="3" width="20" height="18" rx="2" stroke="white" stroke-width="2"/><path d="M2 10h20M2 15h20" stroke="white" stroke-width="2"/></svg></div><div class="settings-folder__name">Server Changer</div></div>');
                    btn.on('click', runChanger);
                    $('.settings__content').append(btn);
                    Lampa.Controller.update();
                }, 100);
            }
        });

        // 3. Додавання в ШАПКУ (Head)
        var head_btn = $('<div class="head__action selector button--server-change"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></div>');
        head_btn.on('click', runChanger);
        
        setInterval(function() {
            if ($('.head__actions').length && !$('.button--server-change').length) {
                $('.head__actions').prepend(head_btn);
            }
        }, 1000);
    }

    // Офіційний старт
    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });
})();

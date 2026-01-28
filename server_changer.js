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

    function openManager() {
        var selected_url = '';
        Lampa.Noty.show('Перевірка зв\'язку...');

        var promises = servers.map(function(s) {
            return new Promise(function(resolve) {
                var img = new Image();
                var start = Date.now();
                img.onload = img.onerror = function() { s.status = 'online'; s.ping = Date.now() - start; resolve(); };
                img.src = s.url + '/favicon.ico?' + Math.random();
                setTimeout(function() { if(!s.status) s.status = 'offline'; resolve(); }, 2000);
            });
        });

        Promise.all(promises).then(function() {
            var items = servers.map(function(s) {
                var is_curr = (s.url === current_url || s.url + '/' === current_url);
                return {
                    title: s.name + (is_curr ? ' 🟢' : ''),
                    subtitle: s.status === 'online' ? '<span style="color:#46b85a">Online ('+s.ping+'ms)</span>' : '<span style="color:#d24a4a">Offline</span>',
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
                title: 'Поточний: ' + current_url,
                items: items,
                onSelect: function(item) {
                    if (item.action === 'apply') {
                        if (selected_url) {
                            Lampa.Storage.set('server_url', selected_url);
                            Lampa.Noty.show('Зміна сервера...');
                            setTimeout(function() { location.reload(); }, 300);
                        } else {
                            Lampa.Noty.show('Спочатку виберіть сервер!');
                        }
                    } else {
                        selected_url = item.url;
                        Lampa.Noty.show('Обрано: ' + item.title);
                    }
                },
                onBack: function() {
                    Lampa.Controller.toggle('content');
                }
            });
        });
    }

    // 1. РЕЄСТРАЦІЯ КОМПОНЕНТА (Логіка Bandera)
    Lampa.Component.add('server_changer', function (object) {
        this.create = function () {};
        this.render = function () { return null; };
        this.prepare = function () { openManager(); };
        this.destroy = function () {};
    });

    function init() {
        // 2. ВСТАВКА В ШАПКУ (Залізобетонна)
        var head_icon = $('<div class="head__action selector button--server-change"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>');
        head_icon.on('click hover:enter', openManager);
        
        setInterval(function() {
            if ($('.head__actions').length && !$('.button--server-change').length) {
                $('.head__actions').prepend(head_icon);
            }
        }, 1000);

        // 3. ВСТАВКА В БІЧНЕ МЕНЮ
        Lampa.Menu.add({
            id: 'server_changer_menu',
            title: 'Змінити сервер',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.36.18-.57.18s-.41-.09-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.36-.18.57-.18s.41.09.57.18l7.9 4.44c.32.17.53.5.53.88v9z"/></svg>',
            onSelect: openManager
        });

        // 4. ВСТАВКА В НАЛАШТУВАННЯ (Метод прямого додавання)
        Lampa.Listener.follow('settings', function (e) {
            if (e.type === 'open' && e.name === 'main') {
                setTimeout(function() {
                    var btn = $('<div class="settings-folder selector" data-component="server_changer">' +
                        '<div class="settings-folder__icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 10h20M2 15h20"/></svg></div>' +
                        '<div class="settings-folder__name">Server Changer</div>' +
                    '</div>');
                    
                    btn.on('click hover:enter', function() {
                        Lampa.Activity.push({
                            title: 'Server Changer',
                            component: 'server_changer'
                        });
                    });

                    $('.settings__content').append(btn);
                    Lampa.Controller.update(); 
                }, 10);
            }
        });
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });

})();

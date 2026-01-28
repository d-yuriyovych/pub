(function () {
    'use strict';

    if (window.server_changer_installed) return;
    window.server_changer_installed = true;

    // --- Коректна реєстрація компонента (як у Bandera) ---
    Lampa.Component.add('server_changer', function (object) {
        var _this = this;
        var current = Lampa.Storage.get('server_url') || 'lampa.mx';
        var selected_url = '';
        
        this.create = function () {};

        this.prepare = function () {
            var servers = [
                { name: 'Lampa (MX)', url: 'http://lampa.mx' },
                { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app/' },
                { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
                { name: 'Lampa (NNMTV)', url: 'http://lam.nnmtv.pw' }
            ];

            Lampa.Noty.show('Перевірка статусів...');

            // Перевірка доступності
            var promises = servers.map(function(s) {
                return new Promise(function(resolve) {
                    var img = new Image();
                    img.onload = img.onerror = function() { s.status = 'online'; resolve(); };
                    img.src = s.url + '/favicon.ico?' + Math.random();
                    setTimeout(function() { if(!s.status) s.status = 'offline'; resolve(); }, 2000);
                });
            });

            Promise.all(promises).then(function() {
                var items = servers.map(function(s) {
                    var is_curr = (s.url === current || s.url + '/' === current);
                    return {
                        title: s.name + (is_curr ? ' ✅' : ''),
                        subtitle: s.status === 'online' ? '<span style="color:#46b85a">Доступний</span>' : '<span style="color:#d24a4a">Недоступний</span>',
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
                            } else Lampa.Noty.show('Спочатку оберіть сервер!');
                        } else {
                            selected_url = item.url;
                            Lampa.Noty.show('Обрано: ' + item.title);
                        }
                    },
                    onBack: function() {
                        Lampa.Activity.backward(); // Повернення за логікою Activity
                    }
                });
            });
        };

        this.render = function () { return null; };
        this.destroy = function () {};
    });

    // --- Інтеграція в інтерфейс ---
    function init() {
        // 1. Додавання в налаштування (через SettingsApi)
        Lampa.SettingsApi.addComponent({
            component: 'server_changer',
            name: 'Server Changer',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 10h20M2 15h20"/></svg>'
        });

        // 2. Додавання в бічне меню
        Lampa.Menu.add({
            id: 'server_changer',
            title: 'Змінити сервер',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
            onSelect: function() {
                Lampa.Activity.push({
                    title: 'Server Changer',
                    component: 'server_changer',
                    page: 1
                });
            }
        });

        // 3. Додавання в шапку
        var addHead = function() {
            if ($('.head__actions').length && !$('.button--server-change').length) {
                var head_btn = $('<div class="head__action selector button--server-change"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></div>');
                head_btn.on('click', function() {
                    Lampa.Activity.push({ title: 'Server Changer', component: 'server_changer', page: 1 });
                });
                $('.head__actions').prepend(head_btn);
            }
        };

        // Постійна перевірка шапки (Lampa її часто перемальовує)
        setInterval(addHead, 2000);
    }

    // Запуск плагіна
    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') init(); });

})();

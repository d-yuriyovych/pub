(function () {
    'use strict';

    var LampaServerChanger = function (api) {
        var servers = [
            { name: 'Lampa (MX)', url: 'http://lampa.mx' },
            { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app/' },
            { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
            { name: 'Lampa (NNMTV)', url: 'http://lam.nnmtv.pw' }
        ];

        var selected_url = '';
        var current_url = Lampa.Storage.get('server_url') || 'lampa.mx';

        // Функція виклику вікна
        function open() {
            Lampa.Noty.show('Перевірка серверів...');
            
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
                    var is_curr = (s.url === current_url || s.url + '/' === current_url);
                    return {
                        title: s.name + (is_curr ? ' ✅' : ''),
                        subtitle: s.status === 'online' ? '<span style="color:#46b85a">Онлайн</span>' : '<span style="color:#d24a4a">Офлайн</span>',
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
                                location.reload();
                            } else Lampa.Noty.show('Спершу оберіть сервер!');
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

        // Реєстрація в налаштуваннях
        api.Settings.addComponent({
            component: 'server_changer',
            name: 'Server Changer',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 10h20M2 15h20"/></svg>'
        });

        api.Component.add('server_changer', function () {
            this.prepare = function () { open(); };
            this.render = function () { return null; };
        });

        // Додавання в бічне меню
        api.Menu.add({
            id: 'server_changer',
            title: 'Змінити сервер',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
            onSelect: open
        });

        // Додавання в шапку (через нативний метод додавання кнопок)
        var head_btn = $('<div class="head__action selector button--server-change"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></div>');
        head_btn.on('click', open);
        
        // Вставляємо в шапку
        $('.head__actions').prepend(head_btn);
    };

    // Офіційний метод реєстрації плагіна в Lampa
    if (window.Lampa) {
        Lampa.Plugins.add('server_changer', LampaServerChanger);
    }
})();

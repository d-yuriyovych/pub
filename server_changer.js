(function () {
    'use strict';

    // Щоб уникнути дублікатів, перевіряємо чи плагін вже запущено
    if (window.server_changer_installed) return;
    window.server_changer_installed = true;

    function ServerChanger() {
        var _this = this;
        var servers = [
            { name: 'Lampa (MX)', url: 'http://lampa.mx' },
            { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app/' },
            { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
            { name: 'Lampa (NNMTV)', url: 'http://lam.nnmtv.pw' }
        ];

        this.init = function () {
            this.addSettings();
            this.addMenu();
            this.addToHeader();
        };

        this.checkAndOpen = function () {
            var count = 0;
            Lampa.Noty.show('Перевірка зв\'язку...');
            
            servers.forEach(function (s) {
                var start = Date.now();
                var img = new Image();
                img.onload = function () { s.status = 'online'; s.ping = Date.now() - start; next(); };
                img.onerror = function () { s.status = 'online'; s.ping = Date.now() - start; next(); };
                img.src = s.url + '/favicon.ico?' + Math.random();
                setTimeout(function () { if (!s.status) { s.status = 'offline'; next(); } }, 2500);
            });

            function next() {
                count++;
                if (count === servers.length) _this.openSelect();
            }
        };

        this.openSelect = function () {
            Lampa.Select.show({
                title: 'Оберіть сервер',
                items: servers.map(function (s) {
                    return {
                        title: s.name,
                        subtitle: s.status === 'online' ? 'Працює (' + s.ping + 'ms)' : 'Недоступний',
                        server: s,
                        ghost: s.status !== 'online' // Візуально приглушаємо недоступні
                    };
                }),
                onSelect: function (item) {
                    if (item.server.status !== 'online') {
                        Lampa.Noty.show('Цей сервер зараз лежить');
                        return;
                    }
                    // Зміна сервера та збереження
                    Lampa.Storage.set('server_url', item.server.url);
                    Lampa.Noty.show('Готово! Перезавантаження...');
                    setTimeout(function () { location.reload(); }, 1000);
                },
                onBack: function () {
                    Lampa.Controller.toggle('content');
                }
            });
        };

        this.addSettings = function () {
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'interface') {
                    var btn = $('<div class="settings-param selector" data-type="button" data-name="server_changer_btn"><div class="settings-param__name">Server Changer</div><div class="settings-param__value">Змінити адресу сервера</div></div>');
                    btn.on('hover:enter', _this.checkAndOpen);
                    e.body.find('.settings-list').append(btn);
                }
            });
        };

        this.addMenu = function () {
            Lampa.Menu.add({
                id: 'server_changer',
                title: 'Змінити сервер',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 15V19H5V15H19ZM20 13H4C3.45 13 3 13.45 3 14V20C3 20.55 3.45 21 4 21H20C20.55 21 21 20.55 21 20V14C21 13.45 20.55 13 20 13ZM19 5V9H5V5H19ZM20 3H4C3.45 3 3 3.45 3 4V10C3 10.55 3.45 11 4 11H20C20.55 11 21 10.55 21 10V4C21 3.45 20.55 3 20 3Z" fill="currentColor"/></svg>',
                onSelect: _this.checkAndOpen
            });
        };

        this.addToHeader = function () {
            var head = $('.header__items');
            if (head.length && !head.find('.server-changer-ico').length) {
                var btn = $('<div class="header__item selector server-changer-ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg></div>');
                btn.on('hover:enter', _this.checkAndOpen);
                head.prepend(btn);
            }
        };
    }

    // Запуск після готовності системи
    if (window.appready) {
        new ServerChanger().init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') new ServerChanger().init();
        });
    }
})();

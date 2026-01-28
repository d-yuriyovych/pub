(function () {
    window.plugin_server_switcher = {};

    function startPlugin() {
        // Список ваших серверів (додайте свої назви та URL)
        var servers = [
            { title: 'Server Alpha', url: 'http://server1.com' },
            { title: 'Server Beta', url: 'http://server2.com' },
            { title: 'Server Gamma', url: 'http://server3.com' }
        ];

        function openSwitcher() {
            var current_url = Lampa.Storage.get('server_url');
            var selected_server = null;

            var html = $('<div class="server-switcher"></div>');
            
            // 1. Поточний сервер
            html.append('<div class="broadcast__text" style="margin-bottom: 10px;">Поточний сервер:</div>');
            var current_name = servers.find(s => s.url === current_url)?.title || "Невідомо";
            html.append('<div style="color: #ffca28; font-size: 1.4em; margin-bottom: 20px;">' + current_name + '</div>');

            // 2. Список серверів
            html.append('<div class="broadcast__text" style="margin-bottom: 10px;">Список серверів:</div>');
            
            var list = $('<div class="install-devices"></div>');

            servers.forEach(function (server) {
                // Не показуємо поточний сервер у списку
                if (server.url === current_url) return;

                var item = $('<div class="install-device selector" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">\
                    <div class="install-device__name">' + server.title + '</div>\
                    <div class="server-status" style="font-size: 0.8em;">перевірка...</div>\
                </div>');

                // Перевірка доступності (незалежна)
                fetch(server.url, { method: 'HEAD', mode: 'no-cors', timeout: 3000 })
                    .then(() => {
                        item.find('.server-status').text('Online').css('color', '#4caf50');
                    })
                    .catch(() => {
                        item.find('.server-status').text('Offline').css('color', '#f44336');
                    });

                item.on('hover:enter', function () {
                    selected_server = server.url;
                    $('.install-device').removeClass('active');
                    item.addClass('active');
                });

                list.append(item);
            });

            html.append(list);

            // 3. Кнопка "Змінити сервер"
            var btn = $('<div class="simple-button selector" style="margin-top: 20px; width: 100%; background: #fff; color: #000; text-align: center; padding: 10px; border-radius: 5px;">Змінити сервер</div>');
            
            btn.on('hover:enter', function () {
                if (selected_server) {
                    // Вирішення проблеми Android: спочатку запис, потім коротка затримка, потім ребут
                    Lampa.Storage.set('server_url', selected_server);
                    Lampa.Noty.show('Сервер змінено. Перезавантаження...');
                    
                    setTimeout(function() {
                        location.reload();
                    }, 200);
                } else {
                    Lampa.Noty.show('Оберіть сервер зі списку');
                }
            });

            html.append(btn);

            Lampa.Modal.open({
                title: 'Вибір сервера',
                html: html,
                size: 'small',
                onBack: function () {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('content');
                }
            });
        }

        // 4. Додавання кнопок виклику (3 місця)
        
        // В шапку
        var head_btn = $('<div class="header__item selector"><svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="currentColor"/></svg></div>');
        head_btn.on('hover:enter', openSwitcher);
        $('.header__items .header__item:last').before(head_btn);

        // В бічне меню
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                var menu_item = $('<div class="menu__item selector" data-action="server_switch">\
                    <div class="menu__item-icon"><svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="currentColor"/></svg></div>\
                    <div class="menu__item-title">Сервер</div>\
                </div>');
                menu_item.on('hover:enter', openSwitcher);
                $('.menu .menu__list').append(menu_item);
            }
        });

        // В налаштування Lampa (метод з BanderaOnline)
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'main') {
                var field = $('<div class="settings-param selector" data-type="button" data-name="server_switcher_btn">\
                    <div class="settings-param__name">Зміна сервера</div>\
                    <div class="settings-param__value">Відкрити меню</div>\
                </div>');
                field.on('hover:enter', openSwitcher);
                e.body.find('[data-name="more"]').before(field);
            }
        });
    }

    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();

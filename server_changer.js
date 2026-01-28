(function () {
    window.plugin_server_manager = {};

    // Список ваших серверів (можна редагувати)
    var servers = [
        { title: 'Основний Сервер', url: 'http://server1.com' },
        { title: 'Дзеркало Європа', url: 'http://server2.com' },
        { title: 'Резерв UA', url: 'http://server3.com' }
    ];

    function startPlugin() {
        // Додаємо кнопки в інтерфейс
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                addButtons();
            }
        });
    }

    function addButtons() {
        // 1. Шапка (Head)
        var head_btn = $('<div class="head__action render--visible selector"><svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.68-1.5-1.5s.68-1.5 1.5-1.5 1.5.68 1.5 1.5-.68 1.5-1.5 1.5zM19 5v4H5V5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5c-.82 0-1.5-.68-1.5-1.5S6.18 5.5 7 5.5s1.5.68 1.5 1.5S7.82 8.5 7 8.5z" fill="currentColor"/></svg></div>');
        head_btn.on('hover:enter', showManager);
        $('.head__actions').append(head_btn);

        // 2. Бічне меню (Menu)
        Lampa.Component.add('server_manager_menu', {
            title: 'Зміна сервера',
            onEnter: showManager
        });

        // 3. Налаштування (Settings)
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name == 'main') {
                var item = $('<div class="settings-param selector" data-type="toggle"><div class="settings-param__name">Менеджер серверів</div><div class="settings-param__value">Змінити поточний</div></div>');
                item.on('hover:enter', showManager);
                e.body.find('.settings-list').append(item);
            }
        });
    }

    function showManager() {
        var current_url = Lampa.Storage.get('online_proxy_url') || Lampa.Storage.get('proxy_url');
        var current_server = servers.find(s => s.url === current_url) || { title: 'Невідомий', url: current_url };

        var html = $('<div class="server-manager"></div>');

        // Секція Поточного сервера
        html.append('<div class="simple-button__title" style="margin-bottom: 5px;">Поточний сервер:</div>');
        html.append('<div style="color: #ffc107; font-size: 1.5em; margin-bottom: 20px;">' + current_server.title + '</div>');

        // Секція Списку
        html.append('<div class="simple-button__title" style="margin-bottom: 10px;">Список серверів:</div>');

        var list_container = $('<div class="server-list" style="margin-bottom: 20px;"></div>');
        var selected_url = '';

        servers.forEach(function (serv) {
            if (serv.url !== current_url) {
                var item = $('<div class="navigation-item selector" style="display: flex; justify-content: space-between; padding: 10px; border-radius: 5px; margin-bottom: 5px; background: rgba(255,255,255,0.05)">' +
                    '<span style="color: #fff;">' + serv.title + '</span>' +
                    '<span class="server-status" style="color: #666;">перевірка...</span>' +
                '</div>');

                item.on('hover:enter', function () {
                    $('.server-list .navigation-item').css('background', 'rgba(255,255,255,0.05)');
                    $(this).css('background', 'rgba(255,255,255,0.2)');
                    selected_url = serv.url;
                });

                // Перевірка доступності (незалежна від поточного сервера)
                fetch(serv.url, { method: 'HEAD', mode: 'no-cors', timeout: 3000 })
                    .then(() => item.find('.server-status').text('Доступний').css('color', '#4caf50'))
                    .catch(() => item.find('.server-status').text('Офлайн').css('color', '#f44336'));

                list_container.append(item);
            }
        });

        html.append(list_container);

        // Кнопка зміни
        var btn_change = $('<div class="simple-button selector" style="background: #fff; color: #000; text-align: center; font-weight: bold;">Змінити сервер</div>');
        btn_change.on('hover:enter', function () {
            if (selected_url) {
                // Прямий запис в Storage, щоб уникнути конфліктів при ребуті Android
                Lampa.Storage.set('online_proxy_url', selected_url);
                Lampa.Storage.set('proxy_url', selected_url); // Для універсальності
                
                Lampa.Noty.show('Сервер змінено. Перезавантаження...');
                setTimeout(function () {
                    location.reload();
                }, 1000);
            } else {
                Lampa.Noty.show('Оберіть сервер зі списку');
            }
        });

        html.append(btn_change);

        Lampa.Modal.open({
            title: 'Керування серверами',
            html: html,
            size: 'medium',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('content');
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();

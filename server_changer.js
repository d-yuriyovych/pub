(function () {
    var servers = [
        { title: 'Основний Сервер', url: 'http://server1.com' },
        { title: 'Дзеркало Європа', url: 'http://server2.com' },
        { title: 'Резерв UA', url: 'http://server3.com' }
    ];

    function showManager() {
        var current_url = Lampa.Storage.get('online_proxy_url') || '';
        var current_server = servers.find(s => s.url === current_url) || { title: 'Невідомий', url: current_url };

        var html = $('<div class="server-manager"></div>');

        // 1) Поточний сервер (Жовтий, не клікабельний)
        html.append('<div style="color: #fff; font-size: 1.2em; margin-bottom: 5px;">Поточний сервер:</div>');
        html.append('<div style="color: #ffc107; font-size: 1.6em; margin-bottom: 25px; font-weight: bold; pointer-events: none;">' + current_server.title + '</div>');

        // 2) Список серверів
        html.append('<div style="color: #fff; font-size: 1.2em; margin-bottom: 10px;">Список серверів:</div>');
        var list_container = $('<div class="server-list" style="margin-bottom: 20px;"></div>');
        var selected_url = '';

        servers.forEach(function (serv) {
            if (serv.url !== current_url) {
                var item = $('<div class="navigation-item selector" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-radius: 8px; margin-bottom: 10px; background: rgba(255,255,255,0.1)">' +
                    '<span style="font-size: 1.2em; font-weight: 500;">' + serv.title + '</span>' +
                    '<span class="server-status" style="font-size: 0.9em; font-weight: bold;">перевірка...</span>' +
                '</div>');

                item.on('hover:enter', function () {
                    selected_url = serv.url;
                    $('.server-list .navigation-item').css('background', 'rgba(255,255,255,0.1)');
                    $(this).css('background', 'rgba(255,255,255,0.3)');
                });

                // Перевірка доступності
                var xhr = new XMLHttpRequest();
                xhr.open('GET', serv.url, true);
                xhr.timeout = 5000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if (xhr.status > 0 || xhr.status === 0 && xhr.readyState === 4) { // Fix для no-cors
                            item.find('.server-status').text('ONLINE').css('color', '#4caf50');
                        } else {
                            item.find('.server-status').text('OFFLINE').css('color', '#f44336');
                        }
                    }
                };
                xhr.send();
                list_container.append(item);
            }
        });
        html.append(list_container);

        // 3) Кнопка Змінити сервер
        var btn_change = $('<div class="simple-button selector" style="background: #fff; color: #000; text-align: center; border-radius: 10px; font-weight: bold; padding: 15px;">Змінити сервер</div>');
        btn_change.on('hover:enter', function () {
            if (selected_url) {
                // Запис у всі можливі ключі для запобігання відкату на Android
                Lampa.Storage.set('online_proxy_url', selected_url);
                Lampa.Storage.set('proxy_url', selected_url);
                Lampa.Storage.set('proxy_address', selected_url);
                Lampa.Storage.set('parser_use', 'true'); // Додатковий тригер

                Lampa.Noty.show('Зміна сервера... Зачекайте');
                setTimeout(() => { location.reload(); }, 500);
            } else {
                Lampa.Noty.show('Спочатку виберіть сервер зі списку');
            }
        });
        html.append(btn_change);

        Lampa.Modal.open({
            title: 'Менеджер підключень',
            html: html,
            size: 'medium',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('content');
            }
        });
    }

    // 4) Логіка відображення в 3 місцях (через Observer)
    function inject() {
        // Шапка
        if ($('.head__actions').length && !$('.head__server-btn').length) {
            var btn = $('<div class="head__action render--visible selector head__server-btn"><svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg></div>');
            btn.on('hover:enter', showManager);
            $('.head__actions').prepend(btn);
        }

        // Бічне меню
        if ($('.menu__list').length && !$('.menu__item[data-action="server_change"]').length) {
            var m_item = $('<li class="menu__item selector" data-action="server_change"><div class="menu__ico"><svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M15 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z"></svg></div><div class="menu__text">Зміна сервера</div></li>');
            m_item.on('hover:enter', function() {
                Lampa.Menu.hide();
                showManager();
            });
            $('.menu__list').append(m_item);
        }

        // Налаштування
        if ($('.settings-list').length && !$('.settings-server-btn').length) {
            var s_item = $('<div class="settings-param selector settings-server-btn" data-type="toggle"><div class="settings-param__name">Зміна сервера</div><div class="settings-param__value">Налаштувати адресу</div></div>');
            s_item.on('hover:enter', showManager);
            $('.settings-list').append(s_item);
        }
    }

    // Запуск спостерігача
    var observer = new MutationObserver(function() {
        inject();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Початковий запуск
    if (window.appready) inject();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') inject(); });
})();

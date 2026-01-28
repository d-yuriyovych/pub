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

        // 1. Поточний сервер (Жовтий, не клікабельний)
        html.append('<div style="margin-bottom: 5px; opacity: 0.8; font-size: 14px;">Поточний сервер:</div>');
        html.append('<div style="color: #ffc107; font-size: 22px; margin-bottom: 25px; font-weight: bold; pointer-events: none;">' + current_server.title + '</div>');

        // 2. Список доступних
        html.append('<div style="margin-bottom: 10px; opacity: 0.8; font-size: 14px;">Список серверів:</div>');
        var list_container = $('<div class="server-list" style="margin-bottom: 20px;"></div>');
        var selected_url = '';

        servers.forEach(function (serv) {
            if (serv.url !== current_url) {
                var item = $('<div class="navigation-item selector" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-radius: 10px; margin-bottom: 8px; background: rgba(255,255,255,0.08)">' +
                    '<span style="font-size: 18px; font-weight: 500;">' + serv.title + '</span>' +
                    '<span class="server-status" style="font-size: 12px; font-weight: bold;">перевірка...</span>' +
                '</div>');

                item.on('hover:enter', function () {
                    selected_url = serv.url;
                    $('.server-list .navigation-item').css('background', 'rgba(255,255,255,0.08)');
                    $(this).css('background', 'rgba(255,255,255,0.25)');
                });

                // Перевірка доступності
                var xhr = new XMLHttpRequest();
                xhr.open('GET', serv.url, true);
                xhr.timeout = 4000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if (xhr.status > 0) {
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

        // 3. Кнопка зміни
        var btn_change = $('<div class="simple-button selector" style="margin-top: 20px; background: #fff; color: #000; text-align: center; border-radius: 8px; font-weight: bold;">Змінити сервер</div>');
        btn_change.on('hover:enter', function () {
            if (selected_url) {
                Lampa.Storage.set('online_proxy_url', selected_url);
                Lampa.Storage.set('proxy_url', selected_url);
                Lampa.Storage.set('proxy_address', selected_url);
                Lampa.Noty.show('Сервер змінено. Перезапуск...');
                setTimeout(() => { location.reload(); }, 800);
            } else {
                Lampa.Noty.show('Виберіть сервер зі списку');
            }
        });
        html.append(btn_change);

        Lampa.Modal.open({
            title: 'Вибір сервера',
            html: html,
            size: 'medium',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('content');
            }
        });
    }

    // Ініціалізація точок входу
    function init() {
        // 1. ШАПКА (Head)
        if (!$('.head__actions .server-change-btn').length) {
            var head_btn = $('<div class="head__action render--visible selector server-change-btn"><svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg></div>');
            head_btn.on('hover:enter', showManager);
            $('.head__actions').prepend(head_btn);
        }

        // 2. БІЧНЕ МЕНЮ (Menu) - вклинюємось в подію рендеру
        Lampa.Listener.follow('menu', function (e) {
            if (e.type == 'ready') {
                var menu_item = $('<li class="menu__item selector" data-action="server_change"><div class="menu__ico"><svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M15 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z"></svg></div><div class="menu__text">Зміна сервера</div></li>');
                menu_item.on('hover:enter', function() {
                    Lampa.Menu.hide();
                    showManager();
                });
                $('.menu__list').append(menu_item);
            }
        });

        // 3. НАЛАШТУВАННЯ (Settings)
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name == 'main') {
                setTimeout(function(){
                    var sett_item = $('<div class="settings-param selector" data-type="toggle"><div class="settings-param__name">Зміна сервера</div><div class="settings-param__value">Відкрити менеджер</div></div>');
                    sett_item.on('hover:enter', showManager);
                    $('.settings-list').append(sett_item);
                    // Переініціалізація контролера для нових елементів
                    Lampa.Controller.enable('settings_list');
                }, 50);
            }
        });
    }

    // Очікування готовності
    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') init(); });
    
    // Постійний чекер для шапки (вона часто перемальовується)
    setInterval(function(){
        if (!$('.head__actions .server-change-btn').length) {
            var head_btn = $('<div class="head__action render--visible selector server-change-btn"><svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg></div>');
            head_btn.on('hover:enter', showManager);
            $('.head__actions').prepend(head_btn);
        }
    }, 3000);
})();

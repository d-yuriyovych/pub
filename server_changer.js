(function () {
    var servers = [
        { title: 'Основний Сервер', url: 'http://server1.com' },
        { title: 'Дзеркало Європа', url: 'http://server2.com' },
        { title: 'Резерв UA', url: 'http://server3.com' }
    ];

    function showManager() {
        var current_url = Lampa.Storage.get('online_proxy_url') || '';
        var current_server = servers.find(function(s) { return s.url === current_url; }) || { title: 'Невідомий', url: current_url };

        var html = $('<div class="server-manager"></div>');

        // 1. Поточний сервер (Жовтий)
        html.append('<div style="color: #fff; font-size: 1.1em; margin-bottom: 5px; opacity: 0.8;">Поточний сервер:</div>');
        html.append('<div style="color: #ffc107; font-size: 1.5em; margin-bottom: 25px; font-weight: bold; pointer-events: none;">' + current_server.title + '</div>');

        // 2. Список серверів
        html.append('<div style="color: #fff; font-size: 1.1em; margin-bottom: 10px; opacity: 0.8;">Список серверів:</div>');
        var list_container = $('<div class="server-list" style="margin-bottom: 20px;"></div>');
        var selected_url = '';

        servers.forEach(function (serv) {
            if (serv.url !== current_url) {
                var item = $('<div class="navigation-item selector" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-radius: 8px; margin-bottom: 8px; background: rgba(255,255,255,0.08)">' +
                    '<span style="font-size: 1.1em;">' + serv.title + '</span>' +
                    '<span class="server-status" style="font-size: 0.8em; font-weight: bold; color: #666;">перевірка...</span>' +
                '</div>');

                item.on('hover:enter', function () {
                    selected_url = serv.url;
                    $('.server-list .navigation-item').css('background', 'rgba(255,255,255,0.08)');
                    $(this).css('background', 'rgba(255,255,255,0.25)');
                });

                var xhr = new XMLHttpRequest();
                xhr.open('GET', serv.url, true);
                xhr.timeout = 4000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if (xhr.status > 0 || xhr.status === 0) {
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

        // 3. Кнопка Змінити сервер
        var btn_change = $('<div class="simple-button selector" style="background: #fff; color: #000; text-align: center; border-radius: 10px; font-weight: bold; padding: 15px; margin-top: 10px;">Змінити сервер</div>');
        btn_change.on('hover:enter', function () {
            if (selected_url) {
                Lampa.Storage.set('online_proxy_url', selected_url);
                Lampa.Storage.set('proxy_url', selected_url);
                Lampa.Storage.set('proxy_address', selected_url);
                Lampa.Noty.show('Зміна сервера... Перезавантаження');
                setTimeout(function(){ location.reload(); }, 500);
            } else {
                Lampa.Noty.show('Виберіть сервер зі списку');
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

    function startPlugin() {
        // --- ШАПКА ---
        setInterval(function() {
            if ($('.head__actions').length && !$('.head__server-btn').length) {
                var btn = $('<div class="head__action render--visible selector head__server-btn"><svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg></div>');
                btn.on('hover:enter', showManager);
                $('.head__actions').prepend(btn);
            }
        }, 3000);

        // --- БІЧНЕ МЕНЮ ---
        var menuObserver = new MutationObserver(function() {
            if ($('.menu__list').length && !$('.menu__item[data-action="server_change"]').length) {
                var m_item = $('<li class="menu__item selector" data-action="server_change"><div class="menu__ico"><svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M15 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z"></svg></div><div class="menu__text">Зміна сервера</div></li>');
                m_item.on('hover:enter', function() {
                    $('.menu').removeClass('menu--open');
                    showManager();
                });
                $('.menu__list').append(m_item);
            }
        });
        menuObserver.observe(document.body, { childList: true, subtree: true });

        // --- НАЛАШТУВАННЯ (Метод примусового вклинення в рендер) ---
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name == 'main') {
                // Видаляємо стару кнопку, якщо вона є
                $('.settings-server-btn').remove();
                
                // Чекаємо мілісекунду, поки Lampa підготує список
                setTimeout(function() {
                    var list = e.body.find('.settings-list');
                    if (list.length) {
                        var s_item = $('<div class="settings-param selector settings-server-btn" data-type="toggle">' +
                            '<div class="settings-param__name">Зміна сервера</div>' +
                            '<div class="settings-param__value">Відкрити менеджер</div>' +
                        '</div>');
                        
                        s_item.on('hover:enter', showManager);
                        
                        // Вставляємо ПЕРЕД останнім пунктом (зазвичай це "Про систему")
                        if (list.find('.settings-param').length > 0) {
                            list.find('.settings-param').last().before(s_item);
                        } else {
                            list.append(s_item);
                        }
                        
                        // Обов'язково повідомляємо контролер про новий елемент
                        Lampa.Controller.enable('settings_list');
                    }
                }, 10);
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });

})();

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
        html.append('<div style="color: #fff; margin-bottom: 5px; opacity: 0.8;">Поточний сервер:</div>');
        html.append('<div style="color: #ffc107; font-size: 1.5em; margin-bottom: 25px; font-weight: bold;">' + current_server.title + '</div>');

        var list_container = $('<div class="server-list"></div>');
        servers.forEach(function (serv) {
            if (serv.url !== current_url) {
                var item = $('<div class="navigation-item selector" style="padding: 15px; border-radius: 8px; margin-bottom: 8px; background: rgba(255,255,255,0.08)">' + serv.title + '</div>');
                item.on('hover:enter', function () {
                    Lampa.Storage.set('online_proxy_url', serv.url);
                    Lampa.Storage.set('proxy_url', serv.url);
                    Lampa.Storage.set('proxy_address', serv.url);
                    Lampa.Noty.show('Сервер змінено. Перезавантаження...');
                    setTimeout(function(){ location.reload(); }, 500);
                });
                list_container.append(item);
            }
        });
        html.append(list_container);

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

    // --- ТА САМА ЧАСТИНА ЯКУ ТИ ДАВ (Адаптована під твій менеджер) ---
    function initSettings() {
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if (!SettingsApi || !SettingsApi.addComponent) return;

        // Створюємо розділ "Мій Сервер" у лівому меню налаштувань
        SettingsApi.addComponent({
            component: 'my_server_manager',
            name: 'Мій Сервер',
            icon: "<svg height=\"28\" viewBox=\"0 0 24 24\" width=\"28\" fill=\"currentColor\"><path d=\"M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z\"/></svg>"
        });

        // Додаємо кнопку всередину цього розділу
        SettingsApi.addParam({
            component: 'my_server_manager',
            param: {
                name: 'open_server_list',
                type: 'button'
            },
            field: {
                name: 'Відкрити список серверів'
            },
            onChange: function onChange() {
                showManager();
            }
        });
    }

    // Додаткові точки входу (Шапка/Меню)
    function addOthers() {
        if ($('.head__actions').length && !$('.head__server-btn').length) {
            var btn = $('<div class="head__action render--visible selector head__server-btn"><svg height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" fill=\"currentColor\"><path d=\"M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z\"/></svg></div>');
            btn.on('hover:enter', showManager);
            $('.head__actions').prepend(btn);
        }
        if ($('.menu__list').length && !$('.menu__server-btn').length) {
            var m_item = $('<li class="menu__item selector menu__server-btn"><div class="menu__ico"><svg height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" fill=\"currentColor\"><path d=\"M15 15v4H5v-4h14\"/></svg></div><div class="menu__text">Зміна сервера</div></li>');
            m_item.on('hover:enter', function() { Lampa.Menu.hide(); showManager(); });
            $('.menu__list').append(m_item);
        }
    }

    // Запуск
    if (window.appready) {
        initSettings();
        addOthers();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                initSettings();
                addOthers();
            }
        });
    }
    
    // Для Android/Таймер на шапку
    setInterval(addOthers, 2000);
})();

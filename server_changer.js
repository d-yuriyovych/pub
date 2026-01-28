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
        html.append('<div style="margin-bottom: 10px; opacity: 0.6;">Поточний сервер:</div>');
        html.append('<div style="color: #ffc107; font-size: 1.4em; margin-bottom: 20px; font-weight: bold;">' + current_server.title + '</div>');

        var list_container = $('<div class="server-list"></div>');
        servers.forEach(function (serv) {
            if (serv.url !== current_url) {
                var item = $('<div class="navigation-item selector" style="padding: 12px; border-radius: 8px; margin-bottom: 8px; background: rgba(255,255,255,0.08); cursor: pointer;">' + serv.title + '</div>');
                item.on('hover:enter', function () {
                    Lampa.Storage.set('online_proxy_url', serv.url);
                    Lampa.Storage.set('proxy_url', serv.url);
                    Lampa.Storage.set('proxy_address', serv.url);
                    Lampa.Noty.show('Зміна сервера... Перезавантаження');
                    setTimeout(function(){ location.reload(); }, 400);
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

    // --- ТВІЙ МЕТОД (SettingsApi) ---
    function initSettings() {
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if (!SettingsApi || !SettingsApi.addParam) return;

        // Додаємо параметр прямо в розділ 'main' (головний екран налаштувань)
        SettingsApi.addParam({
            component: 'main',
            param: {
                name: 'server_manager_btn',
                type: 'button'
            },
            field: {
                name: 'Зміна сервера',
                description: 'Вибрати адресу підключення'
            },
            onChange: function () {
                showManager();
            }
        });
    }

    function addOthers() {
        // Шапка
        if ($('.head__actions').length && !$('.head__server-btn').length) {
            var btn = $('<div class="head__action render--visible selector head__server-btn"><svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z"/></svg></div>');
            btn.on('hover:enter', function() { showManager(); });
            $('.head__actions').prepend(btn);
        }

        // Бічне меню (Виправлення помилки)
        if ($('.menu__list').length && !$('.menu__server-btn').length) {
            var m_item = $('<li class="menu__item selector menu__server-btn"><div class="menu__ico"><svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M15 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z"/></svg></div><div class="menu__text">Зміна сервера</div></li>');
            
            m_item.on('hover:enter', function() {
                Lampa.Menu.hide();
                // Помилка була тут: Lampa іноді не встигає перемкнути контролер
                // Викликаємо через невеликий таймаут, щоб не було конфлікту
                setTimeout(showManager, 10);
            });
            
            $('.menu__list').append(m_item);
        }
    }

    // Запуск точно як у Bandera (через перевірку готовності)
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

    // Постійна перевірка для шапки/меню
    setInterval(addOthers, 2000);
})();

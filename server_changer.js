(function () {
    window.plugin_server_switcher = function () {
        var servers = [
            { name: 'Основний сервер', url: 'https://jacred.xyz' },
            { name: 'Дзеркало 1', url: 'https://bwa.to' },
            { name: 'Дзеркало 2', url: 'https://lampa.mx' }
        ];

        var selected_server_url = '';

        // Функція перевірки доступності (CORS-friendly через fetch)
        function checkStatus(url, callback) {
            var controller = new AbortController();
            var timeoutId = setTimeout(() => controller.abort(), 3000);

            fetch(url, { mode: 'no-cors', signal: controller.signal })
                .then(() => callback(true))
                .catch(() => callback(false))
                .finally(() => clearTimeout(timeoutId));
        }

        function openModal() {
            var current_url = Lampa.Storage.get('main_server', 'https://jacred.xyz');
            var html = $('<div class="server-switcher"></div>');

            // 1. Поточний сервер
            var current_name = servers.find(s => s.url === current_url)?.name || 'Невідомий';
            html.append('<div style="padding: 10px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1)">' +
                        '<div style="font-size: 0.8em; opacity: 0.6;">Поточний сервер:</div>' +
                        '<div style="color: #ffde1a; font-weight: bold; font-size: 1.2em;">' + current_name + '</div>' +
                        '</div>');

            // 2. Список серверів
            html.append('<div style="font-size: 0.8em; opacity: 0.6; padding: 0 10px;">Список серверів:</div>');
            var list = $('<div class="selector-list"></div>');

            servers.forEach(function (serv) {
                if (serv.url === current_url) return; // Не показуємо поточний

                var item = $('<div class="selector-item selector-reveal" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; cursor: pointer; border-radius: 5px; margin: 5px 0;">' +
                             '<span>' + serv.name + '</span>' +
                             '<span class="server-status" style="font-size: 0.7em; opacity: 0.5;">перевірка...</span>' +
                             '</div>');

                item.on('hover:enter', function () {
                    selected_server_url = serv.url;
                    list.find('.selector-item').css('background', 'transparent');
                    item.css('background', 'rgba(255,255,255,0.1)');
                }).on('click', function () {
                    selected_server_url = serv.url;
                    list.find('.selector-item').css('background', 'transparent');
                    item.css('background', 'rgba(255,255,255,0.2)');
                });

                checkStatus(serv.url, (online) => {
                    item.find('.server-status')
                        .text(online ? '● ONLINE' : '○ OFFLINE')
                        .css('color', online ? '#4cf33c' : '#f33c3c')
                        .css('opacity', '1');
                });

                list.append(item);
            });
            html.append(list);

            // 3. Кнопка "Змінити сервер"
            var btn_change = $('<div class="simple-button selector-item" style="margin-top: 20px; background: #fff; color: #000; text-align: center; padding: 12px; border-radius: 5px; font-weight: bold;">Змінити сервер</div>');
            
            btn_change.on('hover:enter click', function () {
                if (!selected_server_url) {
                    Lampa.Noty.show('Оберіть сервер зі списку');
                    return;
                }

                // Вирішення проблеми ребуту на Android (пункт 5)
                // Записуємо сервер і примусово ставимо прапор, що мову вже обрано
                Lampa.Storage.set('main_server', selected_server_url);
                Lampa.Storage.set('language', Lampa.Storage.get('language', 'uk'));
                Lampa.Storage.set('lang_ok', true); 

                Lampa.Noty.show('Сервер змінено. Перезавантаження...');
                
                setTimeout(function () {
                    window.location.reload();
                }, 500);
            });

            html.append(btn_change);

            Lampa.Select.show({
                title: 'Зміна сервера',
                items: [], // Ми рендеримо свій HTML
                onRender: function() {
                    return html;
                },
                onBack: function() {
                    Lampa.Controller.toggle('settings');
                }
            });
        }

        // 4. Додавання кнопки в 3 місця
        
        // А. Шапка (Head)
        var head_icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 17L10 11M10 11L4 5M10 11H20M20 7L14 13M14 13L20 19M14 13H4"/></svg>';
        Lampa.Header.add({
            id: 'server_switcher',
            title: 'Сервер',
            icon: head_icon,
            onSelect: openModal
        });

        // Б. Бічне меню (Menu)
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                var menu_item = $('<li class="menu__item selector" data-action="server_switcher">' +
                                    '<div class="menu__ico">' + head_icon + '</div>' +
                                    '<div class="menu__text">Змінити сервер</div>' +
                                  '</li>');
                menu_item.on('hover:enter', openModal);
                $('.menu .menu__list').append(menu_item);
            }
        });

        // В. Налаштування Lampa
        function initSettings() {
            var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
            if (!SettingsApi || !SettingsApi.addComponent) return;

            SettingsApi.addComponent({
                component: 'server_management',
                name: 'Налаштування сервера',
                icon: head_icon
            });

            SettingsApi.addParam({
                component: 'server_management',
                param: {
                    name: 'change_trigger',
                    type: 'button'
                },
                field: {
                    name: 'Відкрити вікно вибору сервера'
                },
                onChange: openModal
            });
        }

        if (window.appready) initSettings();
        else Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initSettings();
        });
    };

    if (window.appready) window.plugin_server_switcher();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') window.plugin_server_switcher();
    });
})();

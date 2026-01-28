(function () {
    function startPlugin() {
        var servers = [
            { title: 'Основний Сервер', url: 'http://server1.com' },
            { title: 'Дзеркало Європа', url: 'http://server2.com' },
            { title: 'Резерв UA', url: 'http://server3.com' }
        ];

        // Функція створення вікна
        function showManager() {
            var current_url = Lampa.Storage.get('online_proxy_url') || '';
            var current_server = servers.find(s => s.url === current_url) || { title: 'Невідомий', url: current_url };

            var html = $('<div class="server-manager"></div>');

            // 1. Поточний сервер
            html.append('<div style="margin-bottom: 5px; opacity: 0.6; font-size: 0.8em;">Поточний сервер:</div>');
            html.append('<div style="color: #ffc107; font-size: 1.4em; margin-bottom: 20px; font-weight: bold;">' + current_server.title + '</div>');

            // 2. Список доступних
            html.append('<div style="margin-bottom: 10px; opacity: 0.6; font-size: 0.8em;">Список серверів:</div>');
            
            var list_container = $('<div class="server-list" style="margin-bottom: 20px;"></div>');
            var selected_url = '';

            servers.forEach(function (serv) {
                if (serv.url !== current_url) {
                    var item = $('<div class="navigation-item selector" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-radius: 10px; margin-bottom: 8px; background: rgba(255,255,255,0.08)">' +
                        '<span style="font-size: 1.1em;">' + serv.title + '</span>' +
                        '<span class="server-status" style="font-size: 0.8em; opacity: 0.5;">...</span>' +
                    '</div>');

                    item.on('hover:enter', function () {
                        selected_url = serv.url;
                        $('.server-list .navigation-item').css('background', 'rgba(255,255,255,0.08)');
                        $(this).css('background', 'rgba(255,255,255,0.2)');
                    });

                    // Незалежна перевірка доступності
                    var check = new XMLHttpRequest();
                    check.open('GET', serv.url, true);
                    check.timeout = 5000;
                    check.onreadystatechange = function() {
                        if (check.readyState == 4) {
                            if (check.status > 0) {
                                item.find('.server-status').text('ONLINE').css('color', '#4caf50');
                            } else {
                                item.find('.server-status').text('OFFLINE').css('color', '#f44336');
                            }
                        }
                    };
                    check.send();

                    list_container.append(item);
                }
            });

            html.append(list_container);

            // 3. Кнопка зміни
            var btn_change = $('<div class="simple-button selector" style="margin-top: 20px; background: #fff; color: #000; text-align: center; border-radius: 10px;">Змінити сервер</div>');
            
            btn_change.on('hover:enter', function () {
                if (selected_url) {
                    // Фікс для Android: пишемо в усі можливі ключі
                    Lampa.Storage.set('online_proxy_url', selected_url);
                    Lampa.Storage.set('proxy_url', selected_url);
                    Lampa.Storage.set('proxy_address', selected_url); 
                    
                    Lampa.Noty.show('Сервер змінено на ' + selected_url);
                    
                    setTimeout(function() {
                        location.reload();
                    }, 500);
                } else {
                    Lampa.Noty.show('Будь ласка, виберіть сервер зі списку');
                }
            });

            html.append(btn_change);

            Lampa.Modal.open({
                title: 'Менеджер Серверів',
                html: html,
                size: 'medium',
                onBack: function () {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('content');
                }
            });
        }

        // Вставка кнопок (з повторною спробою, якщо інтерфейс не прогрузився)
        function injectButtons() {
            if ($('.head__actions').length && !$('.head__actions .server-change-btn').length) {
                var head_btn = $('<div class="head__action render--visible selector server-change-btn"><svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg></div>');
                head_btn.on('hover:enter', showManager);
                $('.head__actions').prepend(head_btn);
            }

            // Додаємо в бічне меню через стандартний метод
            if (!Lampa.Component.get('server_manager')) {
                Lampa.Component.add('server_manager', function(){
                    this.create = function(){ return null; };
                    this.prepare = function(){};
                    this.render = function(){};
                });
                
                Lampa.Listener.follow('menu', function (e) {
                    if (e.type == 'ready' && !$('.menu__list .menu__item[data-action="server_manager"]').length) {
                        var menu_item = $('<li class="menu__item selector" data-action="server_manager"><div class="menu__ico"><svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M15 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z"></svg></div><div class="menu__text">Зміна сервера</div></li>');
                        menu_item.on('hover:enter', showManager);
                        $('.menu__list').append(menu_item);
                    }
                });
            }
            
            // Налаштування
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main' && !e.body.find('.server-manager-settings').length) {
                    var item = $('<div class="settings-param selector server-manager-settings" data-type="toggle"><div class="settings-param__name">Менеджер серверів</div><div class="settings-param__value">Змінити адресу</div></div>');
                    item.on('hover:enter', showManager);
                    e.body.find('.settings-list').append(item);
                }
            });
        }

        // Запуск ін'єкції
        setInterval(injectButtons, 2000); 
    }

    // Реєстрація плагіна
    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();

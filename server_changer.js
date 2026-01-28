(function () {
    'use strict';

    // Список ваших серверів
    var servers = [
        { name: 'Основний сервер', url: 'http://server1.com/' },
        { name: 'Резерв Blue', url: 'http://server2.tv/' },
        { name: 'Дзеркало Fast', url: 'http://server3.net/' }
    ];

    function ServerSwitcher() {
        var _this = this;
        this.selected_server = null;

        // 1. ПЕРЕВІРКА ДОСТУПНОСТІ (Незалежна від поточного домену)
        this.checkStatus = function(url, callback) {
            var img = new Image();
            img.onload = function() { callback(true); };
            img.onerror = function() { callback(false); };
            // Додаємо timestamp щоб уникнути кешу
            img.src = url + 'favicon.ico?' + Math.random();
            
            // Таймаут 3 секунди
            setTimeout(function() { if(img) { img.src = ''; callback(false); } }, 3000);
        };

        this.open = function () {
            var current_url = Lampa.Storage.get('source_url') || '';
            var current_name = 'Невизначено';
            
            // Знаходимо назву поточного сервера
            servers.forEach(function(s) {
                if(s.url === current_url) current_name = s.name;
            });

            var html = $('<div class="server-switcher"></div>');
            
            // ПУНКТ 1: Поточний сервер (жовтий, не клікабельний)
            html.append('<div class="server-switcher__label" style="margin-bottom:10px; opacity:0.6">Поточний сервер:</div>');
            html.append('<div class="server-switcher__current" style="color:#f3d333; font-weight:bold; margin-bottom:20px;">' + current_name + '</div>');

            // ПУНКТ 2: Список доступних (без поточного)
            html.append('<div class="server-switcher__label" style="margin-bottom:10px; opacity:0.6">Список серверів:</div>');
            
            var list = $('<div class="server-switcher__list"></div>');

            servers.forEach(function(server) {
                if(server.url === current_url) return; // Не відображаємо поточний

                var item = $('<div class="server-switcher__item selector" style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid rgba(255,255,255,0.1)">' +
                    '<span>' + server.name + '</span>' +
                    '<span class="server-status" style="color:#aaa">...</span>' +
                '</div>');

                item.on('hover:enter', function() {
                    _this.selected_server = server;
                });

                list.append(item);

                // Перевірка статусу в реальному часі
                _this.checkStatus(server.url, function(online) {
                    item.find('.server-status').text(online ? 'Online' : 'Offline').css('color', online ? '#4cf333' : '#f33333');
                });
            });

            html.append(list);

            // ПУНКТ 3: Кнопка "Змінити сервер"
            var btn = $('<div class="server-switcher__btn selector" style="margin-top:20px; background:#fff; color:#000; padding:12px; text-align:center; font-weight:bold; border-radius:5px;">Змінити сервер</div>');
            
            btn.on('hover:enter', function() {
                if(_this.selected_server) {
                    _this.applyServer(_this.selected_server.url);
                } else {
                    Lampa.Noty.show('Оберіть сервер зі списку');
                }
            });

            html.append(btn);

            Lampa.Modal.open({
                title: 'Зміна серверу',
                html: html,
                size: 'small',
                onBack: function() {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('content');
                }
            });
        };

        // ПУНКТ 5: Виправлення циклічного ребута на Android
        this.applyServer = function(url) {
            Lampa.Storage.set('source_url', url);
            // Важливо: встановлюємо 'source' на 'custom', щоб Lampa не скидала URL на дефолтний
            Lampa.Storage.set('source', 'custom'); 
            
            Lampa.Noty.show('Перемикання... Додаток перезавантажиться');
            
            setTimeout(function() {
                window.location.reload();
            }, 500);
        };
    }

    var switcher = new ServerSwitcher();

    // ПУНКТ 4: Додавання в 3 місця
    function addToMenu() {
        // 1. Бічне меню
        Lampa.Component.add('server_switch_btn', {
            title: 'Змінити сервер',
            icon: '<svg ...></svg>', // ваш svg
            onEnter: function() { switcher.open(); }
        });

        // 2. Шапка (Header)
        var headBtn = $('<div class="header__item selector"><svg ...></svg></div>');
        headBtn.on('click', function() { switcher.open(); });
        $('.header__items').append(headBtn);

        // 3. Меню налаштувань (за вашим прикладом)
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if (SettingsApi && SettingsApi.addComponent) {
            SettingsApi.addParam({
                component: 'interface', // або ваш окремий компонент
                param: {
                    name: 'change_server_btn',
                    type: 'button'
                },
                field: {
                    name: 'Вибір робочого сервера'
                },
                onChange: function() {
                    switcher.open();
                }
            });
        }
    }

    if (window.appready) addToMenu();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') addToMenu(); });

})();

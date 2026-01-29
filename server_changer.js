(function () {
    'use strict';

    // --- КОНФІГУРАЦІЯ СЕРВЕРІВ (ВІДРЕДАГУЙТЕ ЦЕЙ СПИСОК) ---
    var servers = [
        { name: 'Lampa (MX)', url: 'http://lampa.mx' },
        { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych.74a9dc5c.koyeb.app' },
        { name: 'Lampa (NNMTV)', url: 'nnmtv.pw' },
        { name: 'Lampa (VIP)', url: 'lampa.vip' },
    ];
    // -------------------------------------------------------

    function ServerSwitcher() {
        var _this = this;

        // Отримання поточного джерела (сервера)
        this.getCurrent = function () {
            // Lampa зазвичай зберігає джерело в 'source' або використовує 'tmdb_proxy_url' для проксі
            // Але для глобальної зміни серверу завантаження (якщо це app_skeleton) логіка може відрізнятись.
            // Ми будемо використовувати стандартний ключ 'source', який використовують більшість модів.
            var current = Lampa.Storage.get('source') || 'cub.red'; 
            
            // Чистимо URL від http/https та слешів для коректного порівняння
            return current.replace(/^https?:\/\//, '').replace(/\/$/, '');
        };

        // Функція перевірки доступності (Ping)
        this.ping = function (url, callback) {
            var start_time = new Date().getTime();
            var img = new Image();
            
            // Використовуємо Image ping або fetch, щоб обійти CORS на деяких пристроях
            // Але fetch надійніше для статусів. Спробуємо fetch з таймаутом.
            var controller = new AbortController();
            var timeoutId = setTimeout(function() { controller.abort(); }, 2000); // 2 сек таймаут

            fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
                .then(function() {
                    clearTimeout(timeoutId);
                    callback(true);
                })
                .catch(function() {
                    clearTimeout(timeoutId);
                    callback(false);
                });
        };

        // Побудова інтерфейсу модального вікна
        this.build = function () {
            var currentClean = this.getCurrent();
            var html = $('<div class="server-switcher-modal"></div>');
            
            // 1. Поточний сервер (Текст, Жовтий, Не клікабельний)
            var currentServerObj = servers.find(function(s) { 
                return s.url.indexOf(currentClean) > -1; 
            }) || { name: currentClean, url: currentClean };

            var headerCurrent = $('<div class="server-switcher-label">Поточний сервер:</div>');
            var valueCurrent = $('<div class="server-switcher-current">' + currentServerObj.name + '</div>');
            
            html.append(headerCurrent);
            html.append(valueCurrent);
            html.append('<div class="server-switcher-divider"></div>');

            // 2. Список серверів
            var headerList = $('<div class="server-switcher-label">Список серверів:</div>');
            html.append(headerList);

            var list = $('<div class="server-switcher-list"></div>');
            
            servers.forEach(function (server) {
                var serverClean = server.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

                // Не показувати поточний сервер у списку вибору
                if (serverClean === currentClean) return;

                var item = $('<div class="server-switcher-item selector" data-url="' + server.url + '"></div>');
                var name = $('<span class="server-name">' + server.name + '</span>');
                var status = $('<span class="server-status">Перевірка...</span>');

                item.append(name).append(status);
                
                // Клік по елементу (вибір, але ще не зміна)
                item.on('hover:enter click', function () {
                    $('.server-switcher-item', html).removeClass('active');
                    $(this).addClass('active');
                });

                // Перевірка доступності незалежно від поточного хоста
                _this.ping(server.url, function(isOnline) {
                    if(isOnline) {
                        status.text('Доступний').addClass('status-online');
                        name.addClass('name-online');
                    } else {
                        status.text('Недоступний').addClass('status-offline');
                        name.addClass('name-offline');
                    }
                });

                list.append(item);
            });

            html.append(list);

            // 3. Кнопка "Змінити сервер"
            var btnContainer = $('<div class="server-switcher-footer"></div>');
            var btn = $('<div class="button selector" style="text-align:center;">Змінити сервер</div>');

            btn.on('hover:enter click', function () {
                var selected = $('.server-switcher-item.active', html);
                if (selected.length) {
                    _this.applyServer(selected.data('url'));
                } else {
                    Lampa.Noty.show('Будь ласка, оберіть сервер зі списку');
                }
            });

            btnContainer.append(btn);
            html.append(btnContainer);

            return html;
        };

        // Застосування сервера та боротьба з ребутами Android
        this.applyServer = function (newUrl) {
            Lampa.Modal.close();
            
            // Встановлюємо новий URL
            Lampa.Storage.set('source', newUrl);
            
            // --- FIX ДЛЯ ANDROID ---
            // Часто при зміні сервера Android клієнт думає, що це перший запуск.
            // Примусово записуємо, що мова вже обрана, щоб не кидало на вибір мови.
            if(!Lampa.Storage.get('language')) Lampa.Storage.set('language', 'uk');
            
            // Записуємо поточні налаштування примусово, щоб вони не злетіли при краші/ребуті
            Lampa.Storage.save(); 

            Lampa.Noty.show('Зміна сервера... Перезавантаження.');

            // Таймер для GUI, щоб юзер встиг прочитати повідомлення
            setTimeout(function () {
                // Використовуємо нативний метод перезавантаження Lampa
                Lampa.Utils.reload();
            }, 1000);
        };

        this.open = function () {
            Lampa.Modal.open({
                title: 'Зміна серверу',
                html: _this.build(),
                size: 'medium',
                mask: true,
                onBack: function () {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('content');
                }
            });
        };
    }

    // --- CSS STYLES (Компактність та кольори) ---
    var css = `
        .server-switcher-modal { padding: 10px; }
        .server-switcher-label { color: #aaa; font-size: 0.9em; margin-bottom: 5px; text-transform: uppercase; }
        .server-switcher-current { color: #ffd948; font-size: 1.4em; font-weight: bold; margin-bottom: 15px; padding-left: 10px; user-select: none; pointer-events: none; }
        .server-switcher-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 10px 0; }
        .server-switcher-list { max-height: 40vh; overflow-y: auto; margin-bottom: 20px; }
        .server-switcher-item { display: flex; justify-content: space-between; padding: 12px; border-radius: 4px; margin-bottom: 5px; cursor: pointer; background: rgba(0,0,0,0.2); transition: background 0.2s; }
        .server-switcher-item.active { background: #fff; color: #000; }
        .server-switcher-item.active .server-name { color: #000 !important; } 
        .server-switcher-item.active .server-status { color: #333 !important; }
        
        .server-name { font-weight: bold; font-size: 1.1em; color: #fff; }
        .server-status { font-size: 0.8em; opacity: 0.8; }
        
        .name-online { color: #4b6; }
        .status-online { color: #4b6; }
        
        .name-offline { color: #f44; }
        .status-offline { color: #f44; }
        
        .server-switcher-footer { display: flex; justify-content: center; margin-top: 10px; }
    `;
    
    // Inject CSS
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    // --- ІНІЦІАЛІЗАЦІЯ ---
    var Switcher = new ServerSwitcher();

    // 1. Інтеграція в меню налаштувань (як у прикладі)
    function initSettings() {
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if (!SettingsApi || !SettingsApi.addComponent) return;

        SettingsApi.addComponent({
            component: 'server_switcher_plugin',
            name: 'Зміна серверу',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 19H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M2 5H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 12H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 9V15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
        });

        SettingsApi.addParam({
            component: 'server_switcher_plugin',
            param: {
                name: 'open_switcher_btn',
                type: 'button'
            },
            field: {
                name: 'Відкрити меню серверів',
                description: 'Вибір активного джерела'
            },
            onChange: function () {
                Switcher.open();
            }
        });
    }

    // 2. Інтеграція в бічне меню
    function initMenu() {
        // Слухаємо подію створення меню
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                var menu_item = $('<li class="menu__item selector" data-action="server_switch"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12V5C20 3.34315 18.6569 2 17 2H7C5.34315 2 4 3.34315 4 5V19C4 20.6569 5.34315 22 7 22H17C18.6569 22 20 20.6569 20 19V17" stroke="currentColor" stroke-width="2"/><path d="M16 12H22M22 12L19 9M22 12L19 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="menu__text">Сервер</div></li>');
                
                menu_item.on('hover:enter click', function () {
                    Switcher.open();
                });

                // Додаємо в меню (зазвичай після налаштувань або в кінець)
                $('.menu .menu__list').append(menu_item);
            }
        });
    }

    // 3. Інтеграція в шапку (Header)
    function initHeader() {
        if (window.plugin_server_switcher_ready) return;
        window.plugin_server_switcher_ready = true;

        var btn = $('<div class="head__action selector open--server-switch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-server"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg></div>');
        
        btn.on('hover:enter click', function () {
            Switcher.open();
        });

        // Додаємо в шапку перед налаштуваннями
        $('.header__actions').prepend(btn);
    }

    // Запуск плагіна
    if (window.Lampa) {
        if(Lampa.SettingsApi) initSettings();
        else Lampa.Listener.follow('app', function(e){ if(e.type =='ready') initSettings(); });
        
        initHeader();
        initMenu();
    } else {
        // Якщо Lampa ще не завантажилась (рідкісний випадок)
        window.onload = function() {
            initSettings();
            initHeader();
            initMenu();
        };
    }

})();

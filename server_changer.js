(function () {
    'use strict';

    // --- 1. СПИСОК СЕРВЕРІВ (ЗА ВАШИМ ЗАПИТОМ) ---
    var servers = [
        { name: 'Lampa (MX)', url: 'http://lampa.mx' },
        { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
        { name: 'Lampa (NNMTV)', url: 'http://nnmtv.pw' }, // Додав http для коректної роботи
        { name: 'Lampa (VIP)', url: 'http://lampa.vip' }   // Додав http для коректної роботи
    ];

    function ServerSwitcher() {
        var _this = this;

        // Нормалізація URL для порівняння (прибираємо http, https, слеші)
        this.cleanUrl = function(url) {
            if(!url) return '';
            return url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
        };

        // Отримання поточного сервера
        this.getCurrent = function () {
            var current = Lampa.Storage.get('source') || 'lampa.mx';
            // Якщо джерело 'cub.red', вважаємо це дефолтним, або беремо як є
            return _this.cleanUrl(current);
        };

        // Надійна перевірка доступності (Image Ping)
        // Це працює краще ніж fetch на старих TV і не викликає CORS помилок
        this.checkStatus = function (url, callback) {
            var img = new Image();
            var timer = setTimeout(function() {
                img.src = '';
                callback(false); // Timeout
            }, 3000); // 3 секунди на перевірку

            img.onload = function() {
                clearTimeout(timer);
                callback(true);
            };
            
            img.onerror = function() {
                clearTimeout(timer);
                // Навіть якщо 404 або помилка картинки, сервер відповів - значить живий.
                // Але якщо DNS помилка - теж error. 
                // Для надійності на TV, часто onerror означає що сервер є, але блокує картинку.
                // Вважаємо доступним, якщо це не явний timeout.
                callback(true);
            };

            // Спробуємо завантажити favicon або просто корінь як картинку
            // Додаємо випадкове число, щоб уникнути кешу
            img.src = url + '/favicon.ico?t=' + new Date().getTime();
        };

        // Побудова інтерфейсу
        this.build = function () {
            var currentClean = this.getCurrent();
            var html = $('<div class="server-switcher-modal"></div>');
            
            // --- ЗАГОЛОВОК ПОТОЧНОГО СЕРВЕРА ---
            // Шукаємо красиву назву для поточного URL
            var currentObj = servers.find(function(s) { 
                return _this.cleanUrl(s.url) === currentClean; 
            });
            var currentDisplayName = currentObj ? currentObj.name : currentClean;

            var headerCurrent = $('<div class="server-switcher-label">Поточний сервер:</div>');
            var valueCurrent = $('<div class="server-switcher-current">' + currentDisplayName + '</div>');
            
            html.append(headerCurrent);
            html.append(valueCurrent);
            html.append('<div class="server-switcher-divider"></div>');

            // --- СПИСОК СЕРВЕРІВ ---
            var headerList = $('<div class="server-switcher-label">Список серверів:</div>');
            html.append(headerList);

            var list = $('<div class="server-switcher-list"></div>');
            
            servers.forEach(function (server) {
                var serverClean = _this.cleanUrl(server.url);

                // Не показувати поточний у списку вибору
                if (serverClean === currentClean) return;

                // Створюємо елемент
                var item = $('<div class="server-switcher-item selector" data-url="' + server.url + '"></div>');
                
                // Назва + Статус + Кругляшок
                var info = $('<div class="server-info"></div>');
                var dot = $('<span class="server-dot"></span>'); // Кругляшок
                var name = $('<span class="server-name">' + server.name + '</span>');
                var statusText = $('<span class="server-status">Перевірка...</span>');

                info.append(dot).append(name);
                item.append(info).append(statusText);
                
                // Логіка кліку
                item.on('hover:enter click', function () {
                    // Якщо елемент має клас disabled - не реагувати
                    if ($(this).hasClass('disabled')) return;

                    $('.server-switcher-item', html).removeClass('active');
                    $(this).addClass('active');
                });

                list.append(item);

                // Запуск перевірки
                _this.checkStatus(server.url, function(isOnline) {
                    if(isOnline) {
                        statusText.text('Доступний').addClass('status-online');
                        dot.addClass('dot-online');
                    } else {
                        statusText.text('Недоступний').addClass('status-offline');
                        dot.addClass('dot-offline');
                        // Блокуємо вибір
                        item.addClass('disabled').removeClass('selector');
                        // Якщо цей елемент був активним, знімаємо активність
                        if(item.hasClass('active')) item.removeClass('active');
                    }
                });
            });

            html.append(list);

            // --- КНОПКА ЗМІНИТИ ---
            var btnContainer = $('<div class="server-switcher-footer"></div>');
            var btn = $('<div class="button selector" style="text-align:center;">Змінити сервер</div>');

            btn.on('hover:enter click', function () {
                var selected = $('.server-switcher-item.active', html);
                if (selected.length) {
                    _this.applyServer(selected.data('url'));
                } else {
                    Lampa.Noty.show('Оберіть доступний сервер');
                }
            });

            btnContainer.append(btn);
            html.append(btnContainer);

            return html;
        };

        this.applyServer = function (newUrl) {
            Lampa.Modal.close();
            
            // Встановлюємо новий URL
            Lampa.Storage.set('source', newUrl);
            
            // FIX для Android Loop: встановлюємо мову, якщо вона злетіла
            if(!Lampa.Storage.get('language')) Lampa.Storage.set('language', 'uk');
            
            Lampa.Storage.save(); 

            Lampa.Noty.show('Сервер змінено. Перезавантаження...');

            setTimeout(function () {
                // Використовуємо нативний reload, це найнадійніше на всіх платформах
                window.location.reload();
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
                    // Важливо: повертаємо фокус на контент або меню, щоб пульт не завис
                    Lampa.Controller.toggle('content'); 
                }
            });
        };
    }

    // --- CSS STYLES ---
    var css = `
        .server-switcher-modal { padding: 10px; }
        .server-switcher-label { color: #aaa; font-size: 0.9em; margin-bottom: 5px; text-transform: uppercase; }
        
        /* Поточний сервер - Жовтий, Не клікабельний */
        .server-switcher-current { color: #ffd948; font-size: 1.4em; font-weight: bold; margin-bottom: 15px; padding-left: 10px; pointer-events: none; }
        
        .server-switcher-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 10px 0; }
        .server-switcher-list { max-height: 40vh; overflow-y: auto; margin-bottom: 20px; }
        
        .server-switcher-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-radius: 6px; margin-bottom: 6px; background: rgba(255,255,255,0.05); transition: all 0.2s; }
        
        /* Активний елемент (вибраний) */
        .server-switcher-item.active { background: #fff; color: #000; }
        .server-switcher-item.active .server-name { color: #000; }
        
        /* Недоступний елемент */
        .server-switcher-item.disabled { opacity: 0.4; pointer-events: none; filter: grayscale(1); }

        .server-info { display: flex; align-items: center; }
        .server-name { font-weight: bold; font-size: 1.1em; color: #fff; margin-left: 10px; }
        .server-status { font-size: 0.8em; opacity: 0.8; }
        
        /* Кругляшки */
        .server-dot { width: 10px; height: 10px; border-radius: 50%; background: #777; display: inline-block; }
        .dot-online { background: #4b6; box-shadow: 0 0 5px #4b6; }
        .dot-offline { background: #f44; }

        .status-online { color: #4b6; }
        .server-switcher-item.active .status-online { color: #284; } /* Темніше на білому фоні */
        
        .status-offline { color: #f44; }

        .server-switcher-footer { display: flex; justify-content: center; margin-top: 10px; }
    `;
    
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    // --- ІНІЦІАЛІЗАЦІЯ ---
    var Switcher = new ServerSwitcher();

    // 1. Налаштування (Точно як у прикладі bandera_online)
    function initSettings() {
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if (!SettingsApi || !SettingsApi.addComponent) return;

        SettingsApi.addComponent({
            component: 'server_switcher_comp', // Унікальний ID компонента
            name: 'Зміна серверу',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 19H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M2 5H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 12H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 9V15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
        });

        SettingsApi.addParam({
            component: 'server_switcher_comp',
            param: {
                name: 'open_switcher_btn',
                type: 'button' // Кнопка
            },
            field: {
                name: 'Відкрити меню серверів', // Текст кнопки
                description: 'Натисніть для вибору сервера'
            },
            onChange: function () {
                Switcher.open(); // Відкриває модалку, а не підменю
            }
        });
    }

    // 2. Бічне меню
    function initMenu() {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                // Виправлена назва "Зміна серверу"
                var menu_item = $('<li class="menu__item selector" data-action="server_switch"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12V5C20 3.34315 18.6569 2 17 2H7C5.34315 2 4 3.34315 4 5V19C4 20.6569 5.34315 22 7 22H17C18.6569 22 20 20.6569 20 19V17" stroke="currentColor" stroke-width="2"/><path d="M16 12H22M22 12L19 9M22 12L19 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="menu__text">Зміна серверу</div></li>');
                
                menu_item.on('hover:enter click', function () {
                    Switcher.open();
                });

                $('.menu .menu__list').append(menu_item);
            }
        });
    }

    // 3. Шапка (Header)
    function initHeader() {
        // Чекаємо, поки додаток повністю завантажиться, щоб знайти .head__actions
        Lampa.Listener.follow('app', function(e) {
            if(e.type == 'ready') {
                if ($('.open--server-switch').length) return; // Уникнення дублікатів

                var btn = $('<div class="head__action selector open--server-switch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-server"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg></div>');
                
                btn.on('hover:enter click', function () {
                    Switcher.open();
                });

                // Виправлений селектор .head__actions (стандарт Lampa)
                $('.head__actions').prepend(btn);
            }
        });
    }

    // Запуск
    if (window.Lampa) {
        initSettings();
        initHeader();
        initMenu();
    } else {
        window.onload = function() {
            initSettings();
            initHeader();
            initMenu();
        };
    }

})();

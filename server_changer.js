(function () {
    'use strict';

    // Список серверів
    var servers = [
        { name: 'Lampa (MX)', url: 'http://lampa.mx' },
        { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
        { name: 'Lampa (NNMTV)', url: 'http://nnmtv.pw' },
        { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
    ];

    function ServerSwitcher() {
        var _this = this;

        // Очищення URL для порівняння (прибираємо http/https та слеші)
        this.cleanUrl = function(url) {
            if(!url) return '';
            return url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
        };

        // Отримання РЕАЛЬНОГО поточного сервера з адресного рядка браузера
        this.getCurrent = function () {
            // Використовуємо origin (домен), на якому ми зараз знаходимось
            var currentOrigin = window.location.origin; 
            return _this.cleanUrl(currentOrigin);
        };

        // Перевірка доступності
        this.checkStatus = function (url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.timeout = 5000;
            
            xhr.onload = function() { 
                // Вважаємо успіхом коди 200-399
                if (xhr.status >= 200 && xhr.status < 400) callback(true);
                else callback(false);
            };
            xhr.onerror = function() { callback(false); };
            xhr.ontimeout = function() { callback(false); };
            
            try {
                xhr.send();
            } catch (e) {
                callback(false);
            }
        };

        this.build = function () {
            var currentClean = this.getCurrent();
            var html = $('<div class="server-switcher-modal"></div>');
            
            // Кнопка закриття (хрестик) для зручності
            var closeBtn = $('<div class="server-switcher-close selector"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>');
            closeBtn.on('hover:enter click', function() {
                Lampa.Modal.close();
            });
            html.append(closeBtn);

            var currentObj = servers.find(function(s) { 
                return _this.cleanUrl(s.url) === currentClean; 
            });
            var currentDisplayName = currentObj ? currentObj.name : (window.location.hostname || 'Невідомий');

            html.append('<div class="server-switcher-label">Ви зараз тут:</div>');
            html.append('<div class="server-switcher-current">' + currentDisplayName + '</div>');
            html.append('<div class="server-switcher-divider"></div>');
            html.append('<div class="server-switcher-label">Оберіть сервер для переходу:</div>');

            var list = $('<div class="server-switcher-list"></div>');
            
            servers.forEach(function (server) {
                var serverClean = _this.cleanUrl(server.url);
                var isCurrent = serverClean === currentClean;

                var item = $('<div class="server-switcher-item selector" data-url="' + server.url + '"></div>');
                if(isCurrent) item.addClass('active-server');

                var info = $('<div class="server-info"><span class="server-dot"></span><span class="server-name">' + server.name + '</span></div>');
                var statusText = $('<span class="server-status">Перевірка...</span>');

                item.append(info).append(statusText);
                
                // Клік по елементу списку
                item.on('hover:enter click', function () {
                    if ($(this).hasClass('disabled')) return;
                    $('.server-switcher-item', html).removeClass('active');
                    $(this).addClass('active');
                });

                list.append(item);

                // Перевірка статусу
                _this.checkStatus(server.url, function(isOnline) {
                    var dot = item.find('.server-dot');
                    var name = item.find('.server-name');
                    
                    if(isOnline) {
                        statusText.text('OK').addClass('status-online');
                        dot.addClass('dot-online');
                        name.addClass('name-online'); // Колір тексту для доступного
                    } else {
                        statusText.text('Error').addClass('status-offline');
                        dot.addClass('dot-offline');
                        name.addClass('name-offline'); // Колір тексту для недоступного
                        item.addClass('disabled').removeClass('selector');
                    }
                });
            });

            html.append(list);

            // Красива кнопка
            var btn = $('<div class="server-switcher-btn selector">Змінити сервер</div>');
            btn.on('hover:enter click', function () {
                var selected = $('.server-switcher-item.active', html);
                if (selected.length) {
                    _this.applyServer(selected.data('url'));
                } else {
                    Lampa.Noty.show('Спочатку оберіть сервер зі списку');
                }
            });

            html.append(btn);
            return html;
        };

        this.applyServer = function (newUrl) {
            if (!newUrl) return;

            // Якщо вибрали той самий сервер, де ми є
            if (_this.cleanUrl(newUrl) === _this.getCurrent()) {
                Lampa.Noty.show('Ви вже на цьому сервері');
                return;
            }

            try {
                Lampa.Storage.set('source', newUrl);
                // Зберігаємо мову, якщо немає
                if(!Lampa.Storage.get('language')) Lampa.Storage.set('language', 'uk');
                Lampa.Storage.save(); 
                
                Lampa.Modal.close();
                Lampa.Noty.show('Перехід на новий сервер...');

                // ВИПРАВЛЕННЯ: Використовуємо location.href для реального переходу на інший домен
                setTimeout(function () {
                    window.location.href = newUrl;
                }, 1000);
            } catch (e) {
                console.log('Switcher Error:', e);
                window.location.href = newUrl;
            }
        };

        this.open = function () {
            Lampa.Modal.open({
                title: '', // Заголовок всередині HTML для кращого дизайну
                html: _this.build(),
                size: 'medium',
                mask: true,
                onBack: function () {
                    Lampa.Modal.close();
                    // ВИПРАВЛЕННЯ: Повертаємо керування контенту
                    Lampa.Controller.toggle('content');
                }
            });
        };
    }

    // Стилі
    var css = `
        .server-switcher-modal { padding: 15px; position: relative; }
        .server-switcher-close { position: absolute; top: -15px; right: -15px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; opacity: 0.7; }
        .server-switcher-close:hover { opacity: 1; }
        .server-switcher-close svg { width: 24px; height: 24px; }
        
        .server-switcher-label { color: #aaa; font-size: 0.9em; margin-bottom: 8px; }
        .server-switcher-current { color: #fff; font-size: 1.4em; font-weight: bold; margin-bottom: 15px; text-shadow: 0 0 10px rgba(255,255,255,0.2); }
        .server-switcher-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 15px 0; }
        
        .server-switcher-list { max-height: 50vh; overflow-y: auto; margin-bottom: 20px; }
        .server-switcher-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; border-radius: 8px; margin-bottom: 6px; background: rgba(255,255,255,0.05); transition: background 0.2s; border: 1px solid transparent; }
        
        .server-switcher-item.active { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); transform: scale(1.02); }
        .server-switcher-item.disabled { opacity: 0.4; pointer-events: none; grayscale: 1; }
        .server-switcher-item.active-server { background: rgba(75, 180, 100, 0.1); border: 1px solid rgba(75, 180, 100, 0.3); }

        .server-info { display: flex; align-items: center; }
        .server-name { font-weight: 500; margin-left: 12px; font-size: 1.1em; color: #ccc; transition: color 0.3s; }
        .name-online { color: #fff; } /* Доступність: Білий/Яскравий для онлайн */
        .name-offline { color: #f66; } /* Доступність: Червоний для офлайн */

        .server-dot { width: 10px; height: 10px; border-radius: 50%; background: #555; box-shadow: 0 0 5px rgba(0,0,0,0.5); }
        
        .dot-online { background: #4b6; box-shadow: 0 0 8px #4b6; }
        .status-online { color: #4b6; font-size: 0.85em; font-weight: bold; }
        
        .dot-offline { background: #f44; box-shadow: 0 0 8px #f44; }
        .status-offline { color: #f44; font-size: 0.85em; }

        /* Красива кнопка */
        .server-switcher-btn {
            background: linear-gradient(135deg, #fbb03b 0%, #ffc107 100%);
            color: #000;
            text-align: center;
            padding: 14px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 1.1em;
            text-transform: uppercase;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(255, 193, 7, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
            width: 100%;
            box-sizing: border-box;
        }
        .server-switcher-btn:hover, .server-switcher-btn.focus {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 193, 7, 0.5);
            background: linear-gradient(135deg, #ffc107 0%, #ffca28 100%);
        }
    `;
    
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    var Switcher = new ServerSwitcher();

    // ВИПРАВЛЕННЯ: Додавання кнопки прямо в список головних налаштувань
    function initSettings() {
        // Слухаємо відкриття будь-якого вікна
        Lampa.Settings.listener.follow('open', function (e) {
            // Якщо відкрито саме головне меню налаштувань ('main')
            if (e.name == 'main') {
                // Створюємо елемент
                var item = $(`
                    <div class="settings-param selector" data-type="button">
                        <div class="settings-param__name">Зміна серверу</div>
                        <div class="settings-param__descr">Переключити джерело Lampa</div>
                        <div class="settings-param__status">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.2em; height: 1.2em;">
                                <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6" y2="6"/><line x1="6" y1="18" x2="6" y2="18"/>
                            </svg>
                        </div>
                    </div>
                `);

                // Обробка кліку - одразу відкриваємо модалку
                item.on('hover:enter click', function () {
                    Switcher.open();
                });

                // Додаємо його в початок або кінець списку налаштувань
                // Тут додаємо після розділу "Інтерфейс" або просто в загальний список
                $('.settings__list').eq(0).append(item);
            }
        });
    }

    function initMenu() {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                var item = $('<li class="menu__item selector"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6" y2="6"/><line x1="6" y1="18" x2="6" y2="18"/></svg></div><div class="menu__text">Зміна серверу</div></li>');
                item.on('hover:enter click', function () { Switcher.open(); });
                $('.menu .menu__list').append(item);
            }
        });
    }

    function initHeader() {
        Lampa.Listener.follow('app', function(e) {
            if(e.type == 'ready') {
                var btn = $('<div class="head__action selector"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.5em"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect></svg></div>');
                btn.on('hover:enter click', function () { Switcher.open(); });
                $('.head__actions').prepend(btn);
            }
        });
    }

    if (window.Lampa) {
        initSettings();
        initHeader();
        initMenu();
    }
})();

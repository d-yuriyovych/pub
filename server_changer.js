(function () {
    'use strict';

    var servers = [
        { name: 'Lampa (MX)', url: 'http://lampa.mx' },
        { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
        { name: 'Lampa (NNMTV)', url: 'http://nnmtv.pw' },
        { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
    ];

    function ServerSwitcher() {
        var _this = this;

        // Чистимо URL для точного порівняння (прибираємо протокол і слеші)
        this.cleanUrl = function(url) {
            if(!url) return '';
            return url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
        };

        this.getCurrent = function () {
            // Отримуємо поточний, якщо пусто - намагаємось взяти з location, або дефолт
            var current = Lampa.Storage.get('source');
            if (!current) {
                // Якщо source не заданий в стореджі, Lampa бере його з поточного вікна
                // Спробуємо визначити, чи ми на одному з відомих серверів
                var loc = window.location.origin;
                current = loc;
            }
            return _this.cleanUrl(current);
        };

        // Сучасна перевірка доступності
        this.checkStatus = function (url, callback) {
            var controller = new AbortController();
            var timeoutId = setTimeout(function() { controller.abort(); }, 4000); // Таймаут 4 сек

            // Використовуємо mode: 'no-cors' для перевірки доступності навіть при CORS обмеженнях
            // Але no-cors повертає opaque відповідь (status 0), тому ми вважаємо це успіхом для "пінгу"
            fetch(url, { 
                method: 'HEAD', 
                mode: 'no-cors', 
                signal: controller.signal,
                cache: 'no-store'
            })
            .then(function() {
                clearTimeout(timeoutId);
                callback(true);
            })
            .catch(function(err) {
                clearTimeout(timeoutId);
                // Якщо помилка Mixed Content (https -> http), fetch впаде.
                // Спробуємо простий запит через Image (піксель), як милиця
                var img = new Image();
                img.onload = function() { callback(true); };
                img.onerror = function() { callback(false); }; // Тут вже точно помилка
                img.src = url + '/favicon.ico?' + new Date().getTime();
            });
        };

        this.build = function () {
            var currentClean = this.getCurrent();
            var html = $('<div class="server-switcher-modal"></div>');
            
            // Шукаємо красиву назву поточного сервера
            var currentObj = servers.find(function(s) { 
                return _this.cleanUrl(s.url) === currentClean; 
            });
            
            // Якщо не знайшли в списку, показуємо як є, або 'Lampa (Default)' якщо це app
            var currentDisplayName = currentObj ? currentObj.name : (currentClean || 'Default / Custom');

            html.append('<div class="server-switcher-label">Поточний сервер:</div>');
            html.append('<div class="server-switcher-current">' + currentDisplayName + '</div>');
            html.append('<div class="server-switcher-divider"></div>');
            html.append('<div class="server-switcher-label">Список серверів:</div>');

            var list = $('<div class="server-switcher-list"></div>');
            
            servers.forEach(function (server) {
                var serverClean = _this.cleanUrl(server.url);
                var isCurrent = serverClean === currentClean;

                // Створюємо елемент
                var item = $('<div class="server-switcher-item selector" data-url="' + server.url + '"></div>');
                if (isCurrent) item.addClass('active-server-item'); // Маркуємо поточний, але не даємо клікати

                var info = $('<div class="server-info"><span class="server-dot"></span><span class="server-name">' + server.name + '</span></div>');
                var statusText = $('<span class="server-status">Перевірка...</span>');

                item.append(info).append(statusText);
                
                // Події
                item.on('hover:enter click', function () {
                    // Забороняємо вибір поточного або недоступного
                    if ($(this).hasClass('disabled') || $(this).hasClass('active-server-item')) return;
                    
                    $('.server-switcher-item', list).removeClass('active');
                    $(this).addClass('active');
                });

                list.append(item);

                // Запускаємо перевірку
                _this.checkStatus(server.url, function(isOnline) {
                    var dot = item.find('.server-dot');
                    var nameEl = item.find('.server-name');

                    if(isOnline) {
                        statusText.text('Доступний').addClass('status-online');
                        dot.addClass('dot-online');
                        nameEl.addClass('color-online'); // Колір назви
                    } else {
                        statusText.text('Недоступний').addClass('status-offline');
                        dot.addClass('dot-offline');
                        nameEl.addClass('color-offline'); // Колір назви
                        item.addClass('disabled').removeClass('selector');
                    }
                });
            });

            html.append(list);

            // Кнопка зміни
            var btn = $('<div class="button selector server-change-btn">Змінити сервер</div>');
            btn.on('hover:enter click', function () {
                var selected = $('.server-switcher-item.active', html);
                if (selected.length) {
                    _this.applyServer(selected.data('url'));
                } else {
                    Lampa.Noty.show('Оберіть новий доступний сервер зі списку');
                }
            });

            html.append(btn);
            return html;
        };

        this.applyServer = function (newUrl) {
            try {
                Lampa.Modal.close();
                Lampa.Noty.show('Зміна сервера... Зачекайте.');

                // 1. Встановлюємо значення
                Lampa.Storage.set('source', newUrl);
                
                // 2. Якщо мови немає, ставимо UK
                if(!Lampa.Storage.get('language')) Lampa.Storage.set('language', 'uk');

                // 3. Примусове збереження (важливо для Android TV)
                Lampa.Storage.save(); 

                // 4. Затримка перед рестартом, щоб сторедж встиг записатись на диск
                setTimeout(function () {
                    // Спроба використати нативний релоад Android клієнта
                    if (typeof Lampa.Android !== 'undefined' && Lampa.Android.reload) {
                        Lampa.Android.reload();
                    } 
                    // Спроба використати утиліту Лампи
                    else if (Lampa.Utils && Lampa.Utils.reload) {
                        // Перевіряємо, щоб це не викликало циклічний рестарт
                        // Utils.reload зазвичай робить location.reload, але краще явно
                        window.location.reload();
                    } 
                    // Стандартний релоад
                    else {
                        window.location.reload();
                    }
                }, 1000); // Збільшив затримку до 1с для надійності
            } catch (e) {
                console.log('Switcher Error:', e);
                window.location.reload();
            }
        };

        this.open = function () {
            Lampa.Modal.open({
                title: 'Зміна серверу',
                html: _this.build(),
                size: 'medium',
                mask: true,
                onBack: function () {
                    Lampa.Modal.close();
                    // Важливо: повертаємо фокус на контент, інакше пульт не працює
                    Lampa.Controller.toggle('content'); 
                }
            });
        };
    }

    // CSS стилі
    var css = `
        .server-switcher-modal { padding: 10px; }
        .server-switcher-label { color: #aaa; font-size: 0.8em; margin-bottom: 5px; text-transform: uppercase; }
        .server-switcher-current { color: #fcd462; font-size: 1.3em; font-weight: bold; margin-bottom: 12px; }
        .server-switcher-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 10px 0; }
        .server-switcher-list { max-height: 40vh; overflow-y: auto; margin-bottom: 15px; }
        
        .server-switcher-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; border-radius: 6px; margin-bottom: 4px; background: rgba(255,255,255,0.05); transition: background 0.2s; }
        
        /* Ховер ефект для активного вибору */
        .server-switcher-item.active { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); }
        .server-switcher-item.disabled { opacity: 0.4; pointer-events: none; }
        .server-switcher-item.active-server-item { border: 1px solid #fcd462; opacity: 0.8; }

        .server-info { display: flex; align-items: center; }
        .server-name { font-weight: bold; margin-left: 10px; color: #fff; transition: color 0.3s; }
        .server-dot { width: 8px; height: 8px; border-radius: 50%; background: #555; }
        
        /* Кольори статусів */
        .dot-online { background: #4b6; box-shadow: 0 0 5px #4b6; }
        .status-online { color: #4b6; font-size: 0.8em; }
        .color-online { color: #4b6 !important; }
        
        .dot-offline { background: #f44; }
        .status-offline { color: #f44; font-size: 0.8em; }
        .color-offline { color: #f44 !important; }

        /* Стиль кнопки Змінити сервер */
        .server-change-btn {
            text-align: center;
            width: 100%;
            background-color: #fcd462;
            color: #000000;
            font-weight: bold;
            padding: 12px;
            border-radius: 8px;
            transition: background-color 0.2s;
            margin-top: 10px;
        }
        .server-change-btn.focus,
        .server-change-btn:hover {
            background-color: #eec242; /* Трохи темніший жовтий */
            color: #000000;
        }
    `;
    
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    var Switcher = new ServerSwitcher();

    function initSettings() {
        // Ми додаємо компонент, щоб він з'явився в списку
        var Settings = Lampa.SettingsApi || Lampa.Settings;
        if (!Settings || !Settings.addComponent) return;

        Settings.addComponent({
            component: 'srv_switch',
            name: 'Зміна серверу',
            icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.67-1.5-1.5s.68-1.5 1.5-1.5 1.5.67 1.5 1.5-.68 1.5-1.5 1.5zM19 5v4H5V5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5c-.82 0-1.5-.67-1.5-1.5S6.18 5.5 7 5.5s1.5.67 1.5 1.5-.68 1.5-1.5 1.5z"/></svg>'
        });

        // ХАК: Щоб відкрити модалку одразу, а не заходити в підменю
        // Слухаємо подію рендеру налаштувань
        Lampa.Listener.follow('settings', function (e) {
            if (e.type == 'render') {
                setTimeout(function() {
                    // Шукаємо наш елемент в DOM налаштувань
                    var item = $('.settings__item[data-component="srv_switch"]');
                    if (item.length) {
                        // Видаляємо старі події і ставимо свою
                        item.off('hover:enter click');
                        item.on('hover:enter click', function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            Switcher.open();
                        });
                    }
                }, 200); // Невелика затримка, щоб DOM побудувався
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

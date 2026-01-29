(function () {
    'use strict';

    // Конфігурація серверів
    var servers = [
        { name: 'Lampa (MX)', url: 'http://lampa.mx' },
        { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
        { name: 'Lampa (NNMTV)', url: 'http://nnmtv.pw' },
        { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
    ];

    function ServerSwitcher() {
        var _this = this;
        var modal_window = null;

        // Очищення URL для порівняння
        this.cleanUrl = function(url) {
            if(!url) return '';
            return url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
        };

        // Логіка визначення поточного сервера
        this.getCurrent = function () {
            var currentUrl = window.location.href;
            var storageUrl = Lampa.Storage.get('source');

            // Якщо ми в браузері (http/https) - віримо адресному рядку
            if (currentUrl.indexOf('http') === 0) {
                return _this.cleanUrl(window.location.origin);
            }
            // Якщо це додаток (file://), віримо налаштуванням
            if (storageUrl) {
                return _this.cleanUrl(storageUrl);
            }
            return 'lampa.mx';
        };

        this.checkStatus = function (url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.timeout = 3000; // Швидший таймаут
            
            xhr.onload = function() { 
                callback(xhr.status >= 200 && xhr.status < 400);
            };
            // Всі помилки мережі вважаємо як offline, щоб не було Script Error
            xhr.onerror = function() { callback(false); };
            xhr.ontimeout = function() { callback(false); };
            
            try { xhr.send(); } catch (e) { callback(false); }
        };

        this.build = function () {
            var currentClean = this.getCurrent();
            var html = $('<div class="server-switcher-modal"></div>');

            // --- Шапка з поточним сервером ---
            var currentObj = servers.find(function(s) { 
                return _this.cleanUrl(s.url) === currentClean; 
            });
            var currentName = currentObj ? currentObj.name : (window.location.hostname || 'Невідомий');

            html.append('<div class="server-switcher-head">Поточний сервер</div>');
            html.append('<div class="server-switcher-current-val">' + currentName + '</div>');
            html.append('<div class="server-switcher-divider"></div>');
            html.append('<div class="server-switcher-head">Список серверів</div>');

            // --- Список ---
            var list = $('<div class="server-switcher-list"></div>');
            
            servers.forEach(function (server) {
                var serverClean = _this.cleanUrl(server.url);
                // Пропускаємо поточний сервер у списку вибору
                if (serverClean === currentClean) return;

                var item = $('<div class="server-switcher-item selector" data-url="' + server.url + '"></div>');
                
                var info = $('<div class="server-info"></div>');
                var dot = $('<span class="server-dot"></span>');
                var name = $('<span class="server-name">' + server.name + '</span>');
                
                info.append(dot).append(name);
                var statusText = $('<span class="server-status">Очікування...</span>');

                item.append(info).append(statusText);
                
                item.on('hover:enter click', function () {
                    if ($(this).hasClass('disabled')) return;
                    // Знімаємо активність з інших
                    html.find('.server-switcher-item').removeClass('active');
                    // Ставимо на цей
                    $(this).addClass('active');
                });

                list.append(item);

                // Перевірка
                _this.checkStatus(server.url, function(isOnline) {
                    if(isOnline) {
                        statusText.text('Доступний').removeClass('st-offline').addClass('st-online');
                        dot.removeClass('dot-offline').addClass('dot-online');
                        name.removeClass('name-offline').addClass('name-online');
                    } else {
                        statusText.text('Недоступний').removeClass('st-online').addClass('st-offline');
                        dot.removeClass('dot-online').addClass('dot-offline');
                        name.removeClass('name-online').addClass('name-offline');
                        // Робимо неактивним
                        item.addClass('disabled').removeClass('selector');
                    }
                });
            });

            html.append(list);

            // --- Кнопка ---
            var btn = $('<div class="server-switcher-btn selector">Змінити сервер</div>');
            btn.on('hover:enter click', function () {
                var selected = html.find('.server-switcher-item.active');
                if (selected.length > 0) {
                    _this.applyServer(selected.data('url'));
                } else {
                    Lampa.Noty.show('Спочатку виберіть сервер (зелений)');
                }
            });

            html.append(btn);

            return html;
        };

        this.applyServer = function (newUrl) {
            Lampa.Modal.close();
            Lampa.Noty.show('Збереження та перехід...');

            // 1. Зберігаємо в усі можливі сховища
            Lampa.Storage.set('source', newUrl);
            try { localStorage.setItem('source', newUrl); } catch(e) {}
            
            // 2. Примусове збереження Lampa
            Lampa.Storage.save();

            // 3. Перехід
            setTimeout(function () {
                try {
                    // Використовуємо assign для переходу як за посиланням
                    window.location.assign(newUrl);
                } catch (e) {
                    // Фоллбек, якщо щось піде не так
                    window.location.href = newUrl;
                }
            }, 500);
        };

        this.open = function () {
            var html = _this.build();

            Lampa.Modal.open({
                title: 'Зміна серверу',
                html: html,
                size: 'medium',
                mask: true,
                onBack: function () {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('content');
                }
            });

            modal_window = html;
        };
    }

    // --- CSS ---
    var css = `
        .server-switcher-modal { padding: 0 10px 15px 10px; display: flex; flex-direction: column; }
        .server-switcher-head { color: #aaa; font-size: 0.8em; margin-top: 15px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
        .server-switcher-current-val { color: #fff; font-size: 1.4em; font-weight: bold; margin-bottom: 5px; padding-left: 5px; text-shadow: 0 0 10px rgba(0,0,0,0.5); }
        .server-switcher-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 10px 0; width: 100%; }
        
        .server-switcher-list { 
            max-height: 50vh; 
            overflow-y: auto; 
            margin-bottom: 20px; 
            display: flex; 
            flex-direction: column; 
            gap: 8px; /* Відступ між елементами */
        }

        .server-switcher-item { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 15px; /* Більший паддінг щоб не різало */
            border-radius: 8px; 
            background: rgba(255,255,255,0.05); 
            transition: background 0.2s, transform 0.2s;
            cursor: pointer;
            position: relative;
        }
        
        /* Ховер на елемент списку */
        .server-switcher-item.selector.active { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.1); }
        .server-switcher-item.disabled { opacity: 0.4; pointer-events: none; filter: grayscale(1); }

        .server-info { display: flex; align-items: center; }
        
        .server-dot { width: 10px; height: 10px; border-radius: 50%; background: #555; margin-right: 15px; flex-shrink: 0; transition: background 0.3s; }
        .dot-online { background: #4b6; box-shadow: 0 0 6px #4b6; }
        .dot-offline { background: #f44; }

        .server-name { font-size: 1.1em; font-weight: 500; color: #ccc; transition: color 0.3s; }
        .name-online { color: #fff; font-weight: bold; } 
        .name-offline { color: #f66; }

        .server-status { font-size: 0.9em; color: #777; margin-left: auto; padding-left: 10px; white-space: nowrap; }
        .st-online { color: #4b6; }
        .st-offline { color: #f44; }

        /* Кнопка */
        .server-switcher-btn {
            background: #fbd043; /* Основний колір */
            color: #000;
            text-align: center;
            padding: 16px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 1.1em;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-top: auto;
        }
        /* Ховер ефект для кнопки (темніший) */
        .server-switcher-btn.focus,
        .server-switcher-btn:hover {
            background: #e0b628; /* Темніший жовтий */
            box-shadow: 0 5px 15px rgba(224, 182, 40, 0.4);
            transform: scale(1.02);
        }
    `;
    
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    var Switcher = new ServerSwitcher();

    // 1. Ін'єкція в Головне Меню Налаштувань (Надійно)
    function initSettings() {
        // Використовуємо подію open, щоб вклинитись в рендер
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name == 'main') {
                var item = $(`
                    <div class="settings-param selector" data-type="button">
                        <div class="settings-param__name">Зміна серверу</div>
                        <div class="settings-param__descr">Вибір джерела завантаження Lampa</div>
                        <div class="settings-param__status"></div>
                    </div>
                `);

                item.on('hover:enter click', function () {
                    Switcher.open();
                });

                // Додаємо після блоку Interface або в кінець
                var container = $('.settings__list');
                if(container.length) {
                    container.append(item);
                }
            }
        });
    }

    // 2. Бічне меню (Повернуто)
    function initMenu() {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                var item = $('<li class="menu__item selector"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 16.1A5 5 0 0 1 5.9 2h12.2A5 5 0 0 1 22 7.9v8.2A5 5 0 0 1 18.1 22H5.9A5 5 0 0 1 2 16.1z"></path><line x1="12" y1="2" x2="12" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg></div><div class="menu__text">Зміна серверу</div></li>');
                
                item.on('hover:enter click', function () { 
                    Switcher.open(); 
                });
                
                $('.menu .menu__list').append(item);
            }
        });
    }

    // 3. Хедер
    function initHeader() {
        Lampa.Listener.follow('app', function(e) {
            if(e.type == 'ready') {
                var btn = $('<div class="head__action selector"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.5em"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg></div>');
                btn.on('hover:enter click', function () { Switcher.open(); });
                $('.head__actions').prepend(btn);
            }
        });
    }

    if (window.Lampa) {
        initSettings();
        initMenu();
        initHeader();
    }
})();

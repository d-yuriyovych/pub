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

        // Функція для очищення URL (щоб коректно порівнювати)
        this.cleanUrl = function(url) {
            if(!url) return '';
            // Прибираємо протокол та слеш в кінці для чистого порівняння доменів
            return url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
        };

        // Визначення поточного сервера
        this.getCurrent = function () {
            var loc = window.location.href;
            // Якщо ми у файловій системі (Android TV box іноді), беремо зі Storage
            if (loc.indexOf('file://') === 0) {
                return _this.cleanUrl(Lampa.Storage.get('source') || 'lampa.mx');
            }
            return _this.cleanUrl(window.location.origin);
        };

        // Перевірка статусу
        this.checkStatus = function (url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.timeout = 5000; // 5 секунд таймаут
            
            xhr.onload = function() { 
                if (xhr.status >= 200 && xhr.status < 400) callback(true);
                else callback(false);
            };
            xhr.onerror = function() { callback(false); };
            xhr.ontimeout = function() { callback(false); };
            
            try { xhr.send(); } catch (e) { callback(false); }
        };

        this.build = function () {
            var currentClean = this.getCurrent();
            var html = $('<div class="server-switcher-modal"></div>');

            // --- БЛОК 1: Поточний сервер ---
            var currentObj = servers.find(function(s) { 
                return _this.cleanUrl(s.url) === currentClean; 
            });
            var currentName = currentObj ? currentObj.name : (window.location.hostname || 'Локальний/Невідомий');

            html.append('<div class="server-switcher-head">Поточний сервер</div>');
            html.append('<div class="server-switcher-current-val">' + currentName + '</div>');
            html.append('<div class="server-switcher-divider"></div>');
            html.append('<div class="server-switcher-head">Оберіть сервер для зміни</div>');

            // --- БЛОК 2: Список (без поточного) ---
            var list = $('<div class="server-switcher-list"></div>');
            
            var availableServers = servers.filter(function(s) {
                return _this.cleanUrl(s.url) !== currentClean;
            });

            if (availableServers.length === 0) {
                list.append('<div class="server-switcher-empty">Немає інших серверів для вибору</div>');
            }

            availableServers.forEach(function (server) {
                var item = $('<div class="server-switcher-item selector" data-url="' + server.url + '"></div>');
                
                // Структура рядка
                var info = $('<div class="server-info"></div>');
                var dot = $('<span class="server-dot"></span>');
                var name = $('<span class="server-name">' + server.name + '</span>');
                
                info.append(dot).append(name);
                
                var statusText = $('<span class="server-status">Перевірка...</span>');

                item.append(info).append(statusText);
                
                // Події миші/пульта
                item.on('hover:enter click', function () {
                    if ($(this).hasClass('disabled')) return;
                    $('.server-switcher-item', html).removeClass('active');
                    $(this).addClass('active');
                });

                list.append(item);

                // Асинхронна перевірка
                _this.checkStatus(server.url, function(isOnline) {
                    if(isOnline) {
                        statusText.text('Доступний').addClass('st-online');
                        dot.addClass('dot-online');
                        name.addClass('name-online'); // Фарбуємо назву в зелений
                    } else {
                        statusText.text('Недоступний').addClass('st-offline');
                        dot.addClass('dot-offline');
                        name.addClass('name-offline'); // Фарбуємо назву в червоний
                        item.addClass('disabled').removeClass('selector');
                    }
                });
            });

            html.append(list);

            // --- БЛОК 3: Кнопка ---
            var btn = $('<div class="server-switcher-btn selector">Змінити сервер</div>');
            btn.on('hover:enter click', function () {
                var selected = $('.server-switcher-item.active', html);
                if (selected.length) {
                    _this.applyServer(selected.data('url'));
                } else {
                    Lampa.Noty.show('Спочатку оберіть доступний сервер');
                }
            });

            html.append(btn);
            return html;
        };

        this.applyServer = function (newUrl) {
            // 1. Запис в налаштування Lampa
            Lampa.Storage.set('source', newUrl);
            
            // 2. Дублюємо в localStorage (для Android додатків, які читають нативне сховище)
            try {
                localStorage.setItem('source', newUrl);
            } catch(e) {}

            Lampa.Storage.save(); 
            
            Lampa.Modal.close();
            Lampa.Noty.show('Перехід на ' + newUrl + ' ...');

            // Затримка для гарантованого збереження даних перед переходом
            setTimeout(function () {
                // Спеціальна обробка: спроба використати Lampa Utils якщо доступно
                if (typeof Lampa.Utils !== 'undefined' && Lampa.Utils.reload) {
                     // Примусово міняємо location перед релоадом
                     window.location.href = newUrl;
                } else {
                     // Стандартний перехід
                     window.location.href = newUrl;
                }
            }, 500);
        };

        this.open = function () {
            Lampa.Modal.open({
                title: 'Зміна серверу',
                html: _this.build(),
                size: 'medium',
                mask: true,
                onBack: function () {
                    Lampa.Modal.close();
                    // Важливо: повертаємо фокус на попередній екран
                    Lampa.Controller.toggle('content'); 
                }
            });
        };
    }

    // --- CSS STYLES ---
    var css = `
        .server-switcher-modal { padding: 0 10px 10px 10px; }
        .server-switcher-head { color: #aaa; font-size: 0.8em; margin-top: 10px; margin-bottom: 5px; text-transform: uppercase; }
        .server-switcher-current-val { color: #fff; font-size: 1.2em; font-weight: bold; margin-bottom: 10px; padding-left: 5px; }
        .server-switcher-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 10px 0; }
        
        .server-switcher-list { max-height: 50vh; overflow-y: auto; margin-bottom: 15px; }
        .server-switcher-empty { padding: 20px; text-align: center; color: #777; }

        .server-switcher-item { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 12px 15px; /* Більше відступів щоб не різало текст */
            min-height: 50px;   /* Мінімальна висота */
            border-radius: 8px; 
            margin-bottom: 6px; 
            background: rgba(255,255,255,0.05); 
            transition: all 0.2s; 
        }
        
        .server-switcher-item.active { background: rgba(255,255,255,0.2); transform: scale(1.02); }
        .server-switcher-item.disabled { opacity: 0.4; }

        .server-info { display: flex; align-items: center; flex-grow: 1; }
        
        /* Стилі точок */
        .server-dot { width: 10px; height: 10px; border-radius: 50%; background: #555; margin-right: 12px; flex-shrink: 0; }
        .dot-online { background: #4b6; box-shadow: 0 0 5px #4b6; }
        .dot-offline { background: #f44; }

        /* Стилі назви (ВАЖЛИВО: змінюємо колір назви) */
        .server-name { font-size: 1.1em; font-weight: 500; color: #ccc; }
        .name-online { color: #4b6; font-weight: bold; } /* Зелений текст назви */
        .name-offline { color: #f44; }

        /* Стилі статусу */
        .server-status { font-size: 0.85em; color: #777; white-space: nowrap; margin-left: 10px; }
        .st-online { color: #4b6; }
        .st-offline { color: #f44; }

        /* Кнопка */
        .server-switcher-btn {
            background: linear-gradient(90deg, #e5a912, #fbd043);
            color: #000;
            text-align: center;
            padding: 12px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            cursor: pointer;
            margin-top: 10px;
        }
        .server-switcher-btn.active { transform: scale(1.02); box-shadow: 0 0 15px rgba(229, 169, 18, 0.5); }
    `;
    
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    var Switcher = new ServerSwitcher();

    // Ініціалізація в меню налаштувань (Старий надійний метод)
    function initSettings() {
        var Settings = Lampa.SettingsApi || Lampa.Settings;
        if (!Settings || !Settings.addComponent) return;

        Settings.addComponent({
            component: 'server_switcher_mod',
            name: 'Зміна серверу',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6" y2="6"/><line x1="6" y1="18" x2="6" y2="18"/></svg>',
            onClick: function() {
                Switcher.open();
            }
        });
    }

    // Ініціалізація кнопки в хедері (верхня панель)
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
    }
})();

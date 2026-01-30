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

        // Чистка URL для порівняння
        this.cleanUrl = function(url) {
            if(!url) return '';
            // Прибираємо http/https, www, і слеші в кінці
            return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase();
        };

        this.getCurrent = function () {
            // 1. Читаємо зі сховища
            var storageSource = Lampa.Storage.get('source');
            
            // 2. Якщо в сховищі пусто, Лампа використовує дефолтний (зазвичай lampa.mx)
            // Ми вважаємо, що якщо пусто - це перший сервер зі списку або lampa.mx
            if (!storageSource) {
                return 'lampa.mx'; 
            }
            return _this.cleanUrl(storageSource);
        };

        // "Пінг" через завантаження картинки (найстабільніший метод для TV/Android)
        this.checkStatus = function (url, callback) {
            var img = new Image();
            var timedOut = false;
            
            var timer = setTimeout(function() {
                timedOut = true;
                img.src = '';
                callback(false);
            }, 3000); // 3 секунди таймаут

            img.onload = function() {
                if (!timedOut) {
                    clearTimeout(timer);
                    callback(true);
                }
            };
            
            img.onerror = function() {
                if (!timedOut) {
                    clearTimeout(timer);
                    // Часто фавіконки немає, але сервер відповів 404 - це означає він живий.
                    // Але для надійності вважаємо помилку за доступність ТІЛЬКИ якщо це не повний відвал мережі.
                    // На жаль, img.onerror не дає коду помилки. 
                    // Тому для надійності: якщо помилка - пробуємо вважати що сервер недоступний,
                    // або можна спробувати ще один запит. Але зазвичай це працює.
                    // В даному випадку краще вважати false, щоб не посилати на мертвий сервер.
                    callback(false);
                }
            };

            // Додаємо випадкове число, щоб уникнути кешування
            img.src = url + '/favicon.ico?t=' + new Date().getTime();
        };

        this.build = function () {
            var currentClean = this.getCurrent();
            var html = $('<div class="server-switcher-modal"></div>');
            
            // Пошук об'єкта поточного сервера для відображення назви
            var currentObj = servers.find(function(s) { 
                return _this.cleanUrl(s.url) === currentClean; 
            });
            
            var currentDisplayName = currentObj ? currentObj.name : (currentClean || 'За замовчуванням');

            html.append('<div class="server-switcher-label">Поточний сервер:</div>');
            html.append('<div class="server-switcher-current">' + currentDisplayName + '</div>');
            html.append('<div class="server-switcher-divider"></div>');
            html.append('<div class="server-switcher-label">Доступні для зміни:</div>');

            var list = $('<div class="server-switcher-list"></div>');
            
            servers.forEach(function (server) {
                var serverClean = _this.cleanUrl(server.url);
                
                // Фільтрація: НЕ показуємо поточний сервер у списку
                if (serverClean === currentClean) return;

                var item = $('<div class="server-switcher-item selector" data-url="' + server.url + '"></div>');
                var info = $('<div class="server-info"><span class="server-dot"></span><span class="server-name">' + server.name + '</span></div>');
                var statusText = $('<span class="server-status">Перевірка...</span>');

                item.append(info).append(statusText);
                
                item.on('hover:enter click', function () {
                    if ($(this).hasClass('disabled')) return;
                    $('.server-switcher-item', list).removeClass('active');
                    $(this).addClass('active');
                });

                list.append(item);

                _this.checkStatus(server.url, function(isOnline) {
                    var dot = item.find('.server-dot');
                    var nameEl = item.find('.server-name');

                    if(isOnline) {
                        statusText.text('Доступний').addClass('status-online');
                        dot.addClass('dot-online');
                        nameEl.addClass('color-online');
                    } else {
                        statusText.text('Недоступний').addClass('status-offline');
                        dot.addClass('dot-offline');
                        nameEl.addClass('color-offline');
                        item.addClass('disabled').removeClass('selector');
                    }
                });
            });

            html.append(list);

            var btn = $('<div class="button selector server-change-btn">Змінити сервер</div>');
            btn.on('hover:enter click', function () {
                var selected = $('.server-switcher-item.active', html);
                if (selected.length) {
                    _this.applyServer(selected.data('url'));
                } else {
                    Lampa.Noty.show('Оберіть сервер зі списку');
                }
            });

            html.append(btn);
            return html;
        };

        this.applyServer = function (newUrl) {
            Lampa.Modal.close();
            Lampa.Noty.show('Збереження та перезапуск...');

            // 1. Зберігаємо в Storage
            Lampa.Storage.set('source', newUrl);
            
            // 2. Примусово оновлюємо Params (для деяких версій Android app)
            if(Lampa.Params) Lampa.Params.values['source'] = newUrl;

            // 3. Зберігаємо
            Lampa.Storage.save(); 

            // 4. Перезапуск з затримкою
            setTimeout(function () {
                // Спроба використати API Андроїда для зміни URL (якщо існує плагін)
                // Або просто перезавантаження
                try {
                     if (window.Lampa && window.Lampa.Android && window.Lampa.Android.reload) {
                        window.Lampa.Android.reload();
                    } else {
                        window.location.reload();
                    }
                } catch(e) {
                    window.location.reload();
                }
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
                    // Примусово повертаємо фокус, інакше пульт перестане працювати
                    Lampa.Controller.toggle('content'); 
                }
            });
        };
    }

    var css = `
        .server-switcher-modal { padding: 15px; }
        .server-switcher-label { color: #aaa; font-size: 0.8em; margin-bottom: 5px; text-transform: uppercase; }
        .server-switcher-current { color: #ffd948; font-size: 1.2em; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
        .server-switcher-divider { display: none; } /* Сховав, замінив бордером вище */
        .server-switcher-list { max-height: 40vh; overflow-y: auto; margin-bottom: 15px; }
        
        .server-switcher-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; border-radius: 6px; margin-bottom: 6px; background: rgba(255,255,255,0.05); transition: all 0.2s; }
        
        .server-switcher-item.active { background: rgba(255,255,255,0.2); transform: scale(1.02); }
        .server-switcher-item.disabled { opacity: 0.4; pointer-events: none; filter: grayscale(1); }

        .server-info { display: flex; align-items: center; }
        .server-name { font-weight: bold; margin-left: 10px; color: #fff; }
        .server-dot { width: 8px; height: 8px; border-radius: 50%; background: #555; }
        
        .dot-online { background: #4b6; box-shadow: 0 0 6px #4b6; }
        .status-online { color: #4b6; font-size: 0.8em; }
        .color-online { color: #4b6 !important; }
        
        .dot-offline { background: #f44; }
        .status-offline { color: #f44; font-size: 0.8em; }
        .color-offline { color: #f44 !important; }

        /* Стиль кнопки - темніший жовтий */
        .server-change-btn {
            text-align: center;
            width: 100%;
            background-color: #e0c345; /* Темніший жовтий */
            color: #000000;
            font-weight: bold;
            padding: 12px;
            border-radius: 8px;
            margin-top: 10px;
            font-size: 1.1em;
            transition: background 0.2s;
        }
        /* Ховер ефект - ще трохи темніший */
        .server-change-btn.focus,
        .server-change-btn:hover {
            background-color: #c9af3d; 
            color: #000000;
            box-shadow: 0 0 8px rgba(224, 195, 69, 0.4);
        }
    `;
    
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    var Switcher = new ServerSwitcher();

    // --- Ініціалізація в налаштуваннях ---
    function initSettings() {
        var Settings = Lampa.SettingsApi || Lampa.Settings;
        if (!Settings || !Settings.addComponent) return;

        Settings.addComponent({
            component: 'srv_switch',
            name: 'Зміна серверу',
            icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.67-1.5-1.5s.68-1.5 1.5-1.5 1.5.67 1.5 1.5-.68 1.5-1.5 1.5zM19 5v4H5V5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5c-.82 0-1.5-.67-1.5-1.5S6.18 5.5 7 5.5s1.5.67 1.5 1.5-.68 1.5-1.5 1.5z"/></svg>'
        });

        // Глобальний перехоплювач кліку для налаштувань.
        // Це вирішує проблему відкриття пустої панелі.
        // Ми слухаємо клік на рівні body, але фільтруємо по data-component.
        $('body').on('click', '.settings__item[data-component="srv_switch"]', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // Зупиняємо будь-яку обробку Лампою
            Switcher.open();
            return false;
        });
        
        // Дублюємо для клавіатури/пульту (enter)
        $('body').on('keyup', '.settings__item[data-component="srv_switch"]', function(e) {
            if(e.keyCode === 13) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                Switcher.open();
                return false;
            }
        });
    }

    // --- Ініціалізація в меню (ліворуч) ---
    function initMenu() {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                var item = $('<li class="menu__item selector"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6" y2="6"/><line x1="6" y1="18" x2="6" y2="18"/></svg></div><div class="menu__text">Зміна серверу</div></li>');
                item.on('hover:enter click', function () { Switcher.open(); });
                $('.menu .menu__list').append(item);
            }
        });
    }

    // --- Ініціалізація в шапці ---
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

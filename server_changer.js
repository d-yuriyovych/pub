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

        // 4) Покращена нормалізація URL для точного порівняння
        this.cleanUrl = function(url) {
            if(!url) return '';
            return url.replace(/^https?:\/\//, '')
                      .replace(/^www\./, '')
                      .replace(/\/$/, '')
                      .split(':')[0] // ігноруємо порт для порівняння
                      .trim()
                      .toLowerCase();
        };

        this.getCurrent = function () {
            var storageSource = Lampa.Storage.get('source');
            if (!storageSource) return 'lampa.mx'; 
            return _this.cleanUrl(storageSource);
        };

        // 2) Виправлена перевірка доступності
        this.checkStatus = function (url, callback) {
            var timedOut = false;
            var timer = setTimeout(function() {
                timedOut = true;
                callback(false);
            }, 5000);

            // Використовуємо Image як легкий пінгувальник
            var img = new Image();
            img.onload = function() {
                if (!timedOut) {
                    clearTimeout(timer);
                    callback(true);
                }
            };
            img.onerror = function() {
                if (!timedOut) {
                    clearTimeout(timer);
                    // Навіть помилка CORS означає, що сервер відповів (він онлайн)
                    callback(true); 
                }
            };
            img.src = url + '/favicon.ico?t=' + Date.now();
        };

        this.build = function () {
            var currentClean = this.getCurrent();
            var html = $('<div class="server-switcher-modal"></div>');
            
            var currentObj = servers.find(function(s) { 
                return _this.cleanUrl(s.url) === currentClean; 
            });
            
            var currentDisplayName = currentObj ? currentObj.name : (currentClean || 'Lampa (Default)');

            html.append('<div class="server-switcher-label">Поточний сервер:</div>');
            html.append('<div class="server-switcher-current">' + currentDisplayName + '</div>');
            html.append('<div class="server-switcher-divider"></div>');
            html.append('<div class="server-switcher-label">Оберіть сервер:</div>');

            var list = $('<div class="server-switcher-list"></div>');
            
            servers.forEach(function (server) {
                var serverClean = _this.cleanUrl(server.url);
                if (serverClean === currentClean) return;

                var item = $('<div class="server-switcher-item selector" data-url="' + server.url + '"></div>');
                var info = $('<div class="server-info"><span class="server-dot"></span><span class="server-name">' + server.name + '</span></div>');
                var statusText = $('<span class="server-status">Очікування...</span>');

                item.append(info).append(statusText);
                
                item.on('hover:enter', function () {
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
            btn.on('hover:enter', function () {
                var selected = $('.server-switcher-item.active', html);
                if (selected.length) {
                    _this.applyServer(selected.data('url'));
                } else {
                    Lampa.Noty.show('Спочатку оберіть сервер');
                }
            });

            html.append(btn);
            return html;
        };

        this.applyServer = function (newUrl) {
            Lampa.Noty.show('Збереження налаштувань...');
            Lampa.Storage.set('source', newUrl);
            if(Lampa.Params) Lampa.Params.values['source'] = newUrl;
            Lampa.Storage.save(); 

            setTimeout(function () {
                if (typeof Lampa.Android !== 'undefined' && Lampa.Android.reload) {
                    Lampa.Android.reload();
                } else {
                    window.location.reload();
                }
            }, 500);
        };

        // 3) Виправлене відкриття та керування фокусом
        this.open = function () {
            var render = _this.build();
            
            Lampa.Modal.open({
                title: 'Зміна серверу',
                html: render,
                size: 'medium',
                mask: true,
                onBack: function () {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('content');
                }
            });

            // Надаємо контроль Lampa для навігації стрілками
            Lampa.Controller.add('srv_modal', {
                toggle: function () {
                    Lampa.Controller.collectionSet(render);
                    Lampa.Controller.set('srv_modal');
                },
                up: function () {
                    Lampa.Navigator.move('up');
                },
                down: function () {
                    Lampa.Navigator.move('down');
                },
                back: function () {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('content');
                }
            });
            Lampa.Controller.toggle('srv_modal');
        };
    }

    // Стилі (без змін)
    var css = `
        .server-switcher-modal { padding: 15px; }
        .server-switcher-label { color: #aaa; font-size: 0.8em; margin-bottom: 5px; text-transform: uppercase; }
        .server-switcher-current { color: #ffd948; font-size: 1.2em; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
        .server-switcher-divider { display: none; } 
        .server-switcher-list { max-height: 40vh; overflow-y: auto; margin-bottom: 15px; }
        .server-switcher-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; border-radius: 6px; margin-bottom: 6px; background: rgba(255,255,255,0.05); transition: all 0.2s; }
        .server-switcher-item.active { background: rgba(255,255,255,0.2); transform: scale(1.01); }
        .server-switcher-item.disabled { opacity: 0.4; filter: grayscale(1); pointer-events: none; }
        .server-info { display: flex; align-items: center; }
        .server-name { font-weight: bold; margin-left: 10px; color: #fff; }
        .server-dot { width: 8px; height: 8px; border-radius: 50%; background: #555; }
        .dot-online { background: #4b6; box-shadow: 0 0 6px #4b6; }
        .status-online { color: #4b6; font-size: 0.8em; }
        .color-online { color: #4b6 !important; }
        .dot-offline { background: #f44; }
        .status-offline { color: #f44; font-size: 0.8em; }
        .color-offline { color: #f44 !important; }
        .server-change-btn { text-align: center; width: 100%; background-color: #e0c345; color: #000000; font-weight: bold; padding: 12px; border-radius: 8px; margin-top: 10px; font-size: 1.1em; }
        .server-change-btn.focus { background-color: #fff !important; color: #000 !important; }
    `;
    
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    var Switcher = new ServerSwitcher();

    // 1) Коректна реєстрація в налаштуваннях
    function initSettings() {
        Lampa.SettingsApi && Lampa.SettingsApi.addComponent({
            component: 'srv_switch',
            name: 'Зміна серверу',
            icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.67-1.5-1.5s.68-1.5 1.5-1.5 1.5.67 1.5 1.5-.68 1.5-1.5 1.5zM19 5v4H5V5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5c-.82 0-1.5-.67-1.5-1.5S6.18 5.5 7 5.5s1.5.67 1.5 1.5-.68 1.5-1.5 1.5z"/></svg>'
        });

        // Реєструємо компонент як об'єкт, щоб він не відкривав пусту панель
        Lampa.Component.add('srv_switch', function(){
            this.create = function(){
                Switcher.open();
                return null; // Повертаємо null, бо ми відкриваємо Modal замість панелі
            };
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

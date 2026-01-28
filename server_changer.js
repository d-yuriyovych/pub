(function () {
    'use strict';

    function ServerSwitcher() {
        var _this = this;
        var current_server = window.location.host + window.location.pathname;
        // Очищаємо слеші в кінці для порівняння
        current_server = current_server.replace(/\/$/, '');

        var servers = [
            { name: 'Lampa (MX)', url: 'http://lampa.mx' },
            { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
            { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
            { name: 'Lampa (NNMTV)', url: 'http://lam.nnmtv.pw' }
        ];

        var network = new Lampa.Reguest();
        var selected_url = null;

        this.init = function () {
            // 1. Додаємо в меню налаштувань (Інше)
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main') {
                    var item = $(`
                        <div class="settings-folder selector" data-action="server_switch">
                            <div class="settings-folder__icon">
                                <svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                            </div>
                            <div class="settings-folder__name">Зміна Сервера</div>
                            <div class="settings-folder__descr">Поточний: ${window.location.hostname}</div>
                        </div>
                    `);
                    $('.settings__content .settings-folder').eq(0).after(item);
                    
                    item.on('hover:enter', function () {
                        _this.open();
                    });
                }
            });

            // 2. Додаємо кнопку в шапку (Header)
            if(!window.server_switcher_header_added){
                var head_btn = $(`<div class="head__action selector" style="color: #a3d9ff;"><svg style="fill: currentColor; width: 22px; height: 22px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>`);
                head_btn.on('hover:enter', function() { _this.open(); });
                $('.head .head__actions .head__action').eq(0).before(head_btn);
                window.server_switcher_header_added = true;
            }

            // 3. Додаємо в бічне меню (якщо воно є)
            // Lampa не має офіційного API для вставки в ліве меню, але можна спробувати:
            /* Цей код залежить від версії Lampa, зазвичай хедеру достатньо */
            
            this.addStyles();
        };

        this.addStyles = function() {
            var css = `
                .server-switcher-modal { padding: 20px; }
                .server-item { 
                    padding: 15px; 
                    margin-bottom: 10px; 
                    background: rgba(255,255,255,0.05); 
                    border-radius: 8px; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                }
                .server-item.selector.focus { background: rgba(255,255,255,0.15); transform: scale(1.02); box-shadow: 0 0 15px rgba(0,0,0,0.5); }
                .server-item.active-server { border-color: #4b66ff; background: rgba(75, 102, 255, 0.1); }
                .server-item.selected-target { border-color: #4CAF50; }
                .server-item.offline { opacity: 0.5; pointer-events: none; filter: grayscale(1); }
                
                .server-status { width: 12px; height: 12px; border-radius: 50%; background: #555; box-shadow: 0 0 5px #000; }
                .server-status.online { background: #00ff44; box-shadow: 0 0 10px #00ff44; }
                .server-status.offline-dot { background: #ff0044; box-shadow: 0 0 10px #ff0044; }
                
                .server-apply-btn {
                    margin-top: 20px;
                    padding: 15px;
                    text-align: center;
                    background: #333;
                    border-radius: 8px;
                    color: #aaa;
                    font-weight: bold;
                    text-transform: uppercase;
                    transition: all 0.3s;
                }
                .server-apply-btn.ready { background: #4CAF50; color: #fff; box-shadow: 0 0 20px rgba(76, 175, 80, 0.4); }
                .server-info { display: flex; flex-direction: column; }
                .server-url { font-size: 0.8em; opacity: 0.6; margin-top: 3px; }
                .current-label { font-size: 0.7em; color: #4b66ff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;}
            `;
            $('body').append('<style>' + css + '</style>');
        };

        this.checkAvailability = function(url, callback) {
            // Використовуємо fetch з mode: 'no-cors' для перевірки доступності без блокування CORS
            // Якщо сервер живий, він поверне opaque response (status 0), якщо мертвий - помилку мережі.
            // Щоб уникнути змішаного контенту (http vs https), пробуємо як є.
            
            var timeout = 5000;
            var controller = new AbortController();
            var id = setTimeout(() => controller.abort(), timeout);
            
            // Додаємо випадковий параметр, щоб уникнути кешування
            var check_url = url + '/?' + new Date().getTime(); 

            fetch(check_url, { mode: 'no-cors', signal: controller.signal })
                .then(function() {
                    clearTimeout(id);
                    callback(true);
                })
                .catch(function() {
                    clearTimeout(id);
                    callback(false);
                });
        };

        this.open = function () {
            selected_url = null;
            var html = $('<div class="server-switcher-modal"></div>');
            var list = $('<div class="server-list"></div>');
            var btn  = $('<div class="server-apply-btn selector">Змінити сервер</div>');

            html.append(list);
            html.append(btn);

            // Рендер списку
            servers.forEach(function (server) {
                var is_current = window.location.href.indexOf(server.url.replace('https://','').replace('http://','')) > -1;
                
                var item = $(`
                    <div class="server-item selector" data-url="${server.url}">
                        <div class="server-info">
                            ${is_current ? '<span class="current-label">Поточний</span>' : ''}
                            <div class="server-name">${server.name}</div>
                            <div class="server-url">${server.url}</div>
                        </div>
                        <div class="server-status"></div>
                    </div>
                `);

                if (is_current) item.addClass('active-server');

                list.append(item);

                // Перевірка статусу
                _this.checkAvailability(server.url, function(is_online){
                    var dot = item.find('.server-status');
                    if(is_online) {
                        dot.addClass('online');
                    } else {
                        dot.addClass('offline-dot');
                        item.addClass('offline');
                        item.find('.server-url').text('Недоступний');
                    }
                });

                // Клік по серверу
                item.on('hover:enter', function () {
                    if($(this).hasClass('offline')) return Lampa.Noty.show('Сервер недоступний');
                    
                    list.find('.server-item').removeClass('selected-target');
                    $(this).addClass('selected-target');
                    
                    selected_url = server.url;
                    
                    // Активуємо кнопку
                    btn.addClass('ready');
                    btn.text('Змінити на: ' + server.name);
                });
            });

            // Клік по кнопці "Змінити"
            btn.on('hover:enter', function () {
                if (!selected_url) return Lampa.Noty.show('Спочатку виберіть сервер зі списку');
                
                Lampa.Modal.close();
                
                // Зберігаємо нове джерело
                Lampa.Storage.set('source', selected_url);
                
                // Візуальне повідомлення
                Lampa.Noty.show('Зміна сервера... Зачекайте.');

                // ANDROID FIX: Замість reload використовуємо assign для переходу
                setTimeout(function(){
                   window.location.assign(selected_url);
                }, 1000);
            });

            Lampa.Modal.open({
                title: 'Вибір Сервера',
                html: html,
                size: 'medium',
                mask: true,
                onBack: function () {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('content');
                }
            });
        };
    }

    // Запуск після завантаження Lampa
    if (window.appready) {
        new ServerSwitcher().init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') new ServerSwitcher().init();
        });
    }

})();

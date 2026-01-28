(function () {
    'use strict';

    function ServerSwitcher() {
        var _this = this;
        var servers = [
            { name: 'Lampa (MX)', url: 'http://lampa.mx' },
            { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
            { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
            { name: 'Lampa (NNMTV)', url: 'http://lam.nnmtv.pw' }
        ];

        this.init = function () {
            this.addStyles();
            
            // 1. Налаштування (виправлено дублювання)
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main' && !$('.settings__content [data-action="server_switch"]').length) {
                    var item = $(`
                        <div class="settings-folder selector" data-action="server_switch">
                            <div class="settings-folder__icon">
                                <svg height="44" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#fff"/></svg>
                            </div>
                            <div class="settings-folder__name">Зміна Сервера</div>
                        </div>
                    `);
                    $('.settings__content .settings-folder').eq(0).after(item);
                    item.on('hover:enter', function () { _this.open(); });
                }
            });

            // 2. Шапка
            if(!window.server_switcher_header_added){
                var head_btn = $('<div class="head__action selector" style="color: #a3d9ff;"><svg style="fill: currentColor; width: 22px; height: 22px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>');
                head_btn.on('hover:enter', function() { _this.open(); });
                $('.head .head__actions').prepend(head_btn);
                window.server_switcher_header_added = true;
            }

            // 3. Меню зліва
            Lampa.Listener.follow('menu', function (e) {
                if (e.type == 'ready' && !$('.menu__list [data-action="server_switch"]').length) {
                    var menu_item = $(`
                        <li class="menu__item selector" data-action="server_switch">
                            <div class="menu__ico"><svg height="44" viewBox="0 0 24 24" width="44" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>
                            <div class="menu__text">Зміна сервера</div>
                        </li>
                    `);
                    menu_item.on('hover:enter', function () { _this.open(); });
                    $('.menu__list').append(menu_item);
                }
            });
        };

        this.addStyles = function() {
            var css = `
                .server-switcher-modal { padding: 20px; }
                .server-item { 
                    padding: 15px; margin-bottom: 10px; background: rgba(255,255,255,0.05); 
                    border-radius: 8px; display: flex; justify-content: space-between; align-items: center; 
                    border: 2px solid transparent; transition: all 0.3s ease;
                }
                .server-item.selector.focus { background: rgba(255,255,255,0.15); transform: scale(1.02); }
                
                /* Поточний сервер - Жовтий, не клікабельний */
                .server-item.active-server { border-color: #ffc107; background: rgba(255, 193, 7, 0.1); pointer-events: none; margin-bottom: 20px; }
                .server-item.active-server .server-name { color: #ffc107; }
                
                .server-item.selected-target { border-color: #4CAF50; }
                
                /* Статус та назви */
                .server-name { font-weight: bold; }
                .online .server-name { color: #00ff44; }
                .offline .server-name { color: #ff0044; }
                
                .server-status { width: 10px; height: 10px; border-radius: 50%; background: #555; }
                .server-status.online { background: #00ff44; box-shadow: 0 0 5px #00ff44; }
                .server-status.offline-dot { background: #ff0044; box-shadow: 0 0 10px #ff0044; animation: srv-blink 0.8s infinite; }
                
                @keyframes srv-blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
                
                .server-url { display: none !important; }
                .current-label { font-size: 0.7em; color: #ffc107; text-transform: uppercase; margin-bottom: 2px; }
                
                .server-apply-btn {
                    margin-top: 20px; padding: 15px; text-align: center; background: #333; 
                    border-radius: 8px; color: #aaa; font-weight: bold; text-transform: uppercase;
                }
                .server-apply-btn.ready { background: #4CAF50; color: #fff; }
            `;
            if (!$('#srv-switcher-styles').length) $('body').append('<style id="srv-switcher-styles">' + css + '</style>');
        };

        this.checkAvailability = function(url, callback) {
            var controller = new AbortController();
            var id = setTimeout(() => controller.abort(), 4000);
            // Використовуємо fetch з випадковим параметром для Koyeb та інших
            fetch(url + (url.indexOf('?') > -1 ? '&' : '?') + Date.now(), { mode: 'no-cors', signal: controller.signal })
                .then(function() { clearTimeout(id); callback(true); })
                .catch(function() { clearTimeout(id); callback(false); });
        };

        this.open = function () {
            var selected_url = null;
            var html = $('<div class="server-switcher-modal"></div>');
            var list = $('<div class="server-list"></div>');
            var btn = $('<div class="server-apply-btn selector">Виберіть сервер</div>');

            html.append(list).append(btn);

            // Знаходимо поточний сервер
            var current_host = window.location.hostname;
            var current_obj = servers.find(s => s.url.indexOf(current_host) > -1);

            // 1. Спочатку рендеримо ПОТОЧНИЙ сервер (якщо знайдено)
            if (current_obj) {
                var current_item = $(`
                    <div class="server-item active-server">
                        <div class="server-info">
                            <span class="current-label">Поточний сервер</span>
                            <div class="server-name">${current_obj.name}</div>
                        </div>
                        <div class="server-status online"></div>
                    </div>
                `);
                list.append(current_item);
            }

            // 2. Рендеримо інші для вибору
            servers.forEach(function (server) {
                var is_current = current_obj && server.url === current_obj.url;
                if (is_current) return; // Пропускаємо, бо вже додали вгору

                var item = $(`
                    <div class="server-item selector" data-url="${server.url}">
                        <div class="server-name">${server.name}</div>
                        <div class="server-status"></div>
                    </div>
                `);

                list.append(item);

                _this.checkAvailability(server.url, function(online) {
                    var dot = item.find('.server-status');
                    if(online) {
                        item.addClass('online');
                        dot.addClass('online');
                    } else {
                        item.addClass('offline');
                        dot.addClass('offline-dot');
                    }
                });

                item.on('hover:enter', function () {
                    if($(this).hasClass('offline')) return Lampa.Noty.show('Сервер недоступний');
                    list.find('.server-item').removeClass('selected-target');
                    $(this).addClass('selected-target');
                    selected_url = server.url;
                    btn.addClass('ready').text('Змінити на: ' + server.name);
                });
            });

            btn.on('hover:enter', function () {
                if (!selected_url) return;
                Lampa.Modal.close();
                Lampa.Noty.show('Зміна сервера...');

                // ФІКС ДЛЯ ANDROID: записуємо в пам'ять додатку, щоб він не вертав старий сервер
                Lampa.Storage.set('source', selected_url);
                Lampa.Storage.set('proxy_url', selected_url);
                if (window.appready) {
                    // Спроба очистити системний кеш адреси, якщо доступно
                    try { localStorage.setItem('lampa_url', selected_url); } catch(e){}
                }

                setTimeout(function(){
                   window.location.replace(selected_url);
                }, 500);
            });

            Lampa.Modal.open({
                title: 'Вибір Сервера',
                html: html,
                size: 'medium',
                onBack: function () {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('content');
                }
            });
        };
    }

    if (window.appready) new ServerSwitcher().init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') new ServerSwitcher().init(); });
})();

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
            
            // 1. Додавання в бічне меню
            Lampa.Listener.follow('menu', function (e) {
                if (e.type == 'ready') {
                    var item = $('<li class="menu__item selector" data-action="server_switcher"><div class="menu__ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="menu__text">Зміна сервера</div></li>');
                    item.on('hover:enter', function () { _this.open(); });
                    $('.menu .menu__list').append(item);
                }
            });

            // 2. Додавання в налаштування (Інше)
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main') {
                    setTimeout(function() {
                        var item = $('<div class="settings-folder selector"><div class="settings-folder__icon"><svg height="44" viewBox="0 0 24 24" width="44" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div><div class="settings-folder__name">Зміна Сервера</div></div>');
                        item.on('hover:enter', function () { _this.open(); });
                        $('.settings__content .settings-folder').first().after(item);
                    }, 50);
                }
            });

            // 3. Додавання в шапку
            var head_btn = $('<div class="head__action selector"><svg style="fill: #a3d9ff; width: 22px; height: 22px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>');
            head_btn.on('hover:enter', function() { _this.open(); });
            $('.head .head__actions').prepend(head_btn);
        };

        this.addStyles = function() {
            var css = `
                .srv-modal { padding: 15px; }
                .srv-item { padding: 15px; margin-bottom: 10px; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 2px solid transparent; }
                .srv-item.focus { background: rgba(255,255,255,0.15); border-color: #fff; }
                
                .srv-name { font-weight: bold; font-size: 1.2em; color: #fff; }
                .online .srv-name { color: #00ff44 !important; }
                .offline .srv-name { color: #ff4b4b !important; }
                
                .srv-item.active { background: rgba(255, 193, 7, 0.15) !important; border-color: #ffc107 !important; pointer-events: none; opacity: 0.9; }
                .srv-item.active .srv-name { color: #ffc107 !important; }
                
                .srv-dot { width: 10px; height: 10px; border-radius: 50%; background: #444; }
                .online .srv-dot { background: #00ff44; box-shadow: 0 0 8px #00ff44; }
                .offline .srv-dot { background: #ff0000; box-shadow: 0 0 12px #ff0000; animation: srv-blink 0.8s infinite; }
                
                @keyframes srv-blink { 0% { opacity: 1; } 50% { opacity: 0.1; } 100% { opacity: 1; } }
                
                .srv-apply { margin-top: 20px; padding: 15px; text-align: center; background: #222; border-radius: 12px; color: #777; font-weight: bold; }
                .srv-apply.ready { background: #ffc107; color: #000; }
                .srv-apply.focus { background: #fff; color: #000; }
            `;
            $('body').append('<style id="srv-styles-final">' + css + '</style>');
        };

        this.open = function () {
            var selected_url = null;
            var html = $('<div class="srv-modal"><div class="srv-list"></div><div class="srv-apply selector">Оберіть сервер</div></div>');

            servers.forEach(function (server) {
                var is_current = window.location.hostname === server.url.replace(/^https?:\/\//, '').split('/')[0];
                var item = $('<div class="srv-item selector ' + (is_current ? 'active' : '') + '"><div class="srv-name">' + server.name + (is_current ? ' (Поточний)' : '') + '</div><div class="srv-dot"></div></div>');
                
                html.find('.srv-list').append(item);

                // Перевірка (no-cors для Koyeb)
                fetch(server.url, { mode: 'no-cors' }).then(function() {
                    item.addClass('online');
                }).catch(function() {
                    item.addClass('offline');
                });

                if (!is_current) {
                    item.on('hover:enter', function () {
                        selected_url = server.url;
                        html.find('.srv-item').css('border-color', 'transparent');
                        item.css('border-color', '#fff');
                        html.find('.srv-apply').addClass('ready').text('ПЕРЕЙТИ: ' + server.name);
                    });
                }
            });

            html.find('.srv-apply').on('hover:enter', function () {
                if (!selected_url) return;
                Lampa.Noty.show('Зміна сервера...');
                
                // Android Fix: записуємо адресу як основне джерело
                localStorage.setItem('lampa_last_url', selected_url);
                localStorage.setItem('source', selected_url);
                
                setTimeout(function() {
                    window.location.replace(selected_url);
                }, 400);
            });

            Lampa.Modal.open({
                title: 'Вибір сервера',
                html: html,
                size: 'medium',
                onBack: function () {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('content');
                }
            });
        };
    }

    var run = function() {
        if (window.ServerSwitcherLoaded) return;
        new ServerSwitcher().init();
        window.ServerSwitcherLoaded = true;
    };

    if (window.appready) run();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') run(); });
})();

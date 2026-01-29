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

        this.cleanUrl = function(url) {
            if(!url) return '';
            return url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
        };

        this.getCurrent = function () {
            var current = Lampa.Storage.get('source') || 'lampa.mx';
            return _this.cleanUrl(current);
        };

        // Покращена перевірка доступності
        this.checkStatus = function (url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.timeout = 5000;
            
            xhr.onload = function() { callback(true); };
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
            
            var currentObj = servers.find(function(s) { 
                return _this.cleanUrl(s.url) === currentClean; 
            });
            var currentDisplayName = currentObj ? currentObj.name : currentClean;

            html.append('<div class="server-switcher-label">Поточний сервер:</div>');
            html.append('<div class="server-switcher-current">' + currentDisplayName + '</div>');
            html.append('<div class="server-switcher-divider"></div>');
            html.append('<div class="server-switcher-label">Список серверів:</div>');

            var list = $('<div class="server-switcher-list"></div>');
            
            servers.forEach(function (server) {
                var serverClean = _this.cleanUrl(server.url);
                if (serverClean === currentClean) return;

                var item = $('<div class="server-switcher-item selector" data-url="' + server.url + '"></div>');
                var info = $('<div class="server-info"><span class="server-dot"></span><span class="server-name">' + server.name + '</span></div>');
                var statusText = $('<span class="server-status">Перевірка...</span>');

                item.append(info).append(statusText);
                
                item.on('hover:enter click', function () {
                    if ($(this).hasClass('disabled')) return;
                    $('.server-switcher-item', html).removeClass('active');
                    $(this).addClass('active');
                });

                list.append(item);

                _this.checkStatus(server.url, function(isOnline) {
                    var dot = item.find('.server-dot');
                    if(isOnline) {
                        statusText.text('Доступний').addClass('status-online');
                        dot.addClass('dot-online');
                    } else {
                        statusText.text('Недоступний').addClass('status-offline');
                        dot.addClass('dot-offline');
                        item.addClass('disabled').removeClass('selector');
                    }
                });
            });

            html.append(list);

            var btn = $('<div class="button selector" style="text-align:center; margin-top: 10px; width: 100%;">Змінити сервер</div>');
            btn.on('hover:enter click', function () {
                var selected = $('.server-switcher-item.active', html);
                if (selected.length) _this.applyServer(selected.data('url'));
                else Lampa.Noty.show('Оберіть доступний сервер');
            });

            html.append(btn);
            return html;
        };

        this.applyServer = function (newUrl) {
            try {
                Lampa.Storage.set('source', newUrl);
                if(!Lampa.Storage.get('language')) Lampa.Storage.set('language', 'uk');
                Lampa.Storage.save(); 
                
                Lampa.Modal.close();
                Lampa.Noty.show('Перезавантаження...');

                setTimeout(function () {
                    if (Lampa.Utils && Lampa.Utils.reload) Lampa.Utils.reload();
                    else window.location.reload();
                }, 500);
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
                    Lampa.Controller.toggle('content');
                }
            });
        };
    }

    var css = `
        .server-switcher-modal { padding: 10px; }
        .server-switcher-label { color: #aaa; font-size: 0.8em; margin-bottom: 5px; text-transform: uppercase; }
        .server-switcher-current { color: #ffd948; font-size: 1.3em; font-weight: bold; margin-bottom: 12px; }
        .server-switcher-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 10px 0; }
        .server-switcher-list { max-height: 40vh; overflow-y: auto; }
        .server-switcher-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-radius: 6px; margin-bottom: 4px; background: rgba(255,255,255,0.05); }
        
        /* Виділення вибраного: Світло-сірий */
        .server-switcher-item.active { background: rgba(255,255,255,0.15); }
        .server-switcher-item.disabled { opacity: 0.5; }

        .server-info { display: flex; align-items: center; }
        .server-name { font-weight: bold; margin-left: 8px; color: #fff; }
        .server-dot { width: 8px; height: 8px; border-radius: 50%; background: #555; }
        
        /* Статуси */
        .dot-online { background: #4b6; }
        .status-online { color: #4b6; font-size: 0.8em; }
        
        .dot-offline { background: #f44; }
        .status-offline { color: #f44; font-size: 0.8em; }
    `;
    
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    var Switcher = new ServerSwitcher();

    function initSettings() {
        var Settings = Lampa.SettingsApi || Lampa.Settings;
        if (!Settings || !Settings.addComponent) return;

        Settings.addComponent({
            component: 'srv_switch',
            name: 'Зміна серверу',
            icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.67-1.5-1.5s.68-1.5 1.5-1.5 1.5.67 1.5 1.5-.68 1.5-1.5 1.5zM19 5v4H5V5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5c-.82 0-1.5-.67-1.5-1.5S6.18 5.5 7 5.5s1.5.67 1.5 1.5-.68 1.5-1.5 1.5z"/></svg>'
        });

        Settings.addParam({
            component: 'srv_switch',
            param: { name: 'open_btn', type: 'button' },
            field: { name: 'Вибрати сервер' },
            onChange: function () { Switcher.open(); }
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

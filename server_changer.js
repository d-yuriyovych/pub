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
        var last_focus; // Для повернення фокусу

        this.cleanUrl = function(url) {
            if(!url) return '';
            return url.toLowerCase()
                .replace(/^https?:\/\//, '')
                .replace(/^www\./, '')
                .replace(/\/$/, '')
                .trim();
        };

        this.getCurrent = function () {
            var storageSource = Lampa.Storage.get('source');
            return storageSource ? storageSource : 'http://lampa.mx';
        };

        // 2) Виправлена перевірка доступності через fetch
        this.checkStatus = function (url, callback) {
            var controller = new AbortController();
            var timeoutId = setTimeout(() => controller.abort(), 4000);

            fetch(url, { mode: 'no-cors', signal: controller.signal })
                .then(function() {
                    clearTimeout(timeoutId);
                    callback(true);
                })
                .catch(function() {
                    clearTimeout(timeoutId);
                    callback(false);
                });
        };

        this.build = function () {
            var currentUrl = this.getCurrent();
            var currentClean = this.cleanUrl(currentUrl);
            var html = $('<div class="server-switcher-modal"></div>');
            
            var currentObj = servers.find(function(s) { 
                return _this.cleanUrl(s.url) === currentClean; 
            });
            
            var currentDisplayName = currentObj ? currentObj.name : currentClean;

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
                var statusText = $('<span class="server-status">Перевірка...</span>');

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

            var btn = $('<div class="button selector server-change-btn">Підключитися</div>');
            btn.on('hover:enter', function() {
                $('.server-switcher-item', list).removeClass('active');
            }).on('click', function () {
                var selected = $('.server-switcher-item.active', html);
                if (selected.length) {
                    _this.applyServer(selected.data('url'));
                } else {
                    Lampa.Noty.show('Будь ласка, оберіть доступний сервер');
                }
            });

            html.append(btn);
            return html;
        };

        this.applyServer = function (newUrl) {
            Lampa.Storage.set('source', newUrl);
            if(window.localStorage) localStorage.setItem('source', newUrl);
            
            Lampa.Noty.show('Зміна сервера на: ' + newUrl);

            setTimeout(function () {
                if (typeof Lampa.Android !== 'undefined' && Lampa.Android.reload) {
                    Lampa.Android.reload();
                } else {
                    window.location.href = window.location.origin + window.location.pathname;
                }
            }, 1000);
        };

        // 3) Виправлено закриття та фокус
        this.close = function() {
            Lampa.Modal.close();
            Lampa.Controller.toggle(last_focus);
        };

        this.open = function () {
            last_focus = Lampa.Controller.enabled().name;
            Lampa.Modal.open({
                title: 'Менеджер серверів',
                html: _this.build(),
                size: 'medium',
                mask: true,
                onBack: function () {
                    _this.close();
                }
            });
            Lampa.Controller.add('server_switcher', {
                toggle: function () {
                    Lampa.Controller.collectionSet(_this.build());
                    Lampa.Controller.navigate();
                },
                back: function () {
                    _this.close();
                }
            });
            Lampa.Controller.toggle('server_switcher');
        };
    }

    var css = `
        .server-switcher-modal { padding: 10px; }
        .server-switcher-label { color: #aaa; font-size: 14px; margin-bottom: 8px; }
        .server-switcher-current { color: #fff; font-size: 18px; font-weight: bold; margin-bottom: 20px; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; }
        .server-switcher-list { max-height: 300px; overflow-y: auto; margin-bottom: 20px; }
        .server-switcher-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-radius: 8px; margin-bottom: 8px; background: rgba(255,255,255,0.05); }
        .server-switcher-item.focus { background: rgba(255,255,255,0.2); }
        .server-switcher-item.active { border: 2px solid #ffde1a; }
        .server-switcher-item.disabled { opacity: 0.3; }
        .server-info { display: flex; align-items: center; }
        .server-dot { width: 10px; height: 10px; border-radius: 50%; background: #555; margin-right: 12px; }
        .dot-online { background: #4b6; box-shadow: 0 0 8px #4b6; }
        .dot-offline { background: #f44; }
        .status-online { color: #4b6; }
        .status-offline { color: #f44; }
        .server-change-btn { margin-top: 10px; width: 100%; text-align: center; background: #ffde1a !important; color: #000 !important; }
    `;
    
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    var Switcher = new ServerSwitcher();

    // 1) Виправлено відкриття з налаштувань
    function initSettings() {
        Lampa.SettingsApi && Lampa.SettingsApi.addComponent({
            component: 'srv_switch',
            name: 'Зміна серверу',
            icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.67-1.5-1.5s.68-1.5 1.5-1.5 1.5.67 1.5 1.5-.68 1.5-1.5 1.5zM19 5v4H5V5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5c-.82 0-1.5-.67-1.5-1.5S6.18 5.5 7 5.5s1.5.67 1.5 1.5-.68 1.5-1.5 1.5z"/></svg>'
        });

        Lampa.Listener.follow('settings', function (e) {
            if (e.type == 'render' && e.name == 'main') {
                var item = e.body.find('.settings__item[data-component="srv_switch"]');
                item.unbind('click').on('click', function (event) {
                    event.stopPropagation();
                    Switcher.open();
                });
            }
        });
    }

    function initMenu() {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                var item = $('<li class="menu__item selector"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6" y2="6"/><line x1="6" y1="18" x2="6" y2="18"/></svg></div><div class="menu__text">Зміна серверу</div></li>');
                item.on('click', function () { Switcher.open(); });
                $('.menu .menu__list').append(item);
            }
        });
    }

    function initHeader() {
        Lampa.Listener.follow('app', function(e) {
            if(e.type == 'ready') {
                var btn = $('<div class="head__action selector"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.5em"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect></svg></div>');
                btn.on('click', function () { Switcher.open(); });
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

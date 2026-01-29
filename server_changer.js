(function () {
    'use strict';

    var servers = [
        { name: 'Lampa (MX)', url: 'http://lampa.mx' },
        { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
        { name: 'Lampa (NNMTV)', url: 'http://nnmtv.pw' },
        { name: 'Lampa (VIP)', url: 'http://lampa.vip' }
    ];

    var Switcher = {
        open: function () {
            var _this = this;
            var current = Lampa.Storage.get('source') || window.location.origin;
            var clean = function(u) { return u.replace(/^https?:\/\//, '').replace(/\/$/, ''); };
            var currentClean = clean(current);

            // Створення модалки
            var modal = $('<div id="srv-modal" class="srv-modal-overlay">' +
                '<div class="srv-modal-content">' +
                '<div class="sw-title">Поточний сервер</div>' +
                '<div id="srv-current-val"></div>' +
                '<div class="sw-hr"></div>' +
                '<div class="sw-title">Оберіть сервер</div>' +
                '<div id="srv-list"></div>' +
                '<div id="srv-apply" class="selector">Змінити сервер</div>' +
                '</div></div>');

            var currentObj = servers.find(function(s) { return clean(s.url) === currentClean; });
            modal.find('#srv-current-val').text(currentObj ? currentObj.name : 'Інше джерело');

            // Список серверів
            servers.forEach(function(s) {
                if (clean(s.url) === currentClean) return;

                var item = $('<div class="srv-item selector" data-url="'+s.url+'">' +
                    '<div class="srv-left"><span class="srv-dot"></span><span class="srv-name">'+s.name+'</span></div>' +
                    '<span class="srv-status">Перевірка...</span>' +
                    '</div>');

                modal.find('#srv-list').append(item);

                // Перевірка доступності
                var xhr = new XMLHttpRequest();
                xhr.open('GET', s.url, true);
                xhr.timeout = 5000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        var isOnline = xhr.status > 0; // Навіть 403 означає що сервер живий
                        if (isOnline) {
                            item.addClass('is-online').find('.srv-status').text('Доступний');
                        } else {
                            item.addClass('is-offline').find('.srv-status').text('Недоступний');
                            item.removeClass('selector');
                        }
                    }
                };
                xhr.send();
            });

            // Керування вибором
            modal.find('.srv-item').on('click', function() {
                if ($(this).hasClass('is-offline')) return;
                modal.find('.srv-item').removeClass('active');
                $(this).addClass('active');
            });

            // Кнопка застосувати
            modal.find('#srv-apply').on('click', function() {
                var selected = modal.find('.srv-item.active').data('url');
                if (selected) {
                    Lampa.Storage.set('source', selected);
                    Lampa.Storage.save(true);
                    window.location.replace(selected);
                } else {
                    Lampa.Noty.show('Виберіть доступний сервер');
                }
            });

            // Закриття
            var close = function() {
                modal.remove();
                Lampa.Controller.toggle('content');
            };

            $('body').append(modal);

            // Реєстрація контролера для навігації пультом
            Lampa.Controller.add('srv_switcher', {
                toggle: function() {
                    Lampa.Controller.collection(modal[0]); // Якщо collection не працює, Lampa сама підхопить selector
                },
                back: close
            });
            Lampa.Controller.toggle('srv_switcher');
        }
    };

    // Стилі
    var style = `
        .srv-modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:9999; display:flex; align-items:center; justify-content:center; }
        .srv-modal-content { background:#141414; width:420px; padding:30px; border-radius:15px; border:1px solid #333; }
        .sw-title { color:#888; font-size:12px; text-transform:uppercase; margin-bottom:8px; }
        #srv-current-val { color:#fbd043; font-size:22px; font-weight:bold; margin-bottom:20px; }
        .sw-hr { height:1px; background:rgba(255,255,255,0.1); margin-bottom:20px; }
        
        #srv-list { max-height:300px; overflow-y:auto; margin-bottom:20px; padding-right:5px; }
        .srv-item { display:flex; justify-content:space-between; align-items:center; padding:15px; background:#222; border-radius:10px; margin-bottom:10px; border:2px solid transparent; }
        .srv-item.active { border-color:#fbd043; }
        .srv-item.focus { background:#333; }
        
        .srv-left { display:flex; align-items:center; }
        .srv-dot { width:10px; height:10px; border-radius:50%; background:#555; margin-right:15px; }
        .srv-name { font-size:18px; color:#fff; }
        .srv-status { font-size:13px; color:#666; }

        /* Статуси кольорів */
        .is-online .srv-dot { background:#4b6; box-shadow:0 0 8px #4b6; }
        .is-online .srv-name { color:#4b6; }
        .is-online .srv-status { color:#4b6; }
        
        .is-offline { opacity:0.4; }
        .is-offline .srv-dot { background:#f44; }
        .is-offline .srv-name { color:#f44; }

        #srv-apply { background:#fbd043; color:#000; padding:18px; text-align:center; border-radius:12px; font-weight:bold; text-transform:uppercase; cursor:pointer; }
        #srv-apply.focus { background:#d4ae2d; transform:scale(1.02); }
    `;

    $('head').append('<style>' + style + '</style>');

    // Кнопки
    function addButtons() {
        // В меню
        if (!$('.menu__item[data-srv]').length) {
            var m = $('<li class="menu__item selector" data-srv="true"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg></div><div class="menu__text">Сервер</div></li>');
            m.on('click', function() { Switcher.open(); });
            $('.menu .menu__list').append(m);
        }
        
        // В налаштування
        Lampa.Settings.listener.follow('open', function(e) {
            if (e.name === 'main') {
                setTimeout(function() {
                    if (!$('.settings-param[data-srv]').length) {
                        var s = $('<div class="settings-param selector" data-srv="true"><div class="settings-param__name">Змінити сервер</div><div class="settings-param__descr">Вибір джерела Lampa</div></div>');
                        s.on('click', function() { Switcher.open(); });
                        $('.settings__list').append(s);
                    }
                }, 200);
            }
        });
    }

    if (window.Lampa) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') addButtons();
        });
    }
})();

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
            // Визначаємо поточний сервер максимально надійно
            var currentStored = localStorage.getItem('source') || '';
            var currentHost = window.location.protocol + '//' + window.location.hostname;
            var currentUrl = currentStored || currentHost;
            
            var clean = function(u) { return u.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase(); };
            var currentClean = clean(currentUrl);

            // Створення вікна (Modal)
            var modal = $('<div id="srv-modal" class="srv-modal-overlay">' +
                '<div class="srv-modal-content">' +
                '<div id="srv-close-x" class="selector">✕</div>' +
                '<div class="sw-title">Поточний сервер</div>' +
                '<div id="srv-current-val"></div>' +
                '<div class="sw-hr"></div>' +
                '<div class="sw-title">Оберіть сервер</div>' +
                '<div id="srv-list"></div>' +
                '<div id="srv-apply" class="selector">Змінити сервер</div>' +
                '</div></div>');

            var currentObj = servers.find(function(s) { return clean(s.url) === currentClean; });
            modal.find('#srv-current-val').text(currentObj ? currentObj.name : 'Невідоме джерело');

            // Список (виключаємо поточний)
            servers.forEach(function(s) {
                if (clean(s.url) === currentClean) return;

                var item = $('<div class="srv-item selector" data-url="'+s.url+'">' +
                    '<div class="srv-left"><span class="srv-dot"></span><span class="srv-name">'+s.name+'</span></div>' +
                    '<span class="srv-status">Перевірка...</span>' +
                    '</div>');

                modal.find('#srv-list').append(item);

                // Перевірка
                var xhr = new XMLHttpRequest();
                xhr.open('GET', s.url, true);
                xhr.timeout = 5000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status > 0) {
                            item.addClass('is-online').find('.srv-status').text('Доступний');
                        } else {
                            item.addClass('is-offline').find('.srv-status').text('Недоступний');
                            item.removeClass('selector').css('pointer-events','none');
                        }
                    }
                };
                xhr.send();
            });

            // Закриття
            var close = function() {
                modal.remove();
                if (window.Lampa && Lampa.Controller) Lampa.Controller.toggle('content');
            };

            // Події
            modal.on('click', function(e) { if (e.target.id === 'srv-modal') close(); });
            modal.find('#srv-close-x').on('click', close);
            
            modal.find('.srv-item').on('click', function() {
                modal.find('.srv-item').removeClass('active');
                $(this).addClass('active');
            });

            modal.find('#srv-apply').on('click', function() {
                var selected = modal.find('.srv-item.active').data('url');
                if (selected) {
                    localStorage.setItem('source', selected);
                    // Використовуємо Lampa.Storage тільки якщо він існує, інакше просто редірект
                    if (window.Lampa && Lampa.Storage && Lampa.Storage.set) {
                        Lampa.Storage.set('source', selected);
                    }
                    window.location.href = selected;
                } else {
                    if (window.Lampa && Lampa.Noty) Lampa.Noty.show('Виберіть сервер');
                }
            });

            $('body').append(modal);

            // Фокус для пультів
            if (window.Lampa && Lampa.Controller) {
                Lampa.Controller.add('srv_switcher', {
                    toggle: function() { },
                    back: close
                });
                Lampa.Controller.toggle('srv_switcher');
            }
        }
    };

    var style = `
        .srv-modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:2000; display:flex; align-items:center; justify-content:center; }
        .srv-modal-content { background:#141414; width:420px; padding:30px; border-radius:15px; border:1px solid #333; position:relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        #srv-close-x { position:absolute; top:15px; right:15px; color:#666; font-size:20px; cursor:pointer; width:30px; height:30px; text-align:center; line-height:30px; }
        #srv-close-x.focus { color:#fff; background:rgba(255,255,255,0.1); border-radius:50%; }
        .sw-title { color:#888; font-size:12px; text-transform:uppercase; margin-bottom:8px; letter-spacing:1px; }
        #srv-current-val { color:#fbd043; font-size:22px; font-weight:bold; margin-bottom:20px; }
        .sw-hr { height:1px; background:rgba(255,255,255,0.1); margin-bottom:20px; }
        #srv-list { max-height:300px; overflow-y:auto; margin-bottom:20px; }
        .srv-item { display:flex; justify-content:space-between; align-items:center; padding:15px; background:#222; border-radius:10px; margin-bottom:10px; border:2px solid transparent; cursor:pointer; }
        .srv-item.active { border-color:#fbd043; background:rgba(251, 208, 67, 0.05); }
        .srv-item.focus { background:#333; border-color: rgba(255,255,255,0.2); }
        .srv-left { display:flex; align-items:center; }
        .srv-dot { width:10px; height:10px; border-radius:50%; background:#555; margin-right:15px; }
        .srv-name { font-size:18px; color:#fff; }
        .srv-status { font-size:13px; color:#666; }
        .is-online .srv-dot { background:#4b6; box-shadow:0 0 8px #4b6; }
        .is-online .srv-name { color:#4b6; }
        .is-online .srv-status { color:#4b6; }
        .is-offline { opacity:0.4; }
        .is-offline .srv-dot { background:#f44; }
        .is-offline .srv-name { color:#f44; }
        #srv-apply { background:#fbd043; color:#000; padding:18px; text-align:center; border-radius:12px; font-weight:bold; text-transform:uppercase; cursor:pointer; margin-top:10px; }
        #srv-apply.focus { background:#d4ae2d; transform:scale(1.02); }
    `;

    $('head').append('<style>' + style + '</style>');

    function addButtons() {
        // Кнопка в бічному меню
        if (!$('.menu__item[data-srv]').length) {
            var m = $('<li class="menu__item selector" data-srv="true"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg></div><div class="menu__text">Зміна сервера</div></li>');
            m.on('click', function() { Switcher.open(); });
            $('.menu .menu__list').append(m);
        }

        // Кнопка в налаштуваннях (через перевірку DOM)
        setInterval(function() {
            if ($('.settings__list').length && !$('.settings-param[data-srv]').length) {
                var s = $('<div class="settings-param selector" data-srv="true"><div class="settings-param__name">Зміна сервера</div><div class="settings-param__descr">Вибір джерела завантаження інтерфейсу Lampa</div></div>');
                s.on('click', function() { Switcher.open(); });
                $('.settings__list').append(s);
            }
        }, 500);
    }

    if (window.Lampa) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') addButtons();
        });
    } else {
        $(document).ready(addButtons);
    }
})();

(function () {
    'use strict';

    var servers = [
        { name: 'Lampa (MX)', url: 'http://lampa.mx' },
        { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
        { name: 'Lampa (NNMTV)', url: 'http://nnmtv.pw' },
        { name: 'Lampa (VIP)', url: 'http://lampa.vip' }
    ];

    function openSwitcher() {
        var currentSource = Lampa.Storage.get('source') || window.location.origin;
        var clean = function(u) { return u.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase(); };
        var currentClean = clean(currentSource);

        // Фільтруємо список (прибираємо той, на якому ми зараз)
        var availableServers = servers.filter(function(s) {
            return clean(s.url) !== currentClean;
        });

        var currentObj = servers.find(function(s) { return clean(s.url) === currentClean; });
        var currentName = currentObj ? currentObj.name : window.location.hostname;

        var html = $('<div class="server-switcher">' +
            '<div style="color:#888;font-size:0.8em;text-transform:uppercase;margin-bottom:5px;">Поточний сервер</div>' +
            '<div style="color:#fbd043;font-size:1.4em;font-weight:bold;margin-bottom:20px;">' + currentName + '</div>' +
            '<div style="height:1px;background:rgba(255,255,255,0.1);margin-bottom:20px;"></div>' +
            '<div class="sw-list"></div>' +
            '<div class="sw-apply selector" style="background:#fbd043;color:#000;padding:15px;text-align:center;border-radius:10px;font-weight:bold;text-transform:uppercase;margin-top:20px;cursor:pointer;">Змінити сервер</div>' +
        '</div>');

        availableServers.forEach(function(s) {
            var item = $('<div class="sw-item selector" style="display:flex;align-items:center;padding:12px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:8px;border:2px solid transparent;cursor:pointer;">' +
                '<div style="width:10px;height:10px;border-radius:50%;background:#4b6;margin-right:12px;box-shadow:0 0 8px #4b6;"></div>' +
                '<div style="font-size:1.1em;color:#fff;">' + s.name + '</div>' +
            '</div>');
            
            item.on('click', function() {
                html.find('.sw-item').css('border-color', 'transparent').removeClass('active-srv');
                $(this).css('border-color', '#fbd043').addClass('active-srv').data('url', s.url);
            });
            html.find('.sw-list').append(item);
        });

        html.find('.sw-apply').on('click', function() {
            var selectedUrl = html.find('.active-srv').data('url');
            if (selectedUrl) {
                Lampa.Storage.set('source', selectedUrl);
                Lampa.Noty.show('Перехід на ' + selectedUrl);
                
                setTimeout(function() {
                    // Спроба нативного редіректу для Android APK
                    if (Lampa.Platform && Lampa.Platform.run) {
                        Lampa.Platform.run('redirect', { url: selectedUrl });
                    }
                    window.location.href = selectedUrl;
                }, 500);
            } else {
                Lampa.Noty.show('Виберіть сервер зі списку');
            }
        });

        Lampa.Modal.open({
            title: 'Зміна сервера',
            html: html,
            size: 'medium',
            onBack: function() {
                Lampa.Modal.close();
                Lampa.Controller.toggle('content');
            }
        });
    }

    // Додавання кнопок
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
            // Бічне меню
            var menu_btn = $('<li class="menu__item selector"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg></div><div class="menu__text">Зміна сервера</div></li>');
            menu_btn.on('click', openSwitcher);
            $('.menu .menu__list').append(menu_btn);

            // Налаштування
            Lampa.Settings.listener.follow('open', function (s) {
                if (s.name == 'main') {
                    var set_btn = $('<div class="settings-param selector" data-type="button"><div class="settings-param__name">Зміна сервера</div><div class="settings-param__descr">Вибір джерела завантаження Lampa</div></div>');
                    set_btn.on('click', openSwitcher);
                    $('.settings__list').append(set_btn);
                }
            });
        }
    });

    // Стилі ховеру
    $('head').append('<style>.sw-item.focus{background:rgba(255,255,255,0.15)!important;}.sw-apply.focus{background:#d4ae2d!important;transform:scale(1.02);}</style>');

})();

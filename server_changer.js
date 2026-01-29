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
            var currentHost = window.location.hostname;
            var clean = function(u) { return u.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase(); };
            
            // Фільтруємо список: прибираємо поточний сервер
            var filteredServers = servers.filter(function(s) {
                return clean(s.url) !== clean(currentHost);
            });

            var currentObj = servers.find(function(s) { return clean(s.url) === clean(currentHost); });
            var currentName = currentObj ? currentObj.name : currentHost;

            var html = $(`
                <div class="server-switcher">
                    <div class="sw-label" style="color:#888; font-size:12px; text-transform:uppercase; margin-bottom:4px;">Поточний сервер</div>
                    <div class="sw-current" style="color:#fbd043; font-size:20px; font-weight:bold; margin-bottom:20px;">${currentName}</div>
                    <div style="height:1px; background:rgba(255,255,255,0.1); margin-bottom:20px;"></div>
                    <div class="sw-label" style="color:#888; font-size:12px; text-transform:uppercase; margin-bottom:10px;">Оберіть сервер для переходу</div>
                    <div class="sw-list"></div>
                    <div class="sw-footer" style="margin-top:20px;">
                        <div class="sw-apply selector" style="background:#fbd043; color:#000; padding:15px; text-align:center; border-radius:10px; font-weight:bold; text-transform:uppercase;">Змінити сервер</div>
                    </div>
                </div>
            `);

            filteredServers.forEach(function(s) {
                var item = $(`
                    <div class="sw-item selector" data-url="${s.url}" style="display:flex; align-items:center; padding:12px; background:rgba(255,255,255,0.05); border-radius:8px; margin-bottom:8px; border:2px solid transparent;">
                        <div class="sw-dot" style="width:10px; height:10px; border-radius:50%; background:#4b6; margin-right:12px; box-shadow:0 0 8px #4b6;"></div>
                        <div class="sw-name" style="font-size:16px; color:#fff;">${s.name}</div>
                    </div>
                `);
                html.find('.sw-list').append(item);
            });

            html.find('.sw-item').on('click', function() {
                html.find('.sw-item').css('border-color', 'transparent').removeClass('active');
                $(this).css('border-color', '#fbd043').addClass('active');
            });

            html.find('.sw-apply').on('click', function() {
                var selected = html.find('.sw-item.active').data('url');
                if (selected) {
                    Lampa.Storage.set('source', selected);
                    Lampa.Storage.save(true);
                    Lampa.Noty.show('Перемикання на ' + selected);
                    setTimeout(function() {
                        window.location.href = selected;
                    }, 500);
                } else {
                    Lampa.Noty.show('Спочатку виберіть сервер зі списку');
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
    };

    // Додавання кнопок (використовуємо нативні методи Lampa)
    function init() {
        // 1. Бічне меню
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready' && !$('.menu__item[data-srv]').length) {
                var menu_item = $('<li class="menu__item selector" data-srv="true"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg></div><div class="menu__text">Зміна сервера</div></li>');
                menu_item.on('click', Switcher.open);
                $('.menu .menu__list').append(menu_item);
            }
        });

        // 2. Налаштування (черей офіційний лісенер)
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name == 'main') {
                setTimeout(function() {
                    if (!$('.settings-param[data-srv]').length) {
                        var set_btn = $('<div class="settings-param selector" data-srv="true"><div class="settings-param__name">Зміна сервера</div><div class="settings-param__descr">Вибір джерела завантаження інтерфейсу Lampa</div></div>');
                        set_btn.on('click', Switcher.open);
                        $('.settings__list').append(set_btn);
                    }
                }, 100);
            }
        });
    }

    // Стилі фокусу (Ховер)
    $('head').append(`
        <style>
            .sw-item.focus { background: rgba(255,255,255,0.15) !important; transform: scale(1.02); }
            .sw-apply.focus { background: #e0b628 !important; transform: scale(1.02); box-shadow: 0 5px 15px rgba(224, 182, 40, 0.4); }
        </style>
    `);

    if (window.Lampa) init();
})();

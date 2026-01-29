(function () {
    'use strict';

    var servers = [
        { name: 'Lampa (MX)', url: 'http://lampa.mx' },
        { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
        { name: 'Lampa (NNMTV)', url: 'http://nnmtv.pw' },
        { name: 'Lampa (VIP)', url: 'http://lampa.vip' }
    ];

    function openSwitcher() {
        // Отримуємо поточне джерело з пам'яті Lampa
        var currentSource = Lampa.Storage.field('source') || window.location.origin;
        var clean = function(u) { return u.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase(); };
        var currentClean = clean(currentSource);

        var currentObj = servers.find(function(s) { return clean(s.url) === currentClean; });
        var currentName = currentObj ? currentObj.name : (window.location.hostname || 'Lampa');

        var html = $(`
            <div class="server-switcher" style="padding: 10px;">
                <div style="color: #888; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Поточний сервер</div>
                <div style="color: #fbd043; font-size: 20px; font-weight: bold; margin-bottom: 20px;">${currentName}</div>
                <div style="height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 20px;"></div>
                <div style="color: #888; font-size: 12px; text-transform: uppercase; margin-bottom: 12px;">Доступні для переходу</div>
                <div class="sw-list"></div>
                <div class="sw-footer" style="margin-top: 20px;">
                    <div class="sw-apply selector" style="background: #fbd043; color: #000; padding: 15px; text-align: center; border-radius: 12px; font-weight: bold; text-transform: uppercase;">Змінити сервер</div>
                </div>
            </div>
        `);

        // Додаємо тільки ті сервери, які НЕ є поточними
        servers.filter(function(s) { return clean(s.url) !== currentClean; }).forEach(function(s) {
            var item = $(`
                <div class="sw-item selector" data-url="${s.url}" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-bottom: 10px; border: 2px solid transparent;">
                    <div style="display: flex; align-items: center;">
                        <div class="sw-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #4b6; margin-right: 15px; box-shadow: 0 0 8px #4b6;"></div>
                        <div style="font-size: 18px; color: #fff;">${s.name}</div>
                    </div>
                    <div style="font-size: 12px; color: #4b6;">Доступний</div>
                </div>
            `);
            item.on('click', function() {
                html.find('.sw-item').css('border-color', 'transparent').removeClass('active');
                $(this).css('border-color', '#fbd043').addClass('active');
            });
            html.find('.sw-list').append(item);
        });

        html.find('.sw-apply').on('click', function() {
            var selected = html.find('.sw-item.active').data('url');
            if (selected) {
                // 1. Зберігаємо в Lampa Storage
                Lampa.Storage.set('source', selected);
                // 2. Зберігаємо в нативний LocalStorage
                localStorage.setItem('source', selected);
                
                Lampa.Noty.show('Збереження та перехід...');
                
                setTimeout(function() {
                    // 3. Спроба примусового редіректу через платформу (для Android)
                    if (Lampa.Platform && Lampa.Platform.run) {
                        Lampa.Platform.run('redirect', { url: selected });
                    }
                    // 4. Звичайний редірект
                    window.location.replace(selected);
                }, 800);
            } else {
                Lampa.Noty.show('Виберіть сервер');
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

    // Реєстрація кнопок (надійна через app:ready)
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
            // Кнопка в Меню
            var menu_btn = $('<li class="menu__item selector"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg></div><div class="menu__text">Зміна сервера</div></li>');
            menu_btn.on('click', openSwitcher);
            $('.menu .menu__list').append(menu_btn);

            // Кнопка в Налаштуваннях
            Lampa.Settings.listener.follow('open', function (s) {
                if (s.name == 'main') {
                    setTimeout(function() {
                        if (!$('.settings-param[data-switcher]').length) {
                            var set_btn = $('<div class="settings-param selector" data-switcher="true"><div class="settings-param__name">Зміна сервера</div><div class="settings-param__descr">Вибір джерела завантаження Lampa</div></div>');
                            set_btn.on('click', openSwitcher);
                            $('.settings__list').append(set_btn);
                        }
                    }, 50);
                }
            });
        }
    });

    // Ховер стилі
    $('head').append('<style>.sw-item.focus{background:rgba(255,255,255,0.15)!important; transform: scale(1.02);}.sw-apply.focus{background:#d4ae2d!important; box-shadow: 0 0 15px rgba(251,208,67,0.4)!important;}</style>');

})();

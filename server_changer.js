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
            var current = Lampa.Storage.get('source') || window.location.origin;
            var clean = function(u) { return u.replace(/^https?:\/\//, '').replace(/\/$/, ''); };
            var currentClean = clean(current);

            var modal = $('<div id="srv-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;">' +
                '<div style="background:#141414;width:400px;padding:25px;border-radius:15px;border:1px solid #333;position:relative;">' +
                '<div id="srv-close" class="selector" style="position:absolute;top:15px;right:15px;color:#fff;cursor:pointer;padding:5px;font-size:20px;">✕</div>' +
                '<div style="color:#888;font-size:12px;text-transform:uppercase;margin-bottom:5px;">Поточний сервер</div>' +
                '<div id="srv-current" style="color:#fff;font-size:20px;font-weight:bold;margin-bottom:20px;">' + (servers.find(s => clean(s.url) === currentClean)?.name || 'Невідомо') + '</div>' +
                '<div style="height:1px;background:#333;margin-bottom:20px;"></div>' +
                '<div id="srv-list" style="max-height:300px;overflow-y:auto;margin-bottom:20px;"></div>' +
                '<div id="srv-apply" class="selector" style="background:#fbd043;color:#000;padding:15px;text-align:center;border-radius:10px;font-weight:bold;cursor:pointer;text-transform:uppercase;">Змінити сервер</div>' +
                '</div></div>');

            // Наповнення списку
            servers.forEach(function(s) {
                if (clean(s.url) === currentClean) return;
                var item = $('<div class="srv-item selector" data-url="'+s.url+'" style="display:flex;justify-content:space-between;align-items:center;padding:15px;margin-bottom:8px;background:#222;border-radius:8px;cursor:pointer;">' +
                    '<span class="srv-name" style="font-size:16px;font-weight:bold;color:#ccc;">'+s.name+'</span>' +
                    '<span class="srv-status" style="font-size:12px;color:#666;">Перевірка...</span>' +
                    '</div>');
                
                modal.find('#srv-list').append(item);

                // Перевірка статусу
                var img = new Image();
                img.onload = function() { 
                    item.find('.srv-name').css('color', '#4b6'); 
                    item.find('.srv-status').text('Доступний').css('color', '#4b6');
                };
                img.onerror = function() { 
                    item.find('.srv-name').css('color', '#f44'); 
                    item.find('.srv-status').text('Недоступний').css('color', '#f44');
                    item.removeClass('selector').css('opacity','0.4');
                };
                img.src = s.url + '/favicon.ico?' + Math.random();
            });

            // Логіка кліків
            modal.find('.srv-item').on('click', function() {
                if ($(this).css('opacity') === '0.4') return;
                modal.find('.srv-item').css('border', 'none');
                $(this).css('border', '2px solid #fbd043');
                modal.find('.srv-item').removeClass('active-srv');
                $(this).addClass('active-srv');
            });

            modal.find('#srv-apply').on('click', function() {
                var selected = modal.find('.active-srv').data('url');
                if (selected) {
                    Lampa.Storage.set('source', selected);
                    localStorage.setItem('source', selected);
                    Lampa.Storage.save(true);
                    window.location.replace(selected);
                } else {
                    Lampa.Noty.show('Виберіть сервер');
                }
            });

            var closeSrv = function() { modal.remove(); Lampa.Controller.toggle('content'); };
            modal.find('#srv-close').on('click', closeSrv);

            $('body').append(modal);
            Lampa.Controller.add('srv_switcher', { toggle: function() { Lampa.Controller.collection(modal[0]); }, back: closeSrv });
            Lampa.Controller.toggle('srv_switcher');
        }
    };

    // Додавання стилів ховеру
    $('head').append('<style>' +
        '.selector.focus { background: rgba(255,255,255,0.1) !important; }' +
        '#srv-apply.focus { background: #d4ae2d !important; transform: scale(1.02); }' +
        '.srv-item.focus { background: #333 !important; }' +
    '</style>');

    // Примусове додавання кнопок
    var init = function() {
        // 1. Бічне меню
        if (!$('.menu__item[data-srv]').length) {
            var menu_btn = $('<li class="menu__item selector" data-srv="true"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg></div><div class="menu__text">Сервер</div></li>');
            menu_btn.on('click', Switcher.open);
            $('.menu .menu__list').append(menu_btn);
        }

        // 2. Налаштування (через таймер, щоб встигло провантажитись)
        Lampa.Settings.listener.follow('open', function(e) {
            if (e.name === 'main') {
                setTimeout(function() {
                    if (!$('.settings-param[data-srv]').length) {
                        var set_btn = $('<div class="settings-param selector" data-srv="true"><div class="settings-param__name">Змінити сервер</div><div class="settings-param__descr">Вибір джерела Lampa</div></div>');
                        set_btn.on('click', Switcher.open);
                        $('.settings__list').append(set_btn);
                    }
                }, 100);
            }
        });
    };

    // Запуск
    if (window.Lampa) {
        Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') init(); });
    }
})();

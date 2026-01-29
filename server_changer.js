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
            var currentHost = window.location.hostname.toLowerCase();
            var clean = function(u) { return u.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase(); };
            
            // Створюємо оболонку
            var overlay = $('<div id="custom-srv-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;"></div>');
            
            var modal = $('<div style="background:#141414;width:420px;padding:30px;border-radius:20px;border:1px solid #333;box-sizing:border-box;position:relative;">' +
                '<div style="color:#888;font-size:12px;text-transform:uppercase;margin-bottom:8px;">Поточний сервер</div>' +
                '<div id="cur-srv-name" style="color:#fbd043;font-size:22px;font-weight:bold;margin-bottom:20px;"></div>' +
                '<div style="height:1px;background:rgba(255,255,255,0.1);margin-bottom:20px;"></div>' +
                '<div style="color:#888;font-size:12px;text-transform:uppercase;margin-bottom:12px;">Оберіть новий сервер</div>' +
                '<div id="srv-list-container" style="max-height:300px;overflow-y:auto;margin-bottom:20px;"></div>' +
                '<div id="srv-apply-btn" class="selector" style="background:#fbd043;color:#000;padding:18px;text-align:center;border-radius:12px;font-weight:bold;text-transform:uppercase;cursor:pointer;">Змінити сервер</div>' +
                '</div>');

            // Визначаємо поточний
            var currentObj = servers.find(function(s) { return clean(s.url).indexOf(currentHost) !== -1; });
            modal.find('#cur-srv-name').text(currentObj ? currentObj.name : window.location.hostname);

            // Рендеримо список (крім поточного)
            servers.forEach(function(s) {
                if (clean(s.url).indexOf(currentHost) !== -1) return;

                var item = $('<div class="srv-opt selector" data-url="'+s.url+'" style="display:flex;align-items:center;padding:15px;background:#222;border-radius:12px;margin-bottom:10px;cursor:pointer;border:2px solid transparent;">' +
                    '<div style="width:10px;height:10px;border-radius:50%;background:#4b6;margin-right:15px;box-shadow:0 0 8px #4b6;"></div>' +
                    '<div style="font-size:18px;color:#fff;">'+s.name+'</div>' +
                    '</div>');
                
                item.on('click', function() {
                    modal.find('.srv-opt').css('border-color', 'transparent').removeClass('active-opt');
                    $(this).css('border-color', '#fbd043').addClass('active-opt');
                });

                modal.find('#srv-list-container').append(item);
            });

            // Кнопка застосувати
            modal.find('#srv-apply-btn').on('click', function() {
                var selected = modal.find('.active-opt').data('url');
                if (selected) {
                    localStorage.setItem('source', selected);
                    if (window.Lampa && Lampa.Storage) Lampa.Storage.set('source', selected);
                    window.location.href = selected;
                }
            });

            // Закриття
            var close = function() { overlay.remove(); };
            overlay.on('click', function(e) { if(e.target.id === 'custom-srv-overlay') close(); });
            $(window).on('keydown.srv', function(e) { if(e.keyCode === 27 || e.keyCode === 8) { e.preventDefault(); close(); $(window).off('keydown.srv'); } });

            overlay.append(modal);
            $('body').append(overlay);
            
            // Фокус Lampa
            if(window.Lampa && Lampa.Controller) {
                Lampa.Controller.add('srv_ctrl', { toggle: function(){}, back: close });
                Lampa.Controller.toggle('srv_ctrl');
            }
        }
    };

    // Додавання кнопок
    function addButtons() {
        // Бічне меню
        if ($('.menu .menu__list').length && !$('.menu__item[data-srv]').length) {
            var m = $('<li class="menu__item selector" data-srv="true"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg></div><div class="menu__text">Зміна сервера</div></li>');
            m.on('click', Switcher.open);
            $('.menu .menu__list').append(m);
        }
        // Налаштування
        if ($('.settings__list').length && !$('.settings-param[data-srv]').length) {
            var s = $('<div class="settings-param selector" data-srv="true"><div class="settings-param__name">Зміна сервера</div><div class="settings-param__descr">Вибір джерела Lampa</div></div>');
            s.on('click', Switcher.open);
            $('.settings__list').append(s);
        }
    }

    // Ховер ефекти
    $('head').append('<style>' +
        '.srv-opt.focus { background: #333 !important; }' +
        '#srv-apply-btn.focus { background: #d4ae2d !important; transform: scale(1.02); }' +
        '.menu__item.focus, .settings-param.focus { background: rgba(255,255,255,0.1) !important; }' +
    '</style>');

    setInterval(addButtons, 1000);
})();

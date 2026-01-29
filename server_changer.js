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
            var clean = function(u) { return u.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase(); };
            var currentClean = clean(window.location.origin);

            var modal = $('<div id="srv-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;">' +
                '<div style="background:#141414;width:420px;padding:30px;border-radius:15px;border:1px solid #333;position:relative;box-sizing:border-box;">' +
                '<div id="srv-close-x" class="selector" style="position:absolute;top:15px;right:15px;color:#666;font-size:20px;cursor:pointer;width:30px;height:30px;text-align:center;line-height:30px;">✕</div>' +
                '<div style="color:#888;font-size:12px;text-transform:uppercase;margin-bottom:8px;letter-spacing:1px;">Поточний сервер</div>' +
                '<div id="srv-current-val" style="color:#fbd043;font-size:22px;font-weight:bold;margin-bottom:20px;"></div>' +
                '<div style="height:1px;background:rgba(255,255,255,0.1);margin-bottom:20px;"></div>' +
                '<div style="color:#888;font-size:12px;text-transform:uppercase;margin-bottom:8px;letter-spacing:1px;">Оберіть сервер</div>' +
                '<div id="srv-list" style="max-height:300px;overflow-y:auto;margin-bottom:20px;"></div>' +
                '<div id="srv-apply" class="selector" style="background:#fbd043;color:#000;padding:18px;text-align:center;border-radius:12px;font-weight:bold;text-transform:uppercase;cursor:pointer;">Змінити сервер</div>' +
                '</div></div>');

            var currentObj = servers.find(function(s) { return clean(s.url) === currentClean; });
            modal.find('#srv-current-val').text(currentObj ? currentObj.name : window.location.hostname);

            servers.forEach(function(s) {
                if (clean(s.url) === currentClean) return;

                var item = $('<div class="srv-item selector" data-url="'+s.url+'" style="display:flex;justify-content:space-between;align-items:center;padding:15px;background:#222;border-radius:10px;margin-bottom:10px;border:2px solid transparent;cursor:pointer;">' +
                    '<div style="display:flex;align-items:center;">' +
                    '<span class="srv-dot" style="width:10px;height:10px;border-radius:50%;background:#555;margin-right:15px;"></span>' +
                    '<span class="srv-name" style="font-size:18px;color:#fff;">'+s.name+'</span>' +
                    '</div>' +
                    '<span class="srv-status" style="font-size:13px;color:#666;">Перевірка...</span>' +
                    '</div>');

                modal.find('#srv-list').append(item);

                // Перевірка (favicon метод - найнадійніший для ТБ)
                var img = new Image();
                img.onload = function() {
                    item.find('.srv-dot').css({'background':'#4b6','box-shadow':'0 0 8px #4b6'});
                    item.find('.srv-name, .srv-status').css('color','#4b6').text(function(i,t){return t==='Перевірка...'?'Доступний':t});
                };
                img.onerror = function() {
                    item.find('.srv-dot').css('background','#f44');
                    item.find('.srv-name').css('color','#f44');
                    item.find('.srv-status').css('color','#f44').text('Недоступний');
                    item.removeClass('selector').css('opacity','0.4');
                };
                img.src = s.url + '/favicon.ico?' + Math.random();
            });

            var close = function() { modal.remove(); Lampa.Controller.toggle('content'); };
            modal.on('click', function(e) { if (e.target.id === 'srv-modal') close(); });
            modal.find('#srv-close-x').on('click', close);
            
            modal.find('.srv-item').on('click', function() {
                if ($(this).css('opacity') === '0.4') return;
                modal.find('.srv-item').css('border-color', 'transparent').removeClass('active');
                $(this).css('border-color', '#fbd043').addClass('active');
            });

            modal.find('#srv-apply').on('click', function() {
                var selected = modal.find('.active').data('url');
                if (selected) {
                    localStorage.setItem('source', selected);
                    Lampa.Storage.set('source', selected);
                    Lampa.Noty.show('Перехід на ' + selected);
                    setTimeout(function() {
                        window.location.replace(selected);
                        window.location.href = selected;
                    }, 500);
                }
            });

            $('body').append(modal);
            Lampa.Controller.add('srv_switcher', { toggle: function() {}, back: close });
            Lampa.Controller.toggle('srv_switcher');
        }
    };

    // Стилі фокусу (для всіх пристроїв)
    $('head').append('<style>' +
        '.srv-item.focus { background:#333 !important; }' +
        '#srv-apply.focus { background:#d4ae2d !important; transform:scale(1.02); }' +
        '#srv-close-x.focus { color:#fff !important; }' +
    '</style>');

    function init() {
        // 1. Бічне меню
        if (!$('.menu__item[data-srv]').length) {
            var m = $('<li class="menu__item selector" data-srv="true"><div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg></div><div class="menu__text">Зміна сервера</div></li>');
            m.on('click', Switcher.open);
            $('.menu .menu__list').append(m);
        }

        // 2. Налаштування (через таймер для смарт ТБ)
        setInterval(function() {
            if ($('.settings__list').length && !$('.settings-param[data-srv]').length) {
                var s = $('<div class="settings-param selector" data-srv="true"><div class="settings-param__name">Зміна сервера</div><div class="settings-param__descr">Вибір джерела завантаження Lampa</div></div>');
                s.on('click', Switcher.open);
                $('.settings__list').append(s);
            }
        }, 1000);
    }

    if (window.Lampa) {
        Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') init(); });
    }
})();

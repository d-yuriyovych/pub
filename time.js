(function () {
    'use strict';

    function ClockPlugin() {
        var _this = this;

        this.initClock = function() {
            if ($('#lampa-custom-clock').length) return;
            $('body').append('<div id="lampa-custom-clock" style="position: fixed; z-index: 999999; color: #fff; font-family: sans-serif; font-weight: bold; pointer-events: none; text-shadow: 2px 2px 4px #000; font-size: 2.2rem; display: none;">00:00</div>');
        };

        this.update = function() {
            var date = new Date();
            var show_sec = Lampa.Storage.get('clock_seconds', 'true') === 'true';
            var time = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + (show_sec ? ':' + date.getSeconds().toString().padStart(2, '0') : '');
            $('#lampa-custom-clock').text(time);
            
            var pos = Lampa.Storage.get('clock_position', 'top_right');
            var css = {top: 'auto', bottom: 'auto', left: 'auto', right: 'auto'};
            if (pos === 'top_right') { css.top = '30px'; css.right = '40px'; }
            else if (pos === 'top_left') { css.top = '30px'; css.left = '40px'; }
            else if (pos === 'bottom_right') { css.bottom = '40px'; css.right = '40px'; }
            else if (pos === 'bottom_left') { css.bottom = '40px'; css.left = '40px'; }
            $('#lampa-custom-clock').css(css);

            var is_player = $('.player').length > 0 || $('.pjs-video-container').length > 0 || window.location.hash.indexOf('player') > -1;
            $('#lampa-custom-clock').toggle(is_player);
        };
    }

    var plugin = new ClockPlugin();

    function init() {
        var api = Lampa.SettingsApi || Lampa.Settings;
        if (!api) return;

        // 1. Реєструємо іконку в меню
        api.addComponent({
            component: 'clock_cfg',
            name: 'Годинник у плеєрі',
            icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="white"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none"/><polyline points="12 6 12 12 16 14" stroke="white" stroke-width="2" fill="none"/></svg>'
        });

        // 2. Додаємо пункти через API
        api.add({
            title: 'Відображати секунди',
            component: 'clock_cfg',
            name: 'clock_seconds',
            type: 'select',
            values: {'true': 'Так', 'false': 'Ні'},
            default: 'true'
        });

        api.add({
            title: 'Розташування',
            component: 'clock_cfg',
            name: 'clock_position',
            type: 'select',
            values: {
                'top_right': 'Зверху справа',
                'top_left': 'Зверху зліва',
                'bottom_right': 'Знизу справа',
                'bottom_left': 'Знизу зліва'
            },
            default: 'top_right'
        });

        // 3. ФІКС ПОРОЖНЕЧІ: Перехоплюємо подію рендеру і змушуємо Лампу вивести список
        Lampa.Listener.follow('settings', function (e) {
            if (e.type == 'render' && e.name == 'clock_cfg') {
                var body = e.body || $('.settings__content .settings__list');
                // Викликаємо вбудований метод Лампи для малювання списку налаштувань за назвою компонента
                if (Lampa.Settings.main) {
                    body.html(Lampa.Settings.main().render('clock_cfg'));
                    Lampa.Controller.enable('settings');
                }
            }
        });

        plugin.initClock();
        setInterval(plugin.update, 1000);
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') init(); });
})();

(function () {
    'use strict';

    function ClockPlugin() {
        var _this = this;

        // Ініціалізація самого годинника в плеєрі
        this.initClock = function() {
            if ($('#lampa-custom-clock').length) return;
            $('body').append('<div id="lampa-custom-clock" style="position: fixed; z-index: 999999; color: #fff; font-family: sans-serif; font-weight: bold; pointer-events: none; text-shadow: 2px 2px 4px #000; font-size: 2.2rem; display: none;">00:00</div>');
        };

        // Функція оновлення (бере дані прямо з Storage, куди їх покладе Settings API)
        this.update = function() {
            var date = new Date();
            var h = date.getHours().toString().padStart(2, '0');
            var m = date.getMinutes().toString().padStart(2, '0');
            var s = date.getSeconds().toString().padStart(2, '0');
            
            var show_sec = Lampa.Storage.get('clock_seconds', 'true');
            $('#lampa-custom-clock').text(h + ':' + m + (show_sec === 'true' ? ':' + s : ''));
            
            var pos = Lampa.Storage.get('clock_position', 'top_right');
            var css = {top: 'auto', bottom: 'auto', left: 'auto', right: 'auto'};
            if (pos === 'top_right') { css.top = '30px'; css.right = '40px'; }
            else if (pos === 'top_left') { css.top = '30px'; css.left = '40px'; }
            else if (pos === 'bottom_right') { css.bottom = '40px'; css.right = '40px'; }
            else if (pos === 'bottom_left') { css.bottom = '40px'; css.left = '40px'; }
            $('#lampa-custom-clock').css(css);

            var is_player = $('.player').length > 0 || $('.pjs-video-container').length > 0 || window.location.hash.indexOf('player') > -1;
            if (is_player) $('#lampa-custom-clock').show();
            else $('#lampa-custom-clock').hide();
        };

        this.init = function() {
            // 1. Додаємо головний пункт у список налаштувань
            Lampa.Settings.addComponent({
                component: 'clock_cfg',
                name: 'Годинник у плеєрі',
                icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="white"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none"/><polyline points="12 6 12 12 16 14" stroke="white" stroke-width="2" fill="none"/></svg>'
            });

            // 2. Додаємо параметри через Settings.add (це створить підменю автоматично)
            Lampa.Settings.add({
                title: 'Відображати секунди',
                component: 'clock_cfg', // Має збігатися з component вище
                name: 'clock_seconds',  // Ключ у Lampa.Storage
                type: 'select',
                values: {
                    'true': 'Так',
                    'false': 'Ні'
                },
                default: 'true'
            });

            Lampa.Settings.add({
                title: 'Розташування годинника',
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

            _this.initClock();
            setInterval(_this.update, 1000);
        };
    }

    var plugin = new ClockPlugin();

    // Запуск через перевірку готовності Lampa
    if (window.appready) plugin.init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') plugin.init(); });
})();

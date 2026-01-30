(function () {
    'use strict';

    function ClockPlugin() {
        var _this = this;

        // 1. Створення елемента годинника
        this.initClock = function() {
            if ($('#lampa-custom-clock').length) return;
            $('body').append('<div id="lampa-custom-clock" style="position: fixed; z-index: 999999; color: #fff; font-family: sans-serif; font-weight: bold; pointer-events: none; text-shadow: 2px 2px 4px #000; font-size: 2.2rem; display: none;">00:00</div>');
        };

        // 2. Оновлення часу та перевірка плеєра
        this.update = function() {
            var date = new Date();
            var h = date.getHours().toString().padStart(2, '0');
            var m = date.getMinutes().toString().padStart(2, '0');
            var s = date.getSeconds().toString().padStart(2, '0');
            
            var show_sec = Lampa.Storage.get('clock_seconds', 'true') === 'true';
            $('#lampa-custom-clock').text(h + ':' + m + (show_sec ? ':' + s : ''));
            
            // Позиція
            var pos = Lampa.Storage.get('clock_position', 'top_right');
            var css = {top: 'auto', bottom: 'auto', left: 'auto', right: 'auto'};
            if (pos === 'top_right') { css.top = '30px'; css.right = '40px'; }
            else if (pos === 'top_left') { css.top = '30px'; css.left = '40px'; }
            else if (pos === 'bottom_right') { css.bottom = '40px'; css.right = '40px'; }
            else if (pos === 'bottom_left') { css.bottom = '40px'; css.left = '40px'; }
            $('#lampa-custom-clock').css(css);

            // Видимість
            var is_player = $('.player').length > 0 || $('.pjs-video-container').length > 0 || window.location.hash.indexOf('player') > -1;
            if (is_player) $('#lampa-custom-clock').show();
            else $('#lampa-custom-clock').hide();
        };

        // 3. Додавання розділу в налаштування (стандартне меню Лампи)
        this.initSettings = function() {
            // Додаємо іконку та назву розділу
            Lampa.Settings.addComponent({
                component: 'clock_cfg',
                name: 'Годинник у плеєрі',
                icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="white"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>'
            });

            // Наповнюємо розділ пунктами (вони з'являться в правій панелі при кліку)
            Lampa.Settings.add({
                title: 'Відображати секунди',
                component: 'clock_cfg',
                name: 'clock_seconds',
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
        };
    }

    var plugin = new ClockPlugin();

    if (window.Lampa) {
        plugin.initClock();
        plugin.initSettings();
        setInterval(plugin.update, 1000);
    }
})();

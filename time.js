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
            var h = date.getHours().toString().padStart(2, '0');
            var m = date.getMinutes().toString().padStart(2, '0');
            var s = date.getSeconds().toString().padStart(2, '0');
            
            var show_sec = Lampa.Storage.get('clock_seconds', 'true') === 'true';
            $('#lampa-custom-clock').text(h + ':' + m + (show_sec ? ':' + s : ''));
            
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

        // Функція для побудови пунктів всередині порожньої панелі
        this.renderItems = function(container) {
            container.empty();
            var items = [
                { title: 'Секунди', name: 'clock_seconds', value: Lampa.Storage.get('clock_seconds', 'true') === 'true' ? 'Так' : 'Ні' },
                { title: 'Позиція', name: 'clock_position', value: Lampa.Storage.get('clock_position', 'top_right') }
            ];

            items.forEach(function(item) {
                var row = $(`
                    <div class="settings__item selector">
                        <div class="settings__item-name">${item.title}</div>
                        <div class="settings__item-value" style="color: #ffd948;">${item.value}</div>
                    </div>
                `);

                row.on('hover:enter click', function() {
                    if (item.name === 'clock_seconds') {
                        var cur = Lampa.Storage.get('clock_seconds', 'true');
                        Lampa.Storage.set('clock_seconds', cur === 'true' ? 'false' : 'true');
                    } else {
                        var p = ['top_right', 'top_left', 'bottom_right', 'bottom_left'];
                        var curP = Lampa.Storage.get('clock_position', 'top_right');
                        Lampa.Storage.set('clock_position', p[(p.indexOf(curP) + 1) % p.length]);
                    }
                    Lampa.Noty.show('Оновлено');
                    _this.renderItems(container); // Перемальовуємо вміст панелі
                });
                container.append(row);
            });
            
            Lampa.Controller.enable('settings'); // Повертаємо керування пультом
        };
    }

    var plugin = new ClockPlugin();

    function init() {
        var Settings = Lampa.SettingsApi || Lampa.Settings;
        if (Settings && Settings.addComponent) {
            Settings.addComponent({
                component: 'clock_cfg',
                name: 'Годинник у плеєрі',
                icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="white"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none"/><polyline points="12 6 12 12 16 14" stroke="white" stroke-width="2" fill="none"/></svg>'
            });

            // Слухаємо рендер. Коли відкривається наша "порожня" панель, ми її наповнюємо.
            Lampa.Listener.follow('settings', function (e) {
                if (e.type == 'render') {
                    // Якщо це рендер самого списку налаштувань — нічого не робимо, даємо кнопці бути.
                }
                
                // Коли Лампа відкрила нашу порожню панель компонента (те, що ти бачиш на скріні)
                if (e.name == 'clock_cfg' && e.type == 'render') {
                    setTimeout(function() {
                        var panel = $('.settings__content .settings__list');
                        if (panel.length) {
                            plugin.renderItems(panel);
                        }
                    }, 10);
                }
            });
        }

        plugin.initClock();
        setInterval(plugin.update, 1000);
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') init(); });
})();

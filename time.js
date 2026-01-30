(function () {
    'use strict';

    function ClockPlugin() {
        var _this = this;

        // Отримуємо збережені налаштування
        this.params = {
            seconds: Lampa.Storage.get('clock_plugin_seconds', 'true'),
            position: Lampa.Storage.get('clock_plugin_position', 'top_right')
        };

        // Створення годинника
        this.initClock = function() {
            if ($('#lampa-custom-clock').length) return;
            $('body').append('<div id="lampa-custom-clock" style="position: fixed; z-index: 999999; color: #fff; font-family: sans-serif; font-weight: bold; pointer-events: none; text-shadow: 2px 2px 4px #000; font-size: 2.2rem; display: none;">00:00</div>');
        };

        this.update = function() {
            var date = new Date();
            var h = date.getHours().toString().padStart(2, '0');
            var m = date.getMinutes().toString().padStart(2, '0');
            var s = date.getSeconds().toString().padStart(2, '0');
            
            var timeStr = h + ':' + m + (_this.params.seconds === 'true' ? ':' + s : '');
            $('#lampa-custom-clock').text(timeStr);
            
            // Відображення тільки в плеєрі
            var is_player = $('.player').length > 0 || $('.pjs-video-container').length > 0 || window.location.hash.indexOf('player') > -1;
            if (is_player) $('#lampa-custom-clock').show();
            else $('#lampa-custom-clock').hide();
        };

        this.applyPosition = function() {
            var pos = _this.params.position;
            var css = {top: 'auto', bottom: 'auto', left: 'auto', right: 'auto'};
            if (pos === 'top_right') { css.top = '30px'; css.right = '40px'; }
            else if (pos === 'top_left') { css.top = '30px'; css.left = '40px'; }
            else if (pos === 'bottom_right') { css.bottom = '40px'; css.right = '40px'; }
            else if (pos === 'bottom_left') { css.bottom = '40px'; css.left = '40px'; }
            $('#lampa-custom-clock').css(css);
        };

        this.openSettings = function() {
            Lampa.Select.show({
                title: 'Налаштування годинника',
                items: [
                    { title: 'Секунди', subtitle: _this.params.seconds === 'true' ? 'Так' : 'Ні', value: 'seconds' },
                    { title: 'Розташування', subtitle: _this.params.position, value: 'position' }
                ],
                onSelect: function(item) {
                    if (item.value === 'seconds') {
                        _this.params.seconds = _this.params.seconds === 'true' ? 'false' : 'true';
                        Lampa.Storage.set('clock_plugin_seconds', _this.params.seconds);
                    } else {
                        var p = ['top_right', 'top_left', 'bottom_right', 'bottom_left'];
                        _this.params.position = p[(p.indexOf(_this.params.position) + 1) % p.length];
                        Lampa.Storage.set('clock_plugin_position', _this.params.position);
                        _this.applyPosition();
                    }
                    Lampa.Noty.show('Оновлено');
                    _this.openSettings(); // Перевідкриваємо для оновлення тексту
                },
                onBack: function() {
                    Lampa.Controller.toggle('settings');
                }
            });
        };
    }

    var plugin = new ClockPlugin();

    function init() {
        // Реєструємо компонент у налаштуваннях
        var Settings = Lampa.SettingsApi || Lampa.Settings;
        if (Settings && Settings.addComponent) {
            Settings.addComponent({
                component: 'clock_cfg',
                name: 'Годинник у плеєрі',
                icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="white"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>'
            });

            // Перехоплюємо рендер налаштувань для заміни події кліку
            Lampa.Listener.follow('settings', function (e) {
                if (e.type == 'render') {
                    setTimeout(function() {
                        var item = $('.settings__item[data-component="clock_cfg"]');
                        if (item.length) {
                            var newItem = item.clone();
                            item.replaceWith(newItem);
                            newItem.on('hover:enter click', function () { plugin.openSettings(); });
                        }
                    }, 200);
                }
            });
        }

        plugin.initClock();
        plugin.applyPosition();
        setInterval(plugin.update, 1000);
    }

    if (window.Lampa) init();
})();

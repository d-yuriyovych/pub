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

        this.openMenu = function() {
            Lampa.Select.show({
                title: 'Налаштування годинника',
                items: [
                    {
                        title: 'Секунди',
                        subtitle: Lampa.Storage.get('clock_seconds', 'true') === 'true' ? 'Так' : 'Ні',
                        type: 'seconds'
                    },
                    {
                        title: 'Позиція',
                        subtitle: Lampa.Storage.get('clock_position', 'top_right'),
                        type: 'position'
                    }
                ],
                onSelect: function(item) {
                    if (item.type === 'seconds') {
                        var cur = Lampa.Storage.get('clock_seconds', 'true');
                        Lampa.Storage.set('clock_seconds', cur === 'true' ? 'false' : 'true');
                    } else {
                        var p = ['top_right', 'top_left', 'bottom_right', 'bottom_left'];
                        var curP = Lampa.Storage.get('clock_position', 'top_right');
                        var next = p[(p.indexOf(curP) + 1) % p.length];
                        Lampa.Storage.set('clock_position', next);
                    }
                    Lampa.Noty.show('Збережено');
                    _this.openMenu(); 
                },
                onBack: function() {
                    Lampa.Controller.toggle('settings');
                }
            });
        };
    }

    var plugin = new ClockPlugin();

    function injectButton() {
        // Шукаємо контейнер налаштувань
        var settings_list = $('.settings__content .settings__list, .settings-list');
        
        if (settings_list.length && !$('.data-clock-btn').length) {
            var btn = $(`
                <div class="settings__item selector data-clock-btn">
                    <div class="settings__item-ico">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div class="settings__item-name">Годинник у плеєрі</div>
                </div>
            `);

            btn.on('hover:enter click', function (e) {
                e.preventDefault();
                plugin.openMenu();
            });

            // Додаємо в кінець списку
            settings_list.append(btn);
            
            // Оновлюємо контролер, щоб кнопка стала активною для пульту
            if(window.Lampa.Controller) Lampa.Controller.enable('settings');
        }
    }

    function init() {
        plugin.initClock();
        setInterval(plugin.update, 1000);

        // Постійно перевіряємо, чи відкриті налаштування, щоб вставити кнопку
        setInterval(injectButton, 500);
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();

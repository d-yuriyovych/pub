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
            $('#lampa-custom-clock').toggle(is_player);
        };

        this.openSettings = function() {
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
                    _this.openSettings(); 
                },
                onBack: function() {
                    Lampa.Controller.toggle('settings');
                }
            });
        };
    }

    var plugin = new ClockPlugin();

    function init() {
        // ВИКЛЮЧНО SettingsApi, як ти і казав
        if (typeof Lampa.SettingsApi !== 'undefined' && Lampa.SettingsApi.addComponent) {
            Lampa.SettingsApi.addComponent({
                component: 'clock_cfg',
                name: 'Годинник у плеєрі',
                icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="white"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none"/><polyline points="12 6 12 12 16 14" stroke="white" stroke-width="2" fill="none"/></svg>'
            });

            Lampa.Listener.follow('settings', function (e) {
                if (e.type == 'render') {
                    setTimeout(function() {
                        var item = $('.settings__item[data-component="clock_cfg"]');
                        if (item.length) {
                            // Клонуємо, щоб вимкнути стандартну порожню панель
                            var newItem = item.clone();
                            item.replaceWith(newItem);
                            newItem.on('click hover:enter', function () { 
                                plugin.openSettings(); 
                            });
                        }
                    }, 200);
                }
            });
        }

        plugin.initClock();
        setInterval(plugin.update, 1000);
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') init(); });
})();

(function () {
    'use strict';

    function ClockPlugin(object) {
        var _this = this;
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var items = [];
        var html = $('<div></div>');

        // Це те, що малює вміст правої панелі
        this.create = function () {
            var _this = this;
            var settings = [
                {
                    title: 'Відображати секунди',
                    param: 'clock_seconds',
                    subtitle: Lampa.Storage.get('clock_seconds', 'true') === 'true' ? 'Так' : 'Ні'
                },
                {
                    title: 'Розташування',
                    param: 'clock_position',
                    subtitle: Lampa.Storage.get('clock_position', 'top_right')
                }
            ];

            settings.forEach(function (list) {
                var item = Lampa.Template.get('settings_item', list);
                
                item.on('hover:enter', function () {
                    if (list.param === 'clock_seconds') {
                        var cur = Lampa.Storage.get('clock_seconds', 'true');
                        Lampa.Storage.set('clock_seconds', cur === 'true' ? 'false' : 'true');
                    } else {
                        var p = ['top_right', 'top_left', 'bottom_right', 'bottom_left'];
                        var curP = Lampa.Storage.get('clock_position', 'top_right');
                        Lampa.Storage.set('clock_position', p[(p.indexOf(curP) + 1) % p.length]);
                    }
                    Lampa.Noty.show('Збережено');
                    // Оновлюємо панель, щоб змінився текст subtitle
                    Lampa.Controller.render();
                });

                html.append(item);
                items.push(item);
            });

            scroll.append(html);
        };

        this.render = function () {
            return scroll.render();
        };

        this.pause = function () {};
        this.stop = function () {};
        this.destroy = function () {
            scroll.destroy();
            html.remove();
            items = [];
        };
    }

    // Логіка самого годинника (те, що ти бачиш у плеєрі)
    function initLogic() {
        if (!$('#lampa-custom-clock').length) {
            $('body').append('<div id="lampa-custom-clock" style="position: fixed; z-index: 999999; color: #fff; font-family: sans-serif; font-weight: bold; pointer-events: none; text-shadow: 2px 2px 4px #000; font-size: 2.2rem; display: none;">00:00</div>');
        }

        setInterval(function() {
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
        }, 1000);
    }

    function start() {
        // Реєструємо компонент — це ПРИБИРАЄ порожнечу
        Lampa.Component.add('clock_cfg', ClockPlugin);

        // Додаємо кнопку в налаштування
        Lampa.SettingsApi.addComponent({
            component: 'clock_cfg',
            name: 'Годинник у плеєрі',
            icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="white"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none"/><polyline points="12 6 12 12 16 14" stroke="white" stroke-width="2" fill="none"/></svg>'
        });

        initLogic();
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') start(); });
})();

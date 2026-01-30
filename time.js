(function () {
    'use strict';

    function ClockPlugin() {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask:true,over:true});
        
        // Додаємо годинник у DOM
        var clock_html = $('<div class="lampa-custom-clock" style="position: fixed; z-index: 9999; color: #fff; font-family: sans-serif; pointer-events: none; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">00:00</div>');
        $('body').append(clock_html);

        // Оновлення часу
        setInterval(function () {
            var date = new Date();
            var h = date.getHours().toString().padStart(2, '0');
            var m = date.getMinutes().toString().padStart(2, '0');
            var s = date.getSeconds().toString().padStart(2, '0');
            
            var show_sec = Lampa.Storage.get('clock_seconds', 'true');
            clock_html.text(h + ':' + m + (show_sec === 'true' ? ':' + s : ''));
        }, 1000);

        // Функція застосування позиції
        function applyPosition() {
            var pos = Lampa.Storage.get('clock_position', 'top_right');
            var css = {top: 'auto', bottom: 'auto', left: 'auto', right: 'auto', fontSize: '2rem'};
            
            if (pos === 'top_right') { css.top = '20px'; css.right = '30px'; }
            if (pos === 'top_left') { css.top = '20px'; css.left = '30px'; }
            if (pos === 'bottom_right') { css.bottom = '20px'; css.right = '30px'; }
            if (pos === 'bottom_left') { css.bottom = '20px'; css.left = '30px'; }
            
            clock_html.css(css);
        }

        // Додавання пункту в налаштування Лампи
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'appearance') {
                var item = $('<div class="settings-param selector" data-name="clock_settings" data-type="button"><div class="settings-param__name">Налаштування годинника</div><div class="settings-param__value">Змінити вигляд</div></div>');
                item.on('hover:enter', function () {
                    var menu = [
                        {
                            title: 'Показувати секунди',
                            subtitle: Lampa.Storage.get('clock_seconds', 'true') === 'true' ? 'Так' : 'Ні',
                            onSelect: function() {
                                var cur = Lampa.Storage.get('clock_seconds', 'true');
                                Lampa.Storage.set('clock_seconds', cur === 'true' ? 'false' : 'true');
                                Lampa.Noty.show('Збережено');
                            }
                        },
                        {
                            title: 'Розташування',
                            subtitle: Lampa.Storage.get('clock_position', 'top_right'),
                            onSelect: function() {
                                var positions = ['top_right', 'top_left', 'bottom_right', 'bottom_left'];
                                var cur = Lampa.Storage.get('clock_position', 'top_right');
                                var next = positions[(positions.indexOf(cur) + 1) % positions.length];
                                Lampa.Storage.set('clock_position', next);
                                applyPosition();
                                Lampa.Noty.show('Змінено на ' + next);
                            }
                        }
                    ];
                    Lampa.Select.show({
                        title: 'Годинник',
                        items: menu,
                        onBack: function() { Lampa.Controller.toggle('settings_appearance'); }
                    });
                });
                e.body.find('.settings-list').append(item);
            }
        });

        applyPosition();
    }

    if (window.appready) ClockPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') ClockPlugin(); });
})();

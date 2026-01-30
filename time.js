(function () {
    'use strict';

    function ClockPlugin() {
        // Додаємо стилі в голову документа
        $('head').append(`<style>
            .lampa-custom-clock {
                position: fixed;
                z-index: 9999;
                color: #fff;
                font-family: sans-serif;
                font-weight: bold;
                pointer-events: none;
                text-shadow: 0 0 5px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.5);
                font-size: 2.2rem;
                line-height: 1;
            }
        </style>`);

        // Створюємо елемент годинника
        var clock_html = $('<div class="lampa-custom-clock">00:00</div>');
        $('body').append(clock_html);

        // Функція оновлення часу
        function update() {
            var date = new Date();
            var h = date.getHours().toString().padStart(2, '0');
            var m = date.getMinutes().toString().padStart(2, '0');
            var s = date.getSeconds().toString().padStart(2, '0');
            var show_sec = Lampa.Storage.get('clock_seconds', 'true') === 'true';
            clock_html.text(h + ':' + m + (show_sec ? ':' + s : ''));
        }

        // Функція позиціонування
        function applyPosition() {
            var pos = Lampa.Storage.get('clock_position', 'top_right');
            var css = {top: 'auto', bottom: 'auto', left: 'auto', right: 'auto'};
            if (pos === 'top_right') { css.top = '30px'; css.right = '40px'; }
            else if (pos === 'top_left') { css.top = '30px'; css.left = '40px'; }
            else if (pos === 'bottom_right') { css.bottom = '40px'; css.right = '40px'; }
            else if (pos === 'bottom_left') { css.bottom = '40px'; css.left = '40px'; }
            clock_html.css(css);
        }

        setInterval(update, 1000);
        applyPosition();

        // СЛУХАЧ НАЛАШТУВАНЬ (Виправлено)
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'component' && e.name === 'appearance') {
                setTimeout(function () {
                    var menu = e.object.find('.settings-list');
                    if (menu.length && !menu.find('.data-clock').length) {
                        var btn = $('<div class="settings-param selector data-clock" data-type="button"><div class="settings-param__name">Налаштування годинника</div><div class="settings-param__value">Змінити вигляд</div></div>');
                        
                        btn.on('hover:enter', function () {
                            var options = [
                                {
                                    title: 'Секунди',
                                    subtitle: Lampa.Storage.get('clock_seconds', 'true') === 'true' ? 'Увімкнено' : 'Вимкнено',
                                    onSelect: function() {
                                        var cur = Lampa.Storage.get('clock_seconds', 'true');
                                        Lampa.Storage.set('clock_seconds', cur === 'true' ? 'false' : 'true');
                                        update();
                                        Lampa.Controller.toggle('settings_appearance'); // Повернення
                                    }
                                },
                                {
                                    title: 'Позиція',
                                    subtitle: Lampa.Storage.get('clock_position', 'top_right'),
                                    onSelect: function() {
                                        var list = ['top_right', 'top_left', 'bottom_right', 'bottom_left'];
                                        var cur = Lampa.Storage.get('clock_position', 'top_right');
                                        var next = list[(list.indexOf(cur) + 1) % list.length];
                                        Lampa.Storage.set('clock_position', next);
                                        applyPosition();
                                        Lampa.Controller.toggle('settings_appearance');
                                    }
                                }
                            ];

                            Lampa.Select.show({
                                title: 'Годинник',
                                items: options,
                                onBack: function() {
                                    Lampa.Controller.toggle('settings_appearance');
                                }
                            });
                        });
                        menu.append(btn);
                        Lampa.Controller.add('settings_appearance', {
                            toggle: function () {},
                            render: function () { return menu; }
                        });
                    }
                }, 10);
            }
        });
    }

    if (window.appready) ClockPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') ClockPlugin(); });
})();

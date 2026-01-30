(function () {
    'use strict';

    function ClockPlugin() {
        // 1. Стилі: Білий текст, жирний, з тінню
        if (!$('#clock-style').length) {
            $('head').append(`<style id="clock-style">
                #lampa-custom-clock {
                    position: fixed;
                    z-index: 999999;
                    color: #fff;
                    font-family: sans-serif;
                    font-weight: bold;
                    pointer-events: none;
                    text-shadow: 2px 2px 4px #000;
                    font-size: 2.5rem;
                    display: none;
                }
            </style>`);
        }

        var clock_html = $('<div id="lampa-custom-clock">00:00</div>');
        $('body').append(clock_html);

        function update() {
            var date = new Date();
            var h = date.getHours().toString().padStart(2, '0');
            var m = date.getMinutes().toString().padStart(2, '0');
            var s = date.getSeconds().toString().padStart(2, '0');
            var show_sec = Lampa.Storage.get('clock_seconds', 'true') === 'true';
            clock_html.text(h + ':' + m + (show_sec ? ':' + s : ''));
            
            var is_player = $('.player').length > 0 || $('.pjs-video-container').length > 0 || $('.lampa-player').length > 0 || window.location.hash.indexOf('player') > -1;
            if (is_player) clock_html.show();
            else clock_html.hide();
        }

        function applyPosition() {
            var pos = Lampa.Storage.get('clock_position', 'top_right');
            var css = {top: 'auto', bottom: 'auto', left: 'auto', right: 'auto'};
            if (pos === 'top_right') { css.top = '40px'; css.right = '50px'; }
            else if (pos === 'top_left') { css.top = '40px'; css.left = '50px'; }
            else if (pos === 'bottom_right') { css.bottom = '50px'; css.right = '50px'; }
            else if (pos === 'bottom_left') { css.bottom = '50px'; css.left = '50px'; }
            clock_html.css(css);
        }

        setInterval(update, 1000);
        applyPosition();

        // 2. ДОДАВАННЯ КНОПКИ ЧЕРЕЗ СКРІПТОВИЙ ІН'ЄКТОР
        var addSettingsBtn = function() {
            if ($('.settings-list').length && !$('.data-clock-plugin').length) {
                var btn = $('<div class="settings-list__item selector data-clock-plugin"><div class="settings-list__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div><div class="settings-list__name">ГОДИННИК (НАЛАШТУВАТИ)</div></div>');
                
                btn.on('hover:enter', function () {
                    Lampa.Select.show({
                        title: 'Налаштування годинника',
                        items: [
                            {
                                title: 'Секунди',
                                subtitle: Lampa.Storage.get('clock_seconds', 'true') === 'true' ? 'Увімкнено' : 'Вимкнено',
                                onSelect: function() {
                                    var cur = Lampa.Storage.get('clock_seconds', 'true');
                                    Lampa.Storage.set('clock_seconds', cur === 'true' ? 'false' : 'true');
                                    update();
                                    Lampa.Noty.show('Збережено');
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
                                    Lampa.Noty.show('Змінено');
                                }
                            }
                        ],
                        onBack: function() {
                            Lampa.Controller.toggle('settings');
                        }
                    });
                });
                $('.settings-list').prepend(btn); // Вставляємо ПЕРШИМ у список
                Lampa.Controller.enable('settings'); // Оновлюємо контролер, щоб кнопка стала клікабельною
            }
        };

        // Слідкуємо за відкриттям меню налаштувань через інтервал (найтупіший, але найнадійніший метод)
        setInterval(addSettingsBtn, 500);
    }

    if (window.appready) ClockPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') ClockPlugin(); });
})();

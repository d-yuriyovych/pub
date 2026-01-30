(function () {
    'use strict';

    function ClockPlugin() {
        // Стилі без фону, лише білий текст із тінню
        $('head').append(`<style>
            #lampa-custom-clock {
                position: fixed;
                z-index: 9999;
                color: #fff;
                font-family: sans-serif;
                font-weight: bold;
                pointer-events: none;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.9);
                font-size: 2.2rem;
                display: none; /* Спочатку прихований */
            }
        </style>`);

        var clock_html = $('<div id="lampa-custom-clock">00:00</div>');
        $('body').append(clock_html);

        function update() {
            var date = new Date();
            var h = date.getHours().toString().padStart(2, '0');
            var m = date.getMinutes().toString().padStart(2, '0');
            var s = date.getSeconds().toString().padStart(2, '0');
            var show_sec = Lampa.Storage.get('clock_seconds', 'true') === 'true';
            clock_html.text(h + ':' + m + (show_sec ? ':' + s : ''));
        }

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

        // ГОЛОВНЕ: Показувати тільки в плеєрі
        Lampa.Player.listener.follow('state', function (e) {
            if (e.state === 'view' || window.location.hash.indexOf('player') > -1) {
                clock_html.show();
            } else {
                clock_html.hide();
            }
        });

        // Додаємо налаштування в головне меню зліва
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                var menu_item = $('<li class="menu__item selector" data-action="clock_settings"><div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div><div class="menu__text">Налаштування годинника</div></li>');
                
                menu_item.on('hover:enter', function () {
                    Lampa.Select.show({
                        title: 'Годинник',
                        items: [
                            {
                                title: 'Секунди',
                                subtitle: Lampa.Storage.get('clock_seconds', 'true') === 'true' ? 'Увімкнено' : 'Вимкнено',
                                onSelect: function() {
                                    var cur = Lampa.Storage.get('clock_seconds', 'true');
                                    Lampa.Storage.set('clock_seconds', cur === 'true' ? 'false' : 'true');
                                    update();
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
                                }
                            }
                        ],
                        onBack: function() {
                            Lampa.Controller.toggle('main');
                        }
                    });
                });
                $('.menu .menu__list').append(menu_item);
            }
        });
    }

    if (window.appready) ClockPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') ClockPlugin(); });
})();

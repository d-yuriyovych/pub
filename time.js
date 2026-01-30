(function () {
    'use strict';

    function ClockPlugin() {
        // Стилі: чистий текст, білий, без фону
        if (!$('#clock-style').length) {
            $('head').append(`<style id="clock-style">
                #lampa-custom-clock {
                    position: fixed;
                    z-index: 99999;
                    color: #fff;
                    font-family: sans-serif;
                    font-weight: bold;
                    pointer-events: none;
                    text-shadow: 2px 2px 4px #000;
                    font-size: 2.2rem;
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
            
            // ПЕРЕВІРКА: чи відкритий плеєр зараз
            if ($('.player').length > 0 || $('.pjs-video-container').length > 0 || window.location.hash.indexOf('player') > -1) {
                clock_html.show();
            } else {
                clock_html.hide();
            }
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

        // ДОДАВАННЯ В НАЛАШТУВАННЯ (Розділ "Інше")
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'etc') {
                var btn = $('<div class="settings-param selector" data-type="button"><div class="settings-param__name">Налаштування годинника</div><div class="settings-param__value">Налаштувати оверлей</div></div>');
                
                btn.on('hover:enter', function () {
                    Lampa.Select.show({
                        title: 'Годинник',
                        items: [
                            {
                                title: 'Секунди',
                                subtitle: Lampa.Storage.get('clock_seconds', 'true') === 'true' ? 'Так' : 'Ні',
                                onSelect: function() {
                                    var cur = Lampa.Storage.get('clock_seconds', 'true');
                                    Lampa.Storage.set('clock_seconds', cur === 'true' ? 'false' : 'true');
                                    Lampa.Noty.show('Змінено');
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
                                    Lampa.Noty.show('Позиція: ' + next);
                                }
                            }
                        ],
                        onBack: function() {
                            Lampa.Controller.toggle('settings_etc');
                        }
                    });
                });
                e.body.find('.settings-list').append(btn);
            }
        });
    }

    if (window.appready) ClockPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') ClockPlugin(); });
})();

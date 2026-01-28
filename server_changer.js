(function () {
    'use strict';

    function ServerSwitcher() {
        var servers = [
            { name: 'Lampa (MX)', url: 'http://lampa.mx' },
            { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
            { name: 'Lampa (VIP)', url: 'http://lampa.vip' },
            { name: 'Lampa (NNMTV)', url: 'http://lam.nnmtv.pw' }
        ];

        this.init = function () {
            // Додаємо лише ОДНУ кнопку в шапку для перевірки
            var btn = $('<div class="head__action selector"><svg style="fill: #fff; width: 22px; height: 22px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>');
            btn.on('hover:enter click', this.open);
            $('.head__actions').prepend(btn);
        };

        this.open = function () {
            var host = window.location.hostname;
            var items = servers.filter(function(s) { return s.url.indexOf(host) === -1; }).map(function(s) {
                return { title: s.name, url: s.url };
            });

            // Використовуємо системний список Lampa - він завжди правильного розміру
            Lampa.Select.show({
                title: 'Сервери',
                items: items,
                onSelect: function (a) {
                    Lampa.Storage.set('source', a.url);
                    window.location.replace(a.url);
                },
                onBack: function () {
                    Lampa.Controller.toggle('content');
                }
            });
        };
    }

    if (window.appready) new ServerSwitcher().init();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') new ServerSwitcher().init(); });
})();

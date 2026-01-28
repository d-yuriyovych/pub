(function () {
    function ServerManager(object) {
        var servers = [
            { title: 'Основний Сервер', url: 'http://server1.com' },
            { title: 'Дзеркало Європа', url: 'http://server2.com' },
            { title: 'Резерв UA', url: 'http://server3.com' }
        ];

        this.create = function () {
            var current_url = Lampa.Storage.get('online_proxy_url') || '';
            var current_server = servers.find(function(s) { return s.url === current_url; }) || { title: 'Невідомий', url: current_url };

            var html = $('<div class="server-manager"></div>');
            html.append('<div style="margin-bottom: 10px; opacity: 0.6;">Поточний: ' + current_server.title + '</div>');

            var list = $('<div class="server-list"></div>');
            servers.forEach(function (serv) {
                var item = $('<div class="navigation-item selector" style="padding: 12px; border-radius: 8px; margin-bottom: 8px; background: rgba(255,255,255,0.08)">' + serv.title + '</div>');
                item.on('hover:enter', function () {
                    Lampa.Storage.set('online_proxy_url', serv.url);
                    Lampa.Storage.set('proxy_url', serv.url);
                    location.reload();
                });
                list.append(item);
            });
            html.append(list);

            Lampa.Modal.open({
                title: 'Вибір сервера',
                html: html,
                size: 'medium',
                onBack: function () {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('content');
                }
            });
        };
    }

    // Реєстрація плагіна (як у всіх робочих модах)
    Lampa.Plugins.add('server_manager', function () {
        var manager = new ServerManager();

        // 1. Твій метод налаштувань (БЕЗ підменю)
        var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
        if (SettingsApi && SettingsApi.addParam) {
            SettingsApi.addParam({
                component: 'main',
                param: { name: 'server_btn', type: 'button' },
                field: { name: 'Зміна сервера' },
                onChange: function () { manager.create(); }
            });
        }

        // 2. Кнопки в інтерфейсі
        function addButtons() {
            if ($('.head__actions').length && !$('.head__server-btn').length) {
                var btn = $('<div class="head__action render--visible selector head__server-btn"><svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z"/></svg></div>');
                btn.on('hover:enter', function() { manager.create(); });
                $('.head__actions').prepend(btn);
            }

            if ($('.menu__list').length && !$('.menu__server-btn').length) {
                var m_item = $('<li class="menu__item selector menu__server-btn"><div class="menu__ico"><svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M15 15v4H5v-4h14"/></svg></div><div class="menu__text">Зміна сервера</div></li>');
                m_item.on('hover:enter', function() { 
                    Lampa.Menu.hide(); 
                    setTimeout(function() { manager.create(); }, 100); 
                });
                $('.menu__list').append(m_item);
            }
        }

        addButtons();
        setInterval(addButtons, 2000);
    });
})();

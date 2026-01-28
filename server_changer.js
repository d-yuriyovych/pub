(function () {
    'use strict';

    const SERVERS = [
        { name: 'Lampa (MX)', url: 'https://lampa.mx' },
        { name: 'Lampa (Koyeb)', url: 'https://central-roze-d-yuriyovych-74a9dc5c.koyeb.app' },
        { name: 'Lampa (VIP)', url: 'https://lampa.vip' },
        { name: 'Lampa (NNMTV)', url: 'https://lam.nnmtv.pw' }
    ];

    let selected = null;

    /* =======================
       Перевірка доступності
    ======================== */
    function checkServer(server, timeout = 4000) {
        return new Promise(resolve => {
            let finished = false;

            const timer = setTimeout(() => {
                if (!finished) resolve(false);
            }, timeout);

            fetch(server.url + '/manifest.json', {
                method: 'GET',
                mode: 'no-cors'
            })
            .then(() => {
                finished = true;
                clearTimeout(timer);
                resolve(true);
            })
            .catch(() => {
                finished = true;
                clearTimeout(timer);
                resolve(false);
            });
        });
    }

    /* =======================
       Зміна сервера (офіційно)
    ======================== */
    function changeServer(url) {
        Lampa.Storage.set('server', url);

        if (Lampa.Platform.is('android')) {
            Lampa.Platform.restart();
        } else {
            Lampa.App.reload();
        }
    }

    /* =======================
       UI
    ======================== */
    function openUI() {

        selected = null;
        const current = Lampa.Storage.get('server');
        const body = $('<div class="ss-body"></div>');
        const apply = $('<div class="ss-apply disabled">Змінити сервер</div>');

        apply.on('click', () => {
            if (!apply.hasClass('disabled') && selected) {
                changeServer(selected.url);
            }
        });

        SERVERS.forEach(server => {

            const item = $(`
                <div class="ss-item loading">
                    <div class="ss-name">${server.name}</div>
                    <div class="ss-status">...</div>
                </div>
            `);

            if (server.url === current) {
                item.addClass('current');
                item.find('.ss-status').text('Поточний');
            }

            checkServer(server).then(ok => {
                item.removeClass('loading');

                if (ok) {
                    item.addClass('online');
                    item.find('.ss-status').text('Онлайн');

                    item.on('click', () => {
                        $('.ss-item').removeClass('selected');
                        item.addClass('selected');
                        selected = server;
                        apply.removeClass('disabled');
                    });

                } else {
                    item.addClass('offline');
                    item.find('.ss-status').text('Недоступний');
                }
            });

            body.append(item);
        });

        body.append(apply);

        Lampa.Layer.open({
            title: 'Сервер Lampa',
            content: body,
            width: '50%'
        });
    }

    /* =======================
       Додавання в меню
    ======================== */

    function addToMenu() {

        const item = {
            title: 'Сервер Lampa',
            icon: 'cloud',
            onSelect: openUI
        };

        Lampa.Menu.add(item);

        Lampa.Settings.add({
            title: 'Сервер Lampa',
            onSelect: openUI
        });

        Lampa.Header.add({
            title: 'Сервер',
            onSelect: openUI
        });
    }

    /* =======================
       Стилі
    ======================== */
    function addStyles() {
        $('head').append(`
            <style>
                .ss-body {
                    padding: 20px;
                }
                .ss-item {
                    padding: 15px;
                    margin-bottom: 12px;
                    border-radius: 14px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all .3s;
                }
                .ss-item.online {
                    background: linear-gradient(135deg, #1abc9c, #16a085);
                }
                .ss-item.offline {
                    background: #555;
                    opacity: 0.5;
                }
                .ss-item.current {
                    border: 2px solid gold;
                }
                .ss-item.selected {
                    box-shadow: 0 0 15px #00ffd5;
                }
                .ss-name {
                    font-size: 18px;
                }
                .ss-status {
                    font-size: 14px;
                    opacity: 0.9;
                }
                .ss-apply {
                    margin-top: 20px;
                    padding: 15px;
                    text-align: center;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #3498db, #2980b9);
                    font-size: 18px;
                }
                .ss-apply.disabled {
                    opacity: 0.4;
                }
            </style>
        `);
    }

    /* =======================
       Ініціалізація
    ======================== */
    function init() {
        addStyles();
        addToMenu();
    }

    Lampa.Plugin({
        name: 'Server Switcher',
        version: '1.0.0',
        description: 'Зміна серверів Lampa',
        author: 'You',
        onInit: init
    });

})();

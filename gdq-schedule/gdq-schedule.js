let moment = require('moment');
let jsdom = require('jsdom');

module.exports = url => {
    if (!url) {
        url = 'https://gamesdonequick.com/schedule';
    }
    return new Promise((resolve, reject) => {
        jsdom.env(url, (err, window) => {
            if (!err) {
                let results = parsePage(window);
                console.log(`loaded up ${results.length} results`);
                resolve(results);
            } else {
                console.log('nope', err);
                reject(err);
            }
        });
    });
};

function getLocalMoment(d) {
    return moment(d).utcOffset('-05:00');
}

function parsePage(window) {
    const document = window.document;
    let rows = document.querySelectorAll('#runTable tbody tr');
    let schedule = [];

    Array.from(rows)
        .forEach(r => {
            let tds = r.querySelectorAll('td');
            if (r.className.indexOf('second-row') !== -1) {
                let game = schedule[schedule.length - 1];
                game.estimate = tds[0].textContent.trim();
                let estimate = game.estimate.split(':');
                game.ends = getLocalMoment(game.start).add(estimate[0], 'h').add(estimate[1], 'm').add(estimate[2], 's');
                game.done = getLocalMoment().isAfter(game.ends);
            } else if (tds.length === 4) {
                let startMoment = getLocalMoment(tds[0].textContent.trim());
                schedule.push({
                    title: tds[1].textContent.trim(),
                    start: startMoment,
                    runners: tds[2].textContent.trim()
                });
            }
        });
    return schedule
        .filter(g => !g.done);
}
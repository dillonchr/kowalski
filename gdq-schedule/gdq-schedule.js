let moment = require('moment');
let jsdom = require('jsdom');
const getDom = require('../utils/getDom');

module.exports = () => getDom('https://gamesdonequick.com/schedule')
    .then(parsePage);

function getLocalMoment(d) {
    return moment(d).utcOffset('-05:00');
}

function parsePage(document) {
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
let jsdom = require('jsdom');

module.exports = url => {
    if (!url) {
        url = 'https://wol.jw.org/en/wol/h/r1/lp-e';
    }
    return new Promise((resolve, reject) => {
        jsdom.env(url, (err, window) => {
            if (!err) {
                let results = parsePage(window);
                resolve(results);
            } else {
                console.log('nope-dt', err);
                reject(err);
            }
        });
    });
};

function parsePage(window) {
    try {
        const document = window.document;
        const text = document.querySelectorAll('.tabContent')[1];
        const themeScriptureRaw = text.querySelector('.themeScrp > em').textContent.trim();

        return {
            date: text.querySelector('header').textContent.trim(),
            themeScripture: themeScriptureRaw.substr(0, themeScriptureRaw.length - 1),
            themeScriptureLocation: text.querySelector('.themeScrp a.b').textContent.trim(),
            comments: text.querySelector('.bodyTxt').textContent.trim()
        };
    } catch (error) {
        console.error('Error parsing JW org daily text :(', error);
        return {};
    }
}
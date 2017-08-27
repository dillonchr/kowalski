const getDom = require('../utils/getDom');

module.exports = () => getDom('https://wol.jw.org/en/wol/h/r1/lp-e')
    .then(parsePage);

function parsePage(document) {
    try {
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
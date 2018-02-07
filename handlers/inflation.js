const { inflation } = require('funhouse-client');
const { whisper } = require('../utils/index');

module.exports = c => {
    c.hears('how much was ', 'direct_message,direct_mention,ambient', (b, m) => {
        const matches = m.text.match(/\$([\d\.]+) in (\d{4})$/i);

        if (matches && matches.length === 3) {
            const [dollars, year] = matches.slice(1);

            if (isNaN(dollars)) {
                return whisper(b, m, 'Try a number of dollars next time! :rainbow:');
            }

            inflation(dollars, year, (err, data) => {
                if (data && data.valueThen) {
                    whisper(b, m, `$${data.valueNow} was worth *$${data.valueThen}* in ${data.year}`)
                } else {
                    whisper(b, m, `I don't know what the rate was for ${year}.`);
                }
            });
        } else if (['direct_mention','direct_message'].includes(m.event)) {
            whisper(b, m, `I didn't understand your query man.`);
        }
    });
};

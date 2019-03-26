const {inflation} = require('@dillonchr/funhouse');

module.exports = bot => {
    bot.hears(['how much was '], (reply, {content}) => {
        const matches = content.match(/\$([\d\.]+) in (\d{4})\??$/i);

        if (matches && matches.length === 3) {
            const [dollars, year] = matches.slice(1);

            if (isNaN(dollars)) {
                return reply('Try a number of dollars next time! :rainbow:');
            }

            inflation(dollars, year, (err, data) => {
                if (data && data.valueThen) {
                    reply(`$${data.valueNow} was worth **${data.valueThen}** in ${data.year}`);
                } else {
                    reply(`I don't know what the rate was for ${year}.`);
                }
            });
        }
    });
};

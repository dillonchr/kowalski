const CZK_USD = 0.0434429;
const EUR_USD = 1.11142;
const ALL_RATES_RESP = [
    {rate: CZK_USD, emoji: 'flag_cz'},
    {rate: EUR_USD, emoji: 'flag_eu'}
];

const getNumFromContent = (c) => c.match(/[0-9.]+$/);

module.exports = (bot) => {
    bot.hears(['czk', 'eur', 'euro'], ({content, reply}) => {
        const num = getNumFromContent(content);
        const rate = /czk/i.test(content) ? CZK_USD : EUR_USD;
        if (num) {
            reply(':flag_us: ' + (num * rate).toFixed(2));
        }
    });
    bot.hears(['usd'], ({content, reply}) => {
        const num = getNumFromContent(content);
        if (num) {
            ALL_RATES_RESP.forEach(({rate, emoji}) => {
                reply(`:${emoji}: ${(num / rate).toFixed(2)}`);
            });
        }
    });
};

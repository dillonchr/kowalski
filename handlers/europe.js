const fs = require('fs');
const {trackError} = require('../utils');
const TRANS_PATH = '/data/europeTrans.json';
let europeTransactions;
fs.readFile(TRANS_PATH, (err, data) => {
    if (err) {
        console.error(err);
        return trackError(err);
    }
    europeTransactions = JSON.parse(data);

});
const saveTransactions = () => {
    fs.writeFile(
        TRANS_PATH,
        JSON.stringify(europeTransactions),
        'utf-8',
        (err) => {
            if (err) {
                trackError(err);
            }
        });
};
const addTrans = (price, description) => {
    europeTransactions.push({
        price,
        description
    });
    saveTransactions();
};
const getBalance = () => {
    return '$' + europeTransactions.reduce((sum, trans) => sum - trans.price, 0).toFixed(2);
};
const is = {
    balance: s => /^balance/i.test(s),
    help: s => /^help$/i.test(s),
    debit: s => /([\d.-]+),(.*)$/.test(s)
};

module.exports = bot => {
    bot.hearsAnythingInChannel(process.env.EUROPE_CHANNEL_ID, (reply, m) => {
        const action = m.content.trim();
        const sendBackBalance = () => reply(`Europe Budget Balance: ${getBalance()}`);

        if (is.balance(action)) {
            sendBackBalance();
        } else if (is.debit(action)) {
            try {
                const [ignore, price, description] = action.match(/([\d.-]+),(.*)$/);

                if (isNaN(price)) {
                    return reply(`\`${price}\` isn\'t a proper amount.`);
                }

                addTrans(price, description);
                sendBackBalance();
            } catch (err) {
                trackError(err);
                reply(`Europe Budget error: ${err.message}`);
            }
        }
    });
};


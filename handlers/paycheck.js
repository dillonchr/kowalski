const { paycheck } = require('funhouse-client');
const { whisper, trackError } = require('../utils');

module.exports = controller => {
    controller.on('direct_message,direct_mention,ambient', (b, m) => {
        if (m.user === 'U3K93QTDM' || m.channel === 'G5JA6R84V') {
            const action = m.text.trim();
            
            if (/^help$/i.test(action)) {
                b.reply(m, [
                    '`balance`\ngets remaining balance',
                    '`paycheck {amount}, {optional description}`\nadd transaction with just a dollar amount',
                    '`reset {paycheck total}`\nresets paycheck balance and budgets\n`paycheck total` is optional but can be used to reset beginning of paycheck balance to specific amount otherwise it will default to $2656.65'
                ].join('\n\n'));
            } else if (/^balance/i.test(action)) {
                paycheck.balance((err, bal) => {
                    if (err) {
                        trackError(err);
                        whisper(b, m, `Probalo! ${err.message}`);
                    } else {
                        whisper(b, m, `You have $${bal.balance}`);
                    }
                });
            } else if (/^paycheck /i.test(action)) {
                let price = action.substr(9);
                if (isNaN(price)) {
                    const newPrice = price.split(',').find(p => !isNaN(p));
                    if (!newPrice) {
                        return whisper(b, m, `\`${price}\` isn\'t a proper amount.`);
                    }
                    price = +newPrice;
                }

                paycheck.pay(price, (err, result) => {
                    if (err) {
                        trackError(err);
                        return whisper(b, m, `Paycheck error: ${err.message}`);
                    }
                    whisper(b, m, `You now have $${result.balance}`);
                });
            } else if (/^reset /i.test(action)) {
                paycheck.reset(action.substr(5).trim())
                    .then(bal => whisper(b, m, `Paycheck balance reset to $${bal} :+1:`));
            }
        }
    });
};


const paycheck = require('./paycheck');

function reply(b, m, text) {
    b.reply(m, {
        response_type: 'ephemeral',
        text
    });
}

module.exports = controller => {
    controller.on('direct_message,direct_mention,ambient', (b, m) => {
        const isPaycheckChannel = m.channel === 'G5JA6R84V';

        if (m.user === 'U3K93QTDM' || isPaycheckChannel) {
            const action = m.text.trim();
            
            if (/^help$/i.test(action)) {
                b.reply(m, [
                    '`balance`\ngets remaining balance',
                    '`paycheck {amount}, {optional description}`\nadd transaction with just a dollar amount',
                    '`reset {paycheck total}`\nresets paycheck balance and budgets\n`paycheck total` is optional but can be used to reset beginning of paycheck balance to specific amount otherwise it will default to $2656.65'
                ].join('\n\n'));
            } else if (/^balance/i.test(action)) {
                paycheck.balance()
                    .then(bal => reply(b, m, `You have $${bal}`));
            } else if (/^paycheck /i.test(action)) {
                let price = action.substr(9);
                if (isNaN(price)) {
                    const newPrice = price.split(',').find(p => !isNaN(p));
                    if (!newPrice) {
                        return reply(b, m, `\`${price}\` isn\'t a proper amount.`);
                    }
                    price = +newPrice;
                }

                paycheck.pay(price)
                    .then(res => reply(b, m, `You have $${res} left`))
                    .catch(err => reply(b, m, err));
            } else if (/^reset /i.test(action)) {
                paycheck.reset(action.substr(5).trim())
                    .then(bal => reply(b, m, `Paycheck balance reset to $${bal} :+1:`));
            }
        }
    });
};


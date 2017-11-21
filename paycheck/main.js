const paycheck = new (require('./paycheck'))();
const is = {
    module: s => /^paycheck /i.test(s),
    balance: s => /^balance/i.test(s),
    pay: s => /^pay /i.test(s),
    reset: s => /^reset/i.test(s),
    help: s => /^help/i.test(s),
    deposit: s => /^deposit /i.test(s)
};

function reply(b, m, text) {
    b.reply(m, {
        response_type: 'ephemeral',
        text: text
    });
}

module.exports = controller => {
    //    TODO: don't hack this way
    (require('../budget/main'))(controller, paycheck);

    controller.on('direct_message,direct_mention,ambient', (b, m) => {
        if (m.user === 'U3K93QTDM' || m.channel === 'G5JA6R84V') {
            const message = m.text.trim();
            if (is.module(message)) {
                const action = message.substr(9);

                if (is.help(action)) {
                    const helpText = [
                        '`paycheck balance`\ngets remaining balance',
                        '`paycheck pay {amount}, {optional description}`\nadd transaction with just a dollar amount',
                        '`paycheck reset {paycheck total}`\nresets paycheck balance and budgets\n`paycheck total` is optional but can be used to reset beginning of paycheck balance to specific amount otherwise it will default to $2656.65'
                    ].join('\n\n');
                    b.reply(m, helpText);
                } else if (is.balance(action)) {
                    paycheck.balance()
                        .then(bal => reply(b, m, `You have $${bal}`));
                } else if (is.pay(action) || is.deposit(action)) {
                    const isPay = is.pay(action);
                    let price = action.substr(isPay ? 4 : 8);
                    if (isNaN(price)) {
                        const newPrice = price.split(',').find(p => !isNaN(p));
                        if (!newPrice) {
                            return reply(b, m, `\`${price}\` isn\'t a proper amount.`);
                        }
                        price = +newPrice;
                    }
                    //  make sure we remember not to do negative numbers when depositing
                    if (!isPay && price > 0) {
                        price *= -1;
                    }

                    paycheck.pay(price)
                        .then(res => reply(b, m, `You have $${res} left`))
                        .catch(err => reply(b, m, err));
                } else if (is.reset(action)) {
                    paycheck.reset(action.substr(6))
                        .then(bal => reply(b, m, `Budget reset to $${bal} :+1:`));
                }
            }
        }
    });
};


const {paycheck} = require('funhouse-client');
const {trackError} = require('../utils');
const regExs = {
    balance: /^balance/i,
    help: /^help$/i,
    debit: /([\d.-]+),(.*)$/,
    budget: /^budget /i
};

module.exports = bot => {
    bot.hearsAnythingInChannel('439164695149019156', (reply, m) => {
        const action = m.content.trim();

        if (regExs.help.test(action)) {
            reply([
                '`balance`\ngets remaining balance',
                '`paycheck {amount}, {optional description}`\nadd transaction with just a dollar amount',
                '`reset {paycheck total}`\nresets paycheck balance and budgets\n`paycheck total` is optional but can be used to reset beginning of paycheck balance to specific amount otherwise it will default to $2656.65'
            ].join('\n\n'));
        } else if (regExs.balance.test(action)) {
            paycheck.balance((err, bal) => {
                if (err) {
                    trackError(err);
                    reply(`Probalo! ${err.message}`);
                } else {
                    reply(`You have $${bal.balance}`);
                }
            });
        } else if (regExs.debit.test(action) && !regExs.budget.test(action)) {
            try {
                const [ignore, price] = action.match(regExs.debit);

                if (isNaN(price)) {
                    return reply(`\`${price}\` isn\'t a proper amount.`);
                }

                paycheck.pay(price, (err, result) => {
                    if (err) {
                        trackError(err);
                        return reply(`Paycheck error: ${err.message}`);
                    } else {
                        reply(`You now have $${result.balance}`);
                    }
                });
            } catch (err) {}
        } else if (/^reset /i.test(action)) {
            paycheck.reset(action.substr(5).trim(), (err, result) => {
                if (err) {
                    trackError(err);
                    return reply(`Paycheck error: ${err.message}`);
                } else {
                    reply(`Paycheck balance reset to $${result.balance} :+1:`);
                }
            });
        }
    });
};


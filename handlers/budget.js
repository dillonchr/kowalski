const {budget} = require('funhouse-client');
const {trackError} = require('../utils/index');

const respondWithBalance = (reply, userId) => {
    budget.balance(userId, (err, data) => {
        if (err) {
            trackError(err);
            return reply(`Budget error: ${err.message}`);
        }
        reply(`Your budget is at **$${data.balance}**`);
    });
};

module.exports = bot => {
    bot.hears(['budget'], (reply, m) => {
        const isInPaycheckChannel = m.channel_id === 'G5JA6R84V';

        if (m.event !== 'ambient' || isInPaycheckChannel) {
            const action = m.content.trim();
            const userId = m.author.id;

            if (/^(budget )?balance/i.test(action)) {
                respondWithBalance(reply, userId);
            } else if (/^budget /i.test(action)) {
                const [amount, description] = action.substr(7).split(',');
                budget.bought(userId, {amount, description}, (err, data) => {
                    if (err) {
                        trackError(err);
                        return reply(`Budget broke: ${err.message}`);
                    }
                    reply(`You now have $${data.balance} left`);
                });
            } else if (isInPaycheckChannel && /^reset /i.test(action)) {
                // budget.onPaycheckReset()
                //     .then(() => reply(b, m, `Budget reset... calculating balance`))
                //     .then(() => respondWithBalance(b, m, userId));
            }
        }
    });
};


const { paycheck } = require("@dillonchr/funhouse");
const moment = require("moment");
const { trackError } = require("../utils");
const is = {
  balance: s => /^balance/i.test(s),
  help: s => /^help$/i.test(s),
  debit: s => /([\d.-]+),(.*)$/.test(s),
  budget: s => /^budget /i.test(s),
  reset: s => /^reset /i.test(s)
};

module.exports = bot => {
  bot.hearsAnythingInChannel(
    process.env.PAYCHECK_CHANNEL_ID,
    ({ reply, channel, content }) => {
      const action = content.trim();

      if (is.balance(action)) {
        paycheck.balance((err, bal) => {
          if (err) {
            trackError(err);
            reply(`Probalo! ${err.message}`);
          } else {
            reply(`You have $${bal.balance}`);
          }
        });
      } else if (is.debit(action) && !is.budget(action)) {
        try {
          const [ignore, price] = action.match(/([\d.-]+),(.*)$/);

          if (isNaN(price)) {
            return reply(`\`${price}\` isn\'t a proper amount.`);
          }

          paycheck.spend(price, async (err, result) => {
            if (err) {
              trackError(err);
              reply(`Paycheck error: ${err.message}`);
            } else {
              try {
                await channel.edit({
                  topic: `$${result.balance} as of ${moment().format(
                    "h:mma ddd"
                  )}`
                });
              } catch (err) {
                if (/Missing Permissions/i.test(err.message)) {
                  console.log(
                    "Need to give 'Modify Channel' permissions to Kowalski"
                  );
                }
                reply(`Paycheck balance: $${result.balance}`);
              }
            }
          });
        } catch (err) {
          trackError(err);
          reply(`Paycheck debit error: ${err.message}`);
        }
      } else if (is.reset(action)) {
        paycheck.reset(action.substr(5).trim(), (err, result) => {
          if (err) {
            trackError(err);
            reply(`Paycheck error: ${err.message}`);
          } else {
            reply(`Paycheck balance reset to $${result.balance} :+1:`);
          }
        });
      }
    }
  );
};

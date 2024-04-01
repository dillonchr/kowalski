const { paycheck } = require("@dillonchr/funhouse");
const moment = require("moment");
const { trackError } = require("../utils");
const is = {
  balance: (s) => /^balance/i.test(s),
  help: (s) => /^help$/i.test(s),
  debit: (s) => /([\d.-]+),(.*)$/.test(s),
  budget: (s) => /^budget /i.test(s),
  reset: (s) => /^reset /i.test(s),
};

const EMOJIS = ["🤑", "👑", "💸", "💵", "💰", "💳", "⚖️", "🌼", "💶", "🥇", "🌝"];
const emote = () => EMOJIS[~~(Math.random() * EMOJIS.length)];

module.exports = (bot) => {
  bot.hearsAnythingInChannel(process.env.PAYCHECK_CHANNEL_ID, async (message) => {
    const action = message.content.trim();
    const { reply } = message;

    function jazzedUpReply(replyStr) {
      return reply(replyStr.replace(/\$100.00$/, "💯").replace(/\$-?0\.00$/, "$0 💀"));
    }

    if (is.balance(action) && !is.budget(action)) {
      paycheck.balance(async (err, bal) => {
        if (err) {
          trackError(err);
          await reply(`Probalo! ${err.message}`);
        } else {
          await jazzedUpReply(`You have $${bal.balance}`);
        }
      });
    } else if (is.debit(action) && !is.budget(action)) {
      try {
        const [ignore, price] = action.match(/([\d.-]+),(.*)$/);

        if (isNaN(price)) {
          return await reply(`\`${price}\` isn\'t a proper amount.`);
        }

        paycheck.spend(price, async (err, result) => {
          if (err) {
            trackError(err);
            await reply(`Paycheck error: ${err.message}`);
          } else {
            try {
              await jazzedUpReply(`${emote()} $${result.balance}`);
            } catch (err) {
              if (/Missing Permissions/i.test(err.message)) {
                console.log("Need to give 'Modify Channel' permissions to Kowalski");
              }
            }
          }
        });
      } catch (err) {
        trackError(err);
        await reply(`Paycheck debit error: ${err.message}`);
      }
    } else if (is.reset(action)) {
      paycheck.balance(async (err, bal) => {
        if (err) {
          await reply("Oops");
          trackError(err);
        } else {
          const leftovers = bal.balance;

          paycheck.reset(action.substr(5).trim(), async (err, result) => {
            if (err) {
              trackError(err);
              await reply(`Paycheck error: ${err.message}`);
            } else {
              await reply(`Paycheck balance reset to $${result.balance} :+1:`);
            }
          });
        }
      });
    }
  });
};

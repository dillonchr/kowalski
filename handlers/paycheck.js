const moment = require("moment");
const {
  balance: originalBalance,
  spend,
  reset
} = require("../pkgs/bankrupt/bankrupt");

const is = {
  balance: s => /^balance/i.test(s),
  help: s => /^help$/i.test(s),
  debit: s => /([\d.-]+),(.*)$/.test(s),
  budget: s => /^budget /i.test(s),
  reset: s => /^reset /i.test(s),
  eatingOut: s => /^food /i.test(s),
  shopping: s => /^shop(ping)? /i.test(s)
};

const EMOJIS = [
  "🤑",
  "👑",
  "💸",
  "💵",
  "💰",
  "💳",
  "⚖️",
  "🌼",
  "💶",
  "🥇",
  "🌝"
];
const emote = () => EMOJIS[~~(Math.random() * EMOJIS.length)];

function balance(id) {
  return "$" + originalBalance(id).toFixed(2);
}

function jazzedUpReply(reply, replyStr) {
  return reply(
    replyStr.replace(/\$100.00$/, "💯").replace(/\$-?0\.00$/, "$0 💀")
  );
}

module.exports = bot => {
  bot.hearsAnythingInChannel(process.env.PAYCHECK_CHANNEL_ID, async message => {
    const action = message.content.trim();

    if (is.budget(action)) {
      return;
    }

    const { reply } = message;

    if (is.balance(action)) {
      await jazzedUpReply(reply, `You have ${balance(message.channelId)}`);
      return;
    }

    if (is.debit(action)) {
      const [ignore, price] = action.match(/([\d.-]+),(.*)$/);
      if (isNaN(price)) {
        await reply(`Be reasonable! \`${price}\` isn\'t a proper amount.`);
        return;
      }

      const remainingBal = spend(message.channelId, price);
      await jazzedUpReply(reply, `${emote()} $${remainingBal.toFixed(2)}`);
      return;
    }

    if (is.reset(action)) {
      const amount = parseFloat(action.substr(5).trim());
      if (isNaN(amount)) {
        await reply(
          `Reset amount seems less than legit. ${action.substr(5).trim()}`
        );
        return;
      }

      // all good
      await jazzedUpReply(
        `Remaining balance before paycheck reset: ${balance(message.channelId)}`
      );
      await jazzedUpReply(
        `Paycheck balance reset to $${reset(message.channelId, amount)}`
      );
      return;
    }
  });
};

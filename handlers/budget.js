const {
  formatAmount,
  formattedBalance,
  spend,
  reset
} = require("../pkgs/bankrupt/bankrupt");
const { trackError } = require("../utils/index");

module.exports = bot => {
  bot.hearsAnythingInChannel(
    process.env.PAYCHECK_CHANNEL_ID,
    async ({ reply, content, author }) => {
      const action = content.trim();
      const userId = author.id;

      if (/^budget balance/i.test(action)) {
        await reply(
          `@${author.username}'s budget: ${formattedBalance(userId)}`
        );
        return;
      }

      if (/^budget /i.test(action)) {

        const [ignore, price] = action.match(/([\d.-]+),(.*)$/);
        if (isNaN(price)) {
          await reply(`Be reasonable! \`${price}\` isn\'t a proper amount.`);
          return;
        }

        await reply(
          `@${author.username}: ${formatAmount(spend(userId, price))}`
        );
      }
    }
  );
};

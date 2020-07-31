const { budget } = require("@dillonchr/funhouse");
const { trackError } = require("../utils/index");

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
  bot.hearsAnythingInChannel(
    process.env.PAYCHECK_CHANNEL_ID,
    ({ reply, content, author }) => {
      const action = content.trim();
      const userId = author.id;

      if (/^(budget )?balance/i.test(action)) {
        respondWithBalance(reply, userId);
      } else if (/^budget /i.test(action)) {
        const [amount, description] = action.substr(7).split(",");
        budget.bought(userId, { amount, description }, (err, data) => {
          if (err) {
            trackError(err);
            return reply(`Budget broke: ${err.message}`);
          }
          reply(`@${author.username}: $${data.balance}`);
        });
      }
    }
  );
};

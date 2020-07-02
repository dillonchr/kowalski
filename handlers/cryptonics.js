const { cryptonics } = require("@dillonchr/funhouse");
const { trackError } = require("../utils");
const is = {
  encrypt: s => /^encrypt \d+;/i.test(s),
  decrypt: s => /^decrypt \d+;/i.test(s)
};

module.exports = bot => {
  bot.hears(["encrypt", "decrypt"], ({ reply, content }) => {
    if (is.encrypt(content) || is.decrypt(content)) {
      const firstSemi = content.indexOf(";");
      const offset = +content.substr(0, firstSemi).match(/\d+/)[0];
      const message = content.substr(firstSemi + 1);
      const isEncrypt = is.encrypt(content);
      const call = isEncrypt ? cryptonics.encrypt : cryptonics.decrypt;

      call(offset, message, (err, response) => {
        if (err) {
          trackError(err);
          return reply(`Error translating: ${err.message}`);
        }

        const emoji = isEncrypt ? ":lock:" : ":unlock:";
        reply(`${emoji}\n\`\`\`${response.body}\`\`\``);
      });
    }
  });
};

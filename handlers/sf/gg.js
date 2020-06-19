const { exec } = require("child_process");

const emoji = () => (Date.now() % 2 === 0 ? ":foggy:" : ":bridge_at_night:");

const GG_FRAME_COUNT = 10;

module.exports = bot => {
  bot.hears(["gg", "golden gate"], async message => {
    const { reply } = message;
    await message.react("⏳");

    const gifTimerId = setTimeout(
      () =>
        reply(
          "Wasn't able to build your gif, bud.\nSorry about that.\n" + emoji()
        ),
      (GG_FRAME_COUNT + 1) * 1000
    );
    exec(
      "../../make.sh",
      { cwd: __dirname, shell: true },
      async (err, o, stdErr) => {
        const gifPath = o && !err && o.trim();
        clearTimeout(gifTimerId);
        if (gifPath && gifPath.match(/\.gif$/)) {
          await reply(emoji(), {
            files: [
              {
                attachment: gifPath
              }
            ]
          });
        } else {
          reply(`Couldn't build your gif!
        ${emoji()}
        \`\`\`
        ${stdErr}
        ${o}
        \`\`\``);
        }
      }
    );
  });
};

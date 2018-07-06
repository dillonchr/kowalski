const {dailytext} = require('@dillonchr/funhouse');
const {trackError} = require('../utils/index');


module.exports = (controller) => {
    controller.hears(['daily text', 'dailytext'], reply => dailytext((err, t) => {
        if (err) {
            reply(`Text problem: ${err.message}`);
            return trackError(err);
        }

        reply(
            [
                `**${t.date}** - **${t.themeScriptureLocation}**`,
                `\`\`\`${t.themeScripture}\`\`\``,
                t.comments
            ].join('\n'));
    }));
};

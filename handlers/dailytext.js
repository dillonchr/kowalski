const { dailytext } = require('funhouse-client');
const { trackError, whisper } = require('../utils/index');


module.exports = (controller) => {
    controller.hears(['daily text', 'dailytext'], 'direct_message,direct_mention,mention', (b, m) => {
        dailytext((err, t) => {
            if (err) {
                whisper(b, m, `Text problem: ${err.message}`);
                return trackError(err);
            }

            b.reply(m, {
                attachments: [
                    {
                        fallback: '/shrug',
                        color: '#6f6392',
                        author_name: `${t.date} - ${t.themeScriptureLocation}`,
                        title: t.themeScripture,
                        text: t.comments,
                        footer: 'JW.ORG',
                        footer_icon: 'https://www.brandsoftheworld.com/sites/default/files/styles/logo-thumbnail/public/062015/jw.org_logo_0_0.png?itok=5wnKndup'
                    }
                ]
            });
        });
    });
};

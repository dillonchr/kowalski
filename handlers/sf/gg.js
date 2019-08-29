module.exports = (bot) => {
    bot.hears(['gg','golden gate'], ({reply}) => {
        const cc = new Date().getTime();
        reply(`https://media.kron.com/nxs-krontv-media-us-east-1/Traffic/cam3_2_large.jpg?cc=${cc}\nhttp://173.164.254.148/vid.cgi?id=S44197_BYLD&doc=East%20Beach%20Webcam&i=1&r=0.6992534210555819`);
    });
};


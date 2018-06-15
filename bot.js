const {Client} = require('discord.io');

const botHandler = () => {
    const handlers = [];
    const channelHandlers = [];
    const bot = new Client({token: process.env.token, autorun: true});

    bot.on('connect', () => console.log('Location confirmed. Sending supplies.'));
    bot.on('message', (user, userId, channelId, msg, e) => {
        if (userId !== bot.id) {
            try {
                const matchedChannelHandlers = channelHandlers.filter(([id]) => channelId === id);
                if (matchedChannelHandlers.length) {
                    matchedChannelHandlers.forEach(([id, callback]) => callback(reply => bot.sendMessage({to: channelId, message: reply}), e.d));
                } else {
                    const lowerCasedMsg = msg.toLowerCase();
                    const [ignore, fn] = handlers.find(([triggers]) => {
                        return triggers.some(t => lowerCasedMsg.includes(t));
                    });
                    fn(reply => bot.sendMessage({to: channelId, message: reply}), e.d);
                }
            } catch (ignore) {
            }
        }
    });

    return {
        hears: (triggers, callback) => {
            handlers.push([triggers.map(s => s.toLowerCase()), callback]);
        },
        hearsAnythingInChannel: (channelId, callback) => {
            channelHandlers.push([channelId, callback]);
        },
        get id() {
            return bot.id;
        }
    }
};

module.exports = botHandler();

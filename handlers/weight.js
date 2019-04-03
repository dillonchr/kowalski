const moment = require('moment');
const fs = require('fs');
const path = require('path');
const jsonPath = path.join(process.env.DATA_DIR || __dirname, 'weight.json');
const goalDate = process.env.WEIGHT_GOAL_DATE;
const baseWeightData = {
    lastReminderSent: 365,
    users: {}
};
const users = (process.env.WEIGHT_USERS || '').split(',');
let lastReminderSent = new Date(0);

const getWeightData = (fn) => {
    fs.readFile(jsonPath, 'utf-8', (err, data) => {
        try {
            const weightData = JSON.parse(data);
            if (!weightData || !Object.keys(weightData).length) {
                fn(null, baseWeightData);
            } else {
                fn(null, weightData);
            }
        } catch (ignore) {
            fn(null, baseWeightData);
        }
    });
};

const getDaysUntil = () => moment(goalDate).diff(moment(), 'days');

const getBiggestKey = (keys) => keys.reduce((biggest, daysUntil) => +daysUntil > +biggest ? daysUntil : biggest, 0);

const getSmallestKey = (keys) => keys.reduce((biggest, daysUntil) => +daysUntil < +biggest ? daysUntil : biggest, Infinity);

const sendReminders = (bot) => {
    const daysUntil = getDaysUntil();
    if (daysUntil >= 0) {
        getWeightData((err, data) => {
            if (daysUntil !== data.lastReminderSent) {
                data.lastReminderSent = daysUntil;
                //then send!!
                users
                    .filter((id) => data.users.hasOwnProperty(id) && Object.keys(data.users[id]).length > 1)
                    .forEach((id) => {
                        const user = data.users[id];
                        const keys = Object.keys(user);
                        const firstWeightKey = getBiggestKey(keys);
                        const lowestWeightKey = getSmallestKey(keys);
                        const firstWeight = user[firstWeightKey];
                        const lastWeight = user[lowestWeightKey];
                        const delta = firstWeight - lastWeight;
                        const verb = delta >= 0 ? 'lost' : 'gained';
                        bot.sendMessage(id, `With **${daysUntil} days to go**, you have ${verb} **${Math.abs(delta).toFixed(2)}** lbs.`);
                    });
                writeWeightData({...data, lastReminderSent:daysUntil}, (err) => {
                    if (err) {
                        console.error('Updating last reminder sent, failed to write!', err);
                    }
                });
            }
            setTimeout(sendReminders.bind(this, bot), 1000 * 60 * 60 * 2);
        });
    }
};

const recordWeight = (userId, weight, reply) => {
    getWeightData((err, data) => {
        const user = data.users[userId] || {};
        const dateKey = getDaysUntil().toString();
        user[dateKey] = weight;
        const allUserKeys = Object.keys(user);
        if (allUserKeys.length === 1) {
            const didUpdate = !!data.users[userId];
            const message = didUpdate ? 'Updated your starting weight' : 'Got your starting weight set';
            reply(`${message} to ${weight}`);
        } else {
            const firstKey = getBiggestKey(allUserKeys);
            const delta = (user[firstKey] - weight);
            const verb = delta >= 0 ? 'lost' : 'gained';
            reply(`You have ${verb} **${Math.abs(delta).toFixed(2)}** lbs.`);
        }
        reply(`${dateKey} days to go!`);
        data.users[userId] = user;
        writeWeightData(data, (err) => {
            if (err) {
                console.error('Recording weight, failed to write!', err);
            }
        });
    });
};

const writeWeightData = (weightData, fn) => {
    fs.writeFile(jsonPath, JSON.stringify(weightData), 'utf-8', fn);
};

module.exports = bot => {
    bot.hears(['@'], ({reply, content, author}) => {
        if (/^@/.test(content)) {
            const lbs = content.match(/@([\d.]+)/i);
            if (lbs.length === 2) {
                const currentWeight = +lbs[1];
                recordWeight(author.id, currentWeight, reply);
            } else {
                reply('I missed the amount....');
            }
        }
    });
    //  this is necessary because discordbot doesn't check if it's ready
    setTimeout(() => sendReminders(bot), 10000);
};



const { exec } = require('child_process');

module.exports = (bot) => {
    bot.hears(['gg','golden gate'], ({reply}) => {
        const kron = `https://media.kron.com/nxs-krontv-media-us-east-1/Traffic/cam3_2_large.jpg?cc=${new Date().getTime()}`
        exec('../../make.sh', {cwd: __dirname, shell: true}, (err, o, stdErr) => {
            const gifPath = o && !err && o.trim()
            if (o && o.trim().match(/\.gif$/)) {
                reply(kron, {files: [o.trim()]});
            } else {
                reply(kron);
            }
        });
    });
};


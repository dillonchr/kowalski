const fetch = require('@dillonchr/fetch');

const getCrissyFieldCam = (done) => {
    fetch({
        url: `http://173.164.254.148/ptz.cgi?doc=East%20Beach%20Webcam&xml=1&cmd=open&version=20100917&kind=ctl`
    }, (err, body) => {
        if (err) {
            done(err);
        } else {
            try {
            const [ignore, id] = body.match(/key="id" value="([^"]+)"/);
            done(null, `http://173.164.254.148/vid.cgi?id=${id}&doc=East%20Beach%20Webcam&i=1&r=${Math.random()}`);
            } catch(err) {
                done(err);
            }
        }
    });
};


module.exports = (bot) => {
    bot.hears(['gg','golden gate'], ({reply}) => {
        const cc = new Date().getTime();
        reply(`https://media.kron.com/nxs-krontv-media-us-east-1/Traffic/cam3_2_large.jpg?cc=${cc}`);
        getCrissyFieldCam((err, url) => {
            if (err) {
                console.log('CrissyFieldErr:', err);
            } else {
                reply(url);
            }
        });
    });
};


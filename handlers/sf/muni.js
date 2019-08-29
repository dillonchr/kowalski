const http = require('http')

const getUrl = (route, stopId) => `http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=sf-muni&r=${route}&s=${stopId}`

const getNextStopTimes = (route, stopId, done) => {
  const req = http.get(getUrl(route, stopId), (res) => {
    let body = ''
    res.on('data', chunk => body += chunk)
    res.on('end', () => done(null, JSON.parse(body)))
  })
  req.on('error', err => done(err))
}

const getSecondsUntilNextBus = (bus, stop, done) => {
  getNextStopTimes(bus, stop || 6604, (err, res) => {
    if (err) {
      return done(err)
    }
    try {
      const { direction } = res.predictions
      const { prediction } = Array.isArray(direction) ? direction[0] : direction
      const seconds = +(Array.isArray(prediction) ? prediction[0] : prediction).seconds
      done(null, seconds)
    } catch(err) {
      done(err)
    }
  })
}

const replyWithTime = (reply, bus, err, seconds) => {
  if (err) {
    reply(`Something blew up when fetching ${bus}'s predictions: ${err.toString()}`)
  } else {
    const min = ~~(seconds/60)
    const sec = (seconds%60).toString().padStart(2, '0')
    reply(`**#${bus}** - ${min}:${sec}`)
  }
}

module.exports = (bot) => {
  bot.hears(['muni home'], ({reply}) => {
    [2,3]
        .forEach(bus => {
          getSecondsUntilNextBus(bus, null, replyWithTime.bind(this, reply, bus))
        })
  })
  bot.hears(['muni pg'], ({reply}) => {
    [30]
        .forEach(bus => {
          getSecondsUntilNextBus(bus, 6523, replyWithTime.bind(this, reply, bus))
        })
  })
}


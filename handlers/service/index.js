const moment = require('moment')
const fs = require('fs')
const path = require('path')
const jsonPath = path.join(process.env.DATA_DIR || __dirname, 'service.json')
const users = (process.env.WEIGHT_USERS || '').split(',')

const getTimeData = (fn) => {
    fs.readFile(jsonPath, 'utf-8', (err, data) => {
        try {
            const timeData = JSON.parse(data)
            if (!timeData || !Object.keys(timeData).length) {
                fn(null, {})
            } else {
                fn(null, timeData)
            }
        } catch (ignore) {
            fn(null, {})
        }
    })
}

/*
 * enter "2 hours, 3 rvs, 1 placement"
 * get current date key
 * get report for current user[dateKey]
 * if existant, update values to current ones
 * else set values to current ones
 * enter "1/28/2020, 2 hours"
 * get date key from date passed in, merge values
 * if existant, merge values
 * else set values to current counts
 */

const writeTimeData = (timeData, fn) => {
    fs.writeFile(jsonPath, JSON.stringify(timeData), 'utf-8', fn)
}

const channelRegex = /^[\d.]+/
const Q = {
    HOURS: /(\d+)\s?ho?u?rs?/i,
    RVS: /(\d+)\s?re?t?u?r?n?vi?s?i?t?s?/i,
    PLACEMENTS: /(\d+)\s?pl?a?c?e?m?e?n?t?s?/i,
    VIDEOS: /(\d+)\s?vi?d?e?o?s?/i,
    STUDIES: /(\d+)\s?(bs|bible study|bible studies|study|studies)/i,
    DATE: /1?\d\/\d+\/202\d/,
}

module.exports = bot => {
    bot.hears(['service', 'svc', 'time'], ({reply, author, content}) => {
        const pieces = content
            .split(',')
            .map(p => p.trim())
        const report = pieces
            .reduce((obj, current) => {
                let m = current.match(Q.HOURS)
                if (m) {
                    return {...obj, hours: +m[1]}
                }
                m = current.match(Q.RVS)
                if (m) {
                    return {...obj, returnVisits: +m[1]}
                }
                m = current.match(Q.PLACEMENTS)
                if (m) {
                    return {...obj, placements: +m[1]}
                }
                m = current.match(Q.VIDEOS)
                if (m) {
                    return {...obj, videos: +m[1]}
                }
                m = current.match(Q.STUDIES)
                if (m) {
                    return {...obj, bibleStudies: +m[1]}
                }
                return obj
            }, {})

        if (Object.keys(report).length) {
            const date = (pieces[0].match(Q.DATE) && pieces[0].match(Q.DATE)[0]) ||
                moment().format('l')
            getTimeData((ignore, data) => {
                const user = data[author.username] || {}
                const existingData = user[date] || {}
                user[date] = {...existingData, ...report}
                data[author.username] = user
                writeTimeData(data, (err) => {
                    if (!err) {
                        reply('got it')
                    } else {
                        console.error('TIME FAILE', err)
                        reply('FAILED')
                    }
                })
            })
        }
    })
}



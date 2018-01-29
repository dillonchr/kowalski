const getDom = require('../utils/getDom');
const SimpleDb = require('../utils/simple-db');
const ROSTER_URL = 'https://consumeraffairs.com/about/staff/';
const COLL_NAME = 'employees';
const Raven = require('raven');

class Fired extends SimpleDb {
    constructor() {
        super('employees');
    }

    getEmployees() {
        return this.getAllDocuments();
    }

    getCurrentRoster() {
        return getDom(ROSTER_URL)
            .then(document => {
                const roster = [...document.querySelectorAll('.vcard')]
                    .map(e => ({
                        name: e.querySelector('h2.fn').innerHTML,
                        profilePic: e.querySelector('.photo.head_shot').src,
                        position: e.querySelector('h3.title').innerHTML,
                        bio: e.querySelector('.bio.entry > p').innerHTML.trim(),
                        fired: false
                    }));
                if (!roster || !roster.length) {
                    Raven.captureException(new Error('FIRED: no employee data found on domQuery'));
                }
                return roster;
            });
    }

    list() {
        return this.getEmployees()
            .then(employees => employees.filter(e => e.fired));
    }

    compareRosters(oldRoster, nowRoster) {
        if (!oldRoster.length) {
            this.saveMany(nowRoster)
                .then(() => console.log('No news. Saved current roster for future comparisons.'))
                .catch(err => Raven.captureException(err));
            return [];
        } else {
            //  employees that aren't found in the newly loaded roster
            const newFires = oldRoster
                .filter(e => !e.fired && !nowRoster.some(n => e.name === n.name))
                .map(e => Object.assign({}, e, {
                    fired: true,
                    fireDate: new Date().getTime()
                }));
            //  add people not in the old roster but in the current roster
            const newHires = nowRoster.filter(e => !oldRoster.some(o => e.name === o.name));
            const mergedRoster = oldRoster.concat(newHires);
            const dedupedRoster = mergedRoster.filter((e, i, a) => a.findIndex(ee => ee.name === e.name) === i);

            if (newHires.length) {
                this.saveMany(newHires)
                    .catch(err => Raven.captureException(err));
            }
            if (newFires.length) {
                const wait = newFires
                    .map(emp => this.markAsFired(emp));
                Promise.all(wait)
                    .then(() => console.log('Db updated successfully!'));
            }
            return newFires;
        }
    }

    markAsFired(e) {
        return this.saveDocument(e, {name: e.name});
    }

    update() {
        return Promise.all([
            this.getEmployees(),
            this.getCurrentRoster()
        ])
            .then(([old, now]) => this.compareRosters(old, now));
    }
}

module.exports = Fired;
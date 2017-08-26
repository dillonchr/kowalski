const jsdom = require('jsdom');
const SimpleDb = require('../utils/simple-db');
const ROSTER_URL = 'https://consumeraffairs.com/about/staff/';
const COLL_NAME = 'employees';

class Fired extends SimpleDb {
    constructor() {
        super('employees');
    }

    getEmployees() {
        return this.getAllDocuments();
    }

    getCurrentRoster() {
        return new Promise((res, rej) => {
            jsdom.env(ROSTER_URL, (err, window) => {
                if (!err) {
                    try {
                        const roster = [...window.document.querySelectorAll('.vcard')]
                            .map(e => ({
                                name: e.querySelector('h2.fn').innerHTML,
                                profilePic: e.querySelector('.photo.head_shot').src,
                                position: e.querySelector('h3.title').innerHTML,
                                bio: e.querySelector('.bio.entry > p').innerHTML.trim(),
                                fired: false
                            }));
                        if (!roster || !roster.length) {
                            throw new Error('no employee data found on domQuery');
                        }
                        res(roster);
                    } catch (dataError) {
                        rej(dataError);
                    }
                } else {
                    rej(err);
                }
            });
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
                .catch(err => console.error(err));
            return [];
        } else {
            //  employees that aren't found in the newly loaded roster
            const newFires = oldRoster
                .filter(e => !e.fired && !nowRoster.some(n => e.name === n.name))
                .map(e => Object.assign({
                    fired: true,
                    fireDate: new Date().getTime()
                }, e));
            //  add people not in the old roster but in the current roster
            const newHires = nowRoster.filter(e => !oldRoster.some(o => e.name === o.name));
            const mergedRoster = oldRoster.concat(newHires);
            const dedupedRoster = mergedRoster.filter((e, i, a) => a.findIndex(ee => ee.name === e.name) === i);

            if (newHires.length) {
                this.saveMany(newHires)
                    .catch(err => console.log('problem saving yo'));
            }
            if (newFires.length) {
                const wait = newFires
                    .map(emp => this.markAsFired(emp));
                return Promise.all(wait)
                    .then(() => console.log('UPDATED DB SUCCESSFULLY?'));
            }
            return newFires;
        }
    }

    markAsFired(e) {
        return this.saveDocument(Object.assign({_id: e.id}, e));
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
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const collection = 'budget';


class Budget {
    constructor() {
        this.dbPromise = null;
    }

    getDb() {
        if (!this.dbPromise) {
            this.dbPromise = new Promise((res, rej) => {
                MongoClient.connect(process.env.mongouri, (err, db) => {
                    if (err) {
                        console.error(err);
                        rej(err);
                    } else {
                        res(db);
                    }
                });
            });
        }
        return this.dbPromise;
    }

    getCollection() {
        return this.getDb()
            .then(d => d.collection(collection));
    }

    getTransactions(userId) {
        return this.getCollection()
            .then(c => new Promise((res, rej) => c.findOne({_id: userId},
                    (err, doc) => res(doc || {
                        _id: userId,
                        balance: 120.80,
                        transaction: []
                    }))
            ));
    }
}

const testtt = new Budget();
testtt.getTransactions('dillonchr').then(t => console.log(t));

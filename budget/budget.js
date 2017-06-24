const MongoClient = require('mongodb').MongoClient;
const collection = 'budget';

class Budget {
    constructor() {
        this.dbPromise = null;
    }

    getDb() {
        if (!this.dbPromise) {
            this.dbPromise = MongoClient.connect(process.env.mongouri);
        }
        return this.dbPromise;
    }

    getResetBudgetSheet(userId) {
        return {
            _id: userId,
            balance: 120.80,
            transactions: []
        };
    }

    getCollection() {
        return this.getDb()
            .then(d => d.collection(collection));
    }

    getTransactions(userId) {
        return this.getCollection()
            .then(c => c.findOne({_id: userId}))
            .then(doc => doc || this.getResetBudgetSheet(userId));
    }

    canBuy(userId, price) {
        return this.getTransactions(userId)
            .then(trans => trans.balance >= price);
    }

    bought(userId, description, price) {
        if (isNaN(price)) {
            console.error(price);
            return Promise.reject('`Price` isn\'t a proper number.');
        }

        return Promise.all([
            this.getCollection(),
            this.getTransactions(userId)
        ])
            .then(([col, trans]) => {
                const cleanPrice = parseFloat(price);
                trans.transactions.push({
                    description: description,
                    price: cleanPrice
                });
                trans.balance -= cleanPrice;
                return col.update({_id: userId}, trans, {upsert: true})
                    .then(() => trans.balance.toFixed(2));
            });
    }

    balance(userId) {
        return this.getTransactions(userId)
            .then(t => t.balance.toFixed(2));
    }

    resetBudget(userId) {
        return this.getCollection()
            .then(c => c.update({_id: userId}, this.getResetBudgetSheet(userId), {upsert: true}));
    }
}

module.exports = new Budget();

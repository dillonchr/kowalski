const SimpleDb = require('../utils/simple-db');

class Paycheck extends SimpleDb {
    constructor() {
        const id = 'paycheck';
        super(id);
        this.id = id;
        this.resetListeners = [];
    }

    //    do match on balance each time
    getDefaultDocument(balance = 2656.65) {
        return {
            _id: this.id,
            balance: balance,
            transactions: []
        };
    }

    getTransactions() {
        return this.getDocumentById(this.id)
            .then(doc => doc || this.getDefaultDocument());
    }

    pay(price) {
        if (isNaN(price)) {
            const newPrice = price
                .split(',')
                .find(p => !isNaN(p));
            if (!newPrice) {
                console.error(price);
                return Promise.reject(`\`${price}\` isn\'t a proper amount.`);
            }
            price = newPrice;
        }

        return this.getTransactions()
            .then(doc => {
                const cleanPrice = parseFloat(price);
                doc.transactions.push(cleanPrice);
                return this.saveDocument(doc)
                    .then(() => this.balance());
            });
    }

    balance() {
        return this.getTransactions()
            .then(doc => doc.transactions.reduce((sum, price) => sum - price, doc.balance * 0.9))
            .then(bal => bal.toFixed(2));
    }

    addResetListener(callback) {
        this.resetListeners.push(callback);
    }

    onReset(balance) {
        this.resetListeners.forEach(cb => {
            try {
                cb(balance);
            } catch (handlerError) {
                console.error('Paycheck.onResetHandler error', handlerError);
            }
        });
    }

    reset(balance) {
        if (!balance) {
            balance = 2656.65;
        }
        const resetDoc = this.getDefaultDocument(balance);
        return this.saveDocument(resetDoc)
            .then(() => {
                this.onReset(balance);
                return this.balance();
            });
    }
}

module.exports = Paycheck;

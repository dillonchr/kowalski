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
            console.error(price);
            return Promise.reject(`\`${price}\` isn\'t a proper amount.`);
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

    onReset() {
        this.resetListeners.forEach(cb => {
            try {
                cb();
            } catch (handlerError) {
                console.error('Paycheck.onResetHandler error', handlerError);
            }
        });
    }

    reset(balance) {
        const resetDoc = this.getDefaultDocument(balance || 2656.65);
        return this.saveDocument(resetDoc)
            .then(() => {
                this.onReset();
                return this.balance();
            });
    }
}

module.exports = Paycheck;

const SimpleDb = require('../utils/simple-db');

class Paycheck extends SimpleDb {
    constructor() {
        const id = 'paycheck';
        super(id);
        this.id = id;
    }

    //    do match on balance each time
    getDefaultDocument(balance = 2656.65) {
        return {
            _id: this.id,
            balance,
            transactions: []
        };
    }

    getTransactions() {
        return this.getDocumentById(this.id)
            .then(doc => doc || this.getDefaultDocument());
    }

    pay(price) {
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
            .then(doc => doc.transactions
                .reduce((sum, price) => sum - price, doc.balance - 200)
                .toFixed(2)
            );
    }

    reset(balance) {
        return this.saveDocument(this.getDefaultDocument(balance))
            .then(() => this.balance());
    }
}

module.exports = new Paycheck();

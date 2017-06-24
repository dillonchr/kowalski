const SimpleDb = require('../utils/simple-db');

class Budget extends SimpleDb {
    constructor() {
        super('budget');
        this.paycheckInstance = null;
    }

    set paycheck(p) {
        this.paycheckInstance = p;
        this.paycheckInstance.addResetListener(() => this.onPaycheckReset());
    }

    onPaycheckReset() {
        const docTemplate = this.getDefaultDocument('');
        delete docTemplate._id;
        return this.resetAllDocuments(docTemplate);
    }

    getDefaultDocument(userId) {
        return {
            _id: userId,
            transactions: []
        };
    }

    getTransactions(userId) {
        return this.getDocumentById(userId)
            .then(doc => doc || this.getDefaultDocument(userId));
    }

    canBuy(userId, price) {
        return this.balance(userId)
            .then(bal => bal >= price);
    }

    bought(userId, description, price) {
        if (isNaN(price)) {
            console.error(price);
            return Promise.reject('`Price` isn\'t a proper number.');
        }

        return this.getTransactions(userId)
            .then(trans => {
                trans.transactions.push({
                    description: description,
                    price: parseFloat(price)
                });
                return this.saveDocument(trans)
                    .then(() => this.balance(userId));
            });
    }

    balance(userId) {
        return Promise.all([
            this.paycheckInstance.getTransactions(),
            this.getTransactions(userId)
        ])
            .then(([paycheck, user]) => user.transactions.reduce((sum, t) => sum - t.price, paycheck.balance/20))
            .then(t => t.toFixed(2));
    }

    resetBudget(userId) {
        return this.saveDocument(this.getDefaultDocument(userId));
    }
}

module.exports = Budget;

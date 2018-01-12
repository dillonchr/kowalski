const SimpleDb = require('../utils/simple-db');
//  amount given to us each paycheck
const BUDGET_BASE_BALANCE = 100;

class Budget extends SimpleDb {
    constructor() {
        super('budget');
    }

    onPaycheckReset() {
        return this.getAllDocuments()
            .then(docs => {
                return Promise.all(docs.map(doc => {
                    const bal = this.getRemainingBalanceForUser(doc.transactions);
                    doc.transactions = [];
                    if (bal > 0) {
                        doc.transactions.push({
                            description: 'Rollover balance',
                            price: bal * -1
                        });
                    }
                    return this.saveDocument(doc);
                }));
            });
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

    bought(userId, price, description) {
        if (isNaN(price)) {
            if (!isNaN(description) && description === 0) {
                const oldDescription = description;
                description = price;
                price = oldDescription;
            } else {
                console.error(price);
                return Promise.reject('`Price` isn\'t a proper number.');
            }
        }

        return this.getTransactions(userId)
            .then(trans => {
                trans.transactions.push({
                    description,
                    price: parseFloat(price)
                });
                return this.saveDocument(trans)
                    .then(() => this.balance(userId));
            });
    }

    getRemainingBalanceForUser(transactions) {
        return transactions
            .reduce((sum, t) => sum - t.price, BUDGET_BASE_BALANCE)
            .toFixed(2);
    }

    balance(userId) {
        return this.getTransactions(userId)
            .then(user => {
                return {
                    bal: this.getRemainingBalanceForUser(user.transactions),
                    trans: user.transactions
                };
        });
    }
}

module.exports = new Budget();

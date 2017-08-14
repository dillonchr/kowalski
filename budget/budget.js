const SimpleDb = require('../utils/simple-db');

class Budget extends SimpleDb {
    constructor() {
        super('budget');
        this.paycheckInstance = null;
    }

    set paycheck(p) {
        this.paycheckInstance = p;
        this.paycheckInstance.addResetListener(this.onPaycheckReset.bind(this));
    }

    onPaycheckReset(newBalance) {
        this.getAllDocuments()
            .then(docs => {
                return Promise.all(docs.map(doc => {
                    const bal = this.getRemainingBalanceForUser(doc.transactions, newBalance);
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

    bought(userId, description, price) {
        if (isNaN(price)) {
            if (!isNaN(description) && description > 0) {
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
                    description: description,
                    price: parseFloat(price)
                });
                return this.saveDocument(trans)
                    .then(() => this.balance(userId));
            });
    }

    getRemainingBalanceForUser(transactions, wagepacket) {
        return transactions
            .reduce((sum, t) => sum - t.price, wagepacket/20)
            .toFixed(2);
    }

    balance(userId) {
        return Promise.all([
            this.paycheckInstance.getTransactions(),
            this.getTransactions(userId)
        ])
            .then(([paycheck, user]) => {
                const bal = this.getRemainingBalanceForUser(user.transactions, paycheck.balance);
                return {
                    bal: bal,
                    trans: user.transactions
                };
        });
    }
}

module.exports = Budget;

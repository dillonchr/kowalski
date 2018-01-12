const component = require('./paycheck');

describe('Paycheck', () => {
    test('exists', () => {
        expect(component).toBeDefined();
        expect(component.id).toBe('paycheck');
    });

    test('default document should have correct default price', () => {
        expect(component.getDefaultDocument().balance)
            .toBe(2656.65);
    });

    test('default document should accept new balance', () => {
        expect(component.getDefaultDocument(34.56).balance)
            .toBe(34.56);
    });

    test('get transaction', () => {
        expect.assertions(1);
        const dummy = {};
        spyOn(component, 'getDocumentById').and.returnValue(Promise.resolve(dummy));
        component.getTransactions()
            .then(d => {
                expect(d).toBe(dummy);
            });
    });

    test('get balance', () => {
        expect.assertions(1);
        spyOn(component, 'getTransactions').and.returnValue(Promise.resolve({
            balance: 100,
            transactions: [0]
        }));
        component.balance()
            .then(b => {
                expect(b).toBe('-100.00');
            });
    });

    test('pay with number', () => {
        expect.assertions(1);
        component.getTransactions = jest.fn(() => Promise.resolve({transactions:[]}));
        component.saveDocument = jest.fn(() => Promise.resolve());
        component.balance = jest.fn(() => {});
        component.pay('12.34')
            .then(() => {
                expect(component.saveDocument).toBeCalledWith({transactions:[12.34]});
            });
    });

    test('reset', () => {
        expect.assertions(2);
        component.saveDocument = jest.fn(doc => {
            expect(doc.balance).toBe(1234.56);
            return Promise.resolve({});
        });
        component.balance = jest.fn(() => Promise.resolve());
        component.reset(1234.56)
            .then(response => {
                expect(component.saveDocument).toBeCalled();
            });
    });
});

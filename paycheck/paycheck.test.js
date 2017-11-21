const Paycheck = require('./paycheck');
let component;

describe('Paycheck', () => {
    beforeEach(() => {
        component = new Paycheck();
    });

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

    test('get balance', () => {
        expect.assertions(1);
        spyOn(component, 'getTransactions').and.returnValue(Promise.resolve({
            balance: 100,
            transactions: [0]
        }));
        component.balance()
            .then(b => {
                expect(b).toBe('90.00');
            });
    });

    test('add resetListener', () => {
        const c = jest.fn();
        component.addResetListener(c);
        expect(component.resetListeners.pop()).toBe(c);
    });

    test('reset listeners fire after close', () => {
        const c = jest.fn();
        component.addResetListener(c);
        expect(c).not.toBeCalled();
        component.onReset();
        expect(c).toBeCalled();
    });

    test('reset listeners gracefully fail', () => {
        const c = jest.fn(() => { throw new Error('test'); });
        component.addResetListener(c);
        component.onReset();
        expect(c).toBeCalled();
    });

    test('reset', () => {
        expect.assertions(3);
        component.saveDocument = jest.fn(doc => {
            expect(doc.balance).toBe(1234.56);
            return Promise.resolve({});
        });
        component.onReset = jest.fn();
        component.balance = jest.fn(() => Promise.resolve());
        component.reset(1234.56)
            .then(response => {
                expect(component.saveDocument).toBeCalled();
                expect(component.onReset).toBeCalled();
            })
    });
});

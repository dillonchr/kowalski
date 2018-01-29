const MongoClient = require('mongodb').MongoClient;
const Raven = require('raven');

class SimpleDb {
    constructor(collectionName) {
        this.dbPromise = null;
        this.collection = collectionName;
    }

    getDb() {
        if (!this.dbPromise) {
            this.dbPromise = MongoClient.connect(process.env.mongouri);
        }
        return this.dbPromise;
    }

    getCollection() {
        return this.getDb()
            .then(d => d.collection(this.collection))
            .catch(err => {
                Raven.context(() => {
                    Raven.setContext({
                        module: {
                            name: 'db',
                            cmd: 'get-collection'
                        }
                    });
                    Raven.captureException(err);
                });
            });
    }

    getDocumentById(id) {
        return this.getCollection()
            .then(c => c.findOne({_id: id}))
            .catch(err => {
                Raven.context(() => {
                    Raven.setContext({
                        module: {
                            name: 'db',
                            cmd: 'get-doc-by-id'
                        }
                    });
                    Raven.captureException(err);
                });
            });
    }

    saveDocument(doc, searchPredicate) {
        searchPredicate = searchPredicate || {_id: doc._id};
        return this.getCollection()
            .then(c => c.update(searchPredicate, doc))
            .catch(err => {
                Raven.context(() => {
                    Raven.setContext({
                        module: {
                            name: 'db',
                            cmd: 'save-doc'
                        }
                    });
                    Raven.captureException(err);
                });
            });
    }

    saveMany(docs) {
        return this.getCollection()
            .then(c => c.insertMany(docs))
            .catch(err => {
                Raven.context(() => {
                    Raven.setContext({
                        module: {
                            name: 'db',
                            cmd: 'save-many'
                        }
                    });
                    Raven.captureException(err);
                });
            });
    }

    getAllDocuments() {
        return this.getCollection()
            .then(c => c.find().toArray())
            .catch(err => {
                Raven.context(() => {
                    Raven.setContext({
                        module: {
                            name: 'db',
                            cmd: 'get-all-docs'
                        }
                    });
                    Raven.captureException(err);
                });
            });
    }

    removeAllDocuments(template) {
        return this.getCollection()
            .then(c => c.remove({}))
            .catch(err => {
                Raven.context(() => {
                    Raven.setContext({
                        module: {
                            name: 'db',
                            cmd: 'remove-all-docs'
                        }
                    });
                    Raven.captureException(err);
                });
            });
    }
}

module.exports = SimpleDb;

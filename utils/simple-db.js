const MongoClient = require('mongodb').MongoClient;

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
            .then(d => d.collection(this.collection));
    }

    getDocumentById(id) {
        return this.getCollection()
            .then(c => c.findOne({_id: id}));
    }

    saveDocument(doc, searchPredicate) {
        searchPredicate = searchPredicate || {_id: doc._id};
        return this.getCollection()
            .then(c => c.update(searchPredicate, doc));
    }

    saveMany(docs) {
        return this.getCollection()
            .then(c => c.insertMany(docs));
    }

    getAllDocuments() {
        return this.getCollection()
            .then(c => c.find().toArray());
    }

    removeAllDocuments(template) {
        return this.getCollection()
            .then(c => c.remove({}));
    }
}

module.exports = SimpleDb;

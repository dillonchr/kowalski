const request = require('request-promise-native');
const API_KEY = 'DillonCh-4ce2-442c-b779-8d0905e2d5e4';
const REGEX = {
    AUDIOBOOK: /audiobook|[^\w]cd[^\w]|cds/i,
    LEATHER: /[^\w]leather|deluxe/i,
    LOT: /[^\w]set[^\w]|lot of|[^\w]lot[^\w]/i,
    SIGNED: /signed|inscribed|autograph/i
};
const SELLING_STATUSES = {
    SOLD: 'EndedWithSales',
    LIVE: 'Active'
};
const sellingStatuses = Object.keys(SELLING_STATUSES)
    .map(k => SELLING_STATUSES[k]);

class Searcher {
    search(query) {
        return Promise.all([
            this.searchSoldListings(query),
            this.searchLiveListings(query)
        ])
            .then(([sold, live]) => {
                return sold.concat(live)
                    .sort(function (a, b) {
                        return b.price - a.price;
                    });
            });
    }

    buildApiUrl({controller, filters = [], q}) {
        filters.unshift({
            name: 'HideDuplicateItems',
            value: 'true'
        });
        filters.map((f, i) => {
            const v = `&itemFilter(${i + 1})`;
            return `${v}.name=${f.name}${v}.value=${f.value}`;
        });
        return `http://svcs.ebay.com/services/search/FindingService/v1?callback=fn&OPERATION-NAME=${controller}&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${API_KEY}&GLOBAL-ID=EBAY-US&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD${filters.join('')}&paginationInput.entriesPerPage=100&sortOrder=PricePlusShippingHighest&categoryId=267&keywords=${encodeURIComponent(q)}`;
    }

    apiFetch(options) {
        return request(this.buildApiUrl(options))
            .then(r => {
                const data = r.trim();
                const len = data.length;
                const start = 7;
                const json = data.substr(7, len - (start + 1));
                return JSON.parse(json);
            })
            .then(this.transformEbayResponse.bind(this));
    }

    transformEbayResponse(listings) {
        //  their JSON is all wrapped in single item arrays :/
        const firstKey = Object.keys(listings)[0];
        const resultSet = listings[firstKey][0].searchResult[0].item;
        return resultSet
            .filter(l => !!l.galleryURL && l.galleryURL.length && sellingStatuses.indexOf(l.sellingStatus[0].sellingState[0]) !== -1)
            .map(l => {
                const title = l.title[0];
                const price = Math.round(parseFloat(l.sellingStatus[0].convertedCurrentPrice[0].__value__));

                return {
                    about: title,
                    price: price,
                    image: l.galleryURL[0],
                    sold: SELLING_STATUSES.SOLD === l.sellingStatus[0].sellingState[0],
                    url: l.viewItemURL[0],
                    date: ~~(new Date(l.listingInfo[0].endTime[0]).getTime() / 1000)
                };
            });
    }

    searchSoldListings(query) {
        return this.apiFetch({
            controller: 'findCompletedItems',
            q: query,
            filters: [
                {
                    name: 'SoldItemsOnly',
                    value: 'true'
                }
            ]
        });
    }

    searchLiveListings(query) {
        return this.apiFetch({
            q: query,
            controller: 'findItemsAdvanced'
        });
    }
}

module.exports = Searcher;
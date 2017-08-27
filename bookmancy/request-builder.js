const getDom = require('../utils/getDom');

function transformApiResponse(document) {
    const searchResults = Array.from(document.querySelectorAll('.cf.result'));

    function getItemProp(name, el) {
        const metaTag = el.querySelector('meta[itemprop="' + name + '"]');
        return metaTag && metaTag.getAttribute('content');
    }

    function getItemPrice(el) {
        return el.querySelector('.item-price .price')
            .innerHTML
            .substr(4);
    }

    function getItemShipping(el) {
        const shipping = el.querySelector('.shipping .price');
        return shipping && shipping.textContent.substr(4) + ' s/h';
    }

    function getItemImage(el) {
        const img = el.querySelector('.result-image img');
        if (el.querySelector('.no-book-image') || !img) {
            return null;
        }
        return img.src;
    }

    return searchResults
        .map(el => ({
                year: getItemProp('datePublished', el),
                about: getItemProp('about', el),
                price: getItemPrice(el),
                shipping: getItemShipping(el),
                image: getItemImage(el)
            })
        );
}

function buildUrl(options) {
    let url = 'https://www.abebooks.com/servlet/SearchResults?bx=off&ds=50&recentlyadded=all&sortby=17&sts=t';
    if (options.publisher) {
        url += '&pn=' + encodeURIComponent(options.publisher);
    }
    if (options.author) {
        url += '&an=' + encodeURIComponent(options.author);
    }
    if (options.title) {
        url += '&tn=' + encodeURIComponent(options.title);
    }
    if (!!options.year && !isNaN(options.year) && options.year.length === 4) {
        url += '&yrh=' + encodeURIComponent(options.year);
    }
    let format = '0';
    if (options.format) {
        if (/hardcover|hardback|^hb$|^hc$|^h$/i.test(options.format)) {
            format = 'h';
        } else if (/softcover|paperback|^pb$|^p$|^s$/i.test(options.format)) {
            format = 's';
        }
    }
    url += '&bi=' + format;
    return url;
}

module.exports = options => {
  const url = buildUrl(options);
  return getDom(url)
    .then(transformApiResponse)
    .then(l => ({url: url, results: l}));
};

const percentages = [{"year":1914,"percentage":10},{"year":1915,"percentage":10.1},{"year":1916,"percentage":10.3},{"year":1917,"percentage":11.6},{"year":1918,"percentage":13.7},{"year":1919,"percentage":16.5},{"year":1920,"percentage":18.9},{"year":1921,"percentage":19.4},{"year":1922,"percentage":17.3},{"year":1923,"percentage":16.9},{"year":1924,"percentage":17.3},{"year":1925,"percentage":17.3},{"year":1926,"percentage":17.9},{"year":1927,"percentage":17.7},{"year":1928,"percentage":17.3},{"year":1929,"percentage":17.1},{"year":1930,"percentage":17.2},{"year":1931,"percentage":16.1},{"year":1932,"percentage":14.6},{"year":1933,"percentage":13.1},{"year":1934,"percentage":13.2},{"year":1935,"percentage":13.4},{"year":1936,"percentage":13.8},{"year":1937,"percentage":14},{"year":1938,"percentage":14.4},{"year":1939,"percentage":14},{"year":1940,"percentage":14},{"year":1941,"percentage":14.1},{"year":1942,"percentage":15.5},{"year":1943,"percentage":16.9},{"year":1944,"percentage":17.4},{"year":1945,"percentage":17.8},{"year":1946,"percentage":18.2},{"year":1947,"percentage":21.5},{"year":1948,"percentage":23.4},{"year":1949,"percentage":24.1},{"year":1950,"percentage":23.6},{"year":1951,"percentage":25},{"year":1952,"percentage":26.5},{"year":1953,"percentage":26.7},{"year":1954,"percentage":26.9},{"year":1955,"percentage":26.7},{"year":1956,"percentage":26.8},{"year":1957,"percentage":27.6},{"year":1958,"percentage":28.4},{"year":1959,"percentage":28.9},{"year":1960,"percentage":29.4},{"year":1961,"percentage":29.8},{"year":1962,"percentage":30},{"year":1963,"percentage":30.4},{"year":1964,"percentage":30.9},{"year":1965,"percentage":31.2},{"year":1966,"percentage":31.8},{"year":1967,"percentage":32.9},{"year":1968,"percentage":33.9},{"year":1969,"percentage":35.5},{"year":1970,"percentage":37.7},{"year":1971,"percentage":39.8},{"year":1972,"percentage":41.1},{"year":1973,"percentage":42.5},{"year":1974,"percentage":46.2},{"year":1975,"percentage":51.9},{"year":1976,"percentage":55.5},{"year":1977,"percentage":58.2},{"year":1978,"percentage":62.1},{"year":1979,"percentage":67.7},{"year":1980,"percentage":76.7},{"year":1981,"percentage":86.3},{"year":1982,"percentage":94},{"year":1983,"percentage":97.6},{"year":1984,"percentage":101.3},{"year":1985,"percentage":105.3},{"year":1986,"percentage":109.3},{"year":1987,"percentage":110.5},{"year":1988,"percentage":115.4},{"year":1989,"percentage":120.5},{"year":1990,"percentage":126.1},{"year":1991,"percentage":133.8},{"year":1992,"percentage":137.9},{"year":1993,"percentage":141.9},{"year":1994,"percentage":145.8},{"year":1995,"percentage":149.7},{"year":1996,"percentage":153.5},{"year":1997,"percentage":158.6},{"year":1998,"percentage":161.3},{"year":1999,"percentage":163.9},{"year":2000,"percentage":168.3},{"year":2001,"percentage":174},{"year":2002,"percentage":176.7},{"year":2003,"percentage":180.9},{"year":2004,"percentage":184.3},{"year":2005,"percentage":190.3},{"year":2006,"percentage":196.8},{"year":2007,"percentage":201.8},{"year":2008,"percentage":210.036},{"year":2009,"percentage":210.228},{"year":2010,"percentage":215.949},{"year":2011,"percentage":219.179},{"year":2012,"percentage":225.672},{"year":2013,"percentage":229.601},{"year":2014,"percentage":233.049},{"year":2015,"percentage":234.812},{"year":2016,"percentage":236.525},{"year":2017,"percentage":241.432}];
const currentPercentage = 241.432;

module.exports = c => {
    c.hears(['how much was '], 'direct_message,direct_mention,ambient', (b, m) => {
        function whisper(text) {
            b.reply(m, {response_type: 'ephemeral', text});
        }

        const matches = m.text.match(/\$([\d\.]+) in (\d{4})$/i);
        if (matches && matches.length === 3) {
            const [ignore, dollars, year] = matches;
            const percentage = percentages.find(p => p.year === +year);
            if (percentage) {
                const value = (dollars * (currentPercentage / percentage.percentage)).toFixed(2);
                whisper(`$${dollars} was worth *$${value}* in ${year}`)
            } else {
                whisper(`I don't know what the rate was for ${year}.`);
            }
        } else if (['direct_mention','direct_message'].includes(m.event)) {
            whisper(`I didn't understand your query man.`);
        }
    });
}
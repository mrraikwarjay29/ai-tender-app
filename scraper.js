const puppeteer = require('puppeteer');

async function scrapeTenders() {

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });

    const page = await browser.newPage();

    await page.goto('https://quotes.toscrape.com/', {
        waitUntil: 'domcontentloaded'
    });

    const tenders = await page.evaluate(() => {

        const items = document.querySelectorAll('.quote');
        let results = [];

        items.forEach(item => {

            const title = item.querySelector('.text')?.innerText || "";
            const author = item.querySelector('.author')?.innerText || "";

            let score = 0;
            const text = title.toLowerCase();

            if (text.includes("life")) score += 20;
            if (text.includes("love")) score += 25;
            if (text.includes("truth")) score += 15;
            if (text.includes("is")) score += 5;

            results.push({
                title,
                value: Math.floor(Math.random() * 1000000),
                location: author,
                score
            });
        });

        return results;
    });

    // Sort
    tenders.sort((a, b) => b.score - a.score);

    console.log("🔥 FINAL SORTED TENDERS:");
    console.log(tenders);

    // await browser.close();
}

scrapeTenders();
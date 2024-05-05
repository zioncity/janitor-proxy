const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

// True when test in Github, when run for in VPS should be false
const headless = process.env.NODE_ENV !== 'production'

console.log(`Running in env ${process.env.NODE_ENV} with headless: ${headless}`)

let chromiumContext = undefined;
let janitorPage = undefined;

async function getChromiumPage() {
    if (!chromiumContext) {
        const browser = await chromium.launch({
            headless,
        });
        chromiumContext = await browser.newContext();
    }

    try {
        const page = await chromiumContext.newPage();
        return page;
    } catch (err) {
        // Try again by creating a new context, maybe the page/content is closed
        // browserContext.newPage: Target page, context or browser has been closed

        console.error(err);
        const browser = await chromium.launch({
            headless,
        });
        chromiumContext = await browser.newContext();
        const page = await chromiumContext.newPage();
        return page;
    }
}

async function getJanitorPage() {
    if (janitorPage) {
        return janitorPage;
    }

    const page = await getChromiumPage();
    await page.goto(`https://janitorai.com`, { waitUntil: 'domcontentloaded' });
    janitorPage = page;

    return janitorPage;
}

function getImgType(fileName) {
    // Extract the file extension from the URL
    const extname = fileName.split(".").pop();
    const contentType =
        {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            avif: "image/avif",
            tiff: "image/tiff",
        }[extname] || "image/jpeg";

    return contentType;
}

async function getImageBase64(folder, fileName) {
    const page = await getChromiumPage();
    const imgType = getImgType(fileName);

    await page.goto(`https://pics.janitorai.com/${folder}/${fileName}`, { waitUntil: 'domcontentloaded' });
    const image = page.locator("img").nth(0);

    const imageData = await image.evaluate((element, imgType) => {
        var cnv = document.createElement("canvas");
        cnv.width = element.naturalWidth;
        cnv.height = element.naturalHeight;
        cnv
            .getContext("2d")
            .drawImage(element, 0, 0, element.naturalWidth, element.naturalHeight);
        return cnv.toDataURL(imgType, 0.8).substring(22);
    }, imgType, { timeout: 3_000 });
    page.close();
    return imageData;
}

async function getCharacters(pageNumber) {
    console.log("Getting characters from page " + pageNumber);
    const page = await getJanitorPage();

    const rs = await page.evaluate(async ({ page }) => {
        const result = await fetch(`https://kim.janitorai.com/characters?page=${page}&mode=all&sort=latest`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-GB,en;q=0.9",
                "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-app-version": "2024-03-22.644ecae"
            },
            "referrerPolicy": "same-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        const json = await result.json();
        return json;
    }, {
        page: pageNumber
    })

    // Do not close page, lol
    return rs;
}

async function getPopularCharacters(pageNumber) {
    console.log("Getting characters from page " + pageNumber);
    const page = await getJanitorPage();

    const rs = await page.evaluate(async ({ page }) => {
        const result = await fetch(`https://kim.janitorai.com/characters?page=${page}&mode=all&sort=popular`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-GB,en;q=0.9",
                "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-app-version": "2024-03-22.644ecae"
            },
            "referrerPolicy": "same-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        const json = await result.json();
        return json;
    }, {
        page: pageNumber
    })

    // Do not close page, lol
    return rs;
}

async function getCharacterV2(token, id) {
    console.log("Getting character by id v2 " + id);
    const page = await getJanitorPage();

    const rs = await page.evaluate(async ({ characterId, token }) => {
        const result = await fetch(`https://kim.janitorai.com/characters/${characterId}`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-GB,en;q=0.9",
                "authorization": `Bearer ${token}`,
                "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-app-version": "2024-03-22.644ecae"
            },
            "referrerPolicy": "same-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        const json = await result.json();
        return json;
    }, {
        characterId: id,
        token: token
    })

    // Do not close page, lol
    return rs;
}

module.exports = {
    getImageBase64,
    getImgType,
    getCharacters,
    getPopularCharacters,
    getCharacterV2
}
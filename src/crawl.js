const { chromium } = require("playwright-extra");
const { exec } = require('child_process');
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

// True when test in Github, when run for in VPS should be false
const headless = process.env.NODE_ENV !== 'production'

console.log(`Running in env ${process.env.NODE_ENV} with headless: ${headless}`)

const APP_VERSION_HEADER = 'x-app-version'
const JANITOR_APP_VERSION = '2024-06-06.9b14808b'

const headers = {
    APP_VERSION_HEADER,
    JANITOR_APP_VERSION
}

let chromiumContext = undefined;
let janitorPage = undefined;
let browser = undefined

async function newChromiumPage() {
    if (!chromiumContext) {
        browser = await chromium.launch({
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
        browser = await chromium.launch({
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

    const page = await newChromiumPage();
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
    const page = await newChromiumPage();
    const imgType = getImgType(fileName);

    await page.goto(`https://ella.janitorai.com/${folder}/${fileName}?width=1000`, { waitUntil: 'domcontentloaded' });
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

    const rs = await page.evaluate(async ({ page, headers: {APP_VERSION_HEADER, JANITOR_APP_VERSION} }) => {
        const result = await fetch(`https://janitorai.com/hampter/characters?page=${page}&mode=all&sort=latest`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-GB,en;q=0.9",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                [APP_VERSION_HEADER]: JANITOR_APP_VERSION
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
        page: pageNumber,
        headers
    })

    // Do not close page, lol
    return rs;
}

async function getPopularCharacters(pageNumber) {
    console.log("Getting characters from page " + pageNumber);
    const page = await getJanitorPage();

    const rs = await page.evaluate(async ({ page, headers: {APP_VERSION_HEADER, JANITOR_APP_VERSION} }) => {
        const result = await fetch(`https://janitorai.com/hampter/characters?page=${page}&mode=all&sort=popular`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-GB,en;q=0.9",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                [APP_VERSION_HEADER]: JANITOR_APP_VERSION
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
        page: pageNumber,
        headers
    })

    // Do not close page, lol
    return rs;
}

async function getCharacter(token, id) {
    console.log("Getting character by id v2 " + id);
    const page = await getJanitorPage();

    const rs = await page.evaluate(async ({ characterId, token, headers: {APP_VERSION_HEADER, JANITOR_APP_VERSION} }) => {
        const result = await fetch(`https://janitorai.com/hampter/characters/${characterId}`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-GB,en;q=0.9",
                "authorization": `Bearer ${token}`,
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                [APP_VERSION_HEADER]: JANITOR_APP_VERSION
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
        token: token,
        headers
    })

    // Do not close page, lol
    return rs;
}

async function getCreatorProfile(id) {
    console.log("Getting creator by id v2 " + id);
    const page = await getJanitorPage();

    const rs = await page.evaluate(async ({ profileId, headers: {APP_VERSION_HEADER, JANITOR_APP_VERSION} }) => {
        const result = await fetch(`https://janitorai.com/hampter/profiles/${profileId}`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-GB,en;q=0.9",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                [APP_VERSION_HEADER]: JANITOR_APP_VERSION
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
        profileId: id,
        headers
    })

    // Do not close page, lol
    return rs;
}

async function cleanup() {
    console.log('start cleanup chrome')
    exec('pkill -f chromium');
    console.log('finish cleanup chrome')

    janitorPage = undefined;
    chromiumContext = undefined;
    browser = undefined;
}

module.exports = {
    getImageBase64,
    getImgType,
    getCharacters,
    getPopularCharacters,
    getCharacter,
    getCreatorProfile,
    cleanup
}
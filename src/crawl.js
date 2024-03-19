const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

// True when test in Github, when run for in VPS should be false
const headless = process.env.NODE_ENV !== 'production'

console.log(`Running in env ${process.env.NODE_ENV} with headless: ${headless}`)

let chromiumContext = undefined;
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
    }, imgType, { timeout: 5_000 });
    page.close();
    return imageData;
}

async function getCharacters(pageNumber) {
    console.log("Getting characters from page " + pageNumber);
    const page = await getChromiumPage();
    await page.goto(`https://kim.janitorai.com/characters?page=${pageNumber}&mode=all&sort=latest`, { waitUntil: 'domcontentloaded' });

    try {
        const htmlString = await page.content();
        const matches = htmlString.match(/\{.*\}/s);
        if (matches) {
            const jsonString = matches[0];
            const result = JSON.parse(jsonString);
            if (result.data) {
                return result;
            } else {
                console.error(htmlString);
            }
        } else {
            console.error(htmlString);
        }
    } finally {
        page.close();
    }
}

async function getCharacter(id) {
    console.log("Getting character by id " + id);
    const page = await getChromiumPage();
    await page.goto(`https://kim.janitorai.com/characters/${id}`, { waitUntil: 'domcontentloaded' });

    try {
        const htmlString = await page.content();
        const matches = htmlString.match(/\{.*\}/s);
        if (matches) {
            const jsonString = matches[0];
            const result = JSON.parse(jsonString);
            if (result.id) {
                return result;
            } else {
                console.error(htmlString);
            }
        } else {
            console.error(htmlString);
        }
    } finally {
        page.close();
    }
}

module.exports = {
    getImageBase64,
    getImgType,
    getCharacters,
    getCharacter
}
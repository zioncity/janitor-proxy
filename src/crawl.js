const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

let chromiumContext = undefined;
async function getChromiumPage() {
    if (!chromiumContext) {
        const browser = await chromium.launch({
            headless: false,
        });
        chromiumContext = await browser.newContext();
    }

    const page = await chromiumContext.newPage();
    return page;
}

async function getImageBase64(folder, fileName) {
    const page = await getChromiumPage();

    await page.goto(`https://pics.janitorai.com/${folder}/${fileName}`, { waitUntil: 'domcontentloaded' });
    const image = page.locator("img").nth(0);
    const imageData = await image.evaluate((element) => {
        var cnv = document.createElement("canvas");
        cnv.width = element.naturalWidth;
        cnv.height = element.naturalHeight;
        cnv
            .getContext("2d")
            .drawImage(element, 0, 0, element.naturalWidth, element.naturalHeight);
        return cnv.toDataURL().substring(22);
    });
    page.close();
    return imageData;
}

module.exports = {
    getImageBase64
}
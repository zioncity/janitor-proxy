const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

let chromiumPage = undefined;
async function getChromiumPage() {
    if (chromiumPage) {
        return chromiumPage;
    }

    const browser = await chromium.launch({
        headless: true,
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    chromiumPage = page;
    return page;
}

async function getImageBase64(fileName) {
    const page = await getChromiumPage();

    await page.goto(`https://pics.janitorai.com/bot-avatars/${fileName}`);
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
    return imageData;
}

module.exports = {
    getImageBase64
}
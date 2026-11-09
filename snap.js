const puppeteer = require('./node_modules/puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 900, deviceScaleFactor: 2 });
  const fileUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  
  const el = await page.$('.benefits');
  if (el) {
    const box = await el.boundingBox();
    await page.screenshot({
      path: 'preview_benefits.png',
      clip: { x: 0, y: Math.max(0, Math.floor(box.y - 120)), width: 1300, height: Math.ceil(box.height + 220) }
    });
    console.log('Screenshot preview saved!');
  }
  await browser.close();
})();

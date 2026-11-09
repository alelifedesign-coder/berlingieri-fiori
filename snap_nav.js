const puppeteer = require('./node_modules/puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 600, deviceScaleFactor: 2 });
  const fileUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  
  await page.screenshot({
    path: 'preview_nav.png',
    clip: { x: 0, y: 0, width: 1300, height: 160 }
  });
  console.log('Nav screenshot saved!');
  await browser.close();
})();

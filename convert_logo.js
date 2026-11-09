const puppeteer = require('./node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    args: ['--no-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
  });
  const page = await browser.newPage();
  
  // Use pdfjs to render the PDF in canvas
  const pdfB64 = fs.readFileSync('berlingieri logo.pdf').toString('base64');
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js"></script>
  <style>body{margin:0;background:transparent}canvas{display:block}</style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    const data = atob("${pdfB64}");
    const arr = new Uint8Array(data.length);
    for(let i=0;i<data.length;i++) arr[i]=data.charCodeAt(i);
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    pdfjsLib.getDocument({data: arr}).promise.then(pdf => {
      return pdf.getPage(1);
    }).then(page => {
      const scale = 3;
      const vp = page.getViewport({scale});
      const canvas = document.getElementById('c');
      canvas.width = vp.width;
      canvas.height = vp.height;
      const ctx = canvas.getContext('2d');
      return page.render({canvasContext: ctx, viewport: vp}).promise.then(() => {
        window._done = true;
        window._w = vp.width;
        window._h = vp.height;
      });
    });
  </script>
</body>
</html>`;

  // Write temp html
  fs.writeFileSync('_logo_render.html', html);
  
  await page.goto(`file://${path.resolve('_logo_render.html')}`, { waitUntil: 'networkidle0' });
  
  // Wait for PDF rendering
  await page.waitForFunction('window._done === true', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 500));
  
  const dims = await page.evaluate(() => ({ w: window._w, h: window._h }));
  
  const screenshot = await page.screenshot({ 
    clip: { x: 0, y: 0, width: Math.ceil(dims.w), height: Math.ceil(dims.h) },
    type: 'png',
    omitBackground: true
  });
  
  fs.writeFileSync('berlingieri_logo.png', screenshot);
  console.log('Logo salvato! Dimensioni:', dims.w, 'x', dims.h);
  
  await browser.close();
  fs.unlinkSync('_logo_render.html');
})();

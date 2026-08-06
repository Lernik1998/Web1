const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 550, height: 250 } });
  page.on('console', m => console.log('CONSOLE:', m.text()));
  page.on('requestfailed', r => console.log('FAILED:', r.url(), r.failure()?.errorText));
  const fp = path.join(__dirname, 'test_short_iframe.html').split(path.sep).join('/');
  await page.goto('file:///' + fp);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'short_iframe_result.png' });
  await browser.close();
})();

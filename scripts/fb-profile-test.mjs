import { launch } from 'cloakbrowser';

const browser = await launch({ headless: true, humanize: true });
const page = await browser.newPage();
await page.goto('https://www.facebook.com/profile.php?id=100022757147522', { 
  waitUntil: 'networkidle', 
  timeout: 20000 
});
const title = await page.title();
console.log('Title:', title);
const text = await page.evaluate(() => document.body.innerText.substring(0, 800));
console.log('Content:', text);
await browser.close();

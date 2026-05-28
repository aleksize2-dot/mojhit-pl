import { launch } from 'cloakbrowser';

const browser = await launch({ headless: true, humanize: true });
const page = await browser.newPage();
await page.goto('https://www.facebook.com/groups/185233147769978', { 
  waitUntil: 'networkidle', 
  timeout: 20000 
});
const title = await page.title();
console.log('=== TITLE ===');
console.log(title);

const text = await page.evaluate(() => document.body.innerText.substring(0, 2000));
console.log('\n=== CONTENT ===');
console.log(text);

await browser.close();

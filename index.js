const { createProxyMiddleware } = require('http-proxy-middleware');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteerCore = require('puppeteer-core');
const express = require('express');
const app = express();

puppeteer.use(StealthPlugin());

app.get('/proxy', async (req, res) => {
  const targetUrl = decodeURIComponent(req.query.target);

  let browser;
  try {
    browser = await puppeteerCore.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });
    const cookies = await page.cookies();

    res.setHeader('set-cookie', cookies.map(cookie => `${cookie.name}=${cookie.value}; path=${cookie.path}`));
    res.redirect(targetUrl);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error accessing the target URL.');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});

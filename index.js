const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

puppeteer.use(StealthPlugin());

app.get('/proxy', async (req, res) => {
  const targetUrl = decodeURIComponent(req.query.target);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });
    const cookies = await page.cookies();

    // استخدام الكوكيز لتجاوز التحقق من الإنسان
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

// إضافة وسيط البروكسي
app.use('/proxy', createProxyMiddleware({
  target: '',
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    const targetUrl = decodeURIComponent(req.query.target);
    proxyReq.setHeader('Referer', targetUrl);
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML، مثل Gecko) Chrome/131.0.0.0 Safari/537.36');
  },
  pathRewrite: (path, req) => {
    const targetUrl = decodeURIComponent(req.query.target);
    return targetUrl.replace(/^https?:\/\/[^\/]+/, '');
  },
  router: (req) => decodeURIComponent(req.query.target),
}));

app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});

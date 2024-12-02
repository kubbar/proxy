const { createProxyMiddleware } = require('http-proxy-middleware');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chromium = require('chrome-aws-lambda');
const puppeteerCore = require('puppeteer-core');
const express = require('express');
const childProcess = require('child_process');
const app = express();

puppeteer.use(StealthPlugin());

// تثبيت مكتبات النظام اللازمة
const installDependencies = () => {
  return new Promise((resolve, reject) => {
    childProcess.exec('apt-get update && apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2', (error, stdout, stderr) => {
      if (error) {
        console.error('Error installing dependencies:', stderr);
        reject(error);
      } else {
        console.log('Dependencies installed:', stdout);
        resolve();
      }
    });
  });
};

app.get('/proxy', async (req, res) => {
  const targetUrl = decodeURIComponent(req.query.target);

  let browser;
  try {
    await installDependencies();
    const executablePath = await chromium.executablePath;

    browser = await puppeteerCore.launch({
      headless: true,
      executablePath: executablePath || '/usr/bin/google-chrome-stable',
      args: chromium.args
    });

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

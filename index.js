const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');
const https = require('https');
const url = require('url');

const app = express();
const port = process.env.PORT || 3000;

const proxyServer = 'http://206.189.135.6:3128';

// تكوين وكيل HTTP و HTTPS
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ 
  keepAlive: true,
  rejectUnauthorized: false // تجاهل أخطاء الشهادات غير الصالحة
});

// تعديل طلبات HTTP و HTTPS لاستخدام البروكسي
const oldHttpRequest = http.request;
http.request = function(options, callback) {
  if (typeof options === 'string') options = url.parse(options);
  options.agent = httpAgent;
  options.proxy = proxyServer;
  return oldHttpRequest(options, callback);
};

const oldHttpsRequest = https.request;
https.request = function(options, callback) {
  if (typeof options === 'string') options = url.parse(options);
  options.agent = httpsAgent;
  options.proxy = proxyServer;
  return oldHttpsRequest(options, callback);
};

// إنشاء وسيط البروكسي
const proxy = createProxyMiddleware({
  target: proxyServer,
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/': '/'
  },
  router: function(req) {
    return req.url.slice(1);
  },
  onProxyReq: function(proxyReq, req, res) {
    const target = req.url.slice(1);
    proxyReq.path = target;
    proxyReq.setHeader('Host', url.parse(target).host);
  },
  onError: function(err, req, res) {
    console.error('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end('Proxy Error');
  }
});

// استخدام الوسيط للمسارات التي تبدأ بـ http:// أو https://
app.use('/:protocol(http|https)://*', proxy);

// التعامل مع الطلبات غير الصالحة
app.use('*', (req, res) => {
  res.status(400).send('Invalid URL. Please use the format: /http://example.com or /https://example.com');
});

// بدء تشغيل الخادم
app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});
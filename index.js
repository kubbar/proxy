const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// إعداد وسيط البروكسي
app.use('/proxy', createProxyMiddleware({
  target: '', // سيتم استبدال الهدف لاحقاً
  changeOrigin: true,
  pathRewrite: (path, req) => {
    const targetUrl = decodeURIComponent(req.query.target);
    return targetUrl.replace(/^https?:\/\/[^\/]+/, '');
  },
  router: (req) => decodeURIComponent(req.query.target),
  onProxyReq: (proxyReq, req, res) => {
    const targetUrl = decodeURIComponent(req.query.target);
    proxyReq.setHeader('Referer', targetUrl);
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML، مثل Gecko) Chrome/131.0.0.0 Safari/537.36');
  },
  onProxyRes: (proxyRes, req, res) => {
    // إزالة الرؤوس التي قد تسبب مشاكل في التحميل
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
  },
}));

app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});
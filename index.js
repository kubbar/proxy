const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

app.use('/proxy', createProxyMiddleware({
  target: '',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    const targetUrl = decodeURIComponent(req.query.target);
    proxyReq.setHeader('Referer', targetUrl);
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML، مثل Gecko) Chrome/131.0.0.0 Safari/537.36');
    
    // نقل الكوكيز
    if (req.headers.cookie) {
      proxyReq.setHeader('cookie', req.headers.cookie);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    const cookies = proxyRes.headers['set-cookie'];
    if (cookies) {
      res.setHeader('set-cookie', cookies.map(cookie => cookie.replace(/; secure/gi, '')));
    }
  },
  router: (req) => decodeURIComponent(req.query.target),
}));

app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});

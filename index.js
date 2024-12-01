const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');

const app = express();

app.use('/proxy', createProxyMiddleware({
  target: '',
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    const targetUrl = decodeURIComponent(req.query.target);
    proxyReq.setHeader('Referer', targetUrl);
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML، مثل Gecko) Chrome/131.0.0.0 Safari/537.36');
    proxyReq.path = targetUrl;
  },
  router: (req) => decodeURIComponent(req.query.target),
}));

app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});

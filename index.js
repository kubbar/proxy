const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const HttpProxyAgent = require('http-proxy-agent');
const app = express();

const proxyUrl = 'http://206.189.135.6:3128'; // عنوان البروكسي الخاص بك
const agent = new HttpProxyAgent(proxyUrl);

app.use('/proxy', createProxyMiddleware({
  target: '',
  changeOrigin: true,
  agent: agent,
  onProxyReq: (proxyReq, req) => {
    const targetUrl = decodeURIComponent(req.query.target);
    proxyReq.setHeader('Referer', targetUrl);
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML، مثل Gecko) Chrome/131.0.0.0 Safari/537.36');
  },
  onProxyRes: (proxyRes, req, res) => {
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
  },
  router: (req) => {
    const targetUrl = decodeURIComponent(req.query.target);
    return targetUrl.split('?')[0];
  },
  pathRewrite: (path, req) => {
    const targetUrl = decodeURIComponent(req.query.target);
    return targetUrl.split('?')[1] ? '?' + targetUrl.split('?')[1] : '';
  },
  onError: (err, req, res) => {
    res.writeHead(500, {
      'Content-Type': 'text/plain',
    });
    res.end('Something went wrong. And we are reporting a custom error message.');
  },
}));

app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});

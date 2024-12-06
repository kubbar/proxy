const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// إعداد وسيط البروكسي
app.use('/proxy', createProxyMiddleware({
  target: '',
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    const targetUrl = decodeURIComponent(req.query.target);
    proxyReq.setHeader('Referer', targetUrl);
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
  },
  onProxyRes: (proxyRes, req, res) => {
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
  },
  pathRewrite: (path, req) => {
    const targetUrl = decodeURIComponent(req.query.target);
    return new URL(targetUrl).pathname + new URL(targetUrl).search;
  },
  router: (req) => {
    const targetUrl = decodeURIComponent(req.query.target);
    return new URL(targetUrl).origin;
  },
  selfHandleResponse: true,
  onProxyReqWs: (proxyReq, req, socket, options, head) => {
    proxyReq.setHeader('sec-websocket-protocol', 'base64');
  },
  onError: (err, req, res) => {
    res.writeHead(500, {
      'Content-Type': 'text/plain',
    });
    res.end('Something went wrong. And we are reporting a custom error message.');
  },
  onProxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.rejectUnauthorized = false;
    return proxyReqOpts;
  },
}));

app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});

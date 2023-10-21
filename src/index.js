const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();

// Enable CORS
app.use(cors());
app.get("/health", (_req, res) => res.sendStatus(200));

// Define the proxy middleware
const botAvatarProxy = createProxyMiddleware("/bot-avatars", {
  target: "https://pics.janitorai.com",
  changeOrigin: true,
  pathRewrite: {
    "^/bot-avatars": "/bot-avatars",
  },
  onProxyReq(proxyReq, req, res) {
    proxyReq.setHeader(
      "User-Agent",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
    );
    proxyReq.setHeader(
      "sec-ch-ua",
      `"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"`
    );
    proxyReq.setHeader("Referer", "https://www.janitorai.com");
  },
});

const avatarProxy = createProxyMiddleware("/avatars", {
  target: "https://pics.janitorai.com",
  changeOrigin: true,
  pathRewrite: {
    "^/avatars": "/avatars",
  },
  onProxyReq(proxyReq, req, res) {
    proxyReq.setHeader(
      "User-Agent",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
    );
    proxyReq.setHeader(
      "sec-ch-ua",
      `"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"`
    );
    proxyReq.setHeader("Referer", "https://www.janitorai.com");
  },
});

// Use the proxy middleware
app.use("/bot-avatars", botAvatarProxy);
app.use("/avatars", avatarProxy);

// Set Expires header for caching (adjust as needed)
app.use("/bot-avatars", (req, res, next) => {
  res.header("Cache-Control", "public, max-age=604800"); // 7 days in seconds
  next();
});
app.use("/avatars", (req, res, next) => {
  res.header("Cache-Control", "public, max-age=604800"); // 7 days in seconds
  next();
});

// Start the Express app
const port = process.env.PORT || 3000; // Change this to the desired port
app.listen(port, () => {
  console.log(`Reverse proxy server is running on port ${port}`);
});

const express = require("express");
const cors = require("cors");

const {getImageBase64 } = require('./crawl');


const app = express();

// Enable CORS
app.use(cors());
app.get("/health", (_req, res) => res.sendStatus(200));

// Set Expires header for caching (adjust as needed)
// app.use("/bot-avatars", (req, res, next) => {
//   res.header("Cache-Control", "public, max-age=604800"); // 7 days in seconds
//   next();
// });
// app.use("/avatars", (req, res, next) => {
//   res.header("Cache-Control", "public, max-age=604800"); // 7 days in seconds
//   next();
// });

app.get("/bot-avatars/:fileName", async (req, res, next) => {
  res.header("Cache-Control", "public, max-age=604800"); // 7 days in seconds

  const fileName = req.params.fileName;
  const imageData = await getImageBase64(fileName);

  // Extract the file extension from the URL
  const extname = fileName.split(".").pop();
  const contentType =
    {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      avif: "image/avif",
      tiff: "image/tiff",
    }[extname] || "application/octet-stream";

  // Set the response content type based on the file extension
  res.setHeader("Content-Type", contentType);
  // Send the image data as the response
  res.send(Buffer.from(imageData, "base64"));
});

// Start the Express app
const port = process.env.PORT || 3000; // Change this to the desired port
app.listen(port, () => {
  console.log(`Reverse proxy server is running on port ${port}`);
});

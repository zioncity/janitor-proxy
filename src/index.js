const express = require("express");
const cors = require("cors");
const { getImageBase64, getImgType } = require('./crawl');
const app = express();

// Enable CORS
app.use(cors());
app.get("/health", (_req, res) => res.sendStatus(200));

app.get("/proxy/:folder/:fileName", async (req, res, next) => {
  res.header("Cache-Control", "public, max-age=604800"); // 7 days in seconds

  const { folder, fileName } = req.params; // folder can be bot-avatars or avatars
  console.log({ folder, fileName })

  const imageData = await getImageBase64(folder, fileName);
  const contentType = getImgType(fileName);
  // Set the response content type based on the file extension
  res.setHeader("Content-Type", contentType);

  console.log('Content-Type', contentType);
  // Send the image data as the response
  res.send(Buffer.from(imageData, "base64"));
});

// Start the Express app
const port = process.env.PORT || 3000; // Change this to the desired port
app.listen(port, () => {
  console.log(`Reverse proxy server is running on port ${port}`);
});

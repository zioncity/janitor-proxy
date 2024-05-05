const express = require("express");
const cors = require("cors");
const { getImageBase64, getImgType, getCharacters, getPopularCharacters, getCharacterV2 } = require('./crawl');
const app = express();

// Enable CORS
app.use(cors());
app.get("/", (_req, res) => res.json({ status: 'ok' }));
app.get("/health", (_req, res) => res.sendStatus(200));

app.get("/proxy/:folder/:fileName", async (req, res, next) => {
  try {
    const { folder, fileName } = req.params; // folder can be bot-avatars or avatars
    console.log({ folder, fileName })

    const imageData = await getImageBase64(folder, fileName);
    const contentType = getImgType(fileName);
    // Set the response content type based on the file extension
    res.header("Cache-Control", "public, max-age=604800"); // 7 days in seconds
    res.setHeader("Content-Type", contentType);

    console.log('Content-Type', contentType);
    // Send the image data as the response
    res.send(Buffer.from(imageData, "base64"));
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
  }
});

app.get("/characters", async (req, res, next) => {
  try {
    const result = await getCharacters(req.query.page)
    res.json(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
  }
});

app.get("/v2/characters/:id", async (req, res, next) => {
  try {
    const token = req.query.token;
    const result = await getCharacterV2(token, req.params.id)
    res.json(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
  }
});

app.get("/popular/characters", async (req, res, next) => {
  try {
    const result = await getPopularCharacters(req.query.page)
    res.json(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
  }
});

// Start the Express app
const port = process.env.PORT || 3000; // Change this to the desired port
app.listen(port, () => {
  console.log(`Reverse proxy server is running on port ${port}`);
});

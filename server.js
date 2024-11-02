// server.js
const express = require('express');
const cors = require('cors');
const querystring = require('querystring');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase payload limit for large images

const client_id = process.env.VITE_SPOTIFY_CLIENT_ID;
const client_secret = process.env.VITE_SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.VITE_SPOTIFY_REDIRECT_URI;

app.get('/login', (req, res) => {
  const scope = 'user-top-read';
  const authURL = `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: 'code',
    client_id,
    scope,
    redirect_uri,
  })}`;
  res.redirect(authURL);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const token_url = 'https://accounts.spotify.com/api/token';
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirect_uri);
  params.append('client_id', client_id);
  params.append('client_secret', client_secret);

  try {
    const tokenResponse = await axios.post(token_url, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const { access_token, refresh_token } = tokenResponse.data;
    res.redirect(`http://localhost:8080/?access_token=${access_token}&refresh_token=${refresh_token}`);
  } catch (error) {
    res.send(error);
  }
});

app.post('/upload-spectrogram', (req, res) => {
  const { image, trackName, label } = req.body;

  // Ensure label is either "liked" or "disliked"
  const folderName = label === 'liked' ? 'liked' : 'disliked';

  // Create the full path for saving the file
  const filePath = path.join(__dirname, 'spectrograms', folderName, `${trackName}.png`);

  // Remove the "data:image/png;base64," prefix
  const base64Data = image.replace(/^data:image\/png;base64,/, '');

  // Write the file to the designated folder
  fs.writeFile(filePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('Error saving spectrogram:', err);
      return res.status(500).json({ message: 'Failed to save spectrogram' });
    }
    res.status(200).json({ message: 'Spectrogram saved successfully' });
  });
});

app.listen(8000, () => console.log('Server running on port 8000'));

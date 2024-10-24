// server.js
const express = require('express');
const cors = require('cors');
const querystring = require('querystring');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());

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

app.listen(8000, () => console.log('Server running on port 8000'));

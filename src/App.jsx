// App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [topTracks, setTopTracks] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    if (token) {
      setAccessToken(token);
      fetchTopTracks(token);
    }
  }, []);

  const fetchTopTracks = async (token) => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTopTracks(response.data.items);
    } catch (error) {
      console.error('Error fetching top tracks', error);
    }
  };

  return (
    <div className="App">
      {!accessToken ? (
        <a href="http://localhost:8000/login">Login with Spotify</a>
      ) : (
        <div>
          <h1>Your Favorite Songs</h1>
          <ul>
            {topTracks.map((track) => (
              <li key={track.id}>
                <strong>{track.name}</strong>
                {' '}
                by
                {track.artists[0].name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;

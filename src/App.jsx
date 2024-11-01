import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpectrogramComponent from './Spectrogram';
import './index.scss';

function App() {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token') || null);
  const [topTracks, setTopTracks] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');

    const fetchTopTracks = async (url, token) => {
      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Append new tracks to the existing topTracks array
        setTopTracks((prevTracks) => [...prevTracks, ...response.data.items]);

        // If there's a next page, continue fetching
        if (response.data.next) {
          fetchTopTracks(response.data.next, token);
        }
      } catch (error) {
        console.error('Error fetching top tracks', error);
      }
    };

    if (token) {
      localStorage.setItem('access_token', token);
      setAccessToken(token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (accessToken) {
      fetchTopTracks('https://api.spotify.com/v1/me/top/tracks?limit=50', accessToken);
    }
  }, [accessToken]);

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

                {/* Display spectrogram for each track's preview URL */}
                {track.preview_url ? (
                  <SpectrogramComponent audioUrl={track.preview_url} />
                ) : (
                  <p>No preview available</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;

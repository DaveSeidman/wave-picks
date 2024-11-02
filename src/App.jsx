import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpectrogramComponent from './Spectrogram';
import './index.scss';

function App() {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token') || null);
  const [likedSongs, setLikedSongs] = useState([]);
  const [dislikedSongs, setDislikedSongs] = useState([]);

  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = 'http://localhost:8080/wave-picks/'; // Replace with your redirect URI
  const scopes = ['playlist-read-private', 'user-top-read'];

  const loginUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${encodeURIComponent(
    scopes.join(' '),
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1)); // Get params from URL hash
    const token = params.get('access_token');

    const fetchLikedSongs = async (url, token) => {
      try {
        const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setLikedSongs((prevLikedSongs) => [...prevLikedSongs, ...response.data.items]);
        if (response.data.next) {
          fetchLikedSongs(response.data.next, token); // Fetch next page if available
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('access_token');
          setAccessToken(null);
        } else {
          console.error('Error fetching liked songs', error);
        }
      }
    };

    const fetchDislikedSongs = async (token) => {
      try {
        const playlistsResponse = await axios.get('https://api.spotify.com/v1/me/playlists', { headers: { Authorization: `Bearer ${token}` }, });

        const dislikePlaylist = playlistsResponse.data.items.find(
          (playlist) => playlist.name.toLowerCase() === 'dislike',
        );

        if (dislikePlaylist) {
          const response = await axios.get(
            `https://api.spotify.com/v1/playlists/${dislikePlaylist.id}/tracks`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setDislikedSongs(response.data.items.map((item) => item.track));
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('access_token');
          setAccessToken(null);
        } else {
          console.error('Error fetching disliked songs', error);
        }
      }
    };

    if (token) {
      localStorage.setItem('access_token', token);
      setAccessToken(token);
      fetchLikedSongs('https://api.spotify.com/v1/me/top/tracks?limit=50', token);
      fetchDislikedSongs(token);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (accessToken) {
      fetchLikedSongs('https://api.spotify.com/v1/me/top/tracks?limit=50', accessToken);
      fetchDislikedSongs(accessToken);
    }
  }, [accessToken]);

  return (
    <div className="App">
      {!accessToken ? (
        <a href={loginUrl}>Login with Spotify</a>
      ) : (
        <div className="song-lists">
          <div className="song-lists-list liked">
            <h1>Liked</h1>
            <ul>
              {likedSongs.map((track, index) => (
                <li key={`${track.id}-${index}`}>

                  <strong>{track.name}</strong>
                  {' '}
                  by
                  {track.artists[0].name}
                  {track.preview_url ? (
                    <SpectrogramComponent
                      audioUrl={track.preview_url}
                      trackName={track.name}
                      label="liked"
                    />) : (
                    <p>No preview available</p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="song-lists-list disliked">

            <h1>Disliked</h1>
            <ul>
              {dislikedSongs.map((track, index) => (
                <li key={`${track.id}-${index}`}>
                  <strong>{track.name}</strong>
                  {' '}
                  by
                  {track.artists[0].name}
                  {track.preview_url ? (
                    <SpectrogramComponent
                      audioUrl={track.preview_url}
                      trackName={track.name}
                      label="dislike"
                    />
                  ) : (
                    <p>No preview available</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

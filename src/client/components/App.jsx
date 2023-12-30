import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";
import PlaylistList from "./PlaylistList";
import * as Auth from "../services/auth";
import * as SpotifyService from "../services/spotifyService";
import { downloadCSV } from "../utils/downloadCSV";

// React app
function App() {
  const [username, setUsername] = useState(null);
  const [userPic, setUserPic] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Auth.handleAuthCode(setError);

    // If token exists and is not expired, get user info and playlists
    const fetchData = async () => {
      try {
        const userData = await SpotifyService.getUserInfo();
        setUsername(userData.data.display_name);
        setUserPic(userData.data.images[0].url);

        const playlistData = await SpotifyService.getPlaylists();
        setPlaylists(playlistData.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError(error);
      }
    };

    if (localStorage.getItem("access_token") && !Auth.isTokenExpired()) {
      setLoggedIn(true);
      fetchData();
    }
  }, []);

  const handleDownload = async (playlist) => {
    try {
      const tracks = await SpotifyService.getPlaylistTracks(playlist);
      downloadCSV(tracks, playlist.name);
    } catch (error) {
      setError(error);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("expires_at");
    setLoggedIn(false);
    setPlaylists(null);
  };

  return (
    <div className="App">
      <h1>Spotify CSV Exporter</h1>
      <h2>Export your Spotify playlists to CSV</h2>

      {loggedIn ? (
        <>
          <div className="user">
            <p>Logged in as {username}</p>
            <img src={userPic} alt={username}></img>
          </div>
          <button onClick={logout}>Log out</button>
        </>
      ) : (
        <button onClick={Auth.initiateOAuthProcess}>Log in with Spotify</button>
      )}

      {error && <p>{error}</p>}

      {playlists && (
        <PlaylistList
          playlists={playlists}
          getPlaylists={SpotifyService.getPlaylists}
          handleDownload={handleDownload}
        />
      )}
    </div>
  );
}

export default App;

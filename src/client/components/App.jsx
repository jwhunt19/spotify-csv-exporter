import { useEffect, useState } from "react";
import "./App.css";
import PlaylistList from "./PlaylistList";
import * as Auth from "../services/auth";
import * as SpotifyService from "../services/spotifyService";
import { downloadCSV } from "../utils/downloadCSV";

function App() {
  const [username, setUsername] = useState(null);
  const [userPic, setUserPic] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState(null);

  // Handles auth code exchange for tokens & fetches user/playlist data
  useEffect(() => {
    Auth.handleAuthCode(setError);
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

    if (Auth.isLoggedIn()) {
      setLoggedIn(true);
      fetchData();
    }
  }, []);

  // Handle download by getting tracks from playlist and downloading CSV
  const handleDownload = async (playlist) => {
    try {
      const tracks = await SpotifyService.getPlaylistTracks(playlist);
      downloadCSV(tracks, playlist.name);
    } catch (error) {
      setError(error);
    }
  };

  // Log out by removing tokens from local storage & set loggedIn to false
  const logout = () => {
    Auth.removeTokens();
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

import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";
import PlaylistList from "./PlaylistList";
import {
  initiateOAuthProcess,
  isTokenExpired,
  handleAuthCode,
  getUserInfo,
  getPlaylists,
} from "../services/auth";
import { convertMillisecondsToMMSS } from "../utils/convertMillisecondsToMMSS";

// react app
function App() {
  const [username, setUsername] = useState(null);
  const [userPic, setUserPic] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleAuthCode(setError);

    // If token exists and is not expired, get user info and playlists
    const fetchData = async () => {
      try {
        const userData = await getUserInfo();
        setUsername(userData.data.display_name);
        setUserPic(userData.data.images[0].url);

        const playlistData = await getPlaylists();
        setPlaylists(playlistData.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError(error);
      }
    };

    if (localStorage.getItem("access_token") && !isTokenExpired()) {
      setLoggedIn(true);
      fetchData();
    }
  }, []);

  // get tracks from selected playlist // TODO: move to services
  const getPlaylistTracks = (playlist) => {
    let tracks = [];
    const getTracks = (url) => {
      return axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        .then(({ data }) => {
          tracks = tracks.concat(data.items);
          if (data.next) {
            return getTracks(data.next);
          } else {
            return tracks;
          }
        })
        .catch((error) => {
          console.error("Error fetching track list: ", error);
          setError(error);
        });
    };

    getTracks(playlist.tracks.href).then((tracks) => {
      downloadCSV(tracks, playlist.name);
    });
  };

  // TODO: move to utils?
  const downloadCSV = (tracks, playlistName) => {
    const csv = [["Artist", "Track", "Album", "Date_added", "Duration"]];
    tracks.forEach((track) => {
      let time = convertMillisecondsToMMSS(track.track.duration_ms);
      csv.push([
        `"${track.track.artists[0]?.name || "Unknown Artist"}"`,
        `"${track.track.name || "Unknown Track"}"`,
        `"${track.track.album?.name || "Unknown Album"}"`,
        track.added_at.slice(0, -1) || "Unknown Date",
        time || "Unknown Duration",
      ]);
    });
    const csvContent = csv.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${playlistName.replaceAll(" ", "_")}.csv`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => {
      // Revoke the Blob URL after a short timeout
      URL.revokeObjectURL(downloadLink.href);
      document.body.removeChild(downloadLink);
    }, 0); // Schedule the revoke after file has downloaded
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
        <button onClick={initiateOAuthProcess}>Log in with Spotify</button>
      )}

      {error && <p>{error}</p>}

      {playlists && (
        <PlaylistList
          playlists={playlists}
          getPlaylists={getPlaylists}
          getPlaylistTracks={getPlaylistTracks}
        />
      )}
    </div>
  );
}

export default App;

import "./App.css";
import { getToken, initiateOAuthProcess } from "../services/auth";
import { useEffect, useState } from "react";
import axios from "axios";
import Playlist from "./Playlist";
import PlaylistList from "./PlaylistList";

// check if token is expired
const isTokenExpired = () => {
  const expirationTime = localStorage.getItem("expiration_time");
  return new Date().getTime() > expirationTime;
};

// react app
function App() {
  const [user, setUser] = useState(null);
  const [userID, setUserID] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // get code from url
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get("code");

    // if code exists, get token
    if (code) {
      if (!localStorage.getItem("access_token") || isTokenExpired()) {
        getToken(code)
          .then(() => {
            window.history.pushState({}, null, "/"); // remove code from url
            location.reload();
          })
          .catch((error) => {
            console.error("Error during token exchange:", error);
            setError(error);
          });
      } else {
        // if token exists and is not expired, remove code from url
        window.history.pushState({}, null, "/");
      }
    }

    // if token exists and is not expired, get username
    if (localStorage.getItem("access_token") && !isTokenExpired()) {
      getUser();
      setLoggedIn(true);
      getPlaylists();
    }
  }, []);

  // get user's username
  const getUser = () => {
    axios
      .get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        setUserID(response.data.id);
        setUser(response.data.display_name);
      });
  };

  // get user's playlists
  const getPlaylists = (url = "https://api.spotify.com/v1/me/playlists") => {
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        setPlaylists(response.data);
      });
  };

  // get tracks from selected playlist
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
        });
    };

    getTracks(playlist.tracks.href).then((tracks) => {
      downloadCSV(tracks, playlist.name);
    });
  };

  function convertMillisecondsToMMSS(milliseconds) {
    // Convert milliseconds to seconds
    let totalSeconds = Math.floor(milliseconds / 1000);

    // Calculate minutes and seconds
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    // Pad with leading zeros if necessary
    let paddedMinutes = minutes.toString().padStart(2, "0");
    let paddedSeconds = seconds.toString().padStart(2, "0");

    // Format as MM:SS
    return `${paddedMinutes}:${paddedSeconds}`;
  }

  const downloadCSV = (tracks, playlistName) => {
    const csv = [["Artist", "Track", "Album", "Added At", "Duration"]];
    tracks.forEach((track) => {
      let time = convertMillisecondsToMMSS(track.track.duration_ms);
      csv.push([
        `"${track.track.artists[0]?.name || "Unknown Artist"}"`,
        `"${track.track.name || "Unknown Track"}"`,
        `"${track.track.album?.name || "Unknown Album"}"`,
        track.added_at || "Unknown Date",
        time || "Unknown Duration",
      ]);
    });
    const csvContent = csv.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", `data:text/csv;charset=utf-8,${encodedUri}`);
    link.setAttribute("download", `${playlistName}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const login = () => {
    initiateOAuthProcess();
  };

  return (
    <div className="App">
      <h1>Spotify CSV Exporter</h1>
      <p>Export your Spotify playlists to CSV</p>
      {loggedIn ? (
        <p>Logged in as {user}</p>
      ) : (
        <button onClick={login}>Log in with Spotify</button>
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

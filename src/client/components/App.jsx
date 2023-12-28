import "./App.css";
import {
  getToken,
  initiateOAuthProcess,
  isTokenExpired,
} from "../services/auth";
import { useEffect, useState } from "react";
import axios from "axios";
import Playlist from "./Playlist";
import PlaylistList from "./PlaylistList";

// react app
function App() {
  const [user, setUser] = useState(null);
  const [userID, setUserID] = useState(null);
  const [userPic, setUserPic] = useState(null);
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
            window.history.pushState({}, null, "/spotify-csv-exporter/"); // remove code from url
            location.reload();
          })
          .catch((error) => {
            console.error("Error during token exchange:", error);
            setError(error);
          });
      } else {
        // if token exists and is not expired, remove code from url
        window.history.pushState({}, null, "/spotify-csv-exporter/");
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
      .then(({ data }) => {
        setUserID(data.id);
        setUser(data.display_name);
        setUserPic(data.images[0].url);
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
    const encodedUri = encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", `data:text/csv;charset=utf-8,${encodedUri}`);
    link.setAttribute("download", `${playlistName.replaceAll(" ", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const login = () => {
    initiateOAuthProcess();
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
            <p>Logged in as {user}</p>
            <img src={userPic} alt={user}></img>
          </div>
          <button onClick={logout}>Log out</button>
        </>
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

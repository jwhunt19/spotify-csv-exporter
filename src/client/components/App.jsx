import "./App.css";
import { getToken, initiateOAuthProcess } from "../services/auth";
import { useEffect, useState } from "react";
import axios from "axios";

const isTokenExpired = () => {
  const expirationTime = localStorage.getItem("expiration_time");
  return new Date().getTime() > expirationTime;
};

// react app
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get("code");

    if (code) {
      if (!localStorage.getItem("access_token") || isTokenExpired()) {
        getToken(code)
          .then(() => {
            window.history.pushState({}, null, "/");
          })
          .catch((error) => {
            console.error("Error during token exchange:", error);
          });
      } else {
        window.history.pushState({}, null, "/");
      }
    }

    if (localStorage.getItem("access_token") && !isTokenExpired()) {
      axios
        .get("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        .then((response) => {
          setUser(response.data.display_name);
        });
    }
  }, []);

  const login = () => {
    initiateOAuthProcess();
  };

  const test = () => {
    let token = localStorage.getItem("access_token");
    let codeVerifier = localStorage.getItem("code_verifier");

    console.log(token);
    console.log(codeVerifier);
  };

  return (
    <div className="App">
      <h1>Spotify CSV Exporter</h1>
      <p>Export your Spotify playlists to CSV</p>
      {user && <p>Logged in as {user}</p>}
      <button onClick={login}>Log in with Spotify</button>
      <button onClick={test}>Test</button>
    </div>
  );
}

export default App;

import {
  generateCodeVerifier,
  generateCodeChallenge,
} from "../utils/oauthUtils";
import axios from "axios";

// initiate OAuth process by redirecting to Spotify's authorization page
export async function initiateOAuthProcess() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const clientId = "96c884e0f37f4ff6aaea676e3eec7b87";
  const redirectUri = "https://jwhunt19.github.io/spotify-csv-exporter";

  const scope = "playlist-read-private playlist-read-collaborative user-read-private user-read-email";
  const authUrl = new URL("https://accounts.spotify.com/authorize");

  // generated in the previous step
  window.localStorage.setItem("code_verifier", codeVerifier);

  const params = {
    response_type: "code",
    client_id: clientId,
    scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}

// get token from authorization code
export async function getToken(code) {
  let codeVerifier = localStorage.getItem("code_verifier");

  const clientId = "96c884e0f37f4ff6aaea676e3eec7b87";
  const redirectUri = "https://jwhunt19.github.io/spotify-csv-exporter";
  const url = "https://accounts.spotify.com/api/token";

  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  try {
    const response = await axios.post(url, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const expiresIn = response.data.expires_in;
    const expirationTime = new Date().getTime() + expiresIn * 1000;
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("expiration_time", expirationTime);
  } catch (error) {
    console.error(
      "Error fetching token:",
      error.response ? error.response.data : error
    );
    throw new Error(
      `Server error: ${
        error.response ? error.response.status : "Unknown error"
      }`
    );
  }
}

// check if token is expired
export function isTokenExpired() {
  const expirationTime = localStorage.getItem("expiration_time");
  return new Date().getTime() > expirationTime;
};

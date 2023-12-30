import axios from "axios";
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from "../utils/oauthUtils";

// Initiate OAuth process by redirecting to Spotify's authorization page
export async function initiateOAuthProcess() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_PUBLIC_URL;
  const scope =
    "playlist-read-private playlist-read-collaborative user-read-private user-read-email";
  const authUrl = new URL("https://accounts.spotify.com/authorize");

  window.localStorage.setItem("code_verifier", codeVerifier); // save code verifier locally

  // Set query parameters for authorization URL
  const params = {
    response_type: "code",
    client_id: clientId,
    scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  // Set query parameters for authorization URL and redirect
  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}

// Check if token is expired
export function isTokenExpired() {
  const expirationTime = localStorage.getItem("expiration_time");
  return new Date().getTime() > expirationTime; // returns true if expired
}

// Handles the OAuth authentication process.
export function handleAuthCode(setError) {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code"); // Get authorization code from URL
  const noValidToken =
    !localStorage.getItem("access_token") || isTokenExpired();

  if (code && noValidToken) {
    getToken(code) // Exchange authorization code for access token
      .then(() => {
        // Update the URL and reload to complete the authentication flow
        window.history.pushState({}, null, "/spotify-csv-exporter/");
        location.reload();
      })
      .catch((error) => {
        // Handle errors during the token exchange process
        console.error("Error during token exchange:", error);
        setError(error);
      });
  } else if (code) {
    // Clean up URL if an auth code is present but not needed
    window.history.pushState({}, null, "/spotify-csv-exporter/");
  }
}

// Get token from authorization code
export async function getToken(code) {
  let codeVerifier = localStorage.getItem("code_verifier");
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_PUBLIC_URL;
  const url = "https://accounts.spotify.com/api/token";

  // Set query parameters for token request
  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  // Make token request to Spotify's API and save token and expiration time
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

// Check if there is a valid token
export function isLoggedIn() {
  return localStorage.getItem("access_token") && !isTokenExpired();
};

// Remove tokens from local storage
export function removeTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("expiration_time");
}
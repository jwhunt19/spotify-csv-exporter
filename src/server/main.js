import "dotenv/config";
import express from "express";
import ViteExpress from "vite-express";
import axios from "axios";

const app = express();

let spotifyAccessToken = null;
let tokenExpiryTime = null;

const fetchShopifyToken = async () => {
  const { data } = await axios.post(
    "https://accounts.spotify.com/api/token",
    {
      grant_type: "client_credentials",
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  spotifyAccessToken = data.access_token;
  tokenExpiryTime = new Date().getTime() + data.expires_in * 1000;
};

const getSpotifyToken = async () => {
  if (!spotifyAccessToken || tokenExpiryTime < new Date().getTime()) {
    await fetchShopifyToken();
  }

  return spotifyAccessToken;
};

//3AA28KZvwAUcZuOKwyblJQ?si=7T_eO7nWQtijmkYBlyqV_Q

app.get("/test", async (req, res) => {
  const { data } = await axios.get(
    "https://api.spotify.com/v1/artists/3AA28KZvwAUcZuOKwyblJQ",
    {
      headers: {
        Authorization: `Bearer ${await getSpotifyToken()}`,
      },
    }
  );

  res.json(data);
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);

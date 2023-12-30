import axios from "axios";

// Get username and user picture
export function getUserInfo() {
  return axios.get("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
}

// Get user's playlists
export function getPlaylists(url = "https://api.spotify.com/v1/me/playlists") {
  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
};

export async function getPlaylistTracks(playlist) {
  let tracks = [];
  async function getTracks(url) {
    try {
      const tracksData = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      tracks = tracks.concat(tracksData.data.items);
      if (tracksData.data.next) {
        await getTracks(tracksData.data.next);
      }
    } catch (error) {
      console.error("Error fetching track list: ", error);
      throw error;
    }
  }

  await getTracks(playlist.tracks.href);
  console.log(tracks)
  return tracks;
}

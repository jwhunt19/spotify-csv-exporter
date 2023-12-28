import Playlist from "./Playlist";

const PlaylistList = ({ playlists, getPlaylists, getPlaylistTracks }) => {
  return (
    <div className="playlists-container">
      <h2 className="playlists-header">Playlists</h2>
      <ul className="playlists-list">
        {playlists.items.map((playlist) => (
          <Playlist
            key={playlist.id}
            playlist={playlist}
            getPlaylistTracks={getPlaylistTracks}
          />
        ))}
      </ul>
      <div className="playlists-arrows">
        <button
          onClick={() => getPlaylists(playlists.previous)}
          style={{ visibility: playlists.previous ? "visible" : "hidden" }}
        >
          &larr;
        </button>
        <button
          onClick={() => getPlaylists(playlists.next)}
          style={{ visibility: playlists.next ? "visible" : "hidden" }}
        >
          &rarr;
        </button>
      </div>
    </div>
  );
};
export default PlaylistList;

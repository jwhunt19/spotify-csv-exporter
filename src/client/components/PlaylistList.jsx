import Playlist from "./Playlist";

const PlaylistList = ({ playlists, getPlaylists, handleDownload }) => {
  return (
    <div className="playlists-container">
      <h3 className="playlists-header">Playlists</h3>
      <ul className="playlists-list">
        {playlists.items.map((playlist) => (
          <Playlist
            key={playlist.id}
            playlist={playlist}
            handleDownload={handleDownload}
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

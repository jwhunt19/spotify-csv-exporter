const Playlist = ({ playlist, handleDownload }) => {
  const src =
    playlist.images.length > 0
      ? playlist.images[0].url
      : "/spotify-csv-exporter/playlist_placeholder.png";

  return (
    <li>
      <div>
        <img src={src} alt={playlist.name}></img>
        <p>{playlist.name}</p>
      </div>
      <button onClick={() => handleDownload(playlist)}>&darr;</button>
    </li>
  );
};

export default Playlist;

const Playlist = ({ playlist, getPlaylistTracks }) => {
  return (
    <li>
      <div>
        <img src={playlist.images[0].url} alt={playlist.name}></img>
        <p>{playlist.name}</p>
      </div>
      <button onClick={() => getPlaylistTracks(playlist)}>&darr;</button>
    </li>
  );
};

export default Playlist;

const Playlist = ({ playlist, getPlaylistTracks }) => {
  const checkForImage = (playlist) => {
    if (playlist.images.length > 0) {
      return playlist.images[0].url;
    } else {
      return "src/client/imgs/playlist_placeholder.png";
    }
  };

  let src = checkForImage(playlist);

  return (
    <li>
      <div>
        <img src={src} alt={playlist.name}></img>
        <p>{playlist.name}</p>
      </div>
      <button onClick={() => getPlaylistTracks(playlist)}>&darr;</button>
    </li>
  );
};

export default Playlist;

import axios from "axios";
import "./App.css";

function App() {
  const test = () => {
    axios.get("/test").then((res) => {
      console.log(res);
    });
  };

  return (
    <div className="App">
      <h1>Spotify CSV Exporter</h1>
      <p>Export your Spotify playlists to CSV</p>
      <button onClick={test}>Test</button>
    </div>
  );
}

export default App;

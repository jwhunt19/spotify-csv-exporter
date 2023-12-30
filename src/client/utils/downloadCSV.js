import { convertMillisecondsToMMSS } from "./convertMillisecondsToMMSS";

export function downloadCSV(tracks, playlistName) {
  const csv = [["Artist", "Track", "Album", "Date_added", "Duration"]];
  tracks.forEach((track) => {
    let time = convertMillisecondsToMMSS(track.track.duration_ms);
    csv.push([
      `"${track.track.artists[0]?.name || "Unknown Artist"}"`,
      `"${track.track.name || "Unknown Track"}"`,
      `"${track.track.album?.name || "Unknown Album"}"`,
      track.added_at.slice(0, -1) || "Unknown Date",
      time || "Unknown Duration",
    ]);
  });
  const csvContent = csv.map((e) => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv' });

  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${playlistName.replaceAll(" ", "_")}.csv`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Revoke the Blob URL after a short timeout
  setTimeout(() => {
    URL.revokeObjectURL(downloadLink.href);
    document.body.removeChild(downloadLink);
  }, 0); // Schedule the revoke after file has downloaded
};
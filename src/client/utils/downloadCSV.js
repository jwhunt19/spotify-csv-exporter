import { convertMillisecondsToMMSS } from "./convertMillisecondsToMMSS";

export function downloadCSV(tracks, playlistName) {
  // Create column headers for CSV file
  const csv = [["Artist", "Track", "Album", "Date_added", "Duration"]];

  // Add track data to CSV file by iterating and pushing data to csv array 
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

  // Convert csv array to string and create Blob object
  const csvContent = csv.map((e) => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv' });

  // Create download link and click it to download file
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${playlistName.replaceAll(" ", "_")}.csv`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink); // Remove link from DOM

  // Revoke the Blob URL after a short timeout
  setTimeout(() => {
    URL.revokeObjectURL(downloadLink.href);
    document.body.removeChild(downloadLink);
  }, 0); // Schedule the revoke after file has downloaded
};
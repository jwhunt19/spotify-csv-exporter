export function convertMillisecondsToMMSS(milliseconds) {
  // Convert milliseconds to seconds
  let totalSeconds = Math.floor(milliseconds / 1000);

  // Calculate minutes and seconds
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  // Pad with leading zeros if necessary
  let paddedMinutes = minutes.toString().padStart(2, "0");
  let paddedSeconds = seconds.toString().padStart(2, "0");

  // Format as MM:SS
  return `${paddedMinutes}:${paddedSeconds}`;
}

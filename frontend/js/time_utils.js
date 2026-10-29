/**
 * Client-side time formatting utilities.
 */
function formatSecondsToHHMMSS(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00:00";
  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  
  const pad = (num) => String(num).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

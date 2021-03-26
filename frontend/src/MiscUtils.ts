export default function formatTimestamp(timestamp: number): string {
  const utcDate = new Date(timestamp).toUTCString();
  const date = new Date(utcDate);

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const hour = date.getUTCHours();
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  const minute = date.getUTCMinutes();

  return `${month}/${day}/${year} ${formattedHour}:${minute < 10 ? `0${minute}` : minute} ${
    hour >= 12 ? 'PM' : 'AM'
  }`;
}

export default function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const hour = date.getHours();
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  const minute = date.getMinutes();

  return `${month}/${day}/${year} ${formattedHour}:${minute < 10 ? `0${minute}` : minute} ${
    hour >= 12 ? 'PM' : 'AM'
  }`;
}

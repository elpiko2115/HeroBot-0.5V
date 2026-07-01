function parseStartTime(timeText) {
  const match = timeText.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  const now = new Date();
  const start = new Date();

  start.setHours(hours, minutes, 0, 0);

  if (start.getTime() <= now.getTime()) {
    start.setDate(start.getDate() + 1);
  }

  return start.getTime();
}

module.exports = parseStartTime;
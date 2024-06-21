// Get the current timestamp in milliseconds
const getTimestampInMilliseconds = () => {
  const now = new Date().getTime();
  return now;
};

// Get the current timestamp in seconds (UNIX timestamp)
const getCurrentUnixTimesamp = () => {
  const now = new Date().getTime();
  return Math.floor(now / 1000);
};

// Get the current timestamp in seconds as a string
const getCurrentUnixTimesampString = () => {
  const now = new Date().getTime();
  return Math.floor(now / 1000).toString();
};

// Convert from timestamp (seconds or milliseconds) to Date object
const timestampToDate = (timestamp) => {
  if (timestamp.toString().length !== 10) {
    const now = new Date(timestamp * 1.0);
    return now;
  } else if (timestamp.toString().length === 10) {
    return new Date(timestamp * 1000);
  } else {
    return null;
  }
};

// Convert from Date object to timestamp (seconds)
const dateToTimestamp = (date) => {
  return Math.floor(date.getTime() / 1000);
};

// Format a Date object into a string according to a specific format
const formatDate = (date, format = "YYYY-MM-DD HH:mm:ss") => {
  const pad = (number) => (number < 10 ? "0" + number : number);

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

// Get the current time in the specific time zone and format it
const getCurrentTimeInTimezone = (offset, format = "YYYY-MM-DD HH:mm:ss") => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const newDate = new Date(utc + 3600000 * offset);

  return formatDate(newDate, format);
};

// Get the current time in UTC and format it
const getUTCTime = (format = "YYYY-MM-DD HH:mm:ss") => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const newDate = new Date(utc);

  return formatDate(newDate, format);
};

// Calculate the difference between two Date objects (returns milliseconds)
const differenceInMilliseconds = (date1, date2) => {
  return Math.abs(date1.getTime() - date2.getTime());
};

// Calculate the difference between two Date objects (returns seconds)
const differenceInSeconds = (date1, date2) => {
  return Math.floor(differenceInMilliseconds(date1, date2) / 1000);
};

// Calculate the difference between two Date objects (returns minutes)
const differenceInMinutes = (date1, date2) => {
  return Math.floor(differenceInSeconds(date1, date2) / 60);
};

// Calculate the difference between two Date objects (returns the hour)
const differenceInHours = (date1, date2) => {
  return Math.floor(differenceInMinutes(date1, date2) / 60);
};

// Calculate the difference between two Date objects (returns date)
const differenceInDays = (date1, date2) => {
  return Math.floor(differenceInHours(date1, date2) / 24);
};

export {
  getCurrentUnixTimesamp,
  getCurrentUnixTimesampString,
  timestampToDate,
  formatDate,
  getCurrentTimeInTimezone,
  dateToTimestamp,
  getUTCTime,
  getTimestampInMilliseconds,
  differenceInMilliseconds,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
};

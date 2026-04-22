// This function converts the time to milliseconds
// Parameters: time - the value of time to be converted
//             unit - the unit of time to be converted
// returns: the time converted to milliseconds
export function convertTimeToMs(time: number, unit: string) {
  switch (unit) {
    case "seconds":
      return time * 1000;
    case "minutes":
      return time * 60 * 1000;
    case "hours":
      return time * 60 * 60 * 1000;
    case "days":
      return time * 24 * 60 * 60 * 1000;
    default:
      return time;
  }
}

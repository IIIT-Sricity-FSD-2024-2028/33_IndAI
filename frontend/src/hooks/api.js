// UI compatibility helpers backed exclusively by Redux selectors and named thunks.
export {
  useReduxResource as useResource,
  useReduxAction as useAction,
} from "../redux/hooks.js";
export const rupees = (paise, decimals = 2) =>
  paise == null
    ? "—"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      }).format(paise / 100);
export const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }).format(value)
    : "—";
export const shortDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeZone: "Asia/Kolkata",
      }).format(value)
    : "—";

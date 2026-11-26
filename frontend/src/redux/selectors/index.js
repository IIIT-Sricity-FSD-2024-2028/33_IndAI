import { createSelector } from "@reduxjs/toolkit";
import { domainFor, resourceKey, features } from "../routes.js";
import { emptyEntry } from "../utilities/resourceState.js";
export const selectResource = (state, path) =>
  path
    ? state[domainFor(path)].resources[resourceKey(path)] || emptyEntry
    : emptyEntry;
export const selectCurrentUser = (state) => state.auth.resources["/me"]?.data;
export const selectTheme = (state) => state.theme.mode;
export const selectWatchlists = (state) =>
  state.watchlist.resources["/trading/watchlists"]?.data || emptyWatchlists;
const emptyWatchlists = Object.freeze([]);
export const selectActiveWatchlist = createSelector(
  [selectWatchlists, (state) => state.watchlist.activeWatchlist],
  (items, id) => items.find((item) => item.id === id) || items[0],
);
export const selectOperation = (state, key) => {
  for (const domain of Object.keys(features)) {
    if (state[domain].operations[key]) return state[domain].operations[key];
  }
  return emptyEntry;
};
// A selector factory keeps each quote subscription's memoization independent.
export const makeSelectQuotes = () =>
  createSelector(
    [(state, path) => selectResource(state, path), (_state, _path, now) => now],
    (entry, now) => {
      const stale =
        entry.status === "rejected" ||
        entry.lastFailed ||
        (entry.updatedAt > 0 && now - entry.updatedAt > 10000);
      return entry.data?.map((item) =>
        stale
          ? {
              ...item,
              quote: {
                ...item.quote,
                status: "stale",
                executable: false,
                reason: "Connection interrupted. Waiting for a fresh quote.",
              },
            }
          : item,
      );
    },
  );

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  readRequest,
  readCondition,
  writeRequest,
} from "../utilities/requests.js";
import {
  initialResourceState,
  setResource,
  invalidateResources,
  clearError,
  clearOperation,
  readPending,
  readFulfilled,
  readRejected,
  writePending,
  writeFulfilled,
  writeRejected,
  addRow,
  updateRow,
  removeRow,
} from "../utilities/resourceState.js";

// READ: the fulfilled reducer stores the backend response; components select it.
export const fetchWatchlists = createAsyncThunk(
  "watchlist/fetchWatchlists",
  readRequest,
  { condition: readCondition("watchlist") },
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const createWatchlist = createAsyncThunk(
  "watchlist/createWatchlist",
  writeRequest,
);

// PUT: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const updateWatchlist = createAsyncThunk(
  "watchlist/updateWatchlist",
  writeRequest,
);

// DELETE: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const deleteWatchlist = createAsyncThunk(
  "watchlist/deleteWatchlist",
  writeRequest,
);

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState: { ...initialResourceState(), activeWatchlist: null },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setWatchlists: setResource,
    addWatchlist: addRow,
    updateWatchlistRecord: updateRow,
    removeWatchlist: removeRow,
    setActiveWatchlist(state, action) {
      state.activeWatchlist = action.payload;
    },
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetWatchlists: () => ({
      ...initialResourceState(),
      activeWatchlist: null,
    }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchWatchlists.pending, readPending)
      .addCase(fetchWatchlists.fulfilled, readFulfilled)
      .addCase(fetchWatchlists.rejected, readRejected);
    builder
      .addCase(createWatchlist.pending, writePending)
      .addCase(createWatchlist.fulfilled, writeFulfilled)
      .addCase(createWatchlist.rejected, writeRejected);
    builder
      .addCase(updateWatchlist.pending, writePending)
      .addCase(updateWatchlist.fulfilled, writeFulfilled)
      .addCase(updateWatchlist.rejected, writeRejected);
    builder
      .addCase(deleteWatchlist.pending, writePending)
      .addCase(deleteWatchlist.fulfilled, writeFulfilled)
      .addCase(deleteWatchlist.rejected, writeRejected);
  },
});
export const {
  setWatchlists,
  addWatchlist,
  updateWatchlistRecord,
  removeWatchlist,
  setActiveWatchlist,
  resetWatchlists,
} = watchlistSlice.actions;
export const watchlistActions = watchlistSlice.actions;
export default watchlistSlice.reducer;

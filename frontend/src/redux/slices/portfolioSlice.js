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
export const fetchPortfolio = createAsyncThunk(
  "portfolio/fetchPortfolio",
  readRequest,
  { condition: readCondition("portfolio") },
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const createJournalEntry = createAsyncThunk(
  "portfolio/createJournalEntry",
  writeRequest,
);

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setPortfolio: setResource,
    addJournalEntry: addRow,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetPortfolio: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchPortfolio.pending, readPending)
      .addCase(fetchPortfolio.fulfilled, readFulfilled)
      .addCase(fetchPortfolio.rejected, readRejected);
    builder
      .addCase(createJournalEntry.pending, writePending)
      .addCase(createJournalEntry.fulfilled, writeFulfilled)
      .addCase(createJournalEntry.rejected, writeRejected);
  },
});
export const { setPortfolio, addJournalEntry, resetPortfolio } =
  portfolioSlice.actions;
export const portfolioActions = portfolioSlice.actions;
export default portfolioSlice.reducer;

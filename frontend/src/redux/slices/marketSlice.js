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
export const fetchMarketData = createAsyncThunk(
  "market/fetchMarketData",
  readRequest,
  { condition: readCondition("market") },
);

const marketSlice = createSlice({
  name: "market",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setMarketData: setResource,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetMarketData: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchMarketData.pending, readPending)
      .addCase(fetchMarketData.fulfilled, readFulfilled)
      .addCase(fetchMarketData.rejected, readRejected);
  },
});
export const { setMarketData, resetMarketData } = marketSlice.actions;
export const marketActions = marketSlice.actions;
export default marketSlice.reducer;

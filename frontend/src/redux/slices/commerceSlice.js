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
export const fetchCommerce = createAsyncThunk(
  "commerce/fetchCommerce",
  readRequest,
  { condition: readCondition("commerce") },
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const submitProposal = createAsyncThunk(
  "commerce/submitProposal",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const respondToProposal = createAsyncThunk(
  "commerce/respondToProposal",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const decideProposal = createAsyncThunk(
  "commerce/decideProposal",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const recordProviderEarning = createAsyncThunk(
  "commerce/recordProviderEarning",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const recordProviderSettlement = createAsyncThunk(
  "commerce/recordProviderSettlement",
  writeRequest,
);

const commerceSlice = createSlice({
  name: "commerce",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setCommerce: setResource,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetCommerce: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchCommerce.pending, readPending)
      .addCase(fetchCommerce.fulfilled, readFulfilled)
      .addCase(fetchCommerce.rejected, readRejected);
    builder
      .addCase(submitProposal.pending, writePending)
      .addCase(submitProposal.fulfilled, writeFulfilled)
      .addCase(submitProposal.rejected, writeRejected);
    builder
      .addCase(respondToProposal.pending, writePending)
      .addCase(respondToProposal.fulfilled, writeFulfilled)
      .addCase(respondToProposal.rejected, writeRejected);
    builder
      .addCase(decideProposal.pending, writePending)
      .addCase(decideProposal.fulfilled, writeFulfilled)
      .addCase(decideProposal.rejected, writeRejected);
    builder
      .addCase(recordProviderEarning.pending, writePending)
      .addCase(recordProviderEarning.fulfilled, writeFulfilled)
      .addCase(recordProviderEarning.rejected, writeRejected);
    builder
      .addCase(recordProviderSettlement.pending, writePending)
      .addCase(recordProviderSettlement.fulfilled, writeFulfilled)
      .addCase(recordProviderSettlement.rejected, writeRejected);
  },
});
export const { setCommerce, resetCommerce } = commerceSlice.actions;
export const commerceActions = commerceSlice.actions;
export default commerceSlice.reducer;

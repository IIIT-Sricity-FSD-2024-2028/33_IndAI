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
export const fetchGuidance = createAsyncThunk(
  "guidance/fetchGuidance",
  readRequest,
  { condition: readCondition("guidance") },
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const requestGuidance = createAsyncThunk(
  "guidance/requestGuidance",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const decideGuidance = createAsyncThunk(
  "guidance/decideGuidance",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const awardPaperFunds = createAsyncThunk(
  "guidance/awardPaperFunds",
  writeRequest,
);

const guidanceSlice = createSlice({
  name: "guidance",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setGuidance: setResource,
    addGuidance: addRow,
    updateGuidanceRecord: updateRow,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetGuidance: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchGuidance.pending, readPending)
      .addCase(fetchGuidance.fulfilled, readFulfilled)
      .addCase(fetchGuidance.rejected, readRejected);
    builder
      .addCase(requestGuidance.pending, writePending)
      .addCase(requestGuidance.fulfilled, writeFulfilled)
      .addCase(requestGuidance.rejected, writeRejected);
    builder
      .addCase(decideGuidance.pending, writePending)
      .addCase(decideGuidance.fulfilled, writeFulfilled)
      .addCase(decideGuidance.rejected, writeRejected);
    builder
      .addCase(awardPaperFunds.pending, writePending)
      .addCase(awardPaperFunds.fulfilled, writeFulfilled)
      .addCase(awardPaperFunds.rejected, writeRejected);
  },
});
export const { setGuidance, addGuidance, updateGuidanceRecord, resetGuidance } =
  guidanceSlice.actions;
export const guidanceActions = guidanceSlice.actions;
export default guidanceSlice.reducer;

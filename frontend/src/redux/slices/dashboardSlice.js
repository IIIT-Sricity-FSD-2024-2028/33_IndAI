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
export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  readRequest,
  { condition: readCondition("dashboard") },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setDashboard: setResource,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetDashboard: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchDashboard.pending, readPending)
      .addCase(fetchDashboard.fulfilled, readFulfilled)
      .addCase(fetchDashboard.rejected, readRejected);
  },
});
export const { setDashboard, resetDashboard } = dashboardSlice.actions;
export const dashboardActions = dashboardSlice.actions;
export default dashboardSlice.reducer;

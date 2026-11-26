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
export const fetchOrders = createAsyncThunk(
  "trading/fetchOrders",
  readRequest,
  { condition: readCondition("trading") },
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const placeOrder = createAsyncThunk("trading/placeOrder", writeRequest);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const cancelOrder = createAsyncThunk(
  "trading/cancelOrder",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const resetPaperAccount = createAsyncThunk(
  "trading/resetPaperAccount",
  writeRequest,
);

const tradingSlice = createSlice({
  name: "trading",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setOrders: setResource,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetOrders: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchOrders.pending, readPending)
      .addCase(fetchOrders.fulfilled, readFulfilled)
      .addCase(fetchOrders.rejected, readRejected);
    builder
      .addCase(placeOrder.pending, writePending)
      .addCase(placeOrder.fulfilled, writeFulfilled)
      .addCase(placeOrder.rejected, writeRejected);
    builder
      .addCase(cancelOrder.pending, writePending)
      .addCase(cancelOrder.fulfilled, writeFulfilled)
      .addCase(cancelOrder.rejected, writeRejected);
    builder
      .addCase(resetPaperAccount.pending, writePending)
      .addCase(resetPaperAccount.fulfilled, writeFulfilled)
      .addCase(resetPaperAccount.rejected, writeRejected);
  },
});
export const { setOrders, resetOrders } = tradingSlice.actions;
export const tradingActions = tradingSlice.actions;
export default tradingSlice.reducer;

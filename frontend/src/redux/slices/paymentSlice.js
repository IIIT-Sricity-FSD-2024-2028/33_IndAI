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
export const fetchPayments = createAsyncThunk(
  "payment/fetchPayments",
  readRequest,
  { condition: readCondition("payment") },
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const createPayment = createAsyncThunk(
  "payment/createPayment",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const confirmDemoPayment = createAsyncThunk(
  "payment/confirmDemoPayment",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const reconcilePayment = createAsyncThunk(
  "payment/reconcilePayment",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const discardDemoPayment = createAsyncThunk(
  "payment/discardDemoPayment",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const endRenewal = createAsyncThunk("payment/endRenewal", writeRequest);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const requestRefund = createAsyncThunk(
  "payment/requestRefund",
  writeRequest,
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setPayments: setResource,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetPayments: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchPayments.pending, readPending)
      .addCase(fetchPayments.fulfilled, readFulfilled)
      .addCase(fetchPayments.rejected, readRejected);
    builder
      .addCase(createPayment.pending, writePending)
      .addCase(createPayment.fulfilled, writeFulfilled)
      .addCase(createPayment.rejected, writeRejected);
    builder
      .addCase(confirmDemoPayment.pending, writePending)
      .addCase(confirmDemoPayment.fulfilled, writeFulfilled)
      .addCase(confirmDemoPayment.rejected, writeRejected);
    builder
      .addCase(reconcilePayment.pending, writePending)
      .addCase(reconcilePayment.fulfilled, writeFulfilled)
      .addCase(reconcilePayment.rejected, writeRejected);
    builder
      .addCase(discardDemoPayment.pending, writePending)
      .addCase(discardDemoPayment.fulfilled, writeFulfilled)
      .addCase(discardDemoPayment.rejected, writeRejected);
    builder
      .addCase(endRenewal.pending, writePending)
      .addCase(endRenewal.fulfilled, writeFulfilled)
      .addCase(endRenewal.rejected, writeRejected);
    builder
      .addCase(requestRefund.pending, writePending)
      .addCase(requestRefund.fulfilled, writeFulfilled)
      .addCase(requestRefund.rejected, writeRejected);
  },
});
export const { setPayments, resetPayments } = paymentSlice.actions;
export const paymentActions = paymentSlice.actions;
export default paymentSlice.reducer;

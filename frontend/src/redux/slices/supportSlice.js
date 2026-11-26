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
export const fetchSupportTickets = createAsyncThunk(
  "support/fetchSupportTickets",
  readRequest,
  { condition: readCondition("support") },
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const createSupportTicket = createAsyncThunk(
  "support/createSupportTicket",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const replyToTicket = createAsyncThunk(
  "support/replyToTicket",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const closeTicket = createAsyncThunk(
  "support/closeTicket",
  writeRequest,
);

const supportSlice = createSlice({
  name: "support",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setSupportTickets: setResource,
    addTicket: addRow,
    updateTicketRecord: updateRow,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetSupportTickets: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchSupportTickets.pending, readPending)
      .addCase(fetchSupportTickets.fulfilled, readFulfilled)
      .addCase(fetchSupportTickets.rejected, readRejected);
    builder
      .addCase(createSupportTicket.pending, writePending)
      .addCase(createSupportTicket.fulfilled, writeFulfilled)
      .addCase(createSupportTicket.rejected, writeRejected);
    builder
      .addCase(replyToTicket.pending, writePending)
      .addCase(replyToTicket.fulfilled, writeFulfilled)
      .addCase(replyToTicket.rejected, writeRejected);
    builder
      .addCase(closeTicket.pending, writePending)
      .addCase(closeTicket.fulfilled, writeFulfilled)
      .addCase(closeTicket.rejected, writeRejected);
  },
});
export const {
  setSupportTickets,
  addTicket,
  updateTicketRecord,
  resetSupportTickets,
} = supportSlice.actions;
export const supportActions = supportSlice.actions;
export default supportSlice.reducer;

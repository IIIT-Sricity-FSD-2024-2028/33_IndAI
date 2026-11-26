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
export const fetchResources = createAsyncThunk(
  "resource/fetchResources",
  readRequest,
  { condition: readCondition("resource") },
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const uploadResource = createAsyncThunk(
  "resource/uploadResource",
  writeRequest,
);

// DELETE: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const deleteResource = createAsyncThunk(
  "resource/deleteResource",
  writeRequest,
);

const resourceSlice = createSlice({
  name: "resource",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setResources: setResource,
    addResource: addRow,
    removeResource: removeRow,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetResources: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchResources.pending, readPending)
      .addCase(fetchResources.fulfilled, readFulfilled)
      .addCase(fetchResources.rejected, readRejected);
    builder
      .addCase(uploadResource.pending, writePending)
      .addCase(uploadResource.fulfilled, writeFulfilled)
      .addCase(uploadResource.rejected, writeRejected);
    builder
      .addCase(deleteResource.pending, writePending)
      .addCase(deleteResource.fulfilled, writeFulfilled)
      .addCase(deleteResource.rejected, writeRejected);
  },
});
export const { setResources, addResource, removeResource, resetResources } =
  resourceSlice.actions;
export const resourceActions = resourceSlice.actions;
export default resourceSlice.reducer;

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
export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  readRequest,
  { condition: readCondition("notification") },
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const markNotificationRead = createAsyncThunk(
  "notification/markNotificationRead",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const openNotification = createAsyncThunk(
  "notification/openNotification",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const markAllNotificationsRead = createAsyncThunk(
  "notification/markAllNotificationsRead",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const broadcastNotification = createAsyncThunk(
  "notification/broadcastNotification",
  writeRequest,
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setNotifications: setResource,
    addNotification: addRow,
    updateNotificationRecord: updateRow,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetNotifications: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchNotifications.pending, readPending)
      .addCase(fetchNotifications.fulfilled, readFulfilled)
      .addCase(fetchNotifications.rejected, readRejected);
    builder
      .addCase(markNotificationRead.pending, writePending)
      .addCase(markNotificationRead.fulfilled, writeFulfilled)
      .addCase(markNotificationRead.rejected, writeRejected);
    builder
      .addCase(openNotification.pending, writePending)
      .addCase(openNotification.fulfilled, writeFulfilled)
      .addCase(openNotification.rejected, writeRejected);
    builder
      .addCase(markAllNotificationsRead.pending, writePending)
      .addCase(markAllNotificationsRead.fulfilled, writeFulfilled)
      .addCase(markAllNotificationsRead.rejected, writeRejected);
    builder
      .addCase(broadcastNotification.pending, writePending)
      .addCase(broadcastNotification.fulfilled, writeFulfilled)
      .addCase(broadcastNotification.rejected, writeRejected);
  },
});
export const {
  setNotifications,
  addNotification,
  updateNotificationRecord,
  resetNotifications,
} = notificationSlice.actions;
export const notificationActions = notificationSlice.actions;
export default notificationSlice.reducer;

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
export const fetchUsers = createAsyncThunk("user/fetchUsers", readRequest, {
  condition: readCondition("user"),
});

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const createUser = createAsyncThunk("user/createUser", writeRequest);

// PUT: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const updateUser = createAsyncThunk("user/updateUser", writeRequest);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const updateUserStatus = createAsyncThunk(
  "user/updateUserStatus",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const updatePermissions = createAsyncThunk(
  "user/updatePermissions",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const revokeSessions = createAsyncThunk(
  "user/revokeSessions",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const startMemberRecovery = createAsyncThunk(
  "user/startMemberRecovery",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const addMemberNote = createAsyncThunk(
  "user/addMemberNote",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const decideApplication = createAsyncThunk(
  "user/decideApplication",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const decideStaff = createAsyncThunk("user/decideStaff", writeRequest);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const suspendUser = createAsyncThunk("user/suspendUser", writeRequest);

const userSlice = createSlice({
  name: "user",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setUsers: setResource,
    addUser: addRow,
    updateUserRecord: updateRow,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetUsers: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchUsers.pending, readPending)
      .addCase(fetchUsers.fulfilled, readFulfilled)
      .addCase(fetchUsers.rejected, readRejected);
    builder
      .addCase(createUser.pending, writePending)
      .addCase(createUser.fulfilled, writeFulfilled)
      .addCase(createUser.rejected, writeRejected);
    builder
      .addCase(updateUser.pending, writePending)
      .addCase(updateUser.fulfilled, writeFulfilled)
      .addCase(updateUser.rejected, writeRejected);
    builder
      .addCase(updateUserStatus.pending, writePending)
      .addCase(updateUserStatus.fulfilled, writeFulfilled)
      .addCase(updateUserStatus.rejected, writeRejected);
    builder
      .addCase(updatePermissions.pending, writePending)
      .addCase(updatePermissions.fulfilled, writeFulfilled)
      .addCase(updatePermissions.rejected, writeRejected);
    builder
      .addCase(revokeSessions.pending, writePending)
      .addCase(revokeSessions.fulfilled, writeFulfilled)
      .addCase(revokeSessions.rejected, writeRejected);
    builder
      .addCase(startMemberRecovery.pending, writePending)
      .addCase(startMemberRecovery.fulfilled, writeFulfilled)
      .addCase(startMemberRecovery.rejected, writeRejected);
    builder
      .addCase(addMemberNote.pending, writePending)
      .addCase(addMemberNote.fulfilled, writeFulfilled)
      .addCase(addMemberNote.rejected, writeRejected);
    builder
      .addCase(decideApplication.pending, writePending)
      .addCase(decideApplication.fulfilled, writeFulfilled)
      .addCase(decideApplication.rejected, writeRejected);
    builder
      .addCase(decideStaff.pending, writePending)
      .addCase(decideStaff.fulfilled, writeFulfilled)
      .addCase(decideStaff.rejected, writeRejected);
    builder
      .addCase(suspendUser.pending, writePending)
      .addCase(suspendUser.fulfilled, writeFulfilled)
      .addCase(suspendUser.rejected, writeRejected);
  },
});
export const { setUsers, addUser, updateUserRecord, resetUsers } =
  userSlice.actions;
export const userActions = userSlice.actions;
export default userSlice.reducer;

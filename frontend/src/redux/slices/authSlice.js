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
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  readRequest,
  { condition: readCondition("auth") },
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (request, context) => {
    const result = await writeRequest(request, context);
    context.extra.transitioning = false;
    if (result?.data) {
      const session = await context.dispatch(
        fetchCurrentUser({ path: "/me", force: true }),
      );
      if (fetchCurrentUser.rejected.match(session))
        return context.rejectWithValue(
          session.payload || {
            message: "Could not load your session. Please retry.",
          },
        );
    }
    return result?.data ? { ...result, data: { ok: true } } : result;
  },
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const registerUser = createAsyncThunk("auth/registerUser", writeRequest);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (request, context) => {
    const result = await writeRequest(request, context);
    context.extra.transitioning = false;
    if (result?.data) {
      const session = await context.dispatch(
        fetchCurrentUser({ path: "/me", force: true }),
      );
      if (fetchCurrentUser.rejected.match(session))
        return context.rejectWithValue(
          session.payload || {
            message: "Could not load your session. Please retry.",
          },
        );
    }
    return result?.data ? { ...result, data: { ok: true } } : result;
  },
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const resendVerification = createAsyncThunk(
  "auth/resendVerification",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const requestRecovery = createAsyncThunk(
  "auth/requestRecovery",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const logoutUser = createAsyncThunk("auth/logoutUser", writeRequest);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const resubmitApplication = createAsyncThunk(
  "auth/resubmitApplication",
  writeRequest,
);

const authSlice = createSlice({
  name: "auth",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setCurrentUser: setResource,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetCurrentUser: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchCurrentUser.pending, readPending)
      .addCase(fetchCurrentUser.fulfilled, readFulfilled)
      .addCase(fetchCurrentUser.rejected, readRejected);
    builder
      .addCase(loginUser.pending, writePending)
      .addCase(loginUser.fulfilled, writeFulfilled)
      .addCase(loginUser.rejected, writeRejected);
    builder
      .addCase(registerUser.pending, writePending)
      .addCase(registerUser.fulfilled, writeFulfilled)
      .addCase(registerUser.rejected, writeRejected);
    builder
      .addCase(verifyEmail.pending, writePending)
      .addCase(verifyEmail.fulfilled, writeFulfilled)
      .addCase(verifyEmail.rejected, writeRejected);
    builder
      .addCase(resendVerification.pending, writePending)
      .addCase(resendVerification.fulfilled, writeFulfilled)
      .addCase(resendVerification.rejected, writeRejected);
    builder
      .addCase(requestRecovery.pending, writePending)
      .addCase(requestRecovery.fulfilled, writeFulfilled)
      .addCase(requestRecovery.rejected, writeRejected);
    builder
      .addCase(resetPassword.pending, writePending)
      .addCase(resetPassword.fulfilled, writeFulfilled)
      .addCase(resetPassword.rejected, writeRejected);
    builder
      .addCase(logoutUser.pending, writePending)
      .addCase(logoutUser.fulfilled, writeFulfilled)
      .addCase(logoutUser.rejected, writeRejected);
    builder
      .addCase(changePassword.pending, writePending)
      .addCase(changePassword.fulfilled, writeFulfilled)
      .addCase(changePassword.rejected, writeRejected);
    builder
      .addCase(resubmitApplication.pending, writePending)
      .addCase(resubmitApplication.fulfilled, writeFulfilled)
      .addCase(resubmitApplication.rejected, writeRejected);
  },
});
export const { setCurrentUser, resetCurrentUser } = authSlice.actions;
export const authActions = authSlice.actions;
export default authSlice.reducer;

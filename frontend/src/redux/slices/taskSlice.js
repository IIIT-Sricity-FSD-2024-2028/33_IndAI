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
export const fetchTasks = createAsyncThunk("task/fetchTasks", readRequest, {
  condition: readCondition("task"),
});

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const createAssignment = createAsyncThunk(
  "task/createAssignment",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const createMilestone = createAsyncThunk(
  "task/createMilestone",
  writeRequest,
);

// PUT: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const saveLearningPlan = createAsyncThunk(
  "task/saveLearningPlan",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const submitAssignment = createAsyncThunk(
  "task/submitAssignment",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const reviewSubmission = createAsyncThunk(
  "task/reviewSubmission",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const updateMilestone = createAsyncThunk(
  "task/updateMilestone",
  writeRequest,
);

const taskSlice = createSlice({
  name: "task",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setTasks: setResource,
    addTask: addRow,
    updateTaskRecord: updateRow,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetTasks: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchTasks.pending, readPending)
      .addCase(fetchTasks.fulfilled, readFulfilled)
      .addCase(fetchTasks.rejected, readRejected);
    builder
      .addCase(createAssignment.pending, writePending)
      .addCase(createAssignment.fulfilled, writeFulfilled)
      .addCase(createAssignment.rejected, writeRejected);
    builder
      .addCase(createMilestone.pending, writePending)
      .addCase(createMilestone.fulfilled, writeFulfilled)
      .addCase(createMilestone.rejected, writeRejected);
    builder
      .addCase(saveLearningPlan.pending, writePending)
      .addCase(saveLearningPlan.fulfilled, writeFulfilled)
      .addCase(saveLearningPlan.rejected, writeRejected);
    builder
      .addCase(submitAssignment.pending, writePending)
      .addCase(submitAssignment.fulfilled, writeFulfilled)
      .addCase(submitAssignment.rejected, writeRejected);
    builder
      .addCase(reviewSubmission.pending, writePending)
      .addCase(reviewSubmission.fulfilled, writeFulfilled)
      .addCase(reviewSubmission.rejected, writeRejected);
    builder
      .addCase(updateMilestone.pending, writePending)
      .addCase(updateMilestone.fulfilled, writeFulfilled)
      .addCase(updateMilestone.rejected, writeRejected);
  },
});
export const { setTasks, addTask, updateTaskRecord, resetTasks } =
  taskSlice.actions;
export const taskActions = taskSlice.actions;
export default taskSlice.reducer;

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
export const fetchCourses = createAsyncThunk(
  "course/fetchCourses",
  readRequest,
  { condition: readCondition("course") },
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const createCourse = createAsyncThunk(
  "course/createCourse",
  writeRequest,
);

// PUT: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const updateCourse = createAsyncThunk(
  "course/updateCourse",
  writeRequest,
);

// DELETE: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const deleteCourse = createAsyncThunk(
  "course/deleteCourse",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const createLesson = createAsyncThunk(
  "course/createLesson",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const submitCourse = createAsyncThunk(
  "course/submitCourse",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const reviewCourse = createAsyncThunk(
  "course/reviewCourse",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const enrollCourse = createAsyncThunk(
  "course/enrollCourse",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const completeLesson = createAsyncThunk(
  "course/completeLesson",
  writeRequest,
);

const courseSlice = createSlice({
  name: "course",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setCourses: setResource,
    addCourse: addRow,
    updateCourseRecord: updateRow,
    removeCourse: removeRow,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetCourses: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchCourses.pending, readPending)
      .addCase(fetchCourses.fulfilled, readFulfilled)
      .addCase(fetchCourses.rejected, readRejected);
    builder
      .addCase(createCourse.pending, writePending)
      .addCase(createCourse.fulfilled, writeFulfilled)
      .addCase(createCourse.rejected, writeRejected);
    builder
      .addCase(updateCourse.pending, writePending)
      .addCase(updateCourse.fulfilled, writeFulfilled)
      .addCase(updateCourse.rejected, writeRejected);
    builder
      .addCase(deleteCourse.pending, writePending)
      .addCase(deleteCourse.fulfilled, writeFulfilled)
      .addCase(deleteCourse.rejected, writeRejected);
    builder
      .addCase(createLesson.pending, writePending)
      .addCase(createLesson.fulfilled, writeFulfilled)
      .addCase(createLesson.rejected, writeRejected);
    builder
      .addCase(submitCourse.pending, writePending)
      .addCase(submitCourse.fulfilled, writeFulfilled)
      .addCase(submitCourse.rejected, writeRejected);
    builder
      .addCase(reviewCourse.pending, writePending)
      .addCase(reviewCourse.fulfilled, writeFulfilled)
      .addCase(reviewCourse.rejected, writeRejected);
    builder
      .addCase(enrollCourse.pending, writePending)
      .addCase(enrollCourse.fulfilled, writeFulfilled)
      .addCase(enrollCourse.rejected, writeRejected);
    builder
      .addCase(completeLesson.pending, writePending)
      .addCase(completeLesson.fulfilled, writeFulfilled)
      .addCase(completeLesson.rejected, writeRejected);
  },
});
export const {
  setCourses,
  addCourse,
  updateCourseRecord,
  removeCourse,
  resetCourses,
} = courseSlice.actions;
export const courseActions = courseSlice.actions;
export default courseSlice.reducer;

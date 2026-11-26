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
export const fetchQuizzes = createAsyncThunk("quiz/fetchQuizzes", readRequest, {
  condition: readCondition("quiz"),
});

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const createQuiz = createAsyncThunk("quiz/createQuiz", writeRequest);

// PUT: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const updateQuiz = createAsyncThunk("quiz/updateQuiz", writeRequest);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const publishQuiz = createAsyncThunk("quiz/publishQuiz", writeRequest);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const archiveQuiz = createAsyncThunk("quiz/archiveQuiz", writeRequest);

// PUT: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const saveQuizDraft = createAsyncThunk(
  "quiz/saveQuizDraft",
  writeRequest,
);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const submitQuiz = createAsyncThunk("quiz/submitQuiz", writeRequest);

// POST: see endpoint routing in redux/routes.js; request bodies never enter Redux.
export const gradeQuiz = createAsyncThunk("quiz/gradeQuiz", writeRequest);

const quizSlice = createSlice({
  name: "quiz",
  initialState: { ...initialResourceState() },
  reducers: {
    // Synchronous READ/CRUD reducers. No API calls or other side effects.
    setQuizzes: setResource,
    addQuiz: addRow,
    updateQuizRecord: updateRow,
    invalidate: invalidateResources,
    clearError,
    clearOperation,
    resetQuizzes: () => ({ ...initialResourceState() }),
  },
  extraReducers: (builder) => {
    // Each request has independent pending, fulfilled and rejected state.
    builder
      .addCase(fetchQuizzes.pending, readPending)
      .addCase(fetchQuizzes.fulfilled, readFulfilled)
      .addCase(fetchQuizzes.rejected, readRejected);
    builder
      .addCase(createQuiz.pending, writePending)
      .addCase(createQuiz.fulfilled, writeFulfilled)
      .addCase(createQuiz.rejected, writeRejected);
    builder
      .addCase(updateQuiz.pending, writePending)
      .addCase(updateQuiz.fulfilled, writeFulfilled)
      .addCase(updateQuiz.rejected, writeRejected);
    builder
      .addCase(publishQuiz.pending, writePending)
      .addCase(publishQuiz.fulfilled, writeFulfilled)
      .addCase(publishQuiz.rejected, writeRejected);
    builder
      .addCase(archiveQuiz.pending, writePending)
      .addCase(archiveQuiz.fulfilled, writeFulfilled)
      .addCase(archiveQuiz.rejected, writeRejected);
    builder
      .addCase(saveQuizDraft.pending, writePending)
      .addCase(saveQuizDraft.fulfilled, writeFulfilled)
      .addCase(saveQuizDraft.rejected, writeRejected);
    builder
      .addCase(submitQuiz.pending, writePending)
      .addCase(submitQuiz.fulfilled, writeFulfilled)
      .addCase(submitQuiz.rejected, writeRejected);
    builder
      .addCase(gradeQuiz.pending, writePending)
      .addCase(gradeQuiz.fulfilled, writeFulfilled)
      .addCase(gradeQuiz.rejected, writeRejected);
  },
});
export const { setQuizzes, addQuiz, updateQuizRecord, resetQuizzes } =
  quizSlice.actions;
export const quizActions = quizSlice.actions;
export default quizSlice.reducer;

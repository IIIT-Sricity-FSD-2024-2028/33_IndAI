import { createSlice } from "@reduxjs/toolkit";
const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: "light" },
  reducers: {
    setTheme(state, { payload }) {
      state.mode = payload === "dark" ? "dark" : "light";
    },
    toggleTheme(state) {
      state.mode = state.mode === "dark" ? "light" : "dark";
    },
  },
});
export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;

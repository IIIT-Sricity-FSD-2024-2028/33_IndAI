import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { setTheme, toggleTheme } from "../redux/slices/themeSlice.js";
import { selectTheme } from "../redux/selectors/index.js";

export function ThemeProvider({ children }) {
  const dispatch = useDispatch();
  const store = useStore();
  useEffect(() => {
    try {
      dispatch(setTheme(localStorage.getItem("indai-theme")));
    } catch {}
    const focus = () => store.runtime.focus();
    window.addEventListener("focus", focus);
    window.addEventListener("online", focus);
    return () => {
      window.removeEventListener("focus", focus);
      window.removeEventListener("online", focus);
    };
  }, [dispatch, store]);
  const theme = useSelector(selectTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return children;
}
export function useTheme() {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  return {
    theme,
    toggle: () => {
      const next = theme === "dark" ? "light" : "dark";
      dispatch(toggleTheme());
      try {
        localStorage.setItem("indai-theme", next);
      } catch {}
    },
  };
}

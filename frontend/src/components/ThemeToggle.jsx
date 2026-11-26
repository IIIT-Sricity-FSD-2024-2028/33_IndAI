import { useTheme } from "../hooks/useTheme.jsx";
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      className="button secondary theme-toggle"
      onClick={toggle}
      aria-label={
        "Switch to " + (theme === "dark" ? "light" : "dark") + " mode"
      }
      aria-pressed={theme === "dark"}
    >
      {theme === "dark" ? "☀ Light" : "◐ Dark"}
    </button>
  );
}

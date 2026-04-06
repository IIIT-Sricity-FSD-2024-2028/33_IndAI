// ============================================================
// IndAI Platform – Storage Utilities
// ============================================================
window.LocalStore = {
  read(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

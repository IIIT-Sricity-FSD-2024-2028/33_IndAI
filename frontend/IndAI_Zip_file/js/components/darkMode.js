// ============================================================
// IndAI Platform – Dark Mode Component
// Manages theme toggling and persistence via localStorage
// ============================================================

const DarkMode = {
  KEY: "indai_dark_mode",

  init() {
    if (localStorage.getItem(this.KEY) === "1") {
      document.documentElement.classList.add("dark");
    }
    this._updateButtonIcons();
  },

  toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem(this.KEY, isDark ? "1" : "0");
    this._updateButtonIcons();
  },

  isDark() {
    return document.documentElement.classList.contains("dark");
  },

  _getIconMarkup(dark) {
    return dark
      ? `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg><span class="sr-only">Light mode</span>`
      : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3c0 .34.02.67.05 1a7 7 0 0 0 8.69 8.69c.33.03.66.05 1 .05z"></path></svg><span class="sr-only">Dark mode</span>`;
  },

  _updateButtonIcons() {
    const dark = this.isDark();
    document.querySelectorAll('.dark-mode-toggle').forEach(btn => {
      btn.innerHTML = this._getIconMarkup(dark);
      btn.title = dark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      btn.setAttribute('aria-label', dark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
  },

  createButton() {
    const btn = document.createElement('button');
    btn.className = 'dark-mode-toggle';
    btn.onclick = () => DarkMode.toggle();
    btn.type = 'button';
    btn.innerHTML = this._getIconMarkup(this.isDark());
    btn.title = this.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    btn.setAttribute('aria-label', btn.title);
    return btn;
  },

  injectInto(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container || container.querySelector('.dark-mode-toggle')) return;
    const btn = this.createButton();
    const lastChild = container.lastElementChild;
    container.insertBefore(btn, lastChild);
  }
};

document.addEventListener('DOMContentLoaded', () => DarkMode.init());
if (document.readyState !== 'loading') DarkMode.init();

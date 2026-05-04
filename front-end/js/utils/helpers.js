// ============================================================
// IndAI Platform – Shared Helpers
// ============================================================
window.IndAIHelpers = {
  escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));
  },
  clipText(str, max = 40) {
    const text = String(str ?? '');
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
  },
  badgeIcon(label) {
    return `<span class="inline-icon" aria-hidden="true">${label}</span>`;
  }
};

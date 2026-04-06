// ============================================================
// IndAI Platform – Shared Validation Utilities
// ============================================================
(function(){
  const NAME_RE = /^[A-Za-z ]+$/;
  const PHONE_RE = /^[6-9]\d{9}$/;
  const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@(gmail\.com|(?:[a-zA-Z0-9-]+\.)+in)$/i;

  function getEl(id){ return document.getElementById(id); }
  function valueOf(id){ return (getEl(id)?.value || '').trim(); }
  function setFieldError(id, msg){
    if (window.UI && typeof UI.setFieldError === 'function') return UI.setFieldError(id, msg);
    const el = getEl(id); if (!el) return;
    el.classList.add('input-error');
    let err = el.parentElement?.querySelector('.field-error, .field-error-span');
    if (!err && el.parentElement) {
      err = document.createElement('span');
      err.className = 'field-error';
      el.parentElement.appendChild(err);
    }
    if (err) err.textContent = msg;
  }
  function clearFieldError(id){
    if (window.UI && typeof UI.clearFieldError === 'function') return UI.clearFieldError(id);
    const el = getEl(id); if (!el) return;
    el.classList.remove('input-error');
    const err = el.parentElement?.querySelector('.field-error, .field-error-span');
    if (err) err.textContent = '';
  }
  function makeRule(id, label, checks){ return { id, label, value: valueOf(id), checks }; }
  function required(id, label){ return makeRule(id, label, [{ test:v=>v.length>0, msg:`${label} is required.` }]); }
  function name(id, label='Name', min=3){ return makeRule(id, label, [
    { test:v=>v.length>0, msg:`${label} is required.` },
    { test:v=>v.length>=min, msg:`${label} must be at least ${min} characters.` },
    { test:v=>NAME_RE.test(v), msg:`${label} can contain only alphabets and spaces.` }
  ]); }
  function phone(id, label='Phone number'){ return makeRule(id, label, [
    { test:v=>v.length>0, msg:`${label} is required.` },
    { test:v=>PHONE_RE.test(v.replace(/\D/g,'')), msg:'Enter a valid 10-digit Indian mobile number.' }
  ]); }
  function email(id, label='Email'){ return makeRule(id, label, [
    { test:v=>v.length>0, msg:`${label} is required.` },
    { test:v=>EMAIL_RE.test(v), msg:'Use a Gmail address or an email ending in .in.' }
  ]); }
  function select(id, label){ return makeRule(id, label, [{ test:v=>v !== '', msg:`Please select ${label}.` }]); }
  function minLength(id, label, min){ return makeRule(id, label, [
    { test:v=>v.length>0, msg:`${label} is required.` },
    { test:v=>v.length>=min, msg:`${label} must be at least ${min} characters.` }
  ]); }
  function positiveInt(id, label, min=1, max=Infinity){ return makeRule(id, label, [
    { test:v=>v !== '', msg:`${label} is required.` },
    { test:v=>Number.isInteger(Number(v)) && Number(v)>=min && Number(v)<=max, msg:`${label} must be a whole number between ${min} and ${max}.` }
  ]); }
  function positiveNumber(id, label, min=0.01, max=Infinity){ return makeRule(id, label, [
    { test:v=>v !== '', msg:`${label} is required.` },
    { test:v=>!Number.isNaN(Number(v)) && Number(v)>=min && Number(v)<=max, msg:`${label} must be between ${min} and ${max}.` }
  ]); }
  function futureDate(id, label){ return makeRule(id, label, [
    { test:v=>v !== '', msg:`${label} is required.` },
    { test:v=>{ const d = new Date(v); const now = new Date(); now.setHours(0,0,0,0); return d > now; }, msg:`${label} must be a future date.` }
  ]); }
  function saneFutureDate(id, label, maxDays = 365){ return makeRule(id, label, [
    { test:v=>v !== '', msg:`${label} is required.` },
    { test:v=>{ const d = new Date(v); const now = new Date(); now.setHours(0,0,0,0); const max = new Date(now); max.setDate(max.getDate() + maxDays); return d > now && d <= max; }, msg:`${label} must be within the next ${maxDays} days.` }
  ]); }
  function minAge(id, label='Date of Birth', years=10){ return makeRule(id, label, [
    { test:v=>v !== '', msg:`${label} is required.` },
    { test:v=>{ const dob = new Date(v); const today = new Date(); let age = today.getFullYear() - dob.getFullYear(); const m = today.getMonth() - dob.getMonth(); if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--; return age >= years; }, msg:`You must be at least ${years} years old.` }
  ]); }
  function notStartingWithNumber(id, label){ return makeRule(id, label, [
    { test:v=>v.length>0, msg:`${label} is required.` },
    { test:v=>!/^[0-9]/.test(v), msg:`${label} cannot start with a number.` }
  ]); }
  function custom(id, label, test, msg){ return makeRule(id, label, [{ test, msg }]); }
  function isValidUrlValue(v){
    try { const u = new URL(String(v || '').trim()); return ['http:', 'https:'].includes(u.protocol); } catch { return false; }
  }
  function validate(rules){
    let valid = true;
    (rules || []).forEach(rule => {
      const currentVal = valueOf(rule.id);
      let fieldValid = true;
      for (const check of (rule.checks || [])) {
        if (!check.test(currentVal)) {
          setFieldError(rule.id, check.msg);
          fieldValid = false;
          valid = false;
          break;
        }
      }
      if (fieldValid) clearFieldError(rule.id);
    });
    return valid;
  }

  window.Validation = {
    NAME_RE, PHONE_RE, EMAIL_RE,
    required, name, phone, email, select, minLength, positiveInt, positiveNumber, futureDate, saneFutureDate, minAge, notStartingWithNumber, custom,
    validate, setFieldError, clearFieldError,
    isValidName: v => { const s = String(v || '').trim(); return s.length >= 3 && NAME_RE.test(s); },
    isValidPhone: v => PHONE_RE.test(String(v || '').replace(/\D/g,'')),
    isValidEmail: v => EMAIL_RE.test(String(v || '').trim()),
    isValidUrl: v => isValidUrlValue(v)
  };
})();

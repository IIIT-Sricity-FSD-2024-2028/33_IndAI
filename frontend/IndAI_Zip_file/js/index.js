// ============================================================
// IndAI Platform – Landing Page Scripts (index.js)
// ============================================================

// ---- FAQ Accordion ----
function toggleFaq(el) {
  const item = el.parentElement;
  const isOpen = item.classList.contains("open");
  document.querySelectorAll(".faq-item").forEach(i => {
    i.classList.remove("open");
    i.querySelector(".faq-a").classList.remove("open");
  });
  if (!isOpen) {
    item.classList.add("open");
    item.querySelector(".faq-a").classList.add("open");
  }
}

// ---- Contact Form ----
function submitContact(e) {
  e.preventDefault();
  const rules = [
    Validation.name('c-name', 'Name', 3),
    Validation.email('c-email', 'Email'),
    Validation.minLength('c-message', 'Message', 10)
  ];
  if (!Validation.validate(rules)) return;
  UI && UI.showToast ? UI.showToast("Thank you. Your message has been sent.") : null;
  e.target.reset();
}


// ---- Scroll Reveal ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
}, { threshold: 0.1 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// ---- Animated Counter ----
function animateCounter(el, target, prefix, suffix) {
  let start = 0;
  const duration = 2000;
  const step = 16;
  const increment = target / (duration / step);
  const timer = setInterval(() => {
    start = Math.min(start + increment, target);
    el.textContent = prefix + Math.floor(start).toLocaleString() + suffix;
    if (start >= target) clearInterval(timer);
  }, step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = "1";
      const target = parseInt(e.target.dataset.target || "0");
      const prefix = e.target.dataset.prefix || "";
      const suffix = e.target.dataset.suffix || "";
      animateCounter(e.target, target, prefix, suffix);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll("[data-target]").forEach(el => counterObserver.observe(el));

// ---- Smooth Scroll for nav links ----
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ---- Active nav link on scroll ----
const sections = document.querySelectorAll("section[id], div[id]");
const navLinks  = document.querySelectorAll(".nav-links a[href^='#']");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + current);
  });
});

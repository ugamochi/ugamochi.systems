/**
 * Otherplace-Native Interactivity
 * Focus: Performance, Zero Dependencies, Clean Transitions
 */

document.addEventListener('DOMContentLoaded', () => {
  initRevealAnimations();
  initNavScroll();
  initMobileNav();
  initFaq();
  initLeadForms();
});

const FORM_SUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/ugamochi.pavel@gmail.com';
const MIN_FILL_TIME_MS = 2500;
const RESUBMIT_COOLDOWN_MS = 60000;
const REQUEST_TIMEOUT_MS = 12000;

/**
 * Reveal sections/elements as they enter the viewport
 */
function initRevealAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Once visible, we can stop observing this specific element
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/**
 * Handle nav appearance and scroll states
 */
function initNavScroll() {
  const nav = document.querySelector('.nav');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Add border/background intensity on scroll
    if (currentScrollY > 10) {
      nav.style.backgroundColor = 'rgba(8, 15, 17, 0.95)';
    } else {
      nav.style.backgroundColor = 'rgba(8, 15, 17, 0.9)';
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
}

/**
 * Mobile nav toggle
 */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.textContent = links.classList.contains('open') ? 'CLOSE' : 'MENU';
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.textContent = 'MENU';
    });
  });
}

/**
 * FAQ accordion toggle
 */
function initFaq() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      item.classList.toggle('active');
    });
  });
}

/**
 * Lightweight email delivery for lead forms via FormSubmit (no backend needed)
 */
function initLeadForms() {
  const forms = document.querySelectorAll('.lead-form');
  if (!forms.length) return;

  forms.forEach(form => {
    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const mountedAt = Date.now();
    let humanInteracted = false;

    // Extra honeypot field (kept off-screen) to catch basic bots.
    let stealthHoneypot = form.querySelector('input[name="company_website"]');
    if (!stealthHoneypot) {
      stealthHoneypot = document.createElement('input');
      stealthHoneypot.type = 'text';
      stealthHoneypot.name = 'company_website';
      stealthHoneypot.autocomplete = 'off';
      stealthHoneypot.tabIndex = -1;
      stealthHoneypot.setAttribute('aria-hidden', 'true');
      stealthHoneypot.style.position = 'absolute';
      stealthHoneypot.style.left = '-10000px';
      stealthHoneypot.style.opacity = '0';
      form.appendChild(stealthHoneypot);
    }

    const markHumanInteraction = () => { humanInteracted = true; };
    form.addEventListener('pointerdown', markHumanInteraction, { passive: true });
    form.addEventListener('keydown', markHumanInteraction, { passive: true });
    form.addEventListener('touchstart', markHumanInteraction, { passive: true });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Basic anti-bot checks.
      const honeypot = form.querySelector('input[name="website"]');
      const builtInHoney = form.querySelector('input[name="_honey"]');
      if (
        (honeypot && honeypot.value.trim() !== '') ||
        (stealthHoneypot && stealthHoneypot.value.trim() !== '') ||
        (builtInHoney && builtInHoney.value.trim() !== '')
      ) {
        return;
      }

      if (Date.now() - mountedAt < MIN_FILL_TIME_MS) {
        setFormStatus(statusEl, 'error', 'Please take a moment to complete the form.');
        return;
      }

      if (!humanInteracted) {
        setFormStatus(statusEl, 'error', 'Please interact with the form before submitting.');
        return;
      }

      const formFingerprint = `lead-form:${window.location.pathname}`;
      const lastSubmitAt = Number(window.localStorage.getItem(formFingerprint) || 0);
      if (Date.now() - lastSubmitAt < RESUBMIT_COOLDOWN_MS) {
        setFormStatus(statusEl, 'error', 'Please wait one minute before sending another message.');
        return;
      }

      const formData = new FormData(form);
      const name = String(formData.get('name') || '').trim().replace(/\s+/g, ' ');
      const email = String(formData.get('email') || '').trim().toLowerCase();
      const company = String(formData.get('company') || '').trim().replace(/\s+/g, ' ');
      const message = String(formData.get('message') || '').trim().replace(/\s+/g, ' ');

      if (!isValidName(name)) {
        setFormStatus(statusEl, 'error', 'Please enter your full name.');
        return;
      }

      if (!isValidEmail(email)) {
        setFormStatus(statusEl, 'error', 'Please enter a valid email address.');
        return;
      }

      if (message.length > 2000) {
        setFormStatus(statusEl, 'error', 'Message is too long. Please keep it under 2000 characters.');
        return;
      }

      if (countUrls(`${company} ${message}`) > 2) {
        setFormStatus(statusEl, 'error', 'Please remove excessive links and try again.');
        return;
      }

      if (!name || !email) {
        setFormStatus(statusEl, 'error', 'Please fill in your name and email.');
        return;
      }

      const payload = {
        name,
        email,
        company,
        message,
        source_url: window.location.href,
        submitted_at: new Date().toISOString(),
        _subject: `New website lead from ${window.location.pathname}`,
        _replyto: email,
        _template: 'table',
        _captcha: 'false'
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.innerHTML;
        submitBtn.textContent = 'Sending...';
      }
      setFormStatus(statusEl, '', '');

      try {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const response = await fetch(FORM_SUBMIT_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        window.clearTimeout(timeoutId);

        const result = await response.json().catch(() => null);
        if (!response.ok || (result && result.success === false)) {
          throw new Error('Form submission failed');
        }

        window.localStorage.setItem(formFingerprint, String(Date.now()));
        form.reset();
        setFormStatus(statusEl, 'success', 'Thanks! Your message was sent. I will reply by email.');
      } catch (error) {
        setFormStatus(statusEl, 'error', 'Could not send right now. Please email me at ugamochi.pavel@gmail.com.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitBtn.dataset.originalText || 'Submit';
        }
      }
    });
  });
}

function setFormStatus(statusEl, type, message) {
  if (!statusEl) return;

  statusEl.classList.remove('success', 'error');
  if (type) statusEl.classList.add(type);

  statusEl.textContent = message;
  statusEl.style.display = message ? 'block' : 'none';
}

function isValidName(name) {
  if (!name || name.length < 2 || name.length > 80) return false;
  return /[A-Za-z]/.test(name);
}

function isValidEmail(email) {
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function countUrls(text) {
  if (!text) return 0;
  const matches = text.match(/https?:\/\/|www\./gi);
  return matches ? matches.length : 0;
}

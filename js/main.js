/**
 * Otherplace-Native Interactivity
 * Focus: Performance, Zero Dependencies, Clean Transitions
 */

document.addEventListener('DOMContentLoaded', () => {
  initRevealAnimations();
  initNavScroll();
  initMobileNav();
  initFaq();
});

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

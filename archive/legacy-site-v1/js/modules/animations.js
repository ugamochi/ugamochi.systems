function showRevealFallback() {
  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('js-revealed');
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.animation = 'none';
  });
}

export function initAnimations() {
  // Signal to CSS that JS is running (cancels CSS fallback animation)
  document.documentElement.classList.add('reveal-ready');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (!prefersReduced && hasGsap) {
    try {
      window.gsap.registerPlugin(window.ScrollTrigger);

      // Kill CSS reveal system — GSAP takes over
      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('reveal');
        el.style.opacity = 1;
        el.style.transform = 'none';
        el.style.animation = 'none';
      });

      // ── 1. Hero entrance: staggered fade-in ──
      const heroTl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .from('.hero-tag', { opacity: 0, y: 10, duration: 0.45 })
        .from('.hero h1', { opacity: 0, y: 14, duration: 0.55 }, '-=0.2')
        .from('.hero-sub', { opacity: 0, y: 10, duration: 0.45 }, '-=0.28')
        .from('.hero-actions', { opacity: 0, y: 8, duration: 0.4 }, '-=0.25')
        .from('.hero-proof', { opacity: 0, y: 8, duration: 0.4 }, '-=0.2')
        .call(() => document.querySelector('.hero h1 em')?.classList.add('underlined'));

      // ── 2. Hero glow: subtle parallax on scroll ──
      window.gsap.to('.hero-glow', {
        y: -42,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      window.gsap.to('.hero-grid-bg', {
        opacity: 0.22,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: '60% top',
          end: 'bottom top',
          scrub: true
        }
      });

      // ── 3. Section titles: slide in from left with accent line ──
      window.gsap.utils.toArray('.section-label').forEach(label => {
        window.gsap.from(label, {
          x: -12,
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: { trigger: label, start: 'top 88%', toggleActions: 'play none none none' }
        });
      });

      window.gsap.utils.toArray('.section-title').forEach(title => {
        window.gsap.from(title, {
          y: 12,
          opacity: 0,
          duration: 0.45,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { trigger: title, start: 'top 88%', toggleActions: 'play none none none' }
        });
      });

      window.gsap.utils.toArray('.section-desc').forEach(desc => {
        window.gsap.from(desc, {
          y: 10,
          opacity: 0,
          duration: 0.36,
          delay: 0.06,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: { trigger: desc, start: 'top 88%', toggleActions: 'play none none none' }
        });
      });

      // ── 4. Cards: staggered entrance per grid ──
      const cardGrids = [
        '.problem-grid',
        '.services-grid',
        '.audience-grid',
        '.results-grid',
        '.testimonials-grid'
      ];

      cardGrids.forEach(selector => {
        const grid = document.querySelector(selector);
        if (!grid) return;
        window.gsap.from(grid.children, {
          y: 16,
          opacity: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { trigger: grid, start: 'top 85%', toggleActions: 'play none none none' }
        });
      });

      // ── 5. Process steps: stagger with slight scale ──
      window.gsap.from('.process-step', {
        y: 14,
        opacity: 0,
        duration: 0.42,
        stagger: 0.09,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.process-steps', start: 'top 85%', toggleActions: 'play none none none' }
      });

      // ── 6. Framework stack: layers cascade down ──
      window.gsap.from('.fw-layer', {
        x: -10,
        opacity: 0,
        duration: 0.35,
        stagger: 0.08,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.framework-visual', start: 'top 80%', toggleActions: 'play none none none' }
      });

      window.gsap.from('.framework-text > *', {
        y: 10,
        opacity: 0,
        duration: 0.35,
        stagger: 0.06,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.framework-text', start: 'top 80%', toggleActions: 'play none none none' }
      });

      // ── 7. Result numbers: count-up animation ──
      window.gsap.utils.toArray('.result-num').forEach(num => {
        const text = num.textContent.trim();
        const match = text.match(/^([<>]?)(\d+)(.*)$/);
        if (!match) return;

        const prefix = match[1];
        const target = parseInt(match[2]);
        const suffix = match[3];
        const obj = { val: 0 };

        window.gsap.to(obj, {
          val: target,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: num, start: 'top 90%', toggleActions: 'play none none none' },
          onUpdate: () => {
            num.textContent = prefix + Math.round(obj.val) + suffix;
          }
        });
      });

      // ── 8. FAQ items: subtle stagger ──
      window.gsap.utils.toArray('.faq-list').forEach(list => {
        window.gsap.from(list.querySelectorAll('.faq-item'), {
          y: 10,
          opacity: 0,
          duration: 0.32,
          stagger: 0.06,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: { trigger: list, start: 'top 85%', toggleActions: 'play none none none' }
        });
      });

      // ── 9. CTA section: gentle scale-up ──
      window.gsap.from('.cta-content', {
        y: 14,
        opacity: 0,
        duration: 0.45,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.cta-section', start: 'top 80%', toggleActions: 'play none none none' }
      });

      // ── 10. CTA glow: parallax drift ──
      window.gsap.to('.cta-glow', {
        y: -24,
        ease: 'none',
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });

      // ── 11. Subtle pointer polish on fine pointers only ──
      if (window.matchMedia('(pointer:fine)').matches) {
        document.querySelectorAll('.service-card').forEach(card => {
          card.addEventListener('mouseenter', () => {
            window.gsap.to(card, {
              y: -2,
              duration: 0.2,
              ease: 'power2.out'
            });
          });

          card.addEventListener('mouseleave', () => {
            window.gsap.to(card, {
              y: 0,
              duration: 0.25,
              ease: 'power2.out'
            });
          });
        });
      }

      // ── 13. Hero em underline reveal ──
      setTimeout(() => {
        document.querySelectorAll('.hero h1 em').forEach(em => em.classList.add('underlined'));
      }, 1200);

      // ── 12. Accent text shimmer on section titles ──
      window.gsap.utils.toArray('.section-title em').forEach(em => {
        window.gsap.fromTo(em, {
          backgroundImage: 'linear-gradient(90deg, var(--accent-light) 0%, var(--accent-secondary) 50%, var(--accent-light) 100%)',
          backgroundSize: '200% 100%',
          backgroundClip: 'text',
          webkitBackgroundClip: 'text',
          backgroundPosition: '100% 0'
        }, {
          backgroundPosition: '0% 0',
          duration: 1.2,
          ease: 'power1.inOut',
          scrollTrigger: { trigger: em, start: 'top 88%', toggleActions: 'play none none none' }
        });
      });

      // ── 13. Problem card icon pulse on hover ──
      document.querySelectorAll('.problem-card').forEach(card => {
        const icon = card.querySelector('.problem-icon');
        if (!icon) return;
        card.addEventListener('mouseenter', () => {
          window.gsap.fromTo(icon, { scale: 1 }, { scale: 1.04, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 });
        });
      });

      window.ScrollTrigger?.refresh?.();
    } catch (err) {
      console.warn('[animations] GSAP/ScrollTrigger failed, showing content', err);
      showRevealFallback();
    }
  } else {
    showRevealFallback();
  }
}

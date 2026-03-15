# ugamochi.systems — Project Context for Claude

## What This Site Is

Pavel Ugamoti's consulting business site. Services: AI automation systems for law firms, accounting practices, and marketing agencies. Stack: vanilla HTML/CSS/JS, n8n webhook for lead forms.

## Directory Structure

```
/                    → Homepage (index.html)
/services/           → 6 service detail pages (dynamically rendered from js/data/service-pages.js)
/book-discovery-call/→ Booking page
/blog/               → SEO content strategy (see /blog/SEO-STRATEGY.md)
```

## Blog — SEO Content Strategy

The `/blog/` directory implements the strategy from `/blog/SEO-STRATEGY.md`. Key points:

**Goal:** Rank for high buying-intent keywords → drive discovery call bookings + affiliate income + paid placements.

**Content angles:**
1. Tool comparisons (n8n vs Make.com, etc.) — people evaluating automation tools who need a consultant to implement
2. Niche automation guides (AI automation for law firms, etc.) — Pavel's exact buyer personas

**Tech stack for blog:**
- Each article is a static HTML page under `/blog/[slug]/index.html`
- CSS: `/blog/css/blog.css` — imports variables from `../../css/base/variables.css`
- JS: `/blog/js/blog.js` — imports nav, theme, faq modules from `../../js/modules/`
- No build step, no framework — consistent with main site

**Adding a new article:**
1. Create `/blog/[slug]/index.html` — copy structure from an existing article
2. Update `/blog/index.html` — add an `.article-card` entry
3. Set canonical URL, OG tags, FAQ schema in `<head>`
4. Add internal links to relevant `/services/` pages
5. Follow the SEO checklist in `/blog/SEO-STRATEGY.md`

**Monetization per article:**
- CTA band at bottom → `/book-discovery-call/` (primary conversion)
- Affiliate links inline with `rel="sponsored"` + disclosure banner
- Sidebar CTA card always present

## CSS Architecture

Main site: `/css/styles.css` imports all modules (base, components, layout).
Blog: `/blog/css/blog.css` imports only `variables.css`, `reset.css`, and `nav.css` from parent.

CSS variables (dark/light theme): `/css/base/variables.css`
- Tokens are semantic + HSL-based (background/foreground/surface/accent/border/ring), then bridged to component vars.
- Current visual direction is **clean minimal** with a warm Claude-like accent palette (orange/amber), not neon/cyan.
- Typography defaults are system-safe (`Segoe UI` family + monospace fallback) to avoid per-page font-loading mismatch.

### Current Design Constraints (important)

- Keep visuals simple: subtle background glow, very low-noise texture, and restrained effects.
- Preserve JS hook contracts used by animations and interactions (`.reveal`, `.reveal-ready`, `.service-anim`, `.in-view`, FAQ/nav state classes).
- Button color hierarchy must stay consistent across all pages:
  - Primary CTAs: `var(--color-cta)` with dark foreground text
  - Secondary ghost buttons: transparent with `--border` and text-first emphasis
  - Tertiary action links (service/article links): accent text treatment only
- Navigation CTA must be styled via `.nav-links .nav-cta` to avoid specificity overrides from `.nav-links a`.

## JS Architecture

Main site: `/js/main.js` — bootstraps nav, theme, form, animations, service-cards, faq.
Blog: `/blog/js/blog.js` — bootstraps nav, theme, faq only.
All modules use `safeInit` (try/catch) so missing elements fail silently.

## Lead Form

Webhook URL stored in `<meta name="lead-webhook-url">`. Handled by `/js/modules/form.js`.
Endpoint: `https://n8n-service-uwaf.onrender.com/webhook/lead-form`

## Keyword Research Targets (next articles)

Priority targets from SEO strategy:
- "best AI tools for accounting firms"
- "n8n vs Zapier 2026"
- "client onboarding automation for agencies"
- "RAG system for professional services"
- "AI document processing software"

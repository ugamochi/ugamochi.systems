# SEO Content Strategy: Blog Section for ugamochi.systems

## Context

The YouTube video demonstrates a workflow where Claude is used to generate SEO-optimized listicle/guide articles that rank quickly on Google for high buying-intent keywords. The strategy has two payoffs: Google traffic from people actively looking to buy/hire, and LLM citation traffic (ChatGPT, Perplexity) where the content gets referenced in AI answers.

For ugamochi.systems (Pavel's AI automation consulting business), this means creating a `/blog/` section with articles targeting:
- **Tool comparisons** (e.g., "n8n vs Make.com", "best AI automation tools for law firms") — people evaluating tools who need a consultant to implement them
- **Niche automation guides** (e.g., "AI automation for law firms 2026") — Pavel's exact buyer personas researching before hiring

The goal: capture high-intent traffic → convert to discovery call bookings.

---

## What to Build

A self-contained `/blog/` directory inside the existing repo with:
- Blog index listing page
- Individual article pages
- Blog-specific CSS that imports existing site variables (zero duplication)
- Nav matching the existing site

---

## File Structure to Create

```
blog/
├── index.html                              # Blog listing page
├── css/
│   └── blog.css                            # Blog styles (imports ../css/base/variables.css)
├── n8n-vs-make-automation-comparison/
│   └── index.html                          # Article 1: tool comparison
└── ai-automation-for-law-firms-guide/
    └── index.html                          # Article 2: niche buyer persona guide
```

---

## Critical Files to Reference (existing site)

- **CSS variables**: `/css/base/variables.css` — all custom properties to reuse
- **Nav HTML pattern**: `/index.html` (lines ~1-30) — copy nav structure exactly
- **Footer HTML pattern**: `/index.html` (last ~20 lines) — copy footer
- **Typography/fonts**: Google Fonts (Geist, JetBrains Mono) — already loaded via CDN

---

## Implementation Plan

### Step 1: `blog/css/blog.css`

Import site variables and write blog-specific layout:
```css
@import url('../../css/base/variables.css');
/* Google Fonts */
/* Blog-specific: article grid, prose styles, tag chips, hero, breadcrumbs */
```

Key sections:
- `.blog-grid` — 2-column card grid for article listings (matches services grid pattern)
- `.article-prose` — readable prose width (~70ch), comfortable line height
- `.article-hero` — article title, meta (date, read time, tags)
- `.article-toc` — optional sticky table of contents sidebar
- Reuse existing nav/footer CSS patterns (`.nav`, `.footer`) via CSS variables

### Step 2: `blog/index.html` — Blog listing page

Structure:
```
<nav> (identical to existing site nav — links updated to ../ paths)
<main>
  <section class="blog-hero"> — headline + subtitle
  <section class="blog-grid"> — article cards (title, excerpt, tags, date, CTA)
</main>
<footer> (identical to existing site footer)
```

Nav links: Home `../`, Services `../#services`, Blog (active), Book Call `../book-discovery-call/`

### Step 3: Two initial articles (see Claude prompts below)

Each article page structure:
```
<nav>
<article>
  <header class="article-hero"> — title, date, read time, tags
  <div class="article-body">
    — intro, table of contents
    — H2 sections (listicle items or guide chapters)
    — comparison tables, bullet lists, call-to-action to book discovery call
    — FAQ section (with JSON-LD FAQ schema)
  </div>
</article>
<section class="cta-band"> — "Ready to implement? Book a discovery call"
<footer>
```

---

## Article 1: Tool Comparison

**Target keyword**: `n8n vs Make.com`
**Secondary keywords**: `n8n alternatives`, `best workflow automation tools 2026`
**Title**: "n8n vs Make.com (2026): Which Automation Tool Is Right for Your Business?"
**Buying intent**: These people are evaluating tools — they need someone to implement whichever they pick.
**CTA**: "Need help implementing n8n or Make.com? [Book a free discovery call →]"

**Claude prompt to generate content**:
```
Write an article titled "n8n vs Make.com (2026): Which Automation Tool Is Right for Your Business?"
optimized to rank for the keyword "n8n vs Make.com" and variations like "n8n alternatives" and
"best workflow automation tools 2026", with the goal of ranking first on Google for those keywords.

The article should:
- Be written for service-based business owners (law firms, accounting practices, marketing agencies)
  evaluating which automation tool to use or hire someone to implement
- Include: intro, quick comparison table (pricing, ease of use, integrations, self-hosted vs cloud,
  scalability), deep dive into each tool (3-4 H2 sections each), a "which should you choose"
  section, a FAQ section (5 questions), and a conclusion
- Use concrete examples relevant to professional services firms
- Be comprehensive (1,500–2,500 words), include alt text suggestions for 2-3 images
- Naturally include the keywords: n8n vs Make.com, n8n alternatives, workflow automation tools,
  AI automation, n8n self-hosted
- Format in clean HTML (article body only, no full page — just the H1 through closing paragraph)
```

---

## Article 2: Niche Buyer Persona Guide

**Target keyword**: `AI automation for law firms`
**Secondary keywords**: `law firm automation software`, `legal workflow automation`
**Title**: "AI Automation for Law Firms: The 2026 Complete Guide"
**Buying intent**: Law firms researching before hiring a consultant — Pavel's exact ICP.
**CTA**: "Want this built for your firm? [Book a free discovery call →]"

**Claude prompt**:
```
Write an article titled "AI Automation for Law Firms: The 2026 Complete Guide"
optimized to rank for the keyword "AI automation for law firms" and variations like
"law firm automation software" and "legal workflow automation".

The article should:
- Target law firm managing partners and operations directors researching AI automation
- Cover: why law firms need automation now, the top 5 processes to automate (client intake,
  document review, billing/invoicing, internal knowledge base, performance reporting),
  what tools to use (n8n, OpenAI, Claude, document intelligence), how to evaluate vendors/consultants,
  ROI expectations (time saved, cost reduced), a FAQ section (5 questions)
- Be authoritative and practical (2,000–3,000 words)
- Naturally include keywords: AI automation for law firms, legal workflow automation, law firm
  AI tools, client intake automation, document automation legal
- Format in clean HTML (article body only)
```

---

## SEO Optimization Checklist (apply to each article before publishing)

1. **Title tag** contains primary keyword exactly
2. **Meta description** 150–160 chars, contains keyword, has a hook
3. **H1** matches title tag
4. **First 100 words** contain the primary keyword naturally
5. **Images** have descriptive alt text with keywords
6. **Internal links** — link to relevant service pages (e.g., n8n article → `/services/ai-lead-pipeline-qualification-engine/`)
7. **External links** — link to n8n.io, make.com docs, credible sources
8. **FAQ section** has JSON-LD FAQ schema (`@type: FAQPage`)
9. **Canonical URL** set to the article's own URL
10. **OG tags** set for social sharing

---

## Linking the Blog into the Existing Site

- Add "Blog" link to main site nav (`index.html` and all service pages)
- Add a blog teaser section on the homepage (optional, phase 2)
- Internal links from service pages → relevant blog articles (e.g., the Law Firms service page → the law firm guide)

---

## Monetization Strategy (3 revenue streams)

### 1. Service Leads → Discovery Calls
Every article ends with a CTA band: *"Need this built for your [law firm / agency / accounting practice]? Book a free 30-min discovery call."* Link to `/book-discovery-call/`. This is the highest-value conversion (~EUR 1,500–15,000 per client).

### 2. Affiliate Commissions (passive, per article)
Add affiliate links throughout articles when recommending specific tools. Target programs:

| Tool | Program | Commission |
|------|---------|------------|
| n8n Cloud | n8n Partner Program | Recurring % |
| Make.com | Make Affiliate Program | 20–30% recurring |
| HubSpot | HubSpot Affiliate | 30% recurring for 1 year |
| OpenAI API | Not available yet — use alternatives | — |
| Airtable | Airtable Affiliate | Flat per signup |

**Implementation**: Add a short "Disclosure: Some links below are affiliate links" note at the top of comparison articles. Use UTM-tagged affiliate links. This turns every article into a passive income source even if no one books a discovery call.

### 3. Paid Placements / Sponsored Spots
As the video creator explains: once articles rank AND get cited by LLMs (ChatGPT, Perplexity), the article becomes real estate you can charge tool vendors for.

**How to implement**:
- Add a `#featured` or `#sponsored` badge variant to article cards
- Create a `/advertise/` page explaining that your articles are cited by LLMs for target keywords
- Outreach script: *"My article '[title]' ranks #1 for '[keyword]' and is cited by ChatGPT when users ask '[prompt]'. I have an open featured spot — [price] for 6 months."*
- Price benchmarks: EUR 200–1,000/article/6 months depending on traffic + LLM citation volume
- Track which prompts cite your articles using ChatGPT/Perplexity and document them as social proof for vendors

**Note**: Label sponsored content clearly ("Sponsored" or "Featured") to maintain trust and comply with FTC/EU disclosure rules.

---

## Keyword Research Approach (ongoing)

Use this framework to find more articles:
1. Think of a tool your clients use or compare (n8n, Make, Zapier, OpenAI, Claude, HubSpot)
2. Search `[tool] vs [competitor]` or `best [tool] for [niche]` in Ahrefs/Google Search Console
3. Check if competitors rank for it — if none of them have an article, easier to win
4. Priority: keyword difficulty < 30, buying intent high, volume > 100/month

**High-priority targets after first two articles:**
- "best AI tools for accounting firms"
- "n8n vs Zapier 2026"
- "client onboarding automation for agencies"
- "RAG system for professional services"
- "AI document processing software"

---

## Verification

1. Open `blog/index.html` in browser — check nav links resolve, cards display correctly
2. Open each article page — check prose readability, FAQ accordion, CTA button
3. Validate JSON-LD schema at https://search.google.com/test/rich-results
4. Check meta tags at https://metatags.io
5. Run Lighthouse audit on each article page (target: 90+ Performance, 90+ SEO)
6. Submit blog pages to Google Search Console after push

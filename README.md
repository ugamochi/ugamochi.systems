# pavel.systems

> Personal portfolio website for Pavel Ugamoti — Agentic Architect

A single-page portfolio website showcasing AI automation services for professional services businesses (law firms, accounting practices, and service agencies).

## 🌟 Features

- **Modern Design**: Dark theme with lime accent, professional typography, smooth animations
- **AI-Powered Contact Form**: Lead capture with planned AI qualification pipeline
- **GSAP Animations**: Scroll-triggered animations, magnetic buttons, card hover effects
- **Fully Responsive**: Mobile-first design with breakpoints at 1024px, 768px, and 480px
- **Accessibility**: Semantic HTML, ARIA labels, skip links, keyboard navigation
- **Performance**: Single-file architecture, optimized loading, ~50KB HTML

## 🛠 Tech Stack

**Frontend:**
- Pure HTML5, CSS3, JavaScript (no framework)
- GSAP 3.12.5 + ScrollTrigger for animations
- Google Fonts: Instrument Serif, DM Sans, JetBrains Mono
- CSS Custom Properties for theming

**Backend (Contact Form - Planned):**
- n8n for workflow automation
- Gmail for email notifications
- Google Sheets for lead tracking
- OpenAI/Anthropic API for AI lead scoring

## 📁 Project Structure

```
pavel.systems/
├── index.html          # Single-file website (2,080+ lines)
│   ├── CSS (lines 11-1253)
│   ├── HTML (lines 1255-1774)
│   └── JavaScript (lines 1776-2178)
├── README.md           # This file
├── .gitignore          # Git exclusions
└── n8n-workflows/      # (To be created) n8n workflow exports
    ├── stage-1-basic.json
    ├── stage-2-sheets.json
    ├── stage-3-ai-scoring.json
    └── stage-4-automated.json
```

## 🚀 Quick Start

### Local Development

1. **Clone the repository:**
```bash
git clone http://local_proxy@127.0.0.1:45468/git/ugamochi/pavel.systems
cd pavel.systems
```

2. **Open in browser:**
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve

# Or just open index.html directly in your browser
open index.html
```

3. **Visit:** `http://localhost:8000`

### No Build Process Required

This is a static HTML website with no build dependencies. The entire site is contained in `index.html`.

## 📧 Contact Form Setup

The contact form is currently in development mode. To enable it:

### Stage 1: Basic Email Notifications

1. **Set up n8n:**
   - Create account at https://cloud.n8n.io
   - Or self-host: https://docs.n8n.io/hosting/

2. **Configure Gmail:**
   - In n8n: Credentials → Add Credential → Gmail OAuth2
   - Follow OAuth flow to connect your Gmail account

3. **Create Workflow:**
   - Import `n8n-workflows/stage-1-basic.json` (once created)
   - Or manually create:
     1. Webhook node (POST /lead-form)
     2. Set node (clean data)
     3. Gmail node #1 (notify yourself)
     4. Gmail node #2 (confirm to lead)
     5. Webhook Response node

4. **Update Website:**
   - In `index.html` line ~2121, replace:
     ```javascript
     const webhookUrl = 'YOUR_N8N_WEBHOOK_URL';
     ```
   - With your actual n8n webhook URL

5. **Test:**
   - Submit test form
   - Check emails received

### Stage 2-4: Advanced Features

See `docs/FORM_SETUP.md` (to be created) for:
- Google Sheets integration
- AI lead scoring
- Automated personalized responses

## 🌐 Deployment

### Option 1: Netlify (Recommended)

1. **Connect repository:**
   - Log in to Netlify
   - New Site → Import from Git
   - Select this repository

2. **Configure:**
   - Build command: (leave empty)
   - Publish directory: `/`

3. **Deploy:**
   - Click "Deploy site"
   - Site will be live at `https://your-site.netlify.app`

4. **Custom domain:**
   - Site settings → Domain management
   - Add custom domain: `pavel.systems`

### Option 2: Vercel

```bash
npm i -g vercel
vercel
```

### Option 3: Traditional Hosting

1. Upload `index.html` to your web server
2. Ensure HTTPS is enabled
3. Done!

## 📝 Content Sections

1. **Navigation** - Fixed header with smooth scroll
2. **Hero** - Value proposition + proof metrics
3. **Problem** - Client pain points (3 cards)
4. **Services** - 6 service offerings with metrics
5. **Process** - 3-phase workflow
6. **Results** - Impact metrics (4 cards)
7. **Audience** - Target industries (3 cards)
8. **Framework** - "Agentic Stack" explanation
9. **Testimonials** - Client quotes (2 testimonials)
10. **FAQ** - 8 frequently asked questions
11. **CTA + Contact Form** - Lead capture form
12. **Footer** - Copyright + social links

## 🔧 Customization

### Update Contact Information

Replace placeholder content in `index.html`:

**Social Links** (lines 1769-1771):
```html
<li><a href="https://linkedin.com/in/YOUR_PROFILE">LinkedIn</a></li>
<li><a href="https://twitter.com/YOUR_HANDLE">X / Twitter</a></li>
```

**Footer Copyright** (line 1767):
```html
<div class="footer-left">&copy; 2026 Pavel Ugamoti. Agentic Architect.</div>
```

### Update Colors

Edit CSS custom properties (lines 12-29):
```css
:root {
  --bg: #0A0A0B;              /* Background */
  --accent: #C8FF00;          /* Lime accent */
  --text-primary: #F0EEE6;    /* Primary text */
  /* ... */
}
```

### Add Analytics

Add before closing `</head>` tag:
```html
<script defer data-domain="pavel.systems" src="https://plausible.io/js/script.js"></script>
```

## 🧪 Testing

**Browser Compatibility:**
- Chrome/Edge ✓
- Safari (macOS/iOS) ✓
- Firefox ✓

**Performance:**
- Lighthouse score: Aim for 90+ in all categories
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s

**Accessibility:**
- WAVE checker: 0 errors
- WCAG AA compliance ✓

**Testing Checklist:**
- [ ] All links work
- [ ] Mobile menu opens/closes
- [ ] FAQ accordions expand/collapse
- [ ] Animations work (or gracefully degrade)
- [ ] Form validates correctly
- [ ] Form submits successfully
- [ ] Email notifications received

## 📚 Resources

- **GSAP Docs**: https://greensock.com/docs/
- **n8n Docs**: https://docs.n8n.io/
- **Deployment Guides**: See `docs/` folder (to be created)

## 🤝 Contributing

This is a personal portfolio site. For bugs or suggestions:
1. Open an issue
2. Or contact directly via the form on the site

## 📄 License

Copyright © 2026 Pavel Ugamoti. All rights reserved.

## 🚧 Roadmap

### Sprint 1 ✅ (Current)
- [x] Contact form UI
- [ ] n8n webhook setup
- [ ] Email notifications
- [ ] Update social links
- [ ] Deploy to production

### Sprint 2 (Week 2)
- [ ] Google Sheets lead tracking
- [ ] SEO meta tags (Open Graph, Twitter Cards)
- [ ] Favicon and og-image
- [ ] Analytics setup

### Sprint 3 (Week 3)
- [ ] AI lead scoring
- [ ] Conditional routing
- [ ] Slack notifications for high-value leads

### Sprint 4 (Week 4)
- [ ] Automated personalized responses
- [ ] Meta case study: "How I Built My Own Lead Pipeline"
- [ ] Accessibility enhancements

### Sprint 5 (Ongoing)
- [ ] Content updates
- [ ] A/B testing
- [ ] Performance optimization

---

Built with ❤️ by Pavel Ugamoti — Agentic Architect

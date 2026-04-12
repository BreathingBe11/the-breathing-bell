# SEO Audit Report — The Breathing Bell
**Date:** 2026-04-12
**Branch:** staging

---

## Before / After Summary

### METADATA

| Item | Before | After |
|------|--------|-------|
| Title (root) | "The Breathing Bell — Breathwork App by Omi Bell" | "Guided Breathwork & Yoga Nidra App \| The Breathing Bell" |
| Title format | Static string | Template: `%s \| The Breathing Bell` for inner pages |
| Meta description | 130 chars, brand-focused | 155 chars, action-oriented, keyword-rich |
| Keywords meta | None | 17 primary + secondary keywords |
| Canonical tag | None | `https://thebreathingbell.com` on root |
| metadataBase | None | `https://thebreathingbell.com` (fixes relative OG image URLs) |
| OG image alt text | None | "The Breathing Bell — Guided Breathwork & Yoga Nidra App by Omi Bell" |
| OG siteName | None | "The Breathing Bell" |
| Author | None | Omi Bell + omibell.com |
| Creator | None | Omi Bell |
| robots meta | None | index/follow on public, noindex/nofollow on private |

### PER-PAGE METADATA

| Page | Before | After |
|------|--------|-------|
| `/` | Root metadata only | Root metadata + canonical |
| `/intake` | Inherited root (wrong title) | "Begin Your Breathwork Session \| The Breathing Bell" + canonical |
| `/login` | Inherited root | noindex, nofollow |
| `/dashboard` | Inherited root | noindex, nofollow |
| `/save` | Inherited root | noindex, nofollow |
| `/session/*` | Inherited root | noindex, nofollow (entire subtree) |
| `/admin/*` | Inherited root | noindex, nofollow (entire subtree) |
| `/forgot-password` | Inherited root | noindex, nofollow |
| `/reset-password` | Inherited root | noindex, nofollow |

### TECHNICAL FILES

| File | Before | After |
|------|--------|-------|
| `robots.txt` | Missing | Created via `src/app/robots.ts` — allows public pages, blocks private routes and /api/ |
| `sitemap.xml` | Missing | Created via `src/app/sitemap.ts` — includes /, /intake, /login with priority + changeFreq |
| `llms.txt` | Missing | Created at `/public/llms.txt` — AI crawler context file |

### STRUCTURED DATA

| Schema | Before | After |
|--------|--------|-------|
| SoftwareApplication | None | Added to root layout — name, category, OS, URL, price, creator |
| FAQPage | None | Added to root layout — 8 Q&As covering all major keyword intents |

### SECURITY HEADERS (vercel.json)

| Header | Before | After |
|--------|--------|-------|
| X-Frame-Options | Missing | DENY |
| X-XSS-Protection | Missing | 1; mode=block |
| X-Content-Type-Options | Missing | nosniff |
| Referrer-Policy | Missing | strict-origin-when-cross-origin |
| Permissions-Policy | Missing | camera=(), microphone=(), geolocation=() |
| Strict-Transport-Security (HSTS) | Missing | max-age=63072000; includeSubDomains; preload |
| Cache-Control (static assets) | Missing | public, max-age=31536000, immutable |

---

## What Was NOT Changed (by design)

- Homepage UI/visual design — untouched
- Font loading — already using next/font/google (optimal, no changes needed)
- Image alt text on BBLogo2.png — already has `alt="The Breathing Bell"`
- OG image generator — already exists at `src/app/opengraph-image.tsx` (1200×630)
- viewport meta — already correct in layout.tsx
- `lang="en"` on html element — already correct
- Navigation links — already use Next.js `<Link href="">` (crawlable anchor tags)

---

## Gaps Remaining (future work)

- FAQ section visible on homepage (would improve E-E-A-T and Rich Results)
- About page with Omi Bell bio and credentials (E-E-A-T signal)
- Blog/content pages (long-tail keyword targeting)
- Google Search Console submission (manual step — see SUBMISSION-CHECKLIST.md)
- Bing Webmaster Tools submission (manual step)

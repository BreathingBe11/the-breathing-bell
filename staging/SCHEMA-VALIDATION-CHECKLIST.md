# Schema Validation Checklist — The Breathing Bell

## Structured Data Added

### 1. SoftwareApplication Schema
- **Location:** Root layout (`src/app/layout.tsx`) — appears on every page
- **Type:** `SoftwareApplication`
- **Fields:** name, applicationCategory, operatingSystem, url, description, offers (free), creator (Omi Bell)

### 2. FAQPage Schema
- **Location:** Root layout (`src/app/layout.tsx`) — appears on every page
- **Type:** `FAQPage`
- **Questions:** 8 Q&As covering stress relief, sleep, techniques, pricing, and the 3B framework

---

## How to Validate

### Google Rich Results Test
1. Go to: https://search.google.com/test/rich-results
2. Enter URL: `https://thebreathingbell.com`
3. Click **Test URL**
4. Look for:
   - ✅ "FAQ" rich result detected
   - ✅ No errors or warnings
5. Repeat for: `https://thebreathingbell.com/intake`

### Google Schema Markup Validator
1. Go to: https://validator.schema.org
2. Enter URL: `https://thebreathingbell.com`
3. Confirm SoftwareApplication and FAQPage both validate without errors

### Expected Rich Results in Google Search
Once indexed, the homepage may show:
- **FAQ dropdowns** directly in search results (expands Q&As inline)
- These significantly increase click-through rate (CTR)

---

## Validation Status

| Schema | Added | Validated |
|--------|-------|-----------|
| SoftwareApplication | ✅ Yes | ⬜ Pending (run after deploy) |
| FAQPage | ✅ Yes | ⬜ Pending (run after deploy) |
| BreadcrumbList | ⬜ Not added | ⬜ Future |
| Person (Omi Bell) | ⬜ Not added | ⬜ Future (needs About page) |

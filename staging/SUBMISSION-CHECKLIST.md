# Submission Checklist — The Breathing Bell SEO
**Complete these steps after the staging branch is merged and deployed to production.**

---

## Step 1 — Google Search Console

### A. Add Your Property
1. Go to: https://search.google.com/search-console
2. Click **Add property**
3. Choose **URL prefix** → enter `https://thebreathingbell.com`
4. Verify ownership via the HTML tag method (add the meta tag to layout.tsx) or via your domain registrar's DNS records

### B. Submit Your Sitemap
1. In Search Console, click **Sitemaps** (left sidebar)
2. Enter: `sitemap.xml`
3. Click **Submit**
4. Confirm status shows "Success" within a few minutes

### C. Request Indexing for Homepage
1. In Search Console, click **URL Inspection** (left sidebar)
2. Enter: `https://thebreathingbell.com`
3. Click **Request Indexing**
4. Repeat for: `https://thebreathingbell.com/intake`

---

## Step 2 — Rich Results Test

1. Go to: https://search.google.com/test/rich-results
2. Test: `https://thebreathingbell.com`
3. Confirm FAQ schema is detected (no errors)
4. Screenshot result for records

---

## Step 3 — PageSpeed Insights

1. Go to: https://pagespeed.web.dev
2. Enter: `https://thebreathingbell.com`
3. Run for both **Mobile** and **Desktop**
4. Note scores for:
   - Performance (target: 90+)
   - Accessibility (target: 90+)
   - Best Practices (target: 90+)
   - SEO (target: 100)
5. Address any flagged issues

---

## Step 4 — Bing Webmaster Tools

1. Go to: https://www.bing.com/webmasters
2. Sign in with a Microsoft account
3. Add site: `https://thebreathingbell.com`
4. Verify via XML file or DNS
5. Submit sitemap: `https://thebreathingbell.com/sitemap.xml`

---

## Step 5 — Validate Schema

1. Go to: https://validator.schema.org
2. Test URL: `https://thebreathingbell.com`
3. Confirm SoftwareApplication and FAQPage show no errors

---

## Step 6 — Verify llms.txt is Accessible

1. Open in browser: `https://thebreathingbell.com/llms.txt`
2. Confirm the file loads and displays the content correctly

---

## Step 7 — Verify robots.txt

1. Open in browser: `https://thebreathingbell.com/robots.txt`
2. Confirm it shows:
   ```
   User-agent: *
   Allow: /
   Disallow: /admin/
   Disallow: /dashboard/
   Disallow: /session/
   Disallow: /save/
   Disallow: /api/
   Sitemap: https://thebreathingbell.com/sitemap.xml
   ```

---

## Step 8 — Verify Security Headers

1. Go to: https://securityheaders.com
2. Enter: `https://thebreathingbell.com`
3. Target grade: **A** or higher
4. Confirm HSTS, X-Frame-Options, X-Content-Type-Options are all present

---

## Ongoing

- Check Search Console weekly for crawl errors or coverage issues
- Monitor **Core Web Vitals** report in Search Console
- Resubmit sitemap whenever new public pages are added

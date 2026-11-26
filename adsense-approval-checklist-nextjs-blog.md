# Google AdSense Approval Checklist for a Next.js Tech Blog

For a blog on tech, AI tools and web development, built with Next.js.

Google's official bar is short: you need your own original content that follows AdSense policies, you must be 18 or older, and you must control the site you submit. Everything below is meant to make your site clearly pass that review. Items marked *(community guideline)* are common practice, not official Google rules.

## 1. Domain and hosting

- [ ] Use your own custom domain (e.g. yourblog.com), not a free subdomain like vercel.app or netlify.app. Free subdomains have limited eligibility.
- [ ] HTTPS enabled with a valid certificate, and www/non-www redirecting to one canonical version
- [ ] You can edit the site's `<head>` and root files (needed for verification and ads.txt)
- [ ] Reliable hosting with no frequent downtime

## 2. Content requirements (the main factor)

- [ ] Every post is 100% original, not copied, spun or lightly rewritten from other sites
- [ ] Posts are genuinely useful: real tutorials, code examples, screenshots from your own testing, comparisons, lessons learned
- [ ] Avoid mass-produced, unedited AI text. Add your own testing, opinions and examples to anything AI-assisted
- [ ] Tool reviews come from actual use, not rewritten product descriptions
- [ ] Publish a solid base of articles before applying. Many guides suggest 15–20 quality articles and steady publishing in the 30 days before applying *(community guideline)*. Google doesn't state a minimum post count, traffic number or domain age, so treat these as safe targets, not rules.
- [ ] Each post: 800–1,500+ words where the topic needs it, with clear H2/H3 structure, short paragraphs, code blocks, and lists or tables where useful
- [ ] Stay in one focused niche (tech, AI tools, web dev) instead of random topics
- [ ] Add author name, short bio and a publish/updated date on each post
- [ ] Facts, versions and pricing are accurate and current
- [ ] Images are your own, screenshots you took, or properly licensed. Don't hotlink or copy others' images.
- [ ] No pages that are empty, "coming soon", or placeholder lorem ipsum

## 3. Required trust pages

Link all of these in the footer:

- [ ] About (who you are, why the blog exists, your expertise)
- [ ] Contact (working email, ideally a contact form)
- [ ] Privacy Policy (must mention Google/third-party cookies and ad personalization)
- [ ] Terms & Conditions
- [ ] Disclaimer
- [ ] Cookie Policy
- [ ] Affiliate disclosure (if you'll use affiliate links, common for AI tools)
- [ ] Author pages

## 4. Navigation and design

Google's readiness page asks for unique, interesting pages, clear and easy navigation, and a layout that helps visitors find what they came for.

- [ ] Header menu with Home, Categories (e.g. AI Tools, Web Dev, Tech News), About, Contact
- [ ] Working search, category and tag pages, and pagination
- [ ] Breadcrumbs and related posts for internal linking
- [ ] No broken links, no redirect loops, and a custom 404 page
- [ ] Fully responsive and mobile-friendly
- [ ] Clean readable typography, no intrusive pop-ups, auto-playing media or full-screen overlays covering content
- [ ] No fake buttons or misleading layouts that trick people into clicking

## 5. Next.js technical checklist

- [ ] **Render content on the server.** Use SSG/ISR/SSR (App Router server components) so article text is in the HTML. Don't load posts only client-side, or the crawler may see a near-empty page.
- [ ] Use the Metadata API for unique `title`, `description`, canonical URL and Open Graph tags on every page
- [ ] Add `app/sitemap.ts` and `app/robots.ts`. Don't block CSS, JS or ads-related paths, and make sure no `noindex` is left over from development.
- [ ] Add `ads.txt` in `/public` (served at yourdomain.com/ads.txt). Your publisher ID is in your AdSense account. A missing or wrong file can stop ads from showing even after approval.
- [ ] Load the AdSense snippet with `next/script`, in the root layout, once. Don't duplicate it per page.
- [ ] Use `next/image` with width/height or `fill` to prevent layout shift, and `next/font` for fonts
- [ ] Reserve fixed space for future ad slots to avoid CLS
- [ ] Performance: target LCP under 2.5s. Also aim for good INP and CLS, and test with Lighthouse and PageSpeed Insights.
- [ ] Add JSON-LD structured data (Article, BreadcrumbList, Organization)
- [ ] Add an RSS feed, a favicon and consistent clean URLs (slugs, no query-string duplicates)
- [ ] Set up Google Search Console, submit the sitemap, and add Google Analytics
- [ ] Check indexing: `site:yourdomain.com` should show your pages in Google before you apply
- [ ] No console errors, no mixed content, no malware or suspicious third-party scripts

## 6. Policy compliance (check before applying)

- [ ] No copyrighted content, pirated software, cracks or leaked material
- [ ] No adult, hateful, violent, dangerous or deceptive content
- [ ] No hacking or malware instructions that enable harm (security content should be educational)
- [ ] No misleading claims in AI tool reviews (e.g. "guaranteed income")
- [ ] Never ask people to click your ads or hint at it, and never click your own ads
- [ ] No traffic from bots, paid click schemes or traffic exchanges
- [ ] Clearly label sponsored and affiliate content
- [ ] For EEA, UK and Swiss visitors, use a Google-certified Consent Management Platform and a cookie banner. Users in those regions need consent before personalized ads.

## 7. Account and identity

- [ ] You are 18 or older
- [ ] One AdSense account per person, with real name and address matching your bank/ID documents
- [ ] Correct phone number and payment details. Google reviews payment details for accuracy as part of account approval, and separately reviews your site for policy compliance.
- [ ] You own or control the site (you can add verification code)
- [ ] Don't apply with a site you don't control or one that mirrors another

## 8. Applying

1. Add your site in AdSense and verify ownership (snippet, ads.txt or meta tag).
2. Don't place manual ad units yet. Wait for approval, then enable Auto ads or place units.
3. Keep publishing during review, which can take days to a few weeks.
4. If rejected, read the reason (commonly "low value content", "site isn't ready" or "policy violation"). Wait 2–4 weeks and make substantial improvements before reapplying, because reapplying immediately without changes usually fails again.

## 9. Pre-submit final test

- [ ] Open every page on a phone, in an incognito window, and read it as a stranger
- [ ] All footer pages load and have real content
- [ ] Sitemap submitted and pages indexed
- [ ] Core Web Vitals pass in Search Console
- [ ] 15–20+ original posts live, published steadily
- [ ] ads.txt returns the correct line

Google's policies and requirements can change, so check the official eligibility page (support.google.com/adsense/answer/9724) before you submit.

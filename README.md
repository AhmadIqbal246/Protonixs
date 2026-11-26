# Protonixs Journal

A server-rendered Next.js blog about AI tools, web development, and technology. The site
includes category, tag, author, and article routes; server-side search and pagination; a
light-first theme toggle; contact and policy pages; structured metadata; an XML sitemap;
and an RSS feed.

## Run locally

```bash
npm install
npm run dev
```

Use `npm run lint` to check the code and `npm run build` to create a production build.

## Publishing articles

Article data lives in `src/data/blog/index.js`. The article list is intentionally empty.
Add only original articles that have been reviewed and tested by their named author. Do not
publish generated filler, unverified results, copied material, private client information,
or screenshots that you do not own or have permission to use.

Each published article should include a unique slug, title, useful description, publication
and update dates, author slug, category slug, tags, and Markdown content. Include real
first-hand observations and evidence, explain failures and limitations, cite external facts,
and verify every code sample and link before publishing.

Authors and categories are maintained in the same data module. Categories without published
articles are not added to the sitemap. Search and pagination use query parameters on `/blog`;
category, tag, author, and article pages are rendered on the server.

## Environment configuration

Copy `.env.example` to `.env.local` and set only the values you use:

- `NEXT_PUBLIC_GTM_ID` enables Google Tag Manager.
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` accepts a `ca-pub-...` publisher ID.
- `NEXT_PUBLIC_CONSENT_PLATFORM_CONFIGURED` must be `true` before analytics or AdSense
  scripts load. Keep it `false` until a suitable Google-certified consent management
  platform is integrated and verified for the regions you serve.
- Google and Bing verification values are used by the root Metadata API.
- SMTP settings power the contact form. Configure `CONTACT_TO` and the SMTP credentials
  before relying on form delivery.

Do not add a placeholder `ads.txt` entry. After AdSense issues a publisher ID, publish the
exact seller line from the account at `/ads.txt`. AdSense approval also depends on the
publisher's account eligibility, original articles, site ownership, and current Google
policies; the software cannot guarantee approval.

## Routes

- `/` and `/blog`: article archive and search
- `/category/[slug]`, `/tag/[slug]`: taxonomy archives
- `/blog/[slug]`: server-rendered article pages
- `/authors` and `/authors/[slug]`: author directory and profiles
- `/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer`, `/cookies`,
  `/affiliate-disclosure`: publisher and trust information
- `/sitemap.xml`, `/robots.txt`, `/feed.xml`: discovery and syndication

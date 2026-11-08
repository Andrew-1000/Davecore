# Davecore Construction website

The public company website for **Davecore Construction**: Nuxt 4 + Vue 3 + Nuxt UI, blue theme. It's generated as a static site and hosted on **GitHub Pages**.

Anything dynamic runs on the **Davecore BQ system**, which is a separate service and repo in `../bq-system`:

| Website feature | Served by the BQ system |
| --- | --- |
| Sign in / my account | `POST /api/auth/token`, `GET /api/auth/me` (bearer token; same accounts as the BQ workspace) |
| My Bills of Quantities | `GET /api/projects` |
| Website controls (admins) | `GET/PUT /api/admin/ref/flags` (switch calculators on or off) |
| Contact, consultation, quote and plan enquiries | `POST /api/site/enquiries` → BQ admin → *Website enquiries* |
| Cost tools | embedded `/embed/estimate` and `/embed/calculators`, plus `/api/public/features` |

GitHub Pages only serves files, so the BQ system must be hosted somewhere that runs Node.js and PostgreSQL. Its URL is set with `NUXT_PUBLIC_BQ_API_BASE`.

## Run locally

```powershell
npm install
copy .env.example .env     # NUXT_PUBLIC_BQ_API_BASE=http://localhost:3000 (the BQ system)
npm run dev                # http://localhost:3010
```

In the BQ system, go to **Admin → Website integration** and add the website's origin (e.g. `http://localhost:3010` or `https://<user>.github.io`). Without it, the browser blocks sign-in, forms and the embedded calculators.

## Deploy to GitHub Pages

1. Create a repository (e.g. `davecore-website`) and push this folder to it.
2. **Settings → Pages → Source: GitHub Actions.**
3. **Settings → Secrets and variables → Actions → Variables:**
   - `BQ_API_BASE`: the public URL of the BQ system (required).
   - `BASE_URL`: only if you use a custom domain; set it to `/`. Otherwise the site is served from `/<repo-name>/`.
4. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds with `nuxt build --preset github_pages` and publishes the result.
5. Add the Pages origin to the BQ system's allowed website origins (see above).

## Editing content

- Company details, services and process: `app/data/site.ts`. Empty phone, email and WhatsApp fields are hidden.
- House plans for sale: `app/data/plans.ts`. Room layouts in metres drive the watermarked previews.
- Theme: `app/app.config.ts` (primary colour) and `app/assets/css/main.css`.

## Not yet included

- **Online plan purchase with M-Pesa STK Push.** It needs Safaricom Daraja credentials and a public HTTPS callback on the hosted BQ system. Until then, "Buy or enquire" sends a plan enquiry.
- Sign-in tokens are kept in the browser's local storage, as static hosting can't set secure cookies across sites. Keep the site free of third-party scripts.

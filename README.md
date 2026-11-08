# Davecore Construction website

The public company website for **Davecore Construction**, built with Nuxt 4, Vue 3 and Nuxt UI (blue theme). It is generated as a static site and hosted on **GitHub Pages**.

GitHub Pages only serves files, so the dynamic parts come from two separate services:

| What | Where | Notes |
| --- | --- | --- |
| Website sign-in (staff) | **Supabase** Auth | Independent of the BQ system: its own accounts |
| House plans, testimonials, contact details | **Supabase** database | Edited in the website admin (`/admin`), shown instantly |
| Plan preview images / full drawing sets (PDF) | **Supabase** storage | Images are public; PDFs are private |
| Enquiries, testimonials sent by clients | **Supabase** database | Read and approved in the website admin |
| Cost calculators (embedded) and their on/off switches | **Davecore BQ system** (`../bq-system`) | Switched on or off in the BQ admin |

Until Supabase is connected, the site still works. It shows the built-in content in `app/data`, sends enquiries to the BQ system, and the sign-in page says that sign-in is not set up yet.

## 1. Set up Supabase (once)

1. Create a free project at <https://supabase.com>. Pick the region closest to Kenya that is offered, e.g. Frankfurt.
2. **SQL Editor → New query**: paste [`supabase/schema.sql`](supabase/schema.sql), then **Run**. This creates the tables, the access rules and the file buckets. Then do the same with [`supabase/seed.sql`](supabase/seed.sql), which loads the current plans and contact details.
3. **Authentication → Sign In / Providers**: keep **Email** on and turn **Allow new users to sign up** off. Only people you add can sign in.
4. **Authentication → URL Configuration**:
   - **Site URL**: `https://<github-user>.github.io/davecore-website/`
   - **Redirect URLs**: add `https://<github-user>.github.io/davecore-website/reset-password` and `http://localhost:3010/reset-password` (for password-reset emails).
5. **Authentication → Users → Add user**: enter your email and a password, and tick *Auto confirm*.
6. Make that user a website admin. In the SQL Editor:
   ```sql
   insert into public.site_admins (user_id, email)
   select id, email from auth.users where email = 'you@example.com';
   ```
   Repeat steps 5 and 6 for each staff member. To remove someone, run `delete from public.site_admins where email = '…';`.
7. **Project Settings → API Keys**: copy the **Project URL** and the **publishable** key (older projects call it the `anon` key).
   - The publishable key is safe in a public website: what it can do is limited by the access rules in `schema.sql`.
   - **Never** use the `secret` / `service_role` key in the website.

## 2. Run locally

```powershell
npm install
copy .env.example .env     # then fill in NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_KEY
npm run dev                # http://localhost:3010
```

- **Website admin:** footer → *Staff sign in*, or go to `/login`.
- **Cost calculators:** also run the BQ system (`../bq-system`, port 3000). In its **Admin → Website integration**, add `http://localhost:3010` to the allowed origins, or the browser blocks the embedded calculators.

## 3. Deploy to GitHub Pages

1. Create a repository (e.g. `davecore-website`) and push this folder to it.
2. **Settings → Pages → Source: GitHub Actions.**
3. **Settings → Secrets and variables → Actions → Variables** (they end up in the public site, so variables are fine):
   - `SUPABASE_URL` and `SUPABASE_KEY`: from step 1.7.
   - `BQ_API_BASE`: the public **https** URL of the hosted BQ system (for the calculators).
   - `BASE_URL`: only if you use a custom domain; set it to `/`. Otherwise the site is served from `/<repo-name>/`.
4. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds the site and publishes it.
5. Add `https://<github-user>.github.io` to the BQ system's allowed website origins.

Content edits made in the website admin show immediately; there is no need to redeploy. Pages are prerendered with the content of the last deploy (for search engines) and refreshed in the visitor's browser. Plans added after the last deploy still open, through the site's `404.html` app fallback.

### Test the GitHub Pages build locally

Pages serves the site from `/<repo-name>/`, so build with that base path:

```bash
# Git Bash: MSYS_NO_PATHCONV=1 stops Git Bash rewriting /davecore-website/ into a Windows path
MSYS_NO_PATHCONV=1 NUXT_APP_BASE_URL=/davecore-website/ npx nuxt build --preset github_pages
```

```powershell
$env:NUXT_APP_BASE_URL = '/davecore-website/'; npx nuxt build --preset github_pages
```

The static site is written to `.output/public`. Serve it under `/davecore-website/` to try it.

## Website admin (`/admin`)

- **House plans:**
  - add, edit, publish or hide plans;
  - upload watermarked preview images (public) and the full drawing set PDF (private);
  - plans can also have a drawn room layout (JSON) instead of images.
- **Testimonials:**
  - real client testimonials only;
  - clients send them from **Share your experience** (`/share-your-experience`, linked in the footer and the testimonials section);
  - they arrive unpublished with a private phone/email, so you can confirm them before approving;
  - staff can also add one a client gave in person, with their permission;
  - the home page section stays hidden until one is published.
- **Enquiries:** contact, consultation, quote and plan enquiries, with status tracking.
- **Contact & company:** phone, WhatsApp, email, address, hours and the company introduction.

## Editing the code

- **Built-in content:** company name and services in `app/data/site.ts`; built-in plans (the fallback and seed data) in `app/data/plans.ts`.
- **Database and access rules:** `supabase/schema.sql`. It is safe to re-run after changes.
- **Seed data:** regenerate `supabase/seed.sql` from `app/data` with `node scripts/make-seed.mjs`.
- **Theme:** `app/app.config.ts` (primary colour) and `app/assets/css/main.css`.

## Not yet included

- **Online plan purchase with M-Pesa STK Push.** It needs Safaricom Daraja credentials and an HTTPS callback, which can be a Supabase Edge Function. The function would confirm payment and then send the buyer a short-lived link to the private PDF. Until then, "Buy or enquire" sends a plan enquiry.

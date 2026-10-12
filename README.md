# STAR MANAGEMENT — Supabase connected version

## 1. Create the admin account
In Supabase, open **Authentication → Users → Add user** and create an email/password account. Confirm the email if required.

## 2. Set the admin email in SQL
Open `SUPABASE-SETUP.sql`. Replace every `admin@example.com` with the exact email used for the admin account. Run the entire SQL file in **SQL Editor**. These policies let everyone read backup links but only that email manage groups and upload icons.

## 3. Enable password login
In Supabase **Authentication → Providers**, make sure Email is enabled. If email confirmation is enabled, confirm the admin account before signing in.

## 4. Publish to GitHub Pages
Upload/replace `index.html`, `style.css`, `script.js`, and `SUPABASE-SETUP.sql` in the root of your `star-management` repository. Keep GitHub Pages pointed to `main` and `/ (root)`. Wait for the deployment to finish, then open your website and sign in.

## Notes
- The project URL and publishable key are configured in `script.js`. A publishable/anon key is expected to be visible in browser code; RLS policies protect the data.
- Never put a Supabase `service_role` or secret key in frontend code.
- `group-icons` is a public bucket so displayed icon images can be fetched without logging in. Only the configured admin email can upload/update/delete objects.
- Backup link URLs are shown as numbered buttons, rather than rendering potentially long URLs directly.

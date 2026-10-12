# STAR MANAGEMENT — Grouped Backup Links Center

Purple-and-black responsive backup-link directory for GitHub Pages. Each group has an editable title, optional description, emoji/symbol icon, optional uploaded image icon, and multiple URLs (one URL per line).

## Files
- `index.html` — page structure
- `style.css` — responsive design
- `script.js` — group rendering, search, admin management, icon upload, JSON import/export

## Publish with GitHub Pages
1. Sign in at https://github.com/
2. Tap **+** → **New repository**.
3. Name it `star-management` and choose **Public**. Create the repository.
4. Open the repository, choose **Add file** → **Upload files**.
5. Upload `index.html`, `style.css`, `script.js`, and `README.md` (upload the files themselves, not the ZIP).
6. Commit changes.
7. Open **Settings** → **Pages**.
8. Under **Build and deployment**, choose **Deploy from a branch**.
9. Choose branch `main`, folder `/(root)`, then **Save**.
10. Wait for deployment. GitHub Pages will show the published URL, usually `https://YOUR-USERNAME.github.io/star-management/`.

## Demo admin panel
- Click **Admin Login**.
- Demo passphrase: `change-this-demo-key`
- Change `DEMO_ADMIN_KEY` near the top of `script.js` for casual demo use only.
- Add a group title, optional emoji/symbol, and optionally upload a PNG/JPG/WEBP icon (max 500 KB). Multiple backup URLs go one per line.
- The example ORION88 group is preloaded.

## IMPORTANT SECURITY LIMITATION
This is a front-end demo only. The passphrase is visible to anyone who inspects the JavaScript, and groups/icons are stored in this browser's `localStorage`. They do not sync to other visitors/devices and can be cleared by the browser. Do not use this demo to protect private links or sensitive information.

For real admin login and a shared link list, connect Supabase or Firebase, enable authentication, store groups/icons in a database or storage bucket, and enforce admin-only create/update/delete permissions with database security rules. Never put service-role keys or private secrets in front-end files.

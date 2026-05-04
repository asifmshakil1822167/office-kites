# Deploying the ERP App (Production Build)

This is a **client-side React + Vite** app. The production build is just static files (HTML/CSS/JS) that can be hosted on any static host or web server.

---

## 1. Prerequisites

Install on your machine:

- **Node.js v18+** (includes npm) — https://nodejs.org/
- **Git** (optional) — https://git-scm.com/
- **VS Code** (optional) — https://code.visualstudio.com/

Verify:
```bash
node -v
npm -v
```

---

## 2. Get the Code

Either unzip `erp-system.zip` or clone the repo, then open the folder in VS Code:
```bash
cd erp-system
code .
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Create the Production Build

```bash
npm run build
```

This generates a **`dist/`** folder containing all the static assets to deploy.

Test it locally first:
```bash
npm run preview
# Opens http://localhost:4173
```

---

## 5. Deploy the `dist/` Folder

Pick one of the options below.

### Option A — Lovable (one click)
Click **Publish** in the top-right of the Lovable editor. Done.

### Option B — Vercel
```bash
npm i -g vercel
vercel --prod
```
Or drag-and-drop the `dist/` folder at https://vercel.com/new.

### Option C — Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```
Or drag-and-drop the `dist/` folder at https://app.netlify.com/drop.

### Option D — GitHub Pages
1. Install: `npm i -D gh-pages`
2. Add to `package.json`:
   ```json
   "scripts": { "deploy": "gh-pages -d dist" },
   "homepage": "https://<user>.github.io/<repo>"
   ```
3. In `vite.config.ts` set `base: "/<repo>/"`
4. Run: `npm run build && npm run deploy`

### Option E — Your Own Server (Nginx)
Copy `dist/` to the server, then configure Nginx:
```nginx
server {
  listen 80;
  server_name yourdomain.com;
  root /var/www/erp-system/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;   # SPA fallback
  }
}
```
Reload: `sudo systemctl reload nginx`.

### Option F — Apache
Copy `dist/` to `/var/www/html/` and add `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Option G — Docker (Nginx)
Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```
Build & run:
```bash
docker build -t erp-system .
docker run -p 8080:80 erp-system
```

---

## 6. SPA Routing Note
This app uses React Router. **Any host must redirect unknown routes to `index.html`** (shown above for Nginx/Apache). Vercel, Netlify, and Lovable handle this automatically.

---

## 7. Custom Domain
- **Lovable:** Project Settings → Domains
- **Vercel/Netlify:** Project → Domain Settings → Add domain, then update your DNS A/CNAME records.

---

## 8. Environment Notes
This prototype uses **mock data only** (Zustand store). No `.env`, database, or API keys required.

If you later add Lovable Cloud / Supabase, set these as environment variables on your host:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

That's it — `npm run build` → upload `dist/` → live. 🎉

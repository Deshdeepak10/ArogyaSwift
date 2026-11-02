# 🚀 Deploying ArogyaSwift Frontend to Cloudflare Pages

This frontend is configured for deployment to **Cloudflare Pages** with:
- **Zero-config edge CDN** with global caching
- **Single Page Application (SPA) routing** via `_redirects` (`/* /index.html 200`)
- **HTTP Security & Asset Caching headers** via `_headers`
- **Google Authentication** integration (OAuth 2.0 & Google Sign-In)

---

## Option 1: Git Integration (Recommended - Automated CI/CD)

1. Push your repository to **GitHub** or **GitLab**.
2. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository and configure the **Build Settings**:

| Setting | Value |
| :--- | :--- |
| **Framework preset** | `Vite` (or `None`) |
| **Build command** | `npm run pages:build` |
| **Build output directory** | `dist/public` |
| **Root directory** | `/` |

4. In **Environment Variables** (under Settings), add:
   - `VITE_GOOGLE_CLIENT_ID`: `xxxxxxxx.apps.googleusercontent.com`
   - `NODE_VERSION`: `20`

5. Click **Save and Deploy**. Cloudflare will build the frontend and give you a free `*.pages.dev` domain with instant HTTPS.

---

## Option 2: Direct CLI Deployment via Wrangler

You can also deploy the built frontend directly from your terminal:

```bash
# 1. Build the production bundle
npm run pages:build

# 2. Deploy directly to Cloudflare Pages
npx wrangler pages deploy dist/public --project-name=arogyaswift-frontend
```

---

## Included Cloudflare Pages Configurations

- [`wrangler.toml`](./wrangler.toml): Contains `pages_build_output_dir = "./dist/public"`.
- [`client/public/_redirects`](./client/public/_redirects): Rewrites all client-side paths (`/patient`, `/pharmacy`, `/delivery`, `/admin`, `/app`) to `/index.html` with status `200`.
- [`client/public/_headers`](./client/public/_headers): Sets `X-Frame-Options`, `X-Content-Type-Options`, and immutable edge caching for `/assets/*`.

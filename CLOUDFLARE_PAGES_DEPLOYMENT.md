# Deploying ArogyaSwift Frontend to Cloudflare Pages

This guide explains how to deploy the ArogyaSwift frontend to Cloudflare Pages as a Single Page Application (SPA).

---

## Deployment via Git (Recommended)

1. Push your repository to GitHub.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select the repository and configure the build settings:

| Setting | Value |
| :--- | :--- |
| **Framework preset** | `None` (or `Vite`) |
| **Build command** | `npm run pages:build` |
| **Build output directory** | `dist/public` |
| **Root directory** | `/` |

4. Under **Settings** > **Environment Variables**, configure:
   - `VITE_GOOGLE_CLIENT_ID`: `25258216818-g0hsug9vg0okidbate6fgfaq6acf3lfo.apps.googleusercontent.com`
   - `VITE_MAPBOX_TOKEN`: Optional Mapbox public token (defaults to OpenStreetMap raster fallback if unset)
   - `NODE_VERSION`: `20`

5. Click **Save and Deploy**. Cloudflare compiles the static bundle and issues an HTTPS domain (`*.pages.dev`).

---

## Direct CLI Deployment (Wrangler)

To deploy directly from the local terminal:

```bash
# 1. Build the production client bundle
npm run pages:build

# 2. Deploy to Cloudflare Pages
npx wrangler pages deploy dist/public --project-name=arogyaswift-frontend
```

---

## Cloudflare Pages Configuration Files

- [`wrangler.toml`](./wrangler.toml): Sets `pages_build_output_dir = "./dist/public"`.
- [`client/public/_redirects`](./client/public/_redirects): Rewrites client-side paths (`/patient`, `/pharmacy`, `/delivery`, `/admin`, `/app`) to `/index.html` with status `200`.
- [`client/public/_headers`](./client/public/_headers): Configures security headers (`X-Frame-Options`, `X-Content-Type-Options`) and caching for `/assets/*`.

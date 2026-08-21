# Vercel deployment

The repository already contains a Vercel configuration for the Vite build. Use `pnpm install --frozen-lockfile` followed by `pnpm vercel:build` in the deployment project. The dashboard is safe to preview because the default UI remains simulation-backed and hardware control, raw-media persistence, financial writes, and external webhook dispatch are disabled.

Configure `COSMIC_CAMERA_WEBHOOK_SECRET` only in the Vercel project environment when a signed inbound webhook endpoint is explicitly required. Never commit the value. The webhook adapter returns `503` when the secret is absent and `401` for invalid signatures.

A Vercel deployment proves a software build and hosting configuration only. It does not prove physical sensor calibration, optical-bench commissioning, FPGA timing, or measured photon-count evidence.

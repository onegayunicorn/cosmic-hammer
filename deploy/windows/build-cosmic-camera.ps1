$ErrorActionPreference = "Stop"

Write-Host "Cosmic Camera Windows build"
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm simulate:cosmic-camera-v3
pnpm verify:release-seal
pnpm verify:evidence-package
pnpm package:cosmic-camera-v3
Write-Host "Completed: software-only build; physical hardware gates remain HOLD."

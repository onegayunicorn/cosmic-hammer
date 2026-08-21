#!/usr/bin/env bash
set -euo pipefail

pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm simulate:cosmic-camera-v3
pnpm verify:release-seal
pnpm verify:evidence-package
pnpm package:cosmic-camera-v3
printf '%s\n' 'Cosmic Camera software build complete; physical gates remain HOLD.'

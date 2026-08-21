#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

pkg update -y
pkg install -y nodejs-lts git
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm simulate:cosmic-camera-v3
pnpm verify:release-seal
pnpm verify:evidence-package
printf '%s\n' 'Termux validation complete; this workflow does not access camera hardware or perform external writes.'

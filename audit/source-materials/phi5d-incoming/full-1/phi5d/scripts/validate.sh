#!/usr/bin/env bash
set -euo pipefail
python -m compileall -q lumina tests
python -m pytest -q

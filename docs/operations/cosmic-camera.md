# Cosmic Camera

Cosmic Camera is a privacy-first observation surface available at `/cosmic-camera`. It supports personal planning, small-business workflows, read-only operations review, and deterministic simulation. It intentionally creates summaries instead of persisting raw media.

## Supported workflows

| Mode       | Example users                               | Default behavior                                     |
| ---------- | ------------------------------------------- | ---------------------------------------------------- |
| Personal   | Households, students, accessibility users   | Consent required; summary-only output                |
| Business   | Retail, field service, studios, small teams | Inventory and workflow notes; no raw-media retention |
| Operations | Authorized operators                        | Read-only workflow and telemetry inspection          |
| Simulation | Developers and analysts                     | Deterministic Lux Codex-linked observations          |

The current UI is a safe local implementation. Camera input is optional, raw-media persistence is disabled, sensitive fields are redacted, hardware control is disabled, and external writes remain disabled. Before enabling real camera input, the product must complete privacy review, accessibility review, retention/deletion design, threat modeling, and role-based access control.

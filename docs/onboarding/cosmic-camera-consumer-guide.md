# Cosmic Camera: Consumer Onboarding

Cosmic Camera is a privacy-first observation workflow for everyday exploration, learning, business notes, operations review, and simulation. Start at `/cosmic-camera` and choose the least technical mode that fits your goal.

## First session

1. Read the privacy summary. Camera input is optional, raw media is not persisted, sensitive fields are redacted, and external writes and hardware control are disabled.
2. Choose a mode: **Explore** for a visual experience, **Learn** for guided explanations, **Measure** for calibration-aware workflows, or **Research** for advanced telemetry and reproducibility metadata.
3. Enter a short observation label such as “window light at midday” or “front shelf lighting.” Keep faces, precise locations, credentials, payment information, and device identifiers out of labels.
4. Select **Create observation summary**. Review the identifier, confidence, provenance, and redaction list.
5. Treat `SIMULATION` as synthetic and `USER_INPUT` as a summary based on information you supplied. Neither is a scientific claim without a calibrated sensor and quality gate.
6. Share only the minimum summary required. Before export, review metadata and confirm retention and deletion expectations.

## Everyday examples

For a home journal, create one Explore observation per day using a consistent label format. For a small business, use Business mode for shelf, workspace, or field-service notes without capturing customer or employee identity. For learning, use Learn mode to compare capture, calibration, noise, and reconstruction concepts. For research, record sensor identity, calibration version, firmware, parameters, uncertainty, timestamp, operator, and provenance.

## Important limits

Cosmic Camera does not provide medical diagnosis, facial recognition, covert surveillance, financial advice, automatic trading, or hardware activation. A digital twin or Lux Codex result is not a substitute for physical measurement. If calibration is missing or a UI state implies hardware that is not explicitly connected and attested, stop and report the issue.

For the full cross-repository architecture, governance, security, and production gates, see the [Architect Orchestrator consumer guide](https://github.com/onegayunicorn/architect-orchestrator/blob/main/docs/onboarding/cosmic-camera-consumer-guide.md).

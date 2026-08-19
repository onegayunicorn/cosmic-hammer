# Physical Data Integration

## Weather provider

Cosmic Hammer now exposes a server-side `weather.forecast` procedure backed by Open-Meteo. The connector requests hourly temperature, relative humidity, surface pressure, wind speed, and precipitation probability for WGS84 coordinates. The UI keeps provider data separate from the hypothesis/simulation trace and shows attribution to [Open-Meteo](https://open-meteo.com/).

Forecast verification uses paired forecast and observation points. The comparison helper calculates mean absolute error, root mean squared error, and bias for temperature, humidity, pressure, and wind. A real evaluation must supply an observation series from a physical station or a clearly identified reference dataset; reanalysis is not identical to direct observation.

## Authenticated telemetry

Protected tRPC procedures require a signed-in Cosmic Hammer operator. Device registration stores a device identity, firmware and calibration versions, a signing key reference, and a coordinate system. Ingestion rejects unknown devices, invalid timestamps, stale or duplicate sequence numbers, coordinate-system mismatches, missing calibration identifiers, unit mismatches, out-of-range values, and invalid signatures.

The development signature implementation uses HMAC over a canonical JSON payload so the test suite can verify the full flow without hardware. A production edge node should replace this with an Ed25519 device keypair and keep the private key only on the device. The stored public-key field and adapter boundary are intentionally provider-neutral.

## Coordinate metadata

Every device and telemetry record carries one of `WGS84`, `ITRF2014`, `ENU`, `ECEF`, or `LOCAL_CHAMBER`. Position estimates must not be compared across frames until an explicit transformation is recorded. The current prediction trace is a sandbox trajectory and does not claim live physical positioning.

## Evidence classes

Records are classified as `observed`, `derived`, `simulated`, `hypothesis`, or `unverified`. The application must never promote simulated or hypothetical values to observed evidence automatically.

## Database tables

The full-stack upgrade adds `devices`, `telemetryRecords`, and `predictionRuns`. Tables store provenance, signatures, calibration metadata, evidence class, timestamps, and coordinate-system labels. No customer or device seed data was inserted.

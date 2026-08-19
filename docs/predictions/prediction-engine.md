# Prediction Engine

## Purpose

The prediction engine provides a deterministic sandbox for two requested outputs: a weather forecast trace and a digital-twin position trace. It is designed to make the inputs, outputs, uncertainty, and model state visible in the UI.

## Weather output

The weather function combines a user-provided baseline temperature, humidity, pressure, horizon, and normalized pressure signal. It produces temperature, humidity, pressure, wind, precipitation chance, confidence, and uncertainty. The result is labeled `simulation` and includes a caveat requiring validation against an approved weather data source.

## Digital-twin position output

The digital-twin function applies a deterministic pressure-derived acceleration term to a supplied anchor and velocity over a bounded horizon. It returns a three-dimensional position, velocity-derived displacement, confidence, and a meter-level uncertainty estimate. It is a trajectory visualization, not a live position service, navigation system, or physical-world prediction.

## Source-material boundary

The new source PDF lists ambitious claims such as major forecast-accuracy increases, hurricane dampening, drought prevention, medical effects, propulsion, and climate control. Those claims are retained as source context only. The repository does not implement, validate, or endorse them. The current engine is intentionally narrow and safe: deterministic sandbox math, explicit caveats, no external writes, and no operational control surfaces.

## Upgrade path

A production prediction service would require historical observations, a documented baseline model, train/validation/test splits, calibration metrics, drift monitoring, data provenance, uncertainty calibration, and domain-specific review. Weather predictions should use an approved meteorological provider or verified observational feed. Digital-twin positions should use authorized telemetry and a defined coordinate reference system.

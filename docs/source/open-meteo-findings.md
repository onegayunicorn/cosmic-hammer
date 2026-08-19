# Open-Meteo Provider Findings

Open-Meteo's official forecast documentation is available at [Weather Forecast API](https://open-meteo.com/en/docs). The endpoint accepts WGS84 latitude and longitude coordinates and can return hourly variables such as temperature at 2 m, relative humidity, precipitation probability, sea-level pressure, surface pressure, and wind speed. Forecasts are available up to 16 days, and historical data can be retrieved through the [Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api).

The historical API describes reanalysis data derived from weather station, aircraft, buoy, radar, and satellite observations. It includes ERA5 and ERA5-Land datasets and a Historical Forecast API for archived forecasts suitable for fixed-lead-time verification.

The API data are offered under CC BY 4.0. The official [licence page](https://open-meteo.com/en/licence) requires appropriate credit and a link next to displayed data. The integration therefore includes provider attribution and labels the source as external observed/model data rather than Cosmic Hammer evidence.

The current implementation uses the public API surface for non-commercial development without hardcoding an API key. Commercial deployments should review Open-Meteo pricing and use the customer endpoint and licensing terms where required.

The weather comparison workflow must distinguish forecast, reanalysis/observation, and Cosmic Hammer simulation. It should calculate MAE, RMSE, bias, correlation, precipitation detection, pressure forecast error, temperature forecast error, and wind forecast error only when paired observations are available.

## References

[1]: https://open-meteo.com/en/docs "Open-Meteo Weather Forecast API"
[2]: https://open-meteo.com/en/docs/historical-weather-api "Open-Meteo Historical Weather API"
[3]: https://open-meteo.com/en/licence "Open-Meteo Licence"

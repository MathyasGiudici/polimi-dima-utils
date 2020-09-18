# polimi-dima-utils
Utils for the DIMA Project "Mobile app for Mapping outdoor air quality"

## Links

### weather
* url stations: https://www.dati.lombardia.it/resource/nf78-nj6b.geojson
* url data: https://www.dati.lombardia.it/resource/nf78-nj6b.json

### air
* url stations: https://www.dati.lombardia.it/resource/ib47-atvt.geojson
* url data: https://www.dati.lombardia.it/resource/nicp-bhqi.json

## Board simulator

### Launcher
> cd board-simulator
>
> node board-simulator.js

### Format of the data
Temperature (° C); Relative humidity (%) ; Pressure (Pa); Altitude (m); TVOCs (ppb); eCO2 (ppm); PM0.5 (µg/m³); PM1 (µg/m³); PM2.5 (µg/m³); PM4 (µg/m³); PM10 (µg/m³); latitude (floating points); longitude (floating points)

## Server

### Users

User added by default in the database:
**email:** admin@dimaproject.it
**password:** passwordSegret@130

If you want use the authorization add the header:
'Authorization': 'Bearer ' + token

Command line to look at the logs of the server
> heroku logs --app polimi-dima-server --tail

# Water Flow Monitoring System

## Team Members

- [Keyur Chaudhari](https://github.com/keyurchd11)
- [Sambasai Andem Reddy](https://github.com/Sambasai)
- [Srikar Desu](https://github.com/srikardesu)
- [Arjun Muraleedharan](https://github.com/coniferousdyer)

This is the code for an IoT-based system to monitor the water flow in a specific area, such as a water cooler or a pipe leading to a tank. The data obtained can help us understand water consumption patterns (eg. how much water a person drinks per day) or abnormalities in water flow patterns (eg. low water flow can indicate a pipe leak). The system consists of 3 layers:

- <b>Hardware:</b> A water flow sensor, a microcontroller (an ESP32 was used by us in deployment), connecting wires and an OLED display, which would have to be deployed at the site.

- <b>Cloud Storage:</b> The data read by the sensor is sent by the microcontroller to a ThingSpeak channel (which must be created by you beforehand) and a OneM2M server.

- <b>Software:</b> A dashboard fetching data from ThingSpeak and presenting it in the form of charts. The metrics measured are <b>water flow</b> and <b>volume</b>. In addition, an admin dashboard is present at the `/admin` route which is protected via token-based authentication and provides features that could be used by admins, such as:

    - Remotely setting calibration factor
    - Viewing WiFi downtime at the deployment site.
    - Viewing status codes of requests made to OneM2M/ThingSpeak from the microcontroller.

For more detailed information about the hardware and software setup, view `report.pdf`.

## Setup

The following instructions assume prior experience working with Arduino and microcontrollers.

### Hardware

1. The circuit diagram is given in the report. For more information regarding the specifications and connections of the YF-S201 SEA water flow sensor, which we used, refer to [this](https://components101.com/sensors/yf-s201-water-flow-measurement-sensor). 

2. You will then have to enter the missing details in the code file (`arduino/ESP32.ino`), which have a comment starting with `// Replace with` next to them.

3. Create a ThingSpeak channel and set up a OneM2M server.

4. The Arduino code can then be compiled and sent to the microcontroller. It will then connect to WiFi and start sending data to your ThingSpeak channel and OneM2M server.

### Software

In `server`,

1. Run
```
cp .env.template .env
```
and fill in the details in the created `.env` file.

2. Run
```
npm start
```
to start the Express server on the port you have specified.

Now, in `dashboard`,

1. Run
```
cp .env.template .env
```
and fill in the details in the created `.env` file.

2. Run
```
npm run dev
```
to run the dashboard in development mode on http://localhost:3000. The admin dashboard can be accessed at http://localhost:3000/admin. To create a user, you will have to send a POST request to the `/register` route of the backend server. This route can be commented or removed during production to avoid exposure.

3. Run
```
npm run build
```
to build a production-ready version of the dashboard. Then run
```
npm start
```
to run the app in production mode on http://localhost:3000.
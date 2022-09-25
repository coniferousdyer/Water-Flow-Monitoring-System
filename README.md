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

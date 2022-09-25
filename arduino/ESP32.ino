#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <Wire.h>

#include "HTTPClient.h"
#include "ThingSpeak.h"
#include "time.h"

#define i2c_Address 0x3c

// Setting up OLED
#define SENSOR 27
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// Adafruit setup
Adafruit_SH1106G display = Adafruit_SH1106G(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
#define NUMFLAKES 10
#define XPOS 0
#define YPOS 1
#define DELTAY 2

#define LOGO16_GLCD_HEIGHT 16
#define LOGO16_GLCD_WIDTH 16

const char *ssid = ""; // Replace with your WiFi SSID and password.
const char *pass = "";

const char *server = "api.thingspeak.com";

// om2m
String server2 = ""; // Replace with OneM2M server URL.
String ae = "Test-AE";
String cnt = "Node-1";

long currentMillis = 0;
long previousMillis = 0;
int interval = 1000;
float calibrationFactor = 7.5;
volatile byte pulseCount;
byte pulse1Sec = 0;
float flowRate;
unsigned int flowMilliLitres;
unsigned long totalMilliLitres;
long flowInMlPerSec = 0;
int WiFiStatus = 0;
int wifiConnectionInterval = 7000;
long lastPushed = 0;
long nextPush = 0;
long thingSpeakInterval = 30000;
long totalFlowRate = 0;
long numberOfReadings = 0;
long thingSpeakError = 0;
long om2mError = 0;
long prevThingSpeakCode = 0;
long prevOM2M_code = 0;
long num_codes = 0;
long next_send_codes = 75000;
long code_send_interval = 60000;
int thingSpeakCodes[50];
int om2mCodes[50];
long cf_set = 0;
long cf_set_interval = 60 * 60 * 1000;
long wifiDownTime = 0;

void IRAM_ATTR pulseCounter()
{
    pulseCount++;
}

WiFiClient client;

int keyIndex = 0;
unsigned long myChannelNumber = Enter channel number;
const char *myWriteAPIKey = ""; // Replace with write API key of ThingSpeak channel.
const char *myReadAPIKey = "";  // Replace with read API key of ThingSpeak channel.

void setup()
{
    // Init Serial
    Serial.begin(115200);
    while (!Serial)
    {
    }

    // OLED
    delay(250);
    display.begin(i2c_Address, true);
    display.display();
    delay(2000);
    displayOled(flowInMlPerSec, 0, WiFiStatus);

    // Init WIFI and print details
    WiFi.begin(ssid, pass);
    long connectStart = millis();
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("Not Connected....");
        delay(500);
        if (WiFi.status() != WL_CONNECTED && millis() - connectStart >= wifiConnectionInterval)
        {
            WiFiStatus = 0;
            break;
        }
    }
    Serial.println("");
    Serial.println("Connected......");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    if (WiFi.status() == WL_CONNECTED)
    {
        WiFiStatus = 1;
        displayOled(flowInMlPerSec, 0, 1);
    }

    // Init Thingspeak
    ThingSpeak.begin(client);

    pinMode(SENSOR, INPUT_PULLUP);
    pulseCount = 0;
    flowRate = 0.0;
    flowMilliLitres = 0;
    totalMilliLitres = 0;
    previousMillis = 0;
    attachInterrupt(digitalPinToInterrupt(SENSOR), pulseCounter, FALLING);
}

void createCI(String &val)
{
    // add the lines in step 3-6 inside this function
    //  client.setInsecure();
    HTTPClient http;
    http.begin(server2);
    http.addHeader("X-M2M-Origin", "oHDovf:QV6yMJ");
    http.addHeader("Content-Type", "application/json;ty=4");
    int code = http.POST("{\"m2m:cin\": {\"cnf\":\"application/json\",\"con\": " + String(val) + "}}");
    Serial.print("OM2M Code: ");
    Serial.println(code);
    if (code == -1)
    {
        Serial.println("UNABLE TO CONNECT TO THE SERVER");
    }
    else
        om2mError = 0;
    if (code != 201)
        om2mError = 1;
    prevOM2M_code = code;
    http.end();
}

int cryptbase1 = ; // Replace with 2 large prime numbers for the encryption algorithm.
int cryptbase2 = ;

int encrypt(int number)
{
    int val = (number + cryptbase1) ^ cryptbase2;
    return val;
}

void updateCodes()
{
    if (num_codes >= 50)
    {
        for (int i = 0; i < 49; i++)
        {
            om2mCodes[i] = om2mCodes[i + 1];
            thingSpeakCodes[i] = thingSpeakCodes[i + 1];
        }
    }
    int updateIndex = min(49L, num_codes);
    om2mCodes[updateIndex] = prevOM2M_code;
    thingSpeakCodes[updateIndex] = prevThingSpeakCode;
    num_codes += 1;
}

String to_string(int u)
{
    int neg = 0;
    if (u < 0)
    {
        neg = 1;
        u *= (-1);
    }
    String num = "";
    while (u != 0)
    {
        int rem = u % 10;
        u /= 10;
        num += (char)(rem + '0');
    }
    if (neg == 1)
        num += "-";
    std::reverse(num.begin(), num.end());
    return num;
}

void loop()
{
    currentMillis = millis();
    if (currentMillis - previousMillis > interval)
    {
        // Calculating Flow Rate
        pulse1Sec = pulseCount;
        pulseCount = 0;
        flowRate = ((1000.0 / (millis() - previousMillis)) * pulse1Sec) / calibrationFactor;
        flowInMlPerSec = (flowRate / 60) * 1000;
        totalMilliLitres += flowInMlPerSec;
        previousMillis = millis();
        totalFlowRate += flowInMlPerSec;
        numberOfReadings += 1;

        // Displaying current values on Serial Monitor and OLED
        Serial.print("Flow rate: ");
        Serial.print(int(flowInMlPerSec)); // Print the integer part of the variable
        Serial.println("mL/sec");
        Serial.print("Output Liquid Quantity: ");
        Serial.print(totalMilliLitres);
        Serial.println("mL");
        displayOled(flowInMlPerSec, totalMilliLitres, WiFiStatus);
    }

    // Send to ThingSpeak and OM2M
    if (currentMillis >= nextPush)
    {
        long connectStart = millis();
        WiFiStatus = 1;
        while (WiFi.status() != WL_CONNECTED)
        {
            Serial.println("Reconnecting to WiFi...");
            WiFi.disconnect();
            WiFi.reconnect();
            delay(500);
            if (WiFi.status() != WL_CONNECTED && millis() - connectStart >= wifiConnectionInterval)
            {
                WiFiStatus = 0;
                break;
            }
        }
        if (WiFiStatus == 1)
        {
            Serial.println("");
            Serial.println("Connected....");
            long averageFlowRate = (double)totalFlowRate / numberOfReadings;
            long volume = ((currentMillis - lastPushed) / 1000) * averageFlowRate;
            int x = 20;
            int itr = 0;
            while (x != 200)
            {
                int encavgFlowRate = encrypt(averageFlowRate);
                int encvolume = encrypt(volume);

                // Sending Encrypted data to ThingSpak
                ThingSpeak.setField(1, encavgFlowRate);
                ThingSpeak.setField(2, encvolume);

                x = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);
                String val = String(averageFlowRate);
                Serial.print("ThingSpeak Value: ");
                Serial.println(x);
                if (x == 200)
                {
                    Serial.print("Value pushed successfully: ");
                    Serial.print(averageFlowRate);
                    Serial.print(" : ");
                    Serial.println(volume);
                    numberOfReadings = 0;
                    totalFlowRate = 0;
                    lastPushed = currentMillis;
                    thingSpeakError = 0;
                }
                else
                {
                    if (itr == 5)
                        break;
                    thingSpeakError = 1;
                    delay(200);
                    itr += 1;
                }
            }
            if (x != 200)
                Serial.println("Couldn't push value to Thingspeak :(");
            prevThingSpeakCode = x;
            int frate = (int)averageFlowRate;
            String val = String(frate);
            createCI(val);
            updateCodes();
        }
        else
            wifiDownTime += thingSpeakInterval;
        nextPush = millis() + thingSpeakInterval;
    }
    if (millis() >= next_send_codes)
    {
        int x = 20;
        int itr = 0;
        while (x != 200)
        {
            String om2mStr = "";
            String thingSpeakStr = "";
            for (int i = 0; i < num_codes; i++)
            {
                om2mStr += to_string(om2mCodes[i]);
                om2mStr += ",";
                thingSpeakStr += to_string(thingSpeakCodes[i]);
                thingSpeakStr += ",";
            }

            ThingSpeak.setField(4, om2mStr);
            ThingSpeak.setField(5, thingSpeakStr);
            ThingSpeak.setField(6, wifiDownTime);

            x = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);
            if (x == 200)
            {
                num_codes = 0;
                wifiDownTime = 0;
                Serial.println("Codes published successfully.");
                Serial.println(om2mStr);
                Serial.println(thingSpeakStr);
            }
            else
            {
                if (itr == 5)
                    break;
                itr += 1;
                delay(200);
            }
        }
        next_send_codes += code_send_interval;
    }
    if (millis() >= cf_set)
    {
        float cf1 = ThingSpeak.readFloatField(myChannelNumber, 3, myReadAPIKey);
        if (cf1 > 0 && cf1 < 20)
            calibrationFactor = cf1;
        Serial.println(cf1);
        Serial.print("\nNew CF: ");
        Serial.println(calibrationFactor);
        cf_set += cf_set_interval;
    }
}

void displayOled(int rate, int vol, int wifiStatus)
{
    display.clearDisplay();
    display.cp437(true);
    display.setCursor(0, 0);
    display.setTextColor(SH110X_WHITE);
    display.setTextSize(1);
    display.println("Water Flow Monitoring");
    display.println();

    display.setTextSize(1);
    display.print("Rate: ");
    display.print(rate);
    display.println(" mL/sec");
    display.println();

    display.print("Volm: ");
    display.print(vol);
    display.println(" mL");
    display.println();

    display.print("WiFi: ");
    if (wifiStatus == 0)
        display.print("Not ");
    display.println("Connected");
    if (thingSpeakError == 1)
        display.print(".");
    else
        display.print(" ");
    if (om2mError == 1)
        display.print(".");
    else
        display.print(" ");
    display.display();
    Serial.print(thingSpeakError);
    Serial.println(om2mError);
    delay(500);
}

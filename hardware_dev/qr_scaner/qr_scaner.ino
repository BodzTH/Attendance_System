#include <WiFi.h>
#include <WiFiUdp.h>
#include <ArduinoJson.h>
#include <cmath>
#include <SD.h> // Include the SD library
#include <FS.h>

#ifndef DEVICE_ID
#define DEVICE_ID 1
#endif

#ifndef SERVER_IP1
#define SERVER_IP1 192
#endif

#ifndef SERVER_IP2
#define SERVER_IP2 168
#endif

#ifndef SERVER_IP3
#define SERVER_IP3 1
#endif

#ifndef SERVER_IP4
#define SERVER_IP4 8
#endif

#ifndef SERVER_PORT1
#define SERVER_PORT1 5040
#endif

#ifndef SERVER_PORT2
#define SERVER_PORT2 5030
#endif

// Global variable declaration
const int CS_PIN = 5;
const int deviceId = DEVICE_ID;
IPAddress serverIP(SERVER_IP1, SERVER_IP2, SERVER_IP3, SERVER_IP4);
unsigned int serverPort = SERVER_PORT1;
unsigned int serverPortTCP = SERVER_PORT2;
unsigned int localUdpPort = 5333;
String ssid;
String pass;

WiFiUDP Udp;
// WiFiClient client;
File file;

/////////////////////////////////////
void setup()
{
  Serial.begin(115200);
  initializeSDCard(CS_PIN);
  connectToWiFi();

  startUDP();
}

void loop()
{
  sendJsonData();
  delay(1500);
}
//////////////////////////////////


void connectToWiFi() {
  WiFi.mode(WIFI_STA);

  // Open the .env file in read mode
  file = SD.open("/.env", FILE_READ);
  if (!file) {
    Serial.println("Error opening .env file for reading");
    return;
  }

  // Parse the JSON configuration file
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, file);
  if (error) {
    Serial.println("Failed to read file, using default configuration");
  }

  // Get the SSID and password from the configuration file
  const char* ssid = doc["ssid"];
  const char* pass = doc["pass"];

  // Close the file
  file.close();

  WiFi.begin(ssid, pass);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting...");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Connected to WiFi");
  } else {
    Serial.println("Failed to connect to WiFi");
  }
}

void startUDP()
{
  Udp.begin(localUdpPort);
  Serial.println("UDP server started at port: " + String(localUdpPort));
}

void initializeSDCard(const int CS_PIN)
{
  if (!SD.begin(CS_PIN))
  {
    return;
  }
}

void sendJsonData()
{
  StaticJsonDocument<80> doc;
  // Add data to the JSON object
  doc["Message"] = "Hello, BRO";
  Serial.println("Sending JSON data");
  // Send the JSON string over UDP
  Udp.beginPacket(serverIP, serverPort);
  ArduinoJson::serializeJson(doc, Udp); // Send the combined JSON
  Udp.endPacket();
}

#include "ESP32QRCodeReader.h"
#include <Arduino.h>
#include <Crypto.h>
#include <AES.h>
#include <SHA256.h>
#include <string.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <ArduinoJson.h>
#include <SD_MMC.h>
#include <FS.h>
#include <Crypto.h>
#include <SHA256.h>
#include <P521.h>

#ifndef FLASH_PIN
#define FLASH_PIN 4
#endif

#ifndef CHANNEL
#define CHANNEL 0
#endif

#ifndef RESOLUTION
#define RESOLUTION 8
#endif

#ifndef FREQUENCY
#define FREQUENCY 5000
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
IPAddress serverIP(SERVER_IP1, SERVER_IP2, SERVER_IP3, SERVER_IP4);
unsigned int serverPort = SERVER_PORT1;
unsigned int serverPortTCP = SERVER_PORT2;
unsigned int localUdpPort = 5333;
String ssid;
String pass;
byte key[16] = "N$ZE0got@22UUII";
byte cypher[100];
byte decryptedtext[100];
byte hash[32];

//Object instances
WiFiClient client;
File file;
AES128 aes128;
SHA256 sha256;
ESP32QRCodeReader reader(CAMERA_MODEL_AI_THINKER);

/////////////////////////////////////
void setup() {
  Serial.begin(115200);

  ledcSetup(CHANNEL, FREQUENCY, RESOLUTION);
  ledcAttachPin(FLASH_PIN, CHANNEL);
  ledcWrite(CHANNEL, 10);  // 0-255 to alter flash brightness

  aes128.setKey(key, 16);

  initializeSDCard();

  connectToWiFi();
  startTCP();

  reader.setup();
  // reader.setDebug(true); // Uncomment this line to enable debugging
  Serial.println("Setup QRCode Reader");

  reader.beginOnCore(1);
  Serial.println("Begin on Core 1");

  xTaskCreate(onQrCodeTask, "onQrCode", 4 * 1024, NULL, 4, NULL);
  // startUDP();
}

void loop() {
  delay(500);
}
//////////////////////////////////

void connectToWiFi() {
  WiFi.mode(WIFI_STA);

  fs::FS &fs = SD_MMC;
  // Open the .env file in read mode
  file = fs.open("/.env", FILE_READ);
  if (!file) {
    Serial.println("Error opening .env file for reading");
    return;
  }

  // Parse the JSON configuration file
  StaticJsonDocument<100> doc;
  DeserializationError error = deserializeJson(doc, file);
  if (error) {
    Serial.println("Failed to read file, using default configuration");
  }

  // Get the SSID and password from the configuration file
  const char *ssid = doc["ssid"];
  const char *pass = doc["pass"];

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

void startTCP() {
  if (client.connect(serverIP, serverPortTCP)) {
    Serial.println("TCP connection established");
  } else {
    Serial.println("Failed to establish TCP connection");
  }
}

void initializeSDCard() {
  if (!SD_MMC.begin()) {
    Serial.println("SD Card Mount Failed");
    return;
  }

  uint8_t cardType = SD_MMC.cardType();
  if (cardType == CARD_NONE) {
    Serial.println("No SD Card attached");
    return;
  }
}

void onQrCodeTask(void *pvParameters) {
  struct QRCodeData qrCodeData;

  while (true) {
    if (reader.receiveQrCode(&qrCodeData, 100)) {
      Serial.println("Found QRCode");
      if (qrCodeData.valid) {
        Serial.print("Payload: ");
        Serial.println((const char *)qrCodeData.payload);
        sha256.reset();
        sha256.update(qrCodeData.payload, sizeof(qrCodeData.payload));
        sha256.finalize(hash, sizeof(hash));
        Serial.print("Hash: ");
        String hashedPayload;
        for (int i = 0; i < sizeof(hash); i++) {
          Serial.print(hash[i], HEX);
          hashedPayload += String(hash[i], HEX);
        }
        Serial.println();

        // Determine the size of the payload
        int payloadSize = strlen((char *)qrCodeData.payload);

        // Calculate the size of the padded payload
        int paddedPayloadSize = ((payloadSize + 15) / 16) * 16;

        // Encrypt each block
        for (int i = 0; i < paddedPayloadSize; i += 16) {
          aes128.encryptBlock(cypher + i, qrCodeData.payload + i);
        }
        String encryptedPayload;
        Serial.print("Encrypted: ");
        for (int i = 0; i < paddedPayloadSize; i++) {
          Serial.print(cypher[i], HEX);
          encryptedPayload += String(cypher[i], HEX);
        }
        Serial.println();

        // Decrypt each block
        for (int i = 0; i < paddedPayloadSize; i += 16) {
          aes128.decryptBlock(decryptedtext + i, cypher + i);
        }

        // Null-terminate the decrypted text
        decryptedtext[paddedPayloadSize] = '\0';

        Serial.print("Decrypted: ");
        Serial.println((char *)decryptedtext);

        if (memcmp(qrCodeData.payload, decryptedtext, payloadSize) == 0) {
          Serial.println("Valid");
          int count = 0;
          while (!client.connected()) {
            Serial.println("TCP connection lost");
            startTCP();
            if (count == 6) {
              break;
            }
            count++;
          }
          if (client.connected()) {
            sendJsonData(hashedPayload, encryptedPayload);
          }
        }
      } else {
        Serial.print("Invalid: ");
        Serial.println((const char *)qrCodeData.payload);
      }
    }
    vTaskDelay(100 / portTICK_PERIOD_MS);
  }
}

// TCP Message
void sendJsonData(String hash, String encMessage) {
  StaticJsonDocument<80> doc;
  doc["Message"] = encMessage;
  doc["Hash"] = hash;
  Serial.println("Sending JSON data");

  ArduinoJson::serializeJson(doc, client);
  client.println();
}
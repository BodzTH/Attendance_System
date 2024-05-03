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

// Defining Server
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

// Defining Crypto
#ifndef HASH_LENGTH
#define HASH_LENGTH 32
#endif

// Global variable declaration
IPAddress serverIP(SERVER_IP1, SERVER_IP2, SERVER_IP3, SERVER_IP4);
unsigned int serverPort = SERVER_PORT1;
unsigned int serverPortTCP = SERVER_PORT2;
unsigned int localUdpPort = 5333;
String ssid;
String pass;
byte key[16] = {0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F};
byte plaintext[512];
byte cypher[512];
byte decryptedtext[512];
byte hash[HASH_LENGTH];

// Object instances
WiFiClient client;
File file;
AES128 aes128;
SHA256 sha256;
ESP32QRCodeReader reader(CAMERA_MODEL_AI_THINKER);

/////////////////////////////////////
void setup()
{
  Serial.begin(115200);

  ledcSetup(CHANNEL, FREQUENCY, RESOLUTION);
  ledcAttachPin(FLASH_PIN, CHANNEL);
  ledcWrite(CHANNEL, 10); // 0-255 t

  aes128.setKey(key, 16);

  initializeSDCard();

  connectToWiFi();
  startTCP();

  reader.setup();

  // reader.setDebug(true); // Uncomment this line to enable debugging
  Serial.println("Setup QRCode Reader");

  reader.beginOnCore(0);
  Serial.println("Begin on Core 1");

  xTaskCreate(onQrCodeTask, "onQrCode", 4 * 1024, NULL, 4, NULL);
  // startUDP();
}

void loop()
{
  delay(1000);
}
//////////////////////////////////

void connectToWiFi()
{
  WiFi.mode(WIFI_STA);

  fs::FS &fs = SD_MMC;
  // Open the .env file in read mode
  file = fs.open("/.env", FILE_READ);
  if (!file)
  {
    Serial.println("Error opening .env file for reading");
    return;
  }

  // Parse the JSON configuration file
  StaticJsonDocument<100> doc;
  DeserializationError error = deserializeJson(doc, file);
  if (error)
  {
    Serial.println("Failed to read file, using default configuration");
  }

  // Get the SSID and password from the configuration file
  const char *ssid = doc["ssid"];
  const char *pass = doc["pass"];

  // Close the file
  file.close();

  WiFi.begin(ssid, pass);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.println("Connecting...");
  }

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("Connected to WiFi");
  }
  else
  {
    Serial.println("Failed to connect to WiFi");
  }
}

void startTCP()
{
  if (client.connect(serverIP, serverPortTCP))
  {
    Serial.println("TCP connection established");
  }
  else
  {
    Serial.println("Failed to establish TCP connection");
  }
}

void initializeSDCard()
{
  if (!SD_MMC.begin())
  {
    Serial.println("SD Card Mount Failed");
    return;
  }

  uint8_t cardType = SD_MMC.cardType();
  if (cardType == CARD_NONE)
  {
    Serial.println("No SD Card attached");
    return;
  }
}

void onQrCodeTask(void *pvParameters)
{
  struct QRCodeData qrCodeData;

  while (true)
  {
    if (reader.receiveQrCode(&qrCodeData, 100))
    {
      Serial.println("Found QRCode");
      if (qrCodeData.valid)
      {
        Serial.print("Payload: ");
        Serial.println((const char *)qrCodeData.payload);

        int count = 0;
        while (!client.connected())
        {
          Serial.println("TCP connection lost");
          startTCP();
          if (count == 6)
          {
            break;
          }
          count++;
        }
        if (client.connected())
        {
          sendPayload((const char *)qrCodeData.payload);
        }
      }
      else
      {
        Serial.print("Invalid: ");
        Serial.println((const char *)qrCodeData.payload);
      }
    }
    vTaskDelay(100 / portTICK_PERIOD_MS);
  }
}

// TCP Message
void sendPayload(const char *payload)
{
  int messageLength = strlen(payload);                 // Get the actual length of the message
  int paddedLength = ((messageLength + 15) / 16) * 16; // Calculate the padded length
  strncpy((char *)plaintext, payload, messageLength);
  for (int i = messageLength; i < paddedLength; i++)
  {
    plaintext[i] = 0;
  }
  Serial.print("Before Encryption:");
  for (int i = 0; i < messageLength; i++)
  {
    Serial.write(plaintext[i]);
  }
  for (int i = 0; i < paddedLength; i += 16)
  {
    aes128.encryptBlock(cypher + i, plaintext + i);
  }
  Serial.println();
  Serial.print("After Encryption:");
  for (int j = 0; j < paddedLength; j++)
  {
    Serial.print(cypher[j], HEX); // Print as hexadecimal
    if (j < paddedLength - 1)
    {
      Serial.print(" "); // Add a space between bytes
    }
  }
  // Decrypt each block
  for (int i = 0; i < paddedLength; i += 16)
  {
    aes128.decryptBlock(decryptedtext + i, cypher + i);
  }

  Serial.println();
  Serial.print("After Decryption:");
  for (int i = 0; i < messageLength; i++)
  {
    Serial.write(decryptedtext[i]);
  }
  byte *hash = computeHash(payload);

  String hashStr = "";
  for (int i = 0; i < HASH_LENGTH; ++i)
  {
    if (hash[i] < 16)
      hashStr += '0'; // Add leading zero for single-digit hex values
    hashStr += String(hash[i], HEX);
  }
  // Print the hash
  Serial.print("Hash: ");
  Serial.println(hashStr);
  // client.println(hashStr);
  for (int j = 0; j < paddedLength; j++)
  {
    char hex[3];
    sprintf(hex, "%02X", cypher[j]);
    client.print(hex);
  }
  client.println(); // Send a newline character at the end
}

byte *computeHash(const char *message)
{
  static byte hash[HASH_LENGTH];

  SHA256 sha256;
  sha256.update((byte *)message, strlen(message));
  sha256.finalize(hash, sizeof(hash));

  return hash;
}
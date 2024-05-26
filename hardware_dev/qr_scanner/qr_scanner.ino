#include "ESP32QRCodeReader.h"
#include <Arduino.h>
#include <AES.h>
#include <SHA256.h>
#include <WiFi.h>
// #include <ArduinoJson.h>
// #include <SD_MMC.h>
// #include <FS.h>

#ifndef FLASH_LED
#define FLASH_LED 4
#endif

#ifndef BUZZER
#define BUZZER 14
#endif

#ifndef BLUE_LED
#define BLUE_LED 13
#endif

#ifndef RED_LED
#define RED_LED 12
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
#define SERVER_IP4 101
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
// String ssid;
// String pass;
byte key[16] = {0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F};
byte plaintext[128] = {0};
byte cypher[128] = {0};
// byte decryptedtext[128] = {0};
byte hash[HASH_LENGTH] = {0};

// Object instances
WiFiClient client;
// File file;
AES128 aes128;
SHA256 sha256;
ESP32QRCodeReader reader(CAMERA_MODEL_AI_THINKER);

void connectToWiFi()
{
  WiFi.mode(WIFI_STA);

  // fs::FS &fs = SD_MMC;
  // Open the .env file in read mode
  // file = fs.open("/.env", FILE_READ);
  // if (!file) {
  //   // Serial.println("Error opening .env file for reading");
  //   return;
  // }

  // Parse the JSON configuration file
  // StaticJsonDocument<100> doc;
  // DeserializationError error = deserializeJson(doc, file);
  // if (error) {
  //   // Serial.println("Failed to read file, using default configuration");
  // }

  // // Get the SSID and password from the configuration file
  // const char *ssid = doc["ssid"];
  // const char *pass = doc["pass"];

  // Close the file
  // file.close();

  WiFi.begin("@_@", "Lolz12345");
  int flipper = 1;
  while (WiFi.status() != WL_CONNECTED)
  {
    if (flipper)
    {
      digitalWrite(BLUE_LED, HIGH);
      flipper = 0;
    }
    else
    {
      digitalWrite(BLUE_LED, LOW);
      flipper = 1;
    }
    delay(500);
    // Serial.println("Connecting...");
  }

  if (WiFi.status() == WL_CONNECTED)
  {
    // Serial.println("Connected to WiFi");
    digitalWrite(BLUE_LED, HIGH);
  }
  else
  {
    // Serial.println("Failed to connect to WiFi");
  }
}

void startTCP()
{
  if (client.connect(serverIP, SERVER_PORT2))
  {
    // Serial.println("TCP connection established");
  }
  else
  {
    // Serial.println("Failed to establish TCP connection");
  }
}

// void initializeSDCard() {
//   if (!SD_MMC.begin()) {
//     // Serial.println("SD Card Mount Failed");
//     return;
//   }

//   uint8_t cardType = SD_MMC.cardType();
//   if (cardType == CARD_NONE) {
//     // Serial.println("No SD Card attached");
//     return;
//   }
// }

void onQrCodeTask(void *pvParameters)
{
  struct QRCodeData qrCodeData;

  while (true)
  {
    if (WiFi.status() != WL_CONNECTED)
    {
      digitalWrite(BLUE_LED, LOW);
      connectToWiFi();
    }
    digitalWrite(RED_LED, LOW);
    if (reader.receiveQrCode(&qrCodeData, 100))
    {
      // Serial.println("Found QRCode");
      if (qrCodeData.valid)
      {
        // Serial.print("Payload: ");
        // Serial.println((const char *)qrCodeData.payload);
        digitalWrite(FLASH_LED, HIGH);
        digitalWrite(BUZZER, HIGH);
        delay(50);
        digitalWrite(BUZZER, LOW);
        delay(50);
        digitalWrite(BUZZER, HIGH);
        delay(50);
        digitalWrite(BUZZER, LOW);
        digitalWrite(FLASH_LED, LOW);
        int count = 0;
        while (!client.connected())
        {
          // Serial.println("TCP connection lost");
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
        // Serial.print("Invalid: ");
        // Serial.println((const char *)qrCodeData.payload);
        digitalWrite(RED_LED, HIGH);
        delay(50);
      }
    }
    vTaskDelay(100 / portTICK_PERIOD_MS);
  }
}

// TCP Message
void sendPayload(const char *payload)
{
  int messageLength = strlen(payload);                 
  int paddedLength = ((messageLength + 15) / 16) * 16; 
  strncpy((char *)plaintext, payload, messageLength);
  for (int i = messageLength; i < paddedLength; i++)
  {
    plaintext[i] = 0;
  }
  // Serial.print("Before Encryption:");
  // for (int i = 0; i < messageLength; i++) {
  //   Serial.write(plaintext[i]);
  // }
  for (int i = 0; i < paddedLength; i += 16)
  {
    aes128.encryptBlock(cypher + i, plaintext + i);
  }
  // Serial.println();
  // Serial.print("After Encryption:");
  // for (int j = 0; j < paddedLength; j++) {
  //   Serial.print(cypher[j], HEX);  // Print as hexadecimal
  //   if (j < paddedLength - 1) {
  //     Serial.print(" ");  // Add a space between bytes
  //   }
  // }
  // Decrypt each block
  // for (int i = 0; i < paddedLength; i += 16)
  // {
  //   aes128.decryptBlock(decryptedtext + i, cypher + i);
  // }

  // Serial.println();
  // Serial.print("After Decryption:");
  // for (int i = 0; i < messageLength; i++) {
  //   Serial.write(decryptedtext[i]);
  // }
  // Serial.println();
  byte *hash = computeHash(payload);

  String hashStr = "";
  for (int i = 0; i < HASH_LENGTH; ++i)
  {
    if (hash[i] < 16)
      hashStr += '0'; // Add leading zero for single-digit hex values
    hashStr += String(hash[i], HEX);
  }
  hashStr.toUpperCase();
  // Print the hash
  // Serial.print("Hash: ");
  // Serial.println(hashStr);
  String cypherStr = "";
  for (int j = 0; j < paddedLength; j++)
  {
    char hex[3];
    sprintf(hex, "%02X", cypher[j]);
    cypherStr += hex;
  }
  client.println(hashStr + cypherStr);
}

byte *computeHash(const char *message)
{
  static byte hash[HASH_LENGTH];

  sha256.reset();
  sha256.update((byte *)message, strlen(message));
  sha256.finalize(hash, HASH_LENGTH);

  return hash;
}

/////////////////////////////////////
void setup()
{

  // Serial.begin(115200);

  aes128.setKey(key, 16);

  // initializeSDCard();

  connectToWiFi();

  reader.setup();

  // reader.setDebug(true); // Uncomment this line to enable debugging
  // Serial.println("Setup QRCode Reader");

  reader.beginOnCore(0);
  // Serial.println("Begin on Core 0");

  xTaskCreate(onQrCodeTask, "onQrCode", 4 * 1024, NULL, 4, NULL);

  pinMode(FLASH_LED, OUTPUT);

  pinMode(BLUE_LED, OUTPUT);

  pinMode(BUZZER, OUTPUT);

  pinMode(RED_LED, OUTPUT);
}

void loop()
{
  delay(100);
}
//////////////////////////////////

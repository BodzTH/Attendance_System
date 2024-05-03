const net = require("net");
const mongoose = require("mongoose");
require("dotenv").config();
const CryptoJS = require("crypto-js");
const readline = require("readline");

const key = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
const tcpServer = net.createServer();
const IP = process.env.IP;
const TCP_PORT = process.env.PORTTCP;

// TCP Server
tcpServer.listen(TCP_PORT, IP);
tcpServer.once("connection", (socket) => {
  console.log(
    `Accepted connection from ${socket.remoteAddress}:${socket.remotePort}`
  );

  const rl = readline.createInterface({ input: socket });

  rl.on("line", (line) => {
    console.log(`Received data: ${line}`);

    const encryptedData = CryptoJS.enc.Hex.parse(line);

    try {
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encryptedData },
        key,
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding } // Use ECB mode and no padding
      );

      let decryptedMessage = decrypted.toString(CryptoJS.enc.Hex);
      let str = "";
      for (let i = 0; i < decryptedMessage.length; i += 2) {
        let v = parseInt(decryptedMessage.substr(i, 2), 16);
        if (v) str += String.fromCharCode(v);
      }
      console.log("Decrypted message:", str);
    } catch (err) {
      console.error(`Decryption error: ${err.message}`);
    }
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });

  socket.on("error", (err) => {
    console.error(`Connection error: ${err}`);
  });
});

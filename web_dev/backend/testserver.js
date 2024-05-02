const dgram = require("dgram");
const net = require("net");
const mongoose = require("mongoose");
const fs = require("fs");
const crypto = require("crypto");
const readline = require("readline");
require("dotenv").config();

const server = dgram.createSocket("udp4");
const tcpServer = net.createServer();
const IP = process.env.IP;
const PORT = process.env.PORTUDP;
const TCP_PORT = process.env.PORTTCP;

// // UDP Server
// server.bind(PORT, IP);

// server.on("error", (err) => {
//   console.log(`Server error:\n${err.stack}`);
//   server.close();
// });

// server.on("message", (msg, rinfo) => {
//   console.log(`Received message: ${msg} from ${rinfo.address}:${rinfo.port}`);
// });

// server.on("listening", () => {
//   const address = server.address();
//   console.log(`UDP server listening on ${address.address}:${address.port}`);
// });

// TCP Server
tcpServer.listen(TCP_PORT, IP);
tcpServer.once("connection", (socket) => {
  console.log(
    `Accepted connection from ${socket.remoteAddress}:${socket.remotePort}`
  );

  const rl = readline.createInterface({ input: socket });

  rl.on("line", (line) => {
    const message = JSON.parse(line);
    console.log(`Received data: ${JSON.stringify(message)}`);
  });
  socket.on("end", () => {
    console.log("Client disconnected");
  });

  socket.on("error", (err) => {
    console.error(`Connection error: ${err}`);
  });
});

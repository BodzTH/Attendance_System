const net = require("net");
const mongoose = require("mongoose");
require("dotenv").config();
const crypto = require("crypto");
const readline = require("readline");


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

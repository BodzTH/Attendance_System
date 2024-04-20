const dgram = require("dgram");
const net = require("net");
const mongoose = require("mongoose");
require("dotenv").config();

const server = dgram.createSocket("udp4");
const tcpServer = net.createServer();

const IP = process.env.IP;
const PORT = process.env.PORTUDP;
const TCP_PORT = process.env.PORTTCP;

// UDP Server
server.bind(PORT, IP);

server.on("error", (err) => {
  console.log(`Server error:\n${err.stack}`);
  server.close();
});

server.on("message", (msg, rinfo) => {
  console.log(`Received message: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on("listening", () => {
  const address = server.address();
  console.log(`UDP server listening on ${address.address}:${address.port}`);
});



// TCP Server
// tcpServer.listen(TCP_PORT, IP);

// tcpServer.on("connection", (socket) => {
//   console.log(
//     `Accepted connection from ${socket.remoteAddress}:${socket.remotePort}`
//   );

//   socket.on("data", (data) => {
//     console.log(`Received data: ${data}`);
//   });

//   socket.on("end", () => {
//     console.log("Client disconnected");
//   });

//   socket.on("error", (err) => {
//     console.error(`Connection error: ${err}`);
//   });
// });
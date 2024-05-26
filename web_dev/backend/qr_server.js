const net = require("net");
const mongoose = require("mongoose");
require("dotenv").config();
const CryptoJS = require("crypto-js");
const readline = require("readline");

const attendenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  timeAttended: {
    type: String,
    required: true,
  },
});

attendenceSchema.index({ id: 1, date: 1 }, { unique: true });

const key = CryptoJS.enc.Hex.parse(process.env.KEY);
const tcpServer = net.createServer();
const IP = process.env.IP;
const TCP_PORT = process.env.PORTTCP;

// Database connections
const connection1 = mongoose.createConnection(process.env.ATTENDANCE);
// const connection2 = mongoose.createConnection(process.env.HARDWAREDB_DB_URI);

// Model imports
// const attendenceModel = require("./models/qr_code");
// const devices = require("./models/devices");

// Models setup
const Model1 = connection1.model(
  "Model1",
  attendenceSchema,
  "studentsAttendence"
);

// const Model2 = connection2.model("Model2", devices.schema, "devices");

// TCP Server
tcpServer.listen(TCP_PORT, IP);
tcpServer.on("connection", (socket) => {
  console.log(
    `Accepted connection from ${socket.remoteAddress}:${socket.remotePort}`
  );

  const rl = readline.createInterface({ input: socket });

  rl.on("line", (line) => {
    // Get the current date and time
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().split(" ")[0];

    console.log(`Received data: ${line}`);
    hash = line.slice(0, 64);
    cypher = line.slice(64, line.length);
    console.log(`Hash: ${hash}`);
    console.log(`Cypher: ${cypher}`);
    const encryptedData = CryptoJS.enc.Hex.parse(cypher);

    console.log(`Received date: ${currentDate}`);
    console.log(`Received time: ${currentTime}`);

    try {
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encryptedData },
        key,
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding } // Use ECB mode and no padding
      );

      let decryptedMessage = decrypted.toString(CryptoJS.enc.Hex);
      let str = "";
      for (let i = 0; i < decryptedMessage.length; i += 2) {
        let v = parseInt(decryptedMessage.slice(i, i + 2), 16);
        if (v) str += String.fromCharCode(v);
      }
      console.log("Decrypted message:", str);

      const pattern = /^([A-Za-z0-9]+) (.+)$/;
      if (pattern.test(str)) {
        console.log("Message is in the correct format");
      } else {
        console.log("Message is not in the correct format");
        return;
      }
      const hashedMessage = CryptoJS.SHA256(str).toString();
      console.log("Hashed message:", hashedMessage);

      if (hashedMessage.toUpperCase() === hash) {
        console.log("Hashes match!");

        let parts = str.split(" ");
        let ID = parts[0];
        let FullName = parts.slice(1).join(" ");

        // Check if FullName includes "Computer Science" or "Computer Engineering"
        if (/Computer science|Computer engineering/i.test(FullName)) {
          // Remove "Computer Science" or "Computer Engineering" from FullName
          FullName = FullName.replace(
            /Computer science|Computer engineering/i,
            ""
          ).trim();
        }

        console.log("ID:", ID);
        console.log("Full Name:", FullName);

        // Save the data to the database
        Model1.findOneAndUpdate(
          { id: ID, date: currentDate }, // find a document with same id and date
          { name: FullName, timeAttended: currentTime }, // update the document with new data
          { upsert: true, new: true, runValidators: true } // options: upsert creates a new document if no documents match the filter
        )
          .then((doc) => {
            console.log("Data saved successfully!");
          })
          .catch((err) => {
            console.error(`Error saving to database: ${err.message}`);
          });
      } else {
        console.log("Hashes do not match!");
        return;
      }
    } catch (err) {
      console.error(`Decryption error: ${err.message}`);
    }
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });

  socket.on("error", (err) => {
    console.error(`Connection error: ${err}`);
    return;
  });
});

connection1
  .on("connected", () => {
    console.log("Connected to attendence database.");
  })
  .on("error", (err) => {
    console.error("Error occurred in MongoDB connection to attendence: ", err);
  });

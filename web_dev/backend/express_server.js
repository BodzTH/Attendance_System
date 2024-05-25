require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

app.use(express.json()); // For parsing application/json
app.use(cors());

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
const connection = mongoose.createConnection(process.env.ATTENDANCE);

const Attendance = connection.model(
  "Model1",
  attendenceSchema,
  "studentsAttendence"
);

app.get("/api/attendance", async (req, res) => {
  try {
    const attendanceList = await Attendance.find();
    res.json(attendanceList);
  } catch (error) {
    console.error("Error occurred while fetching attendance: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const port = process.env.PORTEX; // Set the port number
app.listen(port, "localhost", () => {
  console.log(`Server is running on localhost:${port}`);
});
connection
  .on("connected", () => {
    console.log("Connected to attendence database.");
  })
  .on("error", (err) => {
    console.error("Error occurred in MongoDB connection to attendence: ", err);
  });

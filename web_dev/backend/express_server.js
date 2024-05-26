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

app.get('/studentattendance', (req, res) => {
    // Construct the file path relative to the current directory (__dirname)
    const filePath = path.join(__dirname, '..', 'frontend', 'studentattendance.html');
    
    // Send the file as the response
    res.sendFile(filePath);
});

app.get("/api/attendance", async (req, res) => {
  try {
    const attendanceList = await Attendance.find();
    res.json(attendanceList);
  } catch (error) {
    console.error("Error occurred while fetching attendance: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/studentattendance', (req, res) => {
  // Construct the file path relative to the current directory (__dirname)
  const filePath = path.join(__dirname,'..','frontend' ,'studentattendance.html');
  
  // Send the file as the response
  res.sendFile(filePath);
});

app.get('/studentattendance.css', (req, res) => {
  // Construct the file path relative to the current directory (__dirname)
  const filePath = path.join(__dirname,'..','frontend' , 'studentattendance.css');
  
  // Send the file as the response
  res.sendFile(filePath);
});

app.get('/studentattendance.js', (req, res) => {
  // Construct the file path relative to the current directory (__dirname)
  const filePath = path.join(__dirname,'..','frontend' , 'studentattendance.js');
  
  // Send the file as the response
  res.sendFile(filePath);
});

app.get('/student_login', (req, res) => {
  // Construct the file path relative to the current directory (__dirname)
  const filePath = path.join(__dirname,'..','frontend' , 'student_login.html');
  
  // Send the file as the response
  res.sendFile(filePath);
});

app.get('/student_login.js', (req, res) => {
  // Construct the file path relative to the current directory (__dirname)
  const filePath = path.join(__dirname,'..','frontend' , 'student_login.js');
  
  // Send the file as the response
  res.sendFile(filePath);
});

app.get('/student_login.css', (req, res) => {
  // Construct the file path relative to the current directory (__dirname)
  const filePath = path.join(__dirname,'..','frontend' , 'student_login.css');
  
  // Send the file as the response
  res.sendFile(filePath);
});

app.get('/home_soft', (req, res) => {
  // Construct the file path relative to the current directory (__dirname)
  const filePath = path.join(__dirname,'..','frontend' , 'home_soft.html');
  
  // Send the file as the response
  res.sendFile(filePath);
});

app.get('/home_soft.js', (req, res) => {
  // Construct the file path relative to the current directory (__dirname)
  const filePath = path.join(__dirname,'..','frontend' , 'home_soft.js');
  
  // Send the file as the response
  res.sendFile(filePath);
});

app.get('/home_soft.css', (req, res) => {
  // Construct the file path relative to the current directory (__dirname)
  const filePath = path.join(__dirname,'..','frontend' , 'home_soft.html.html');
  
  // Send the file as the response
  res.sendFile(filePath);
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

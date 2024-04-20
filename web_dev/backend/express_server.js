require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

app.use(express.json()); // For parsing application/json
app.use(cors());

const port = process.env.PORTEX; // Set the port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

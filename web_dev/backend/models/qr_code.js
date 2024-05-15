const mongoose = require("mongoose");

const attendenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeAttended: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("attendenceModel", attendenceSchema);

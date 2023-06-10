const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  createdAt: {
    type: Date,
    required: true,
    immutable: true,
    default: Date.now(),
  },
  deadline: Date,
  steps: {
    type: [String],
    default: undefined,
  },
  stepsChecked: {
    type: [Boolean],
    default: undefined,
  },
  category: {
    type: String,
    required: true,
  },
  done: {
    type: Boolean,
    default: false,
  },
  doneDate: Date,
  position: Number,
});

module.exports = mongoose.model("Ticket", ticketSchema);

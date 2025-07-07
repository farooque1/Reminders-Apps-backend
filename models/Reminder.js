const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
  category: { type: String, required: true }, 
      reminderTime: { type: Date, required: true },
    category: {
      type: String,
      required: true,
      enum: ["medication", "bills", "tasks", "water", "meetings", "birthdays", "custom"],
    },

    time: { type: String, required: true }, // HH:MM string

    frequency: {
      type: String,
      enum: ["once", "daily", "weekly", "monthly"],
      default: "daily",
    },

    notifyVia: [{ type: String, enum: ["email", "push"] }], // Optional
    isActive: { type: Boolean, default: true },
    completed: { type: Boolean, default: false },

    color: { type: String, default: "gray" },

    notifications: {
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", ReminderSchema);

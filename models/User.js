// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  pushSubscription: {
    endpoint: String,
    expirationTime: Date,
    keys: {
      p256dh: String,
      auth: String
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);

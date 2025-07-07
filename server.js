const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("./utils/reminderCron");

const authRoutes = require("./routes/auth");
const reminderRoutes = require("./routes/reminder");
const pushRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", authRoutes); 

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reminders", reminderRoutes);

// Connect to MongoDB and Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    require("./utils/reminderCron");
    app.listen(process.env.PORT, () => {
      console.log("✅ Server running on port", process.env.PORT);
    });
  })
  .catch(err => console.error("❌ DB connection error:", err));


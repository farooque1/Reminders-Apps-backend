const express = require("express");
const Reminder = require("../models/Reminder");
const auth = require("../middlewares/auth");
const router = express.Router();
const nodemailer = require("nodemailer");

const { DateTime } = require("luxon");

router.post("/", auth, async (req, res) => {
  try {
    const { reminderTime, ...rest } = req.body;

    // Interpret input as IST
    const istDateTime = DateTime.fromISO(reminderTime, { zone: 'Asia/Kolkata' });

    // Convert to UTC
    const utcDate = istDateTime.toUTC().toJSDate();

    const reminder = new Reminder({
      ...rest,
      reminderTime: utcDate,
      userId: req.user.id,
    });

    await reminder.save();
    res.json(reminder);
  } catch (err) {
    console.error("❌ Reminder creation error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Get All Reminders for User
router.get("/", auth, async (req, res) => {
  const reminders = await Reminder.find({ userId: req.user.id });
  res.json(reminders);
});

// Update Reminder
router.put("/:id", auth, async (req, res) => {
  const updated = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete Reminder
router.delete("/:id", auth, async (req, res) => {
  await Reminder.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test route for email
router.get('/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'sfarooque65@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email from your reminder service'
    });
    res.send('Email sent successfully');
  } catch (err) {
    res.status(500).send('Email failed: ' + err.message);
  }
});

module.exports = router;

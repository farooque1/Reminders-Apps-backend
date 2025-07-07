const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const authenticate = require("../middlewares/auth");

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hash });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" }); // optional: set expiry
    res.json({
      token: `${token}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/save-subscription", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = req.body;

    await User.findByIdAndUpdate(userId, { pushSubscription: subscription });
    res.status(200).json({ message: "Subscription saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

// router.post("/save-subscription", async (req, res) => {
//   const { userId, subscription } = req.body;

//   if (!userId || !subscription) {
//     return res.status(400).json({ error: "Missing userId or subscription" });
//   }

//   try {
//     const user = await User.findByIdAndUpdate(
//       userId,
//       { pushSubscription: subscription },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json({ message: "✅ Push subscription saved", user });
//   } catch (err) {
//     console.error("❌ Error saving subscription:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


module.exports = router;

require("dotenv").config();
const cron = require("node-cron");
const Reminder = require("../models/Reminder");
const nodemailer = require("nodemailer");
const createPushInstance = require("../utils/createPushInstance");

// 📧 Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ⏰ Cron runs every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const pastBuffer = new Date(now.getTime() - 30000);
  const futureBuffer = new Date(now.getTime() + 30000);

  console.log("⏰ CRON running at:", now.toISOString());

  try {
    const reminders = await Reminder.find({
      reminderTime: {
        $gte: pastBuffer,
        $lte: futureBuffer,
      },
      isActive: true,
    }).populate("userId");

    console.log(`📋 Found ${reminders.length} due reminders`);

    for (const reminder of reminders) {
      const userEmail = reminder.userId?.email;
      console.log("🔔 Processing reminder for:", userEmail);

      if (!userEmail) {
        console.log(`⚠️ Skipped reminder ${reminder._id}: No user email`);
        continue;
      }

      // 📧 Send email if enabled
      if (reminder.notifications?.email) {
        const mailOptions = {
          from: `"Reminder App" <${process.env.EMAIL_USER}>`,
          to: userEmail,
          subject: `Reminder: ${reminder.title}`,
          text: reminder.description || "Don't forget!",
          html: `<p><strong>${reminder.title}</strong><br>${
            reminder.description || "Don't forget!"
          }</p>`,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent to ${userEmail}`);
        } catch (err) {
          console.error(`❌ Failed to send email to ${userEmail}:`, err.message);
        }
      }

      // 📲 Send push notification if enabled
      if (reminder.notifications?.push) {
        const pushSub = reminder.userId?.pushSubscription;

        if (!pushSub) {
          console.log(`⚠️ No push subscription for ${userEmail}`);
        } else {
          try {
            const webPush = createPushInstance({
              email: userEmail,
              publicKey: process.env.VAPID_PUBLIC_KEY,
              privateKey: process.env.VAPID_PRIVATE_KEY,
            });

            await webPush.sendNotification(
              pushSub,
              JSON.stringify({
                title: reminder.title,
                body: reminder.description,
              })
            );

            console.log(`📲 Push sent to ${userEmail}`);
          } catch (err) {
            console.error(`❌ Push failed for ${userEmail}:`, err.message);
          }
        }
      }

      // 🔕 Deactivate one-time reminders
      if (reminder.frequency === "once") {
        try {
          reminder.isActive = false;
          await reminder.save();
          console.log(`🔕 Deactivated one-time reminder: ${reminder.title}`);
        } catch (err) {
          console.error(`❌ Failed to deactivate:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error("❌ CRON processing error:", err.message);
  }
});

console.log("🔔 Reminder Cron Job Started");

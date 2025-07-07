// const webPush = require("web-push");
// webPush.setVapidDetails(
//   "mailto:sfarooque65@gmail.com",
//   process.env.VAPID_PUBLIC_KEY,
//   process.env.VAPID_PRIVATE_KEY
// );
// module.exports = webPush;

import createPushInstance from "../utils/createPushInstance.js";

const webPush = createPushInstance({
  email: reminder.userId.email,
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
});

await webPush.sendNotification(reminder);


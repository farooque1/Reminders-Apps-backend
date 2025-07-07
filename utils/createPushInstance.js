const webPush = require("web-push");

function createPushInstance({ email, publicKey, privateKey }) {
  if (!email || !email.includes("@")) {
    throw new Error("Invalid email for VAPID subject");
  }

  webPush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
  return webPush;
}

module.exports = createPushInstance;

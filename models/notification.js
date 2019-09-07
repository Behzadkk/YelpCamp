var mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
  username: String,
  campgroundSlug: String,
  isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model("Notification", notificationSchema);

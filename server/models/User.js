const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // In this app, roles are fluid, so we don't strictly need a 'role' field
  // unless you want to track if they are primarily a client or freelancer.
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
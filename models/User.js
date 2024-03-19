// // models/User.js
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema; 

// const userSchema = new Schema({
//   username: String,
//   password: String,
//   email: String,
//   isAdmin: { type: Boolean, default: false },
//   blog: [
//     {
//       type: Schema.Types.ObjectId,
//       ref: "Blog"
//     }
//   ]
// });

// const User = mongoose.model('User', userSchema);
// module.exports = User;
// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }, // Added isVerified field
  verificationToken: String, // Added verificationToken field
  blog: [
    {
      type: Schema.Types.ObjectId,
      ref: "Blog"
    }
  ]
});

const User = mongoose.model('User', userSchema);
module.exports = User;




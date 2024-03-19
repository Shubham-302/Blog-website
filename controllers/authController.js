// controllers/authController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shubham1337.be21@chitkara.edu.in',
    pass: '',
  },
});
const sendVerificationEmail =(email, verificationToken) => {
  const verificationLink = `http://localhost:4000/auth/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: 'shubham1337.be21@gmail.com',
    to: email,
    subject: 'Verify Your Email',
    text: `Click on the following link to verify your email: ${verificationLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
},

 generateVerificationToken =() => {
  return generateRandomString(32);
};

const generateRandomString = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};
const authController = {

 register : async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Determine if the user should be an admin based on the provided username and email
    const isAdmin = username.toLowerCase() === 'shubham' && email.toLowerCase() === 'shubham1337.be21@chitkara.edu.in';

    // Generate a verification token
    const verificationToken = generateRandomString(32);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with username, hashed password, email, and verification token
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      isAdmin,
      verificationToken,
    });

    // Save the new user to the database
    await newUser.save();

    // Send the verification email with the user's email
    sendVerificationEmail(email, verificationToken);
  
    // Redirect to a page indicating that the user needs to check their email for verification
    res.send('check your email to verify email');
  } catch (error) {
    console.error(error);
    res.redirect('/auth/register');
  }
},
verifyEmail: async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      // Invalid token
      return res.status(400).send('Invalid verification token');
    }

    // Update user status to indicate email verification
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Redirect to the desired page after successful verification
    res.redirect('http://localhost:4000/blog');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
},
 
  
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Find the user by username
      const user = await User.findOne({ username });
  
      // Check if the user exists and if the password is correct
      if (!user || !(await bcrypt.compare(password, user.password))) {
        
        return res.redirect('/auth/register');
      }
  
      // Store user information in the session
      req.session.user = user;
  
      res.redirect('/blog');
    } catch (error) {
    
      res.redirect('/auth/login');
    }
  },
  

  logout: (req, res) => {
    // Destroy the session to log out the user
    req.session.destroy(() => {
      res.redirect('/blog');
    });
  },
};

module.exports = authController;

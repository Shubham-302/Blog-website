// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration route
router.post('/register', authController.register);


// Login route
router.post('/login', authController.login);

// Logout route
router.get('/logout', authController.logout);

// Render registration form
router.get('/register', (req, res) => {
  res.render('register', { user: req.session.user });
});

// Render login form
router.get('/login', (req, res) => {
  res.render('login', { user: req.session.user });
});

router.get('/verify-email', authController.verifyEmail);

module.exports = router;

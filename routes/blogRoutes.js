const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const blogController = require('../controllers/blogController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.get('/', blogController.viewHomePage);
router.get('/all-blogs', blogController.viewAllBlogs);
router.get('/myblog', ensureAuthenticated, blogController.myblog);
router.get('/add-blog', ensureAuthenticated, (req, res) => {
  res.render('add-blog', { user: req.session.user });
});
router.post('/add-blog', ensureAuthenticated, upload.single('image'), blogController.addBlog);
router.get('/single-blog/:id', blogController.viewSingleBlog);

// Routes for blog approval, rejection, and deletion
router.get('/settings', ensureAuthenticated, blogController.getAdminSettings);
// Update the routes for approval, rejection, and deletion
router.get('/approve-blog/:id', ensureAuthenticated, blogController.approveBlog);
router.get('/reject-blog/:id', ensureAuthenticated, blogController.rejectBlog);
router.get('/delete-blog/:id', ensureAuthenticated, blogController.deleteBlog);

// New route for updating user details
router.post('/settings/update', ensureAuthenticated, blogController.updateUser);
// New route for deleting user account
router.post('/settings/delete', ensureAuthenticated, blogController.deleteAccount);

module.exports = router;

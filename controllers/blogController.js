// controllers/blogController.js
const User = require('../models/User');
const Blog = require('../models/Blog');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shubham1337.be21@chitkara.edu.in',
    pass: '',
  },
});

async function notifyAdmin(blog) {
  try {
    blog.status = 'Pending';
    await blog.save();
  } catch (error) {
    console.error('Error notifying admin:', error);
  }
}


const blogController = {
  viewHomePage: async (req, res) => {
    try {
      const homePageBlogs = await Blog.find({ status: 'Approved' }).limit(4);
      const allBlogs = await Blog.find({ status: 'Approved' });
      res.render('home', { homePageBlogs, allBlogs, user: req.session.user });
    } catch (error) {
      console.error('Error in viewHomePage:', error);
      res.render('error', { error, user: req.session.user });
    }
  },
  
  viewSingleBlog: async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id).populate('author');
      if (blog.status === 'Approved') {
        res.render('single-blog', { singleBlog: blog, user: req.session.user });
      } else {
        res.redirect('/'); // Redirect or handle as needed for non-approved blogs
      }
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  },
  
  viewAllBlogs: async (req, res) => {
    try {
      const blogs = await Blog.find({ status: 'Approved' }).populate('author');
      res.render('blogs', { blogs, user: req.session.user });
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  },
  
  myblog: async (req, res) => {
    try {
      let user = await User.findById(req.session.user._id).populate({
        path: 'blog',
        match: { status: 'Approved' }, // Filter only approved blogs
        populate: {
          path: 'author',
          model: 'User',
        },
      });
      res.render('myblog', { blogs: user.blog, user: req.session.user });
    } catch (error) {
      console.error('Error in myblog:', error);
      res.redirect('/');
    }
  },
  

addBlog: async (req, res) => {
  const { title, content } = req.body;

  try {
    const isAdmin = req.session.user.isAdmin; // Assuming you have an 'isAdmin' property in your user model

    const newBlog = new Blog({
      title,
      content,
      imagePath: req.file ? `/uploads/${req.file.filename}` : null,
      author: req.session.user._id,
      status: isAdmin ? 'Approved' : 'Pending', // Set status based on admin status
    });

    // Save the new blog
    await newBlog.save();

    const user = await User.findById(req.session.user._id);
    user.blog.push(newBlog._id);
    await user.save();

    if (!isAdmin) {
      // Notify admin about the new blog for approval using Socket.IO
      notifyAdmin(newBlog);

      // Pass the io object to the function
      const io = req.io;
      io.emit('newBlogNotification');
    }

    // Redirect to the home page or any other page
    res.redirect('/blog');
  } catch (error) {
    console.error(error);
    res.redirect('/blog');
  }
},


approveBlog: async (req, res) => {
  try {
    const blogId = req.params.id;

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, { status: 'Approved' }, { new: true });


    // Find the admin user
    const adminUser = await User.findOne({ isAdmin: true });

    // Send approval email to the user
    const user = await User.findById(updatedBlog.author);
    const mailOptions = {
      from: adminUser.email, // Use the admin user's email as the "from" address
      to: user.email,
      subject: 'Blog Approved',
      text: `Your blog "${updatedBlog.title}" has been approved.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.redirect('/blog/settings');
  } catch (error) {
    console.error('Error in approveBlog:', error);
    res.redirect('/');
  }
},


rejectBlog: async (req, res) => {
  try {
    const blogId = req.params.id;

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, { status: 'Rejected' }, { new: true });


    // Find the admin user
    const adminUser = await User.findOne({ isAdmin: true });

    // Send rejection email to the user
    const user = await User.findById(updatedBlog.author);
    const mailOptions = {
      from: adminUser.email, // Use the admin user's email as the "from" address
      to: user.email,
      subject: 'Blog Rejected',
      text: `Your blog "${updatedBlog.title}" has been rejected.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.redirect('/blog/settings');
  } catch (error) {
    console.error('Error in rejectBlog:', error);
    res.redirect('/');
  }
},

updateUser: async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Retrieve the user from the database
    const user = await User.findById(req.session.user._id);

    // Update user details
    user.name = name;
    user.email = email;

    // Check if a new password is provided
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Save the updated user to the database
    await user.save();

    // Redirect to the settings page or any other page you prefer
    res.redirect('/blog/settings');
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.redirect('/blog'); // Redirect to the home page or an error page
  }
},

deleteAccount: async (req, res) => {
  try {
    // console.log('Request Body:', req.body);

    // Retrieve the user from the database
    const user = await User.findById(req.session.user._id);
    // console.log('User:', user);

    if (!user) {
      // Handle case where the user is not found
      console.log('User not found.');
      return res.redirect('/blog/settings');
    }

    // Check if the provided password is not empty
    if (!req.body.passwordToDelete) {
      // Handle case where the password is empty
      console.log('Password is empty.');
      return res.redirect('/blog/settings');
    }

    // Check if the provided password matches the user's password
    const isPasswordMatch = await bcrypt.compare(req.body.passwordToDelete, user.password);

    if (!isPasswordMatch) {
      // Handle case where the password does not match
      console.log('Password does not match.');
      return res.redirect('/blog/settings');
    }

    // Remove the user from the database
    await User.deleteOne({ _id: user._id });

    // Redirect to the home page or any other page you prefer
    res.redirect('/blog');

  } catch (error) {
    console.error('Error in deleteAccount:', error);
    res.redirect('/blog/settings'); // Redirect to the settings page or an error page
  }
},

// blogController.js
getAdminSettings: async (req, res) => {
  try {
    const blogsToApprove = await Blog.find({ status: 'Pending' });
    const approvedBlogs = await Blog.find({ status: 'Approved' });
    
    if (req.session.user.isAdmin) {
      // Render admin-settings.hbs if the user is an admin
      res.render('admin-settings', { user: req.session.user, blogsToApprove, approvedBlogs });
    } else {
      // Render settings.hbs for non-admin users
      res.render('settings', { user: req.session.user, blogsToApprove });
    }
  } catch (error) {
    console.error('Error in getAdminSettings:', error);
    res.render('error', { error, user: req.session.user });
  }
},


// Assuming this is your existing deleteBlog route handler
deleteBlog: async (req, res) => {
  try {
    const blogId = req.params.id;

    // Find the blog to be deleted
    const deletedBlog = await Blog.findById(blogId);

    // Delete the blog
    await Blog.findByIdAndDelete(blogId);

    // Update the user's blog array to remove the deleted blog
    await User.findByIdAndUpdate(req.session.user._id, { $pull: { blog: blogId } });

    res.redirect('/blog/settings');
  } catch (error) {
    console.error('Error in deleteBlog:', error);
    res.redirect('/');
  }
},

};



module.exports = blogController;
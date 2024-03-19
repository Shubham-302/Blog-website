// models/Blog.js
const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: String,
  content: String,
  imagePath: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }, 
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
});


const Blog = mongoose.model('Blog', blogPostSchema);
module.exports = Blog;

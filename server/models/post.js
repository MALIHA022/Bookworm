const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
  // Add more fields as needed
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);

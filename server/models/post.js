const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,

  likes: {
    type: Number,
    default: 0
  },
  bookmarks: {
    type: Number,   
    default: 0
  },

}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);

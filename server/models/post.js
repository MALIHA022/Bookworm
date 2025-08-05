const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,

likes: {
  type: [String], // [mongoose.Schema.Types.ObjectId] using users later
  default: [],
},
bookmarks: {
  type: [String],
  default: [],
},


}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);

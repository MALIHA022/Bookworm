const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  type: { type: String, required: true },       // 'donate', 'review', 'sell'
  title: String,                                // for reviews
  bookTitle: String,                            // for donate/sell
  author: { type: String, required: true },
  content: String,                              // review text or description
  description: String,                          // donate/sell description
  price: Number,                                // only for 'sell'
  likes: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);

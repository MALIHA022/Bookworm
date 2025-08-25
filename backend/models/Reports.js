const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'attended', 'dismissed'], default: 'pending' },
  feedback: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);

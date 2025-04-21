const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedUserId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  reporterId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  reason: { type: String, required: true },
  proofUrl: { type: String, default: '' },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);

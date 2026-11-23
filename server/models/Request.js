const mongoose = require('mongoose');
const { REQUEST_CATEGORIES, PRIORITIES, REQUEST_STATUSES } = require('../config/constants');

const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: REQUEST_STATUSES, required: true },
    note: { type: String, default: '', maxlength: 1000 },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 5, maxlength: 100 },
    category: { type: String, enum: REQUEST_CATEGORIES, required: [true, 'Category is required'] },
    description: { type: String, required: [true, 'Description is required'], trim: true, minlength: 10, maxlength: 1000 },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    status: { type: String, enum: REQUEST_STATUSES, default: 'Pending' },
    adminResponse: { type: String, default: '', trim: true, maxlength: 1000 },
    rejectionReason: { type: String, default: '', trim: true, maxlength: 500 },
    resolvedAt: { type: Date, default: null },
    history: [historySchema],
  },
  { timestamps: true }
);

requestSchema.index({ user: 1, createdAt: -1 });
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ category: 1 });
requestSchema.index({ priority: 1 });

requestSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Request', requestSchema);

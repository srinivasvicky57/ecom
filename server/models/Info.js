const mongoose = require('mongoose');

const contentItemSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  text: { type: String, default: '' },
}, { _id: false });

const infoSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    enum: ['shipping', 'returns', 'size-guide', 'faq'],
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: [contentItemSchema],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Info', infoSchema);

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: '',
  },
  subCategories: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);

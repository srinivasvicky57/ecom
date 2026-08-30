const mongoose = require('mongoose')

const productCodeImageSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
  width: {
    type: Number,
    min: 0,
    default: 0,
  },
  height: {
    type: Number,
    min: 0,
    default: 0,
  },
}, {
  timestamps: true,
})

productCodeImageSchema.index({ productCode: 1 }, { unique: true })

module.exports = mongoose.model('ProductCodeImage', productCodeImageSchema)

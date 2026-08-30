const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  image: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: {
    type: Number,
    min: 0,
    default: 0
  },
  badge: {
    type: String,
    trim: true,
    default: ''
  },
  sizes: [{
    size: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 }
  }],
  colors: {
    type: [String],
    default: []
  },
  material: {
    type: String,
    required: true,
    trim: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: {
    type: [String],
    default: []
  },
  weight: {
    type: String,
    default: ''
  },
  dimensions: {
    type: String,
    default: ''
  },
  careInstructions: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

// Index for common queries
productSchema.index({ category: 1, isActive: 1 })
productSchema.index({ isFeatured: 1 })
productSchema.index({ tags: 1 })
productSchema.index({ name: 'text', description: 'text', tags: 'text' })

module.exports = mongoose.model('Product', productSchema)

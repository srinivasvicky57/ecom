const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  text: {
    type: String,
    default: '',
  },
  badge: {
    type: String,
    default: 'Handcrafted with Love',
  },
  title: {
    type: String,
    default: 'MS Vastravarna',
  },
  tagline: {
    type: String,
    default: 'The ultimate kalamkari fashion house',
  },
  subheading: {
    type: String,
    default: 'Every piece is a canvas, Every weave a legacy.',
  },
  description: {
    type: String,
    default: 'Rediscover ancient traditions through contemporary silhouettes. Shop our signature hand-crafted collection.',
  },
  products: {
    type: Number,
    default: 0,
  },
  artisans: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);

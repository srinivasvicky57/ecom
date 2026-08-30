const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const User = require('../models/User');

// GET /api/banner - Fetch banner text
router.get('/', async (req, res) => {
  try {
    let banner = await Banner.findOne();
    if (!banner) {
      banner = await Banner.create({ text: '' });
    }
    const happyCustomers = await User.countDocuments();
    res.json({
      text: banner.text,
      badge: banner.badge,
      title: banner.title,
      tagline: banner.tagline,
      subheading: banner.subheading,
      description: banner.description,
      products: banner.products,
      happyCustomers,
      artisans: banner.artisans,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banner' });
  }
});

// PUT /api/banner - Update banner fields
router.put('/', async (req, res) => {
  try {
    const { text, badge, title, tagline, subheading, description, products, artisans } = req.body;
    let banner = await Banner.findOne();
    if (!banner) {
      banner = await Banner.create({ text, badge, title, tagline, subheading, description, products, artisans });
    } else {
      if (text !== undefined) banner.text = text;
      if (badge !== undefined) banner.badge = badge;
      if (title !== undefined) banner.title = title;
      if (tagline !== undefined) banner.tagline = tagline;
      if (subheading !== undefined) banner.subheading = subheading;
      if (description !== undefined) banner.description = description;
      if (products !== undefined) banner.products = products;
      if (artisans !== undefined) banner.artisans = artisans;
      await banner.save();
    }
    const happyCustomers = await User.countDocuments();
    res.json({
      message: 'Banner updated',
      text: banner.text,
      badge: banner.badge,
      title: banner.title,
      tagline: banner.tagline,
      subheading: banner.subheading,
      description: banner.description,
      products: banner.products,
      happyCustomers,
      artisans: banner.artisans,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

module.exports = router;

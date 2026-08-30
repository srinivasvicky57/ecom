const express = require('express');
const router = express.Router();
const Info = require('../models/Info');

// Seed empty sections if collection is empty (runs after DB connection)
const mongoose = require('mongoose');
async function seedDefaults() {
  try {
    const count = await Info.countDocuments();
    if (count === 0) {
      await Info.insertMany([
        { type: 'shipping', title: 'Shipping Information', content: [] },
        { type: 'returns', title: 'Returns & Exchanges', content: [] },
        { type: 'size-guide', title: 'Size Guide', content: [] },
        { type: 'faq', title: 'Frequently Asked Questions', content: [] },
      ]);
      console.log('✅ Info sections seeded');
    }
  } catch (err) {
    console.error('⚠️ Info seed skipped (DB not ready):', err.message);
  }
}
if (mongoose.connection.readyState === 1) {
  seedDefaults();
} else {
  mongoose.connection.once('connected', seedDefaults);
}

// GET /api/info — fetch all 4 sections
router.get('/', async (req, res) => {
  try {
    const sections = await Info.find().sort({ type: 1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch info sections' });
  }
});

// GET /api/info/:type — fetch one section
router.get('/:type', async (req, res) => {
  try {
    const section = await Info.findOne({ type: req.params.type });
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch info section' });
  }
});

// PUT /api/info/:type — update a section's content array
router.put('/:type', async (req, res) => {
  try {
    const { content } = req.body;
    const section = await Info.findOneAndUpdate(
      { type: req.params.type },
      { content },
      { new: true, runValidators: true }
    );
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json({ message: 'Info section updated', section });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update info section' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET /api/categories - Fetch all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, icon, subCategories } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const category = await Category.create({ name, icon, subCategories: subCategories || [] });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/categories/:id - Update a category
router.put('/:id', async (req, res) => {
  try {
    const { name, icon, subCategories } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, icon, subCategories },
      { new: true }
    );
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;

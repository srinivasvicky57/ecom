const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { authMiddleware } = require('../middleware/auth')

// All cart routes require authentication
router.use(authMiddleware)

// GET /api/cart — get user's cart (populated with product details)
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).populate('cartItems.product')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user.cartItems)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' })
  }
})

// POST /api/cart — add product to cart (or increment qty if already exists with same size)
router.post('/', async (req, res) => {
  try {
    const { productId, size = '', qty = 1 } = req.body
    if (!productId) return res.status(400).json({ error: 'productId is required' })

    const user = await User.findOne({ userId: req.user.userId })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const existing = user.cartItems.find(
      item => item.product.toString() === productId && item.size === size
    )

    if (existing) {
      existing.qty += qty
    } else {
      user.cartItems.push({ product: productId, size, qty })
    }

    await user.save()
    const updated = await User.findOne({ userId: req.user.userId }).populate('cartItems.product')
    res.json(updated.cartItems)
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart' })
  }
})

// PUT /api/cart/:itemId — update qty for a cart item
router.put('/:itemId', async (req, res) => {
  try {
    const { qty } = req.body
    const user = await User.findOne({ userId: req.user.userId })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const item = user.cartItems.id(req.params.itemId)
    if (!item) return res.status(404).json({ error: 'Cart item not found' })

    if (qty < 1) {
      item.deleteOne()
    } else {
      item.qty = qty
    }

    await user.save()
    const updated = await User.findOne({ userId: req.user.userId }).populate('cartItems.product')
    res.json(updated.cartItems)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart' })
  }
})

// DELETE /api/cart/:itemId — remove item from cart
router.delete('/:itemId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const item = user.cartItems.id(req.params.itemId)
    if (!item) return res.status(404).json({ error: 'Cart item not found' })

    item.deleteOne()
    await user.save()
    const updated = await User.findOne({ userId: req.user.userId }).populate('cartItems.product')
    res.json(updated.cartItems)
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from cart' })
  }
})

module.exports = router

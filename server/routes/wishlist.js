const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { authMiddleware } = require('../middleware/auth')

// All wishlist routes require authentication
router.use(authMiddleware)

// GET /api/wishlist — get user's wishlist (populated with product details)
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).populate('wishlist')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user.wishlist)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wishlist' })
  }
})

// POST /api/wishlist/:productId — add product to wishlist (toggle)
router.post('/:productId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const productId = req.params.productId
    const index = user.wishlist.findIndex(id => id.toString() === productId)

    if (index > -1) {
      // Already in wishlist — remove it
      user.wishlist.splice(index, 1)
      await user.save()
      return res.json({ message: 'Removed from wishlist', wishlisted: false, wishlist: user.wishlist })
    } else {
      // Not in wishlist — add it
      user.wishlist.push(productId)
      await user.save()
      return res.json({ message: 'Added to wishlist', wishlisted: true, wishlist: user.wishlist })
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update wishlist' })
  }
})

// DELETE /api/wishlist/:productId — remove product from wishlist
router.delete('/:productId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId })
    if (!user) return res.status(404).json({ error: 'User not found' })

    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId)
    await user.save()
    res.json({ message: 'Removed from wishlist', wishlist: user.wishlist })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from wishlist' })
  }
})

module.exports = router

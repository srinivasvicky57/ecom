const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { authMiddleware } = require('../middleware/auth')

// All address routes require authentication
router.use(authMiddleware)

// GET /api/address — get all addresses
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user.addresses)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses' })
  }
})

// POST /api/address — add a new address
router.post('/', async (req, res) => {
  try {
    const { name, mobile, pincode, state, address, landmark, district, isDefault } = req.body
    if (!name || !mobile || !pincode || !state || !address || !landmark || !district) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const user = await User.findOne({ userId: req.user.userId })
    if (!user) return res.status(404).json({ error: 'User not found' })

    // If this is marked default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false })
    }

    // If this is the first address, make it default automatically
    const makeDefault = isDefault || user.addresses.length === 0

    user.addresses.push({ name, mobile, pincode, state, address, landmark, district, isDefault: makeDefault })
    await user.save()
    res.json(user.addresses)
  } catch (err) {
    res.status(500).json({ error: 'Failed to add address' })
  }
})

// PUT /api/address/:id — update an address
router.put('/:id', async (req, res) => {
  try {
    const { name, mobile, pincode, state, address, landmark, district, isDefault } = req.body
    const user = await User.findOne({ userId: req.user.userId })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const addr = user.addresses.id(req.params.id)
    if (!addr) return res.status(404).json({ error: 'Address not found' })

    if (name) addr.name = name
    if (mobile) addr.mobile = mobile
    if (pincode) addr.pincode = pincode
    if (state) addr.state = state
    if (address) addr.address = address
    if (landmark) addr.landmark = landmark
    if (district) addr.district = district

    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false })
      addr.isDefault = true
    }

    await user.save()
    res.json(user.addresses)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update address' })
  }
})

// PUT /api/address/:id/default — set an address as default
router.put('/:id/default', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const addr = user.addresses.id(req.params.id)
    if (!addr) return res.status(404).json({ error: 'Address not found' })

    user.addresses.forEach(a => { a.isDefault = false })
    addr.isDefault = true

    await user.save()
    res.json(user.addresses)
  } catch (err) {
    res.status(500).json({ error: 'Failed to set default address' })
  }
})

// DELETE /api/address/:id — delete an address
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const addr = user.addresses.id(req.params.id)
    if (!addr) return res.status(404).json({ error: 'Address not found' })

    const wasDefault = addr.isDefault
    addr.deleteOne()

    // If we deleted the default, make the first remaining one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true
    }

    await user.save()
    res.json(user.addresses)
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address' })
  }
})

module.exports = router

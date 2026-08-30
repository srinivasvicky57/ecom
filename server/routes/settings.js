const express = require('express')
const router = express.Router()
const Setting = require('../models/Setting')
const { authMiddleware } = require('../middleware/auth')

const getSetting = async (key, defaultValue = false) => {
  const setting = await Setting.findOne({ key })
  if (!setting) return defaultValue
  return setting.value
}

router.get('/maintenance', async (req, res) => {
  try {
    const maintenanceMode = await getSetting('maintenanceMode', false)
    res.json({ maintenanceMode: Boolean(maintenanceMode) })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch maintenance status' })
  }
})

router.put('/maintenance', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const { maintenanceMode } = req.body
    const value = Boolean(maintenanceMode)

    const setting = await Setting.findOneAndUpdate(
      { key: 'maintenanceMode' },
      { key: 'maintenanceMode', value },
      { upsert: true, new: true, runValidators: true }
    )

    res.json({
      message: value ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
      maintenanceMode: Boolean(setting.value),
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update maintenance status' })
  }
})

module.exports = router

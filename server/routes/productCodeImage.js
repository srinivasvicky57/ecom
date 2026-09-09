const express = require('express')
const router = express.Router()
const multer = require('multer')
const ProductCodeImage = require('../models/ProductCodeImage')
const { authMiddleware } = require('../middleware/auth')

const requireAdmin = (req, res) => {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: 'Admin access required' })
    return false
  }
  return true
}

// Transform document to include data URI
const transformDocument = (doc) => {
  if (!doc) return doc
  const obj = doc.toObject ? doc.toObject() : doc
  const dataUri = `data:${obj.mimeType};base64,${obj.imageData}`
  return {
    ...obj,
    image: dataUri, // Add image field as data URI for compatibility
  }
}

// Use memory storage to read files into buffer instead of disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'))
    }
    cb(null, true)
  },
})

// GET /api/product-code-images - Fetch all code-image mappings (public)
router.get('/', async (req, res) => {
  try {
    const mappings = await ProductCodeImage.find().sort({ productCode: 1 })
    res.json(mappings.map(transformDocument))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product code images' })
  }
})

// POST /api/product-code-images - Create mapping (admin only)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { productCode } = req.body
    if (!productCode || !String(productCode).trim()) {
      return res.status(400).json({ error: 'Product code is required' })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' })
    }

    const imageData = req.file.buffer.toString('base64')
    const mimeType = req.file.mimetype

    const created = await ProductCodeImage.create({
      productCode: String(productCode).trim().toUpperCase(),
      imageData,
      mimeType,
      width: 0,
      height: 0,
    })

    res.status(201).json(transformDocument(created))
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Product code already exists' })
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message)
      return res.status(400).json({ error: messages.join(', ') })
    }
    res.status(500).json({ error: 'Failed to create product code image' })
  }
})

// PUT /api/product-code-images/:id - Update mapping (admin only)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const { productCode } = req.body
    if (!productCode || !String(productCode).trim()) {
      return res.status(400).json({ error: 'Product code is required' })
    }

    const existing = await ProductCodeImage.findById(req.params.id)
    if (!existing) {
      return res.status(404).json({ error: 'Product code image not found' })
    }

    let imageData = existing.imageData
    let mimeType = existing.mimeType
    let width = existing.width
    let height = existing.height

    if (req.file) {
      imageData = req.file.buffer.toString('base64')
      mimeType = req.file.mimetype
      width = 0
      height = 0
    }

    const updated = await ProductCodeImage.findByIdAndUpdate(
      req.params.id,
      {
        productCode: String(productCode).trim().toUpperCase(),
        imageData,
        mimeType,
        width,
        height,
      },
      { new: true, runValidators: true }
    )

    res.json(transformDocument(updated))
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Product code already exists' })
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message)
      return res.status(400).json({ error: messages.join(', ') })
    }
    res.status(500).json({ error: 'Failed to update product code image' })
  }
})

// DELETE /api/product-code-images/:id - Delete mapping (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return

    const deleted = await ProductCodeImage.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Product code image not found' })

    res.json({ message: 'Product code image deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product code image' })
  }
})

router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Image must be 5MB or smaller' })
    }
    return res.status(400).json({ error: err.message })
  }
  if (err && err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message })
  }
  return res.status(500).json({ error: 'Upload failed' })
})

module.exports = router

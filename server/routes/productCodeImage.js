const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
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

const uploadDir = path.join(__dirname, '..', 'uploads', 'product-code-images')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeCode = String(req.body.productCode || 'ITEM')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '')
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg'
    cb(null, `${safeCode}-${Date.now()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'))
    }
    cb(null, true)
  },
})

const filePathToPublicPath = (absolutePath) => {
  const fileName = path.basename(absolutePath)
  return `/uploads/product-code-images/${fileName}`
}

const tryDeleteFile = (publicPath) => {
  if (!publicPath || !publicPath.startsWith('/uploads/')) return
  const relativePath = publicPath.replace(/^\/uploads\//, '')
  const absolutePath = path.join(__dirname, '..', 'uploads', relativePath)
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath)
  }
}

// GET /api/product-code-images - Fetch all code-image mappings (public)
router.get('/', async (req, res) => {
  try {
    const mappings = await ProductCodeImage.find().sort({ productCode: 1 })
    res.json(mappings)
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
      if (req.file?.path) fs.unlinkSync(req.file.path)
      return res.status(400).json({ error: 'Product code is required' })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' })
    }

    const created = await ProductCodeImage.create({
      productCode: String(productCode).trim().toUpperCase(),
      image: filePathToPublicPath(req.file.path),
      width: 0,
      height: 0,
    })

    res.status(201).json(created)
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
      if (req.file?.path) fs.unlinkSync(req.file.path)
      return res.status(400).json({ error: 'Product code is required' })
    }

    const existing = await ProductCodeImage.findById(req.params.id)
    if (!existing) {
      if (req.file?.path) fs.unlinkSync(req.file.path)
      return res.status(404).json({ error: 'Product code image not found' })
    }

    let imagePath = existing.image
    let width = existing.width
    let height = existing.height

    if (req.file) {
      imagePath = filePathToPublicPath(req.file.path)
      width = 0
      height = 0
    }

    const updated = await ProductCodeImage.findByIdAndUpdate(
      req.params.id,
      {
        productCode: String(productCode).trim().toUpperCase(),
        image: imagePath,
        width,
        height,
      },
      { new: true, runValidators: true }
    )

    if (req.file && existing.image !== updated.image) {
      tryDeleteFile(existing.image)
    }

    res.json(updated)
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
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

    tryDeleteFile(deleted.image)

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

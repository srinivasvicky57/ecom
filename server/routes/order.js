const express = require('express')
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')
const router = express.Router()
const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')
const User = require('../models/User')
const { authMiddleware } = require('../middleware/auth')

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const roundMoney = (value) => Number((Number(value || 0)).toFixed(2))

const generateInvoicePdf = (order) => {
  return new Promise((resolve, reject) => {
    const invoiceDir = path.join(__dirname, '..', 'uploads', 'invoices')
    fs.mkdirSync(invoiceDir, { recursive: true })

    const fileName = `${order.orderId}.pdf`
    const filePath = path.join(invoiceDir, fileName)
    const doc = new PDFDocument({ size: 'A4', margin: 0 })
    const stream = fs.createWriteStream(filePath)

    doc.pipe(stream)

    const pageWidth = doc.page.width
    const left = 44
    const right = 550
    const borderColor = '#111111'

    const total = roundMoney(order.totalAmount || 0)
    const taxableAmount = roundMoney(total / 1.05)
    const taxTotal = roundMoney(total - taxableAmount)
    const cgst = roundMoney(taxTotal / 2)
    const sgst = roundMoney(taxTotal / 2)

    const firstItem = order.items && order.items[0] ? order.items[0] : {}
    const itemName = firstItem.productName || 'Kalamkari Cotton saree'
    const itemQty = Number(firstItem.qty || 1)
    const itemPrice = roundMoney(firstItem.price || 0)
    const itemTotal = roundMoney(itemPrice * itemQty)
    const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB')

    doc.fillColor('#f4f4f4').rect(0, 0, pageWidth, 820).fill()

    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(20).text('Tax Invoice', 230, 18, { align: 'center' })

    const headerY = 42
    const headerH = 96
    doc.rect(left, headerY, right - left, headerH).stroke(borderColor)
    doc.fillColor('#f8f5f0').rect(left + 1, headerY + 1, right - left - 2, headerH - 2).fill()

    doc.roundedRect(left + 12, headerY + 14, 52, 52, 8).fillAndStroke('#121212', '#121212')
    doc.fillColor('#d4a654').font('Helvetica-Bold').fontSize(8).text('MS', left + 23, headerY + 24)
    doc.fillColor('#d4a654').font('Helvetica-Bold').fontSize(7).text('V', left + 30, headerY + 34)
    doc.fillColor('#d4a654').font('Helvetica-Bold').fontSize(7).text('Vastravarna', left + 18, headerY + 52)

    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(12).text('MS Vastravarna Kalamkari And Handlooms', left + 76, headerY + 20)
    doc.fillColor('#000000').font('Helvetica').fontSize(8.5).text('Block 13 Mig A, Flat No 4 KPHB 6th Phase Road Hyderabad', left + 76, headerY + 38)
    doc.fillColor('#000000').font('Helvetica').fontSize(8.5).text('Phone: 9391909202', left + 76, headerY + 52)
    doc.fillColor('#000000').font('Helvetica').fontSize(8.5).text('GSTIN: 36BXPUA1960P1ZX', left + 76, headerY + 66)
    doc.fillColor('#000000').font('Helvetica').fontSize(8.5).text('Email: msvastravarnaworks@gmail.com', left + 280, headerY + 52)
    doc.fillColor('#000000').font('Helvetica').fontSize(8.5).text('State: 36-Telangana', left + 280, headerY + 66)

    const billY = 150
    const billH = 70
    doc.rect(left, billY, right - left, billH).stroke(borderColor)
    doc.fillColor('#faf9f7').rect(left + 1, billY + 1, right - left - 2, billH - 2).fill()

    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10).text('Bill To:', left + 16, billY + 12)
    doc.fillColor('#000000').font('Helvetica').fontSize(9).text(order.userName || 'Vicky', left + 16, billY + 28)
    doc.fillColor('#000000').font('Helvetica').fontSize(9).text(`Contact No: ${order.userPhone || '—'}`, left + 16, billY + 42)

    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10).text('Invoice Details:', left + 290, billY + 12)
    doc.fillColor('#000000').font('Helvetica').fontSize(9).text(`No: ${order.orderId}`, left + 290, billY + 28)
    doc.fillColor('#000000').font('Helvetica').fontSize(9).text(`Date: ${invoiceDate}`, left + 290, billY + 42)

    const itemTableY = 232
    const itemTableH = 188
    doc.rect(left, itemTableY, right - left, itemTableH).stroke(borderColor)

    const colWidths = [36, 180, 64, 52, 44, 52, 56, 54, 64]
    const itemHeaders = ['#', 'Item Name', 'HSN/ SAC', 'Quantity', 'Unit', 'MRP(₹)', 'Price/ Unit', 'GST(%)', 'Amount(₹)']
    let cX = left
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8)
    itemHeaders.forEach((header, idx) => {
      doc.text(header, cX + 6, itemTableY + 10, { width: colWidths[idx] - 8 })
      cX += colWidths[idx]
    })
    doc.moveTo(left, itemTableY + 22).lineTo(right, itemTableY + 22).stroke(borderColor)

    const rowY = itemTableY + 28
    let rowX = left
    const itemValues = [
      '1',
      itemName,
      'Kalamkari Cotton saree',
      String(itemQty),
      'Pcs',
      formatCurrency(itemPrice),
      formatCurrency(itemPrice),
      '5%',
      formatCurrency(itemTotal)
    ]

    doc.fillColor('#000000').font('Helvetica').fontSize(8)
    itemValues.forEach((value, idx) => {
      doc.text(String(value), rowX + 6, rowY, { width: colWidths[idx] - 8 })
      rowX += colWidths[idx]
    })

    doc.moveTo(left, itemTableY + 48).lineTo(right, itemTableY + 48).stroke(borderColor)
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8).text('Total', left + 8, itemTableY + 52)
    doc.fillColor('#000000').font('Helvetica').fontSize(8).text(String(itemQty), left + 196, itemTableY + 52)
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8).text(formatCurrency(itemTotal), right - 88, itemTableY + 52, { align: 'right' })

    const taxBoxY = itemTableY + 70
    doc.rect(left, taxBoxY, right - left, 66).stroke(borderColor)
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8).text('Tax Summary:', left + 8, taxBoxY + 8)

    const taxColumns = [92, 120, 82, 82, 90]
    const taxHeaders = ['HSN/ SAC', 'Taxable Amount (₹)', 'CGST', 'SGST', 'Total Tax(₹)']
    let tx = left + 10
    doc.fillColor('#000000').font('Helvetica').fontSize(7)
    taxHeaders.forEach((label, idx) => {
      doc.text(label, tx, taxBoxY + 20, { width: taxColumns[idx] })
      tx += taxColumns[idx]
    })

    doc.moveTo(left, taxBoxY + 32).lineTo(right, taxBoxY + 32).stroke(borderColor)

    doc.fillColor('#000000').font('Helvetica').fontSize(7)
      .text('Kalamkari Cotton saree', left + 10, taxBoxY + 36)
      .text(formatCurrency(taxableAmount), left + 102, taxBoxY + 36)
      .text(`${cgst.toFixed(2)}%`, left + 220, taxBoxY + 36)
      .text(`${sgst.toFixed(2)}%`, left + 300, taxBoxY + 36)
      .text(formatCurrency(taxTotal), left + 382, taxBoxY + 36)

    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(7).text('TOTAL', left + 10, taxBoxY + 52)
    doc.fillColor('#000000').font('Helvetica').fontSize(7).text(formatCurrency(taxableAmount), left + 102, taxBoxY + 52)
    doc.fillColor('#000000').font('Helvetica').fontSize(7).text(formatCurrency(cgst), left + 220, taxBoxY + 52)
    doc.fillColor('#000000').font('Helvetica').fontSize(7).text(formatCurrency(sgst), left + 300, taxBoxY + 52)
    doc.fillColor('#000000').font('Helvetica').fontSize(7).text(formatCurrency(taxTotal), left + 382, taxBoxY + 52)

    const bottomY = 432
    doc.rect(left, bottomY, right - left, 120).stroke(borderColor)
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9).text('Terms And Conditions:', left + 10, bottomY + 8)
    doc.fillColor('#000000').font('Helvetica').fontSize(8).text('Thank you for doing business with us.', left + 10, bottomY + 24)

    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9).text('Invoice Amount In Words:', left + 300, bottomY + 8)
    doc.fillColor('#000000').font('Helvetica').fontSize(8).text('Nine Hundred and Fifty Only', left + 300, bottomY + 22)
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9).text('Sub Total', left + 300, bottomY + 40)
    doc.fillColor('#000000').font('Helvetica').fontSize(8).text(formatCurrency(itemTotal), left + 430, bottomY + 40, { align: 'right' })
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9).text('Total', left + 300, bottomY + 54)
    doc.fillColor('#000000').font('Helvetica').fontSize(8).text(formatCurrency(total), left + 430, bottomY + 54, { align: 'right' })
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9).text('Received', left + 300, bottomY + 68)
    doc.fillColor('#000000').font('Helvetica').fontSize(8).text(formatCurrency(total), left + 430, bottomY + 68, { align: 'right' })
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9).text('Balance', left + 300, bottomY + 82)
    doc.fillColor('#000000').font('Helvetica').fontSize(8).text('₹ 0.00', left + 430, bottomY + 82, { align: 'right' })

    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9).text('For MS Vastravarna Kalamkari And Handlooms:', left + 230, bottomY + 92)
    doc.rect(left + 420, bottomY + 92, 106, 32).stroke(borderColor)
    doc.fillColor('#000000').font('Helvetica').fontSize(8).text('Authorized Signatory', left + 436, bottomY + 104)

    doc.end()

    stream.on('finish', () => {
      resolve({
        fileName,
        url: `/uploads/invoices/${fileName}`,
        generatedAt: new Date()
      })
    })

    stream.on('error', (error) => {
      reject(error)
    })
  })
}

// All order routes require authentication
router.use(authMiddleware)

// ─── POST /api/orders — Place a new order ───────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, payment, shippingCharge = 0, discount = 0 } = req.body

    if (!items || !items.length) {
      return res.status(400).json({ message: 'Order must contain at least one item' })
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' })
    }
    if (!payment || !payment.method) {
      return res.status(400).json({ message: 'Payment method is required' })
    }

    // Fetch user details
    const user = await User.findOne({ userId: req.user.userId })
    if (!user) return res.status(404).json({ message: 'User not found' })

    // ── Stock availability check ──────────────────────────────────────────
    const productIds = items.map(item => item.product)
    const products = await Product.find({ _id: { $in: productIds } })

    const productMap = {}
    products.forEach(p => { productMap[p._id.toString()] = p })

    const outOfStock = []

    for (const item of items) {
      const product = productMap[item.product]

      if (!product) {
        outOfStock.push({ product: item.product, reason: 'Product not found' })
        continue
      }

      if (!product.isActive) {
        outOfStock.push({ product: item.product, name: product.name, reason: 'Product is currently unavailable' })
        continue
      }

      // Check size-wise stock
      if (item.size) {
        const sizeEntry = product.sizes.find(s => s.size === item.size)
        if (!sizeEntry) {
          outOfStock.push({ product: item.product, name: product.name, size: item.size, reason: `Size "${item.size}" not available` })
        } else if (sizeEntry.stock < item.qty) {
          outOfStock.push({
            product: item.product,
            name: product.name,
            size: item.size,
            requested: item.qty,
            available: sizeEntry.stock,
            reason: sizeEntry.stock === 0
              ? `"${product.name}" (Size: ${item.size}) is out of stock`
              : `"${product.name}" (Size: ${item.size}) only ${sizeEntry.stock} left in stock`
          })
        }
      } else {
        // No size specified — check total stock across all sizes
        const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0)
        if (totalStock < item.qty) {
          outOfStock.push({
            product: item.product,
            name: product.name,
            requested: item.qty,
            available: totalStock,
            reason: totalStock === 0
              ? `"${product.name}" is out of stock`
              : `"${product.name}" only ${totalStock} left in stock`
          })
        }
      }
    }

    if (outOfStock.length > 0) {
      return res.status(400).json({
        message: 'Some products are out of stock',
        outOfStock
      })
    }

    // ── Build order items with product snapshots ──────────────────────────
    let itemsTotal = 0
    const orderItems = items.map(item => {
      const product = productMap[item.product]
      const lineTotal = product.price * item.qty
      itemsTotal += lineTotal
      return {
        product: product._id,
        productName: product.name,
        productCode: product.productCode,
        price: product.price,
        qty: item.qty,
        size: item.size || '',
        image: product.image
      }
    })

    const totalAmount = itemsTotal + shippingCharge - discount

    // ── Create order ──────────────────────────────────────────────────────
    const order = await Order.create({
      user: user._id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      items: orderItems,
      shippingAddress,
      payment: {
        method: payment.method,
        transactionId: payment.transactionId || null,
        paymentStatus: payment.method === 'COD' ? 'Pending' : (payment.paymentStatus || 'Pending'),
        paidAt: payment.paymentStatus === 'Paid' ? new Date() : null
      },
      itemsTotal,
      shippingCharge,
      discount,
      totalAmount,
      orderStatus: 'Placed'
    })

    // ── Deduct stock ──────────────────────────────────────────────────────
    for (const item of items) {
      const product = productMap[item.product]
      if (item.size) {
        await Product.updateOne(
          { _id: product._id, 'sizes.size': item.size },
          { $inc: { 'sizes.$.stock': -item.qty } }
        )
      } else {
        // Deduct from first available size(s)
        let remaining = item.qty
        for (const sizeEntry of product.sizes) {
          if (remaining <= 0) break
          const deduct = Math.min(sizeEntry.stock, remaining)
          if (deduct > 0) {
            await Product.updateOne(
              { _id: product._id, 'sizes.size': sizeEntry.size },
              { $inc: { 'sizes.$.stock': -deduct } }
            )
            remaining -= deduct
          }
        }
      }
    }

    // ── Add order ref to user ─────────────────────────────────────────────
    user.orders.push(order._id)
    // Clear cart after successful order
    user.cartItems = []
    await user.save()

    res.status(201).json({ message: 'Order placed successfully', order })
  } catch (err) {
    console.error('Place order error:', err)
    res.status(500).json({ message: 'Failed to place order' })
  }
})

// ─── GET /api/orders — Get all orders for logged-in user ─────────────────────
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name image productCode price sizes')

    res.json(orders)
  } catch (err) {
    console.error('Fetch user orders error:', err)
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
})

// ─── GET /api/orders/admin/all — Admin: get all orders ───────────────────────
router.get('/admin/all', async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const { status, page = 1, limit = 20 } = req.query
    const filter = {}
    if (status) filter.orderStatus = status

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('items.product', 'name image productCode price sizes subcategory'),
      Order.countDocuments(filter)
    ])

    res.json({
      orders,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    })
  } catch (err) {
    console.error('Admin fetch orders error:', err)
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
})

// ─── PATCH /api/orders/admin/:orderId/status — Admin: update order status ────
router.patch('/admin/:orderId/status', async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const { status, cancelReason, trackingId } = req.body
    const validStatuses = ['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned']

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` })
    }

    const order = await Order.findOne({ orderId: req.params.orderId })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    // Prevent updating already delivered/cancelled orders (unless returning)
    if (order.orderStatus === 'Delivered' && status !== 'Returned') {
      return res.status(400).json({ message: 'Delivered orders can only be marked as Returned' })
    }
    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot update a cancelled order' })
    }

    if (status === 'Confirmed' && order.orderStatus === 'Placed') {
      const invoice = await generateInvoicePdf(order)
      order.invoice = invoice
    }

    order.orderStatus = status

    if (status === 'Shipped') {
      if (!trackingId || !trackingId.trim()) {
        return res.status(400).json({ message: 'Tracking ID is required when marking as Shipped' })
      }
      order.trackingId = trackingId.trim()
      order.shippedAt = new Date()
    }

    if (status === 'Delivered') {
      order.deliveredAt = new Date()
      if (order.payment.method !== 'COD') {
        order.payment.paymentStatus = 'Paid'
      }
    }

    if (status === 'Cancelled') {
      order.cancelledAt = new Date()
      order.cancelReason = cancelReason || 'Cancelled by admin'

      // Restore stock on cancellation
      for (const item of order.items) {
        if (item.size) {
          await Product.updateOne(
            { _id: item.product, 'sizes.size': item.size },
            { $inc: { 'sizes.$.stock': item.qty } }
          )
        }
      }

      // Refund if already paid
      if (order.payment.paymentStatus === 'Paid') {
        order.payment.paymentStatus = 'Refunded'
      }
    }

    if (status === 'Returned') {
      // Restore stock on return
      for (const item of order.items) {
        if (item.size) {
          await Product.updateOne(
            { _id: item.product, 'sizes.size': item.size },
            { $inc: { 'sizes.$.stock': item.qty } }
          )
        }
      }

      if (order.payment.paymentStatus === 'Paid') {
        order.payment.paymentStatus = 'Refunded'
      }
    }

    await order.save()

    res.json({
      message: `Order status updated to "${status}"`,
      order,
      invoiceUrl: order.invoice?.url || null
    })
  } catch (err) {
    console.error('Admin update order status error:', err)
    res.status(500).json({ message: 'Failed to update order status' })
  }
})

module.exports = router

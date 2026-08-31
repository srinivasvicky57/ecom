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
const formatPdfCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const roundMoney = (value) => Number((Number(value || 0)).toFixed(2))

// Generate the PDF invoice for a single order
const generateInvoicePdf = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 })
    const pdfRegularFont = 'C:/Windows/Fonts/arial.ttf'
    const pdfBoldFont = 'C:/Windows/Fonts/arialbd.ttf'
    const chunks = []

    doc.font(pdfRegularFont)
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const pageWidth = doc.page.width
    const left = 44
    const right = 550
    const borderColor = '#111111'

    // ── Invoice totals and tax calculations ───────────────────────────────
    const total = roundMoney(order.totalAmount || 0)
    const taxableAmount = roundMoney(total / 1.05)
    const taxTotal = roundMoney(total - taxableAmount)
    const cgst = roundMoney(taxTotal / 2)
    const sgst = roundMoney(taxTotal / 2)
    const savedAmount = roundMoney(order.discount || 0)

    // ── Build item rows for the invoice table ──────────────────────────────
    const firstItem = order.items && order.items[0] ? order.items[0] : {}
    const itemRows = (Array.isArray(order.items) && order.items.length ? order.items : [firstItem]).map((item, index) => {
      const qty = Number(item.qty || 1)
      const mrp = roundMoney(item.mrp || item.price || 0)
      const price = roundMoney(item.price || 0)
      const baseUnitPrice = roundMoney(price / 1.05)
      const gstPerUnit = roundMoney(price - baseUnitPrice)
      const rowTotal = roundMoney(price * qty)
      const gstTotal = roundMoney(gstPerUnit * qty)
      return {
        index: index + 1,
        name: item.productName || 'Kalamkari Cotton saree',
        hsn: '',
        qty,
        unit: 'Pcs',
        mrp,
        price: baseUnitPrice,
        gst: formatPdfCurrency(gstPerUnit),
        gstTotal,
        amount: formatPdfCurrency(rowTotal)
      }
    })
    const itemName = itemRows[0]?.name || 'Kalamkari Cotton saree'
    const itemQty = itemRows.reduce((sum, row) => sum + Number(row.qty || 0), 0)
    const itemMrp = itemRows[0]?.mrp || 0
    const itemPrice = itemRows[0]?.price || 0
    const itemBaseTotal = itemRows.reduce((sum, row) => sum + (Number(row.price || 0) * Number(row.qty || 0)), 0)
    const itemTotal = itemBaseTotal
    const itemGstTotal = itemRows.reduce((sum, row) => sum + Number((row.gstTotal || 0)), 0)
    const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB')

    // ── Background and page title ──────────────────────────────────────────
    doc.fillColor('#f4f4f4').rect(0, 0, pageWidth, 820).fill()
    doc.fillColor('#000000').font(pdfBoldFont).fontSize(20).text('Tax Invoice', 0, 18, { align: 'center', width: pageWidth })

    // ── Company header block ────────────────────────────────────────────────
    const headerY = 42
    const headerH = 96
    doc.rect(left, headerY, right - left, headerH).stroke(borderColor)
    doc.fillColor('#f8f5f0').rect(left + 1, headerY + 1, right - left - 2, headerH - 2).fill()

    try {
      const logoPath = path.join(__dirname, '..', 'uploads', 'images', 'logo.jpg')
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, left + 12, headerY + 18, { width: 56, height: 56 })
      } else {
        doc.roundedRect(left + 12, headerY + 14, 52, 52, 8).fillAndStroke('#121212', '#121212')
        doc.fillColor('#d4a654').font(pdfBoldFont).fontSize(8).text('MS', left + 23, headerY + 24)
        doc.fillColor('#d4a654').font(pdfBoldFont).fontSize(7).text('V', left + 30, headerY + 34)
        doc.fillColor('#d4a654').font(pdfBoldFont).fontSize(7).text('Vastravarna', left + 18, headerY + 52)
      }
    } catch (error) {
      doc.roundedRect(left + 12, headerY + 14, 52, 52, 8).fillAndStroke('#121212', '#121212')
      doc.fillColor('#d4a654').font(pdfBoldFont).fontSize(8).text('MS', left + 23, headerY + 24)
      doc.fillColor('#d4a654').font(pdfBoldFont).fontSize(7).text('V', left + 30, headerY + 34)
      doc.fillColor('#d4a654').font(pdfBoldFont).fontSize(7).text('Vastravarna', left + 18, headerY + 52)
    }

    doc.fillColor('#000000').font(pdfBoldFont).fontSize(12).text('MS Vastravarna Kalamkari And Handlooms', left + 76, headerY + 20)
    doc.fillColor('#000000').font(pdfRegularFont).fontSize(8.5).text('Block 13 Mig A, Flat No 4 KPHB 6th Phase Road Hyderabad', left + 76, headerY + 38)
    doc.fillColor('#000000').font(pdfRegularFont).fontSize(8.5).text('Phone: 9391909202', left + 76, headerY + 52)
    doc.fillColor('#000000').font(pdfRegularFont).fontSize(8.5).text('GSTIN: 36BXPUA1960P1ZX', left + 76, headerY + 66)
    doc.fillColor('#000000').font(pdfRegularFont).fontSize(8.5).text('Email: msvastravarnaworks@gmail.com', left + 280, headerY + 52)
    doc.fillColor('#000000').font(pdfRegularFont).fontSize(8.5).text('State: 36-Telangana', left + 280, headerY + 66)

    // ── Billing party block and invoice metadata ───────────────────────────
    const billY = 150
    const billH = 70
    doc.rect(left, billY, right - left, billH).stroke(borderColor)
    doc.fillColor('#faf9f7').rect(left + 1, billY + 1, right - left - 2, billH - 2).fill()

    doc.fillColor('#000000').font(pdfBoldFont).fontSize(10).text('Bill To:', left + 16, billY + 12)
    doc.fillColor('#000000').font(pdfRegularFont).fontSize(9).text(order.userName || 'Vicky', left + 16, billY + 28)
    doc.fillColor('#000000').font(pdfRegularFont).fontSize(9).text(`Contact No: ${order.userPhone || '—'}`, left + 16, billY + 42)

    doc.fillColor('#000000').font(pdfBoldFont).fontSize(10).text('Invoice Details:', left + 290, billY + 12)
    doc.fillColor('#000000').font(pdfRegularFont).fontSize(9).text(`No: ${order.orderId}`, left + 290, billY + 28)
    doc.fillColor('#000000').font(pdfRegularFont).fontSize(9).text(`Date: ${invoiceDate}`, left + 290, billY + 42)

    // ── Item table block ───────────────────────────────────────────────────
    const itemTableY = 232
    const itemHeaderH = 22
    const itemRowH = 34
    const totalRowH = 22
    const tableRowCount = Math.max(itemRows.length, 1)
    const itemTableHeight = itemHeaderH + (tableRowCount * itemRowH) + totalRowH
    const colWidths = [30, 145, 50, 46, 36, 44, 50, 48, 54]
    const itemHeaders = ['#', 'Item Name', 'HSN/ SAC', 'Quantity', 'Unit', 'MRP(₹)', 'Price/ Unit', 'GST(₹)', 'Amount(₹)']

    const drawCell = (x, y, width, height, text, { bold = false, fontSize = 8, align = 'left' } = {}) => {
      doc.fillColor('#000000').font(bold ? pdfBoldFont : pdfRegularFont).fontSize(fontSize)
      doc.text(String(text || ''), x + 6, y + 5, {
        width: Math.max(width - 10, 10),
        height,
        align,
        lineGap: 1,
        ellipsis: true,
        continued: false
      })
    }

    doc.rect(left, itemTableY, right - left, itemTableHeight).stroke(borderColor)

    let x = left
    itemHeaders.forEach((header, idx) => {
      const align = idx === 0 || idx === 3 || idx === 4 || idx === 7 || idx === 8 ? 'center' : 'center'
      drawCell(x, itemTableY + 5, colWidths[idx], itemHeaderH, header, { bold: true, fontSize: 8, align })
      x += colWidths[idx]
    })

    for (let i = 1; i < itemHeaders.length; i++) {
      const lineX = left + colWidths.slice(0, i).reduce((sum, w) => sum + w, 0)
      doc.moveTo(lineX, itemTableY).lineTo(lineX, itemTableY + itemTableHeight).stroke(borderColor)
    }

    const dataRowY = itemTableY + itemHeaderH
    doc.moveTo(left, dataRowY).lineTo(right, dataRowY).stroke(borderColor)

    itemRows.forEach((row, rowIdx) => {
      const rowY = dataRowY + (rowIdx * itemRowH)
      const rowValues = [
        String(row.index),
        row.name,
        row.hsn,
        String(row.qty),
        row.unit,
        formatPdfCurrency(row.mrp),
        formatPdfCurrency(row.price),
        row.gst,
        row.amount
      ]

      let valueX = left
      rowValues.forEach((value, idx) => {
        if (idx === 7) {
          doc.fillColor('#000000').font(pdfRegularFont).fontSize(8)
          doc.text(String(value || ''), valueX + 6, rowY + 5, {
            width: Math.max(colWidths[idx] - 10, 10),
            height: itemRowH,
            align: 'center',
            lineGap: 1,
            continued: false
          })
          doc.fillColor('#000000').font(pdfRegularFont).fontSize(7)
          doc.text('(5.00%)', valueX + 6, rowY + 18, {
            width: Math.max(colWidths[idx] - 10, 10),
            height: itemRowH,
            align: 'center',
            lineGap: 1,
            continued: false
          })
        } else if (idx === 8) {
          drawCell(valueX, rowY + 2, colWidths[idx], itemRowH, value, { fontSize: 8, align: 'center' })
        } else if (idx === 0 || idx === 3 || idx === 4 || idx === 5 || idx === 6) {
          drawCell(valueX, rowY + 2, colWidths[idx], itemRowH, value, { fontSize: 8, align: 'center' })
        } else {
          drawCell(valueX, rowY + 2, colWidths[idx], itemRowH, value, { fontSize: 8, align: 'center' })
        }
        valueX += colWidths[idx]
      })
    })

    const totalRowY = dataRowY + (tableRowCount * itemRowH)
    const totalPriceUnitX = left + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5]
    const totalGstX = left + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6]
    const totalAmountX = left + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6] + colWidths[7]

    doc.moveTo(left, totalRowY).lineTo(right, totalRowY).stroke(borderColor)
    drawCell(left, totalRowY + 2, 120, totalRowH, 'Total', { bold: true, fontSize: 8 })
    drawCell(left + colWidths[0] + colWidths[1] + colWidths[2], totalRowY + 2, colWidths[3], totalRowH, String(itemQty), { fontSize: 8 })
    drawCell(totalPriceUnitX, totalRowY + 2, colWidths[6], totalRowH, formatPdfCurrency(itemBaseTotal), { fontSize: 8 })
    drawCell(totalGstX, totalRowY + 2, colWidths[7], totalRowH, formatPdfCurrency(itemGstTotal), { fontSize: 8 })
    drawCell(totalAmountX, totalRowY + 2, colWidths[8], totalRowH, formatPdfCurrency(itemTotal + itemGstTotal), { bold: true, fontSize: 8, align: 'right' })

    // Tax summary block - premium GST style layout
  
    doc.end()
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
        mrp: product.originalPrice || product.price,
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

// ─── GET /api/orders/:orderId/invoice — Generate invoice in memory and stream it ───
router.get('/:orderId/invoice', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    if (!req.user.isAdmin) {
      const currentUser = await User.findOne({ userId: req.user.userId })
      if (!currentUser || order.user.toString() !== currentUser._id.toString()) {
        return res.status(403).json({ message: 'You can only view your own invoice' })
      }
    }

    const pdfBuffer = await generateInvoicePdf(order)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${order.orderId}.pdf"`)
    res.send(pdfBuffer)
  } catch (err) {
    console.error('Invoice generation error:', err)
    res.status(500).json({ message: 'Failed to generate invoice' })
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
      order
    })
  } catch (err) {
    console.error('Admin update order status error:', err)
    res.status(500).json({ message: 'Failed to update order status' })
  }
})

module.exports = router

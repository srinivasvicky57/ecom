const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')
const User = require('../models/User')
const { authMiddleware } = require('../middleware/auth')

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

    res.json({ message: `Order status updated to "${status}"`, order })
  } catch (err) {
    console.error('Admin update order status error:', err)
    res.status(500).json({ message: 'Failed to update order status' })
  }
})

module.exports = router

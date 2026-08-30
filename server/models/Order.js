const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    default: () => {
      const now = new Date();
      const timestamp = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');
      const random = Math.floor(Math.random() * 9000) + 1000;
      return `ORD-${timestamp}-${random}`;
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true
  },
  userPhone: {
    type: String,
    required: true,
    trim: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productCode: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    size: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    }
  }],
  shippingAddress: {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    landmark: { type: String, default: '' },
    district: { type: String, required: true }
  },
  payment: {
    method: {
      type: String,
      enum: ['COD', 'UPI', 'Card', 'NetBanking', 'Wallet'],
      required: true
    },
    transactionId: {
      type: String,
      default: null
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  itemsTotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  invoice: {
    fileName: {
      type: String,
      default: null
    },
    url: {
      type: String,
      default: null
    },
    generatedAt: {
      type: Date,
      default: null
    }
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Placed'
  },
  trackingId: {
    type: String,
    default: null,
    trim: true
  },
  shippedAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Order', orderSchema)

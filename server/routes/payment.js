const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, productName } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { productName: productName || '' },
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay create order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ verified: true, paymentId: razorpay_payment_id });
    } else {
      res.status(400).json({ verified: false, error: 'Invalid signature' });
    }
  } catch (err) {
    console.error('Razorpay verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;

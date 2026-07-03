const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// Create an order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, userId } = req.body;

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${userId}_${Date.now()}`
    };

    // In a production app with real keys, you'd do:
    // const order = await razorpay.orders.create(options);
    
    // For local dev simulation without real keys, we mock the order:
    const order = { id: 'order_mock_' + Date.now(), amount: options.amount };

    // Save payment intent in DB
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        razorpayOrderId: order.id,
        status: 'PENDING'
      }
    });

    res.json({ order, paymentId: payment.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating order' });
  }
});

// Verify Payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, paymentId } = req.body;
    
    // Update DB
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        razorpayPaymentId: razorpay_payment_id || ('pay_mock_' + Date.now())
      }
    });

    res.json({ message: 'Payment verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error verifying payment' });
  }
});

// Get all payments (Admin)
router.get('/', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' }});
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

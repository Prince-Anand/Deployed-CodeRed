const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Application = require('../models/Application');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RuIxzwGZv4Rh9h',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'WqzJnD4N8xYWFAWXD9NMfVa6'
});

// Create Order
router.post('/create-order', auth, async (req, res) => {
    try {
        const { amount, applicationId } = req.body;

        const options = {
            amount: amount * 100, // amount in smallest currency unit
            currency: "INR",
            receipt: `order_rcptid_${applicationId}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Verify Payment
router.post('/verify', auth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, applicationId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'WqzJnD4N8xYWFAWXD9NMfVa6')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment success, update application status
            const application = await Application.findById(applicationId).populate('job');
            if (application) {
                application.status = 'hired';
                await application.save();

                // Notify Agent of Hired Status
                const Notification = require('../models/Notification');
                const notification = new Notification({
                    user: application.agent,
                    message: `Congratulations! You have been hired for ${application.job.title || 'a job'}`, // Populating job might be needed if not fully populated, check schema
                    type: 'hire_success',
                    relatedLink: `/dashboard`, // or my-jobs
                    read: false
                });
                await notification.save();

                console.log(`[Payment] Emitting 'Hired' notification to Agent: ${application.agent}`);
                req.io.to(application.agent.toString()).emit('notification', notification);
            }
            res.json({ status: 'success' });
        } else {
            res.status(400).json({ status: 'failure' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

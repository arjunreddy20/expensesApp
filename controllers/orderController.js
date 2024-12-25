const Razorpay = require('razorpay');
const Order = require('../models/orderModel');
const User = require('../models/userModel');

require('dotenv').config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const OrderController = {
    createOrder: async (req, res) => {
        const userId = req.userId;
        const options = {
            amount: 2500, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_order_${userId}`
        };
        try {
            const order = await razorpay.orders.create(options);
            await Order.createOrder(order.id, userId);
            res.status(201).json({ orderId: order.id });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Error creating order', details: err });
        }
    },
    updateOrderStatus: async (req, res) => {
        const { orderId, paymentId, status } = req.body;
        const newStatus = status === 'success' ? 'SUCCESSFUL' : 'FAILED';
        try {
            await Order.updateStatus(orderId, newStatus, paymentId);
            if (newStatus === 'SUCCESSFUL') {
                await User.update({ isPremiumUser: true }, { where: { id: req.userId } });
            }
            res.status(200).json({ message: 'Order status updated' });
        } catch (err) {
            res.status(500).json({ error: 'Error updating order status' });
        }
    }
};

module.exports = OrderController;
const express = require('express');
const OrderController = require('../controllers/orderController');
const userAuthentication = require('../middleware/userAuthentication');

const router = express.Router();

router.post('/create-order', userAuthentication, OrderController.createOrder);
router.post('/update-order-status', userAuthentication, OrderController.updateOrderStatus);

module.exports = router;
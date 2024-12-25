const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');

const Order = sequelize.define('Order', {
    paymentId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'SUCCESSFUL', 'FAILED'),
        defaultValue: 'PENDING'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'userlogin',
            key: 'id'
        }
    }
}, {
    tableName: 'orders',
    timestamps: false
});

// Add the functions
Order.createOrder = async function(orderId, userId) {
    return await Order.create({ orderId, userId });
};

Order.updateStatus = async function(orderId, status, paymentId) {
    return await Order.update(
        { status, paymentId },
        { where: { orderId } }
    );
};

Order.findByOrderId = async function(orderId) {
    return await Order.findOne({ where: { orderId } });
};

module.exports = Order;
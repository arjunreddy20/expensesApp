const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isPremiumUser: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    total_expenses: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    }
}, {
    tableName: 'userlogin',
    timestamps: false
});

// Add the findByEmail method
User.findByEmail = async function(email) {
    return await User.findOne({ where: { email } });
};

// Add the findById method
User.findById = async function(id) {
    return await User.findOne({ where: { id } });
};

module.exports = User;
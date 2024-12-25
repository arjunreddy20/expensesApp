const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');

const Note = sequelize.define('Note', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'userlogin',
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'notes',
    timestamps: false
});

module.exports = Note;
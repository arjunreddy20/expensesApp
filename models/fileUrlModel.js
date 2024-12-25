const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');

const FileUrl = sequelize.define('FileUrl', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'userlogin',
            key: 'id'
        }
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    download_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    timestamps: false,
    tableName: 'file_urls'
});

module.exports = FileUrl;
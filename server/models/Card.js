const { DataTypes, ENUM } = require('sequelize');
const { sequelize } = require('../config/db');

const Card = sequelize.define('Card', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    column_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Columns', key: 'id'}},
    title: { type: DataTypes.STRING(50), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    priority: { type: ENUM('low', 'medium', 'high'), allowNull: false },
    deadline: { type: DataTypes.DATE, allowNull: true },
    order_position: { type: DataTypes.FLOAT, allowNull: false },
    create_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    // Contoh di Sequelize
    color: {
        type: DataTypes.STRING,
        allowNull: true
    }

});


module.exports = Card;
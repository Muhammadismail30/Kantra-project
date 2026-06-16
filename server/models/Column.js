const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Column = sequelize.define('Column', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    board_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Boards', key: 'id'}},
    title: { type: DataTypes.STRING(50), allowNull: false },
    order_position: { type: DataTypes.FLOAT, allowNull: false },
    color: { type: DataTypes.STRING, allowNull: true, defaultValue: '#ea580c' } 
});

module.exports = Column;
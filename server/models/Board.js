const { DataTypes, DATE } = require('sequelize');
const { sequelize } = require('../config/db');

const Board = sequelize.define('Board', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    owner_id: { type: DataTypes.INTEGER, references: { model: 'Users', key: 'id' }, allowNull: false },
    created_at: { type:DATE, defaultValue: DataTypes.NOW,}
});

module.exports = Board;
// Sesuaikan baris import ini dengan yang ada di file Card.js milikmu!
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // <--- Ganti path ini jika di Card.js kamu path-nya berbeda

const Comment = sequelize.define('Comment', {
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

module.exports = Comment;
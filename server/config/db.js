const { Sequelize } = require('sequelize');
require('dotenv').config();

// Konfigurasi koneksi
const sequelize = new Sequelize(
  process.env.DB_NAME,     // Nama database
  process.env.DB_USER,     // Username database (default: root)
  process.env.DB_PASSWORD, // Password database
  {
    host: process.env.DB_HOST || 'localhost', // Biasanya localhost
    dialect: 'mysql',          // Kita pakai MySQL
    logging: false,            // Agar terminal tidak penuh dengan log SQL
  }
);

// Tes Koneksi
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database MySQL Terhubung!');
  } catch (error) {
    console.error('❌ Gagal koneksi database:', error);
  }
};

module.exports = { sequelize, connectDB };
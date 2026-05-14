const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Pastikan dotenv dipanggil di paling atas
const { sequelize, connectDB } = require('./config/db');
const { User, Board, Column, Card } = require('./models');

const app = express();

// Import Routes
const boardRoutes = require('./routes/boardRoutes');
const authRoutes = require('./routes/authRoutes');
const columnRoutes = require('./routes/columnRoutes');
const cardRoutes = require('./routes/cardRoutes');

// Middleware
app.use(cors()); 
app.use(express.json());

// Jalankan Koneksi DB
connectDB();

// Daftar Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/cards', cardRoutes);

// Sinkronisasi Tabel
sequelize.sync({ alter: true })
  .then(() => console.log("✅ Tabel berhasil disinkronkan"))
  .catch(err => console.log("❌ Gagal sinkronisasi:", err));

// JANGAN jalankan app.listen secara otomatis jika sedang mode testing
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
}

// WAJIB DITAMBAHKAN: Ekspor app agar bisa dibaca oleh Supertest dan Jest
module.exports = app;
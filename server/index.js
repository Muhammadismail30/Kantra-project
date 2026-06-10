const express = require('express');
const cors = require('cors');
// IMPLEMENTASI KEAMANAN: Import Helmet dan Rate-Limit
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit'); 

require('dotenv').config(); // Pastikan dotenv dipanggil di paling atas
const { sequelize, connectDB } = require('./config/db');
const { User, Board, Column, Card, Notification } = require('./models');

const app = express();

// Import Routes
const boardRoutes = require('./routes/boardRoutes');
const authRoutes = require('./routes/authRoutes');
const columnRoutes = require('./routes/columnRoutes');
const cardRoutes = require('./routes/cardRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use(cors()); 
app.use(express.json());

// IMPLEMENTASI KEAMANAN: 1. Helmet untuk Security Headers
app.use(helmet());

// IMPLEMENTASI KEAMANAN: 2. Rate Limiting untuk mencegah DDoS & Brute Force
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Waktu: 15 menit
  max: 100, // Batas maksimal: 100 request per IP dalam 15 menit
  message: 'Terlalu banyak request dari IP Anda, silakan coba lagi nanti.',
  standardHeaders: true, 
  legacyHeaders: false, 
});
// Terapkan limiter ke semua rute yang berawalan /api
app.use('/api', apiLimiter);


// Jalankan Koneksi DB
connectDB();

// Daftar Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

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
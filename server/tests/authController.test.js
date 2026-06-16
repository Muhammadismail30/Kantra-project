// File: server/tests/authController.test.js

const { login } = require('../controllers/authController');
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. MOCKING DEPENDENCIES
// Kita "memalsukan" model User, bcrypt, dan jwt agar test tidak perlu menembak MySQL beneran
jest.mock('../models', () => ({
  User: { findOne: jest.fn() }
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Pengujian Modul Auth Controller - Fungsi Login', () => {
  
  let req, res;

  // Sebelum setiap test dijalankan, siapkan objek Request (req) dan Response (res) palsu
  beforeEach(() => {
    req = {
      body: {
        email: 'aji@example.com',
        password: 'password123'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // Membersihkan semua mock setelah setiap test agar tidak bocor ke test lainnya
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- SKENARIO 1: NEGATIVE TEST (Email tidak ditemukan) ---
  it('Harus mengembalikan status 400 jika email tidak terdaftar', async () => {
    // Skenario: Database mengembalikan null (user tidak ada)
    User.findOne.mockResolvedValue(null);

    await login(req, res);

    // Ekspektasi: Pastikan status 400 dipanggil, dan pesan error sesuai
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Kredensial tidak valid' });
  });

  // --- SKENARIO 2: POSITIVE TEST (Login Berhasil) ---
  it('Harus mengembalikan token dan data user jika login berhasil', async () => {
    // Skenario: Database mengembalikan data user
    const mockUser = { id: 1, name: 'Aji', email: 'aji@example.com', password: 'hashedpassword' };
    User.findOne.mockResolvedValue(mockUser);
    
    // Skenario: Password cocok
    bcrypt.compare.mockResolvedValue(true);
    
    // Skenario: JWT berhasil membuat token
    jwt.sign.mockReturnValue('fake-jwt-token');

    await login(req, res);

    // Ekspektasi: Pastikan kembalian JSON berupa token dan data user yang tepat
    expect(res.json).toHaveBeenCalledWith({
      token: 'fake-jwt-token',
      user: { id: 1, name: 'Aji', email: 'aji@example.com' }
    });
  });

});
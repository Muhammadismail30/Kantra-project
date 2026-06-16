const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../index');

describe('Pengujian Modul Card Controller - Manajemen Tugas', () => {
  
  const secretKey = process.env.JWT_SECRET || 'rahasia'; 
  const validToken = 'Bearer ' + jwt.sign({ id: 1, email: 'aditya_test@kantra.com' }, secretKey, { expiresIn: '1h' });

  it('1. Harus menolak akses (401/403) jika membuat tugas tanpa token otentikasi', async () => {
    const res = await request(app)
      .post('/api/cards')
      .send({
        title: 'Tugas Rahasia',
        description: 'Tugas ini tidak boleh masuk karena tidak ada token',
        columnId: 1
      });

    expect([401, 403]).toContain(res.statusCode);
  });

  it('2. Harus mengembalikan error (400/500) jika data pembuatan tugas tidak lengkap', async () => {
    const res = await request(app)
      .post('/api/cards')
      .set('Authorization', validToken) 
      .send({
        title: '',
        description: 'Deskripsi tanpa judul'
      });

    expect([400, 500]).toContain(res.statusCode);
  });
});

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models', () => ({
  Card: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Comment: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
  Column: {
    findByPk: jest.fn(),
  },
  Board: {},
  Notification: {
    bulkCreate: jest.fn(),
  },
}));

const { Card, Comment, Column, User, Notification } = require('../models');
const cardRoutes = require('../routes/cardRoutes');

const app = express();
app.use(express.json());
app.use('/api/cards', cardRoutes);

const JWT_SECRET = 'test-secret';
const authHeader = () => `Bearer ${jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '1h' })}`;

describe('Regression test suite API Card CRUD', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    User.findByPk.mockResolvedValue({ id: 1, name: 'Aji' });
    Column.findByPk.mockResolvedValue({
      id: 1,
      Board: {
        id: 1,
        title: 'My Kanban Board',
        owner_id: 1,
        Users: [{ id: 2 }],
      },
    });
    Notification.bulkCreate.mockResolvedValue([]);
  });

  describe('GET /api/cards/column/:columnId', () => {
    it('mengambil semua card berdasarkan column_id', async () => {
      const cards = [
        { id: 1, column_id: 1, title: 'Setup project', order_position: 1 },
        { id: 2, column_id: 1, title: 'Write tests', order_position: 2 },
      ];
      Card.findAll.mockResolvedValue(cards);

      const res = await request(app)
        .get('/api/cards/column/1')
        .set('Authorization', authHeader());

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(cards);
      expect(Card.findAll).toHaveBeenCalledWith({
        where: { column_id: '1' },
        order: [['order_position', 'ASC']],
      });
    });

    it('mengembalikan array kosong ketika column belum memiliki card', async () => {
      Card.findAll.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/cards/column/999')
        .set('Authorization', authHeader());

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('mengembalikan 500 ketika database gagal mengambil card', async () => {
      Card.findAll.mockRejectedValue(new Error('database down'));

      const res = await request(app)
        .get('/api/cards/column/1')
        .set('Authorization', authHeader());

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Server Error');
    });
  });

  describe('POST /api/cards', () => {
    it('menambahkan card baru dengan input valid', async () => {
      const newCard = {
        id: 10,
        column_id: 1,
        title: 'Regression test',
        description: 'Protect API behavior',
        priority: 'medium',
        deadline: null,
        order_position: 1,
      };
      Card.create.mockResolvedValue(newCard);

      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', authHeader())
        .send({
          column_id: 1,
          title: 'Regression test',
          description: 'Protect API behavior',
          priority: 'medium',
          order_position: 1,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(newCard);
      expect(Card.create).toHaveBeenCalledWith({
        column_id: 1,
        title: 'Regression test',
        description: 'Protect API behavior',
        priority: 'medium',
        deadline: null,
        order_position: 1,
      });
    });

    it('menolak input tidak valid ketika title kosong', async () => {
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', authHeader())
        .send({ column_id: 1, title: '' });

      expect(res.statusCode).toBe(400);
      expect(Card.create).not.toHaveBeenCalled();
    });

    it('menolak request tanpa token autentikasi', async () => {
      const res = await request(app)
        .post('/api/cards')
        .send({ column_id: 1, title: 'No token' });

      expect(res.statusCode).toBe(401);
      expect(Card.create).not.toHaveBeenCalled();
    });

    it('menolak request dengan token tidak valid', async () => {
      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', 'Bearer token-salah')
        .send({ column_id: 1, title: 'Invalid token' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'Token tidak valid' });
      expect(Card.create).not.toHaveBeenCalled();
    });

    it('tetap membuat card walaupun pengiriman notifikasi gagal', async () => {
      const newCard = { id: 11, column_id: 1, title: 'Notification fallback', priority: 'low' };
      Card.create.mockResolvedValue(newCard);
      Notification.bulkCreate.mockRejectedValue(new Error('notification error'));

      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', authHeader())
        .send({
          column_id: 1,
          title: 'Notification fallback',
          priority: 'low',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(newCard);
    });
  });

  describe('PUT /api/cards/:id', () => {
    it('mengupdate card yang ditemukan', async () => {
      const existingCard = {
        id: 5,
        title: 'Old title',
        update: jest.fn().mockResolvedValue(),
      };
      existingCard.update.mockImplementation(async (payload) => Object.assign(existingCard, payload));
      Card.findByPk.mockResolvedValue(existingCard);

      const res = await request(app)
        .put('/api/cards/5')
        .set('Authorization', authHeader())
        .send({
          title: 'Updated title',
          description: 'Updated description',
          priority: 'high',
          column_id: 2,
          order_position: 3,
          is_completed: true,
        });

      expect(res.statusCode).toBe(200);
      expect(existingCard.update).toHaveBeenCalledWith({
        title: 'Updated title',
        description: 'Updated description',
        deadline: undefined,
        priority: 'high',
        color: undefined,
        column_id: 2,
        order_position: 3,
        is_completed: true,
      });
      expect(res.body.title).toBe('Updated title');
    });

    it('mengembalikan 404 ketika card yang diupdate tidak ditemukan', async () => {
      Card.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/cards/404')
        .set('Authorization', authHeader())
        .send({ title: 'Missing card' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Card tidak ditemukan' });
    });

    it('menolak update dengan priority tidak valid', async () => {
      const res = await request(app)
        .put('/api/cards/5')
        .set('Authorization', authHeader())
        .send({ priority: 'urgent' });

      expect(res.statusCode).toBe(400);
      expect(Card.findByPk).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/cards/:id', () => {
    it('menghapus card yang ditemukan', async () => {
      const card = {
        id: 9,
        destroy: jest.fn().mockResolvedValue(),
      };
      Card.findByPk.mockResolvedValue(card);

      const res = await request(app)
        .delete('/api/cards/9')
        .set('Authorization', authHeader());

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Card deleted' });
      expect(card.destroy).toHaveBeenCalledTimes(1);
    });

    it('mengembalikan 404 ketika card yang dihapus tidak ditemukan', async () => {
      Card.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/cards/999')
        .set('Authorization', authHeader());

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe('Card not found');
    });
  });

  describe('POST dan GET /api/cards/:id/comments', () => {
    it('menambahkan komentar pada card', async () => {
      const comment = { id: 1, text: 'Komentar regression', card_id: '7', user_id: 1 };
      Comment.create.mockResolvedValue(comment);

      const res = await request(app)
        .post('/api/cards/7/comments')
        .set('Authorization', authHeader())
        .send({ text: 'Komentar regression' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(comment);
      expect(Comment.create).toHaveBeenCalledWith({
        text: 'Komentar regression',
        card_id: '7',
        user_id: 1,
      });
    });

    it('mengambil semua komentar pada card', async () => {
      const comments = [
        { id: 1, text: 'Pertama', Author: { name: 'Aji', email: 'aji@example.com' } },
        { id: 2, text: 'Kedua', Author: { name: 'Bima', email: 'bima@example.com' } },
      ];
      Comment.findAll.mockResolvedValue(comments);

      const res = await request(app)
        .get('/api/cards/7/comments')
        .set('Authorization', authHeader());

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(comments);
      expect(Comment.findAll).toHaveBeenCalledWith({
        where: { card_id: '7' },
        include: [{ model: User, as: 'Author', attributes: ['name', 'email'] }],
        order: [['createdAt', 'ASC']],
      });
    });
  });
});

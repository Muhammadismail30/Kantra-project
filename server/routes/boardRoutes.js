const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const authMiddleware = require('../middleware/auth'); // Middleware JWT kamu

// Semua route di bawah ini dilindungi oleh authMiddleware
// Artinya user harus login untuk bisa mengaksesnya

// 1. Membuat Board Baru (POST /api/boards)
router.post('/', authMiddleware, boardController.createBoard);

// 2. Mengambil Semua Board Milik User (GET /api/boards)
router.get('/', authMiddleware, boardController.getAllBoards);

// 3. Mengambil Detail Satu Board Beserta Kolom & Kartunya (GET /api/boards/:id)
router.get('/:id', authMiddleware, boardController.getBoardDetail);

// 4. Menghapus Board (DELETE /api/boards/:id)
router.delete('/:id', authMiddleware, boardController.deleteBoard);

module.exports = router;
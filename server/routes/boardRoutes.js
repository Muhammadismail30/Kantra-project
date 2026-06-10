const express = require('express');
const router = express.Router();
// IMPLEMENTASI KEAMANAN: Import Express-Validator
const { body, validationResult } = require('express-validator'); 

const boardController = require('../controllers/boardController');
const authMiddleware = require('../middleware/auth'); // Middleware JWT kamu

// Semua route di bawah ini dilindungi oleh authMiddleware
// Artinya user harus login untuk bisa mengaksesnya

// IMPLEMENTASI KEAMANAN: 3. Validasi dan Sanitasi Input di POST /api/boards
router.post(
  '/', 
  authMiddleware, 
  [
    // Memastikan input 'title' ada, memotong spasi berlebih, dan menetralkan karakter berbahaya (XSS)
    body('title')
      .notEmpty().withMessage('Judul Board tidak boleh kosong!')
      .isString().withMessage('Judul harus berupa teks.')
      .trim()
      .escape(), 
  ],
  (req, res, next) => {
    // Mengecek apakah input lolos validasi di atas
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // Jika aman, teruskan ke controller
  },
  boardController.createBoard
);

// 2. Mengambil Semua Board Milik User & Shared Board (GET /api/boards)
router.get('/', authMiddleware, boardController.getAllBoards);

// 3. Mengambil Detail Satu Board (Untuk Owner & Member) Beserta Kolom & Kartunya (GET /api/boards/:id)
router.get('/:id', authMiddleware, boardController.getBoardDetail);

// 4. Menghapus Board (DELETE /api/boards/:id)
router.delete('/:id', authMiddleware, boardController.deleteBoard);

router.post('/:id/members', authMiddleware, boardController.addMemberToBoard);
router.get('/:id/members', authMiddleware, boardController.getBoardMembers);

module.exports = router;
const express = require('express');
const router = express.Router();
const columnController = require('../controllers/columnController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, columnController.createColumn);
router.get('/board/:boardId', authMiddleware, columnController.getColumnsByBoard);
router.delete('/:id', authMiddleware, columnController.deleteColumn);
router.put('/:id', authMiddleware, columnController.updateColumn);

module.exports = router;
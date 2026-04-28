const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const auth = require('../middleware/auth');

router.post('/', auth, cardController.createCard);
router.get('/column/:columnId', auth, cardController.getCardsByColumn);
router.put('/:id', auth, cardController.updateCard);

module.exports = router;
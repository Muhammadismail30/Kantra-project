const { Card } = require('../models');

// 1. Tambah Kartu Baru
exports.createCard = async (req, res) => {
    try {
        const { column_id, title, description, priority, deadline, order_position } = req.body;
        
        const newCard = await Card.create({
            column_id,
            title,
            description: description || '', 
            priority: priority || 'Medium', // Sesuaikan jika kamu pakai nilai lain seperti 'Low'/'High'
            deadline: deadline || null,
            order_position: order_position || 0
        });

        res.status(201).json(newCard);
    } catch (err) {
        console.error("Error dari MySQL (Create Card):", err);
        res.status(500).send('Server Error');
    }
};

// 2. Ambil Semua Kartu berdasarkan Kolom
exports.getCardsByColumn = async (req, res) => {
    try {
        const cards = await Card.findAll({
            where: { column_id: req.params.columnId },
            order: [['order_position', 'ASC']]
        });
        res.json(cards);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// 3. Update Kartu (Penting untuk pindah kolom/drag-and-drop)
exports.updateCard = async (req, res) => {
    try {
        const { title, description, priority, deadline, column_id, order_position } = req.body;
        let card = await Card.findByPk(req.params.id);

        if (!card) return res.status(404).json({ message: 'Kartu tidak ditemukan' });

        await card.update({ title, description, priority, deadline, column_id, order_position });
        res.json(card);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
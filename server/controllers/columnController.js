const { Column } = require('../models');

exports.createColumn = async (req, res) => {
    try {
        const { title, board_id, order_position } = req.body;
        
        const newColumn = await Column.create({
            title,
            board_id,
            order_position // Gunakan FLOAT sesuai SRS kamu
        });

        res.status(201).json(newColumn);
    } catch (err) {
        console.error("Error dari MySQL (Create Column):", err.message);
        res.status(500).send('Server Error');
    }
};

exports.getColumnsByBoard = async (req, res) => {
    try {
        const columns = await Column.findAll({
            where: { board_id: req.params.boardId },
            order: [['order_position', 'ASC']]
        });
        res.json(columns);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
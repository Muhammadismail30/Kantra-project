const { Column } = require('../models');

exports.createColumn = async (req, res) => {
    try {
        const { title, board_id, order_position, color } = req.body;
        
        const newColumn = await Column.create({
            title,
            board_id,
            order_position, // Gunakan FLOAT sesuai SRS kamu
            color: color || '#ea580c'
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

exports.deleteColumn = async (req, res) => {
    try {
        const column = await Column.findByPk(req.params.id);
        if (!column) {
            return res.status(404).json({ message: "List tidak ditemukan" });
        }

        // Menghapus list dari database
        await column.destroy();
        res.json({ message: "List berhasil dihapus" });
    } catch (err) {
        console.error("Error hapus list:", err.message);
        res.status(500).send("Server Error");
    }
};

exports.updateColumn = async (req, res) => {
    try {
        const { title, color } = req.body;
        const column = await Column.findByPk(req.params.id);
        
        if (!column) {
            return res.status(404).json({ message: "List tidak ditemukan" });
        }

        // Update data (gunakan yang lama jika data baru tidak dikirim)
        column.title = title || column.title;
        column.color = color || column.color;
        
        await column.save();
        res.json({ message: "List berhasil diupdate", data: column });
    } catch (err) {
        console.error("Error update list:", err.message);
        res.status(500).send("Server Error");
    }
};
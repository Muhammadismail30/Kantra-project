const { Board } = require('../models');

// 1. Membuat Board Baru
exports.createBoard = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        // req.user.id didapat dari middleware auth.js setelah verifikasi token JWT
        const newBoard = await Board.create({
            title,
            description,
            owner_id: req.user.id 
        });

        res.status(201).json({
            message: 'Board berhasil dibuat',
            data: newBoard
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 2. Mengambil Semua Board milik User yang sedang login
exports.getAllBoards = async (req, res) => {
    try {
        const boards = await Board.findAll({
            where: { owner_id: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        res.json(boards);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 3. Mengambil Detail Board (Opsional: untuk melihat isi kolom dan kartu nanti)
exports.getBoardDetail = async (req, res) => {
    try {
        const board = await Board.findOne({
            where: { id: req.params.id, owner_id: req.user.id }
        });

        if (!board) {
            return res.status(404).json({ message: 'Board tidak ditemukan' });
        }

        res.json(board);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 4. Menghapus Board
exports.deleteBoard = async (req, res) => {
    try {
        const board = await Board.findOne({
            where: { id: req.params.id, owner_id: req.user.id }
        });

        if (!board) {
            return res.status(404).json({ message: 'Board tidak ditemukan atau Anda tidak memiliki akses' });
        }

        await board.destroy();
        res.json({ message: 'Board berhasil dihapus' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
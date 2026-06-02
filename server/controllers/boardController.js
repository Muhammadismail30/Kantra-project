const { Board, Column, Card, User, Notification } = require('../models');

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
        const userId = req.user.id;

        // Ambil boards yang dimiliki user secara pribadi
        const ownedBoards = await Board.findAll({
            where: { owner_id: userId }
        });

        // Ambil boards di mana user diundang sebagai anggota
        const user = await User.findByPk(userId, {
            include: [{
                model: Board,
                as: 'SharedBoards',
                through: { attributes: [] }
            }]
        });

        const sharedBoards = user && user.SharedBoards ? user.SharedBoards : [];

        // Gabungkan boards untuk menghindari duplikasi
        const allBoardsMap = new Map();
        ownedBoards.forEach(board => allBoardsMap.set(board.id, board));
        sharedBoards.forEach(board => allBoardsMap.set(board.id, board));

        // Ubah menjadi array dan urutkan dari terbaru
        const allBoards = Array.from(allBoardsMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(allBoards);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 3. Mengambil Detail Board (Untuk owner & member yang diinvite)
exports.getBoardDetail = async (req, res) => {
    try {
        const boardId = req.params.id;
        const userId = req.user.id;

        const board = await Board.findOne({
            where: { id: boardId },
            include: [
                {
                    model: Column,
                    include: [Card] // Ini akan mengambil Board -> Columns -> Cards secara otomatis
                },
                {
                    model: User,
                    as: 'Users',
                    attributes: ['id'],
                    through: { attributes: [] }
                }
            ]
        });

        if (!board) {
            return res.status(404).json({ message: 'Board tidak ditemukan' });
        }

        // Cek otorisasi: Izinkan masuk jika user adalah owner ATAU jika user di-invite sebagai member
        const isOwner = board.owner_id === userId;
        const isMember = board.Users && board.Users.some(u => u.id === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses ke board ini' });
        }

        res.json(board);
    } catch (err) {
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

exports.addMemberToBoard = async (req, res) => {
    try {
        const { email } = req.body;
        const boardId = req.params.id;

        // 1. Cari pengguna berdasarkan email
        const userToAdd = await User.findOne({ where: { email } });
        if (!userToAdd) {
            return res.status(404).json({ message: 'Pengguna dengan email tersebut tidak ditemukan.' });
        }

        // 2. Cari board
        const board = await Board.findByPk(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Board tidak ditemukan.' });
        }

        // 3. Tambahkan relasi ke tabel junction (Asumsi menggunakan metode otomatis Sequelize)
        // Pastikan di models/index.js kamu sudah mengatur: Board.belongsToMany(User, { through: 'BoardMembers' })
        await board.addUser(userToAdd);

        // 4. Buat notifikasi untuk user yang diinvite
        const inviter = await User.findByPk(req.user.id);
        await Notification.create({
            user_id: userToAdd.id,
            message: `Anda telah diundang ke board "${board.title}" oleh ${inviter ? inviter.name : 'seseorang'}.`
        });

        res.status(200).json({ message: 'Anggota berhasil ditambahkan!', user: { id: userToAdd.id, name: userToAdd.name, email: userToAdd.email } });
    } catch (err) {
        console.error("Error dari MySQL (Share Board):", err);
        res.status(500).send('Server Error');
    }
};

// [FR-10] Mengambil daftar anggota dalam satu Board
exports.getBoardMembers = async (req, res) => {
    try {
        const boardId = req.params.id;
        
        const board = await Board.findByPk(boardId, {
            include: [{
                model: User,
                as: 'Users', // Pastikan ini sesuai dengan alias yang kamu buat di models/index.js
                attributes: ['id', 'name', 'email'], // Jangan bawa password
                through: { attributes: [] } // Sembunyikan atribut tabel junction
            }]
        });

        if (!board) {
            return res.status(404).json({ message: 'Board tidak ditemukan.' });
        }

        res.status(200).json(board.Users);
    } catch (err) {
        console.error("Error dari MySQL (Get Members):", err);
        res.status(500).send('Server Error');
    }
};

const { Card, Comment, User, Column, Board, Notification } = require('../models');

// 1. Tambah Kartu Baru
exports.createCard = async (req, res) => {
    try {
        const { column_id, title, description, priority, deadline, order_position } = req.body;
        
        const newCard = await Card.create({
            column_id,
            title,
            description: description || '', 
            priority: priority || 'Medium', 
            deadline: deadline || null,
            order_position: order_position || 0
        });

        // --- Kirim Notifikasi ke semua anggota board ---
        try {
            const column = await Column.findByPk(column_id, {
                include: [{
                    model: Board,
                    include: [{ model: User, as: 'Users' }]
                }]
            });

            if (column && column.Board) {
                const board = column.Board;
                const creator = await User.findByPk(req.user.id);
                const memberIds = board.Users.map(u => u.id);
                // Tambahkan owner_id juga ke daftar penerima notifikasi
                if (!memberIds.includes(board.owner_id)) {
                    memberIds.push(board.owner_id);
                }

                const notifications = memberIds
                    .filter(id => id !== req.user.id) // Jangan kirim ke diri sendiri
                    .map(id => ({
                        user_id: id,
                        message: `Tugas baru "${title}" telah ditambahkan ke board "${board.title}" oleh ${creator ? creator.name : 'seseorang'}.`
                    }));

                if (notifications.length > 0) {
                    await Notification.bulkCreate(notifications);
                }
            }
        } catch (notifErr) {
            console.error("Gagal mengirim notifikasi:", notifErr);
            // Lanjutkan eksekusi meskipun notifikasi gagal
        }
        // -------------------------------------------------

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

// 3. Update Kartu 
exports.updateCard = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      deadline, 
      priority, 
      color, 
      column_id,        
      order_position,
      is_completed    
    } = req.body; 

    const card = await Card.findByPk(req.params.id);
    
    if (!card) {
      return res.status(404).json({ message: 'Card tidak ditemukan' });
    }

    await card.update({ 
      title, 
      description, 
      deadline, 
      priority, 
      color,
      column_id,      
      order_position,
      is_completed    
    });

    res.json(card);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.deleteCard = async (req, res) => {
    try {
        const card = await Card.findByPk(req.params.id);
        if (!card) return res.status(404).send('Card not found');
        await card.destroy();
        res.json({ message: 'Card deleted' });
    } catch (err) { res.status(500).send('Server Error'); }
};

// Menambahkan komentar pada kartu
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const cardId = req.params.id;
        
        const newComment = await Comment.create({
            text,
            card_id: cardId,
            user_id: req.user.id
        });

        res.status(201).json(newComment);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Mengambil semua komentar dalam satu kartu
exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: { card_id: req.params.id },
            include: [{ model: User, as: 'Author', attributes: ['name', 'email'] }],
            order: [['createdAt', 'ASC']]
        });
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
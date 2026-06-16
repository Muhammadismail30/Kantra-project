const { Notification } = require('../models');

// Ambil semua notifikasi untuk user yang sedang login
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']]
        });
        res.json(notifications);
    } catch (err) {
        console.error("Error getNotifications:", err);
        res.status(500).send('Server Error');
    }
};

// Tandai notifikasi sebagai sudah dibaca
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, user_id: req.user.id }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
        }

        await notification.update({ is_read: true });
        res.json(notification);
    } catch (err) {
        console.error("Error markAsRead:", err);
        res.status(500).send('Server Error');
    }
};

// Tandai semua notifikasi sebagai sudah dibaca
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { is_read: true },
            { where: { user_id: req.user.id, is_read: false } }
        );
        res.json({ message: 'Semua notifikasi ditandai sudah dibaca' });
    } catch (err) {
        console.error("Error markAllAsRead:", err);
        res.status(500).send('Server Error');
    }
};

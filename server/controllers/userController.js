const { User } = require('../models');

// Mengambil data profil sendiri
exports.getProfile = async (req, res) => {
    try {
        // Ambil data user berdasarkan ID dari token JWT (req.user.id)
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'createdAt'] // Sengaja tidak mengambil password
        });
        
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
        res.json(user);
    } catch (err) {
        console.error("Error get profile:", err);
        res.status(500).send('Server Error');
    }
};

// Mengupdate data profil
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByPk(req.user.id);
        
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        await user.update({ name, email });
        
        res.json({ 
            message: 'Profil berhasil diperbarui', 
            user: { id: user.id, name: user.name, email: user.email } 
        });
    } catch (err) {
        console.error("Error update profile:", err);
        res.status(500).send('Server Error');
    }
};
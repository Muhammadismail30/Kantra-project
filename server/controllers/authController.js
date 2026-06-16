const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
    // 1. Cek hasil validasi dari middleware authValidator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, password } = req.body;

        // 2. Cek apakah email sudah terdaftar
        let user = await User.findOne({ where: { email } });
        if (user) return res.status(400).json({ message: 'User sudah ada' });

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Simpan ke Database
        user = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({ message: 'User berhasil didaftarkan' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Cari User berdasarkan email
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Kredensial tidak valid' });

        // 2. Cek Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Kredensial tidak valid' });

        // 3. Buat Token JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
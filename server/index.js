const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Mengizinkan semua origin
app.use(express.json()); // Agar backend bisa membaca request body berformat JSON

app.get('/api/test', (req, res) => {
    res.json({ message: "Koneksi Backend Berhasil!" });
});

app.listen(5000, () => console.log('Server jalan di port 5000'));
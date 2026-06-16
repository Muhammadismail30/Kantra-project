# Menggunakan image Node.js versi 18 yang ringan (alpine)
FROM node:22-alpine

# Menentukan folder kerja di dalam container
WORKDIR /app

# Menyalin file package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Menginstal semua dependencies
RUN npm install

# Menyalin seluruh sisa kode backend ke dalam container
COPY . .

# Membuka port 5000 agar bisa diakses
EXPOSE 5000

# Perintah untuk menjalankan server
CMD ["npm", "start"]
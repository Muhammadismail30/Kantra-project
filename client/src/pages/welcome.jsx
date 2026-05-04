import React from 'react';
import logoKantra from '../assets/logo-kantra.png'; // Pastikan path logo sudah benar

const Welcome = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] flex flex-col font-sans overflow-hidden m-0 p-0 absolute top-0 left-0">
      
      {/* CSS Kustom untuk Animasi Transisi */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0; /* Mulai dari transparan agar tidak bocor di awal */
        }

        /* Mengatur urutan munculnya elemen */
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        .delay-3 { animation-delay: 0.6s; }
      `}</style>

      {/* 1. NAVBAR */}
      <nav className="w-full flex justify-between items-center px-8 md:px-16 py-6">
        {/* Logo (Kiri) */}
        <div className="flex items-center">
          <img src={logoKantra} alt="Logo Kantra" className="h-8 md:h-10 w-auto" />
        </div>

        {/* Menu Navigasi (Kanan) */}
        <div className="flex items-center space-x-6">
          <a 
            href="#about" 
            className="text-white hover:text-gray-300 font-medium text-sm no-underline"
          >
            About
          </a>
          
          <div className="flex items-center space-x-3">
            {/* Tombol Daftar (Putih, Teks Ungu) */}
            <a 
              href="/register" 
              className="bg-white text-[#7B61FF] px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition no-underline"
            >
              Daftar
            </a>
            
            <span className="text-gray-400 text-sm font-medium">or</span>
            
            {/* Tombol Login (Ungu, Teks Putih) */}
            <a 
              href="/login" 
              className="bg-[#7B61FF] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-purple-500 transition no-underline"
            >
              Login
            </a>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 mt-10 md:mt-0 mb-20">
        
        {/* Judul Utama - Muncul Pertama */}
        <h1 className="animate-fade-in-up delay-1 text-white text-5xl md:text-6xl font-extrabold max-w-4xl leading-tight mb-6 tracking-tight">
          Kolaborasi Tim Lebih Terstruktur, Transparan, dan Efisien.
        </h1>
        
        {/* Deskripsi - Muncul Kedua */}
        <p className="animate-fade-in-up delay-2 text-gray-300 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
          Platform Kanban premium untuk mahasiswa dan organisasi yang bergerak cepat.
          <br className="hidden md:block" />
          Mulai kolaborasi tim dalam hitungan detik tanpa perlu setup yang rumit.
        </p>

        {/* Tombol Utama dengan Efek Glow - Muncul Ketiga */}
        <a 
          href="/register" 
          className="animate-fade-in-up delay-3 bg-[#7B61FF] text-white px-10 py-4 rounded-full font-bold text-xl transition-transform hover:scale-105 no-underline"
          style={{
            // Shadow ungu menyala persis seperti desain
            boxShadow: '0px 0px 45px 10px rgba(123, 97, 255, 0.45)'
          }}
        >
          Mulai Sekarang
        </a>
      </main>

    </div>
  );
};

export default Welcome;
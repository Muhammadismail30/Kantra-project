import React, { useEffect, useState } from 'react';
import logoKantra from '../assets/logo-kantra.png'; // Pastikan path logo sesuai
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const [boards, setBoards] = useState([]);

    // --- Mengambil daftar board dari backend ---
    const fetchBoards = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL;
        
        const response = await axios.get(`${apiUrl}/boards`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setBoards(response.data);
      } catch (error) {
        console.error("Gagal mengambil boards:", error);
      }
    };

    // --- Jalankan fetch data saat dashboard dibuka ---
    useEffect(() => {
      fetchBoards();
    }, []);

    // --- Fungsi simpan board baru ke database ---
    const handleCreateBoard = async (e) => {
      e.preventDefault(); // Mencegah halaman reload saat submit
      
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL;

        // Tembak API untuk menyimpan data
        await axios.post(`${apiUrl}/boards`,
          { title: newBoardName },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Jika berhasil, tutup modal dan bersihkan input
        setIsModalOpen(false);
        setNewBoardName('');
        
        // Ambil ulang daftar board dari database agar UI langsung update
        fetchBoards(); 
        
      } catch (error) {
        console.error("Gagal membuat board:", error.response?.data || error.message);
        alert("Gagal membuat board, silakan coba lagi.");
      }
    };

    // --- Fungsi Logout ---
    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('token'); // Hapus token saat logout
        navigate('/login'); // Arahkan ke halaman login setelah logout
    };

    // fungsi menu sidebar
    const toggleSidebar = () => {
        const sidebar = document.querySelector('aside');
        sidebar.classList.toggle('hidden');
        
    };

  return (
    <div className="h-screen w-screen bg-[#0a0a0c] flex font-sans overflow-hidden text-white m-0 p-0 absolute top-0 left-0">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-[260px] bg-[#17171f] flex flex-col justify-between relative z-10 shrink-0">
        
        {/* Garis Glow Ungu di Sisi Kanan Sidebar */}
        <div className="absolute right-0 top-0 h-full w-[2px] bg-[#7B61FF]" 
             style={{ boxShadow: '0px 0px 20px 6px rgba(123, 97, 255, 0.6)' }}>
        </div>

        <div className="flex flex-col">
          {/* Header Sidebar (Menu) */}
          <div className="flex items-center gap-4 px-8 py-8 border-b border-white/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span className="font-bold text-[15px]">Menu</span>
          </div>

          {/* Menu Navigasi */}
          <div className="flex flex-col gap-2 mt-6">
            {/* Active Item: Dashboard */}
            <a href="#" className="flex items-center gap-4 px-6 py-3 mx-4 bg-[#0a0a0c] rounded-2xl text-white font-bold no-underline">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Dashboard
            </a>

            {/* Inactive Item: List */}
            <a href="#" className="flex items-center gap-4 px-6 py-3 mx-4 text-white/70 hover:bg-white/5 rounded-2xl font-bold transition-colors no-underline">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              List
            </a>

            {/* Inactive Item: Team */}
            <a href="#" className="flex items-center gap-4 px-6 py-3 mx-4 text-white/70 hover:bg-white/5 rounded-2xl font-bold transition-colors no-underline">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Team
            </a>
          </div>
        </div>

        {/* Footer Sidebar (Logout) */}
        <div className="mb-8">
          <a href="#" onClick={handleLogout} className="flex items-center gap-4 px-8 py-3 text-white font-bold hover:text-[#7B61FF] transition-colors no-underline">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </a>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        
        {/* Navbar Atas */}
        <header className="flex items-center justify-between px-10 py-6">
          {/* Logo */}
          <img src={logoKantra} alt="Kantra Logo" className="h-8 w-auto" />

          {/* Search Bar */}
          <div className="flex items-center bg-[#17171f] px-4 py-2.5 rounded-full w-[400px] border border-white/5">
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent outline-none flex-1 text-[13px] text-white placeholder-white/40"
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          {/* User & Notifikasi */}
          <div className="flex items-center gap-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:text-[#7B61FF] transition-colors">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-[#7B61FF] transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#17171f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </header>

        {/* Konten Utama */}
        <div className="px-10 py-6">
          
          {/* Section: Recently Viewed (Bisa dibuat dinamis nanti) */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-white/70 font-bold text-sm mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Recently viewed
            </div>
            
            {/* Card Statis untuk Recently Viewed */}
            <div className="bg-[#17171f] rounded-2xl w-[240px] h-[130px] flex flex-col justify-between p-4 border border-white/5 cursor-pointer hover:bg-[#1f1f2a] transition-colors shadow-lg opacity-50">
               <h3 className="font-bold text-[14px]">History kosong</h3>
               <div className="w-full h-[1px] bg-white/10 my-1"></div>
               <div className="flex items-center pt-1">
                  <span className="text-xs text-gray-500">Belum ada aktivitas</span>
               </div>
            </div>
          </div>

          {/* Section: Workspace (Dinamis dari Database) */}
          <div>
            <div className="flex items-center gap-2 text-white/70 font-bold text-sm mb-4 uppercase tracking-wider">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Workspace
            </div>
            
            <div className="flex flex-wrap gap-6">
              
              {/* LOOPING DATA BOARD DARI DATABASE */}
              {boards.map((board) => (
                <div 
                  key={board.id}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className="bg-[#17171f] rounded-2xl w-[240px] h-[130px] flex flex-col justify-between p-4 border border-white/5 cursor-pointer hover:bg-[#1f1f2a] transition-all hover:scale-[1.02] shadow-lg group relative"
                >
                  <h3 className="font-bold text-[14px] truncate group-hover:text-[#7B61FF] transition-colors">{board.title}</h3>
                  <div className="w-full h-[1px] bg-white/10 my-1"></div>
                  <div className="flex items-center pt-1">
                    {/* Avatar Profil Statis (Simulasi Tim) */}
                    <div className="w-7 h-7 rounded-full bg-[#7B61FF] flex items-center justify-center z-30 border-2 border-[#17171f]">
                      <span className="text-[10px] font-bold text-white">U</span>
                    </div>
                  </div>
                </div>
              ))} 
            
              {/* Card Create New Board (Pemicu Modal) */}
              <div 
                onClick={() => setIsModalOpen(true)} 
                className="bg-[#b3b3b3] rounded-2xl w-[240px] h-[130px] flex flex-col items-center justify-center cursor-pointer hover:bg-[#c9c9c9] transition-colors shadow-lg text-[#17171f]"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span className="font-bold text-[14px]">Create New Board</span>
              </div>

            </div>
          </div>
          
        </div>

        {/* ================= MODAL CREATE BOARD (Di luar struktur flex utama) ================= */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div 
              className="bg-[#1A1A24] p-8 rounded-3xl w-[400px] flex flex-col relative"
              style={{ boxShadow: '0px 0px 25px 10px rgba(123, 97, 255, 0.2)' }}
            >
              {/* Tombol Close (X) */}
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <h2 className="text-white text-xl font-bold mb-6 text-center">Create New Workspace</h2>
              
              <form onSubmit={handleCreateBoard} className="flex flex-col gap-4">
                <input 
                  type="text" 
                  placeholder="Board Name (e.g., Kantra Project)"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#7B61FF] transition-colors"
                />

                <div className="flex gap-3 mt-2">
                  {/* Tombol Cancel */}
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-white/5 text-white font-bold rounded-xl py-3 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  {/* Tombol Submit */}
                  <button 
                    type="submit"
                    className="flex-[2] bg-[#7B61FF] text-white font-bold rounded-xl py-3 hover:bg-purple-500 transition-colors"
                  >
                    Create Board
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
      
    </div>
  );
};

export default Dashboard;
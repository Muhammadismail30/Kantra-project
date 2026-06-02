import React, { useEffect, useState } from 'react';
import logoKantra from '../assets/logo-kantra.png'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 1. IMPORT SIDEBAR & CONTEXT BARU
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';

const Dashboard = () => {
    const navigate = useNavigate();
    
    // 2. PANGGIL FUNGSI TOGGLE DARI CONTEXT
    const { isSidebarOpen, toggleSidebar } = useSidebar();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const [boards, setBoards] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

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

    useEffect(() => {
        fetchBoards();
    }, []);

    const handleCreateBoard = async (e) => {
        e.preventDefault(); 
        
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL;

            await axios.post(`${apiUrl}/boards`,
                { title: newBoardName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setIsModalOpen(false);
            setNewBoardName('');
            fetchBoards(); 
            
        } catch (error) {
            console.error("Gagal membuat board:", error.response?.data || error.message);
            alert("Gagal membuat board, silakan coba lagi.");
        }
    };

    const filteredBoards = boards.filter(board => 
        board.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen w-screen bg-[#0a0a0c] flex font-sans overflow-hidden text-white m-0 p-0 absolute top-0 left-0">
            
            {/* ================= PANGGIL SIDEBAR BARU DI SINI ================= */}
            <Sidebar />

            {/* ================= MAIN CONTENT ================= */}
            <main className="flex-1 flex flex-col overflow-y-auto relative">
                
                {/* Navbar Atas */}
                <header className="flex items-center justify-between px-10 py-6">
          
                  {/* 1. BAGIAN KIRI*/}
                  <div className="flex items-center w-[300px]">
                    <button 
                      onClick={toggleSidebar} 
                      className={`flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 overflow-hidden ${
                        isSidebarOpen ? 'w-0 h-0 opacity-0 mr-0 p-0' : 'w-10 h-10 opacity-100 mr-4 p-2'
                      }`}
                    >
                      <svg className="shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                      </svg>
                    </button>
                    <img src={logoKantra} alt="Kantra Logo" className="h-8 w-auto shrink-0" />
                  </div>
        
                    {/* BAGIAN TENGAH */}
                    <div className="relative">
                        <div className="flex items-center bg-[#17171f] px-4 py-2.5 rounded-full w-[400px] border border-white/5">
                            <input 
                                type="text" 
                                placeholder="Search boards..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                className="bg-transparent outline-none flex-1 text-[13px] text-white placeholder-white/40"
                            />
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>

                        {/* Search Suggestions Dropdown */}
                        {isSearchFocused && searchQuery && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-[#1A1A24] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                                {filteredBoards.length > 0 ? (
                                    filteredBoards.map(board => (
                                        <div 
                                            key={board.id}
                                            onClick={() => navigate(`/board/${board.id}`)}
                                            className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-6 h-6 rounded-md bg-[#7B61FF]/20 text-[#7B61FF] flex items-center justify-center">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                            </div>
                                            <span className="text-sm font-medium text-white/90">{board.title}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-4 text-center text-white/50 text-sm">
                                        No boards found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* BAGIAN KANAN */}
                    <div className="flex items-center gap-6">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:text-[#7B61FF] transition-colors">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>

                        {/* IKON PROFIL - Tambahkan onClick di baris bawah ini */}
                        <div 
                          onClick={() => navigate('/Profile')} 
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-[#7B61FF] transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#17171f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                    </div>
                </header>

                {/* Konten Utama */}
                <div className="px-10 py-6">
                    
                    {/* Section: Recently Viewed */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 text-white/70 font-bold text-sm mb-4">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Recently viewed
                        </div>
                        
                        <div className="bg-[#17171f] rounded-2xl w-[240px] h-[130px] flex flex-col justify-between p-4 border border-white/5 cursor-pointer hover:bg-[#1f1f2a] transition-colors shadow-lg opacity-50">
                            <h3 className="font-bold text-[14px]">History kosong</h3>
                            <div className="w-full h-[1px] bg-white/10 my-1"></div>
                            <div className="flex items-center pt-1">
                                <span className="text-xs text-gray-500">Belum ada aktivitas</span>
                            </div>
                        </div>
                    </div>

                    {/* Section: Workspace */}
                    <div>
                        <div className="flex items-center gap-2 text-white/70 font-bold text-sm mb-4 uppercase tracking-wider">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            Workspace
                        </div>
                        
                        <div className="flex flex-wrap gap-6">
                            
                            {/* LOOPING DATA BOARD DARI DATABASE */}
                            {filteredBoards.map((board) => (
                                <div 
                                    key={board.id}
                                    onClick={() => navigate(`/board/${board.id}`)}
                                    className="bg-[#17171f] rounded-2xl w-[240px] h-[130px] flex flex-col justify-between p-4 border border-white/5 cursor-pointer hover:bg-[#1f1f2a] transition-all hover:scale-[1.02] shadow-lg group relative"
                                >
                                    <h3 className="font-bold text-[14px] truncate group-hover:text-[#7B61FF] transition-colors">{board.title}</h3>
                                    <div className="w-full h-[1px] bg-white/10 my-1"></div>
                                    <div className="flex items-center pt-1">
                                        <div className="w-7 h-7 rounded-full bg-[#7B61FF] flex items-center justify-center z-30 border-2 border-[#17171f]">
                                            <span className="text-[10px] font-bold text-white">U</span>
                                        </div>
                                    </div>
                                </div>
                            ))} 
                        
                            {/* Card Create New Board */}
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

                {/* ================= MODAL CREATE BOARD ================= */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div 
                            className="bg-[#1A1A24] p-8 rounded-3xl w-[400px] flex flex-col relative"
                            style={{ boxShadow: '0px 0px 25px 10px rgba(123, 97, 255, 0.2)' }}
                        >
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
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-white/5 text-white font-bold rounded-xl py-3 hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
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
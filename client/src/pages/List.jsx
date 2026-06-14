import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar'; 
import { useSidebar } from '../context/SidebarContext'; 
import logoKantra from '../assets/logo-kantra2.png';

const List = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useSidebar(); 

  const [groupedData, setGroupedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');


  // --- STATE DAN FUNGSI NOTIFIKASI BARU ---
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    }
  };

  const markNotifAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.put(`${apiUrl}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error("Gagal update notifikasi:", error);
    }
  };

  // Fungsi mengambil semua data Board, Kolom, dan Kartu dari Backend
  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await axios.get(`${apiUrl}/boards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const boards = response.data;

      // Memproses data untuk mengelompokkan kartu berdasarkan Board
      const processedData = boards.map(board => {
        let allCards = [];
        if (board.Columns) {
          board.Columns.forEach(column => {
            if (column.Cards) {
              const cardsWithColInfo = column.Cards.map(c => ({ ...c, columnName: column.title }));
              allCards = [...allCards, ...cardsWithColInfo];
            }
          });
        }
        return {
          boardId: board.id,
          boardTitle: board.title,
          cards: allCards
        };
      }).filter(board => board.cards.length > 0); // Hanya menampilkan board yang punya kartu

      setGroupedData(processedData);
    } catch (error) {
      console.error("Gagal mengambil data list:", error);
      setErrorMsg("Gagal memuat data halaman List.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchNotifications();
  }, []);

  // Fungsi untuk mencentang status selesai kartu (Tanpa Drag and Drop)
  const handleToggleComplete = async (card) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      await axios.put(`${apiUrl}/cards/${card.id}`, {
        ...card,
        is_completed: !card.is_completed
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      fetchAllData(); // Memperbarui data setelah dicentang
    } catch (error) {
      console.error("Gagal mengupdate status kartu:", error);
    }
  };

  const getDeadlineText = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadDate = new Date(deadline);
    const diffTime = deadDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'In 1 Day';
    if (diffDays > 1) return `In ${diffDays} Days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} Days Overdue`;
    return null;
  };

  if (isLoading) return <div className="h-screen w-screen bg-[#0a0a0c] flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF]"></div></div>;
  if (errorMsg) return <div className="h-screen w-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white gap-4"><h2 className="text-xl font-bold text-red-500">{errorMsg}</h2><button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-[#7B61FF] rounded-lg">Kembali ke Dashboard</button></div>;

  return (
    <div className="h-screen w-screen bg-[#0a0a0c] flex font-sans overflow-hidden text-white m-0 p-0 absolute top-0 left-0">
      <Sidebar />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* HEADER NAVBAR */}
        <header className="h-[72px] flex items-center justify-between px-8 bg-[#0a0a0c] shrink-0">
          
          {/* KIRI: Toggle Sidebar & Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar} 
              className={`flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 overflow-hidden ${
                isSidebarOpen ? 'w-0 h-0 opacity-0 p-0' : 'w-10 h-10 opacity-100 p-2'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <img src={logoKantra} alt="Kantra Logo" className="h-7 w-auto" />
          </div>

          {/* TENGAH: Search Bar (Ikon di Kanan, Tanpa Border) */}
          <div className="flex-1 max-w-[600px] px-8">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A1A24] rounded-full px-5 py-2.5 text-white text-[14px] outline-none focus:bg-[#252530] transition-colors pr-11"
              />
              <svg className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          {/* KANAN: Notifikasi & Profil */}
          <div className="flex items-center gap-6">
            
            {/* IKON NOTIFIKASI BARU */}
            <div className="relative">
                <svg 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                    className="cursor-pointer text-gray-400 hover:text-white transition-colors"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {notifications.filter(n => !n.is_read).length > 0 && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0a0a0c]"></div>
                )}

                {/* Dropdown Notifikasi */}
                {isNotifOpen && (
                    <div className="absolute right-0 mt-3 w-[320px] bg-[#1A1A24] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                        <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-[#121217]">
                            <h3 className="font-bold text-[14px] text-white">Notifications</h3>
                            <button 
                                onClick={async () => {
                                    try {
                                        const token = localStorage.getItem('token');
                                        const apiUrl = import.meta.env.VITE_API_URL;
                                        await axios.put(`${apiUrl}/notifications/read-all`, {}, {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        fetchNotifications();
                                    } catch (e) { console.error(e); }
                                }}
                                className="text-xs text-[#7B61FF] hover:text-purple-400 font-medium"
                            >
                                Mark all as read
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => {
                                            if (!notif.is_read) markNotifAsRead(notif.id);
                                        }}
                                        className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors flex items-start gap-3 ${notif.is_read ? 'opacity-60' : 'bg-white/5'}`}
                                    >
                                        <div className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: notif.is_read ? 'transparent' : '#7B61FF' }}></div>
                                        <div>
                                            <p className="text-[13px] text-white/90 leading-snug">{notif.message}</p>
                                            <span className="text-[11px] text-gray-500 mt-1 block">
                                                {new Date(notif.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-6 text-center text-white/50 text-sm">
                                    Tidak ada notifikasi
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div 
              onClick={() => navigate('/profile')} 
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#7B61FF] transition-colors shrink-0"
            >

              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </header>

        {/* AREA UTAMA KONTEN LIST */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <h1 className="text-2xl font-bold mb-6 tracking-tight">List My Board</h1>

          {groupedData.length === 0 ? (
            <div className="text-gray-500 text-center py-10">Belum ada tugas di papan proyek mana pun.</div>
          ) : (
            groupedData.map((group) => (
              <div key={group.boardId} className="mb-8">
                <div className="bg-[#1A1A24] rounded-2xl p-6 border border-white/5">

                <h2 
                  onClick={() => navigate(`/board/${group.boardId}`)}
                  className="text-[16px] font-bold text-white mb-4 cursor-pointer hover:text-[#7B61FF] hover:underline transition-colors w-fit"
                  title={`Buka papan ${group.boardTitle}`}
                >
                  {group.boardTitle}
                </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    
                    {group.cards.map(card => (
                      <div 
                        key={card.id} 
                        className={`bg-[#121217] rounded-xl flex overflow-hidden border transition-all ${card.is_completed ? 'border-green-500/50 opacity-60' : 'border-white/5 hover:border-white/20'} h-[100px] relative`}
                      >
                        <div className="w-3 shrink-0" style={{ backgroundColor: card.color || '#ea580c' }}></div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div className="flex items-start gap-3">
                            <div 
                              onClick={() => handleToggleComplete(card)}
                              className={`mt-1 w-4 h-4 shrink-0 rounded-[4px] border-[1.5px] flex items-center justify-center cursor-pointer transition-all ${card.is_completed ? 'bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'border-gray-500 hover:border-[#7B61FF]'}`}
                            >
                              {card.is_completed && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                            <h3 className={`font-bold text-[14px] leading-snug line-clamp-2 ${card.is_completed ? 'line-through text-gray-500' : 'text-white'}`}>
                              {card.title}
                            </h3>
                          </div>

                          <div className="flex items-center justify-between mt-2 pl-7">
                            <div className="text-[11px] font-bold text-gray-400">
                              {getDeadlineText(card.deadline) || 'No Deadline'}
                            </div>
                            <div className="text-gray-500">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; } .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }`}</style>
    </div>
  );
};

export default List;
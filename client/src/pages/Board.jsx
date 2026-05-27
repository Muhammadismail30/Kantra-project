import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import logoKantra from '../assets/logo-kantra.png';
import ReactDOM from 'react-dom';
import Sidebar from '../components/Sidebar'; 
import { useSidebar } from '../context/SidebarContext'; 

const Board = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useSidebar(); 

  const [boardDetail, setBoardDetail] = useState(null);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const [activeMenuId, setActiveMenuId] = useState(null); 
  const [editingColId, setEditingColId] = useState(null); 
  const [editColTitle, setEditColTitle] = useState('');   
  const [editColColor, setEditColColor] = useState('');   
  const [cardMenuStatus, setCardMenuStatus] = useState({ id: null, top: 0, left: 0 });
  const [colMenuStatus, setColMenuStatus] = useState({ id: null, top: 0, left: 0 });

  // --- STATE UNTUK KOLABORASI (SHARE & TEAM) ---
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [boardMembers, setBoardMembers] = useState([]);
  const [emailToShare, setEmailToShare] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  const fetchBoardMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/boards/${id}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoardMembers(response.data);
    } catch (error) {
      console.error("Gagal mengambil daftar anggota:", error);
    }
  };

  const handleShareBoard = async (e) => {
    e.preventDefault();
    if (!emailToShare.trim()) return;
    setShareLoading(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      await axios.post(`${apiUrl}/boards/${id}/members`, { email: emailToShare }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEmailToShare('');
      fetchBoardMembers(); // Refresh daftar anggota
      alert("Berhasil mengundang anggota!");
    } catch (error) {
      alert(error.response?.data?.message || "Gagal mengundang anggota. Pastikan email terdaftar.");
    } finally {
      setShareLoading(false);
    }
  };

  // Helper: Menghitung sisa hari untuk Deadline
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

  // Fungsi Hapus Kartu
  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("Yakin ingin menghapus kartu ini?")) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.delete(`${apiUrl}/cards/${cardId}`, { headers: { Authorization: `Bearer ${token}` } });
      setCardMenuStatus({ id: null, top: 0, left: 0 });
      fetchBoardDetail();
    } catch (error) { console.error("Gagal menghapus kartu:", error); }
  };

  // Fungsi Copy Kartu
  const handleCopyCard = async (card) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const column = columns.find(c => c.id === card.column_id);
      const nextPos = column.Cards ? column.Cards.length + 1 : 1;

      await axios.post(`${apiUrl}/cards`, { 
        title: `${card.title} (Copy)`, 
        column_id: card.column_id, 
        order_position: nextPos,
        color: card.color,
        deadline: card.deadline,
        description: card.description
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setCardMenuStatus({ id: null, top: 0, left: 0 });
      fetchBoardDetail();
    } catch (error) { console.error("Gagal mencopy kartu:", error); }
  };

  // Fungsi untuk memanggil API hapus
  const handleDeleteColumn = async (columnId) => {
    if (!window.confirm("Yakin ingin menghapus list ini? Semua kartu di dalamnya akan ikut terhapus.")) return;
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.delete(`${apiUrl}/columns/${columnId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActiveMenuId(null); 
      fetchBoardDetail();   
    } catch (error) {
      console.error("Gagal menghapus list:", error);
    }
  };

  // Buka mode edit
  const openEditMode = (column) => {
    setEditingColId(column.id);
    setEditColTitle(column.title);
    setEditColColor(column.color || softColors[0].value);
    setActiveMenuId(null); 
  };

  // Simpan perubahan ke Backend
  const handleUpdateColumn = async (columnId) => {
    if (!editColTitle.trim()) return; 
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.put(`${apiUrl}/columns/${columnId}`, {
        title: editColTitle,
        color: editColColor
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEditingColId(null); 
      fetchBoardDetail();    
    } catch (error) {
      console.error("Gagal mengupdate list:", error);
    }
  };

  const [newColumnTitle, setNewColumnTitle] = useState('')

  const softColors = [
  { value: '#fca5a5' }, // Soft Red
  { value: '#fdba74' }, // Soft Orange
  { value: '#fde047' }, // Soft Yellow
  { value: '#86efac' }, // Soft Green
  { value: '#93c5fd' }, // Soft Blue
  { value: '#d8b4fe' }, // Soft Purple
  { value: '#f472b6' }, // Soft Pink
  { value: '#cbd5e1' }, // Soft Gray
  { value: '#ef4444' }, // Merah
  { value: '#f97316' }, // Oranye
  { value: '#eab308' }, // Kuning
  { value: '#22c55e' }, // Hijau
  { value: '#3b82f6' }, // Biru
  { value: '#a855f7' }, // Ungu
  { value: '#ec4899' }, // Merah Muda
  { value: '#6b7280' }, // Abu-abu
  { value: '#0f172a' },
  { value: '#1e1b4b' },
  { value: '#064e3b' },
  { value: '#450a0a' },
  { value: '#2e1065' },
  { value: '#431407' },
  { value: '#083344' },
];

  const [newColumnColor, setNewColumnColor] = useState(softColors[0].value);
  const [addingCardColId, setAddingCardColId] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  const [selectedCard, setSelectedCard] = useState(null);
  const [editCardData, setEditCardData] = useState(null);

  // State untuk Modal Add Card
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [addCardData, setAddCardData] = useState({
    title: '', color: softColors[0].value, deadline: '', position: 1, description: '', columnId: null
  });

  const fetchBoardDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/boards/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoardDetail(response.data);
      setColumns(response.data.Columns || []);
    } catch (error) {
      console.error("Gagal mengambil detail board:", error);
      if (error.response && error.response.status === 403) {
        setErrorMsg('Anda tidak memiliki akses ke board ini');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardDetail();
    fetchBoardMembers();
  }, [id]);

  // --- FUNGSI DRAG AND DROP ---
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceColIndex = columns.findIndex(col => col.id.toString() === source.droppableId);
    const destColIndex = columns.findIndex(col => col.id.toString() === destination.droppableId);
    const sourceCol = columns[sourceColIndex];
    const destCol = columns[destColIndex];
    const sourceCards = Array.from(sourceCol.Cards || []);
    const destCards = source.droppableId === destination.droppableId ? sourceCards : Array.from(destCol.Cards || []);
    const [movedCard] = sourceCards.splice(source.index, 1);

    let newOrderPosition;
    if (destCards.length === 0) {
      newOrderPosition = 1; 
    } else if (destination.index === 0) {
      newOrderPosition = destCards[0].order_position / 2;
    } else if (destination.index === destCards.length) {
      newOrderPosition = destCards[destCards.length - 1].order_position + 1; 
    } else {
      const prevCardOrder = destCards[destination.index - 1].order_position;
      const nextCardOrder = destCards[destination.index].order_position;
      newOrderPosition = (prevCardOrder + nextCardOrder) / 2;
    }

    movedCard.order_position = newOrderPosition;
    movedCard.column_id = destCol.id;

    destCards.splice(destination.index, 0, movedCard);

    const newColumns = [...columns];
    newColumns[sourceColIndex] = { ...sourceCol, Cards: sourceCards };
    newColumns[destColIndex] = { ...destCol, Cards: destCards };
    setColumns(newColumns);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      await axios.put(`${apiUrl}/cards/${draggableId}`, {
        ...movedCard,
        column_id: destCol.id,
        order_position: newOrderPosition,
        deadline: movedCard.deadline || null 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Gagal menyimpan posisi kartu:", error);
      fetchBoardDetail(); 
    }
  };

  const handleAddColumn = async (e) => {
  e.preventDefault();
  if (!newColumnTitle.trim()) return;
  try {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL;
    const nextPosition = columns.length > 0 ? columns.length + 1 : 1;
    
    await axios.post(`${apiUrl}/columns`, { 
      title: newColumnTitle, 
      board_id: id, 
      order_position: nextPosition,
      color: newColumnColor 
    }, { headers: { Authorization: `Bearer ${token}` } });

    setIsAddingColumn(false); 
    setNewColumnTitle('');
    setNewColumnColor(softColors[0].value); 
    fetchBoardDetail(); 
  } catch (error) { 
    console.error("Gagal menambah kolom:", error); 
  }
};

  // Membuka modal dan mengatur nilai default
  const openAddCardModal = (columnId) => {
    const column = columns.find(c => c.id === columnId);
    const nextPos = column.Cards ? column.Cards.length + 1 : 1;
    
    setAddCardData({ 
      title: '', 
      color: softColors[0].value, 
      deadline: '', 
      position: nextPos, 
      description: '', 
      columnId: columnId 
    });
    setIsAddCardModalOpen(true);
  };

  // Mengirim data ke Backend
  const handleCreateCardSubmit = async (e) => {
    e.preventDefault();
    if (!addCardData.title.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      await axios.post(`${apiUrl}/cards`, { 
        title: addCardData.title, 
        column_id: addCardData.columnId, 
        order_position: addCardData.position,
        color: addCardData.color,
        deadline: addCardData.deadline || null,
        description: addCardData.description
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setIsAddCardModalOpen(false); 
      fetchBoardDetail(); 
    } catch (error) { 
      console.error("Gagal menambah kartu:", error); 
    }
  };

  const openCardDetail = (card) => {
    setSelectedCard(card);
    setEditCardData({
      title: card.title, 
      description: card.description || '', 
      priority: card.priority || 'Medium',
      color: card.color || softColors[0].value, 
      deadline: card.deadline ? card.deadline.split('T')[0] : '', 
      column_id: card.column_id, 
      order_position: card.order_position
    });
  };

  const handleUpdateCard = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const payload = { 
        ...editCardData, 
        priority: editCardData.priority.toLowerCase(), 
        deadline: editCardData.deadline === '' ? null : editCardData.deadline 
      };

      await axios.put(`${apiUrl}/cards/${selectedCard.id}`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      setSelectedCard(null); 
      fetchBoardDetail();
    } catch (error) { 
      console.error("Gagal update kartu:", error); 
    }
  };

  if (isLoading) return <div className="h-screen w-screen bg-[#0a0a0c] flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF]"></div></div>;
  if (errorMsg) return <div className="h-screen w-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white gap-4"><h2 className="text-xl font-bold text-red-500">{errorMsg}</h2><button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-[#7B61FF] rounded-lg font-bold hover:bg-purple-500 transition-colors">Kembali ke Dashboard</button></div>;
  if (!boardDetail) return <div className="h-screen w-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white gap-4"><h2 className="text-xl font-bold">Board tidak ditemukan</h2><button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-[#7B61FF] rounded-lg">Kembali</button></div>;

  return (
    <div className="h-screen w-screen bg-[#0a0a0c] flex font-sans overflow-hidden text-white m-0 p-0 absolute top-0 left-0">
      {/* 1. PANGGIL SIDEBAR */}
      <Sidebar />

      {/* 2. AREA UTAMA (Board Content) */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Navbar Board */}
        <header className="h-[72px] flex items-center justify-between px-8 bg-[#0a0a0c] shrink-0 border-b border-white/5">
          
          {/* BAGIAN KIRI: Tombol Menu, Back, dan Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar} 
              className={`flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 overflow-hidden ${
                isSidebarOpen ? 'w-0 h-0 opacity-0 p-0' : 'w-10 h-10 opacity-100 p-2'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <img src={logoKantra} alt="Kantra Logo" className="h-7 w-auto" />
          </div>

          
          {/* BAGIAN TENGAH */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#7B61FF]"></div>
            
            <h1 className="text-lg font-bold tracking-tight">
              {boardDetail?.title || 'Loading...'}
            </h1>
            
          </div>

          {/* BAGIAN KANAN: Auto-saved, Team Avatar, Share Button */}
          <div className="flex items-center gap-4">
            <span className="text-[12px] text-gray-500 font-medium mr-4">Auto-saved</span>
            
            <div className="flex items-center gap-4">
              {/* Avatar Anggota Tim */}
              <div className="flex -space-x-3">
                {boardMembers.slice(0, 4).map((member, idx) => (
                  <div key={idx} className="w-9 h-9 rounded-full bg-[#7B61FF] border-2 border-[#0a0a0c] flex items-center justify-center text-white text-xs font-bold shadow-sm" title={member.name}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {boardMembers.length > 4 && (
                  <div className="w-9 h-9 rounded-full bg-[#1A1A24] border-2 border-[#0a0a0c] flex items-center justify-center text-gray-400 text-xs font-bold shadow-sm">
                    +{boardMembers.length - 4}
                  </div>
                )}
              </div>

              <button onClick={() => setIsShareModalOpen(true)} className="bg-[#e5e5e5] text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-white transition-colors shadow-sm flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                Share
              </button>
            </div>
          </div>
        </header>

        {/* DRAG DROP CONTEXT WRAPPER */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8 flex gap-6 items-start">
            
            {columns.map((column) => (
              <div key={column.id} className="w-[280px] shrink-0 bg-[#1A1A24] rounded-2xl flex flex-col max-h-full overflow-hidden">
                
                {/* JIKA SEDANG MODE EDIT */}
                {editingColId === column.id ? (
                  <div className="p-4 flex flex-col gap-3 bg-white/5 rounded-t-2xl">
                    <input 
                      type="text" 
                      autoFocus 
                      value={editColTitle} 
                      onChange={(e) => setEditColTitle(e.target.value)} 
                      className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-2 py-1 text-white text-[14px] outline-none focus:border-[#7B61FF]" 
                    />
                    <div className="flex flex-wrap gap-2 my-1">
                      {softColors.map(c => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setEditColColor(c.value)}
                          className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${editColColor === c.value ? 'border-white scale-110 shadow-md' : 'border-transparent hover:scale-110 hover:border-white/50'}`}
                          style={{ backgroundColor: c.value }}
                          aria-label={`Select color ${c.value}`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateColumn(column.id)} className="bg-[#7B61FF] flex-1 text-white text-xs font-bold py-1.5 rounded-md hover:bg-purple-500">Save</button>
                      <button onClick={() => setEditingColId(null)} className="bg-white/10 px-3 text-white text-xs font-bold rounded-md hover:bg-white/20">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: column.color || '#ea580c' }}></div>
                    <h2 className="font-bold text-[15px] text-white flex-1 truncate">{column.title}</h2>
                    <div className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center justify-center shrink-0">
                      {column.Cards ? column.Cards.length : 0} 
                    </div>
                    
                    {/* AREA MENU TITIK TIGA*/}
                    <div className="relative shrink-0">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const rect = e.currentTarget.getBoundingClientRect();
                          if (colMenuStatus.id === column.id) {
                            setColMenuStatus({ id: null, top: 0, left: 0 });
                          } else {
                            setColMenuStatus({ 
                              id: column.id, 
                              top: rect.top, 
                              left: rect.right + 12 
                            });
                          }
                        }}
                        className={`text-gray-400 hover:text-white p-1 rounded-md transition-colors ${colMenuStatus.id === column.id ? 'bg-white/10 text-white relative z-50' : 'hover:bg-white/10'}`}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="12" cy="5" r="1"></circle>
                          <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                      </button>

                      {/* PORTAL*/}
                      {colMenuStatus.id === column.id && (
                        <CardMenuPortal top={colMenuStatus.top} left={colMenuStatus.left}>
                          <div className="bg-[#1A1A24] border border-white/10 shadow-2xl rounded-lg overflow-hidden flex flex-col">
                            <button 
                              onClick={() => { openEditMode(column); setColMenuStatus({id: null}); }}
                              className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 border-b border-white/5"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              Edit List
                            </button>
                            <button 
                              onClick={() => { handleDeleteColumn(column.id); setColMenuStatus({id: null}); }}
                              className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                              Delete List
                            </button>
                          </div>
                        </CardMenuPortal>
                      )}

                      {/* OVERLAY*/}
                      {colMenuStatus.id === column.id && (
                        <div 
                          className="fixed inset-0 bg-black/25 z-40 cursor-default"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setColMenuStatus({id: null}); 
                          }}
                          style={{ width: '100vw', height: '100vh', left: 0, top: 0 }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* DROPPABLE AREA (Area Kolom) */}
                <Droppable droppableId={column.id.toString()} type="card">
                  {(provided, snapshot) => (
                    <div 
                      className={`flex-1 overflow-y-auto px-4 pb-2 space-y-3 custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-white/5 rounded-xl' : ''}`}
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                    >
                      {column.Cards && column.Cards.map((card, index) => (
                        <Draggable 
                          key={card.id.toString()} 
                          draggableId={card.id.toString()} 
                          index={index}
                          isDragDisabled={cardMenuStatus.id === card.id} 
                        >
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps} 
                              onClick={() => openCardDetail(card)}
                              style={{ ...provided.draggableProps.style }}
                              className={`bg-[#121217] rounded-xl flex relative group border 
                                ${snapshot.isDragging ? 'border-[#7B61FF] shadow-lg z-50' : 'border-transparent shadow-sm'} 
                                ${cardMenuStatus.id === card.id ? 'z-50 cursor-default' : 'cursor-grab active:cursor-grabbing'} 
                                transition-all mb-3 min-h-[75px]`}
                            >
                              <div 
                                className="w-3 shrink-0 rounded-l-xl" 
                                style={{ 
                                  backgroundColor: card.color || (card.priority === 'High' ? '#ef4444' : '#f97316') 
                                }}
                              ></div>
                              <div className="p-3.5 flex-1 flex flex-col overflow-hidden">
                                
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex flex-col items-start flex-1 overflow-hidden">
                                    <h3 className="font-bold text-[16px] text-white leading-snug text-left truncate w-full">
                                      {card.title}
                                    </h3>
                                    
                                    {card.deadline && (
                                      <div className="mt-1 text-gray-500 text-[12px] font-bold text-left">
                                        {getDeadlineText(card.deadline)}
                                      </div>
                                    )}
                                  </div>

                                  <div className="relative shrink-0">
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        const rect = e.currentTarget.getBoundingClientRect(); 
                                        if (cardMenuStatus.id === card.id) {
                                          setCardMenuStatus({ id: null, top: 0, left: 0 });
                                        } else {
                                          setCardMenuStatus({ 
                                            id: card.id, 
                                            top: rect.top, 
                                            left: rect.right + 12 
                                          });
                                        }
                                      }}
                                      className={`text-gray-400 hover:text-white p-1 rounded-md transition-opacity bg-white/5 hover:bg-white/10 ${cardMenuStatus.id === card.id ? 'opacity-100 relative z-50' : 'opacity-0 group-hover:opacity-100'}`}
                                    >
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                      </svg>
                                    </button>

                                    {cardMenuStatus.id === card.id && (
                                      <CardMenuPortal top={cardMenuStatus.top} left={cardMenuStatus.left}>
                                        <div className="bg-[#1A1A24] border border-white/10 shadow-2xl rounded-lg overflow-hidden flex flex-col">
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); openCardDetail(card); setCardMenuStatus({id: null}); }}
                                            className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-gray-300 hover:bg-white/10 flex items-center gap-2"
                                          >
                                            Open card
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleCopyCard(card); setCardMenuStatus({id: null}); }}
                                            className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-gray-300 hover:bg-white/10 border-t border-white/5 flex items-center gap-2"
                                          >
                                            Copy card
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); setCardMenuStatus({id: null}); }}
                                            className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-500/10 border-t border-white/5 flex items-center gap-2"
                                          >
                                            Delete card
                                          </button>
                                        </div>
                                      </CardMenuPortal>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* OVERLAY UNTUK CARD MENU */}
                              {cardMenuStatus.id === card.id && (
                                <div 
                                  className="fixed inset-0 bg-black/25 z-40 cursor-default"
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setCardMenuStatus({id: null}); 
                                  }}
                                  style={{ width: '100vw', height: '100vh', left: 0, top: 0 }}
                                />
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* TOMBOL ADD CARD*/}
                <div className="p-4 pt-2">
                  <button onClick={() => openAddCardModal(column.id)} className="flex items-center gap-2 text-[13px] text-gray-400 font-bold hover:text-white transition-colors w-full">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add a card
                  </button>
                </div>
              </div>
            ))}

            {/* TOMBOL ADD LIST */}
            {isAddingColumn ? (
            <div className="w-[280px] shrink-0 bg-[#1A1A24] rounded-2xl p-4 flex flex-col gap-3 h-fit border border-[#7B61FF]">
              <form onSubmit={handleAddColumn} className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 font-bold uppercase mb-1 block">List Title</label>
                  <input type="text" autoFocus placeholder="Enter list title..." value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-white text-[14px] outline-none focus:border-[#7B61FF]" />
                </div>
                
                <div>
                  <label className="text-[11px] text-gray-400 font-bold uppercase mb-1 block">List Color</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {softColors.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setNewColumnColor(c.value)}
                        className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${newColumnColor === c.value ? 'border-white scale-110 shadow-md' : 'border-transparent hover:scale-110 hover:border-white/50'}`}
                        style={{ backgroundColor: c.value }}
                        aria-label={`Select color ${c.value}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-2 items-center">
                  <button type="submit" className="bg-[#7B61FF] text-white text-[13px] font-bold px-4 py-2 rounded-lg hover:bg-purple-500 flex-1">Add List</button>
                  <button type="button" onClick={() => setIsAddingColumn(false)} className="text-gray-400 hover:text-white px-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button onClick={() => setIsAddingColumn(true)} className="w-[280px] shrink-0 bg-white/5 rounded-2xl p-4 flex items-center gap-2 text-[14px] text-gray-400 font-bold hover:bg-white/10 hover:text-white h-fit border border-transparent border-dashed hover:border-white/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add another list
            </button>
          )}
          </div>
        </DragDropContext>
      </main>

      {/* ================= MODAL DETAIL KARTU ================= */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A24] rounded-2xl w-full max-w-[1000px] h-fit md:h-[500px] flex flex-col relative shadow-2xl border border-white/5 overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* 1. Header */}
            <div className="bg-[#121217] px-8 py-4 flex justify-between items-center border-b border-white/5">
              <span className="text-white text-[16px] font-bold">
                {columns.find(c => c.id === selectedCard.column_id)?.title || 'To Do'}
              </span>
              <button onClick={() => setSelectedCard(null)} className="text-white hover:opacity-70 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleUpdateCard} className="p-10 flex-1 flex flex-col gap-10 overflow-y-auto custom-scrollbar">
              
              {/* 2. Judul Utama */}
              <div className="flex items-center gap-5">
                <div 
                  className="w-5 h-5 rounded-full shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                  style={{ backgroundColor: editCardData.color }}
                ></div>
                <input 
                  type="text" 
                  value={editCardData.title} 
                  onChange={(e) => setEditCardData({...editCardData, title: e.target.value})} 
                  className="bg-transparent text-white text-3xl font-bold outline-none border-b border-transparent focus:border-white/10 pb-1 w-full"
                  placeholder="Card Title"
                />
              </div>

              {/* 3. Bar Metadata */}
              <div className="flex items-center" style={{ gap: '70px' }}>
                
                {/* Section Color */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 text-[14px] font-bold">Color</label>
                  <select 
                    value={editCardData.color} 
                    onChange={(e) => setEditCardData({...editCardData, color: e.target.value})}
                    style={{ 
                      backgroundColor: editCardData.color,
                      width: '100px',
                      height: '25px'
                    }}
                    className="rounded-sm border border-white/10 outline-none cursor-pointer appearance-none px-2"
                  >
                    {softColors.map(c => (
                      <option key={c.value} value={c.value} style={{ backgroundColor: c.value }}>
                        &nbsp;
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section Deadline */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 text-[14px] font-bold">Deadline</label>
                  <input 
                    type="date" 
                    value={editCardData.deadline} 
                    onChange={(e) => setEditCardData({...editCardData, deadline: e.target.value})} 
                    style={{ 
                      width: '100px',
                      height: '25px'
                    }}
                    className="bg-[#cbd5e1] border-none rounded-sm px-2 text-black font-bold text-[10px] outline-none cursor-pointer"
                  />
                </div>

              </div>

              {/* 4. Description Section */}
              <div className="flex flex-col gap-5 flex-1">
                <h3 className="text-white text-3xl font-bold">Description</h3>
                <textarea 
                  rows="4" 
                  placeholder="Add more detailed Description..."
                  value={editCardData.description} 
                  onChange={(e) => setEditCardData({...editCardData, description: e.target.value})} 
                  className="w-full bg-transparent border border-white/30 rounded-xl px-5 py-4 text-white text-[16px] outline-none focus:border-white/50 resize-none placeholder:text-gray-600 font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-[#7B61FF] text-white px-8 py-2 rounded-lg font-bold hover:bg-purple-500 transition-all shadow-lg active:scale-95">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; } .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }`}</style>

      {/* ================= MODAL SHARE BOARD ================= */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A24] rounded-2xl w-full max-w-[500px] flex flex-col relative shadow-[0_0_25px_10px_rgba(123,97,255,0.15)] border border-white/10 overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-[#0a0a0c] p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-white text-lg font-bold">Share Board</h2>
              <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Konten Form Share */}
            <div className="p-6">
              <form onSubmit={handleShareBoard} className="flex gap-3 mb-6">
                <input 
                  type="email" 
                  placeholder="Enter email address..." 
                  value={emailToShare}
                  onChange={(e) => setEmailToShare(e.target.value)}
                  className="flex-1 bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] outline-none focus:border-[#7B61FF]"
                  required
                />
                <button type="submit" disabled={shareLoading} className="px-5 py-2.5 rounded-xl text-white font-bold bg-[#7B61FF] hover:bg-purple-500 disabled:opacity-50">
                  {shareLoading ? 'Sending...' : 'Invite'}
                </button>
              </form>

              {/* Daftar Anggota Tim (FR-10) */}
              <div>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Board Members ({boardMembers.length})</h3>
                <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                  {boardMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#7B61FF]/20 text-[#7B61FF] flex items-center justify-center font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-bold text-[14px]">{member.name}</p>
                          <p className="text-gray-500 text-[12px]">{member.email}</p>
                        </div>
                      </div>
                      <span className="text-gray-400 text-[12px] font-medium bg-[#0a0a0c] px-3 py-1 rounded-lg">Member</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL ADD CARD ================= */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A24] rounded-xl w-full max-w-[450px] flex flex-col relative shadow-[0_0_25px_10px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden">
            
            <div className="p-5 flex justify-between items-center border-b border-white/5">
              <h2 className="text-white text-lg font-bold">Add a card</h2>
              <button onClick={() => setIsAddCardModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleCreateCardSubmit} className="p-5 flex flex-col gap-4">
              {/* INPUT NAMA/JUDUL */}
              <div>
                <label className="text-gray-300 text-[13px] font-bold mb-1.5 block">Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    maxLength={100}
                    value={addCardData.title} 
                    onChange={(e) => setAddCardData({...addCardData, title: e.target.value})} 
                    className="w-full bg-transparent border border-gray-600 rounded-lg px-3 py-2 text-white text-[14px] outline-none focus:border-[#7B61FF]" 
                    required 
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] text-gray-500 font-bold">{addCardData.title.length}/100</span>
                </div>
              </div>

              {/* GRID 3 KOLOM*/}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-300 text-[13px] font-bold mb-1.5 block">Color</label>
                  <select 
                    value={addCardData.color} 
                    onChange={(e) => setAddCardData({...addCardData, color: e.target.value})}
                    className="w-full bg-transparent border border-gray-600 rounded-lg px-2 py-2 text-white text-[13px] outline-none focus:border-[#7B61FF] cursor-pointer"
                    style={{ backgroundColor: addCardData.color }}
                  >
                    {softColors.map(c => (
                      <option 
                        key={c.value} 
                        value={c.value} 
                        style={{ backgroundColor: c.value, color: 'transparent' }}
                      >
                        &nbsp; 
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-gray-300 text-[13px] font-bold mb-1.5 block">Deadline</label>
                  <input 
                    type="date" 
                    value={addCardData.deadline} 
                    onChange={(e) => setAddCardData({...addCardData, deadline: e.target.value})} 
                    className="w-full bg-transparent border border-gray-600 rounded-lg px-2 py-1.5 text-white text-[13px] outline-none focus:border-[#7B61FF]" 
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-[13px] font-bold mb-1.5 block">Position</label>
                  <select 
                    value={addCardData.position} 
                    onChange={(e) => setAddCardData({...addCardData, position: Number(e.target.value)})}
                    className="w-full bg-[#1A1A24] border border-gray-600 rounded-lg px-2 py-2 text-white text-[13px] outline-none focus:border-[#7B61FF]"
                  >
                    {Array.from({ length: (columns.find(c => c.id === addCardData.columnId)?.Cards?.length || 0) + 1 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* INPUT DESKRIPSI */}
              <div>
                <label className="text-gray-300 text-[13px] font-bold mb-1.5 block">Description</label>
                <textarea 
                  rows="3" 
                  placeholder="Add more detailed Description..."
                  value={addCardData.description} 
                  onChange={(e) => setAddCardData({...addCardData, description: e.target.value})} 
                  className="w-full bg-transparent border border-gray-600 rounded-lg px-3 py-2 text-white text-[14px] outline-none focus:border-[#7B61FF] resize-none placeholder:text-gray-600 font-medium"
                ></textarea>
              </div>

              {/* TOMBOL SUBMIT */}
              <div className="mt-2">
                <button type="submit" className="bg-[#7B61FF] text-white text-[13px] font-bold px-4 py-2 rounded-md hover:bg-purple-500 transition-colors">
                  Create Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Board;

const CardMenuPortal = ({ children, top, left }) => {
  const style = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 9999,
    width: '10rem',
  };

  return ReactDOM.createPortal(
    <div style={style} onClick={(e) => e.stopPropagation()} className="animate-in fade-in zoom-in duration-150">
      {children}
    </div>,
    document.body
  );
};
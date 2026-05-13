import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import logoKantra from '../assets/logo-kantra.png';

const Board = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [boardDetail, setBoardDetail] = useState(null);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [addingCardColId, setAddingCardColId] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  const [selectedCard, setSelectedCard] = useState(null);
  const [editCardData, setEditCardData] = useState(null);

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardDetail();
  }, [id]);

  // --- FUNGSI DRAG AND DROP ---
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Jika dilepas di luar area, batalkan
    if (!destination) return;

    // Jika posisi awal dan akhir sama, batalkan
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // 1. Temukan kolom sumber dan tujuan
    const sourceColIndex = columns.findIndex(col => col.id.toString() === source.droppableId);
    const destColIndex = columns.findIndex(col => col.id.toString() === destination.droppableId);

    const sourceCol = columns[sourceColIndex];
    const destCol = columns[destColIndex];

    const sourceCards = Array.from(sourceCol.Cards || []);
    const destCards = source.droppableId === destination.droppableId ? sourceCards : Array.from(destCol.Cards || []);

    // 2. Ambil kartu yang sedang dipindah
    const [movedCard] = sourceCards.splice(source.index, 1);

    // 3. FRACTIONAL INDEXING (Hitung posisi order baru)
    let newOrderPosition;
    if (destCards.length === 0) {
      newOrderPosition = 1; // Jika kolom tujuan kosong
    } else if (destination.index === 0) {
      newOrderPosition = destCards[0].order_position / 2; // Jika ditaruh paling atas
    } else if (destination.index === destCards.length) {
      newOrderPosition = destCards[destCards.length - 1].order_position + 1; // Jika ditaruh paling bawah
    } else {
      // Jika ditaruh di tengah-tengah
      const prevCardOrder = destCards[destination.index - 1].order_position;
      const nextCardOrder = destCards[destination.index].order_position;
      newOrderPosition = (prevCardOrder + nextCardOrder) / 2;
    }

    movedCard.order_position = newOrderPosition;
    movedCard.column_id = destCol.id;

    // 4. Masukkan kartu ke array tujuan (Optimistic UI Update)
    destCards.splice(destination.index, 0, movedCard);

    const newColumns = [...columns];
    newColumns[sourceColIndex] = { ...sourceCol, Cards: sourceCards };
    newColumns[destColIndex] = { ...destCol, Cards: destCards };
    setColumns(newColumns); // Layar langsung berubah seketika tanpa nunggu backend

    // 5. Simpan ke Backend
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      await axios.put(`${apiUrl}/cards/${draggableId}`, {
        ...movedCard,
        column_id: destCol.id,
        order_position: newOrderPosition,
        deadline: movedCard.deadline || null // Jaga-jaga agar error 500 tidak muncul
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Gagal menyimpan posisi kartu:", error);
      fetchBoardDetail(); // Jika error, kembalikan posisi UI seperti semula
    }
  };

  // --- (FUNGSI CRUD LAINNYA TETAP SAMA SEPERTI SEBELUMNYA) ---
  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const nextPosition = columns.length > 0 ? columns.length + 1 : 1;
      await axios.post(`${apiUrl}/columns`, { title: newColumnTitle, board_id: id, order_position: nextPosition }, { headers: { Authorization: `Bearer ${token}` } });
      setIsAddingColumn(false); setNewColumnTitle(''); fetchBoardDetail(); 
    } catch (error) { console.error("Gagal menambah kolom:", error); }
  };

  const handleAddCard = async (e, columnId) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const column = columns.find(col => col.id === columnId);
      const nextPosition = (column.Cards && column.Cards.length > 0) ? column.Cards.length + 1 : 1;
      await axios.post(`${apiUrl}/cards`, { title: newCardTitle, column_id: columnId, order_position: nextPosition }, { headers: { Authorization: `Bearer ${token}` } });
      setAddingCardColId(null); setNewCardTitle(''); fetchBoardDetail(); 
    } catch (error) { console.error("Gagal menambah kartu:", error); }
  };

  const openCardDetail = (card) => {
    setSelectedCard(card);
    setEditCardData({
      title: card.title, description: card.description || '', priority: card.priority || 'Medium',
      deadline: card.deadline ? card.deadline.split('T')[0] : '', column_id: card.column_id, order_position: card.order_position
    });
  };

  const handleUpdateCard = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const payload = { ...editCardData, deadline: editCardData.deadline === '' ? null : editCardData.deadline };
      await axios.put(`${apiUrl}/cards/${selectedCard.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedCard(null); fetchBoardDetail();
    } catch (error) { console.error("Gagal update kartu:", error); alert("Gagal menyimpan detail kartu."); }
  };

  if (isLoading) return <div className="h-screen w-screen bg-[#0a0a0c] flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF]"></div></div>;
  if (!boardDetail) return <div className="h-screen w-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white gap-4"><h2 className="text-xl font-bold">Board tidak ditemukan</h2><button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-[#7B61FF] rounded-lg">Kembali</button></div>;

  return (
    <div className="h-screen w-screen bg-[#0a0a0c] flex flex-col font-sans overflow-hidden text-white m-0 p-0 absolute top-0 left-0">
      
      {/* NAVBAR */}
      <header className="h-[72px] flex items-center justify-between px-6 bg-[#0a0a0c] shrink-0 border-b border-white/5">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/dashboard')} className="w-10 h-10 bg-[#1A1A24] rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <img src={logoKantra} alt="Kantra Logo" className="h-7 w-auto cursor-pointer" onClick={() => navigate('/dashboard')} />
        </div>
      </header>

      {/* MAIN KANBAN AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 py-6 shrink-0 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">{boardDetail.title}</h1>
          <button className="bg-[#e5e5e5] text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-white transition-colors shadow-sm">Share</button>
        </div>

        {/* DRAG DROP CONTEXT WRAPPER */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8 flex gap-6 items-start">
            
            {columns.map((column) => (
              <div key={column.id} className="w-[280px] shrink-0 bg-[#1A1A24] rounded-2xl flex flex-col max-h-full">
                
                <div className="p-4 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color || '#ea580c' }}></div>
                  <h2 className="font-bold text-[15px] text-white flex-1">{column.title}</h2>
                  <div className="bg-white/20 text-white text-xs font-bold w-6 h-6 rounded-md flex items-center justify-center">
                    {column.Cards ? column.Cards.length : 0} 
                  </div>
                </div>

                {/* DROPPABLE AREA (Area Kolom) */}
                <Droppable droppableId={column.id.toString()} type="card">
                  {(provided, snapshot) => (
                    <div 
                      className={`flex-1 overflow-y-auto px-4 pb-2 space-y-3 custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-white/5 rounded-xl' : ''}`}
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                    >
                      {column.Cards && column.Cards.map((card, index) => (
                        
                        <Draggable key={card.id.toString()} draggableId={card.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openCardDetail(card)}
                              style={{ ...provided.draggableProps.style }}
                              className={`bg-[#0a0a0c] rounded-xl p-4 relative overflow-hidden group cursor-grab active:cursor-grabbing border ${snapshot.isDragging ? 'border-[#7B61FF] shadow-[0_10px_25px_rgba(123,97,255,0.3)] rotate-2' : 'border-white/5 hover:border-[#7B61FF]/50 shadow-md'} transition-all`}
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-[5px]" style={{ backgroundColor: card.priority === 'High' ? '#dc2626' : card.priority === 'Low' ? '#16a34a' : '#ea580c' }}></div>
                              <h3 className="font-bold text-[13px] text-white leading-snug mb-3 pr-2">{card.title}</h3>
                              <div className="flex items-center gap-3 text-gray-500 text-[11px] font-medium">
                                {card.deadline && (
                                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    {new Date(card.deadline).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                  </div>
                                )}
                                {card.description && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* TOMBOL ADD CARD */}
                <div className="p-4 pt-2">
                  {addingCardColId === column.id ? (
                    <form onSubmit={(e) => handleAddCard(e, column.id)} className="flex flex-col gap-2">
                      <input type="text" autoFocus placeholder="Enter a title..." value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-white text-[13px] outline-none focus:border-[#7B61FF]" />
                      <div className="flex gap-2 items-center mt-1">
                        <button type="submit" className="bg-[#7B61FF] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-purple-500">Add Card</button>
                        <button type="button" onClick={() => { setAddingCardColId(null); setNewCardTitle(''); }} className="text-gray-400 hover:text-white px-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => setAddingCardColId(column.id)} className="flex items-center gap-2 text-[13px] text-gray-400 font-bold hover:text-white transition-colors w-full">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add a card
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* TOMBOL ADD LIST */}
            {isAddingColumn ? (
              <div className="w-[280px] shrink-0 bg-[#1A1A24] rounded-2xl p-3 flex flex-col gap-3 h-fit border border-[#7B61FF]">
                <form onSubmit={handleAddColumn}>
                  <input type="text" autoFocus placeholder="Enter list title..." value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-white text-[14px] outline-none focus:border-[#7B61FF]" />
                  <div className="flex gap-2 mt-3 items-center">
                    <button type="submit" className="bg-[#7B61FF] text-white text-[13px] font-bold px-4 py-2 rounded-lg hover:bg-purple-500">Add List</button>
                    <button type="button" onClick={() => { setIsAddingColumn(false); setNewColumnTitle(''); }} className="text-gray-400 hover:text-white px-2">
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

      {/* ================= MODAL DETAIL KARTU TETAP SAMA ================= */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A24] rounded-2xl w-full max-w-[600px] flex flex-col relative shadow-[0_0_25px_10px_rgba(123,97,255,0.15)] border border-white/10 overflow-hidden">
            <div className="bg-[#0a0a0c] p-6 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                <h2 className="text-white text-lg font-bold">Edit Card Details</h2>
              </div>
              <button onClick={() => setSelectedCard(null)} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handleUpdateCard} className="p-6 flex flex-col gap-5">
              <div>
                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Card Title</label>
                <input type="text" value={editCardData.title} onChange={(e) => setEditCardData({...editCardData, title: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-[#7B61FF]" required />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Priority</label>
                  <select value={editCardData.priority} onChange={(e) => setEditCardData({...editCardData, priority: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#7B61FF]">
                    <option value="Low">Low (Green)</option><option value="Medium">Medium (Orange)</option><option value="High">High (Red)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Deadline</label>
                  <input type="date" value={editCardData.deadline} onChange={(e) => setEditCardData({...editCardData, deadline: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#7B61FF]" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Description</label>
                <textarea rows="4" value={editCardData.description} onChange={(e) => setEditCardData({...editCardData, description: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#7B61FF] resize-none"></textarea>
              </div>
              <div className="mt-2 flex justify-end gap-3 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setSelectedCard(null)} className="px-5 py-2.5 rounded-xl text-white font-bold bg-white/5 hover:bg-white/10">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-white font-bold bg-[#7B61FF] hover:bg-purple-500">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; } .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }`}</style>
    </div>
  );
};

export default Board;
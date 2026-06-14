import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';
import logoKantra from '../assets/logo-kantra2.png';

const avatarColors = ['#b8a6a6', '#ef4444', '#7B61FF', '#22c55e', '#3b82f6', '#f97316'];

const Team = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };

      const boardsResponse = await axios.get(`${apiUrl}/boards`, authHeader);
      const boards = boardsResponse.data || [];

      const boardTeams = await Promise.all(
        boards.map(async (board) => {
          try {
            const membersResponse = await axios.get(`${apiUrl}/boards/${board.id}/members`, authHeader);
            return {
              boardId: board.id,
              boardTitle: board.title,
              members: membersResponse.data || [],
            };
          } catch (error) {
            return {
              boardId: board.id,
              boardTitle: board.title,
              members: [],
            };
          }
        })
      );

      setTeams(boardTeams);
    } catch (error) {
      console.error('Gagal mengambil data team:', error);
      setErrorMsg('Gagal memuat data team.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return teams;

    return teams
      .map((team) => ({
        ...team,
        members: team.members.filter((member) =>
          `${member.name} ${member.email}`.toLowerCase().includes(query)
        ),
      }))
      .filter((team) => team.boardTitle.toLowerCase().includes(query) || team.members.length > 0);
  }, [searchQuery, teams]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0c] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF]"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white gap-4">
        <h2 className="text-xl font-bold text-red-500">{errorMsg}</h2>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-[#7B61FF] rounded-lg font-bold">
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0a0a0c] flex font-sans overflow-hidden text-white m-0 p-0 absolute top-0 left-0">
      <Sidebar />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-[72px] flex items-center justify-between px-8 bg-[#0a0a0c] shrink-0">
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
            <img src={logoKantra} alt="Kantra Logo" className="h-8 w-auto" />
          </div>

          <div className="flex-1 max-w-[600px] px-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A1A24] rounded-full px-5 py-2.5 text-white text-[14px] outline-none focus:bg-[#252530] transition-colors pr-11"
              />
              <svg className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-300 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#7B61FF] transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
          <h1 className="text-[15px] text-white/70 font-bold mb-4 tracking-tight">My Team</h1>

          {filteredTeams.length === 0 ? (
            <div className="text-gray-500 text-center py-10">Belum ada team yang cocok dengan pencarian.</div>
          ) : (
            filteredTeams.map((team) => (
              <section key={team.boardId} className="bg-[#1A1A24] rounded-2xl p-6 border border-white/5 mb-8 min-h-[166px]">
                
                {/* JUDUL BOARD (Sama persis dengan List: Bisa diklik & ada efek hover) */}
                <h2 
                  onClick={() => navigate(`/board/${team.boardId}`)}
                  className="text-[16px] font-bold text-white mb-5 cursor-pointer hover:text-[#7B61FF] hover:underline transition-colors w-fit"
                  title={`Buka papan ${team.boardTitle}`}
                >
                  {team.boardTitle}
                </h2>

                {team.members.length === 0 ? (
                  <div className="text-sm text-white/40">Belum ada anggota di board ini.</div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {team.members.map((member, index) => (
                      <article key={`${team.boardId}-${member.id}`} className="w-[132px] h-[100px] rounded-xl bg-[#0d0d13] flex flex-col items-center justify-center relative overflow-hidden">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-[#121217] mb-2"
                          style={{ backgroundColor: avatarColors[index % avatarColors.length] }}
                        >
                          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <p className="w-full px-2 text-center text-[12px] text-white/75 font-bold truncate">{member.email}</p>
                        <button
                          onClick={() => setSelectedMember({ ...member, boardTitle: team.boardTitle })}
                          className="absolute bottom-1.5 right-1.5 bg-[#7B61FF] text-white text-[12px] leading-none font-bold px-2 py-1.5 rounded-md hover:bg-purple-500 transition-colors"
                        >
                          Show Detail
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </main>

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[360px] bg-[#1A1A24] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">Member Detail</h2>
                <p className="text-sm text-white/40">{selectedMember.boardTitle}</p>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-white/50 hover:text-white">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-[#7B61FF] flex items-center justify-center text-white text-xl font-black">
                {selectedMember.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold truncate">{selectedMember.name}</p>
                <p className="text-white/50 text-sm truncate">{selectedMember.email}</p>
              </div>
            </div>

            <button onClick={() => setSelectedMember(null)} className="w-full bg-[#7B61FF] hover:bg-purple-500 rounded-xl py-3 text-white font-bold transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; } .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }`}</style>
    </div>
  );
};

export default Team;

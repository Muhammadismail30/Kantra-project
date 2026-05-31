import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside 
      className={`bg-[#17171f] h-screen flex flex-col justify-between relative z-20 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0'
      }`}
    >
      <div className="absolute right-0 top-0 h-full w-[2px] bg-[#7B61FF]" style={{ boxShadow: '0px 0px 20px 6px rgba(123, 97, 255, 0.6)' }}></div>

      <div className="flex flex-col min-w-[260px]"> 
        
        {/* Header Sidebar (Menu & Ikon Hamburger Penutup) */}
        <div className="flex items-center gap-4 px-8 py-8 border-b border-white/10">
          <button onClick={toggleSidebar} className="text-white hover:text-[#7B61FF] transition-colors cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <span className="font-bold text-[15px] text-white">Menu</span>
        </div>

        {/* Menu Navigasi */}
        <div className="flex flex-col gap-2 mt-6">
          <a href="#" onClick={(e) => {e.preventDefault(); navigate('/dashboard');}} className="flex items-center gap-4 px-6 py-3 mx-4 bg-[#0a0a0c] rounded-2xl text-white font-bold no-underline">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-4 px-6 py-3 mx-4 text-white/70 hover:bg-white/5 rounded-2xl font-bold transition-colors no-underline">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            List
          </a>
          {/* <button 
            onClick={() => navigate('/profile')} 
            className="flex items-center gap-3 text-gray-400 hover:text-white w-full p-3 rounded-xl hover:bg-white/5 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span className="font-bold text-[14px]">Profile</span>
          </button> */}
        </div>
      </div>


      <div className="mb-8 min-w-[260px]">
        <a href="#" onClick={handleLogout} className="flex items-center gap-4 px-8 py-3 text-white font-bold hover:text-[#7B61FF] transition-colors no-underline">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
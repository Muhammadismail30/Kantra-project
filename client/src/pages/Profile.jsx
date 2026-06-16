import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';
import logoKantra from '../assets/logo-kantra.png';

const Profile = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  
  const [profile, setProfile] = useState({ name: '', email: '', createdAt: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await axios.get(`${apiUrl}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (error) {
      console.error("Gagal load profil", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.put(`${apiUrl}/users/profile`, {
        name: profile.name,
        email: profile.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: 'Profile successfully updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (isLoading) return <div className="h-screen w-screen bg-[#0a0a0c] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF]"></div></div>;

  return (
    <div className="h-screen w-screen bg-[#0a0a0c] flex font-sans overflow-hidden text-white m-0 p-0 absolute top-0 left-0">
      <Sidebar />

      <main className="flex-1 flex flex-col relative overflow-hidden overflow-y-auto custom-scrollbar">
        <header className="h-[72px] flex items-center px-8 bg-[#0a0a0c] shrink-0 border-b border-white/5 sticky top-0 z-10">
          <button onClick={toggleSidebar} className={`flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 mr-4 ${isSidebarOpen ? 'w-0 h-0 opacity-0 p-0' : 'w-10 h-10 opacity-100 p-2'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <img src={logoKantra} alt="Kantra Logo" className="h-7 w-auto mr-4" />
          <h1 className="text-xl font-bold border-l border-white/10 pl-4">Account Settings</h1>
        </header>

        <div className="p-8 max-w-3xl w-full mx-auto mt-4">
          <div className="bg-[#1A1A24] border border-white/5 rounded-2xl p-8 shadow-2xl">
            
            {/* Foto Profil / Avatar */}
            <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-8">
              <div className="w-24 h-24 rounded-full bg-[#7B61FF] flex items-center justify-center text-white text-4xl font-black shadow-[0_0_20px_rgba(123,97,255,0.3)]">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
                <p className="text-gray-400 text-sm">Member since {new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Form Edit */}
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
              <div>
                <label className="text-gray-400 text-[12px] font-bold uppercase tracking-wider mb-2 block">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})} 
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#7B61FF] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 text-[12px] font-bold uppercase tracking-wider mb-2 block">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  onChange={(e) => setProfile({...profile, email: e.target.value})} 
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#7B61FF] transition-colors"
                  required
                />
              </div>

              {message.text && (
                <div className={`p-3 rounded-lg text-sm font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {message.text}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button type="submit" disabled={isSaving} className="bg-[#7B61FF] hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold text-[14px] transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
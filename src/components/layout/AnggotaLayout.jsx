import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Pastikan nama import sidebar ini sesuai dengan file Anda
import AnggotaSidebar from './AnggotaSidebar'; 
import useAuthStore from '../../store/useAuthStore';

export default function AnggotaLayout({ children }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.setLogout);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-['Manrope']">
      <AnggotaSidebar />
      
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header / Topbar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-end px-10 shrink-0 shadow-sm z-50">
          
          {/* ─── Profile Area dengan Dropdown ─── */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all outline-none group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 group-hover:text-[#0F766E] transition-colors">Anggota Keluarga</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WARGA DASAWISMA</p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
                  AD
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0F766E] border-2 border-white rounded-full"></div>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menu Akun</p>
                </div>
                
                <button 
                  onClick={() => { navigate('/anggota/pengaturan'); setIsProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-[#0F766E] hover:bg-[#ECFDF5] transition-all"
                >
                  <User size={18} /> Edit Profil
                </button>
                
                <div className="h-px bg-gray-100 my-1 mx-4"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut size={18} /> Keluar Aplikasi
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
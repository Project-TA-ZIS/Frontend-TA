import React, { useState, useRef, useEffect } from "react";
import { Search, User, LogOut, Settings, ChevronDown, Menu } from "lucide-react"; // Tambahkan Menu
import { useNavigate } from "react-router-dom";
import AmilSidebar from "./AmilSidebar";
import useAuthStore from "../../store/useAuthStore";
import Swal from "sweetalert2";

// Ambil kata pertama dari sebuah teks (mis. nama lengkap → nama depan saja).
const firstWord = (value) => {
  const safe = (value || "").trim();
  if (!safe) return "";
  return safe.split(/\s+/)[0] || "";
};

// Buat inisial dari nama untuk ditampilkan di avatar (mis. "Budi Santoso" → "BS").
const getInitials = (name) => {
  const safe = (name || "").trim();
  if (!safe) return "U";
  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};

// Ubah kode role menjadi label yang ditampilkan ke user.
const roleToLabel = (role) => {
  if (!role) return "";
  if (role === "penanggung jawab dasawisma") return "penanggung jawab dasawisma";
  if (role === "kader dasawisma") return "kader dasawisma";
  if (role === "amil zakat") return "Amil Zakat";
  return role
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
};

// Kerangka halaman untuk peran AMIL ZAKAT: sidebar (bisa buka/tutup di mobile)
// + header (profil & logout) + area konten {children}.
export default function AmilLayout({ children }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // KUNCI 1: State untuk Sidebar Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.setLogout);
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  const rawDisplayName =
    user?.nama_lengkap ||
    user?.name ||
    user?.nama ||
    user?.username ||
    user?.email ||
    "User";
  const displayName = firstWord(rawDisplayName) || "User";
  const displayRole = roleToLabel(role);
  const initials = getInitials(rawDisplayName);

  // Tutup dropdown profil saat user mengklik di luar area dropdown.
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Proses logout: minta konfirmasi, lalu hapus sesi & arahkan ke login.
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin ingin keluar?",
      text: "Anda akan keluar dari aplikasi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-['Manrope']">
      {/* KUNCI 2: Lempar state ke Sidebar */}
      <AmilSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden w-full transition-all duration-300">
        
        {/* KUNCI 3: Header menggunakan px-4 untuk mobile */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-10 shrink-0 shadow-sm z-30">
          
          {/* KUNCI 4: Tombol Hamburger di kiri khusus Mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-[#0F766E] hover:bg-emerald-50 transition-colors"
            >
              <Menu size={24} strokeWidth={2.5} />
            </button>
            <div className="hidden md:block relative w-96"></div>
          </div>

          {/* ─── Profile Area dengan Dropdown ─── */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all outline-none group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 group-hover:text-[#0F766E] transition-colors">
                  {displayName}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {displayRole || "PENGGUNA"}
                </p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 bg-[#0F766E] rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#10B981] border-2 border-white rounded-full"></div>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Menu Akun
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigate("/amil/pengaturan");
                    setIsProfileOpen(false);
                  }}
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

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
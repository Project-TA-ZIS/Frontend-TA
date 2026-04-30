import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import PageTransition from "../../components/PageTransition";

// ─── Initial Dummy Data (Khusus Amil) ──────────────────────────────────────
const INITIAL_DATA = [
  {
    id: "1",
    nama: "Ustadz Abdul Somad",
    email: "abdul.somad@email.com",
    telp: "081234567890",
  },
  {
    id: "2",
    nama: "Kyai Hasyim",
    email: "hasyim.muzadi@email.com",
    telp: "082345678901",
  },
  {
    id: "3",
    nama: "Ustazah Oki",
    email: "oki.setiana@email.com",
    telp: "083456789012",
  },
];

export default function AnggotaAmil() {
  // ─── States ───
  const [anggotaList, setAnggotaList] = useState(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State untuk Modal Pop-up
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State: Untuk melacak ID mana yang sedang diedit (null = mode Tambah)
  const [editingId, setEditingId] = useState(null);
  
  // State untuk form input (Tanpa Role)
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telp: "",
  });

  // ─── Filter Pencarian ───
  const filteredAnggota = anggotaList.filter((anggota) =>
    anggota.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    anggota.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Handlers ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler saat tombol "Hapus" di tabel diklik
 // Handler saat tombol "Hapus" di tabel diklik
  const handleDeleteClick = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data Amil ini?")) {
      // Ubah amilList menjadi anggotaList (atau sesuaikan jika nama state Anda berbeda)
      setAnggotaList(anggotaList.filter((item) => item.id !== id)); 
    }
  };

  // Handler saat tombol "+ Amil" diklik (Mode Tambah)
  const handleTambahClick = () => {
    setEditingId(null); 
    setFormData({ nama: "", email: "", telp: "" }); 
    setIsModalOpen(true);
  };

  // Handler saat tombol "Edit" di tabel diklik (Mode Edit)
  const handleEditClick = (anggota) => {
    setEditingId(anggota.id); 
    setFormData({
      nama: anggota.nama,
      email: anggota.email,
      telp: anggota.telp,
    }); 
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // PROSES EDIT
      setAnggotaList(anggotaList.map((item) => 
        item.id === editingId ? { ...formData, id: editingId } : item
      ));
    } else {
      // PROSES TAMBAH BARU (Gunakan prefix AML untuk ID)
      const newId = `AML-00${anggotaList.length + 1}`;
      const newAnggota = { id: newId, ...formData };
      setAnggotaList([...anggotaList, newAnggota]);
    }
    
    // Tutup modal dan reset form
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ nama: "", email: "", telp: "" });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <PageTransition>
    <div
      className="min-h-screen bg-gray-50 p-6 md:p-10 relative"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ─── Header ─── */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">
          Anggota Amil
        </h1>
        <p className="text-sm text-gray-600 mt-1 font-medium">
          Beberapa Anggota Amil yang sudah Terdaftar
        </p>
      </div>

      {/* ─── Tombol Tambah ─── */}
      <div className="mb-8">
        <button 
          onClick={handleTambahClick}
          className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-2.5 px-5 rounded-lg transition-colors shadow-sm text-sm"
        >
          <Plus size={18} strokeWidth={3} />
          Amil
        </button>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari data warga atau transaksi..."
          className="bg-gray-200/60 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block w-full pl-11 pr-5 py-3.5 font-medium outline-none transition-all placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center w-20">ID</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">NAMA</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">EMAIL</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">NO.TELP</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center w-28">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAnggota.length > 0 ? (
                filteredAnggota.map((item, index) => (
                  <tr key={index} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0F766E] text-center">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">{item.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">{item.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">{item.telp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        
                        {/* Tombol Edit: Hijau Solid Standby */}
                        <button 
                          onClick={() => handleEditClick(item)} 
                          className="text-[#10B981] bg-emerald-50 hover:bg-emerald-100 hover:text-[#064E3B] p-2 rounded-lg transition-colors shadow-sm" 
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>

                        {/* Tombol Hapus: Merah Solid Standby */}
                        <button 
                          onClick={() => handleDeleteClick(item.id)} 
                          className="text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-700 p-2 rounded-lg transition-colors shadow-sm" 
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm font-medium text-gray-500">
                    Tidak ada data yang cocok dengan pencarian "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL POP-UP TAMBAH / EDIT DATA ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header Modal */}
            <div className="bg-[#0F766E] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Edit Data Amil" : "Tambah Anggota Amil"}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-emerald-200 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {editingId && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ID Amil</label>
                  <input 
                    type="text" 
                    value={editingId}
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 text-gray-500 text-sm rounded-xl block px-4 py-3 font-semibold cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="nama"
                  required
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent block px-4 py-3 font-semibold outline-none transition-all"
                  placeholder="Masukkan nama amil..."
                />
              </div>

              {/* Input Role dihapus di halaman ini */}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alamat Email</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent block px-4 py-3 font-semibold outline-none transition-all"
                  placeholder="email@contoh.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nomor Telepon</label>
                <input 
                  type="text" 
                  name="telp"
                  required
                  value={formData.telp}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent block px-4 py-3 font-semibold outline-none transition-all"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-sm transition-colors"
                >
                  {editingId ? "Simpan Perubahan" : "Simpan Data"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
    </PageTransition>
  );
}
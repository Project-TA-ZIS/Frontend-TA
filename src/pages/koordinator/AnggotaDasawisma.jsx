import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";

// ─── Initial Dummy Data ────────────────────────────────────────────────────
const INITIAL_DATA = [
  {
    id: "DSW-001",
    nama: "Siti Aminah",
    role: "Koordinator",
    email: "siti.aminah@email.com",
    telp: "081234567890",
  },
  {
    id: "DSW-002",
    nama: "Budi Santoso",
    role: "Anggota Dasawisma",
    email: "budi.santoso@email.com",
    telp: "082345678901",
  },
  {
    id: "DSW-003",
    nama: "Ningsih Suryani",
    role: "Amil Zakat",
    email: "ningsih.s@email.com",
    telp: "083456789012",
  },
  {
    id: "DSW-004",
    nama: "Ahmad Dahlan",
    role: "Anggota Dasawisma",
    email: "ahmad.d@email.com",
    telp: "084567890123",
  },
  {
    id: "DSW-005",
    nama: "Ratna Sari",
    role: "Anggota Dasawisma",
    email: "ratna.sari@email.com",
    telp: "085678901234",
  },
];

export default function AnggotaDasawisma() {
  // ─── States ───
  const [anggotaList, setAnggotaList] = useState(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State untuk Modal Pop-up
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State BARU: Untuk melacak ID mana yang sedang diedit (null = mode Tambah)
  const [editingId, setEditingId] = useState(null);
  
  // State untuk form input
  const [formData, setFormData] = useState({
    nama: "",
    role: "Anggota Dasawisma",
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

  // Handler saat tombol "+ Dasawisma" diklik (Mode Tambah)
  const handleTambahClick = () => {
    setEditingId(null); // Pastikan tidak ada ID yang diedit
    setFormData({ nama: "", role: "Anggota Dasawisma", email: "", telp: "" }); // Kosongkan form
    setIsModalOpen(true);
  };

  // Handler saat tombol "Edit" di tabel diklik (Mode Edit)
  const handleEditClick = (anggota) => {
    setEditingId(anggota.id); // Simpan ID yang mau diedit
    setFormData({
      nama: anggota.nama,
      role: anggota.role,
      email: anggota.email,
      telp: anggota.telp,
    }); // Isi form dengan data lama
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // PROSES EDIT: Update data yang ID-nya sama dengan editingId
      setAnggotaList(anggotaList.map((item) => 
        item.id === editingId ? { ...formData, id: editingId } : item
      ));
    } else {
      // PROSES TAMBAH BARU: Bikin ID baru dan masukkan ke list
      const newId = `DSW-00${anggotaList.length + 1}`;
      const newAnggota = { id: newId, ...formData };
      setAnggotaList([...anggotaList, newAnggota]);
    }
    
    // Tutup modal dan reset form
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ nama: "", role: "Anggota Dasawisma", email: "", telp: "" });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div
      className="min-h-screen bg-gray-50 p-6 md:p-10 relative"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ─── Header ─── */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">
          Anggota Dasawisma
        </h1>
        <p className="text-sm text-gray-600 mt-1 font-medium">
          Beberapa Anggota Dasawisma yang sudah Terdaftar
        </p>
      </div>

      {/* ─── Tombol Tambah ─── */}
      <div className="mb-8">
        <button 
          onClick={handleTambahClick}
          className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-2.5 px-5 rounded-lg transition-colors shadow-sm text-sm"
        >
          <Plus size={18} strokeWidth={3} />
          Dasawisma
        </button>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari data warga berdasarkan nama atau ID..."
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
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">ROLE</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wider ${
                          item.role === "Koordinator" || item.role === "Amil Zakat"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">{item.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">{item.telp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        {/* Tombol Edit memanggil handleEditClick dan mengirim data baris tersebut */}
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="text-gray-400 hover:text-[#10B981] transition-colors" 
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button className="text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm font-medium text-gray-500">
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
            
            {/* Header Modal berubah teksnya tergantung mode Tambah/Edit */}
            <div className="bg-[#0F766E] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Edit Data Anggota" : "Tambah Anggota Dasawisma"}
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
              {/* Jika mode Edit, tampilkan ID-nya agar user tahu (opsional) */}
              {editingId && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ID Anggota</label>
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
                  placeholder="Masukkan nama..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Role (Peran)</label>
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-transparent block px-4 py-3 font-semibold outline-none transition-all"
                >
                  <option value="Anggota Dasawisma">Anggota Dasawisma</option>
                  <option value="Koordinator">Koordinator</option>
                  <option value="Amil Zakat">Amil Zakat</option>
                </select>
              </div>

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
  );
}
import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import PageTransition from "../../components/PageTransition";

// ─── Dummy Data Awal ───────────────────────────────────────────────────────
const INITIAL_DATA = [
  {
    id: "1",
    nama: "Bapak Ahmad",
    telp: "081111111111",
    kategori: "Fakir",
    jenisKelamin: "Laki-laki",
  },
  {
    id: "2",
    nama: "Ibu Maryam",
    telp: "082222222222",
    kategori: "Miskin",
    jenisKelamin: "Perempuan",
  },
  {
    id: "3",
    nama: "Keluarga Bapak Budi",
    telp: "083333333333",
    kategori: "Gharimin (Banyak Hutang)",
    jenisKelamin: "Laki-laki",
  },
  {
    id: "4",
    nama: "Panti Asuhan Al-Ikhlas",
    telp: "084444444444",
    kategori: "Fisabilillah",
    jenisKelamin: "Perempuan",
  },
  {
    id: "5",
    nama: "Siti Nurhaliza",
    telp: "085555555555",
    kategori: "Mualaf",
    jenisKelamin: "Perempuan",
  },
];

export default function KelolaMustahik() {
  // ─── States ───
  const [mustahikList, setMustahikList] = useState(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State untuk Modal Pop-up
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // State form input (Disesuaikan dengan kolom Mustahik)
  const [formData, setFormData] = useState({
    nama: "",
    telp: "",
    kategori: "Fakir",
    jenisKelamin: "Laki-laki",
  });

  // ─── Filter Pencarian ───
  const filteredMustahik = mustahikList.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Handlers ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTambahClick = () => {
    setEditingId(null);
    setFormData({ nama: "", telp: "", kategori: "Fakir", jenisKelamin: "Laki-laki" });
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      telp: item.telp,
      kategori: item.kategori,
      jenisKelamin: item.jenisKelamin,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data Mustahik ini?")) {
      setMustahikList(mustahikList.filter((item) => item.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // PROSES EDIT
      setMustahikList(mustahikList.map((item) => 
        item.id === editingId ? { ...formData, id: editingId } : item
      ));
    } else {
      // PROSES TAMBAH BARU
      const newId = `MST-00${mustahikList.length + 1}`;
      const newMustahik = { id: newId, ...formData };
      setMustahikList([...mustahikList, newMustahik]);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ nama: "", telp: "", kategori: "Fakir", jenisKelamin: "Laki-laki" });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Manrope']">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ─── Header ─── */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">
          Kelola Mustahik
        </h1>
        <p className="text-sm text-gray-600 mt-1 font-medium">
          Beberapa Mustahik yang sudah Terdaftar
        </p>
      </div>

      {/* ─── Tombol Tambah ─── */}
      <div className="mb-8">
        <button 
          onClick={handleTambahClick}
          className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-2.5 px-5 rounded-lg transition-colors shadow-sm text-sm"
        >
          <Plus size={18} strokeWidth={3} />
          Mustahik
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
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">NO.TELP</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">KATEGORI</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">JENIS KELAMIN</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center w-28">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMustahik.length > 0 ? (
                filteredMustahik.map((item, index) => (
                  <tr key={index} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0F766E] text-center">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">{item.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">{item.telp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wider bg-gray-100 text-gray-700">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wider ${
                        item.jenisKelamin === "Laki-laki" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"
                      }`}>
                        {item.jenisKelamin}
                      </span>
                    </td>
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
            
            <div className="bg-[#0F766E] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Edit Data Mustahik" : "Tambah Mustahik Baru"}
              </h2>
              <button onClick={handleCloseModal} className="text-emerald-200 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {editingId && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ID Mustahik</label>
                  <input type="text" value={editingId} disabled className="w-full bg-gray-100 border border-gray-200 text-gray-500 text-sm rounded-xl block px-4 py-3 font-semibold cursor-not-allowed"/>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Lengkap / Instansi</label>
                <input type="text" name="nama" required value={formData.nama} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold" placeholder="Masukkan nama..."/>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nomor Telepon</label>
                <input type="text" name="telp" required value={formData.telp} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold" placeholder="08xxxxxxxxxx"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kategori (Asnaf)</label>
                  <select name="kategori" value={formData.kategori} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold cursor-pointer">
                    <option value="Fakir">Fakir</option>
                    <option value="Miskin">Miskin</option>
                    <option value="Amil">Amil</option>
                    <option value="Mualaf">Mualaf</option>
                    <option value="Riqab (Hamba Sahaya)">Riqab</option>
                    <option value="Gharimin (Banyak Hutang)">Gharimin</option>
                    <option value="Fisabilillah">Fisabilillah</option>
                    <option value="Ibnu Sabil (Musafir)">Ibnu Sabil</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Jenis Kelamin</label>
                  <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#10B981] outline-none block px-4 py-3 font-semibold cursor-pointer">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-sm transition-colors">
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
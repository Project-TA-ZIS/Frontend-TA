import { X } from "lucide-react";
import Select from "react-select";
import MantineDateInput from "../MantineDateInput";

const CreateDataModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  errors,
  anggotaOptions,
  onSave,
  handleInputChange,
  userData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      {/* Menggunakan max-h-[90vh] agar modal tetap bisa di-scroll jika layar kecil */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header Modal - Dikecilkan padding-nya */}
        <div className="bg-[#0F766E] px-5 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base md:text-lg font-bold text-white">
            Catat Transaksi Kas
          </h2>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Menggunakan space-y-3 (rapat) untuk mobile */}
        <form
          onSubmit={onSave}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-5 space-y-3 overflow-y-auto flex-1">
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Tanggal Transaksi
                <span className="text-red-500"> *</span>
              </label>
              <MantineDateInput
                name="tanggal"
                value={formData.tanggal}
                onChange={handleInputChange}
                error={errors.tanggal}
              />
              {errors.tanggal && (
                <p className="mt-1 text-xs text-red-500">{errors.tanggal}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Jenis Transaksi
                <span className="text-red-500"> *</span>
              </label>
              <select
                name="jenis"
                value={formData.jenis}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
              >
                <option value="Pemasukan">KAS MASUK (PEMASUKAN)</option>
                <option value="Pengeluaran">KAS KELUAR (PENGELUARAN)</option>
              </select>
            </div>

            {formData.jenis === "Pemasukan" && (
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Tipe Pemasukan
                  <span className="text-red-500"> *</span>
                </label>
                <select
                  name="tipePemasukan"
                  value={formData.tipePemasukan}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                >
                  <option value="IURAN">Iuran Anggota</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>
            )}

            {formData.jenis === "Pemasukan" &&
              formData.tipePemasukan === "IURAN" && (
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Cari Anggota Dasawisma
                    <span className="text-red-500"> *</span>
                  </label>
                  <Select
                    options={anggotaOptions}
                    placeholder="Cari nama anggota..."
                    onChange={(selectedOption) =>
                      setFormData((prev) => ({
                        ...prev,
                        anggota_dasawisma_id: selectedOption?.value || "",
                      }))
                    }
                    className="text-sm"
                  />
                  {errors.anggota_dasawisma_id && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.anggota_dasawisma_id}
                    </p>
                  )}
                </div>
              )}

            {formData.jenis === "Pengeluaran" && (
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Dikeluarkan Oleh
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="deskripsi"
                  disabled
                  value={userData.nama_lengkap || "null"}
                  className="w-full bg-gray-100 border border-gray-200 text-sm rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-[#10B981]"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Deskripsi Kegiatan
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="deskripsi"
                //required
                value={formData.deskripsi}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                placeholder="Contoh: Pembelian Sapu..."
              />
              {errors.deskripsi && (
                <p className="mt-1 text-xs text-red-500">{errors.deskripsi}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Nominal (Rp)
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9.]*"
                name="nominal"
                // required
                value={formData.nominal}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                placeholder="0"
              />
              {errors.nominal && (
                <p className="mt-1 text-xs text-red-500">{errors.nominal}</p>
              )}
            </div>
          </div>

          {/* Footer Tombol - Dikecilkan padding-nya */}
          <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDataModal;

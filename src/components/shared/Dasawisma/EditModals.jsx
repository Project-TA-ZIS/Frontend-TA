import { X } from "lucide-react";
import Select from "react-select";
import { formatThousands } from "../../../utils/formatThousands";
import MantineDateInput from "../MantineDateInput";

const EditTransactionModal = ({
  isOpen,
  onClose,
  editForm,
  setEditForm,
  errors,
  anggotaOptions,
  onSave,
  handleEditInputChange,
  dasawismaFound = true,
  jenisTransaksi,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-[#0F766E] p-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Detail Transaksi Kas</h2>

          <button onClick={() => onClose()} className="text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Jenis Transaksi
              <span className="text-red-500"> *</span>
            </label>

            {editForm.jenis === "Pemasukan" ? (
              <input
                disabled
                value={editForm.jenis}
                className="w-full mt-1 bg-gray-100 border rounded-xl px-4 py-2"
              />
            ) : (
              <input
                disabled
                value={editForm.jenis}
                className="w-full mt-1 bg-gray-100 border rounded-xl px-4 py-2"
              />
            )}
            {/* <select
              name="jenis"
              value={editForm.jenis}
              onChange={handleEditInputChange}
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              <option value="Pemasukan">KAS MASUK (PEMASUKAN)</option>
              <option value="Pengeluaran">KAS KELUAR (PENGELUARAN)</option>
            </select> */}
          </div>

          <div>
            <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Sumber Dana
              <span className="text-red-500"> *</span>
            </label>
            <input
              disabled
              value={editForm.sumber}
              className="w-full mt-1 bg-gray-100 border rounded-xl px-4 py-2"
            />
            {/* <select
              name="sumber"
              value={editForm.sumber}
              onChange={handleEditInputChange}
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              <option value="IURAN">Iuran Anggota</option>
              <option value="LAINNYA">Lainnya</option>
            </select> */}
          </div>

          {editForm.jenis === "Pemasukan" && editForm.sumber === "IURAN" && (
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Cari Anggota Dasawisma
                <span className="text-red-500"> *</span>
              </label>

              {dasawismaFound ? (
                <Select
                  value={
                    editForm.anggota_dasawisma_id
                      ? {
                          value: editForm.anggota_dasawisma_id,
                          label: editForm.namaAnggota,
                        }
                      : null
                  }
                  options={anggotaOptions}
                  placeholder="Cari nama anggota..."
                  onChange={(selectedOption) =>
                    setEditForm((prev) => ({
                      ...prev,
                      anggota_dasawisma_id: selectedOption?.value || "",
                      namaAnggota: selectedOption?.label || "",
                    }))
                  }
                  className="text-sm"
                />
              ) : (
                <input
                  disabled
                  value={editForm.namaAnggota || "Anggota tidak ditemukan"}
                  className="w-full mt-1 bg-gray-100 border rounded-xl px-4 py-2"
                />
              )}

              {errors.anggota_dasawisma_id && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.anggota_dasawisma_id}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500">Tanggal</label>
            <MantineDateInput
              name="tanggal"
              value={editForm.tanggal}
              error={errors.tanggal}
              className="mt-1"
              disabled
            />
            {errors.tanggal && (
              <p className="mt-1 text-xs text-red-500">{errors.tanggal}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Deskripsi</label>
            <input
              value={editForm.deskripsi}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  deskripsi: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-xl px-4 py-2"
            />
            {errors.deskripsi && (
              <p className="mt-1 text-xs text-red-500">{errors.deskripsi}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Nominal</label>
            <input
              value={editForm.nominal}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  nominal: formatThousands(e.target.value),
                }))
              }
              className="w-full mt-1 border rounded-xl px-4 py-2"
            />
            {errors.nominal && (
              <p className="mt-1 text-xs text-red-500">{errors.nominal}</p>
            )}
          </div>
        </div>

        <div className="border-t p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 font-bold"
          >
            Batal
          </button>

          <button
            onClick={onSave}
            className="px-5 py-2 rounded-xl bg-[#10B981] text-white font-bold"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTransactionModal;

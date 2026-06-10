import React from "react";
import Select from "react-select";
import { X } from "lucide-react";
import { formatThousands } from "../../../utils/formatThousands";
import { formatDateInput } from "../../../utils/formattedDate";

export default function ModalsEditZIS({
  isOpen,
  editForm,
  setEditForm,
  selectedMuzakki,
  setSelectedMuzakki,
  selectedMustahik,
  setSelectedMustahik,
  muzakkiOptions,
  mustahikOptions,
  searchMuzakki,
  setSearchMuzakki,
  searchMustahik,
  setSearchMustahik,
  limitedOptions,
  onClose,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-[#0F766E] p-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Detail Transaksi ZIS</h2>

          <button onClick={onClose} className="text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500">
              Jenis Transaksi
            </label>

            <input
              disabled
              value={editForm.jenis}
              className="w-full mt-1 bg-gray-100 border rounded-xl px-4 py-2"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">
              {editForm.jenis === "Pemasukan" ? "Muzakki" : "Mustahik"}
              <span className="text-red-500"> *</span>
            </label>

            {editForm.jenis === "Pemasukan" ? (
              <Select
                options={limitedOptions(muzakkiOptions, searchMuzakki)}
                placeholder="Cari muzakki..."
                onInputChange={(value) => setSearchMuzakki(value)}
                value={selectedMuzakki}
                onChange={(opt) => setSelectedMuzakki(opt)}
                isClearable
                className="text-sm"
              />
            ) : (
              <Select
                options={limitedOptions(mustahikOptions, searchMustahik)}
                placeholder="Cari mustahik..."
                onInputChange={(value) => setSearchMustahik(value)}
                value={selectedMustahik}
                onChange={(opt) => setSelectedMustahik(opt)}
                isClearable
                className="text-sm"
              />
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">
              Sumber
              <span className="text-red-500"> *</span>
            </label>

            <select
              value={editForm.sumber}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  sumber: e.target.value,
                })
              }
              className="w-full mt-1 bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              <option value="Zakat Maal">Zakat Maal</option>
              <option value="Zakat Fitrah Uang">Zakat Fitrah Uang</option>
              <option value="Zakat Fitrah Beras">Zakat Fitrah Beras</option>
              <option value="Infaq">Infaq</option>
              <option value="Sedekah">Sedekah</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">
              Tanggal
              <span className="text-red-500"> *</span>
            </label>

            <input
              type="date"
              value={formatDateInput(editForm.tanggal)}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  tanggal: e.target.value,
                })
              }
              className="w-full mt-1 border rounded-xl px-4 py-2"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">
              Deskripsi
              <span className="text-red-500"> *</span>
            </label>

            <input
              value={editForm.deskripsi}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  deskripsi: e.target.value,
                })
              }
              className="w-full mt-1 border rounded-xl px-4 py-2"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">
              Nominal
              <span className="text-red-500"> *</span>
            </label>

            <input
              value={editForm.nominal}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  nominal: formatThousands(e.target.value),
                })
              }
              className="w-full mt-1 border rounded-xl px-4 py-2"
            />
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
}

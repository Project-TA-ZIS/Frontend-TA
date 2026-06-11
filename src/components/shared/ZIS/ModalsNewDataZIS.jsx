import React, { useState } from "react";
import Select from "react-select";
import { X } from "lucide-react";
import { formatThousands } from "../../../utils/formatThousands";
import { formatDateInput } from "../../../utils/formattedDate";
import { validationDataZIS } from "../../../utils/ValidationDataZIS";

export default function ModalsNewDataZIS({
  isOpen,
  modalMode,
  formData,
  handleInputChange,
  handleSubmit,
  handleCloseModal,
  isSubmitting,
  isBeras,
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
  errors = {},
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-[#0F766E] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {modalMode === "PEMASUKAN"
              ? "Catat Pemasukan ZIS"
              : "Catat Pengeluaran ZIS"}
          </h2>

          <button
            onClick={handleCloseModal}
            className="text-emerald-200 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tanggal */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {modalMode === "PEMASUKAN"
                ? "Tanggal Penghimpunan"
                : "Tanggal Penyaluran"}
              <span className="text-red-500"> *</span>
            </label>

            <input
              type="date"
              name="tanggal"
              
              value={formatDateInput(formData.tanggal)}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
            />
            {errors.tanggal && (
              <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>
            )}
          </div>

          {/* Muzakki / Mustahik */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {modalMode === "PEMASUKAN" ? "Muzakki" : "Mustahik"}
              <span className="text-red-500"> *</span>
            </label>

            {modalMode === "PEMASUKAN" ? (
              <>
                <Select
                  options={limitedOptions(muzakkiOptions, searchMuzakki)}
                  placeholder="Cari muzakki..."
                  onInputChange={setSearchMuzakki}
                  value={selectedMuzakki}
                  onChange={setSelectedMuzakki}
                  isClearable
                />
                {errors.muzakki && (
                  <p className="text-red-500 text-xs mt-1">{errors.muzakki}</p>
                )}
              </>
            ) : (
              <>
                <Select
                  options={limitedOptions(mustahikOptions, searchMustahik)}
                  placeholder="Cari mustahik..."
                  onInputChange={setSearchMustahik}
                  value={selectedMustahik}
                  onChange={setSelectedMustahik}
                  isClearable
                />
                {errors.mustahik && (
                  <p className="text-red-500 text-xs mt-1">{errors.mustahik}</p>
                )}
              </>
            )}
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Kategori
              <span className="text-red-500"> *</span>
            </label>

            <select
              name="kategori"
              value={formData.kategori}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              <option value="Zakat Maal">Zakat Maal</option>
              <option value="Zakat Fitrah Uang">Zakat Fitrah Uang</option>
              <option value="Zakat Fitrah Beras">Zakat Fitrah Beras</option>
              <option value="Infaq">Infaq</option>
              <option value="Sedekah">Sedekah</option>
            </select>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Deskripsi
              <span className="text-red-500"> *</span>
            </label>

            <input
              type="text"
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleInputChange}
              placeholder="Masukkan deskripsi..."
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
            />
            {errors.deskripsi && (
              <p className="text-red-500 text-xs mt-1">{errors.deskripsi}</p>
            )}
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {isBeras ? "Jumlah Beras (KG)" : "Jumlah (Rp)"}
              <span className="text-red-500"> *</span>
            </label>

            <input
              type={isBeras ? "number" : "text"}
              name="nominal"
              
              value={formData.nominal}
              onChange={handleInputChange}
              placeholder={isBeras ? "Contoh: 2.5" : "0"}
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
            />
            {errors.nominal && (
              <p className="text-red-500 text-xs mt-1">{errors.nominal}</p>
            )}
          </div>

          {/* Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#10B981]"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

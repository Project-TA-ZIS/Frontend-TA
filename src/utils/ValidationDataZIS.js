export const validationDataZIS = ({
  formData,
  modalMode,
  selectedMuzakki,
  selectedMustahik,
}) => {
  const errors = {};

  if (!formData.tanggal) {
    errors.tanggal = "Tanggal wajib diisi";
  }

  if (modalMode === "PEMASUKAN" && !selectedMuzakki) {
    errors.muzakki = "Muzakki wajib dipilih";
  }

  if (modalMode === "PENGELUARAN" && !selectedMustahik) {
    errors.mustahik = "Mustahik wajib dipilih";
  }

  if (!formData.kategori?.trim()) {
    errors.kategori = "Kategori wajib dipilih";
  }

  if (!formData.deskripsi?.trim()) {
    errors.deskripsi = "Deskripsi wajib diisi";
  }

  if (!formData.nominal) {
    errors.nominal = "Nominal wajib diisi";
  } else if (Number(formData.nominal) <= 0) {
    errors.nominal = "Nominal harus lebih dari 0";
  }

  return errors;
};

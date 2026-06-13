// utils/validationKasDasawisma.js

export const validateEditKasDasawisma = (editForm) => {
  const errors = {};

  if (!editForm.tanggal) {
    errors.tanggal = "Tanggal transaksi wajib diisi";
  }

  if (!editForm.deskripsi?.trim()) {
    errors.deskripsi = "Deskripsi kegiatan wajib diisi";
  }

  if (!editForm.nominal) {
    errors.nominal = "Nominal wajib diisi";
  }

  if (
    editForm.jenis === "Pemasukan" &&
    editForm.sumber === "IURAN" &&
    !editForm.anggota_dasawisma_id
  ) {
    errors.anggota_dasawisma_id = "Silakan pilih anggota Dasawisma";
  }

  if (!editForm.nominal) {
    errors.nominal = "Nominal wajib diisi";
  } else if (Number(editForm.nominal) <= 0) {
    errors.nominal = "Nominal harus lebih dari 0";
  }

  return errors;
};

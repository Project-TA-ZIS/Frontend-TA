export const ValidationEditZIS = (editForm) => {

  const errors = {};

  if (!editForm.tanggal) {
    errors.tanggal = "Tanggal wajib diisi";
  }

  if (!editForm.deskripsi?.trim()) {
    errors.deskripsi = "Deskripsi wajib diisi";
  }

  if (!editForm.nominal) {
    errors.nominal = "Nominal wajib diisi";
  } else if (Number(editForm.nominal) <= 0) {
    errors.nominal = "Nominal harus lebih dari 0";
  }

  return errors;
};

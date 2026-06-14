export const ValidateAnggotaAmil = (formData, editingId) => {
  const errors = {};

  if (!formData.nama.trim()) {
    errors.nama = "Nama lengkap wajib diisi!";
  }

  if (!formData.email.trim()) {
    errors.email = "Alamat email wajib diisi!";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Format email tidak valid!";
  }

  if (!editingId) {
    if (!formData.password.trim()) {
      errors.password = "Password wajib diisi!";
    } else if (formData.password.length < 6) {
      errors.password = "Password minimal 6 karakter!";
    }
  }

  if (!formData.telp.trim()) {
    errors.telp = "Nomor telepon wajib diisi 10 sampai 12 karakter!";
  } else if (!/^[0-9]+$/.test(formData.telp)) {
    errors.telp = "Nomor telepon hanya boleh angka!";
  } else if (formData.telp.length < 10) {
    errors.telp = "Nomor telepon tidak valid!";
  }
  if (!formData.alamat.trim()) {
    errors.alamat = "Alamat wajib diisi!";
  }
  return errors;
};

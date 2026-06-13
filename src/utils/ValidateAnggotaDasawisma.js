export const validateAnggotaDasawisma = (formData) => {
  const errors = {};

  if (!formData.nama.trim()) errors.nama = "Nama lengkap wajib diisi!";
  if (!formData.email.trim()) {
    errors.email = "Alamat email wajib diisi!";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Format email tidak valid!";
  }
  if (!formData.telp.trim()) {
    errors.telp = "Nomor telepon wajib diisi!";
  } else if (!/^[0-9]+$/.test(formData.telp)) {
    errors.telp = "Nomor telepon hanya boleh angka!";
  }
  if (!(formData.nik || "").trim()) {
    errors.nik = "NIK wajib diisi!";
  } else if (!/^[0-9]+$/.test(formData.nik)) {
    errors.nik = "NIK hanya boleh angka!";
  } else if (formData.nik.length !== 16) {
    errors.nik = "NIK harus 16 digit!";
  }

  if (!formData.tanggal_lahir.trim()) {
    errors.tanggal_lahir = "Tanggal lahir wajib diisi!";
  }
  if (!formData.tempat_lahir.trim()) {
    errors.tempat_lahir = "Tempat lahir wajib diisi!";
  }
  if (!formData.alamat.trim()) {
    errors.alamat = "Alamat wajib diisi!";
  }
  return errors;
};

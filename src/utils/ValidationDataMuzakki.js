export const ValidationDataMuzakki = (formData) => {
  const errors = {};

  if (!(formData.nama || "").trim()) {
    errors.nama = "Nama lengkap wajib diisi!";
  }

  if (!(formData.email || "").trim()) {
    errors.email = "Alamat email wajib diisi!";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Format email tidak valid!";
  }

  if (!(formData.telp || "").trim()) {
    errors.telp = "Nomor telepon wajib diisi!";
  } else if (!/^[0-9]+$/.test(formData.telp)) {
    errors.telp = "Nomor telepon hanya boleh angka!";
  } else if (formData.telp.length < 10) {
    errors.telp = "Nomor telepon minimal 10 digit!";
  }

  if (!(formData.alamat || "").trim()) {
    errors.alamat = "Alamat wajib diisi!";
  }

  if (!(formData.nik || "").trim()) {
    errors.nik = "NIK wajib diisi!";
  } else if (!/^[0-9]+$/.test(formData.nik)) {
    errors.nik = "NIK hanya boleh angka!";
  } else if (formData.nik.length !== 16) {
    errors.nik = "NIK harus 16 digit!";
  }

  if (!(formData.tempatLahir || "").trim()) {
    errors.tempatLahir = "Tempat lahir wajib diisi!";
  }

  if (!formData.tanggalLahir) {
    errors.tanggalLahir = "Tanggal lahir wajib diisi!";
  }

  if (!(formData.statusPernikahan || "").trim()) {
    errors.statusPernikahan = "Status pernikahan wajib diisi!";
  }

  if (!(formData.pekerjaan || "").trim()) {
    errors.pekerjaan = "Pekerjaan wajib diisi!";
  }

  return errors;
};

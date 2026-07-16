export const ValidationDataMustahik = (formData) => {
  const errors = {};
  if (!(formData.nama || "").trim()) {
    errors.nama = "Nama lengkap wajib diisi!";
  }

  if (!(formData.telp || "").trim()) {
    errors.telp = "Nomor telepon wajib diisi 10 sampai 12 karakter!";
  } else if (!/^[0-9]+$/.test(formData.telp)) {
    errors.telp = "Nomor telepon hanya boleh angka!";
  } else if (formData.telp.length < 10) {
    errors.telp = "Nomor telepon tidak valid!";
  }

  if (!formData.jenisKelamin) {
    errors.jenisKelamin = "Jenis kelamin wajib dipilih!";
  }

  if (!formData.alamat || !formData.alamat.trim()) {
    errors.alamat = "Alamat wajib diisi!";
  }

  if (!formData.kategori) {
    errors.kategori = "Kategori wajib dipilih!";
  }

  if (!(formData.statusPernikahan || "").trim()) {
    errors.statusPernikahan = "Status pernikahan wajib dipilih!";
  }

  if (!(formData.statusPekerjaan || "").trim()) {
    errors.statusPekerjaan = "Status pekerjaan wajib dipilih!";
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
  } else if (isNaN(Date.parse(formData.tanggalLahir))) {
    errors.tanggalLahir = "Tanggal lahir tidak valid!";
  }

  // Pekerjaan & penghasilan hanya ditanyakan pada mustahik dengan status tetap.
  if (formData.statusPekerjaan === "tetap") {
    if (!(formData.pekerjaan || "").trim()) {
      errors.pekerjaan = "Pekerjaan wajib diisi!";
    }
    if (!formData.penghasilan) {
      errors.penghasilan = "Penghasilan wajib dipilih!";
    }
  }
  return errors;
};

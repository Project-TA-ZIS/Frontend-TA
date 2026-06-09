// src/utils/exportZISPdf.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import { formatRupiah } from "./formatRupiah";
import { formattedDate } from "./formattedDate";
import LogoDasawismaPNG from "../assets/Logo.png";

// Membuat & mengunduh laporan riwayat ZIS dalam format PDF.
// Alur: tampilkan dialog konfirmasi → jika setuju, susun PDF (header berlogo,
// tabel transaksi, lalu tabel ringkasan total) → simpan file.
// Parameter historyData = daftar transaksi ZIS yang akan dicetak.
export const exportZISPdf = ({ historyData = [] }) => {
  // Tampilkan dialog konfirmasi sebelum mengunduh.
  Swal.fire({
    title: "Unduh Riwayat ZIS",
    text: "Apakah Anda ingin mengunduh riwayat ZIS dalam format PDF?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, Unduh PDF",
    cancelButtonText: "Batal",
    confirmButtonColor: "#10B981",
  }).then((result) => {
    // Hanya lanjut membuat PDF jika user menekan "Ya, Unduh PDF".
    if (result.isConfirmed) {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // HEADER
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(15, 118, 110);
      doc.text("DASAWISMA", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text("LENTENG AGUNG", 14, 27);

      // Logo
      const logoWidth = 80;
      const logoHeight = 25;

      doc.addImage(
        LogoDasawismaPNG,
        "PNG",
        pageWidth - logoWidth,
        10,
        logoWidth,
        logoHeight,
      );

      // Garis
      doc.setDrawColor(220);
      doc.line(20, 36, pageWidth - 14, 36);

      // Tanggal
      doc.setFontSize(10);
      doc.setTextColor(120);

      doc.text(
        `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`,
        20,
        43,
      );

      // TABLE
      autoTable(doc, {
        startY: 50,
        head: [
          ["No", "Tanggal", "Nama", "Kategori", "Deskripsi", "Tipe", "Jumlah"],
        ],
        body: historyData.map((tx, index) => [
          index + 1,
          formattedDate(tx.tanggal),
          tx.nama || "-",
          tx.kategori || "-",
          tx.deskripsi || "-",
          tx.tipe || "-",
          tx.kategori?.toLowerCase() === "zakat fitrah beras"
            ? `${tx.nominal} KG`
            : formatRupiah(tx.nominal),
        ]),
        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [16, 185, 129],
        },
      });

      // ================= TOTAL =================
      // Hitung ringkasan total. Uang dan zakat fitrah beras (satuan KG)
      // dipisah agar tidak tercampur dalam satu penjumlahan.

      // Total pemasukan dalam bentuk uang (selain zakat fitrah beras).
      const totalPemasukanUang = historyData
        .filter(
          (item) =>
            item.tipe?.toLowerCase() === "pemasukan" &&
            item.kategori?.toLowerCase() !== "zakat fitrah beras",
        )
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

      const totalPengeluaranUang = historyData
        .filter(
          (item) =>
            item.tipe?.toLowerCase() === "pengeluaran" &&
            item.kategori?.toLowerCase() !== "zakat fitrah beras",
        )
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

      const totalPemasukanBeras = historyData
        .filter(
          (item) =>
            item.tipe?.toLowerCase() === "pemasukan" &&
            item.kategori?.toLowerCase() === "zakat fitrah beras",
        )
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

      const totalPengeluaranBeras = historyData
        .filter(
          (item) =>
            item.tipe?.toLowerCase() === "pengeluaran" &&
            item.kategori?.toLowerCase() === "zakat fitrah beras",
        )
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

      const finalY = doc.lastAutoTable.finalY + 12;

      // JUDUL
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 118, 110);

      doc.text("Ringkasan Total ZIS", 14, finalY);

      // TABLE TOTAL
      autoTable(doc, {
        startY: finalY + 5,
        head: [["Keterangan", "Total"]],
        body: [
          ["Total Pemasukan Uang ZIS", formatRupiah(totalPemasukanUang)],
          ["Total Pengeluaran Uang ZIS", formatRupiah(totalPengeluaranUang)],
          ["Total Pemasukan Zakat Fitrah Beras", `${totalPemasukanBeras} KG`],
          [
            "Total Pengeluaran Zakat Fitrah Beras",
            `${totalPengeluaranBeras} KG`,
          ],
        ],
        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [15, 118, 110],
          halign: "center", // HEADER TENGAH
          valign: "middle",
          fontStyle: "bold",
        },
        columnStyles: {
          0: {
            halign: "center",
          },
          1: {
            halign: "center",
          },
        },
        theme: "grid",
      });

      doc.save(`riwayat-zis-${Date.now()}.pdf`);
    }
  });
};

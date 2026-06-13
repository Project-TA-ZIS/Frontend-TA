// src/utils/exportZISPdf.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import { formatRupiah } from "./formatRupiah";
import { formattedDate } from "./formattedDate";
import LogoDasawismaPNG from "../assets/Logo.png";

// Membuat & mengunduh laporan riwayat kas Dasawisma dalam format PDF.
// Alur: dialog konfirmasi → susun PDF (header, tabel transaksi, ringkasan total)
// → simpan file.
// - historyData      : daftar transaksi kas yang dicetak.
// - totalKasDaswisma : saldo total kas saat ini (ditampilkan di ringkasan).
export const exportKasDasawismaPdf = ({
  historyData = [],
  totalKasDaswisma,
}) => {
  if (historyData.length === 0) {
    Swal.fire({
      title: "Tidak Ada Data",
      text: "Riwayat kas kosong, tidak ada data untuk diunduh!",
      icon: "info",
      confirmButtonText: "OK",
      confirmButtonColor: "#10B981",
    });
    return;
  }
  
  // Tampilkan dialog konfirmasi sebelum mengunduh.
  Swal.fire({
    title: "Unduh Riwayat Kas",
    text: "Apakah Anda ingin mengunduh riwayat kas dalam format PDF?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, Unduh PDF",
    cancelButtonText: "Batal",
    confirmButtonColor: "#10B981",
  }).then((result) => {
    if (result.isConfirmed) {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // ================= HEADER =================

      // Tulisan kiri
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(15, 118, 110);
      doc.text("DASAWISMA", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text("LENTENG AGUNG", 14, 27);

      // Logo kanan
      const logoWidth = 80;
      const logoHeight = 25;

      doc.addImage(
        LogoDasawismaPNG,
        "PNG",
        pageWidth - logoWidth, // posisi kanan
        10,
        logoWidth,
        logoHeight,
      );

      // Garis bawah
      doc.setDrawColor(220);
      doc.line(20, 36, pageWidth - 14, 36);

      // tanggal cetak
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(120);

      doc.text(
        `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`,
        20,
        43,
      );

      autoTable(doc, {
        startY: 50,
        head: [
          [
            "No",
            "Tanggal",
            "Anggota",
            "Sumber",
            "Deskripsi",
            "Tipe",
            "Nominal",
          ],
        ],
        body: historyData.map((tx, index) => [
          index + 1,
          formattedDate(tx.tanggal),
          tx.namaAnggota || "-",
          tx.sumber || "-",
          tx.deskripsi || "-",
          tx.jenis || "-",
          formatRupiah(tx.nominal),
        ]),
        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [16, 185, 129], // emerald
        },
      });

      // Jumlahkan seluruh transaksi bertipe "Pemasukan".
      const totalPemasukan = historyData
        .filter((item) => item.jenis === "Pemasukan")
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

      // Jumlahkan seluruh transaksi bertipe "Pengeluaran".
      const totalPengeluaran = historyData
        .filter((item) => item.jenis === "Pengeluaran")
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

      // ================= TOTAL =================

      const finalY = doc.lastAutoTable.finalY + 12;

      // JUDUL
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 118, 110);

      doc.text("Ringkasan Total Kas Dasawisma", 14, finalY);

      // TABLE TOTAL
      autoTable(doc, {
        startY: finalY + 5,

        head: [["Keterangan", "Total"]],

        body: [
          ["Total Pemasukan Kas", formatRupiah(totalPemasukan)],
          ["Total Pengeluaran Kas", formatRupiah(totalPengeluaran)],
          ["Total Kas Dasawisma", formatRupiah(totalKasDaswisma)],
        ],

        styles: {
          fontSize: 9,
          valign: "middle",
        },

        headStyles: {
          fillColor: [15, 118, 110],
          halign: "center",
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

      // Save
      doc.save(`riwayat-kas-dasawisma-${Date.now()}.pdf`);
    }
  });
};

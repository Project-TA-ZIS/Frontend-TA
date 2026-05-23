// src/utils/exportZISPdf.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import { formatRupiah } from "./formatRupiah";
import { formattedDate } from "./formattedDate";
import LogoDasawismaPNG from "../assets/Logo.png";

export const exportKasDasawismaPdf = ({ historyData = [] }) => {
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

      const totalPemasukan = historyData
        .filter((item) => item.jenis === "Pemasukan")
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

      const totalPengeluaran = historyData
        .filter((item) => item.jenis === "Pengeluaran")
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0);

      const totalKas = totalPemasukan - totalPengeluaran;

      // TOTAL KAS SAAT INI
      const totalKasDasawisma = totalPemasukan - totalPengeluaran;

      const finalY = doc.lastAutoTable.finalY + 10;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);

      doc.text(`Total Pemasukan: ${formatRupiah(totalPemasukan)}`, 14, finalY);

      doc.text(
        `Total Pengeluaran: ${formatRupiah(totalPengeluaran)}`,
        14,
        finalY + 7,
      );

      doc.text(
        `Total Kas Dasawisma: ${formatRupiah(totalKasDasawisma)}`,
        14,
        finalY + 14,
      );

      // Save
      doc.save(`riwayat-kas-dasawisma-${Date.now()}.pdf`);
    }
  });
};

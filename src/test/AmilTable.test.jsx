import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AmilTable from "../components/shared/ZIS/AmilTable";

const dataContoh = [
  {
    id: "1",
    nama: "Budi Santoso",
    email: "budi@contoh.com",
    telp: "081234567890",
    alamat: "Bandung",
  },
];

describe("AmilTable", () => {
  it("menampilkan data amil di dalam tabel", () => {
    render(<AmilTable data={dataContoh} />);

    // cek teks dari data benar-benar muncul di layar
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.getByText("budi@contoh.com")).toBeInTheDocument();
  });

  it("menampilkan pesan kosong jika tidak ada data", () => {
    render(<AmilTable data={[]} />);
    expect(screen.getByText(/Belum ada data anggota amil/i)).toBeInTheDocument();
  });

  it("memanggil onEdit dengan data baris saat tombol Edit diklik", async () => {
    const onEdit = vi.fn(); // fungsi tiruan untuk memantau apakah dipanggil
    const user = userEvent.setup();

    render(<AmilTable data={dataContoh} onEdit={onEdit} />);

    await user.click(screen.getByTitle("Edit"));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(dataContoh[0]);
  });

  it("memanggil onDelete dengan id saat tombol Hapus diklik", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(<AmilTable data={dataContoh} onDelete={onDelete} />);

    await user.click(screen.getByTitle("Hapus"));

    expect(onDelete).toHaveBeenCalledWith("1");
  });
});

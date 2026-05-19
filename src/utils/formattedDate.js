export const formattedDate = (tanggal) => {
  if (!tanggal) return "-";

  const date = new Date(tanggal);

  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const formatDateInput = (tanggal) => {
  if (!tanggal) return "";

  const date = new Date(tanggal);
  if (isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0];
};
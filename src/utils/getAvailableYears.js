export const getAvailableYears = (data, dateField = "tanggal") => {
  return [
    ...new Set(
      data
        .filter((item) => item[dateField])
        .map((item) => new Date(item[dateField]).getFullYear()),
    ),
  ].sort((a, b) => b - a);
};

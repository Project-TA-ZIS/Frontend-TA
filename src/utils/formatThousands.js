export const formatThousands = (value) => {
  const digitsOnly = String(value ?? "").replace(/[^0-9]/g, "");
  if (!digitsOnly) return "";

  // Keep single zero if user inputs all zeros
  const normalized = digitsOnly.replace(/^0+(?=\d)/, "");

  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const parseThousandsToNumber = (value) => {
  const digitsOnly = String(value ?? "").replace(/[^0-9]/g, "");
  if (!digitsOnly) return 0;
  return Number(digitsOnly);
};

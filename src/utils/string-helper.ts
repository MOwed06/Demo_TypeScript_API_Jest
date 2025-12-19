export const isNullOrEmpty = (str: string | null | undefined): boolean => {
  return str === null || str === undefined || str.trim() === "";
};

export const toUSD = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

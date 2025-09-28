// Formatting utilities

export const formatDollarAmount = (amount: number, options?: Intl.NumberFormatOptions) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount)
}
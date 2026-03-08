export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function amountToRazorpay(amount: number): number {
  return Math.round(amount * 100);
}

export function razorpayToAmount(paise: number): number {
  return paise / 100;
}

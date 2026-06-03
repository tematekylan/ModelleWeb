export const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE ?? "0.25");

export function calculateCommission(amount: number) {
  const commission = amount * COMMISSION_RATE;
  const netAmount = amount - commission;
  return {
    commission: Math.round(commission * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
  };
}

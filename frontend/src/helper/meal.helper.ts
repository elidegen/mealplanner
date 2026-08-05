export function extractAmountUnit(
  amount: string,
): { value: number; unit: string } | null {
  const match = amount.trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return null;

  const [, numberPart, unitPart] = match;
  return {
    value: Number(numberPart.replace(",", ".")),
    unit: unitPart.trim(),
  };
}

/**
 * Format an integer paise value or a rupee value into Indian Rupee format.
 * @param paiseOrRupees Value in either minor units (paise) or rupees
 * @param isPaise Whether the input is in paise (100 paise = 1 INR)
 */
export function money(paiseOrRupees: number, isPaise = false): string {
  const rupees = isPaise ? Math.round(paiseOrRupees / 100) : paiseOrRupees;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

/**
 * Format date string into human readable localized format
 */
export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

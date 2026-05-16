/**
 * Generates a unique, readable SKU for a product.
 * Format: NAME-QTY-RANDOM
 * Example: BAD-500G-X1Y2
 */
export const generateSKU = (name, quantity) => {
  // 1. Get first 3-5 chars of name, uppercase, remove spaces/special chars
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 5);

  // 2. Format quantity (remove spaces, uppercase)
  const qty = quantity
    .toUpperCase()
    .replace(/\s+/g, '');

  // 3. Generate a short unique suffix (4 chars)
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prefix}-${qty}-${suffix}`;
};

/**
 * CNPJ validation and formatting utilities.
 * Implements modulo 11 algorithm for CNPJ validation.
 */

export function normalizeCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

export function formatCnpj(cnpj: string): string {
  const clean = normalizeCnpj(cnpj);
  if (clean.length !== 14) return cnpj;
  return clean.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

export function isValidCnpj(cnpj: string): boolean {
  const clean = normalizeCnpj(cnpj);

  if (clean.length !== 14) return false;

  // Check for all same digits (invalid)
  if (/^(\d)\1+$/.test(clean)) return false;

  // Calculate first verification digit
  let sum = 0;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i], 10) * weights1[i];
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;

  if (digit1 !== parseInt(clean[12], 10)) return false;

  // Calculate second verification digit
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(clean[i], 10) * weights2[i];
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;

  return digit2 === parseInt(clean[13], 10);
}

export function maskCnpj(cnpj: string): string {
  const clean = normalizeCnpj(cnpj);
  if (clean.length !== 14) return cnpj;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '**.$2.$3/$4-**');
}
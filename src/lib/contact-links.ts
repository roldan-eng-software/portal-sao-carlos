/** Converte números de contato em links clicáveis (tel:/wa.me). */

export function whatsappLink(number: string): string | null {
  const digits = number.replace(/\D/g, '');
  return digits.length >= 10 ? `https://wa.me/${digits}` : null;
}

export function phoneLink(number: string): string | null {
  const digits = number.replace(/\D/g, '');
  return digits.length >= 8 ? `tel:+55${digits.startsWith('55') ? digits.slice(2) : digits}` : null;
}

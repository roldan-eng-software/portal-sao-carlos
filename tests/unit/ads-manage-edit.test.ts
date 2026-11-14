import { describe, expect, it } from 'vitest';
import { sanitizeAdEdit } from '@/modules/ads/manage';

describe('sanitizeAdEdit (edição de anúncio publicado)', () => {
  it('ignora campos fora da lista editável, como kind e cnpj', () => {
    const { values, errors } = sanitizeAdEdit({
      businessName: 'Padaria Central',
      kind: 'anuncio-patrocinado',
      cnpj: '00.000.000/0001-00',
    } as never);
    expect(errors).toEqual([]);
    expect(values).toEqual({ business_name: 'Padaria Central' });
  });

  it('recusa nome do comércio vazio', () => {
    const { errors } = sanitizeAdEdit({ businessName: '   ' });
    expect(errors).toContain('Nome do comércio é obrigatório.');
  });

  it('limpa campo opcional quando enviado vazio, sem alterar os demais', () => {
    const { values, errors } = sanitizeAdEdit({ hours: '', neighborhood: 'Centro' });
    expect(errors).toEqual([]);
    expect(values).toEqual({ hours: null, neighborhood: 'Centro' });
  });
});

import { describe, expect, it } from 'vitest';
import {
  isDuplicateTitle,
  matchesFilterTerms,
  normalizeTitleKey,
} from '@/modules/news/adapter';

describe('normalizeTitleKey', () => {
  it('remove acentos, caixa e pontuação', () => {
    expect(normalizeTitleKey('Chuva forte atinge São Carlos!')).toBe(
      'chuva forte atinge sao carlos',
    );
    expect(normalizeTitleKey('CHUVA forte atinge São Carlos')).toBe(
      'chuva forte atinge sao carlos',
    );
  });

  it('colapsa espaços repetidos', () => {
    expect(normalizeTitleKey('  Prefeitura   anuncia  obras  ')).toBe('prefeitura anuncia obras');
  });
});

describe('isDuplicateTitle', () => {
  const base = 'chuva forte atinge sao carlos e regiao nesta madrugada';

  it('iguais são duplicata', () => {
    expect(isDuplicateTitle(base, base)).toBe(true);
  });

  it('chaves normalizadas de títulos idênticos com caixa/acentos diferentes', () => {
    const a = normalizeTitleKey('Tusca 2026 começa nesta sexta-feira');
    const b = normalizeTitleKey('TUSCA 2026 COMEÇA NESTA SEXTA-FEIRA');
    expect(isDuplicateTitle(a, b)).toBe(true);
  });

  it('cobre o sufixo de saída do Google News ("título - G1")', () => {
    const direto = normalizeTitleKey('Obra na Rua Duque fecha acesso até sexta');
    const agregador = normalizeTitleKey('Obra na Rua Duque fecha acesso até sexta - G1');
    expect(isDuplicateTitle(direto, agregador)).toBe(true);
  });

  it('títulos diferentes não são duplicata', () => {
    const a = normalizeTitleKey('Obra na Rua Duque fecha acesso até sexta');
    const b = normalizeTitleKey('Prefeitura abre consulta pública sobre reajuste');
    expect(isDuplicateTitle(a, b)).toBe(false);
  });

  it('prefixo curto demais não conta como duplicata (evita falso positivo)', () => {
    expect(isDuplicateTitle('chuva', 'chuva forte atinge sao carlos hoje')).toBe(false);
  });
});

describe('matchesFilterTerms', () => {
  it('sem termos, tudo passa', () => {
    expect(matchesFilterTerms('Qualquer título', undefined)).toBe(true);
    expect(matchesFilterTerms('Qualquer título', [])).toBe(true);
  });

  it('case-insensitive: aceita termo com e sem acento na caixa', () => {
    expect(matchesFilterTerms('Resultado em São Carlos', ['São Carlos'])).toBe(true);
    expect(matchesFilterTerms('resultado em SÃO CARLOS', ['são carlos'])).toBe(true);
  });

  it('rejeita título sem a terma', () => {
    expect(matchesFilterTerms('Festival em Araraquara', ['São Carlos'])).toBe(false);
  });
});

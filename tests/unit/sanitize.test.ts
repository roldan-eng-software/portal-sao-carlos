import { describe, expect, it } from 'vitest';
import { isSafeHttpUrl, sanitizeToLength, stripHtml } from '@/lib/sanitize';

describe('stripHtml', () => {
  it('remove tags HTML comuns sem deixar espaços órfãos', () => {
    expect(stripHtml('<p>Olá, <strong>São Carlos</strong>!</p>')).toBe('Olá, São Carlos!');
  });

  it('remove blocos script e style por completo', () => {
    expect(stripHtml('Notícia<script>alert("xss")</script> e <style>.a{}</style> fim')).toBe(
      'Notícia e fim',
    );
  });

  it('decodifica entidades nomeadas e numéricas', () => {
    expect(stripHtml('A &amp; B &lt;C&gt; &#65; &#x42;')).toBe('A & B <C> A B');
  });

  it('retorna vazio para entradas não-string ou vazias', () => {
    expect(stripHtml(undefined)).toBe('');
    expect(stripHtml(null)).toBe('');
    expect(stripHtml('')).toBe('');
  });

  it('colapsa espaços e quebras de linha', () => {
    expect(stripHtml('  linha um\n\n  linha dois  ')).toBe('linha um linha dois');
  });
});

describe('sanitizeToLength', () => {
  it('trunca no limite e adiciona reticências', () => {
    const result = sanitizeToLength('x'.repeat(50), 10);
    expect(result.length).toBe(10);
    expect(result.endsWith('…')).toBe(true);
  });

  it('não altera texto dentro do limite', () => {
    expect(sanitizeToLength('curto', 200)).toBe('curto');
  });
});

describe('isSafeHttpUrl', () => {
  it('aceita http e https', () => {
    expect(isSafeHttpUrl('https://exemplo.com.br/a')).toBe(true);
    expect(isSafeHttpUrl('http://exemplo.com')).toBe(true);
  });

  it('rejeita javascript, data e outros protocolos', () => {
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('data:text/html,<b>x</b>')).toBe(false);
    expect(isSafeHttpUrl('ftp://x.com')).toBe(false);
  });

  it('rejeita strings vazias e não-strings', () => {
    expect(isSafeHttpUrl('')).toBe(false);
    expect(isSafeHttpUrl(null)).toBe(false);
    expect(isSafeHttpUrl(42)).toBe(false);
  });
});

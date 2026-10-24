import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  CONTACT_CATEGORIES,
  CONTACT_CATEGORY_LABELS,
  isValidContact,
  loadContacts,
  type ContactItem,
} from '@/modules/contacts/loader';
import UtilidadePublicaPage, {
  metadata as utilidadeMetadata,
} from '@/app/utilidade-publica/page';
import TelefonesUteisPage, {
  metadata as telefonesMetadata,
} from '@/app/utilidade-publica/telefones-uteis/page';
import {
  metadata as previsaoMetadata,
  default as PrevisaoPage,
} from '@/app/previsao-do-tempo/sao-carlos/page';
import sitemap from '@/app/sitemap';

/**
 * Utilidade pública — Spec 05 do PRD de SEO local.
 * Regra central: nenhum número inventado; todo item carrega officialUrl de
 * fonte oficial verificável e categorias vazias não são renderizadas.
 */

vi.mock('@/modules/weather/adapter', () => ({ getWeather: vi.fn() }));
import { getWeather } from '@/modules/weather/adapter';
import type { ModuleResult } from '@/lib/module-result';
import type { WeatherData } from '@/modules/weather/types';

describe('contacts.json (dados curados)', () => {
  const result = loadContacts();

  it('carrega todos os itens válidos', () => {
    expect(result.status).toBe('ok');
    expect((result.data ?? []).length).toBeGreaterThanOrEqual(4);
  });

  it('todo item tem officialUrl de fonte http(s) — nada sem fonte verificável', () => {
    for (const item of result.data ?? []) {
      expect(item.officialUrl, `item ${item.id} sem officialUrl`).toBeTruthy();
      expect(item.officialUrl).toMatch(/^https:\/\//);
    }
  });

  it('todo item tem categoria válida de CONTACT_CATEGORIES', () => {
    for (const item of result.data ?? []) {
      expect(CONTACT_CATEGORIES).toContain(item.category);
    }
  });

  it('no máximo 4 itens marcados com homeSection (grade fixa da home)', () => {
    const homeItems = (result.data ?? []).filter((item) => item.homeSection);
    expect(homeItems.length).toBeGreaterThan(0);
    expect(homeItems.length).toBeLessThanOrEqual(4);
  });

  it('todas as categorias têm rótulo pt-BR', () => {
    for (const category of CONTACT_CATEGORIES) {
      expect(CONTACT_CATEGORY_LABELS[category]).toBeTruthy();
    }
  });

  it('isValidContact rejeita item sem categoria', () => {
    const result = loadContacts();
    const valid = (result.data ?? [])[0] as ContactItem;
    const withoutCategory: Record<string, unknown> = { ...valid };
    delete withoutCategory.category;
    expect(isValidContact(withoutCategory)).toBe(false);
  });
});

describe('/utilidade-publica', () => {
  it('tem H1 único, canonical e emergências como links tel:', () => {
    const { container } = render(<UtilidadePublicaPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(utilidadeMetadata.alternates?.canonical).toBe('/utilidade-publica');

    const emergencyLinks = container.querySelectorAll('a[href^="tel:"]');
    expect(emergencyLinks.length).toBeGreaterThanOrEqual(3);
  });

  it('links externos têm rel=noopener noreferrer', () => {
    const { container } = render(<UtilidadePublicaPage />);
    const external = container.querySelectorAll('a[target="_blank"]');
    expect(external.length).toBeGreaterThan(0);
    for (const link of external) {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});

describe('/utilidade-publica/telefones-uteis', () => {
  it('tem H1 único, canonical e breadcrumb de dois níveis', () => {
    render(<TelefonesUteisPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(telefonesMetadata.alternates?.canonical).toBe('/utilidade-publica/telefones-uteis');
    expect(screen.getByRole('link', { name: 'Utilidade pública' })).toBeTruthy();
  });

  it('exibe todos os itens do contacts.json com link de fonte oficial', () => {
    const { container } = render(<TelefonesUteisPage />);
    const items = loadContacts().data ?? [];
    for (const item of items) {
      expect(screen.getByRole('heading', { level: 3, name: item.name })).toBeTruthy();
    }
    const fonteLinks = screen.getAllByRole('link', { name: /Fonte oficial/ });
    expect(fonteLinks.length).toBe(items.length);
    for (const link of fonteLinks) {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(container.querySelector('script[type="application/ld+json"]')).toBeTruthy();
  });

  it('não renderiza categorias vazias (transporte, por exemplo)', () => {
    render(<TelefonesUteisPage />);
    expect(screen.queryByRole('heading', { name: 'Transporte' })).toBeNull();
  });

  it('rótulo de fonte do rodapé linka para /avisos/saae', () => {
    render(<TelefonesUteisPage />);
    expect(screen.getByRole('link', { name: /listagem de avisos do SAAE/ })).toBeTruthy();
  });
});

describe('/previsao-do-tempo/sao-carlos', () => {
  const weatherFixture: WeatherData = {
    city: 'São Carlos',
    temperatureC: 27.4,
    weatherCode: 1,
    conditionText: 'Parcialmente nublado',
    windKmh: 12,
    humidityPercent: 55,
    daily: [
      {
        date: '2026-10-25',
        minC: 17,
        maxC: 29,
        weatherCode: 0,
        conditionText: 'Céu limpo',
      },
    ],
  } as WeatherData;

  function okWeather(): ModuleResult<WeatherData> {
    return {
      status: 'ok',
      data: weatherFixture,
      lastUpdated: '2026-10-24T12:00:00.000Z',
      errorMessage: null,
      sourceName: 'Open-Meteo',
    };
  }

  it('tem H1 único, canonical e reutiliza o estado honesto do módulo de clima', async () => {
    vi.mocked(getWeather).mockResolvedValue(okWeather());
    render(await PrevisaoPage());

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(previsaoMetadata.alternates?.canonical).toBe('/previsao-do-tempo/sao-carlos');
    expect(screen.getByRole('heading', { level: 2, name: /Previsão do Tempo/ })).toBeTruthy();
    expect(screen.getByText('27.4°C')).toBeTruthy();
  });

  it('em estado de error exibe apenas a mensagem honesta (sem dado velho)', async () => {
    vi.mocked(getWeather).mockResolvedValue({
      status: 'error',
      data: null,
      lastUpdated: null,
      errorMessage: 'Dados indisponíveis no momento.',
      sourceName: 'Open-Meteo',
    });
    render(await PrevisaoPage());

    expect(screen.getByText('Dados indisponíveis no momento.')).toBeTruthy();
  });
});

describe('sitemap com utilidade pública', () => {
  const urls = sitemap().map((entry) => new URL(entry.url).pathname);

  it('inclui /utilidade-publica, telefones úteis e previsão do tempo', () => {
    expect(urls).toContain('/utilidade-publica');
    expect(urls).toContain('/utilidade-publica/telefones-uteis');
    expect(urls).toContain('/previsao-do-tempo/sao-carlos');
  });
});

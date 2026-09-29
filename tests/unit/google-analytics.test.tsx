import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { GA_MEASUREMENT_ID, GoogleAnalytics } from '@/components/analytics/google-analytics';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('GoogleAnalytics (GA4)', () => {
  it('não renderiza nada fora de produção (dev local e previews)', () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    const { container } = render(<GoogleAnalytics />);
    expect(container).toBeEmptyDOMElement();

    vi.stubEnv('VERCEL_ENV', undefined as unknown as string);
    const local = render(<GoogleAnalytics />);
    expect(local.container).toBeEmptyDOMElement();
  });

  it('renderiza o script do GA4 em VERCEL_ENV=production', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    render(<GoogleAnalytics />);
    const scripts = document.querySelectorAll('script');
    const hasGtag = Array.from(scripts).some((s) =>
      (s.getAttribute('src') ?? s.textContent ?? '').includes(GA_MEASUREMENT_ID),
    );
    expect(hasGtag).toBe(true);
  });

  it('usa o ID de medição G-063LGPHV93', () => {
    expect(GA_MEASUREMENT_ID).toBe('G-063LGPHV93');
  });
});

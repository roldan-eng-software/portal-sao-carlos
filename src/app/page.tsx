import { WeatherSection } from '@/components/sections/weather-section';
import { NewsSection } from '@/components/sections/news-section';
import { NoticesSection } from '@/components/sections/notices-section';
import { ContactsSection } from '@/components/sections/contacts-section';
import { AdsSection } from '@/components/sections/ads-section';
import { PromoSection } from '@/components/sections/promo-section';
import { JsonLd } from '@/components/seo/json-ld';
import { errorResult, type ModuleResult } from '@/lib/module-result';
import { getWeather } from '@/modules/weather/adapter';
import type { WeatherData } from '@/modules/weather/types';
import { getNews } from '@/modules/news/adapter';
import type { NewsItem } from '@/modules/news/types';
import { loadNotices, type Notice } from '@/modules/notices/loader';
import { loadContacts, type ContactItem } from '@/modules/contacts/loader';
import { loadAds, type Ad } from '@/modules/ads/loader';
import { loadPromo, type Promo } from '@/modules/promo/loader';

/** Revalidação ≈ 15 min: nenhuma fonte é consultada a cada visita (performance). */
export const revalidate = 900;

function settle<T>(
  result: PromiseSettledResult<ModuleResult<T>>,
  fallback: ModuleResult<T>,
): ModuleResult<T> {
  return result.status === 'fulfilled' ? result.value : fallback;
}

export default async function Home() {
  const [weatherRaw, newsRaw, noticesRaw, contactsRaw, adsRaw, promoRaw] =
    await Promise.allSettled([
      getWeather(),
      getNews(),
      loadNotices(),
      loadContacts(),
      loadAds(),
      loadPromo(),
    ]);

  const weather = settle<WeatherData>(weatherRaw, errorResult('Open-Meteo'));
  const news = settle<NewsItem[]>(newsRaw, errorResult('Notícias externas'));
  const notices = settle<Notice[]>(noticesRaw, errorResult('Informativos do portal'));
  const contacts = settle<ContactItem[]>(contactsRaw, errorResult('Contatos úteis do portal'));
  const ads = settle<Ad[]>(adsRaw, errorResult('Anúncios do portal'));
  const promo = settle<Promo[]>(promoRaw, errorResult('Divulgações do portal'));

  return (
    <div className="space-y-10">
      <JsonLd />
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Informações úteis de São Carlos/SP
        </h1>
        <p className="mt-1 text-slate-600">
          Clima, notícias, informativos e contatos para moradores e comerciantes — portal
          independente de utilidade pública.
        </p>
      </div>

      {/* Ordem de prioridade: conteúdo público antes de publicidade (FR-009/SC-001) */}
      <WeatherSection result={weather} />
      <NewsSection result={news} />
      <NoticesSection result={notices} />
      <ContactsSection result={contacts} />
      <AdsSection result={ads} />
      <PromoSection result={promo} />
    </div>
  );
}

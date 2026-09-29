import Script from 'next/script';

/**
 * Google Analytics 4 (gtag.js).
 *
 * - Carregamento adiado pós-hidratação (`strategy="afterInteractive"`):
 *   analytics não participa do bundle inicial nem bloqueia interação
 *   (regra bundle-defer-third-party da skill vercel-react-best-practices).
 * - Somente em produção na Vercel: dev local e deploys de preview não
 *   poluem a métrica (VERCEL_ENV é 'production' apenas no deploy principal).
 * - O ID de medição (G-…) é público por design — aparece no HTML de todo
 *   site que usa GA; não é credencial (gate 9 refere-se a segredos).
 */
export const GA_MEASUREMENT_ID = 'G-063LGPHV93';

export function GoogleAnalytics() {
  if (process.env.VERCEL_ENV !== 'production') return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}

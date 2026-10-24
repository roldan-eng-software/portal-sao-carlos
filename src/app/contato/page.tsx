import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import { env } from '@/config/env';
import { whatsappLink, phoneLink } from '@/lib/contact-links';

export const metadata: Metadata = {
  title: 'Contato',
  description:
    'Fale com o responsável pelo Portal São Carlos/SP: WhatsApp, telefone e e-mail. Canais para dúvidas, correções de conteúdo e anúncios no guia comercial.',
  alternates: { canonical: '/contato' },
};

/**
 * Página de contato sem formulário (decisão fechada no PRD — Spec 03):
 * apenas canais diretos. Canais não configurados no ambiente simplesmente
 * não são exibidos (sem link quebrado).
 */
export default function ContatoPage() {
  const wa = env.contactWhatsapp ? whatsappLink(env.contactWhatsapp) : null;
  const tel = env.contactPhone ? phoneLink(env.contactPhone) : null;

  return (
    <article className="mx-auto my-10 w-[calc(100%-2rem)] max-w-3xl space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card sm:p-8">
      <Breadcrumbs items={[{ name: 'Contato', href: '/contato' }]} />

      <header>
        <h1 className="font-display text-headline-lg text-primary">Fale com o Portal São Carlos</h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Dúvidas, sugestões, pedidos de correção ou remoção de conteúdo, e informações sobre
          anúncios: escolha o canal abaixo. Atendemos em português, de São Carlos/SP.
        </p>
      </header>

      <section aria-labelledby="contato-canais" className="space-y-3">
        <h2 id="contato-canais" className="font-display text-headline-md text-primary">
          Canais diretos
        </h2>

        <ul className="space-y-3">
          {wa && (
            <li className="rounded-xl border border-border-subtle bg-surface-bright p-4">
              <span className="block text-label-sm uppercase tracking-wide text-outline">
                WhatsApp
              </span>
              <a
                href={`${wa}?text=${encodeURIComponent('Olá, entrou em contato pelo Portal São Carlos.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-lg font-semibold text-secondary hover:underline"
              >
                Conversar pelo WhatsApp
              </a>
            </li>
          )}
          {tel && (
            <li className="rounded-xl border border-border-subtle bg-surface-bright p-4">
              <span className="block text-label-sm uppercase tracking-wide text-outline">
                Telefone
              </span>
              <a href={tel} className="text-body-lg font-semibold text-secondary hover:underline">
                {env.contactPhone}
              </a>
            </li>
          )}
          <li className="rounded-xl border border-border-subtle bg-surface-bright p-4">
            <span className="block text-label-sm uppercase tracking-wide text-outline">E-mail</span>
            <a
              href={`mailto:${env.contactEmail}`}
              className="text-body-lg font-semibold text-secondary hover:underline"
            >
              {env.contactEmail}
            </a>
          </li>
        </ul>
      </section>

      <section aria-labelledby="contato-anunciar" className="space-y-2">
        <h2 id="contato-anunciar" className="font-display text-headline-md text-primary">
          Quer anunciar seu comércio?
        </h2>
        <p className="text-body-lg text-on-surface-variant">
          O cadastro no guia comercial é gratuito para pequenos negócios e é feito pela página{' '}
          <Link href="/anuncie" className="text-secondary hover:underline">
            Anuncie no portal
          </Link>
          . Lá você envia os dados do negócio e eles passam por revisão antes da publicação.
        </p>
      </section>

      <section aria-labelledby="contato-avisos" className="space-y-2">
        <h2 id="contato-avisos" className="font-display text-headline-md text-primary">
          Avisos importantes
        </h2>
        <p className="text-body-lg text-on-surface-variant">
          Este portal <strong className="text-on-surface">não é canal de emergência</strong> nem
          atendimento oficial. Em emergência, ligue 193 (Bombeiros), 192 (SAMU) ou 199 (Defesa
          Civil). Para assuntos do SAAE, da Prefeitura ou da CPFL, fale diretamente com o órgão
          responsável — em caso de dúvida sobre uma informação publicada aqui, confirme na fonte
          oficial.
        </p>
      </section>
    </article>
  );
}

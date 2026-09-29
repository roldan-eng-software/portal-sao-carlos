import Link from 'next/link';
import Image from 'next/image';
import { env } from '@/config/env';
import { APP_VERSION, BUILD_COMMIT, BUILD_DATE, DEPLOY_ENV, DEPLOY_LABEL } from '@/config/version';

const EMERGENCY_LINES = [
  { number: '193', label: 'Bombeiros Municipal', tone: 'text-badge-emergency' },
  { number: '192', label: 'SAMU Urgência', tone: 'text-accent-amber' },
  { number: '199', label: 'Defesa Civil', tone: 'text-surface-bright' },
] as const;

const INSTITUTIONAL_LINKS = [
  { href: '#noticias', label: 'Notícias Regionais' },
  { href: '#clima', label: 'Boletim Meteorológico' },
  { href: '#informativos', label: 'Informativos Oficiais' },
  { href: '#contatos', label: 'Telefones de Emergência' },
  { href: '#anuncios', label: 'Guia Comercial' },
] as const;

export function Footer() {
  return (
    <footer className="w-full bg-primary text-surface-bright">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Marca e expediente */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {/* Símbolo do logotipo oficial — fundo claro para contrastar no rodapé navy. */}
              <Image
                src="/logo-symbol.png"
                alt=""
                aria-hidden="true"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg"
              />
              <span className="font-display text-headline-md text-surface-bright">
                Portal São Carlos
              </span>
            </div>
            <p className="text-body-sm text-surface-variant">
              Portal independente de utilidade pública de São Carlos e região. Não é órgão oficial
              da Prefeitura, do SAAE, da CPFL nem de qualquer outro órgão público ou empresa.
            </p>
            <div>
              <span className="mb-1 block text-label-sm uppercase text-accent-amber">
                Expediente e Redação
              </span>
              <p className="text-body-sm text-surface-container-high">
                São Carlos/SP — Brasil
                <br />
                <a href={`mailto:${env.contactEmail}`} className="hover:text-surface-bright">
                  {env.contactEmail}
                </a>
              </p>
            </div>
          </div>

          {/* Canais institucionais */}
          <nav aria-label="Rodapé">
            <span className="mb-3 block border-b border-surface-variant/20 pb-2 font-display text-label-lg text-surface-bright">
              Canais Institucionais
            </span>
            <ul className="space-y-2 text-body-md text-surface-variant">
              {INSTITUTIONAL_LINKS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition-colors hover:text-surface-bright">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/aviso-editorial"
                  className="transition-colors hover:text-surface-bright"
                >
                  Aviso editorial
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-privacidade"
                  className="transition-colors hover:text-surface-bright"
                >
                  Política de privacidade
                </Link>
              </li>
            </ul>
          </nav>

          {/* Plantão emergencial */}
          <div>
            <span className="mb-3 block border-b border-surface-variant/20 pb-2 font-display text-label-lg text-surface-bright">
              Plantão Emergencial 24h
            </span>
            <div className="space-y-2 text-body-sm">
              {EMERGENCY_LINES.map((line) => (
                <div
                  key={line.number}
                  className="flex items-center justify-between rounded bg-primary-container p-2"
                >
                  <a
                    href={`tel:${line.number}`}
                    className={`font-display text-headline-sm ${line.tone} hover:underline`}
                  >
                    {line.number}
                  </a>
                  <span className="text-surface-variant">{line.label}</span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded bg-primary-container p-2">
                <a
                  href="#contatos"
                  className="text-secondary-fixed transition-colors hover:text-surface-bright"
                >
                  Ver todos
                </a>
                <span className="text-surface-variant">Contatos úteis</span>
              </div>
            </div>
          </div>

          {/* Chamada comercial */}
          <div className="space-y-3">
            <span className="mb-3 block border-b border-surface-variant/20 pb-2 font-display text-label-lg text-surface-bright">
              Cadastre seu Negócio
            </span>
            <p className="text-body-sm text-surface-variant">
              Conecte sua marca a milhares de são-carlenses todos os dias. Planos sob medida para
              comércio e serviços.
            </p>
            <a
              href="#anuncie"
              className="block w-full rounded-lg bg-accent-amber px-4 py-2.5 text-center text-label-lg text-primary shadow-sm transition-all hover:bg-accent-amber/90"
            >
              Quero Anunciar Agora
            </a>
          </div>
        </div>

        <div
          id="contato-responsavel"
          className="flex flex-col items-center justify-between gap-4 border-t border-surface-variant/20 pt-6 text-body-sm text-surface-variant md:flex-row"
        >
          <div className="flex flex-col items-center gap-2 md:items-start">
            <p>
              © {new Date().getFullYear()} Portal São Carlos — São Carlos/SP. Informações de
              terceiros podem mudar; confirme dados importantes na fonte oficial.
            </p>
            {/* Controle de versões (skill changelog-automation): estado publicado. */}
            <p
              className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-label-sm text-surface-variant md:justify-start"
              data-testid="versao-em-producao"
              data-versao={APP_VERSION}
              data-ambiente={DEPLOY_ENV}
              title={
                BUILD_COMMIT
                  ? `Build de ${DEPLOY_LABEL.toLowerCase()} em ${BUILD_DATE} · commit ${BUILD_COMMIT}`
                  : `Build local de ${BUILD_DATE} · versão ${APP_VERSION}`
              }
            >
              <span className="rounded bg-primary-container px-2 py-0.5 text-surface-bright">
                v{APP_VERSION}
              </span>
              <span
                className={DEPLOY_ENV === 'production' ? 'text-badge-success' : 'text-accent-amber'}
              >
                {DEPLOY_LABEL}
              </span>
              {BUILD_COMMIT && <span className="font-mono">{BUILD_COMMIT}</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/aviso-editorial" className="transition-colors hover:text-surface-bright">
              Aviso editorial
            </Link>
            <Link
              href="/politica-de-privacidade"
              className="transition-colors hover:text-surface-bright"
            >
              Política de privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

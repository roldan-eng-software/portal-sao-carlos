import type { ContentKind } from '@/modules/types';

/**
 * Rótulos textuais obrigatórios por tipo de conteúdo (contrato section-module).
 * A informação NUNCA depende apenas de cor: o rótulo é sempre texto.
 */
export const CONTENT_LABELS: Record<ContentKind, string> = {
  noticia: 'Notícia',
  informativo: 'Informativo',
  'servico-publico': 'Serviço público',
  'anuncio-gratuito': 'Anúncio gratuito',
  'anuncio-patrocinado': 'Publicidade',
  'divulgacao-propria': 'Publicidade própria',
};

const KIND_STYLES: Record<ContentKind, string> = {
  noticia: 'border-slate-300 bg-slate-100 text-slate-700',
  informativo: 'border-sky-300 bg-sky-100 text-sky-800',
  'servico-publico': 'border-emerald-300 bg-emerald-100 text-emerald-800',
  'anuncio-gratuito': 'border-violet-300 bg-violet-100 text-violet-800',
  'anuncio-patrocinado': 'border-amber-400 bg-amber-100 text-amber-900',
  'divulgacao-propria': 'border-amber-400 bg-amber-100 text-amber-900',
};

export function contentLabel(kind: ContentKind): string {
  return CONTENT_LABELS[kind];
}

interface ContentLabelProps {
  kind: ContentKind;
  /** Permite o rótulo específico de um anúncio patrocinado (ex.: "Parceiro local"). */
  customLabel?: string;
}

export function ContentLabel({ kind, customLabel }: ContentLabelProps) {
  const label = customLabel ?? contentLabel(kind);
  return (
    <span
      data-kind={kind}
      className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${KIND_STYLES[kind]}`}
    >
      {label}
    </span>
  );
}

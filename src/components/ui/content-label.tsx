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

/*
 * Chips do DESIGN.md §Components §2 — cor sempre acompanha texto (FR-008):
 * notícia = cinza, informativo = azul, serviço público = verde,
 * publicidade = âmbar.
 */
const KIND_STYLES: Record<ContentKind, string> = {
  noticia: 'border-[#cbd5e1] bg-[#f1f5f9] text-primary-container',
  informativo: 'border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]',
  'servico-publico': 'border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]',
  'anuncio-gratuito': 'border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]',
  'anuncio-patrocinado': 'border-[#fde68a] bg-[#fef3c7] text-[#b45309]',
  'divulgacao-propria': 'border-[#fde68a] bg-[#fef3c7] text-[#b45309]',
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

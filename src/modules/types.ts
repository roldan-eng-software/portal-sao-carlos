/**
 * Tipagem de conteúdo (data-model.md) — diferenciação semântica
 * obrigatória dos seis tipos de conteúdo (FR-008).
 */
export type ContentKind =
  | 'noticia'
  | 'informativo'
  | 'servico-publico'
  | 'anuncio-gratuito'
  | 'anuncio-patrocinado'
  | 'divulgacao-propria';

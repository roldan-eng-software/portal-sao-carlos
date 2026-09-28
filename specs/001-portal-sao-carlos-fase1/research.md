# Research: Portal São Carlos — Fase 1

**Date**: 2026-09-28 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Todos os unknowns do Technical Context foram resolvidos. Nenhum
`NEEDS CLARIFICATION` permanece.

## R1 — Framework e arquitetura de renderização

- **Decision**: Next.js 16.x (App Router), Server Components por padrão,
  Client Components somente para interatividade real; revalidação
  incremental (ISR) para conteúdo externo.
- **Rationale**: a constituição define Next.js/TypeScript/React/Tailwind como
  stack preferencial; App Router permite buscar fontes externas no servidor
  (gate 8), evitar expor chaves no frontend (gate 9) e entregar HTML pronto
  para SEO local (gate 16) com JS mínimo no cliente (performance).
- **Alternatives considered**: site 100% estático gerado por ferramenta
  separada (Astro/Hugo) — rejeitado por não estar na stack preferencial e
  complicar revalidação programada; SPA pura (Vite+React) — rejeitado por SEO
  local fraco e acesso a fontes no cliente (violaria gates 8/9).

## R2 — Fonte de previsão do tempo

- **Decision**: Open-Meteo (api.open-meteo.com) com coordenadas fixas de
  São Carlos/SP (≈ -22.0175, -47.8909); sem chave de API; busca no servidor
  com cache e timeout.
- **Rationale**: gratuito, sem chave, sem plano de cobrança, sem cadastro —
  elimina segredo no env (gate 9) e custo (prioridade 2 da constituição);
  a constituição já aponta Open-Meteo como fonte pretendida.
- **Alternatives considered**: OpenWeatherMap — rejeitado (chave + limites de
  plano grátis); INMET oficial — rejeitado (sem API pública estável
  confirmada; não se inventa API oficial, restrição da constituição);
  scraping de portais de clima — rejeitado (termos de uso instáveis).
- **Fallback**: em falha, exibir último valor válido com `stale` + aviso, ou
  mensagem amigável (FR-012/FR-013).

## R3 — Fontes de notícias

- **Decision**: registro configurável de feeds RSS/Atom em
  `config/sources.ts`, com adapter único que normaliza para o modelo
  `NewsItem`. Lista inicial: Google News RSS com query local
  ("São Carlos,SP") como base confiável, mais feeds dos portais locais
  (G1 São Carlos, ACidade ON, São Carlos Agora, Portal da Cidade) **somente
  após** verificação individual de: RSS público disponível, termos de uso,
  direitos autorais, limites e estabilidade — checklist obrigatório da
  constituição (§Fontes Externas). Feed reprovado é removido do registro sem
  alterar a UI.
- **Rationale**: RSS é público, sem chave e de baixo custo; a lista fica em
  configuração (não em código de UI) para satisfazer "fácil troca de fonte";
  só título/resumo/data/link é publicado, com atribuição e link — nunca cópia
  integral (gate 13).
- **Alternatives considered**: NewsAPI/pag_news comerciais — rejeitado (chave,
  licença de exibição, custo); scraping das páginas dos portais — rejeitado
  (termos de uso, direitos autorais, instabilidade); APIs oficiais dos
  portais — rejeitado: **nenhuma API oficial confirmada existe; não inventar**
  (restrição explícita da constituição).

## R4 — Informativos do SAAE, CPFL e fontes oficiais

- **Decision**: curadoria manual pelo responsável em `content/notices.json`
  (título, resumo, data, fonte, link oficial), com revisão humana obrigatória.
  Nenhuma integração automática com SAAE/CPFL nesta fase.
- **Rationale**: não existem APIs públicas confirmadas do SAAE/CPFL; scraping
  de órgãos públicos violaria os critérios de avaliação de fontes; curadoria
  manual garante atribuição correta, link ao canal oficial e o tom de "portal
  independente que não substitui canais oficiais" (gate 13).
- **Alternatives considered**: monitoramento automatizado dos sites
  oficiais — rejeitado (termos, estabilidade, complexidade; Fase 3 no máximo);
  parceria institucional — fora do controle do projeto (não é parceria
  oficial; restrição da constituição).

## R5 — Persistência e cache

- **Decision**: N/A sem banco de dados. Fontes externas via fetch com cache
  e revalidação (~15 min) + timeout curto (~5 s) por módulo; conteúdo do
  portal (anúncios, informativos, contatos, promo) em arquivos JSON
  versionados em `content/`, carregados em runtime/build.
- **Rationale**: constituição não obriga banco na primeira versão; arquivos
  versionados dão moderação natural (revisão de PR/diff antes de publicar —
  gate 6) e custo zero; ISR satisfaz "não chamar APIs a cada visita"
  (performance) e "mostrar último conteúdo válido" (gate 10).
- **Alternatives considered**: PostgreSQL/Neon/Supabase — adiado para Fase 2
  (persistência de notícias e formulário de anunciantes, conforme constituição);
  CMS headless — rejeitado (complexidade, custo, painel implícito); localStorage
  como "banco" — rejeitado (não serve a conteúdo público compartilhado).

## R6 — HTML vindo de fontes externas

- **Decision**: remoção total de HTML → texto puro (decodificação de entidades,
  normalização de espaços/quebras). `dangerouslySetInnerHTML` é proibido no
  projeto. Apenas URL de link original passa por validação de protocolo
  (http/https).
- **Rationale**: gate 11 da constituição (sanitizar antes de renderizar,
  evitar renderização direta de HTML não confiável); texto puro é suficiente
  para título/resumo de notícias; zero superfície de XSS.
- **Alternatives considered**: biblioteca sanitizadora com allowlist
  (sanitize-html) — rejeitada nesta fase (não há caso de uso que exija HTML
  rico; simplicidade é prioridade 1); confiar no feed — inaceitável (fonte
  externa é dado não confiável).

## R7 — Estratégia de testes

- **Decision**: Vitest + React Testing Library; testes de unidade para
  normalizadores, sanitização e `module-result` (estados ok/stale/error);
  integração de adapters com respostas HTTP simuladas; componentes de seção
  verificados quanto a rótulos de publicidade e diferenciação semântica
  (FR-006/FR-007/FR-008). Validação E2E manual guiada por
  [quickstart.md](./quickstart.md); Playwright opcional para smoke.
- **Rationale**: rápido, alinhado ao ecossistema Vite/Next, sem servidor de
  teste; cobre exatamente os gates críticos (transparência, falha isolada,
  sanitização).
- **Alternatives considered**: Jest — funcional, porém integração mais
  pesada com ESM/Next moderno; cobertura alvo de 100% — rejeitada como meta
  rígida (simplicidade; cobrir os gates é o critério).

## R8 — Deploy e variáveis de ambiente

- **Decision**: Vercel (ISR nativo, serverless, zero infraestrutura própria).
  Env vars obrigatórias na Fase 1: nenhuma chave de terceiro. Opcionais
  (`config/env.ts` validado): `SITE_URL`, lista de feeds sobrescrita,
  contatos (WhatsApp/telefone/e-mail do responsável), coordenadas/ID da
  cidade. Nenhum segredo é exposto ao cliente.
- **Rationale**: constituição cita Vercel "se fizer sentido" — faz, por ISR e
  custo zero no plano inicial; escolher fontes sem chave remove o risco de
  exposição (gate 9) e facilita o ambiente de desenvolvimento.
- **Alternatives considered**: VPS com Docker — rejeitado (custo e
  manutenção sem necessidade; prioridade 2); variáveis no `NEXT_PUBLIC_*`
  para dados sensíveis — proibido (gate 9); nenhuma env de analytics na Fase 1
  (métricas são pergunta em aberto da constituição).

## R9 — SEO local

- **Decision**: Metadata API do Next (título/descrição únicos por página),
  JSON-LD (`WebSite` + `LocalBusiness`/`Organization` do portal + `NewsArticle`
  quando aplicável), `sitemap.ts`, `robots.ts`, URLs em pt-BR legíveis
  (`/politica-de-privacidade`, `/aviso-editorial`), domínio canônico via
  `SITE_URL`.
- **Rationale**: FR-016/SC-007; dados estruturados "quando apropriado" já
  previstos na constituição; sem páginas artificiais (gate 16).
- **Alternatives considered**: gerador de milhares de páginas de bairro —
  rejeitado (spam conforme constituição); plugin de SEO de terceiros —
  rejeitado (script de terceiros sem justificativa, performance).

## R10 — Observabilidade mínima

- **Decision**: log estruturado no servidor (`lib/logger.ts`) por falha de
  fonte: identificador da fonte, timestamp, tipo do erro, contador de falhas
  consecutivas; cada módulo expõe `lastUpdated`/`status` na UI (data da
  última atualização visível ao visitante, conforme FR-012). Sem plataforma
  externa na Fase 1.
- **Rationale**: constituição exige observabilidade mínima e proíbe
  plataforma complexa nesta fase; logs + status visível cobrem "identificação
  da fonte que falhou", "data da última atualização" e "contagem de falhas".
- **Alternatives considered**: Sentry/Grafana — adiado (necessidade real não
  demonstrada; escala pequena); painel de métricas público — rejeitado
  (métricas são pergunta em aberto; privacidade).

## R11 — Gestão de anúncios sem painel

- **Decision**: anúncios (gratuitos e patrocinados) vivem em
  `content/ads.json` com campos do modelo incluindo `status` e
  `periodoVeiculacao` (patrocinados); publicação exige edição versionada +
  revisão humana (PR/diff); o responsável marca `status: "publicado"`,
  "suspenso" ou "removido"; período de veiculação é controlado
  operacionalmente fora do sistema (constituição §13.2) — o sistema apenas
  respeita o `status`.
- **Rationale**: satisfaz gate 6 (sem publicação automática) e gate 3 (sem
  dashboard) com a menor complexidade possível; JSON versionado dá histórico
  e auditoria de graça.
- **Alternatives considered**: formulário público com fila de moderação —
  Fase 2 (pergunta em aberto "formulário para comerciantes"); Google
  Sheets/CMS como backend — rejeitado (complexidade + dependência externa);
  banco de dados — Fase 2.

## R12 — Idioma, acessibilidade e design de interface

- **Decision**: conteúdo integral em pt-BR; HTML semântico, hierarquia
  única de títulos por página, contraste verificado (WCAG AA), foco visível,
  alvos de toque ≥ 44 px, layout mobile-first, sem informação transmitida
  apenas por cor (rótulos sempre textuais); tipografia e cores próprias do
  portal (identidade visual é pergunta em aberto — usar paleta neutra
  provisória).
- **Rationale**: FR-014/FR-015/SC-005; identidade visual definitiva não
  bloqueia a Fase 1 (pressuposto do spec).
- **Alternatives considered**: biblioteca de componentes pesada — rejeitada
  (dependência desnecessária; componentes pequenos); tema escuro obrigatório —
  fora do escopo da Fase 1 (pode ser evolução).

## Resumo dos unknowns

| Unknown do Technical Context | Resolução |
| --- | --- |
| Language/Version | TypeScript 5.x strict, React 19, Node 22+ (R1) |
| Primary Dependencies | Next.js 16.3.6 App Router, Tailwind 4.x (R1) |
| Storage | N/A — cache/ISR + conteúdo versionado (R5, R11) |
| Testing | Vitest + RTL; E2E manual via quickstart (R7) |
| Target Platform | Web mobile-first, deploy Vercel (R1, R8) |
| Performance Goals | ≤ 3 s em móvel típico, JS mínimo (R1, R9) |
| Fonte de clima | Open-Meteo sem chave (R2) |
| Fontes de notícias | Registro de RSS validado por checklist (R3) |
| Informativos oficiais | Curadoria manual versionada (R4) |
| Segredos | Nenhum obrigatório; env opcional validada (R8) |

# AGENTS.md — Portal São Carlos (meubairro)

Documento de contexto para agentes/IA e colaboradores que forem trabalhar neste
repositório. Descreve **como está a implementação neste momento**, o que já foi
entregue, o que é proibido pela constituição do projeto e onde estão os pontos
de atenção. Atualizado em **2026-10-08** a partir de leitura direta do código,
histórico git e documentação em `specs/`.

---

## 1. Visão geral do projeto

| Item | Estado |
| --- | --- |
| Nome do pacote (`package.json`) | `portal-sao-carlos` v0.2.0 |
| Marca / título do site | **Portal São Carlos** (nome provisório) |
| Domínio canônico de produção | `https://www.meubairro.dev.br` (apex `meubairro.dev.br` redireciona 301 → www, em `next.config.ts`) |
| Repositório | `https://github.com/roldan-eng-software/portal-sao-carlos` |
| Deploy | Vercel (ISR/estático; `VERCEL_ENV`/`VERCEL_GIT_COMMIT_SHA` usados no build) |
| Fase atual | **Fase 1 — Portal público: CONCLUÍDA** (55/55 tasks `[X]` em `specs/001-portal-sao-carlos-fase1/tasks.md`) |
| Git | branch `main`, working tree limpo na data desta verificação |
| Tag | `v0.2.0` (`0f4b794`) publicada e em `origin` (2026-10-08); CHANGELOG em dia |

Portal local de utilidade pública de São Carlos/SP: previsão do tempo, notícias,
informativos, telefones úteis, anúncios e políticas — **sem cadastro, sem
pagamento, sem banco de dados** (constituição **v1.1.0**, `.specify/memory/constitution.md`
— a emenda v1.1.0 de 2026-10-08 formalizou o GA4 como métrica permitida).

---

## 2. Estado de verificação (2026-10-08)

| Verificação | Resultado |
| --- | --- |
| `npm run test` | ✅ 15 arquivos, **102 testes passando** |
| `npm run build` | ✅ exit 0 — Next.js 16.3.6 (Turbopack), 9 rotas estáticas, home com `revalidate 15m` |
| `npm run lint` | ✅ 0 erros e **0 warnings** (Material Symbols auto-hospedada desde a Etapa 1 — ver §6) |
| Gates da constituição | 17/17 PASS conforme `specs/001-portal-sao-carlos-fase1/plan.md` |
| Warning de build | Nenhum — itens `arquivado` de `content/notices.json` registram `info/archived_content_items` (não são mais `warn`) |

---

## 3. Stack e ferramentas

- **Framework**: Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 (strict)
- **Estilo**: Tailwind CSS 4 — tokens `@theme` em `src/app/globals.css` derivados do design **Civic Vanguard** (`docs/modelo/DESIGN.md`)
- **Fontes**: Plus Jakarta Sans (display) e Inter (corpo) via `next/font/google`; ícones Material Symbols Outlined **auto-hospedados** (subset de 34 ligaduras, ~34 KB, em `src/app/fonts/` — regeneração documentada no README de lá)
- **Dados externos**: `fast-xml-parser` (RSS/Atom), fetch no servidor com cache
- **Testes**: Vitest + React Testing Library (jsdom), setup em `tests/setup.ts`
- **Qualidade**: ESLint 9 (`eslint.config.mjs`), Prettier, Husky (`commit-msg` → commitlint conventional), `commit-and-tag-version` (release + CHANGELOG Keep a Changelog)
- **Sem**: banco de dados, ORM, autenticação, formulários, cache externo (Redis etc.)

### Comandos

```bash
npm run dev        # desenvolvimento
npm run build      # build de produção (verifica TypeScript)
npm run start      # serve o build
npm run lint       # ESLint
npm run test       # Vitest (run)  |  npm run test:watch
npm run release    # commit-and-tag-version (patch); release:minor / release:major / release:dry
```

---

## 4. Estrutura do repositório

```text
src/
├── app/
│   ├── layout.tsx              # Layout raiz: fontes, metadados globais, Header/AnnounceCTA/Footer/GA4
│   ├── page.tsx                # Home — monta os 6 módulos com Promise.allSettled + revalidate=900
│   ├── aviso-editorial/        # Página de transparência editorial (FR-011)
│   ├── politica-de-privacidade/ # Política de privacidade (FR-011)
│   ├── robots.ts, sitemap.ts   # SEO local (3 URLs no sitemap)
│   ├── globals.css             # Tokens do design system (@theme)
│   └── icon.png, apple-icon.png
├── components/
│   ├── layout/    # header.tsx (sticky + nav por âncoras + CTA "Anuncie Aqui"),
│   │              # footer.tsx (versão/deploy, emergências, links de política),
│   │              # announce-cta.tsx (faixa id="anuncie" em todas as páginas)
│   ├── sections/  # hero, weather, news (+ news-bento), notices, contacts, ads, promo
│   ├── ui/        # content-label.tsx (6 rótulos), section.tsx, status-message.tsx
│   ├── seo/json-ld.tsx         # WebSite + Organization (JSON-LD)
│   └── analytics/google-analytics.tsx  # GA4 G-063LGPHV93, só produção, afterInteractive
├── modules/       # Domínio isolado da UI (contratos em specs/.../contracts/)
│   ├── weather/   # adapter.ts (Open-Meteo), normalize.ts, types.ts
│   ├── news/      # adapter.ts (RSS), normalize.ts, types.ts (com imageUrl)
│   ├── notices/   # adapter.ts (curadoria JSON + RSS SAAE combinados), loader, normalize, types
│   ├── ads/       # loader.ts (content/ads.json)
│   ├── contacts/  # loader.ts (content/contacts.json)
│   ├── promo/     # loader.ts (content/promo.json)
│   └── types.ts   # ContentKind — os 6 tipos de conteúdo
├── lib/
│   ├── sanitize.ts        # HTML → texto puro; URL só http/https (dangerouslySetInnerHTML proibido)
│   ├── module-result.ts   # Envelope ok | stale | error + lastUpdated + mensagem amigável
│   ├── fetch-cached.ts    # Cache ~15 min, timeout ~5 s, "last good" por fonte, nunca lança
│   ├── feed.ts            # Parsing RSS/Atom compartilhado (news e notices)
│   ├── logger.ts          # Log estruturado de falha/recuperação por fonte
│   └── contact-links.ts   # Links WhatsApp
├── config/
│   ├── env.ts             # Env validada (tudo opcional; resolução da SITE_URL)
│   ├── sources.ts         # Registro de fontes (feeds + coordenadas do clima)
│   └── version.ts         # APP_VERSION, DEPLOY_ENV, BUILD_COMMIT, BUILD_DATE (rodapé)
└── content/               # Conteúdo curado manualmente (moderação = revisão de git)
    ├── ads.json, contacts.json, promo.json, notices.json

tests/
├── unit/          # normalizadores, sanitize, module-result, loaders, rótulos, GA, version
├── integration/   # notices-feed (feed SAAE mockado), source-failure (isolamento stale/error)
└── setup.ts

specs/001-portal-sao-carlos-fase1/   # Spec Kit: spec, plan, tasks (55/55), research,
                                     # data-model, quickstart, contracts/, checklists/
docs/modelo/                         # Design Civic Vanguard (DESIGN.md, code.html, logo)
.specify/                            # Constituição v1.0.0 + scripts Spec Kit
```

---

## 5. Arquitetura de um módulo de conteúdo (fluxo padrão)

```text
config/sources.ts (registro de fontes, sobrescrevível por env)
        │
        ▼
adapter.ts / loader.ts ──► lib/fetch-cached.ts (cache 15 min, timeout 5 s, last-good)
        │                         │ falha → logger.ts (fonte, timestamp, contador)
        ▼
normalize.ts ──► sanitize.ts (texto puro, URL http/https) ──► modelo interno
        │
        ▼
ModuleResult<T> { status: ok|stale|error, data, lastUpdated, errorMessage, sourceName }
        │
        ▼
components/sections/*-section.tsx (rótulo ContentLabel + status-message)
        │
        ▼
app/page.tsx — Promise.allSettled: falha de um módulo nunca derruba a página (FR-013)
```

Regras invariantes do fluxo:

- **Nenhuma chamada por visita**: a home tem `export const revalidate = 900` e o
  fetch é feito no servidor (Server Components por padrão).
- **`stale`** = falha com histórico de conteúdo válido (exibe último + aviso);
  **`error`** = falha sem histórico (mensagem amigável, nunca técnica).
- **`dangerouslySetInnerHTML` é proibido** — todo HTML externo vira texto puro.
- A remoção/troca de uma fonte é feita **apenas** em `config/sources.ts` ou por
  env (`NEWS_FEEDS`, `NOTICE_FEEDS`) — nunca alterando UI.

---

## 6. Fontes externas ativas

| Módulo | Fonte | Configuração |
| --- | --- | --- |
| Clima | **Open-Meteo** (sem chave) | Coordenadas fixas -22.0175, -47.8909 (São Carlos/SP), 5 dias, `weatherUrl()` em `config/sources.ts` |
| Notícias | **São Carlos Agora** (RSS direto) + **G1 São Carlos e região** (com `filterTerms: ["São Carlos"]` — só 18% do feed é local sem filtro) + **Google News** (agregador/fallback) | `DEFAULT_NEWS_FEEDS` em `config/sources.ts` na ordem direto-primeiro; **dedupe por título normalizado** mantém o link original e descarta a cópia do agregador (`modules/news/adapter.ts`); máx. 10/feed, 20 total; avaliação em research.md **R3.1** (ACidade ON e Portal da Cidade rejeitados) |
| Informativos | **RSS oficial do SAAE** (`saaesaocarlos.com.br/feed`) | Combinado com curadoria `content/notices.json` no `notices/adapter.ts`; máx. 10/feed, 12 total, merge por id, ordenação por data |
| Anúncios / promo / contatos | Arquivos JSON versionados em `src/content/` | Moderação manual via revisão de git (gate 6) |

Imagens de notícia vêm **apenas dos feeds RSS** (enclosure/media:content/thumbnail/`<img>`
do resumo, somente https) — `NewsItem.imageUrl`; exibidas com `next/image`
(`remotePatterns` https wildcard em `next.config.ts`). O portal **não armazena
imagens próprias** além dos assets estáticos em `public/`.

---

## 7. Páginas e composição

**Rotas reais** (apenas 3 páginas + endpoints de SEO):

- `/` — home
- `/aviso-editorial`
- `/politica-de-privacidade`
- `robots.txt`, `sitemap.xml`

**Ordem da home** (conteúdo público antes de publicidade — FR-009/SC-001):
`JsonLd` → `HeroSection` → `WeatherSection` → `NewsSection` (usa `NewsBento` grid)
→ `NoticesSection` → `ContactsSection` → `AdsSection` → `PromoSection`.

**Layout global**: `Header` sticky (logo oficial, nav por âncoras `#noticias`,
`#clima`, `#informativos`, `#contatos`, `#anuncios` + botão "Anuncie Aqui" →
`#anuncie`) → `main#conteudo` → `AnnounceCTA` (`id="anuncie"`, em todas as
páginas) → `Footer` (versão/deploy, telefones de emergência, links de política,
contato do responsável) → `GoogleAnalytics`.

**Rótulos obrigatórios** (`components/ui/content-label.tsx`, FR-008): os 6
valores de `ContentKind` — `noticia`, `informativo`, `servico-publico`,
`anuncio-gratuito`, `anuncio-patrocinado`, `divulgacao-propria` — sempre com
rótulo **textual** (nunca só cor).

**SEO**: metadados + Open Graph/Twitter com `/og-image.png`, canonical por
página, JSON-LD `WebSite`+`Organization`, sitemap (3 URLs), robots aberto,
redirect apex→www. **Analytics**: GA4 `G-063LGPHV93`, apenas `VERCEL_ENV=production`,
carga `afterInteractive`.

**Versão no rodapé** (`config/version.ts`): `APP_VERSION` do `package.json`,
ambiente (Produção/Preview/Local), SHA curto do commit e data do build —
fonte única atualizada por `npm run release`.

---

## 8. Design — Civic Vanguard

- Tokens em `src/app/globals.css` (`@theme`) derivados de `docs/modelo/DESIGN.md`
  (paleta navy/azul `primary #001428`, `secondary #0050cc`, acentos amber/success/emergency).
- **Decisões confirmadas pelo usuário (2026-09-28) — não reabrir sem perguntar:**
  1. **Sem formulários**: o card de captação do hero é CTA de contato
     (WhatsApp/e-mail), nunca formulário de cadastro (FR-009).
  2. **Header sem faixa de alerta e sem caixa de busca** (o mockup tinha ambos;
     recusados deliberadamente).
  3. Navegação apenas por **âncoras internas** — as rotas do mockup
     (`/portal-noticias`, `/guia-comercial`…) **não existem e não devem ser
     criadas** sem pedido.
  4. Imagens dos feeds RSS conforme §6.
- Logo oficial em `public/logo.png` / `logo-symbol.png` (header, footer, favicon,
  JSON-LD Organization).

---

## 9. Variáveis de ambiente

Todas **opcionais** (`.env.example`); lidas só no servidor, nenhuma `NEXT_PUBLIC_*`
com segredo (gate 9):

| Variável | Uso |
| --- | --- |
| `SITE_URL` | URL canônica; em produção é derivada de `VERCEL_PROJECT_PRODUCTION_URL` (nunca quebra build com valor vazio) |
| `NEWS_FEEDS` | Sobrescreve feeds de notícias (CSV de URLs) |
| `NOTICE_FEEDS` | Sobrescreve feeds de informativos (padrão: SAAE) |
| `CONTACT_WHATSAPP` / `CONTACT_PHONE` / `CONTACT_EMAIL` | Canais das chamadas "Anuncie aqui" (`contactEmail` tem default `contato@portalsaocarlos.com.br`) |

---

## 10. Restrições da constituição (NÃO VIOLAR — v1.1.0)

Proibido sem emenda formal (`.specify/memory/constitution.md`):

- ❌ login/cadastro, dashboard, área do comerciante
- ❌ pagamentos (PIX, cartão, checkout, gateway)
- ❌ upload/armazenamento de imagens de conteúdo (o portal exibe apenas imagens vindas de feeds)
- ❌ comentários, fórum, rede social, marketplace, carrinho
- ❌ publicação automática sem revisão humana (moderação = edição versionada)
- ❌ `dangerouslySetInnerHTML` / HTML externo sem sanitização
- ❌ cópia integral de matérias (só título + resumo + data + fonte + link)
- ❌ se apresentar como órgão oficial (Prefeitura/SAAE/CPFL); ausência de
  busca e de SearchAction no JSON-LD é deliberada
- Conteúdo 100% em **pt-BR**, sem sensacionalismo; falhas de fonte nunca
  viram erro técnico na página (SC-004)
- ✅ **Permitido com condições**: Google Analytics 4 (emenda v1.1.0) — só
  produção, carga adiada, coleta agregada, aviso de cookies publicado;
  qualquer ampliação de coleta exige emenda

Ordem de critérios para decisões técnicas futuras: simplicidade → custo →
compatibilidade → manutenção → segurança → performance → substituibilidade →
escalabilidade só quando necessário.

---

## 11. Pontos de atenção — situação (atualizado em 2026-10-08)

Plano original: `docs/plano-pontos-atencao.md`. Situação pós-Etapas 1–3 e 5:

**Resolvidos:**

1. ✅ **Release**: `v0.2.0` publicada (`0f4b794`) e em `origin`; CHANGELOG
   com 7 feats + 2 fixes do período (chore/docs ocultos pelo `.versionrc.js`).
2. ✅ **spec.md**: `Status: Implemented — 55/55 tasks`.
3. ✅ **Loader de notices**: item `arquivado` registra
   `info/archived_content_items`; só conteúdo **inválido** gera `warn`
   (`tests/unit/notices-loader.test.ts`).
4. ✅ **Fontes de notícias**: São Carlos Agora + G1 (`filterTerms:
   ["São Carlos"]`) + Google News com **dedupe por título** — avaliação
   completa em `research.md` R3.1; ACidade ON e Portal da Cidade
   rejeitados. Feed vazio (HTTP 200 que não é feed) loga `feed_sem_itens`.
5. ✅ **Lint 0/0**: Material Symbols auto-hospedada (subset de 34 ligaduras
   em `src/app/fonts/`); bug `fog`→`foggy` corrigido — a neblina renderizava
   texto cru em produção.
6. ✅ **Métricas (D2)**: constituição emendada para **v1.1.0** — GA4
   autorizado sob condições; aviso de cookies já publicado na política de
   privacidade.
7. ✅ **Marca (D1)**: manter "Portal São Carlos" (provisório) — decisão
   registrada; nomenclatura divergente (§1) é intencional.
8. ✅ **Contato (D3) local**: `CONTACT_WHATSAPP=5516981442301` no
   `.env.local` (gitignored).

**Pendências:**

1. 🔲 **Vercel (D3)**: espelhar `CONTACT_WHATSAPP` (e opcionalmente
   `CONTACT_PHONE`/`CONTACT_EMAIL`) em Environment Variables →
   **Production** na Vercel e redeployar. Sem isso, o hero e o "Anuncie
   aqui" seguem **sem WhatsApp/telefone no ar**.
2. 🔲 **D4 — política de anúncios gratuitos** (perguntas 3/4 da
   constituição v1.1.0): adiada pelo responsável em 2026-10-08.
3. 🔲 **Pergunta 1 da constituição**: nome definitivo do projeto.

---

## 12. Convenções para quem for contribuir

- Commits **conventionais em pt-BR** (`feat:`, `fix:`, `chore:`…) — validados
  por commitlint no hook `commit-msg`; terminar com
  `Co-Authored-By: Claude Code <noreply@anthropic.com>` quando o commit for
  criado a partir do Claude Code.
- Testes em `tests/**` (Vitest); rodar `npm run test` e `npm run lint` antes de
  considerar uma mudança pronta; `npm run build` para mudanças que afetam tipagem/rotas.
- Conteúdo novo de anúncio/informativo entra em `src/content/*.json` com as
  constraints do `data-model.md` (limites de chars, enums de status) — o loader
  descarta o que não valida.
- Documentação de feature segue o Spec Kit em `specs/<nome-da-feature>/`
  (spec → plan → tasks) contra a constituição; não criar funcionalidades fora
  do "Escopo Inicial" sem emenda.
- Ao mexer no visual: partir dos tokens de `src/app/globals.css`; não
  reintroduzir formulário, busca ou barra de alerta sem oferecer como opção nova
  (ver §8).

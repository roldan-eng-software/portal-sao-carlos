---

description: "Task list for Portal São Carlos — Fase 1"
---

# Tasks: Portal São Carlos — Fase 1 (Portal Público)

**Input**: Design documents from `/specs/001-portal-sao-carlos-fase1/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Included (Vitest + React Testing Library) porque o Technical Context do
plan.md define a estratégia de testes e o [quickstart.md](./quickstart.md)
(V6) depende de `npm run test` para validar sanitização.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project (web app Next.js)**: `src/`, `tests/` at repository root
- Paths match the structure defined in [plan.md](./plan.md) § Project Structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Scaffold Next.js 16 project at repository root with TypeScript, Tailwind CSS and App Router (create-next-app), producing `src/` per plan.md structure
- [X] T002 [P] Configure strict TypeScript, ESLint and Prettier in `tsconfig.json`, `.eslintrc`/`eslint.config.mjs` and `.prettierrc`
- [X] T003 [P] Configure Vitest + React Testing Library in `vitest.config.ts` and `tests/setup.ts` (align `npm run test` script in `package.json`)
- [X] T004 Configure root layout `src/app/layout.tsx`: `lang="pt-BR"`, estrutura de header/footer em `src/components/layout/`, metadados globais base (título/descrição do portal, `SITE_URL` canônico)
- [X] T005 [P] Create placeholder home `src/app/page.tsx` (renderiza apenas o shell das seções; conteúdo vem nas fases de user story)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Implement sanitizer in `src/lib/sanitize.ts`: remoção total de HTML → texto puro, decodificação de entidades, normalização de espaços/quebras; validação de URL somente protocolo `http/https` (contrato gate 11; `dangerouslySetInnerHTML` proibido no projeto)
- [X] T007 [P] Implement `ModuleResult<T>` envelope in `src/lib/module-result.ts` exatamente conforme data-model.md: campos `status` (`"ok" | "stale" | "error"`), `data`, `lastUpdated`, `errorMessage` (mensagem amigável pt-BR, nunca detalhe técnico), `sourceName`; transições ok→stale→stale / falha sem dado prévio→error
- [X] T008 [P] Implement cached fetch in `src/lib/fetch-cached.ts`: cache com revalidação ≈15 min, timeout ≈5 s por fonte, nunca exceção propaga para a página (retorna `ModuleResult`)
- [X] T009 [P] Implement structured logger in `src/lib/logger.ts`: por falha de fonte registra id da fonte, timestamp, tipo do erro e contador de falhas consecutivas (observabilidade mínima da constituição)
- [X] T010 [P] Implement validated env config in `src/config/env.ts`: variáveis opcionais `SITE_URL`, `NEWS_FEEDS`, `CONTACT_WHATSAPP`, `CONTACT_PHONE`, `CONTACT_EMAIL` (nenhuma obrigatória; nenhum segredo no cliente — gate 9)
- [X] T011 [P] Create configurable source registry in `src/config/sources.ts`: lista de feeds RSS/Atom e endpoint de clima (Open-Meteo, coordenadas fixas ≈ -22.0175, -47.8909), sobrescrevível por env — remover fonte não pode exigir alteração de UI (contrato content-source-adapter, regra 8)
- [X] T012 [P] Define `ContentKind` and shared content types in `src/modules/types.ts`: `"noticia" | "informativo" | "servico-publico" | "anuncio-gratuito" | "anuncio-patrocinado" | "divulgacao-propria"` (data-model.md)
- [X] T013 [P] Implement status UI in `src/components/ui/status-message.tsx`: renderiza aviso de `stale` ("Atualização temporariamente indisponível") e `error` (mensagem amigável + link oficial quando apropriado), sempre com `lastUpdated` ("Atualizado em dd/mm/aaaa às hh:mm") — contrato section-module, obrigações por status
- [X] T014 Write unit tests in `tests/unit/sanitize.test.ts` and `tests/unit/module-result.test.ts`: HTML/script removidos, entidades decodificadas, URL não-http rejeitada, transições de status corretas (quickstart V6)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Morador consulta informações públicas úteis (Priority: P1) 🎯 MVP

**Goal**: Home com previsão do tempo, notícias, informativos e contatos úteis, sem login e sem bloqueio por publicidade

**Independent Test**: quickstart V1 — abrir a home em viewport móvel e confirmar clima com carimbo de atualização, ≥1 notícia com título/resumo/data/fonte/link, informativos com fonte, ≥3 contatos úteis, tudo sem cadastro

### Tests for User Story 1

- [X] T015 [P] [US1] Unit tests for weather normalizer in `tests/unit/weather-normalize.test.ts`: campos WMO mapeados para texto pt-BR, datas ISO `YYYY-MM-DD`, resposta inválida → módulo `stale`/`error`
- [X] T016 [P] [US1] Unit tests for news normalizer in `tests/unit/news-normalize.test.ts`: cita constraints do data-model.md — `title` 1–200 chars, `summary` 1–500 chars, `url` http/https only (item com URL inválida é descartado), HTML vira texto puro

### Implementation for User Story 1

- [X] T017 [P] [US1] Create weather types and normalizer in `src/modules/weather/types.ts` and `src/modules/weather/normalize.ts` (modelo `WeatherData` de data-model.md: `city` sempre "São Carlos/SP", `temperatureC` 1 casa decimal, `daily` 3–7 entradas)
- [X] T018 [US1] Implement weather adapter in `src/modules/weather/adapter.ts`: busca Open-Meteo no servidor via `fetch-cached.ts` (regra: nenhuma chamada por visita), normaliza para `ModuleResult<WeatherData>`, fonte `open-meteo` (depends: T008, T017)
- [X] T019 [P] [US1] Create news types and normalizer in `src/modules/news/types.ts` and `src/modules/news/normalize.ts` (modelo `NewsItem`; máximo 10 itens por feed, padrão configurável; nunca corpo integral — gate 13)
- [X] T020 [US1] Implement RSS news adapter in `src/modules/news/adapter.ts`: lê feeds de `src/config/sources.ts`, parseia RSS/Atom (parser XML, ex.: fast-xml-parser), normaliza para `ModuleResult<NewsItem[]>`, `sourceName` obrigatório (depends: T011, T019) — nenhuma API oficial inventada (research R3)
- [X] T021 [P] [US1] Create curated notices seed in `src/content/notices.json` com 2–3 informativos de exemplo e constraints do data-model.md: `title` 1–200 chars, `summary` 1–500 chars, `date` `YYYY-MM-DD`, `sourceName` sempre com indicação de origem, `status` `"publicado"` (research R4: curadoria manual, sem scraping)
- [X] T022 [P] [US1] Implement notices loader in `src/modules/notices/loader.ts`: valida campos, descarta `status ≠ "publicado"`, falha de JSON inválido → `ModuleResult` `error` amigável (never crash)
- [X] T023 [P] [US1] Create useful contacts seed in `src/content/contacts.json` com ≥4 contatos (SAAE, Prefeitura, emergência, link útil) com constraints: `name` obrigatório, `kind` `"servico-publico"`|`"contato"`, `value` telefone formatado ou URL http(s), `urgent` boolean para canais de emergência
- [X] T024 [P] [US1] Implement contacts loader in `src/modules/contacts/loader.ts` com validação e envelope `ModuleResult`
- [X] T025 [P] [US1] Implement weather section in `src/components/sections/weather-section.tsx`: exibe condição atual, previsão em dias e `lastUpdated`; `stale`/`error` seguem contrato section-module (depends: T013, T018)
- [X] T026 [P] [US1] Implement news section in `src/components/sections/news-section.tsx`: lista com título (link), resumo, data pt-BR, `sourceName` + link "Ver na fonte" — SC-002 (depends: T013, T020)
- [X] T027 [P] [US1] Implement notices section in `src/components/sections/notices-section.tsx`: título, resumo, data, fonte + link oficial (FR-003) (depends: T013, T022)
- [X] T028 [P] [US1] Implement contacts section in `src/components/sections/contacts-section.tsx`: ≥3 itens visíveis, endereço/horário textual, itens `urgent` com aviso "Este portal não substitui o canal oficial de emergência" (gate 13) (depends: T013, T024)
- [X] T029 [US1] Compose home page in `src/app/page.tsx`: monta clima, notícias, informativos e contatos como módulos independentes (falha de um não bloqueia os demais — FR-013); cada seção exibe estado próprio (depends: T025, T026, T027, T028)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (quickstart V1 + V5)

---

## Phase 4: User Story 2 - Visitante distingue publicidade de informação (Priority: P2)

**Goal**: Todo bloco rotulado textualmente por tipo; nenhuma publicidade formatada como notícia

**Independent Test**: quickstart V2 — percorrer a home: 100% dos blocos com rótulo textual do tipo; anúncios/divulgações nunca com formatação de notícia; notícias/informativos com fonte + link

### Tests for User Story 2

- [X] T030 [P] [US2] Unit tests for label mapping in `tests/unit/content-label.test.ts`: os 6 valores de `ContentKind` possuem rótulo textual distinto (tabela do contrato section-module); nenhum `kind` é renderizado apenas por cor

### Implementation for User Story 2

- [X] T031 [US2] Implement label component in `src/components/ui/content-label.tsx`: mapa `kind → rótulo textual` — "Notícia", "Informativo", "Serviço público", "Anúncio gratuito", "Publicidade"/"Anúncio patrocinado"/"Destaque comercial"/"Parceiro local", `label` do item para divulgação própria (depends: T012)
- [X] T032 [US2] Apply `ContentLabel` across sections in `src/components/sections/news-section.tsx`, `notices-section.tsx`, `contacts-section.tsx`: rótulo + fonte + link ao original sempre que houver URL (SC-002; depends: T031, T026, T027, T028)
- [X] T033 [US2] Enforce informational priority in `src/app/page.tsx`: conteúdo público posicionado antes de qualquer slot publicitário; publicidade não bloqueia nem interrompe o acesso a informação (FR-009/SC-001)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently (quickstart V2)

---

## Phase 5: User Story 3 - Comerciante divulge negócio e contratante solicite destaque (Priority: P3)

**Goal**: Área de anúncios gratuitos e patrocinados rotulados, divulgação própria rotulada e chamada "Anuncie aqui" com contratação externa (sem pagamento)

**Independent Test**: quickstart V3 — anúncio gratuito completo visível; chamada "Anuncie aqui" com canal de contato em ≤2 interações; patrocinado em destaque com rótulo de publicidade; zero fluxos de pagamento/cadastro

### Tests for User Story 3

- [X] T034 [P] [US3] Unit tests for ads loader in `tests/unit/ads-loader.test.ts`: cita constraints do data-model.md — `businessName` 1–100 chars, `description` 1–300 chars, `status` enum (`"rascunho"|"publicado"|"suspenso"|"removido"`), somente `publicado` é exibido, "mín. um contato" entre `phone`/`whatsapp`/`url`, `expiresAt` vencido tratado como suspenso na renderização

### Implementation for User Story 3

- [X] T035 [P] [US3] Create ads seed in `src/content/ads.json` com ao menos 1 anúncio gratuito completo e 1 patrocinado (com `expiresAt` futuro) atendendo às regras mínimas da constituição §13 (relacionado a comércio local, sem conteúdo ilegal/enganoso, com contato)
- [X] T036 [P] [US3] Create promo seed in `src/content/promo.json` com divulgação própria do portal (serviços de desenvolvimento web) incluindo `label` obrigatório "Publicidade própria" (FR-007)
- [X] T037 [US3] Implement ads loader in `src/modules/ads/loader.ts`: valida modelo `Ad`, filtra `status = "publicado"`, ordena patrocinados primeiro, `expiresAt` vencido → tratado como suspenso, envelope `ModuleResult` (depends: T035)
- [X] T038 [US3] Implement promo loader in `src/modules/promo/loader.ts` com validação e envelope `ModuleResult` (depends: T036)
- [X] T039 [US3] Implement ads section in `src/components/sections/ads-section.tsx`: anúncio patrocinado em destaque com `ContentLabel` de publicidade e NUNCA formatação de notícia (SC-003); anúncios gratuitos com nome, categoria, descrição, bairro, contato, horário textual, link (FR-005) (depends: T031, T037)
- [X] T040 [P] [US3] Implement promo section in `src/components/sections/promo-section.tsx` exibindo o `label` do item como rótulo de publicidade (depends: T031, T038)
- [X] T041 [US3] Implement announce CTA in `src/components/layout/announce-cta.tsx`: chamadas "Anuncie aqui" / "Entre em contato para contratar destaque" com canais de `src/config/env.ts` (WhatsApp/telefone/e-mail) — acessível em ≤2 interações da home (SC-006); nenhum formulário de pagamento (FR-009)
- [X] T042 [US3] Integrate ads, promo and CTA into `src/app/page.tsx`: slots publicitários após conteúdo público, módulos independentes (depends: T033, T039, T040, T041)

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently (quickstart V3)

---

## Phase 6: User Story 4 - Visitante verifica transparência editorial e políticas (Priority: P4)

**Goal**: Aviso editorial e política de privacidade acessíveis, com canal de contato e procedimento de correção/remoção

**Independent Test**: quickstart V4 — links no rodapé abrem as duas páginas; aviso declara não ser órgão oficial; política informa finalidade, dados, retenção, contato e procedimento de remoção

### Implementation for User Story 4

- [X] T043 [P] [US4] Create privacy policy page in `src/app/politica-de-privacidade/page.tsx` com seções obrigatórias (FR-011): finalidade da coleta (mínimo possível; Fase 1 sem formulários → zero dados de visitantes), dados tratados, retenção pelo tempo necessário, canal de contato do responsável, procedimento de correção/remoção
- [X] T044 [P] [US4] Create editorial notice page in `src/app/aviso-editorial/page.tsx`: portal não é órgão oficial da Prefeitura/SAAE/CPFL/autoridades; informações de terceiros podem mudar; confirmar dados na fonte oficial; portal não substitui canais de emergência; identificação de fontes e link ao original (FR-011, gate 13)
- [X] T045 [US4] Add policy links to footer in `src/components/layout/footer.tsx`: links para `/politica-de-privacidade` e `/aviso-editorial` + contato do responsável visível (FR-010, FR-011)
- [X] T046 [US4] Wire canonical URLs and pt-BR titles for both policy pages in their `page.tsx` metadata (título/descrição únicos — base do SEO, FR-016)

**Checkpoint**: All user stories should now be independently functional (quickstart V4)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T047 [P] Add local SEO artifacts in `src/app/sitemap.ts` and `src/app/robots.ts`: sitemap com páginas públicas (home, políticas), robots permitindo indexação, `SITE_URL` canônica (FR-016, SC-007)
- [X] T048 [P] Add structured data in `src/components/seo/json-ld.tsx` aplicado em `src/app/page.tsx`: `WebSite` + identificação do portal; `NewsArticle` somente quando aplicável — sem páginas artificiais (gate 16)
- [X] T049 [P] Document environment configuration in `.env.example` com `SITE_URL`, `NEWS_FEEDS`, `CONTACT_*` (todas opcionais, comentadas em pt-BR)
- [X] T050 Run accessibility audit and fix issues in `src/components/**` and `src/app/**` per quickstart V7: h1 único, h2 por seção, contraste WCAG AA, foco visível, alvos ≥44 px, links compreensíveis, sem rolagem horizontal a 320 px (FR-014/FR-015, SC-005)
- [X] T051 Run performance pass: Server Components por padrão, zero scripts de terceiros, fontes otimizadas, cache externo ativo — validar quickstart V1 (≤3 s, SC-001)
- [X] T052 Simulate external source failure per quickstart V5: validar `stale`/`error` por módulo, logs em `src/lib/logger.ts` com fonte+timestamp+contador, 0 páginas de erro (SC-004)
- [X] T053 Verify constitution gate SC-008 per quickstart V9: confirmar ausência total de login, pagamento, upload, comentários e publicação automática no build
- [X] T054 Run full validation suite: `npm run build`, `npm run test`, quickstart V1–V9 documentando resultados em notas de validação do feature
- [X] T055 [P] Final code review pass: nomes claros, componentes pequenos, integrações isoladas em `src/modules/*`, variáveis de ambiente documentadas, nenhuma resposta bruta de API acoplada à UI (manutenibilidade da constituição)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (P1) first → MVP
  - US2 (P2) integra com seções da US1 (T032 depende de T026/T027/T028)
  - US3 (P3) integra com a prioridade de ordem da US2 (T042 depende de T033)
  - US4 (P4) independente das demais (páginas próprias) — pode correr em paralelo com US2/US3
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 sections existing (applies labels to them); independently testável via quickstart V2
- **User Story 3 (P3)**: Depends on ContentLabel (Foundational/US2) e slot de ordem (US2 T033); loaders/seeds são próprios
- **User Story 4 (P4)**: No dependencies on US1–US3 (páginas independentes); pode iniciar após Foundational

### Within Each User Story

- Tests first (falham antes da implementação correspondente)
- Types/normalizers before adapters/loaders
- Adapters/loaders before sections
- Sections before page composition
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T005 em paralelo (Setup)
- T006–T013 em paralelo, exceto T013 (depende de T007); T014 (testes) após T006 e T007
- US1: T015/T016 (testes) em paralelo; T017/T019/T021/T023 em paralelo (dados+tipos); T025–T028 em paralelo (seções)
- US3: T034, T035, T036 em paralelo (testes + seeds), depois T037/T038 (loaders) conforme dependências
- US4: T043/T044 em paralelo (duas páginas)
- Polish: T047, T048, T049 em paralelo
- US2 e US4 podem correr em paralelo entre si; US4 e US3 também

---

## Parallel Example: User Story 1

```bash
# Ondas de execução paralela da US1:
# Onda A (testes + dados, arquivos distintos):
Task: "T015 Unit tests for weather normalizer"
Task: "T016 Unit tests for news normalizer"
Task: "T021 Create curated notices seed"
Task: "T023 Create useful contacts seed"

# Onda B (tipos/normalizers/loaders):
Task: "T017 weather types + normalize"
Task: "T019 news types + normalize"
Task: "T022 notices loader"
Task: "T024 contacts loader"

# Onda C (seções, uma vez adapters prontos):
Task: "T025 weather-section.tsx"
Task: "T026 news-section.tsx"
Task: "T027 notices-section.tsx"
Task: "T028 contacts-section.tsx"

# Onda D (integração):
Task: "T029 compose src/app/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: quickstart V1 (+ V5 para falha isolada)
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → fundação pronta
2. Add User Story 1 → testar independentemente (V1, V5) → Deploy/Demo (**MVP!**)
3. Add User Story 2 → testar independentemente (V2) → Deploy/Demo
4. Add User Story 3 → testar independentemente (V3) → Deploy/Demo
5. Add User Story 4 → testar independentemente (V4) → Deploy/Demo
6. Polish → V6–V9 + `npm run build` + constituição 17 gates → publicação

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP)
   - Developer B: User Story 4 (políticas — independente)
   - Developer C: preparar seeds/tests da US3
3. After US1: Developer A → US2, depois integração da US3 em `page.tsx`

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable via its quickstart scenario
- Tests fail before implementing (write first, then implement)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Nenhuma task cria login, pagamento, upload, dashboard, comentários ou publicação automática (exclusões da constituição — verificado em T053)

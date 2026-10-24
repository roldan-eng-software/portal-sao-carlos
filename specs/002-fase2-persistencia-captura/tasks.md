---

description: "Task list template for feature implementation"
---

# Tasks: Fase 2 — Persistência e Captura de Interesse

**Input**: Design documents from `/specs/002-fase2-persistencia-captura/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure


## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for Fase 2 additions

- [ ] T001 [P] Create new module directories: src/modules/news-history/, src/modules/ads-pending/, src/modules/ads/manage.ts
- [ ] T002 [P] Create new component directories: src/components/sections/news-history-section.tsx, src/components/sections/ad-form-section.tsx
- [ ] T003 [P] Create new UI component files: src/components/ui/pagination.tsx, src/components/ui/ad-form.tsx, src/components/ui/moderation-table.tsx, src/components/ui/status-badge.tsx, src/components/ui/news-history-item-card.tsx
- [ ] T004 [P] Create new API route directories: src/app/api/ads/submit/, src/app/api/ads/pending/, src/app/api/ads/approve/, src/app/api/ads/reject/, src/app/api/ads/manage/
- [ ] T005 [P] Create new page route directories: src/app/noticias/, src/app/anunciar/, src/app/moderacao/
- [ ] T006 [P] Create new content files: src/content/news-history.json (empty array), src/content/ads-pending.json (empty array)
- [ ] T007 Add Fase 2 environment variables to config/env.ts: MODERATOR_SECRET, NEWS_HISTORY_RETENTION_DAYS

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Implement lib/rate-limit.ts: in-memory Map rate limiter (10 req/15min per IP) with sliding window
- [ ] T009 Implement lib/auth.ts: verifyModerator(secret) function comparing with process.env.MODERATOR_SECRET
- [ ] T010 Implement lib/cnpj.ts: CNPJ validation (normalização + algoritmo módulo 11) and formatting/masking
- [ ] T011 Extend lib/sanitize.ts for ad form fields: sanitizeText, sanitizeUrl, sanitizePhone
- [ ] T012 [P] Implement src/modules/news-history/types.ts: NewsHistoryItem, NewsHistoryPage interfaces per data-model.md
- [ ] T013 [P] Implement src/modules/ads-pending/types.ts: AdSubmission, AdPublished, AD_CATEGORIES, constants per data-model.md
- [ ] T014 Extend src/modules/ads/types.ts: add 'anuncio-gratuito' to AdKind, add manage actions
- [ ] T015 Implement src/modules/news-history/normalize.ts: deduplication by hash (title+source+date), sanitization
- [ ] T016 Implement src/modules/news-history/retention.ts: filter items >12 months (365 days) on load
- [ ] T017 Implement src/modules/ads-pending/notify.ts: generate wa.me and mailto links with pre-formatted messages

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Visitante consulta histórico de notícias (Priority: P1) 🎯 MVP

**Goal**: Exibir listagem paginada de notícias históricas em /noticias com 20 itens/página, ordenação por data decrescente, resiliente a falhas de fontes externas

**Independent Test**: Acessar /noticias, confirmar paginação funcional, notícias antigas aparecem, cada item tem título/resumo/data/fonte/link, StatusMessage se fonte indisponível

### Tests for User Story 1 (OPTIONAL - only if tests requested)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T018 [P] [US1] Contract test for GET /noticias pagination in tests/integration/news-history-page.test.tsx
- [ ] T019 [P] [US1] Integration test: source failure resilience - historical data accessible when feeds down in tests/integration/source-failure-history.test.tsx

### Implementation for User Story 1

- [ ] T020 [US1] Implement src/modules/news-history/loader.ts: load news-history.json, merge with current feeds, apply retention filter, return NewsHistoryPage
- [ ] T021 [US1] Implement src/app/noticias/page.tsx: Server Component with revalidate=1800, getNewsHistoryPage(page), render NewsHistorySection with initialPage
- [ ] T022 [US1] Implement src/components/sections/news-history-section.tsx: Client Component, useSearchParams pagination, Suspense boundary, StatusMessage for stale/error
- [ ] T023 [P] [US1] Implement src/components/ui/news-history-item-card.tsx: article with image, time, source, title link, summary, footer link
- [ ] T024 [P] [US1] Implement src/components/ui/pagination.tsx: accessible nav with prev/next, page numbers, ellipsis, aria-labels
- [ ] T025 [US1] Add SEO metadata to /noticias: generateMetadata with pagination titles, canonical URLs, Open Graph, JSON-LD ItemList
- [ ] T026 [US1] Add ContentLabel kind="noticia" to news-history-section and news-history-item-card
- [ ] T027 [US1] Update src/components/layout/header.tsx: add /anunciar link as primary CTA button in nav
- [ ] T028 [US1] Add /noticias link to footer "Listagens Completas" column

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Comerciante submete anúncio gratuito pelo formulário público (Priority: P1)

**Goal**: Formulário público em /anunciar com validação cliente/servidor, rate limiting, sanitização, deduplicação CNPJ, submissão para fila de moderação (status pendente)

**Independent Test**: Acessar /anunciar, preencher campos obrigatórios, submeter, confirmar mensagem de sucesso e entrada em ads-pending.json com status pendente

### Tests for User Story 2 (OPTIONAL - only if tests requested)

- [ ] T029 [P] [US2] Contract test for POST /api/ads/submit in tests/integration/ad-form-submit.test.tsx
- [ ] T030 [P] [US2] Unit tests: ads-pending-submit.test.ts (validation, rate limit, dedupe CNPJ, sanitization)
- [ ] T031 [P] [US2] Unit tests: rate-limit.test.ts, cnpj-validation.test.ts, sanitize-ads.test.ts

### Implementation for User Story 2

- [ ] T032 [US2] Implement src/modules/ads-pending/loader.ts: load/save ads-pending.json with atomic writes
- [ ] T033 [US2] Implement src/modules/ads-pending/submit.ts: server validation, rate limit check, CNPJ dedupe (ads-pending + ads.json), sanitization, create AdSubmission
- [ ] T034 [US2] Implement src/app/api/ads/submit/route.ts: POST handler, rate limit headers, consistent error envelope
- [ ] T035 [US2] Implement src/components/sections/ad-form-section.tsx: Client Component, form state, client validation mirroring server, fetch to /api/ads/submit
- [ ] T036 [P] [US2] Implement src/components/ui/ad-form.tsx: Field components with labels, error display, phone/CNPJ masking, select for categories
- [ ] T037 [US2] Implement src/app/anunciar/page.tsx: Client Component page with AdFormSection, ContentLabel kind="anuncio-gratuito"
- [ ] T038 [US2] Add SEO metadata to /anunciar: title, description, Open Graph, robots index/follow

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Moderador/proprietário gerencia fila de moderação e anúncios publicados (Priority: P1)

**Goal**: Área protegida /moderacao com autenticação MODERATOR_SECRET, lista pendentes, aprovar (move para ads.json kind=anuncio-gratuito), recusar (motivo obrigatório), gerenciar publicados (editar/suspender/remover/reativar)

**Independent Test**: Acessar /moderacao?secret=xxx, ver pendentes, aprovar → publicado em ads.json, recusar → motivo + notificação, gerenciar publicados

### Tests for User Story 3 (OPTIONAL - only if tests requested)

- [ ] T039 [P] [US3] Contract tests for GET /api/ads/pending, POST /api/ads/approve, POST /api/ads/reject, PATCH /api/ads/manage in tests/integration/moderation-flow.test.tsx
- [ ] T040 [P] [US3] Unit tests: ads-pending-approve.test.ts, ads-pending-reject.test.ts, auth-moderator.test.ts

### Implementation for User Story 3

- [ ] T041 [US3] Implement src/app/moderacao/layout.tsx: Server Component, verify MODERATOR_SECRET via header/query/cookie, redirect 401 if invalid
- [ ] T042 [US3] Implement src/app/api/ads/pending/route.ts: GET handler, auth check, return AdSubmission[]
- [ ] T043 [US3] Implement src/modules/ads-pending/approve.ts: move pending → ads.json (kind=anuncio-gratuito), remove from pending, generate notification links
- [ ] T044 [US3] Implement src/app/api/ads/approve/route.ts: POST handler, auth, call approve.ts, handle duplicate CNPJ conflict
- [ ] T045 [US3] Implement src/modules/ads-pending/reject.ts: mark rejected, set rejectionReason, generate notification links
- [ ] T046 [US3] Implement src/app/api/ads/reject/route.ts: POST handler, auth, validate reason required, call reject.ts
- [ ] T047 [US3] Implement src/modules/ads/manage.ts: edit (partial update), suspend, reactivate, remove (status=removido + removedAt)
- [ ] T048 [US3] Implement src/app/api/ads/manage/route.ts: PATCH handler, auth, dispatch to manage.ts actions
- [ ] T049 [P] [US3] Implement src/components/ui/moderation-table.tsx: table with columns, actions (Aprovar/Recusar/Detalhes), StatusBadge
- [ ] T050 [P] [US3] Implement src/components/ui/published-ads-manager.tsx: table for published ads with Editar/Suspender/Reativar/Remover
- [ ] T051 [P] [US3] Implement src/components/ui/status-badge.tsx: variants for pendente/aprovado/recusado/publicado/suspenso/removido
- [ ] T052 [US3] Implement src/app/moderacao/page.tsx: Server Component, tabs Pendentes/Publicados, fetch data no cache, render tables with action handlers
- [ ] T053 [US3] Add SEO metadata to /moderacao: noindex, nofollow, title

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Métricas de acesso continuam funcionando (Priority: P2)

**Goal**: Verificar que GA4 continua funcionando exatamente como na Fase 1 sem regressão

**Independent Test**: Verificar GA4 carrega só em produção (VERCEL_ENV=production), afterInteractive, page_view enviado; não carrega em preview/dev

### Tests for User Story 4 (OPTIONAL - only if tests requested)

- [ ] T054 [P] [US4] Verify GA4 component unchanged: src/components/analytics/google-analytics.tsx loads only when VERCEL_ENV=production
- [ ] T055 [P] [US4] Integration test: build production, verify GA4 script loads afterInteractive; dev build has no GA4

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T056 [P] Documentation updates: README.md with Fase 2 features, .env.example with MODERATOR_SECRET
- [ ] T057 [P] Add cleanup script: package.json script "cleanup:news-history" to run retention filter on news-history.json
- [ ] T058 [P] Add cleanup script: package.json script "cleanup:ads-pending" to remove expired (>30d) pending submissions
- [ ] T059 Run full test suite: npm run test (all unit + integration tests pass)
- [ ] T060 Run lint: npm run lint (0 errors, 0 warnings)
- [ ] T061 Run build: npm run build (exit 0, all routes compile)
- [ ] T062 Quickstart validation: manual scenarios 1-4 from quickstart.md
- [ ] T063 Constitutional compliance check: no prohibited features (login, dashboard, upload, payments, auto-publish)
- [ ] T064 [P] Update CHANGELOG via npm run release (patch) after merge to main

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P1 → P2)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Independent of US1/US2 (but US2 must exist for pending items)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent verification

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models/Types before loaders/services
- Loaders/services before API routes
- API routes before UI components
- UI components before page routes
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models/Types within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Contract test for GET /noticias pagination in tests/integration/news-history-page.test.tsx"
Task: "Integration test: source failure resilience in tests/integration/source-failure-history.test.tsx"

# Launch models/types in parallel:
Task: "Implement src/modules/news-history/types.ts: NewsHistoryItem, NewsHistoryPage interfaces"
Task: "Implement src/modules/ads-pending/types.ts: AdSubmission, AdPublished, AD_CATEGORIES"
```

---

## Parallel Example: User Story 2

```bash
# Launch all unit tests for US2 together:
Task: "Unit tests: ads-pending-submit.test.ts (validation, rate limit, dedupe CNPJ, sanitization)"
Task: "Unit tests: rate-limit.test.ts, cnpj-validation.test.ts, sanitize-ads.test.ts"

# Launch backend modules in parallel (different files):
Task: "Implement src/modules/ads-pending/loader.ts: load/save ads-pending.json"
Task: "Implement src/modules/ads-pending/submit.ts: server validation, rate limit, CNPJ dedupe"
```

---

## Parallel Example: User Story 3

```bash
# Launch auth + API routes in parallel:
Task: "Implement src/app/moderacao/layout.tsx: MODERATOR_SECRET verification"
Task: "Implement src/app/api/ads/pending/route.ts: GET with auth"
Task: "Implement src/app/api/ads/approve/route.ts: POST with auth"
Task: "Implement src/app/api/ads/reject/route.ts: POST with auth"
Task: "Implement src/app/api/ads/manage/route.ts: PATCH with auth"

# Launch UI components in parallel:
Task: "Implement src/components/ui/moderation-table.tsx"
Task: "Implement src/components/ui/published-ads-manager.tsx"
Task: "Implement src/components/ui/status-badge.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Historical news pagination)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Verify no regression → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (News history)
   - Developer B: User Story 2 (Ad form submission)
   - Developer C: User Story 3 (Moderation area)
   - Developer D: User Story 4 (GA4 verification) + Polish tasks
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
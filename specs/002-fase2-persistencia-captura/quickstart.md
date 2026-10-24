# Quickstart Validation Guide: Fase 2 — Persistência e Captura de Interesse

**Date**: 2026-10-24  
**Spec**: specs/002-fase2-persistencia-captura/spec.md  
**Plan**: specs/002-fase2-persistencia-captura/plan.md  
**Data Model**: specs/002-fase2-persistencia-captura/data-model.md  
**Contracts**: specs/002-fase2-persistencia-captura/contracts/

---

## Prerequisites

```bash
# Repository
git clone https://github.com/roldan-eng-software/portal-sao-carlos.git
cd portal-sao-carlos

# Dependencies
npm ci

# Environment (copy and fill)
cp .env.example .env.local
# Required for Fase 2:
# MODERATOR_SECRET=your-secure-random-string
# NEWS_HISTORY_RETENTION_DAYS=365  (optional, default 365)
```

---

## Validation Scenarios

### Scenario 1: Histórico de Notícias - Listagem Paginada `/noticias`

**Objective**: Verify FR-001, FR-002, FR-003, FR-004, SC-001, SC-002

**Setup**:
```bash
# 1. Populate news-history.json with test data (>20 items, spanning >30 days)
npm run test:setup:news-history  # Creates test data in content/news-history.json

# 2. Start dev server
npm run dev
```

**Test Steps**:

1. **Access page 1**: Open `http://localhost:3000/noticias`
   - ✅ Page loads in <3s (mobile 3G throttle in DevTools)
   - ✅ Shows 20 news items (title, summary, date, source, link)
   - ✅ Pagination shows "Página 1 de N" with Next/Previous buttons
   - ✅ Each item has `ContentLabel` "Notícia"
   - ✅ Canonical URL is `/noticias`
   - ✅ JSON-LD `ItemList` present in `<head>`

2. **Navigate to page 2**: Click "Próxima" or `?page=2`
   - ✅ Older news displayed (different items from page 1)
   - ✅ Same fields present (title, summary, date, source, link)
   - ✅ URL updates to `/noticias?page=2`
   - ✅ "Anterior" button enabled, "Próxima" works

3. **Source failure resilience**: Temporarily block RSS feeds in `config/sources.ts` or mock failure
   - ✅ Page still loads with historical data
   - ✅ `StatusMessage` shows "Atualização temporariamente indisponível" (stale/error)
   - ✅ No console errors breaking the page

4. **Mobile viewport**: DevTools device toolbar (iPhone SE)
   - ✅ Pagination usable without horizontal scroll
   - ✅ Cards stack vertically, readable text
   - ✅ Touch targets ≥44px

**Expected Outcome**: All 4 acceptance scenarios from User Story 1 pass.

---

### Scenario 2: Formulário Público - Submissão de Anúncio `/anunciar`

**Objective**: Verify FR-006 through FR-014, SC-003, SC-004, SC-005, SC-006, SC-012

**Setup**:
```bash
npm run dev
# Open http://localhost:3000/anunciar
```

**Test Steps**:

1. **Valid submission** (happy path):
   - Fill all required fields:
     - Nome: "Padaria Teste"
     - Categoria: "Alimentação"
     - Descrição: "Pães artesanais frescos todos os dias."
     - Bairro: "Centro"
     - Telefone: "(16) 99999-9999"
     - CNPJ: "12.345.678/0001-99" (válido módulo 11)
     - Link externo (opcional): "https://instagram.com/padariateste"
     - Horário (opcional): "Seg-Sex 6h-19h"
   - Click "Enviar para Moderação"
   - ✅ Response <2s
   - ✅ Success message: "Anúncio enviado para moderação..."
   - ✅ Form resets
   - ✅ Check `src/content/ads-pending.json` → new entry with `status: "pendente"`

2. **Missing required field**:
   - Leave "Nome" empty, submit
   - ✅ Client-side validation blocks submit
   - ✅ Error message on "Nome" field: "Campo obrigatório"
   - ✅ No network request sent

3. **Invalid phone format**:
   - Phone: "12345" (inválido)
   - ✅ Client validation shows error: "Telefone deve estar no formato (DD) 9XXXX-XXXX"
   - ✅ Server also validates (test via curl bypassing client)

4. **Invalid CNPJ**:
   - CNPJ: "11.111.111/1111-11" (inválido módulo 11)
   - ✅ Client + server reject with "CNPJ inválido"

5. **Duplicate CNPJ** (active published):
   - Pre-seed `ads.json` with `kind: "anuncio-gratuito"`, same CNPJ, `status: "publicado"`
   - Submit new form with same CNPJ
   - ✅ Server returns 409 Conflict: "Já existe um anúncio ativo ou pendente para este CNPJ."

6. **Duplicate CNPJ** (pending):
   - Pre-seed `ads-pending.json` with same CNPJ, `status: "pendente"`
   - ✅ Server returns 409 Conflict: "...status: pendente"

7. **Rate limiting**:
   - Submit 11 valid requests rapidly from same IP (automated test)
   - ✅ Requests 1-10: 201/409
   - ✅ Request 11: 429 Too Many Requests, `retryAfter: 900`
   - ✅ Header `X-RateLimit-Remaining: 0`

8. **XSS/Injection attempt**:
   - Description: `<script>alert('xss')</script><img src=x onerror=alert(1)>`
   - ✅ Stored in `ads-pending.json` as plain text (sanitized)
   - ✅ No script execution when moderator views in admin

9. **Invalid externalLink**:
   - Link: "javascript:alert(1)" or "ftp://example.com"
   - ✅ Validation rejects: "Link deve ser URL https válida"

**Expected Outcome**: All 5 acceptance scenarios from User Story 2 pass.

---

### Scenario 3: Área de Moderação - Gerenciamento de Anúncios `/moderacao`

**Objective**: Verify FR-015 through FR-021, SC-007, SC-008, SC-010

**Setup**:
```bash
# 1. Set MODERATOR_SECRET in .env.local
echo "MODERATOR_SECRET=test-secret-123" >> .env.local

# 2. Seed test data
npm run test:setup:ads-pending  # Creates 3 pending submissions
npm run test:setup:ads-published # Creates 2 published gratuito ads

# 3. Start dev server
npm run dev
```

**Test Steps**:

1. **Unauthorized access**:
   - Open `http://localhost:3000/moderacao` (no secret)
   - ✅ Redirects to `/?moderation=unauthorized` or shows 401
   - ✅ No data exposed

2. **Authorized access** (with secret):
   - Open `http://localhost:3000/moderacao?secret=test-secret-123`
   - ✅ Page loads, shows "Área de Moderação"
   - ✅ Tab "Pendentes" shows 3 submissions with all fields
   - ✅ Tab "Publicados" shows 2 anúncios gratuitos

3. **Approve pending**:
   - Click "Aprovar" on first pending
   - ✅ Modal confirms → POST `/api/ads/approve`
   - ✅ Success toast: "Anúncio aprovado e publicado..."
   - ✅ WhatsApp/email notification links shown
   - ✅ Item moves from Pendentes to Publicados
   - ✅ `ads.json` updated with new `kind: "anuncio-gratuito"`, `status: "publicado"`
   - ✅ `ads-pending.json` entry removed

4. **Reject pending with reason**:
   - Click "Recusar" on second pending
   - ✅ Modal opens with required "Motivo" textarea
   - ✅ Submit without reason → validation error
   - ✅ Fill reason: "Descrição não condiz com categoria"
   - ✅ Success toast: "Anúncio recusado..."
   - ✅ Notification links with reason included
   - ✅ Item status → `recusado`, `rejectionReason` set
   - ✅ Item removed from Pendentes tab (or shown as recusado)

5. **Manage published ads**:
   - Switch to "Publicados" tab
   - **Suspend**: Click "Suspender" → confirm → status `suspenso` → hidden from public
   - **Reactivate**: Click "Reativar" on suspended → status `publicado` → visible again
   - **Edit**: Click "Editar" → modify description → save → updated in `ads.json`
   - **Remove**: Click "Remover" → double confirm → status `removido` → hidden, LGPD 12m timer starts

6. **Audit trail**:
   - Check git diff of `content/ads.json` and `content/ads-pending.json`
   - ✅ Each action creates commit-like change (manual commit in dev, auto in CI)

**Expected Outcome**: All 5 acceptance scenarios from User Story 3 pass.

---

### Scenario 4: GA4 Métricas - Sem Regressão

**Objective**: Verify FR-022, FR-023, SC-009

**Setup**:
```bash
# Production build
npm run build
npm run start
# Or deploy to Vercel Preview
```

**Test Steps**:

1. **Production (VERCEL_ENV=production)**:
   - Access any page
   - ✅ GA4 script loads `afterInteractive` (check Network tab)
   - ✅ `page_view` event sent
   - ✅ No GA4 in local dev (`npm run dev`)

2. **Preview/Development**:
   - `npm run dev` or Vercel Preview deployment
   - ✅ GA4 script NOT loaded
   - ✅ No network requests to `googletagmanager.com`
   - ✅ Console: no GA4 errors

**Expected Outcome**: Both acceptance scenarios from User Story 4 pass.

---

### Scenario 5: LGPD Retenção de Dados

**Objective**: Verify FR-028, SC-011

**Test Steps** (unit/integration tests):

1. **Pending submissions >30 days**:
   - Create `AdSubmission` with `submittedAt` 31 days ago, `status: "pendente"`
   - Run cleanup (loader or script)
   - ✅ Entry removed from `ads-pending.json`

2. **Approved ads retention**:
   - Create `AdPublished` with `publishedAt` 400 days ago, `status: "removido"`, `removedAt` 13 months ago
   - Run cleanup
   - ✅ Entry removed/anonymized from `ads.json`

3. **Active ads preserved**:
   - `AdPublished` with `status: "publicado"`, any age
   - ✅ Never removed by retention (only by moderator action)

---

## Automated Test Commands

```bash
# Unit tests (all new modules)
npm run test -- --run src/modules/news-history/
npm run test -- --run src/modules/ads-pending/
npm run test -- --run src/lib/rate-limit.test.ts
npm run test -- --run src/lib/cnpj.test.ts
npm run test -- --run src/lib/auth.test.ts

# Integration tests
npm run test -- --run tests/integration/news-history-page.test.tsx
npm run test -- --run tests/integration/ad-form-submit.test.tsx
npm run test -- --run tests/integration/moderation-flow.test.tsx
npm run test -- --run tests/integration/source-failure-history.test.tsx

# All tests
npm run test

# Lint
npm run lint

# Build
npm run build
```

---

## Manual Verification Checklist

| Feature | Manual Check | Automated Test |
|---|---|---|
| `/noticias` pagination | ✅ | ✅ |
| `/noticias` mobile | ✅ | (visual) |
| `/noticias` source failure | ✅ | ✅ |
| `/anunciar` valid submit | ✅ | ✅ |
| `/anunciar` validation | ✅ | ✅ |
| `/anunciar` duplicate CNPJ | ✅ | ✅ |
| `/anunciar` rate limit | | ✅ |
| `/anunciar` XSS sanitization | | ✅ |
| `/moderacao` auth | ✅ | ✅ |
| `/moderacao` approve | ✅ | ✅ |
| `/moderacao` reject | ✅ | ✅ |
| `/moderacao` manage published | ✅ | ✅ |
| GA4 production only | ✅ | (e2e) |
| LGPD retention | | ✅ |
| Constitutional compliance | ✅ | ✅ (lint + tests) |

---

## Definition of Done

- [ ] All unit tests pass (`npm run test` → 100% new coverage)
- [ ] All integration tests pass
- [ ] `npm run lint` → 0 errors, 0 warnings
- [ ] `npm run build` → exit 0
- [ ] Manual scenarios 1-4 verified
- [ ] No constitutional violations (run `npm run security-audit` if available)
- [ ] CHANGELOG updated (via `npm run release` after merge)
- [ ] Deploy to Vercel Preview → smoke test
- [ ] Merge to `main` → production deploy
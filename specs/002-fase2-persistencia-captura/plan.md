# Implementation Plan: Fase 2 — Persistência e Captura de Interesse

**Branch**: `002-fase2-persistencia-captura` | **Date**: 2026-10-24 | **Spec**: specs/002-fase2-persistencia-captura/spec.md

**Input**: Feature specification from `/specs/002-fase2-persistencia-captura/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Fase 2 adiciona persistência de histórico de notícias (além do cache volátil de 15 min), formulário público para anúncios gratuitos com fila de moderação, área de moderação simples protegida (apenas proprietário), e mantém o GA4 já configurado. A arquitetura segue o padrão modular da Fase 1: módulos isolados em `src/modules/`, loaders/adapters em `src/modules/*/`, UI em `src/components/sections/`, armazenamento em arquivos JSON versionados em `src/content/` (simplicidade, Princípio II), autenticação da moderação via variável de ambiente `MODERATOR_SECRET` (sem cadastro de usuários, Princípio II).

## Technical Context

**Language/Version**: TypeScript 5 (strict), Next.js 16 (App Router, Turbopack), React 19

**Primary Dependencies**: 
- Next.js 16, React 19, Tailwind CSS 4
- `fast-xml-parser` (RSS/Atom parsing - já existente)
- Vitest + React Testing Library (jsdom) - já configurado
- ESLint 9, Prettier, Husky, commitlint - já configurado

**Storage**: Arquivos JSON versionados em `src/content/` (news-history.json, ads-pending.json, ads.json) — sem banco de dados externo (Princípio II: Simplicidade, baixo custo, compatibilidade com stack existente). Git como auditoria.

**Testing**: Vitest (unit + integration), React Testing Library, jsdom environment

**Target Platform**: Web (Next.js no Vercel, ISR/estático), Node.js 20+ runtime

**Project Type**: Web application (Next.js App Router, Server Components por padrão)

**Performance Goals**: 
- `/noticias` com paginação: <3s em mobile 3G (SC-001)
- Formulário público: resposta <2s (SC-003)
- Área de moderação: lista de pendentes <2s

**Constraints**: 
- Sem banco de dados, sem ORM, sem autenticação de usuários, sem upload de imagens (Princípios II, III, IV)
- `dangerouslySetInnerHTML` proibido; sanitização obrigatória (FR-012, constituição)
- GA4 apenas produção, `afterInteractive`, sem mudanças (FR-022, FR-023)
- Rate limiting no formulário público (FR-011)
- Retenção LGPD: anunciantes ativo + 12m (legítimo interesse), pendentes 30d (consentimento) (FR-028)

**Scale/Scope**: 
- Histórico de notícias: retenção 12 meses, ~20 itens/página, deduplicação por hash título+fonte+data
- Fila de moderação: volume baixo (dezenas), 1 anúncio/CNPJ ativo
- Moderador único (proprietário), acesso via segredo em env

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / Regra | Verificação | Status |
|---|---|---|
| I. Utilidade Pública Local | Histórico de notícias serve moradores; formulário captura interesse comercial sem atrapalhar conteúdo público | ✅ PASS |
| II. Simplicidade | JSON versionado (sem DB), autenticação via env (sem users/dashboard), moderação manual simples | ✅ PASS |
| III. Sem Imagens Armazenadas | Formulário sem upload; anúncios só texto/links; notícias usam imagens dos feeds RSS apenas | ✅ PASS |
| IV. Sem Pagamentos Integrados | Não há checkout, PIX, gateway; contratação de destaque é externa | ✅ PASS |
| V. Publicidade Transparente | Anúncios gratuitos com `kind: "anuncio-gratuito"` e rótulo textual (FR-029, ContentLabel) | ✅ PASS |
| VI. Responsabilidade Editorial | Fontes preservadas, link original, moderação manual obrigatória (FR-010, FR-015-020) | ✅ PASS |
| VII. Privacidade por Minimização | Campos mínimos no formulário; retenção LGPD definida (FR-027, FR-028) | ✅ PASS |
| VIII. Confiabilidade Modular | Módulos isolados (news-history, ads-pending, ads); falha de um não quebra home | ✅ PASS |
| Métricas GA4 (emenda v1.1.0) | Zero mudanças; só produção, afterInteractive, agregado, aviso cookies | ✅ PASS |
| Política Anúncios Gratuitos (v1.2.0) | 1 anúncio/CNPJ, duração indeterminada, fila moderação, formulário autorizado | ✅ PASS |
| Moderador único (v1.3.0) | Proprietário é moderador único; autenticação simples via env | ✅ PASS |
| Retenção LGPD (v1.3.0) | Tabela de retenção implementada no loader/limpeza | ✅ PASS |
| Exclusões Explícitas | Sem login, dashboard, upload, pagamentos, comentários, marketplace, publicação automática | ✅ PASS |

**TODOS OS GATES PASSAM** — nenhuma violação injustificada.

## Project Structure

### Documentation (this feature)

```text
specs/002-fase2-persistencia-captura/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── noticias/                    # NOVO: listagem paginada de notícias
│   │   └── page.tsx                 # Server Component, revalidate=1800
│   ├── previsao-do-tempo/
│   │   └── sao-carlos/page.tsx      # Já existe (Spec 05)
│   ├── utilidade-publica/           # Já existe (Spec 05)
│   ├── empresas/                    # Já existe (Spec 06)
│   ├── anunciar/                    # NOVO: formulário público de anúncios
│   │   └── page.tsx                 # Client Component (formulário interativo)
│   ├── api/
│   │   └── ads/
│   │       ├── submit/route.ts      # NOVO: POST submissão formulário (rate limit, validação, sanitização)
│   │       ├── pending/route.ts     # NOVO: GET lista pendentes (protegido MODERATOR_SECRET)
│   │       ├── approve/route.ts     # NOVO: POST aprova anúncio pendente
│   │       ├── reject/route.ts      # NOVO: POST recusa anúncio pendente
│   │       └── manage/route.ts      # NOVO: PATCH/DELETE anúncios publicados
│   └── moderacao/                   # NOVO: área de moderação (protegida)
│       ├── layout.tsx               # Verifica MODERATOR_SECRET
│       └── page.tsx                 # Lista pendentes + ações
├── components/
│   ├── sections/
│   │   ├── news-history-section.tsx # NOVO: seção para página /noticias (paginação)
│   │   └── ad-form-section.tsx      # NOVO: formulário público (client-side)
│   ├── ui/
│   │   ├── pagination.tsx           # NOVO: componente de paginação acessível
│   │   ├── ad-form.tsx              # NOVO: campos do formulário + validação
│   │   ├── moderation-table.tsx     # NOVO: tabela de pendentes com ações
│   │   └── status-badge.tsx         # NOVO: badge pendente/aprovado/recusado
│   └── layout/
│       └── header.tsx               # ATUALIZAR: adicionar link "Anunciar" no nav
├── modules/
│   ├── news-history/                # NOVO: persistência e listagem de notícias
│   │   ├── loader.ts                # Carrega news-history.json + merge com feeds atuais
│   │   ├── normalize.ts             # Normaliza para modelo interno (dedupe por hash)
│   │   ├── types.ts                 # NewsHistoryItem, NewsHistoryPage
│   │   └── retention.ts             # Limpeza >12 meses (job ou manual)
│   ├── ads-pending/                 # NOVO: fila de moderação
│   │   ├── loader.ts                # Carrega/salva ads-pending.json
│   │   ├── submit.ts                # Validação servidor, rate limit, sanitização, dedupe CNPJ
│   │   ├── approve.ts               # Move pendente → ads.json (kind: anuncio-gratuito)
│   │   ├── reject.ts                # Marca recusado, registra motivo, notifica
│   │   ├── types.ts                 # AdSubmission, AdPending, AdPublished
│   │   └── notify.ts                # WhatsApp/e-mail link para notificar comerciante
│   └── ads/                         # EXISTENTE: loader.ts (selectPublishedAds) — ESTENDER
│       └── manage.ts                # NOVO: editar/suspender/remover anúncios publicados
├── lib/
│   ├── sanitize.ts                  # EXISTENTE: HTML → texto, URL http/https — USAR
│   ├── rate-limit.ts                # NOVO: rate limiting simples por IP (in-memory/Upstash se precisar)
│   ├── auth.ts                      # NOVO: verificação MODERATOR_SECRET (header/query)
│   ├── cnpj.ts                      # NOVO: validação/formatação CNPJ (dedupe)
│   └── date.ts                      # EXISTENTE: dateToFormat — USAR
├── config/
│   ├── env.ts                       # EXISTENTE: ADICIONAR MODERATOR_SECRET, NEWS_HISTORY_RETENTION_DAYS
│   ├── sources.ts                   # EXISTENTE: feeds de notícias — USAR
│   └── version.ts                   # EXISTENTE — USAR
└── content/
    ├── news-history.json            # NOVO: histórico persistido de notícias (array)
    ├── ads-pending.json             # NOVO: fila de moderação (array)
    └── ads.json                     # EXISTENTE: anúncios publicados — ESTENDIDO com anuncio-gratuito

tests/
├── unit/
│   ├── news-history-loader.test.ts
│   ├── news-history-retention.test.ts
│   ├── ads-pending-submit.test.ts
│   ├── ads-pending-approve.test.ts
│   ├── ads-pending-reject.test.ts
│   ├── ads-pending-dedupe-cnpj.test.ts
│   ├── rate-limit.test.ts
│   ├── auth-moderator.test.ts
│   ├── cnpj-validation.test.ts
│   └── sanitize-ads.test.ts
├── integration/
│   ├── news-history-page.test.tsx       # /noticias renderiza paginação
│   ├── ad-form-submit.test.tsx          # Formulário submete → pendente
│   ├── moderation-flow.test.tsx         # Aprova/recusa/gerencia
│   └── source-failure-history.test.tsx  # Histórico acessível com fonte indisponível
└── setup.ts                       # EXISTENTE
```

**Structure Decision**: Single Next.js project (Option 1 extended). A Fase 2 adiciona rotas, API routes, módulos e componentes ao projeto existente da Fase 1, mantendo a arquitetura modular por domínio (`src/modules/*`) e separação UI/lógica. O armazenamento em `src/content/*.json` versionado no Git atende simplicidade (Princípio II), auditoria via commits, e evita custo/complexidade de banco externo.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Todos os gates da constituição passam (ver tabela acima). Nenhuma violação a justificar. A arquitetura escolhida (JSON versionado, autenticação via env, moderação manual) é a mais simples compatível com os requisitos e princípios.

## Phase 0: Research (NEEDS CLARIFICATION Resolution)

| Unknown / Decision | Research Task | Status |
|---|---|---|
| Armazenamento: JSON versionado vs SQLite/Neon | Comparar simplicidade, custo, auditoria, migração futura para JSON files em `content/` | ✅ DECIDIDO: JSON versionado (Princípio II, III, VII) |
| Autenticação moderação: `MODERATOR_SECRET` (header/query) vs NextAuth Credentials vs Vercel Password Protection | Avaliar simplicidade, sem cadastro usuários, sem recovery, proteção rota única | ✅ DECIDIDO: `MODERATOR_SECRET` em env + middleware/layout check |
| Rate limiting: in-memory (Map) vs Upstash Redis vs Vercel Edge Config | Volume baixo (formulário público), simplicidade, custo zero | ✅ DECIDIDO: in-memory com `Map<IP, {count, resetAt}>` (reinicia no deploy) |
| Deduplicação CNPJ: validação rigorosa (algoritmo) vs só string normalizada | CNPJ pode vir com/sem formatação; evitar falsos positivos/negativos | ✅ DECIDIDO: normalizar (só dígitos) + algoritmo validação módulo 11 |
| Notificação comerciante: `wa.me` link + `mailto` vs API externa (Twilio, etc.) | Sem custo, sem segredo, abre app do usuário; política permite | ✅ DECIDIDO: links `wa.me` e `mailto` com mensagem pré-formatada |
| Retenção notícias: job agendado (cron Vercel) vs limpeza manual vs on-demand no loader | 12 meses, volume baixo; simplicidade | ✅ DECIDIDO: on-demand no loader (filtra >12m na leitura) + script manual opcional |
| Paginação `/noticias`: 20 itens/página, ordenação data desc, URLs `/noticias?page=N` | SEO-friendly, compartilhável, stateless | ✅ DECIDIDO: query param `page`, 20/page, `revalidate=1800` |
| Campos formulário: CNPJ obrigatório vs opcional (dedupe por nome+telefone+bairro) | Política diz 1 anúncio/CNPJ; CNPJ valida dedupe forte | ✅ DECIDIDO: CNPJ obrigatório no formulário (validado), não exibido publicamente |
| Categorias anúncio: reutilizar `ads.json` vs lista fixa nova | Consistência com anúncios existentes | ✅ DECIDIDO: reutilizar categorias de `content/ads.json` (enum) |
| Sanitização: reutilizar `lib/sanitize.ts` vs biblioteca dedicada (DOMPurify) | `sanitize.ts` já faz texto puro + URL http/https; suficiente para inputs texto | ✅ DECIDIDO: estender `sanitize.ts` para campos do formulário |

**Todas as decisões técnicas resolvidas** — pronto para Phase 1 (data-model.md, contracts/, quickstart.md).
